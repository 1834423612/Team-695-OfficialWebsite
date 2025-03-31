<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70 z-10"></div>
      <div class="hero-image absolute inset-0 z-0">
        <img 
          src="https://placehold.co/1920x1080/2a2a2a/ffffff?text=Team+695+Robot+in+Action" 
          alt="Team 695 Robot in Action" 
          class="w-full h-full object-cover"
        />
      </div>
      <div class="container mx-auto px-4 py-24 md:py-32 lg:py-40 relative z-20">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            TEAM 695 <span class="text-yellow-400">BISON ROBOTICS</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-200 mb-8">
            Engineering excellence through innovation, teamwork, and competitive spirit
          </p>
          <div class="flex flex-wrap gap-4">
            <button class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-md transition duration-300 flex items-center">
              <Icon icon="icon-park-outline:robot" class="mr-2 text-xl" />
              Meet Our Robots
            </button>
            <button class="bg-transparent hover:bg-white/10 text-white border-2 border-white py-3 px-6 rounded-md transition duration-300 flex items-center">
              <Icon icon="carbon:partnership" class="mr-2 text-xl" />
              Become a Sponsor
            </button>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
    </section>

    <!-- About Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <div class="w-24 h-1 bg-yellow-500 mx-auto"></div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Excellence in Robotics Since 2001</h3>
            <p class="text-gray-700 mb-4">
              Founded in 2001, Team 695 Bison Robotics is Beachwood High School's competitive robotics team, dedicated to engaging students in a hands-on STEM environment. With a focus on teamwork, innovation, and real-world problem solving, we aim to build a competitive robot that reflects the passion and skills of our students.
            </p>
            <p class="text-gray-700 mb-6">
              Our team members range from grades 9 to 12 and are united by a shared goal: to create, compete, and excel through robotics. Through mentorship, collaboration, and rigorous engineering practices, we develop not just robots, but future leaders in STEM fields.
            </p>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Icon icon="mdi:robot-industrial" class="text-2xl" />
                </div>
                <div class="ml-4">
                  <h4 class="font-bold">20+ Years</h4>
                  <p class="text-sm text-gray-600">of Excellence</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Icon icon="mdi:account-group" class="text-2xl" />
                </div>
                <div class="ml-4">
                  <h4 class="font-bold">100+ Students</h4>
                  <p class="text-sm text-gray-600">Impacted</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Icon icon="mdi:trophy" class="text-2xl" />
                </div>
                <div class="ml-4">
                  <h4 class="font-bold">Multiple Awards</h4>
                  <p class="text-sm text-gray-600">and Recognitions</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative">
            <img 
              src="https://placehold.co/600x400/f0f0f0/333333?text=Team+Working+Together" 
              alt="Team 695 Members Working Together" 
              class="w-full h-auto rounded-lg shadow-xl"
            />
            <div class="absolute -bottom-6 -left-6 w-48 h-48 bg-yellow-500 rounded-lg -z-10"></div>
            <div class="absolute -top-6 -right-6 w-24 h-24 bg-gray-200 rounded-lg -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Robots Section -->
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Robots</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Each year, we design and build a new robot to compete in the FIRST Robotics Competition. 
            Here are some of our recent creations.
          </p>
          <div class="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105">
            <div class="h-64 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/333333/ffffff?text=2023+Robot" 
                alt="2023 Robot" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">2023 Season Robot</h3>
              <p class="text-gray-600 mb-4">
                Our 2023 robot featured advanced autonomous capabilities and a precision scoring mechanism.
              </p>
              <button class="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
                Learn More <Icon icon="mdi:arrow-right" class="ml-1" />
              </button>
            </div>
          </div>
          
          <div class="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105">
            <div class="h-64 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/333333/ffffff?text=2022+Robot" 
                alt="2022 Robot" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">2022 Season Robot</h3>
              <p class="text-gray-600 mb-4">
                Our 2022 robot excelled in rapid ball handling and featured a climbing mechanism.
              </p>
              <button class="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
                Learn More <Icon icon="mdi:arrow-right" class="ml-1" />
              </button>
            </div>
          </div>
          
          <div class="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105">
            <div class="h-64 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/333333/ffffff?text=2021+Robot" 
                alt="2021 Robot" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">2021 Season Robot</h3>
              <p class="text-gray-600 mb-4">
                Despite pandemic challenges, our 2021 robot showcased innovative design solutions.
              </p>
              <button class="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
                Learn More <Icon icon="mdi:arrow-right" class="ml-1" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <button class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-md transition duration-300">
            View All Robots
          </button>
        </div>
      </div>
    </section>

    <!-- Sponsors Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Sponsors</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            We are grateful for the support of our sponsors who make our robotics program possible.
            Their contributions help us build robots, attend competitions, and inspire the next generation of engineers.
          </p>
          <div class="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg h-32">
            <img 
              src="https://placehold.co/200x100/f0f0f0/333333?text=Sponsor+1" 
              alt="Sponsor 1" 
              class="max-h-16"
            />
          </div>
          <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg h-32">
            <img 
              src="https://placehold.co/200x100/f0f0f0/333333?text=Sponsor+2" 
              alt="Sponsor 2" 
              class="max-h-16"
            />
          </div>
          <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg h-32">
            <img 
              src="https://placehold.co/200x100/f0f0f0/333333?text=Sponsor+3" 
              alt="Sponsor 3" 
              class="max-h-16"
            />
          </div>
          <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg h-32">
            <img 
              src="https://placehold.co/200x100/f0f0f0/333333?text=Sponsor+4" 
              alt="Sponsor 4" 
              class="max-h-16"
            />
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-8 md:p-12">
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Become a Sponsor</h3>
              <p class="text-gray-700 mb-6">
                Your support can make a significant impact on our team and the future of STEM education. 
                By becoming a sponsor, you'll help us inspire and educate the next generation of engineers, 
                programmers, and innovators.
              </p>
              <ul class="mb-6 space-y-2">
                <li class="flex items-center">
                  <Icon icon="mdi:check-circle" class="text-green-500 mr-2" />
                  <span>Support STEM education in our community</span>
                </li>
                <li class="flex items-center">
                  <Icon icon="mdi:check-circle" class="text-green-500 mr-2" />
                  <span>Gain visibility through team branding and events</span>
                </li>
                <li class="flex items-center">
                  <Icon icon="mdi:check-circle" class="text-green-500 mr-2" />
                  <span>Connect with talented students interested in STEM</span>
                </li>
              </ul>
              <button class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-md transition duration-300">
                Sponsor Our Team
              </button>
            </div>
            <div class="relative">
              <img 
                src="https://placehold.co/600x400/f0f0f0/333333?text=Sponsorship+Opportunities" 
                alt="Sponsorship Opportunities" 
                class="w-full h-auto rounded-lg shadow-lg"
              />
              <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-yellow-200 rounded-lg -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest News Section -->
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest News</h2>
          <div class="w-24 h-1 bg-yellow-500 mx-auto"></div>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-lg overflow-hidden shadow-md">
            <div class="h-48 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/333333/ffffff?text=Build+Season" 
                alt="Build Season News" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <div class="text-sm text-gray-500 mb-2">November 7, 2024</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Build Season Starts January 4, 2025</h3>
              <p class="text-gray-600 mb-4">
                We're excited to announce that our build season will officially begin on January 4, 2025. 
                The team is already preparing for the upcoming challenges.
              </p>
              <button class="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
                Read More <Icon icon="mdi:arrow-right" class="ml-1" />
              </button>
            </div>
          </div>
          
          <div class="bg-white rounded-lg overflow-hidden shadow-md">
            <div class="h-48 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/333333/ffffff?text=Team+Workshop" 
                alt="Team Workshop News" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <div class="text-sm text-gray-500 mb-2">October 15, 2024</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">New Equipment Arrives at Team Workshop</h3>
              <p class="text-gray-600 mb-4">
                Thanks to our generous sponsors, we've received new equipment for our workshop that will 
                enhance our building capabilities for the upcoming season.
              </p>
              <button class="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
                Read More <Icon icon="mdi:arrow-right" class="ml-1" />
              </button>
            </div>
          </div>
          
          <div class="bg-white rounded-lg overflow-hidden shadow-md">
            <div class="h-48 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/333333/ffffff?text=Outreach+Event" 
                alt="Outreach Event News" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <div class="text-sm text-gray-500 mb-2">September 22, 2024</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Team 695 Hosts STEM Outreach Day</h3>
              <p class="text-gray-600 mb-4">
                Our team recently hosted a STEM outreach day for local middle school students, 
                introducing them to robotics and engineering concepts through hands-on activities.
              </p>
              <button class="text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
                Read More <Icon icon="mdi:arrow-right" class="ml-1" />
              </button>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <button class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-md transition duration-300">
            View All News
          </button>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-16 bg-gray-900 text-white">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Join Team 695 Bison Robotics</h2>
            <p class="text-gray-300 mb-6">
              Are you a student interested in robotics, engineering, programming, or business? 
              Join our team and be part of an exciting journey of innovation and competition!
            </p>
            <button class="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-md transition duration-300">
              Get Involved
            </button>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-800 p-6 rounded-lg">
              <Icon icon="mdi:robot-excited" class="text-4xl text-yellow-400 mb-4" />
              <h3 class="text-xl font-bold mb-2">For Students</h3>
              <p class="text-gray-300">
                Develop skills in engineering, programming, and teamwork.
              </p>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg">
              <Icon icon="mdi:teach" class="text-4xl text-yellow-400 mb-4" />
              <h3 class="text-xl font-bold mb-2">For Mentors</h3>
              <p class="text-gray-300">
                Share your expertise and inspire the next generation.
              </p>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg">
              <Icon icon="mdi:account-group" class="text-4xl text-yellow-400 mb-4" />
              <h3 class="text-xl font-bold mb-2">For Parents</h3>
              <p class="text-gray-300">
                Support your child's growth in STEM education.
              </p>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg">
              <Icon icon="mdi:handshake" class="text-4xl text-yellow-400 mb-4" />
              <h3 class="text-xl font-bold mb-2">For Sponsors</h3>
              <p class="text-gray-300">
                Partner with us to promote STEM in our community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<style scoped>
.hero-section {
  height: 80vh;
  min-height: 600px;
  max-height: 800px;
}

@media (max-width: 768px) {
  .hero-section {
    height: 60vh;
    min-height: 500px;
  }
}
</style>