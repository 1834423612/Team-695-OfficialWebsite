<template>
  <div class="relative w-full h-full flex flex-wrap justify-center items-center">
    <div v-for="(image, index) in images" :key="index" :class="['relative', `stack-${index}`]">
      <img :src="image" alt="Card Image" class="card-image" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const images = ref([
  'https://placehold.co/600x400/22c55e/white/',
  'https://placehold.co/600x400/facc15/white/',
  'https://placehold.co/600x400/ef4444/white/',
  'https://placehold.co/600x400/3b82f6/white/',
  'https://placehold.co/600x400/7c3aed/white/',
  'https://placehold.co/600x400/ec4899/white/',
]);
</script>

<style scoped>
.relative {
  position: relative;
  transition: transform 0.3s ease;
}

.card-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* .stack-0 {
  transform: translate(0, 0);
  z-index: 6;
}
.stack-1 {
  transform: translate(80px, 20px);
  z-index: 5;
}
.stack-2 {
  transform: translate(160px, 40px);
  z-index: 4;
}
.stack-3 {
  transform: translate(0, 160px);
  z-index: 3;
}
.stack-4 {
  transform: translate(80px, 180px);
  z-index: 2;
}
.stack-5 {
  transform: translate(160px, 200px);
  z-index: 1;
} */

.stack-0 {
  transform: translate(0, 0);
  z-index: 1;
}


.stack-1 {
  transform: translate(50px, -40px);
  z-index: 2;
}

.stack-2 {
  transform: translate(20px, 20px);
  z-index: 3;
}

.stack-3 {
  transform: translate(0, 0);
  z-index: 4;
}

.stack-4 {
  transform: translate(10px, 10px);
  z-index: 5;
}

.stack-5 {
  transform: translate(20px, 20px);
  z-index: 6;
}

@media (max-width: 768px) {
  .card-image {
    width: 80px;
    height: 80px;
  }

  .stack-1 {
    transform: translate(60px, 15px);
  }
  .stack-2 {
    transform: translate(120px, 30px);
  }
  .stack-3 {
    transform: translate(0, 120px);
  }
  .stack-4 {
    transform: translate(60px, 135px);
  }
  .stack-5 {
    transform: translate(120px, 150px);
  }
}

@media (max-width: 480px) {
  .card-image {
    width: 60px;
    height: 60px;
  }

  .stack-1 {
    transform: translate(45px, 10px);
  }
  .stack-2 {
    transform: translate(90px, 20px);
  }
  .stack-3 {
    transform: translate(0, 90px);
  }
  .stack-4 {
    transform: translate(45px, 100px);
  }
  .stack-5 {
    transform: translate(90px, 110px);
  }
}
</style>
