<template>
    <div>
        <!-- Hero Section -->
        <section class="relative bg-cover bg-center text-white"
            style="background-image: url('https://r2.fastbirdcdn.online/Robotics/Gallery/2025%20Reefscape%20Season/NYRO25/compressed/695_Sat_012.jpg')">
            <div class="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
            <div class="container mx-auto px-4 py-20 md:py-32 relative z-10">
                <div class="max-w-4xl mx-auto text-center">
                    <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Partner with <span class="text-yellow-400">Excellence</span>
                    </h1>
                    <p class="text-xl md:text-2xl text-white/90 mb-8">
                        Support the future of innovation and engineering by sponsoring Team 695 Bison Robotics
                    </p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <a href="#current-sponsors"
                        class="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 hover:-translate-y-1 transition-all">
                        Our Sponsors
                        </a>
                        <a href="#sponsorship-tiers"
                            class="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 hover:-translate-y-1 transition-all">
                            Sponsorship Tiers
                        </a>
                        <a href="#contact"
                            class="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white font-semibold border-2 border-white rounded-md hover:bg-white/10 hover:-translate-y-1 transition-all">
                            Become a Sponsor
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Current Sponsors Section with dynamic data loading -->
        <section id="current-sponsors" class="pt-16 pb-12 md:pt-24 bg-white">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Valued Sponsors</h2>
                    <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                        We are grateful for the generous support of our sponsors who make our robotics journey possible.
                        Their contributions enable our team to innovate, compete, and inspire.
                    </p>
                </div>
        
                <!-- Loading state -->
                <div v-if="isLoading" class="flex justify-center items-center py-16">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
        
                <!-- Error state -->
                <div v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto">
                    <p>Unable to load sponsor information. Please try again later.</p>
                </div>
        
                <!-- Content when loaded successfully -->
                <div v-else>
                    <!-- Diamond Sponsors -->
                    <div v-if="diamondSponsors.length > 0" class="mb-16">
                        <h3 class="text-2xl font-bold text-center mb-8 text-yellow-600">Diamond Sponsors</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            :class="{ 'justify-center': diamondSponsors.length === 1 }">
                            <div v-for="sponsor in diamondSponsors" :key="sponsor.name"
                                class="bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 max-w-md mx-auto"
                                :class="{ 'col-span-full': diamondSponsors.length === 1 }">
                                <div class="h-32 flex items-center justify-center p-4">
                                    <img v-if="sponsor.logo" :src="sponsor.logo" :alt="`${sponsor.name} Logo`" 
                                        class="max-h-full max-w-full object-contain" 
                                        @error="handleImageError($event, sponsor)" />
                                    <div v-else class="bg-gray-100 flex items-center justify-center w-full h-full rounded">
                                        <span class="text-gray-500 font-medium">{{ sponsor.name }}</span>
                                    </div>
                                </div>
                                <div class="p-4 text-center">
                                    <h4 class="text-lg font-bold text-gray-800">
                                        <a v-if="sponsor.link" :href="sponsor.link" target="_blank" rel="noopener noreferrer"
                                            class="hover:text-yellow-600 transition-colors">{{ sponsor.name }}</a>
                                        <span v-else>{{ sponsor.name }}</span>
                                    </h4>
                                    <p v-if="sponsor.since" class="text-gray-600 text-sm">Supporting Team 695 since {{ sponsor.since }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <!-- Platinum Sponsors -->
                    <div v-if="platinumSponsors.length > 0" class="mb-16">
                        <h3 class="text-2xl font-bold text-center mb-8 text-slate-600">Platinum Sponsors</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            :class="{ 'justify-center': platinumSponsors.length === 1 }">
                            <div v-for="sponsor in platinumSponsors" :key="sponsor.name"
                                class="bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                :class="{ 'col-span-full md:col-span-3 lg:col-span-4 max-w-sm mx-auto': platinumSponsors.length === 1 }">
                                <div class="h-24 flex items-center justify-center p-4">
                                    <img v-if="sponsor.logo" :src="sponsor.logo" :alt="`${sponsor.name} Logo`" 
                                        class="max-h-full max-w-full object-contain"
                                        @error="handleImageError($event, sponsor)" />
                                    <div v-else class="bg-gray-100 flex items-center justify-center w-full h-full rounded">
                                        <span class="text-gray-500 font-medium">{{ sponsor.name }}</span>
                                    </div>
                                </div>
                                <div class="p-4 text-center">
                                    <h4 class="text-lg font-bold text-gray-800">
                                        <a v-if="sponsor.link" :href="sponsor.link" target="_blank" rel="noopener noreferrer"
                                            class="hover:text-slate-700 transition-colors">{{ sponsor.name }}</a>
                                        <span v-else>{{ sponsor.name }}</span>
                                    </h4>
                                    <p v-if="sponsor.since" class="text-gray-600 text-sm">Supporting Team 695 since {{ sponsor.since }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <!-- Gold Sponsors -->
                    <div v-if="goldSponsors.length > 0" class="mb-16">
                        <h3 class="text-2xl font-bold text-center mb-8 text-yellow-700">Gold Sponsors</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            :class="{ 'justify-center': goldSponsors.length === 1 }">
                            <div v-for="sponsor in goldSponsors" :key="sponsor.name"
                                class="bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                :class="{ 'col-span-full md:col-span-3 lg:col-span-4 max-w-sm mx-auto': goldSponsors.length === 1 }">
                                <div class="h-24 flex items-center justify-center p-4">
                                    <img v-if="sponsor.logo" :src="sponsor.logo" :alt="`${sponsor.name} Logo`" 
                                        class="max-h-full max-w-full object-contain"
                                        @error="handleImageError($event, sponsor)" />
                                    <div v-else class="bg-gray-100 flex items-center justify-center w-full h-full rounded">
                                        <span class="text-gray-500 font-medium">{{ sponsor.name }}</span>
                                    </div>
                                </div>
                                <div class="p-4 text-center">
                                    <h4 class="text-lg font-bold text-gray-800">
                                        <a v-if="sponsor.link" :href="sponsor.link" target="_blank" rel="noopener noreferrer"
                                            class="hover:text-yellow-600 transition-colors">{{ sponsor.name }}</a>
                                        <span v-else>{{ sponsor.name }}</span>
                                    </h4>
                                    <p v-if="sponsor.since" class="text-gray-600 text-sm">Supporting Team 695 since {{ sponsor.since }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Silver Sponsors -->
                    <div v-if="silverSponsors.length > 0" class="mb-16">
                        <h3 class="text-2xl font-bold text-center mb-8 text-gray-600">Silver Sponsors</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            :class="{ 'justify-center': silverSponsors.length === 1 }">
                            <div v-for="sponsor in silverSponsors" :key="sponsor.name"
                                class="bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                :class="{ 'col-span-full md:col-span-3 lg:col-span-4 max-w-sm mx-auto': silverSponsors.length === 1 }">
                                <div class="h-24 flex items-center justify-center p-4">
                                    <img v-if="sponsor.logo" :src="sponsor.logo" :alt="`${sponsor.name} Logo`" 
                                        class="max-h-full max-w-full object-contain"
                                        @error="handleImageError($event, sponsor)" />
                                    <div v-else class="bg-gray-100 flex items-center justify-center w-full h-full rounded">
                                        <span class="text-gray-500 font-medium">{{ sponsor.name }}</span>
                                    </div>
                                </div>
                                <div class="p-4 text-center">
                                    <h4 class="text-lg font-bold text-gray-800">
                                        <a v-if="sponsor.link" :href="sponsor.link" target="_blank" rel="noopener noreferrer"
                                            class="hover:text-gray-700 transition-colors">{{ sponsor.name }}</a>
                                        <span v-else>{{ sponsor.name }}</span>
                                    </h4>
                                    <p v-if="sponsor.since" class="text-gray-600 text-sm">Supporting Team 695 since {{ sponsor.since }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bronze Sponsors -->
                    <div v-if="bronzeSponsors.length > 0" class="mb-16">
                        <h3 class="text-2xl font-bold text-center mb-8 text-amber-700">Bronze Sponsors</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            :class="{ 'justify-center': bronzeSponsors.length === 1 }">
                            <div v-for="sponsor in bronzeSponsors" :key="sponsor.name"
                                class="bg-white rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                :class="{ 'col-span-full md:col-span-3 lg:col-span-4 max-w-sm mx-auto': bronzeSponsors.length === 1 }">
                                <div class="h-24 flex items-center justify-center p-4">
                                    <img v-if="sponsor.logo" :src="sponsor.logo" :alt="`${sponsor.name} Logo`" 
                                        class="max-h-full max-w-full object-contain"
                                        @error="handleImageError($event, sponsor)" />
                                    <div v-else class="bg-gray-100 flex items-center justify-center w-full h-full rounded">
                                        <span class="text-gray-500 font-medium">{{ sponsor.name }}</span>
                                    </div>
                                </div>
                                <div class="p-4 text-center">
                                    <h4 class="text-lg font-bold text-gray-800">
                                        <a v-if="sponsor.link" :href="sponsor.link" target="_blank" rel="noopener noreferrer"
                                            class="hover:text-yellow-600 transition-colors">{{ sponsor.name }}</a>
                                        <span v-else>{{ sponsor.name }}</span>
                                    </h4>
                                    <p v-if="sponsor.since" class="text-gray-600 text-sm">Supporting Team 695 since {{ sponsor.since }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Why Sponsor Section -->
        <section class="py-16 md:py-24 bg-white">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Sponsor Team 695?</h2>
                    <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                        Similar to funding a school sports team, supporting a FIRST Robotics team covers registration
                        fees,
                        equipment, and uniforms. However, rather than sports equipment, specialized robotics parts, pit
                        supplies,
                        and special electronics are required to build a functioning robot.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div
                        class="bg-white rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
                        <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-5">
                            <Icon icon="mdi:handshake" class="text-2xl text-yellow-600" />
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Community Impact</h3>
                        <p class="text-gray-600">
                            Your support directly impacts students' lives, fostering STEM education and creating
                            pathways to successful careers in engineering and technology.
                        </p>
                    </div>

                    <div
                        class="bg-white rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
                        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-5">
                            <Icon icon="mdi:account-group" class="text-2xl text-blue-600" />
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Brand Visibility</h3>
                        <p class="text-gray-600">
                            Gain exposure at regional and national competitions, on our robot, team apparel, and digital
                            platforms reaching thousands of spectators and participants.
                        </p>
                    </div>

                    <div
                        class="bg-white rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
                        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-5">
                            <Icon icon="mdi:sprout" class="text-2xl text-green-600" />
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">Future Talent</h3>
                        <p class="text-gray-600">
                            Connect with motivated, skilled students who may become your future employees. Our alumni
                            have gone on to successful careers in engineering and technology.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sponsorship Tiers Section -->
        <section id="sponsorship-tiers" class="py-16 md:py-24 bg-gray-50">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Sponsorship Tiers</h2>
                    <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                        We offer various sponsorship levels to accommodate different budgets and desired levels of
                        involvement.
                        Each tier provides unique benefits and recognition opportunities.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <!-- Diamond Tier -->
                    <div
                        class="bg-white rounded-lg shadow border-t-8 border-yellow-400 hover:-translate-y-2 hover:shadow-xl transition-all flex flex-col h-full">
                        <div class="p-6 text-center bg-yellow-50">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">Diamond</h3>
                            <p class="text-xl font-semibold text-yellow-600">$5,000+</p>
                        </div>
                        <div class="p-6 border-t border-b border-gray-200 flex-grow">
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Team Acknowledgement
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name included on website
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Logo on back of team shirt
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Large Logo on team banner
                                    (displayed at events)
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Large Logo on team
                                    competition robot
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name announced at Team
                                    Competitions
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Special team demonstration
                                    (upon request)
                                </li>
                            </ul>
                        </div>
                        <div class="p-6 mt-auto">
                            <a href="#contact"
                                class="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 w-full transition-colors">Become
                                a Diamond Sponsor</a>
                        </div>
                    </div>

                    <!-- Platinum Tier -->
                    <div
                        class="bg-white rounded-lg shadow border-t-8 border-slate-400 hover:-translate-y-2 hover:shadow-xl transition-all flex flex-col h-full">
                        <div class="p-6 text-center bg-slate-50">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">Platinum</h3>
                            <p class="text-xl font-semibold text-slate-600">$2,500 - $4,999</p>
                        </div>
                        <div class="p-6 border-t border-b border-gray-200 flex-grow">
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Team Acknowledgement
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name included on website
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Logo on back of team shirt
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Small Logo on team banner
                                    (displayed at events)
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Small Logo on team
                                    competition robot
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name announced at Team
                                    Competitions
                                </li>
                            </ul>
                        </div>
                        <div class="p-6 mt-auto">
                            <a href="#contact"
                                class="inline-flex items-center justify-center px-6 py-3 bg-slate-500 text-white font-semibold rounded-md hover:bg-slate-600 w-full transition-colors">Become
                                a Platinum Sponsor</a>
                        </div>
                    </div>

                    <!-- Gold Tier -->
                    <div
                        class="bg-white rounded-lg shadow border-t-8 border-yellow-600 hover:-translate-y-2 hover:shadow-xl transition-all flex flex-col h-full">
                        <div class="p-6 text-center bg-yellow-50">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">Gold</h3>
                            <p class="text-xl font-semibold text-yellow-700">$1,000 - $2,499</p>
                        </div>
                        <div class="p-6 border-t border-b border-gray-200 flex-grow">
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Team Acknowledgement
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name included on website
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Logo on back of team shirt
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Small Logo on team banner
                                    (displayed at events)
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name on team competition
                                    robot
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name announced at Team
                                    Competitions
                                </li>
                            </ul>
                        </div>
                        <div class="p-6 mt-auto">
                            <a href="#contact"
                                class="inline-flex items-center justify-center px-6 py-3 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 w-full transition-colors">Become
                                a Gold Sponsor</a>
                        </div>
                    </div>

                    <!-- Silver Tier -->
                    <div
                        class="bg-white rounded-lg shadow border-t-8 border-gray-400 hover:-translate-y-2 hover:shadow-xl transition-all flex flex-col h-full">
                        <div class="p-6 text-center bg-gray-100">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">Silver</h3>
                            <p class="text-xl font-semibold text-gray-600">$500 - $999</p>
                        </div>
                        <div class="p-6 border-t border-b border-gray-200 flex-grow">
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Team Acknowledgement
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name included on website
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name on back of team shirt
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name on team banner
                                    (displayed at events)
                                </li>
                            </ul>
                        </div>
                        <div class="p-6 mt-auto">
                            <a href="#contact"
                                class="inline-flex items-center justify-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 w-full transition-colors">Become
                                a Silver Sponsor</a>
                        </div>
                    </div>

                    <!-- Bronze Tier -->
                    <div
                        class="bg-white rounded-lg shadow border-t-8 border-amber-700 hover:-translate-y-2 hover:shadow-xl transition-all flex flex-col h-full">
                        <div class="p-6 text-center bg-amber-50">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">Bronze</h3>
                            <p class="text-xl font-semibold text-amber-700">$250 - $500</p>
                        </div>
                        <div class="p-6 border-t border-b border-gray-200 flex-grow">
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Team Acknowledgement
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name included on website
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Name on back of team shirt
                                </li>
                            </ul>
                        </div>
                        <div class="p-6 mt-auto">
                            <a href="#contact"
                                class="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 w-full transition-colors">Become
                                a Bronze Sponsor</a>
                        </div>
                    </div>

                    <!-- Friends of the Bison -->
                    <div
                        class="bg-white rounded-lg shadow border-t-8 border-blue-500 hover:-translate-y-2 hover:shadow-xl transition-all flex flex-col h-full">
                        <div class="p-6 text-center bg-blue-50">
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">Friends of the Bison</h3>
                            <p class="text-xl font-semibold text-blue-600">$50 - $249</p>
                        </div>
                        <div class="p-6 border-t border-b border-gray-200 flex-grow">
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" class="text-green-500" /> Team Acknowledgement
                                </li>
                            </ul>
                        </div>
                        <div class="p-6 mt-auto">
                            <a href="#contact"
                                class="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 w-full transition-colors">Become
                                a Friend</a>
                        </div>
                    </div>
                </div>

                <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="md:flex">
                        <div class="md:shrink-0 flex items-center justify-center p-6 bg-yellow-50">
                            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/695%20Sponsorship%20Handout_00-0vYpTf401Z5Wq2zVif8EAa0J4kYggn.png"
                                alt="Sponsorship Tiers Pyramid" class="h-48 w-auto object-contain" />
                        </div>
                        <div class="p-8">
                            <div class="flex items-center gap-3 mb-4">
                                <Icon icon="mdi:file-document" class="text-2xl text-blue-600" />
                                <h3 class="text-xl font-bold text-gray-800">Sponsorship Information</h3>
                            </div>
                            <p class="text-gray-600 mb-6">
                                Download our complete sponsorship information packet for detailed information about our
                                team, sponsorship opportunities, and how your support makes a difference.
                            </p>
                            <a href="https://r2.fastbirdcdn.online/Robotics/Resource/695%20Sponsorship%20Handout.pdf" target="_blank"
                                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                <Icon icon="mdi:download" />
                                Download Sponsorship PDF
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Impact Section -->
        <section class="py-16 md:py-24 bg-gray-900 text-white">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold mb-6">Your Impact</h2>
                    <p class="text-lg text-gray-300">
                        When you sponsor Team 695, you're not just supporting a robotics team - you're investing in the
                        future of STEM education and innovation.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div
                        class="bg-white/5 rounded-lg p-8 text-center hover:bg-white/10 hover:-translate-y-1 transition-all">
                        <div class="text-4xl font-bold text-yellow-400 mb-2">30+</div>
                        <h3 class="text-xl font-semibold mb-2">Students</h3>
                        <p class="text-gray-300">Gaining hands-on engineering experience each year</p>
                    </div>

                    <div
                        class="bg-white/5 rounded-lg p-8 text-center hover:bg-white/10 hover:-translate-y-1 transition-all">
                        <div class="text-4xl font-bold text-yellow-400 mb-2">24+</div>
                        <h3 class="text-xl font-semibold mb-2">Years</h3>
                        <p class="text-gray-300">Of inspiring students in STEM and robotics</p>
                    </div>

                    <!-- <div
                        class="bg-white/5 rounded-lg p-8 text-center hover:bg-white/10 hover:-translate-y-1 transition-all">
                        <div class="text-4xl font-bold text-yellow-400 mb-2">5+</div>
                        <h3 class="text-xl font-semibold mb-2">Competitions</h3>
                        <p class="text-gray-300">Attended annually across the region</p>
                    </div> -->

                    <div
                        class="bg-white/5 rounded-lg p-8 text-center hover:bg-white/10 hover:-translate-y-1 transition-all">
                        <div class="text-4xl font-bold text-yellow-400 mb-2">100%</div>
                        <h3 class="text-xl font-semibold mb-2">Commitment</h3>
                        <p class="text-gray-300">To excellence in engineering and teamwork</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="py-16 md:py-24 bg-white">
            <div class="container mx-auto px-4">
                <div class="max-w-5xl mx-auto">
                    <div class="bg-gray-50 rounded-2xl shadow-lg overflow-hidden">
                        <div class="md:flex">
                            <div class="md:w-1/2 p-8 md:p-12">
                                <h2 class="text-3xl font-bold text-gray-800 mb-6">Become a Sponsor</h2>
                                <p class="text-gray-600 mb-8">
                                    Ready to support the next generation of engineers and innovators? Fill out this form
                                    to start your sponsorship journey with Team 695 Bison Robotics.
                                </p>

                                <form class="space-y-4">
                                    <div>
                                        <label for="name"
                                            class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input type="text" id="name"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                                            placeholder="Your name" />
                                    </div>

                                    <div>
                                        <label for="company"
                                            class="block text-sm font-medium text-gray-700 mb-1">Company Name
                                            (optional)</label>
                                        <input type="text" id="company"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                                            placeholder="Your company" />
                                    </div>

                                    <div>
                                        <label for="email"
                                            class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" id="email"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                                            placeholder="your.email@example.com" />
                                    </div>

                                    <div>
                                        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <div class="relative">
                                            <input 
                                                type="tel" 
                                                id="phone"
                                                v-model="phoneInput"
                                                @input="formatPhoneNumber"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                                                placeholder="(555) 123-4567" 
                                            />
                                            <input 
                                                type="hidden" 
                                                :value="phoneRaw" 
                                                name="phone_raw"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label for="sponsorship"
                                            class="block text-sm font-medium text-gray-700 mb-1">Sponsorship
                                            Level</label>
                                        <select id="sponsorship"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200">
                                            <option value="">Select a sponsorship level</option>
                                            <option value="diamond">Diamond ($5,000+)</option>
                                            <option value="platinum">Platinum ($2,500 - $4,999)</option>
                                            <option value="gold">Gold ($1,000 - $2,499)</option>
                                            <option value="silver">Silver ($500 - $999)</option>
                                            <option value="bronze">Bronze ($250 - $500)</option>
                                            <option value="friend">Friends of the Bison ($50 - $249)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="message"
                                            class="block text-sm font-medium text-gray-700 mb-1">Message
                                            (optional)</label>
                                        <textarea id="message" rows="4"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                                            placeholder="Any additional information you'd like to share"></textarea>
                                    </div>

                                    <button type="submit"
                                        class="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 w-full transition-colors">
                                        Submit
                                    </button>
                                </form>
                            </div>

                            <div class="md:w-1/2 bg-blue-600 p-8 md:p-12 text-white">
                                <h3 class="text-2xl font-bold mb-6">Donation Information</h3>
                                <p class="mb-6">
                                    Please fill this form out and return with your check. Checks should be made out to
                                    "Beachwood Schools" with the memo designating "Donation to robotics Team 695".
                                </p>

                                <div class="mb-6">
                                    <h4 class="text-lg font-semibold mb-2">Mailing Address</h4>
                                    <p>Beachwood Schools</p>
                                    <p>24601 Fairmount Blvd</p>
                                    <p>Beachwood, OH 44122</p>
                                </div>

                                <div class="mb-6">
                                    <h4 class="text-lg font-semibold mb-2">Tax Information</h4>
                                    <p>
                                        Donations to the Beachwood Schools District are tax deductible under IRC
                                        170(c)(1). Please consult your tax advisor for more information.
                                    </p>
                                </div>

                                <div class="mb-6">
                                    <h4 class="text-lg font-semibold mb-2">Contact Us</h4>
                                    <p>If you have any questions or need further information, please fill out the form
                                        on the left</p>
                                    <!-- <div class="flex items-center gap-2 mb-2">
                                        <Icon icon="mdi:email" />
                                        <a href="mailto:sponsor@example.com"
                                            class="text-white hover:text-yellow-200 transition-colors">sponsor@example.com</a>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Icon icon="mdi:phone" />
                                        <a href="tel:+12165551234"
                                            class="text-white hover:text-yellow-200 transition-colors">(216)
                                            111-1234</a>
                                    </div> -->
                                </div>

                                <div>
                                    <a href="https://r2.fastbirdcdn.online/Robotics/Resource/695%20Sponsorship%20Handout.pdf" target="_blank"
                                        class="inline-flex items-center gap-3 px-5 py-2.5 bg-white text-blue-600 rounded-md hover:bg-yellow-100 transition-colors">
                                        <Icon icon="mdi:download" class="text-lg flex-shrink-0" aria-hidden="true" />
                                        <span class="truncate">Download Sponsorship Form</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section with collapsible items -->
        <section class="py-16 md:py-24 bg-gray-50">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
                    <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                        Have questions about sponsoring Team 695? Find answers to common questions below.
                    </p>
                </div>

                <div class="max-w-3xl mx-auto">
                    <div class="space-y-6">
                        <!-- FAQ Item 1 -->
                        <div class="border border-gray-200 rounded-lg overflow-hidden">
                            <button @click="toggleFaq(0)"
                                class="w-full text-left px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <h3 class="text-xl font-semibold text-gray-800">What is FIRST Robotics?</h3>
                                <span class="text-2xl text-gray-500" v-if="!openFaqs[0]">+</span>
                                <span class="text-2xl text-gray-500" v-else>−</span>
                            </button>
                            <div v-show="openFaqs[0]"
                                class="text-gray-600 leading-relaxed px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <p>
                                    FIRST (For Inspiration and Recognition of Science and Technology) is an
                                    international youth organization that operates robotics competitions. The FIRST
                                    Robotics Competition challenges high school students to design, build, and program
                                    industrial-size robots to play a field game in alliance with other teams.
                                </p>
                            </div>
                        </div>

                        <!-- FAQ Item 2 -->
                        <div class="border border-gray-200 rounded-lg overflow-hidden">
                            <button @click="toggleFaq(1)"
                                class="w-full text-left px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <h3 class="text-xl font-semibold text-gray-800">How are sponsorship funds used?</h3>
                                <span class="text-2xl text-gray-500" v-if="!openFaqs[1]">+</span>
                                <span class="text-2xl text-gray-500" v-else>−</span>
                            </button>
                            <div v-show="openFaqs[1]"
                                class="text-gray-600 leading-relaxed px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <p>
                                    Sponsorship funds are used to cover competition registration fees, purchase robot
                                    parts and materials, provide team uniforms, support travel to competitions, and
                                    maintain our workshop equipment. Every dollar goes directly to supporting our
                                    students and their robotics journey.
                                </p>
                            </div>
                        </div>

                        <!-- FAQ Item 3 -->
                        <div class="border border-gray-200 rounded-lg overflow-hidden">
                            <button @click="toggleFaq(2)"
                                class="w-full text-left px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <h3 class="text-xl font-semibold text-gray-800">Is my sponsorship tax-deductible?</h3>
                                <span class="text-2xl text-gray-500" v-if="!openFaqs[2]">+</span>
                                <span class="text-2xl text-gray-500" v-else>−</span>
                            </button>
                            <div v-show="openFaqs[2]"
                                class="text-gray-600 leading-relaxed px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <p>
                                    Yes, donations to Team 695 through Beachwood Schools are tax-deductible under IRC
                                    170(c)(1). You will receive a receipt for your donation that can be used for tax
                                    purposes.
                                </p>
                            </div>
                        </div>

                        <!-- FAQ Item 4 -->
                        <div class="border border-gray-200 rounded-lg overflow-hidden">
                            <button @click="toggleFaq(3)"
                                class="w-full text-left px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <h3 class="text-xl font-semibold text-gray-800">Can I sponsor with in-kind donations?
                                </h3>
                                <span class="text-2xl text-gray-500" v-if="!openFaqs[3]">+</span>
                                <span class="text-2xl text-gray-500" v-else>−</span>
                            </button>
                            <div v-show="openFaqs[3]"
                                class="text-gray-600 leading-relaxed px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <p>
                                    We welcome in-kind donations of materials, tools, services, and expertise. These
                                    contributions are valued and recognized at the equivalent sponsorship tier. Please
                                    contact us to discuss your in-kind donation.
                                </p>
                            </div>
                        </div>

                        <!-- FAQ Item 5 -->
                        <div class="border border-gray-200 rounded-lg overflow-hidden">
                            <button @click="toggleFaq(4)"
                                class="w-full text-left px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <h3 class="text-xl font-semibold text-gray-800">How long does sponsorship recognition
                                    last?</h3>
                                <span class="text-2xl text-gray-500" v-if="!openFaqs[4]">+</span>
                                <span class="text-2xl text-gray-500" v-else>−</span>
                            </button>
                            <div v-show="openFaqs[4]"
                                class="text-gray-600 leading-relaxed px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <p>
                                    Sponsorship recognition lasts for one FIRST Robotics season (approximately one
                                    year). We welcome and encourage multi-year sponsorship commitments to help with our
                                    long-term planning.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Define sponsor type
interface Sponsor {
    name: string;
    logo?: string;
    link?: string;
    since?: string;
}

// Reactive state
const diamondSponsors = ref<Sponsor[]>([]);
const platinumSponsors = ref<Sponsor[]>([]);
const goldSponsors = ref<Sponsor[]>([]);
const silverSponsors = ref<Sponsor[]>([]);
const bronzeSponsors = ref<Sponsor[]>([]);
const isLoading = ref(true);
const loadError = ref(false);

// Fetch sponsors data
async function fetchSponsors() {
    isLoading.value = true;
    loadError.value = false;

    try {
        // Try to get data from API
        const response = await axios.get('https://api.team695.com/sponsors.json');
        
        // Check if API returned any data at all
        const hasApiData = Boolean(
            (response.data.diamond && response.data.diamond.length) || 
            (response.data.platinum && response.data.platinum.length) || 
            (response.data.gold && response.data.gold.length) || 
            (response.data.silver && response.data.silver.length) || 
            (response.data.bronze && response.data.bronze.length)
        );

        if (hasApiData) {
            // API returned some data, use it
            diamondSponsors.value = response.data.diamond || [];
            platinumSponsors.value = response.data.platinum || [];
            goldSponsors.value = response.data.gold || [];
            // silverSponsors.value = [...(response.data.silver || []), ...(response.data.bronze || [])];
            silverSponsors.value = response.data.silver || [];
            bronzeSponsors.value = response.data.bronze || [];
        } else {
            // API returned empty data, use fallback
            console.warn('API returned empty sponsor data, using fallback data');
            useFallbackData();
        }
    } catch (error) {
        console.error('Failed to fetch sponsor data:', error);
        // API request failed, use fallback data
        useFallbackData();
    } finally {
        // If we still have no sponsors after trying API and fallback, 
        // then show the error message
        const hasSomeData = 
            diamondSponsors.value.length > 0 || 
            platinumSponsors.value.length > 0 || 
            goldSponsors.value.length > 0 || 
            silverSponsors.value.length > 0 || 
            bronzeSponsors.value.length > 0;
            
        loadError.value = !hasSomeData;
        isLoading.value = false;
    }
}

// Modified fallback function that returns consistency status
function useFallbackData() {
    // Define fallback data
    const fallbackData = {
        diamond: [
            { name: "Beachwood Schools", since: "2001", logo: "https://r2.fastbirdcdn.online/Robotics/Logo/66aed981e62c2-20240804_Beachwood-Schools-LOGO.png" },
            { name: "Beachwood City Schools", since: "2001", logo: "https://r2.fastbirdcdn.online/Robotics/Logo/66aed9821d766-20240804_Beachwood-City-Schools-LOGO.png", link: "https://beachwoodschools.org/" }
        ],
        platinum: [
            // { name: "Tech Solutions Inc.", logo: "https://placehold.co/160x80/CCCCCC/333333?text=Company+Logo" }
        ],
        gold: [
            // { name: "Engineering Innovations", logo: "https://placehold.co/160x80/CCCCCC/333333?text=Company+Logo" }
        ],
        silver: [
            { name: "FabWorks", since: "2025", logo: "https://www.fabworks.com/fabworks.svg", link: "https://www.fabworks.com/" }
        ],
        bronze: [
            // { name: "Local Business", logo: "https://placehold.co/160x80/CCCCCC/333333?text=Company+Logo" }
        ]
    };
    
    // Assign the fallback data
    diamondSponsors.value = fallbackData.diamond;
    platinumSponsors.value = fallbackData.platinum;
    goldSponsors.value = fallbackData.gold;
    silverSponsors.value = fallbackData.silver;
    bronzeSponsors.value = fallbackData.bronze;
}

// 处理图片加载错误
function handleImageError(event: Event, sponsor: { name: string | number | boolean; }) {
    // 替换为占位图
    const target = event.target as HTMLImageElement;
    target.src = `https://placehold.co/300x150/CCCCCC/333333?text=${encodeURIComponent(sponsor.name)}`;
}

// 在组件挂载时加载数据
onMounted(() => {
    fetchSponsors();
});

// Phone number formatting
const phoneInput = ref('');
const phoneRaw = ref('');

function formatPhoneNumber() {
    // Remove any non-digit characters
    const digits = phoneInput.value.replace(/\D/g, '');

    // Store raw digits for submission
    phoneRaw.value = digits;

    // Format the phone number for display
    let formattedNumber = '';
    if (digits.length > 0) {
        formattedNumber = '(' + digits.substring(0, 3);
        if (digits.length > 3) {
            formattedNumber += ') ' + digits.substring(3, 6);
            if (digits.length > 6) {
                formattedNumber += '-' + digits.substring(6, 10);
            }
        }
    }

    // Update the display value without triggering another format
    phoneInput.value = formattedNumber;
}

// FAQ collapsible functionality
const openFaqs = ref([false, false, false, false, false]);

function toggleFaq(index: number) {
    openFaqs.value[index] = !openFaqs.value[index];
}
</script>