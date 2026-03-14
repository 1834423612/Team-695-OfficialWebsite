/**
 * User avatar cache service
 * Caches user avatars in the browser to avoid frequent requests and third-party avatar rate limits
 * 
 * Uses IndexedDB as the primary storage for more space and better performance
 * Also keeps an in-memory cache for fast access to frequently used avatars
 */

import { logger } from '@/utils/logger'; // Import the logger utility

// Cache key prefix
const CACHE_PREFIX = 'avatar_cache_';
// Cache lifetime (7 days by default)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
// Default avatar size
const DEFAULT_SIZE = 200;
// Database name and version
const DB_NAME = 'avatar_cache_db';
const DB_VERSION = 2; // Increase the version to support the new indexes and storage structure
const STORE_NAME = 'avatars';
// Request throttling: minimum interval for the same URL (24 hours)
const REQUEST_THROTTLE = 24 * 60 * 60 * 1000;
// Storage for recent request records
const REQUEST_STORE = 'avatar_requests';

interface CacheEntry {
    dataUrl: string;
    timestamp: number;
    originalUrl: string;
    userId: string; // Add an explicit user ID association
    userName?: string; // Optional: store the username for debugging and identification
    displayName?: string; // Optional: store the display name for debugging and identification
    initial?: string; // New: store the initial identifier
}

interface RequestRecord {
    url: string;
    timestamp: number;
    count: number; // Counter that tracks request frequency
}

class AvatarCacheService {
    // In-memory cache for quick access
    private memoryCache: Map<string, CacheEntry> = new Map();
    // Request records used to control request frequency
    private requestCache: Map<string, RequestRecord> = new Map();
    // Database connection
    private dbPromise: Promise<IDBDatabase> | null = null;
    // Whether initialization has completed
    private initialized: boolean = false;
    // Initialization promise used to track the initialization process
    private initPromise: Promise<void> | null = null;

    constructor() {
        // Automatically start initialization from the constructor
        this.initPromise = this.init();
    }

    /**
     * Check whether the service has been initialized
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Initialize the cache service
     * - Open the IndexedDB connection
     * - Load key avatars into the memory cache
     * - Initialize the request throttling system
     * 
     * It is safe to call this multiple times; the same promise will be returned
     */
    public async init(): Promise<void> {
        // Return the existing promise if initialization is already in progress
        if (this.initPromise) {
            return this.initPromise;
        }

        // Return immediately if initialization has already finished
        if (this.initialized) {
            return Promise.resolve();
        }

        logger.info('Initializing avatar cache service...');
        
        try {
            // Open the database connection
            this.dbPromise = this.openDatabase();
            await this.dbPromise;
            
            // Migrate old localStorage data into IndexedDB
            await this.migrateFromLocalStorage();
            
            // Preload recent avatars from IndexedDB into the memory cache
            await this.preloadRecentAvatars();
            
            // Load request records into memory
            await this.loadRequestRecords();
            
            this.initialized = true;
            logger.info(`Avatar cache initialized with ${this.memoryCache.size} entries in memory cache`);
        } catch (e) {
            logger.error('Failed to initialize avatar cache:', e);
            // Reset the initialization state to allow retries
            this.initPromise = null;
            throw e;
        }
    }

    /**
     * Cache a user avatar
     * @param userId User ID
     * @param avatarUrl Avatar URL
     * @param userInfo Optional user information to help identify who the avatar belongs to
     */
    public async cacheAvatar(
        userId: string, 
        avatarUrl: string | null | undefined,
        userInfo?: {
            name?: string,
            displayName?: string,
            initial?: string // New initial field
        }
    ): Promise<string | null> {
        // Ensure the service is initialized
        if (!this.initialized) {
            await this.init();
        }

        if (!userId || !avatarUrl) return null;

        try {
            // Check whether the incoming userId is abbreviated and try to recover the previously cached full ID
            const isShortId = userId.length <= 2;
            let effectiveId = userId;
            
            if (isShortId) {
                // Log a warning because this may mean an initial was incorrectly used as the ID
                logger.warn(`Short userId detected: "${userId}", might be using initials instead of real user ID`);
                
                // If userInfo contains more details, try to use it to create a more consistent ID
                if (userInfo?.displayName) {
                    // Use displayName to create a pseudo ID for consistency
                    effectiveId = `pseudo_${this.hashCode(userInfo.displayName)}`;
                    logger.debug(`Using pseudo ID for "${userId}": ${effectiveId}`);
                }
            }

            // Check request rate limits
            if (this.shouldThrottleRequest(avatarUrl)) {
                logger.debug(`Request throttled for URL: ${avatarUrl}`);
                
                // Look for a recently cached avatar and prefer cache instead of falling back to the default immediately
                
                // Try the memory cache first
                const cachedEntry = this.memoryCache.get(userId);
                if (cachedEntry) {
                    logger.debug(`Using memory cached avatar for throttled request: ${userId}`);
                    return cachedEntry.dataUrl;
                }
                
                // Then try loading it from the database
                try {
                    const dbEntry = await this.getFromDb(userId);
                    if (dbEntry) {
                        // Update the memory cache
                        this.memoryCache.set(userId, dbEntry);
                        logger.debug(`Using DB avatar for throttled request: ${userId}`);
                        return dbEntry.dataUrl;
                    }
                } catch (dbError) {
                    logger.warn(`Failed to get avatar from DB for throttled URL: ${avatarUrl}`, dbError);
                }
                
                // As a final attempt, check whether any cached URL matches from another source
                try {
                    const entriesWithSameUrl = await this.findEntriesByUrl(avatarUrl);
                    if (entriesWithSameUrl.length > 0) {
                        // Use the first entry that has the same URL
                        const dataUrl = entriesWithSameUrl[0].dataUrl;
                        
                        // Create a new entry for the current user
                        const entry: CacheEntry = {
                            dataUrl,
                            timestamp: Date.now(),
                            originalUrl: avatarUrl,
                            userId: userId,
                            userName: userInfo?.name,
                            displayName: userInfo?.displayName,
                            initial: userInfo?.initial
                        };
                        
                        // Save it to the cache
                        this.memoryCache.set(userId, entry);
                        await this.saveToDb(userId, entry).catch(e => logger.warn(`Failed to save shared URL avatar to DB: ${e}`));
                        
                        logger.debug(`Using shared URL avatar for throttled request: ${userId}`);
                        return dataUrl;
                    }
                } catch (e) {
                    logger.warn(`Failed to find entries by URL for throttled request: ${avatarUrl}`, e);
                }
                
                // Return null when no cache is available so the caller can use the default avatar
                return null;
            }
            
            logger.debug(`Caching avatar for user ${effectiveId} (original: ${userId}): ${avatarUrl}`);

            // Record the request to control request frequency
            this.recordRequest(avatarUrl);

            // Fetch the image and convert it to a data URL
            const dataUrl = await this.fetchImageAsDataUrl(avatarUrl);

            if (!dataUrl) return null;

            // Create a cache entry that includes user information
            const entry: CacheEntry = {
                dataUrl,
                timestamp: Date.now(),
                originalUrl: avatarUrl,
                userId: effectiveId, // Use the processed effectiveId
                userName: userInfo?.name,
                displayName: userInfo?.displayName,
                initial: userInfo?.initial
            };

            // Update the memory cache
            this.memoryCache.set(effectiveId, entry);

            // Save it to IndexedDB
            await this.saveToDb(effectiveId, entry);

            return dataUrl;
        } catch (e) {
            logger.error(`Failed to cache avatar for user ${userId}:`, e);
            return null;
        }
    }

    /**
     * Get a cached avatar
     * @param userId User ID
     * @param avatarUrl Original avatar URL when the cache is missing or expired
     * @param userInfo User information used to generate a more accurate default avatar
     * @param cacheOnly Whether to use only cached data without fetching a new avatar
     */
    public async getAvatar(
        userId: string, 
        avatarUrl?: string,
        userInfo?: {
            firstName?: string,
            lastName?: string,
            displayName?: string,
            name?: string,
            initial?: string
        },
        cacheOnly: boolean = false
    ): Promise<string> {
        // Ensure the service is initialized
        if (!this.initialized) {
            await this.init();
        }
        
        // Handle short-ID issues
        const isShortId = userId.length <= 2;
        let effectiveId = userId;
        
        if (isShortId) {
            // If this is a short ID, possibly an initial, try to resolve the real ID from the mapping tool
            try {
                // Use a dynamic import to avoid circular dependencies
                const { AvatarMigrationTool } = await import('@/utils/avatarMigrationTool');
                const mappedId = AvatarMigrationTool.getUserIdByInitial(userId);
                
                if (mappedId) {
                    logger.debug(`Using mapped ID for "${userId}": ${mappedId}`);
                    effectiveId = mappedId;
                } else if (userInfo?.displayName) {
                    // Create a pseudo ID when the mapping tool has no match but displayName is available
                    effectiveId = `pseudo_${this.hashCode(userInfo.displayName)}`;
                    logger.debug(`Using pseudo ID for "${userId}": ${effectiveId}`);
                }
            } catch (e) {
                // Fall back to displayName if the import fails
                if (userInfo?.displayName) {
                    effectiveId = `pseudo_${this.hashCode(userInfo.displayName)}`;
                    logger.debug(`Using pseudo ID for "${userId}" (fallback): ${effectiveId}`);
                }
            }
        }
        
        // Check the memory cache
        let cachedEntry = this.memoryCache.get(effectiveId);
        
        // If nothing is found, try the original userId again for compatibility with older data
        if (!cachedEntry && effectiveId !== userId) {
            cachedEntry = this.memoryCache.get(userId);
        }
        
        // Return the cached data URL when a valid cache entry exists
        if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
            // Asynchronously update the cache when a new URL is provided, differs from the cached one, and cache-only mode is off
            if (avatarUrl && cachedEntry.originalUrl !== avatarUrl && !cacheOnly && !this.shouldThrottleRequest(avatarUrl)) {
                this.cacheAvatar(userId, avatarUrl, {
                    name: userInfo?.name,
                    displayName: userInfo?.displayName,
                    initial: userInfo?.initial
                }).catch(console.error);
            }
            return cachedEntry.dataUrl;
        }
        
        // If no valid cache exists but a URL is provided and cache-only mode is off
        if (avatarUrl && !cacheOnly) {
            // Prefer fetching the avatar directly from the URL
            try {
                const dataUrl = await this.cacheAvatar(userId, avatarUrl, {
                    name: userInfo?.name,
                    displayName: userInfo?.displayName,
                    initial: userInfo?.initial
                });
                if (dataUrl) return dataUrl;
            } catch (e) {
                console.warn(`Failed to get avatar from URL: ${avatarUrl}`, e);
            }
        }
        
        // If the memory cache misses, try loading it from IndexedDB
        try {
            const entry = await this.getFromDb(userId);
            if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
                // Put the found entry into the memory cache
                this.memoryCache.set(userId, entry);
                return entry.dataUrl;
            }
        } catch (e) {
            console.warn(`Failed to get avatar from DB for ${userId}:`, e);
        }
        
        // Check and migrate old cache entries
        this.migrateOldCache(userId);
        
        // Generate and return the default avatar if every other attempt fails
        const defaultAvatar = this.getDefaultAvatar(
            userId,
            userInfo?.firstName,
            userInfo?.lastName,
            userInfo?.displayName,
            userInfo?.name,
            userInfo?.initial
        );
        
        // In cacheOnly mode, save the default avatar into the cache so it can be reused next time
        if (cacheOnly) {
            // Create a cache entry for the default avatar
            const entry: CacheEntry = {
                dataUrl: defaultAvatar,
                timestamp: Date.now(),
                originalUrl: '',  // No original URL
                userId: effectiveId,
                userName: userInfo?.name,
                displayName: userInfo?.displayName,
                initial: userInfo?.initial
            };
            
            // Update the memory cache
            this.memoryCache.set(effectiveId, entry);
            
            // Save it to IndexedDB asynchronously without waiting for completion
            this.saveToDb(effectiveId, entry).catch(e => {
                logger.warn(`Failed to save default avatar to DB: ${e}`);
            });
        }
        
        return defaultAvatar;
    }

    /**
     * Clear the avatar cache for a specific user
     * @param userId User ID
     */
    public async clearCache(userId: string): Promise<void> {
        // Ensure the service is initialized
        if (!this.initialized) {
            await this.init();
        }

        // Check whether this is a short ID
        const isShortId = userId.length <= 2;
        if (isShortId) {
            logger.warn(`Attempting to clear cache with short userId: "${userId}", might need to check real user ID`);
        }

        // Remove it from the memory cache
        this.memoryCache.delete(userId);
        
        // Remove it from IndexedDB
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            await promisifyRequest(store.delete(userId));
        } catch (e) {
            console.error(`Failed to delete avatar for ${userId} from DB:`, e);
        }
        
        // Clear old-version localStorage cache entries for compatibility
        localStorage.removeItem(`${CACHE_PREFIX}${userId}`);
        this.clearOldCache(userId);
    }

    /**
     * Clear all avatar caches
     */
    public async clearAllCache(): Promise<void> {
        // Ensure the service is initialized
        if (!this.initialized) {
            await this.init();
        }

        // Clear the memory cache
        this.memoryCache.clear();
        
        // Clear IndexedDB
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            await promisifyRequest(store.clear());
        } catch (e) {
            console.error('Failed to clear avatar database:', e);
        }
        
        // Clear old localStorage cache entries for compatibility
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        }
        
        // Clear request records as well
        this.requestCache.clear();
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            if (db.objectStoreNames.contains(REQUEST_STORE)) {
                const transaction = db.transaction([REQUEST_STORE], 'readwrite');
                const store = transaction.objectStore(REQUEST_STORE);
                await promisifyRequest(store.clear());
            }
        } catch (e) {
            console.error('Failed to clear request records:', e);
        }
    }

    /**
     * Check whether the request should be throttled
     * @param url Requested URL
     * @returns Whether the request should be throttled
     */
    private shouldThrottleRequest(url: string): boolean {
        const record = this.requestCache.get(url);
        if (!record) return false;
        
        const timeSinceLastRequest = Date.now() - record.timestamp;
        
        // Calculate the throttling strategy based on request frequency
        // Use dynamic thresholds to reduce over-throttling for frequently used resources
        let throttleTime = REQUEST_THROTTLE;
        
        // Use a shorter throttling window when the request rate is higher
        if (record.count > 20) {
            // Apply a 24-hour throttle for high-frequency requests over 20 times
            throttleTime = REQUEST_THROTTLE;
        } else if (record.count > 10) {
            // Apply a 12-hour throttle for medium-frequency requests between 10 and 20 times
            throttleTime = REQUEST_THROTTLE * 0.5;
        } else if (record.count > 5) {
            // Apply a 6-hour throttle for low-frequency requests between 5 and 10 times
            throttleTime = REQUEST_THROTTLE * 0.25;
        } else {
            // Apply a 3-hour throttle for very low-frequency requests under 5 times
            throttleTime = REQUEST_THROTTLE * 0.125;
        }
        
        return timeSinceLastRequest < throttleTime;
    }

    /**
     * Record requests to control frequency
     * @param url Requested URL
     */
    private recordRequest(url: string): void {
        const now = Date.now();
        const existingRecord = this.requestCache.get(url);
        
        if (existingRecord) {
            // Reset the counter when the record is old enough to exceed the limit window
            if (now - existingRecord.timestamp > REQUEST_THROTTLE) {
                this.requestCache.set(url, {
                    url,
                    timestamp: now,
                    count: 1
                });
            } else {
                // Otherwise increment the counter
                this.requestCache.set(url, {
                    url,
                    timestamp: now,
                    count: existingRecord.count + 1
                });
            }
        } else {
            // Create a new record for a new URL
            this.requestCache.set(url, {
                url,
                timestamp: now,
                count: 1
            });
        }
        
        // Save it to IndexedDB
        this.saveRequestRecord(url, this.requestCache.get(url)!).catch(e => {
            logger.warn('Failed to save request record:', e);
        });
    }

    /**
     * Save request records to IndexedDB
     */
    private async saveRequestRecord(url: string, record: RequestRecord): Promise<void> {
        try {
            const db = await this.dbPromise;
            if (!db || !db.objectStoreNames.contains(REQUEST_STORE)) return;
            
            const transaction = db.transaction([REQUEST_STORE], 'readwrite');
            const store = transaction.objectStore(REQUEST_STORE);
            await promisifyRequest(store.put(record, url));
        } catch (e) {
            logger.error(`Failed to save request record for ${url}:`, e);
        }
    }

    /**
     * Load request records from IndexedDB
     */
    private async loadRequestRecords(): Promise<void> {
        try {
            const db = await this.dbPromise;
            if (!db || !db.objectStoreNames.contains(REQUEST_STORE)) return;
            
            const transaction = db.transaction([REQUEST_STORE], 'readonly');
            const store = transaction.objectStore(REQUEST_STORE);
            const records = await promisifyRequest<RequestRecord[]>(store.getAll());
            const urls = await promisifyRequest<IDBValidKey[]>(store.getAllKeys());
            
            // Load them into memory
            for (let i = 0; i < urls.length; i++) {
                if (i < records.length) {
                    this.requestCache.set(String(urls[i]), records[i]);
                }
            }
            
            logger.info(`Loaded ${this.requestCache.size} request records`);
            
            // Clean up expired request records
            this.cleanupRequestRecords();
        } catch (e) {
            logger.error('Failed to load request records:', e);
        }
    }

    /**
     * Clean up expired request records
     */
    private async cleanupRequestRecords(): Promise<void> {
        const now = Date.now();
        const expiredUrls: string[] = [];
        
        // Find expired records
        this.requestCache.forEach((record, url) => {
            if (now - record.timestamp > REQUEST_THROTTLE * 3) {
                expiredUrls.push(url);
            }
        });
        
        // Remove them from the memory cache
        for (const url of expiredUrls) {
            this.requestCache.delete(url);
        }
        
        // Delete them from IndexedDB
        try {
            if (expiredUrls.length === 0) return;
            
            const db = await this.dbPromise;
            if (!db || !db.objectStoreNames.contains(REQUEST_STORE)) return;
            
            const transaction = db.transaction([REQUEST_STORE], 'readwrite');
            const store = transaction.objectStore(REQUEST_STORE);
            
            for (const url of expiredUrls) {
                promisifyRequest(store.delete(url)).catch(e => {
                    logger.warn(`Failed to delete expired request record for ${url}:`, e);
                });
            }
            
            logger.info(`Cleaned up ${expiredUrls.length} expired request records`);
        } catch (e) {
            logger.error('Failed to cleanup expired request records:', e);
        }
    }

    /**
     * Get the default avatar based on user information
     * @param userId User ID or initial identifier
     * @param firstName First name
     * @param lastName Last name 
     * @param displayName Display name
     * @param name Username
     * @param initial Explicitly provided initial identifier
     */
    private getDefaultAvatar(
        userId: string,
        firstName?: string,
        lastName?: string,
        displayName?: string,
        name?: string,
        initial?: string // Add the initial parameter
    ): string {
        // Generate initials
        let initials: string;

        // Prefer the provided initial
        if (initial) {
            initials = initial.substring(0, 2).toUpperCase();
        }
        // Then use firstName and lastName
        else if (firstName && lastName) {
            initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        }
        // Next use displayName and try splitting it
        else if (displayName) {
            const parts = displayName.trim().split(/\s+/);
            if (parts.length >= 2) {
                initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            } else {
                initials = displayName.substring(0, 2).toUpperCase();
            }
        }
        // Then use name
        else if (name) {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            } else {
                initials = name.substring(0, 2).toUpperCase();
            }
        }
        // Finally fall back to userId
        else {
            initials = userId.substring(0, 2).toUpperCase();
        }

        // Generate a consistent color from the user ID
        const hash = this.hashCode(userId);
        const hue = hash % 360;
        const saturation = 75;
        const lightness = 65;

        // Create a simple SVG for the default avatar
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${DEFAULT_SIZE}" height="${DEFAULT_SIZE}" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
            <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">
                ${initials}
            </text>
        </svg>
        `;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * Fetch an image from a URL and convert it to a data URL
     * @param url Image URL
     */
    private async fetchImageAsDataUrl(url: string): Promise<string | null> {
        try {
            const response = await fetch(url, {
                cache: 'force-cache',
                mode: 'cors',
                credentials: 'same-origin'
            });

            if (!response.ok) {
                logger.warn(`HTTP error fetching image. Status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            return await this.blobToDataUrl(blob);
        } catch (e) {
            logger.warn(`Failed to fetch image from ${url}:`, e);
            return null;
        }
    }

    /**
     * Convert a Blob to a data URL
     * @param blob Image blob
     */
    private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Compute a string hash used to generate the default avatar color
     * @param str Input string
     */
    private hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // Convert to a 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Clear old-version cache keys
     * @param userId User ID
     */
    private clearOldCache(userId: string): void {
        // Old-version cache-key cleanup logic can be added here
        const oldKeys = [
            `avatar_${userId}`,
            `user_avatar_${userId}`
        ];

        for (const key of oldKeys) {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        }
    }

    /**
     * Migrate old-version cache keys
     * @param userId User ID
     */
    private migrateOldCache(userId: string): void {
        const oldKeys = [
            `avatar_${userId}`,
            `user_avatar_${userId}`
        ];

        for (const key of oldKeys) {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    // Try parsing the old cache entry
                    const parsed = JSON.parse(value);
                    if (parsed && parsed.dataUrl) {
                        // Create a new cache entry
                        const entry: CacheEntry = {
                            dataUrl: parsed.dataUrl,
                            timestamp: parsed.timestamp || Date.now(),
                            originalUrl: parsed.originalUrl || '',
                            userId: userId
                        };

                        // Save it into the new cache
                        this.memoryCache.set(userId, entry);
                        localStorage.setItem(`${CACHE_PREFIX}${userId}`, JSON.stringify(entry));

                        // Delete the old cache entry
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    console.warn(`Failed to migrate old cache for ${key}:`, e);
                }
            }
        }
    }

    /**
     * Clear the oldest cache entries to free up space
     * Called when localStorage runs out of space
     */
    private clearOldestCaches(): void {
        try {
            // Collect all avatar cache entries
            const cacheEntries: { key: string, timestamp: number }[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_PREFIX)) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            const entry = JSON.parse(value) as CacheEntry;
                            cacheEntries.push({
                                key,
                                timestamp: entry.timestamp
                            });
                        } catch (e) {
                            // Treat entries that fail to parse as the oldest cache entries
                            cacheEntries.push({
                                key,
                                timestamp: 0
                            });
                        }
                    }
                }
            }

            // Sort by timestamp in ascending order so the oldest entries come first
            cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

            // Delete the oldest one-third of cache entries
            const removeCount = Math.ceil(cacheEntries.length / 3);
            console.log(`Clearing ${removeCount} oldest avatar caches`);

            for (let i = 0; i < removeCount && i < cacheEntries.length; i++) {
                const key = cacheEntries[i].key;
                const userId = key.substring(CACHE_PREFIX.length);
                this.memoryCache.delete(userId);
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error('Error clearing oldest caches:', e);
        }
    }

    /**
     * Open the IndexedDB database connection
     */
    private openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported in this browser'));
                return;
            }
            
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = (event) => {
                reject(new Error(`Failed to open IndexedDB: ${(event.target as any).errorCode}`));
            };
            
            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // Create the avatar store
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
                
                // Create the request-record store
                if (!db.objectStoreNames.contains(REQUEST_STORE)) {
                    const requestStore = db.createObjectStore(REQUEST_STORE);
                    // Add a timestamp index to request records so expired entries can be cleaned up easily
                    requestStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }
    
    /**
     * Save a cache entry to IndexedDB
     */
    private async saveToDb(userId: string, entry: CacheEntry): Promise<void> {
        try {
            const db = await this.dbPromise;
            if (!db) return;
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            try {
                await promisifyRequest(store.put(entry, userId));
            } catch (storageError) {
                logger.warn('Storage error, attempting to clear space:', storageError);
                // Free up space when storage issues are encountered
                await this.ensureStorageSpace();
                // Try saving again
                const newTransaction = db.transaction([STORE_NAME], 'readwrite');
                const newStore = newTransaction.objectStore(STORE_NAME);
                await promisifyRequest(newStore.put(entry, userId));
            }
        } catch (e) {
            logger.error(`Failed to save avatar to IndexedDB for ${userId}:`, e);
            throw e;
        }
    }
    
    /**
     * Get a cache entry from IndexedDB
     */
    private async getFromDb(userId: string): Promise<CacheEntry | undefined> {
        try {
            const db = await this.dbPromise;
            if (!db) return undefined;
            
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const result = await promisifyRequest<CacheEntry | undefined>(store.get(userId));
            return result;
        } catch (e) {
            logger.error(`Failed to get avatar from IndexedDB for ${userId}:`, e);
            throw e;
        }
    }
    
    /**
     * Get all cache entries from IndexedDB
     */
    private async getAllFromDb(): Promise<Array<[string, CacheEntry]>> {
        try {
            const db = await this.dbPromise;
            if (!db) return [];
            
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const values = await promisifyRequest<CacheEntry[]>(store.getAll());
            const keys = await promisifyRequest<IDBValidKey[]>(store.getAllKeys());
            
            // Fix the typing issue and ensure the [string, CacheEntry][] array is built correctly
            const result: Array<[string, CacheEntry]> = [];
            
            for (let i = 0; i < keys.length; i++) {
                if (i < values.length) {
                    result.push([String(keys[i]), values[i]]);
                }
            }
            
            return result;
        } catch (e) {
            logger.error('Failed to get all avatars from IndexedDB:', e);
            throw e;
        }
    }
    
    /**
     * Migrate old localStorage data to IndexedDB
     */
    private async migrateFromLocalStorage(): Promise<void> {
        try {
            const migratedKeys: string[] = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_PREFIX)) {
                    const userId = key.substring(CACHE_PREFIX.length);
                    const value = localStorage.getItem(key);
                    
                    if (value) {
                        try {
                            const entry = JSON.parse(value) as CacheEntry;
                            
                            // Migrate it to IndexedDB
                            await this.saveToDb(userId, entry);
                            migratedKeys.push(key);
                        } catch (e) {
                            logger.warn(`Failed to parse localStorage entry for ${key}:`, e);
                        }
                    }
                }
            }
            
            // Clear the localStorage entry after migration succeeds
            for (const key of migratedKeys) {
                localStorage.removeItem(key);
            }
            
            if (migratedKeys.length > 0) {
                logger.info(`Migrated ${migratedKeys.length} avatar entries from localStorage to IndexedDB`);
            }
        } catch (e) {
            logger.error('Failed to migrate from localStorage:', e);
        }
    }
    
    /**
     * Preload recent avatars from IndexedDB into the memory cache
     */
    private async preloadRecentAvatars(limit: number = 20): Promise<void> {
        try {
            const allEntries = await this.getAllFromDb();
            
            // Sort by timestamp and load only the most recent entries
            allEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            
            // Limit the number of entries to load
            const recentEntries = allEntries.slice(0, limit);
            
            // Load them into the memory cache
            for (const [userId, entry] of recentEntries) {
                this.memoryCache.set(userId, entry);
            }
            
            logger.info(`Preloaded ${recentEntries.length} recent avatars into memory cache`);
        } catch (e) {
            logger.error('Failed to preload recent avatars:', e);
        }
    }

    /**
     * Free cache space when storage problems occur while saving to IndexedDB
     */
    private async ensureStorageSpace(): Promise<void> {
        try {
            // Call clearOldestCaches when storage issues happen during save
            await this.clearOldestCaches();
            console.log('Storage space cleared for new avatars');
        } catch (e) {
            logger.error('Failed to ensure storage space:', e);
        }
    }
    
    /**
     * Get cache statistics
     * Used for debugging and monitoring
     */
    public async getCacheStats(): Promise<{
        memoryEntries: number,
        requestEntries: number,
        dbEntries: number
    }> {
        try {
            // Ensure initialization has completed
            if (!this.initialized) {
                await this.init();
            }
            
            let dbEntries = 0;
            try {
                const allEntries = await this.getAllFromDb();
                dbEntries = allEntries.length;
            } catch (e) {
                logger.error('Failed to get DB entries count:', e);
            }
            
            return {
                memoryEntries: this.memoryCache.size,
                requestEntries: this.requestCache.size,
                dbEntries
            };
        } catch (e) {
            logger.error('Failed to get cache stats:', e);
            return {
                memoryEntries: this.memoryCache.size,
                requestEntries: this.requestCache.size,
                dbEntries: 0
            };
        }
    }

    /**
     * Find a cache entry by URL
     * Used to find other entries that share the same URL when throttling is active
     */
    private async findEntriesByUrl(url: string): Promise<CacheEntry[]> {
        try {
            const allEntries = await this.getAllFromDb();
            return allEntries
                .filter(([_, entry]) => entry.originalUrl === url)
                .map(([_, entry]) => entry);
        } catch (e) {
            logger.error('Failed to find entries by URL:', e);
            return [];
        }
    }
}

/**
 * Convert an IndexedDB request into a promise
 */
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Create and export the singleton instance
export const avatarCache = new AvatarCacheService();

// Add debugging helpers in development after exporting the instance
if (process.env.NODE_ENV === 'development') {
    // Add global debug variables in development
    (window as any).avatarCacheDebug = {
        service: avatarCache,
        testCache: async (userId: string, url: string, userName?: string) => {
            logger.debug(`Testing cache for ${userId} with ${url}`);
            const result = await avatarCache.cacheAvatar(userId, url, {name: userName});
            logger.debug('Result:', result ? 'Success' : 'Failed');
            return result;
        },
        getAllCaches: async () => {
            try {
                // Ensure the service is initialized
                if (!avatarCache.isInitialized()) {
                    await avatarCache.init();
                }
                
                const db = await (avatarCache as any).dbPromise;
                if (!db) return {};
                
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const keys = await promisifyRequest<IDBValidKey[]>(store.getAllKeys());
                const values = await promisifyRequest<CacheEntry[]>(store.getAll());
                
                const result: Record<string, any> = {};
                
                for (let i = 0; i < keys.length; i++) {
                    const userId = String(keys[i]);
                    const entry = values[i];
                    
                    result[userId] = {
                        originalUrl: entry.originalUrl,
                        timestamp: new Date(entry.timestamp).toLocaleString(),
                        userName: entry.userName || 'unknown',
                        displayName: entry.displayName || 'unknown',
                        dataUrlLength: entry.dataUrl?.length || 0
                    };
                }
                
                return result;
            } catch (e) {
                console.error('Error getting all caches:', e);
                return { error: String(e) };
            }
        },
        getRequestStats: async () => {
            try {
                // Ensure the service is initialized
                if (!avatarCache.isInitialized()) {
                    await avatarCache.init();
                }
                
                const stats = await avatarCache.getCacheStats();
                console.table(stats);
                
                // Get request record details
                const requestData: Record<string, any> = {};
                (avatarCache as any).requestCache.forEach((record: RequestRecord, url: string) => {
                    requestData[url] = {
                        lastRequest: new Date(record.timestamp).toLocaleString(),
                        count: record.count,
                        throttled: (avatarCache as any).shouldThrottleRequest(url) ? 'Yes' : 'No'
                    };
                });
                
                console.table(requestData);
                return { stats, requestData };
            } catch (e) {
                console.error('Error getting request stats:', e);
                return { error: String(e) };
            }
        }
    };
}

// Export the avatar cache instance
export default avatarCache;






