<template>
  <div class="flex flex-col min-h-[100vh]">
    <main class="flex-1">
      <section class="bg-muted py-12 px-6 md:py-24 h-full">
        <div class="container mx-auto max-w-6xl grid md:grid-cols-2 gap-0 sm:gap-8 px-4 items-center">
          <div>
            <h2 class="text-xl font-bold mb-4">Welcome to</h2>
            <h2 class="text-4xl font-bold mb-4">TEAM 695 Bison Robotics</h2>
            <p class="text-muted-foreground mb-6">
              Founded in 2001, Team 695 Bison Robotics is Beachwood High School’s competitive robotics team, dedicated
              to engaging students in a hands-on STEM environment. With a focus on teamwork, innovation, and real-world
              problem solving, we aim to build a competitive robot that reflects the passion and skills of our students.
              Our team members range from grades 9 to 12 and are united by a shared goal: to create, compete, and excel
              through robotics.
            </p>

            <!-- Buttons -->
            <div class="flex gap-4">
              <!-- Requested removal, unknown reason | 2024.11.25 19:34 -->
              <!--<a href="https://doc.frc695.com/" target="_blank"
                class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Team Documentation
              </a>-->
              <router-link to="/dashboard" class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Team Dashboard
              </router-link>
            </div>
          </div>

          <!-- 单图展示 -->
          <img
            src="https://r2.fastbirdcdn.online/Robotics/Robots/2025-695-Robot_Gold-Fish.jpeg"
            alt="2025 695 Robot - Gold Fish"
            class="my-10 aspect-[8/7] w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none " />

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


      <!-- News Section -->
      <News />

    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CardStack from "../components/CardStack.vue";
import News from "../views/News.vue";

export default defineComponent({
  components: {
    CardStack,
    News,
  },
});
</script>
