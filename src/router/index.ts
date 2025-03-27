// Import vue-router dependencies 
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import { casdoorService } from '@/services/auth';
// import About from '../views/About.vue';
// import MentorDetail from '../views/MentorDetail.vue';
// import Members from '../views/Members.vue';
// import Robots from '../views/Robots.vue';
// import News from '../views/News.vue';

// Define the routes 
// A route is an object that contains the path and the component that should be rendered when the path is matched
// The path is the URL that the user will navigate to
// The component is the Vue component that should be rendered when the path is matched
// Example: https://example.com/[path] [path] -> [component]
const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: '404NotFound',
    component: () => import('@/components/NotFound.vue'),
  },
  { path: '/', component: Home },
  { path: '/about', component: () => import('@/views/AboutContainerPage.vue') },
  // { path: '/aboutdetail', component: About },
  // { path: '/mentors', component: Mentors },
  // { path: '/mentors/:id', component: Mentors },
  // {
  //   path: '/mentors/:name',
  //   component: MentorDetail,
  //   props: (route: { params: { name: string; }; }) => {
  //     const mentorName = route.params.name.replace(/-/g, ' '); // Use '-' in the URL
  //     const mentor = mentorsData.find((m: { name: string; }) => m.name === mentorName);
  //     return { mentor };
  //   }
  // },
  { path: '/members', component: () => import('@/views/AboutContainerPage.vue') },
  { path: '/achievements', component: () => import('@/views/AboutContainerPage.vue') },
  // { path: '/robots', component: Robots },
  { path: '/gallery', component: () => import('@/views/Gallery.vue') },
  { path: '/resources', component: () => import('@/views/Resources.vue') },
  { path: '/contact', component: () => import('@/views/Contact.vue') },
  { path: '/pit-scouting', component: () => import('@/views/Pit-scouting.vue'), meta: { requiresAuth: true } },
  { path: '/pit-scouting/dashboard', component: () => import('@/views/Pit-scoutingDashboard.vue'), meta: { requiresAuth: true } },
  { path: '/2025strategy', component: () => import('@/views/strategy/2025chart.vue') },
  { path: '/2025strategy/html', component: () => import('@/views/strategy/2025chart-html.vue') },
  { path: '/legal/PrivacyPolicy', component: () => import('@/views/legal/PrivacyPolicy.vue') },
  { path: '/legal/TermsOfService', component: () => import('@/views/legal/TermsOfService.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/auth/CasdoorLogin.vue') },
  { path: '/callback', component: () => import('@/views/auth/CasdoorCallback.vue') },
  { path: '/login-success', name: 'login-success', component: () => import('@/views/auth/SucceedView.vue'), meta: { requiresAuth: true } },
];

// Create a new router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  const isLoggedIn = casdoorService.isLoggedIn(); // 使用 casdoorService 检查登录状态

  if (to.name === 'login' && isLoggedIn) {
    // 如果用户已登录并试图访问登录页面，重定向到成功页面
    next({ name: 'login-success' });
  } else if (to.name === 'login-success' && !isLoggedIn) {
    // 如果用户未登录并试图访问成功页面，重定向到登录页面
    next({ name: 'login' });
  } else if (to.meta.requiresAuth && !isLoggedIn) {
    // 如果需要登录并且用户未登录，重定向到登录页面
    next({ name: 'login' });
  } else {
    // 否则允许访问
    next();
  }
});

export default router;
