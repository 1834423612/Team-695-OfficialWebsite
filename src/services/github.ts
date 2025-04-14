import axios from 'axios';

const REPO_OWNER = '1834423612';
const REPO_NAME = 'Team-695-OfficialWebsite';
const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

export interface GitHubCommit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        url: string;
    };
    author: {
        login: string;
        avatar_url: string;
    } | null;
    html_url: string;
}

export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
}

export interface VersionInfo {
    version: string;
    commitSha: string;
    commitMessage: string;
    commitDate: string;
    author: string;
    authorAvatar: string | null;
    commitUrl: string;
    branch: string;
}

export interface PackageJson {
    name: string;
    version: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts?: Record<string, string>;
    [key: string]: any;
}

export interface ProjectStructure {
    type: 'file' | 'directory';
    name: string;
    path: string;
    sha?: string;
    size?: number;
    children?: ProjectStructure[];
}

export interface RepoInfo {
    size: number;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    watchers_count: number;
    language: string;
    updated_at: string;
    created_at: string;
    license?: {
        name: string;
        spdx_id: string;
    };
    default_branch: string;
    subscribers_count?: number;
}

class GitHubService {
    async getRepoInfo(): Promise<RepoInfo | null> {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching repo info:', error);
            return null;
        }
    }

    async getLatestCommit(branch = 'master'): Promise<GitHubCommit | null> {
        try {
            const response = await axios.get(`${BASE_URL}/commits/${branch}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching latest commit:', error);
            return null;
        }
    }

    async getRecentCommits(branch = 'master', count = 5): Promise<GitHubCommit[]> {
        try {
            const response = await axios.get(`${BASE_URL}/commits`, {
                params: {
                    sha: branch,
                    per_page: count
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching recent commits:', error);
            return [];
        }
    }

    async getAllBranches(): Promise<GitHubBranch[]> {
        try {
            const response = await axios.get(`${BASE_URL}/branches`);
            return response.data;
        } catch (error) {
            console.error('Error fetching branches:', error);
            return [];
        }
    }

    // Get version info from the latest commit
    // This method creates a version string based on the latest commit date and SHA
    async getVersionInfo(): Promise<VersionInfo | null> {
        try {
            const latestCommit = await this.getLatestCommit();
            const branches = await this.getAllBranches();
            const mainBranch = branches.find(b => b.name === 'master' || b.name === 'main') || branches[0];
    
            if (!latestCommit || !mainBranch) {
                return null;
            }
    
            // Format the commit date to YYYY.MM.DD
            const commitDate = new Date(latestCommit.commit.committer.date);
            const formattedDate = `${commitDate.getFullYear()}.${(commitDate.getMonth() + 1).toString().padStart(2, '0')}.${commitDate.getDate().toString().padStart(2, '0')}`;
            
            // Use the first 6 characters of the commit SHA as a short ID
            const shortCommitSha = latestCommit.sha.substring(0, 6);
            
            // Combine into version: PROD_YYYY.MM.DD-abcdef
            const version = `PROD_v${formattedDate}-${shortCommitSha}`;
    
            return {
                version,
                commitSha: latestCommit.sha,
                commitMessage: latestCommit.commit.message,
                commitDate: latestCommit.commit.committer.date,
                author: latestCommit.author?.login || latestCommit.commit.author.name,
                authorAvatar: latestCommit.author?.avatar_url || null,
                commitUrl: latestCommit.html_url,
                branch: mainBranch.name
            };
        } catch (error) {
            console.error('Error creating version info:', error);
            return null;
        }
    }

    // Uncomment this method if you want to fetch version info from package.json
    // async getVersionInfo(): Promise<VersionInfo | null> {
    //     try {
    //         const latestCommit = await this.getLatestCommit();
    //         const branches = await this.getAllBranches();
    //         const mainBranch = branches.find(b => b.name === 'master' || b.name === 'main') || branches[0];

    //         if (!latestCommit || !mainBranch) {
    //             return null;
    //         }

    //         // Try to get package.json to extract version
    //         let version = '1.0.0'; // Default version
    //         try {
    //             const packageJson = await this.getPackageJson();
    //             if (packageJson && packageJson.version) {
    //                 version = packageJson.version;
    //             }
    //         } catch (e) {
    //             console.error('Error getting version from package.json:', e);
    //         }

    //         return {
    //             version,
    //             commitSha: latestCommit.sha,
    //             commitMessage: latestCommit.commit.message,
    //             commitDate: latestCommit.commit.committer.date,
    //             author: latestCommit.author?.login || latestCommit.commit.author.name,
    //             authorAvatar: latestCommit.author?.avatar_url || null,
    //             commitUrl: latestCommit.html_url,
    //             branch: mainBranch.name
    //         };
    //     } catch (error) {
    //         console.error('Error creating version info:', error);
    //         return null;
    //     }
    // }

    async getPackageJson(): Promise<PackageJson | null> {
        try {
            // First, try to get the package.json file content
            const response = await axios.get(`${BASE_URL}/contents/package.json`);

            // GitHub API returns the content as base64 encoded
            const content = atob(response.data.content);

            // Parse the JSON content
            return JSON.parse(content);
        } catch (error) {
            console.error('Error fetching package.json:', error);
            return null;
        }
    }

    async getProjectStructure(path = ''): Promise<ProjectStructure[]> {
        try {
            const response = await axios.get(`${BASE_URL}/contents/${path}`);

            // Sort to put directories first, then files
            const sorted = [...response.data].sort((a, b) => {
                if (a.type === 'dir' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'dir') return 1;
                return a.name.localeCompare(b.name);
            });

            return sorted.map(item => ({
                type: item.type === 'dir' ? 'directory' : 'file',
                name: item.name,
                path: item.path,
                sha: item.sha,
                size: item.size
            }));
        } catch (error) {
            console.error(`Error fetching project structure for path ${path}:`, error);
            return [];
        }
    }

    async getFileContent(path: string): Promise<string | null> {
        try {
            const response = await axios.get(`${BASE_URL}/contents/${path}`);

            // GitHub API returns the content as base64 encoded
            return atob(response.data.content);
        } catch (error) {
            console.error(`Error fetching file content for ${path}:`, error);
            return null;
        }
    }
}

export const githubService = new GitHubService();