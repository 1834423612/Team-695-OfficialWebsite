<template>
  <div class="flex flex-col min-h-[100vh]">
    <main class="flex-1">
      <section class="bg-muted py-12 px-6 md:py-24 h-full">
        <div class="container mx-auto max-w-6xl grid md:grid-cols-2 gap-0 sm:gap-8 px-4 items-center">
          <div>
            <h2 class="text-xl font-bold mb-4">Welcome to</h2>
            <h2 class="text-4xl font-bold mb-4">TEAM 695 Bison Robotics</h2>
            <p class="text-muted-foreground mb-6">
              We are a FIRST Robotics Competition team dedicated to inspiring
              the next generation of engineers and innovators. Through our
              participation in the annual FIRST Robotics Competition, we strive
              to develop cutting-edge robots, foster teamwork and leadership,
              and make a positive impact on our community.
            </p>
            <!--buttons
            <div class="flex gap-4">
              <router-link
                to="/"
                class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Button 1
              </router-link>
              <router-link
                to="/"
                class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Button 2
              </router-link>
            </div>
            -->
          </div>

          <!-- 单图展示 -->
          <img
            src="https://r2.fastbirdcdn.online/Robotics/Robots/66ac2099b1841-20240802_Screenshot%202024-08-01%20193902.png"
            alt="Robotics Picture"
            class="my-10 aspect-[8/7] w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none "
          />

          <!-- 图片瀑布样式 -->
          <!-- <div class="hidden lg:flex justify-evenly mt-4">
            <div class="relative">
              <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80" alt="" class="aspect-[2/3] rounded-xl bg-gray-900/5 object-cover shadow-lg" />
              <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
            </div>
            <div class="relative">
              <img src="https://images.unsplash.com/photo-1485217988980-11786ced9454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80" alt="" class="aspect-[2/3] rounded-xl bg-gray-900/5 object-cover shadow-lg" />
              <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
            </div>
            <div class="relative">
              <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-x=.4&w=396&h=528&q=80" alt="" class="aspect-[2/3] rounded-xl bg-gray-900/5 object-cover shadow-lg" />
              <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
            </div>
            <div class="relative">
              <img src="https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=left&w=400&h=528&q=80" alt="" class="aspect-[2/3] rounded-xl bg-gray-900/5 object-cover shadow-lg" />
              <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
            </div>
            <div class="relative">
              <img src="https://images.unsplash.com/photo-1670272505284-8faba1c31f7d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80" alt="" class="aspect-[2/3] rounded-xl bg-gray-900/5 object-cover shadow-lg" />
              <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
            </div>
          </div> -->
        </div>
      </section>

      <!-- Mentors Section -->
      <Mentors />

      <!-- Team Members Section -->
      <!-- <Members /> -->

      <!-- Robots Section -->
      <!-- <Robots /> -->

      <!-- News Section -->
      <News />

      <!-- Sponsors Section -->
      <!-- <Sponsors /> -->
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CardStack from "../components/CardStack.vue";
import Robots from "../views/Robots.vue";
import Mentors from './Mentors.vue';
// import MentorCard from "../components/Cards/MentorCard.vue";
import Members from "../views/Members.vue";
import News from "../views/News.vue";
import Sponsors from "../views/Sponsors.vue";

export default defineComponent({
  components: { 
    CardStack, 
    Robots, 
    Mentors, 
    // MentorCard, 
    Members, 
    News, 
    Sponsors 
  },
});
</script>
