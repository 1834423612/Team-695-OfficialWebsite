// Import vue-router dependencies 
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
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
const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    name: '404NotFound',
    component: () => import('@/components/NotFound.vue'),
  },
  { path: '/', component: Home },
  { path: '/sponsors', component: () => import('@/views/Sponsors.vue') },
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
  { path: '/2025strategy', component: () => import('@/views/strategy/2025chart.vue') },
  { path: '/2025strategy/html', component: () => import('@/views/strategy/2025chart-html.vue') },
  { path: '/legal/PrivacyPolicy', component: () => import('@/views/legal/PrivacyPolicy.vue') },
  { path: '/legal/TermsOfService', component: () => import('@/views/legal/TermsOfService.vue') },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/CasdoorLogin.vue'),
    meta: { guest: true }
  },
  {
    path: '/callback',
    name: 'callback',
    component: () => import('@/views/auth/CasdoorCallback.vue'),
    meta: { guest: true }
  },
  {
    path: '/Dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/Index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: () => import('@/views/dashboard/HomeView.vue'),
      },
      {
        path: 'Calendar',
        name: 'Calendar',
        component: () => import('@/views/dashboard/CalendarView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'Profile',
        name: 'Profile',
        component: () => import('@/views/dashboard/ProfileView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'Pit-Scouting',
        name: 'Pit-Scouting',
        component: () => import('@/views/dashboard/PitScouting/PitScoutingView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'Pit-Scouting/Admin',
        name: 'Pit-ScoutingAdmin',
        component: () => import('@/views/dashboard/PitScouting/PitScoutingAdminView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  // Keep the old routes for backward compatibility, but redirect to dashboard
  { 
    path: '/pit-scouting', 
    redirect: '/dashboard/Pit-Scouting',
    meta: { requiresAuth: true } 
  },
  { 
    path: '/pit-scouting/dashboard', 
    redirect: '/dashboard/Pit-Scouting/Admin',
    meta: { requiresAuth: true } 
  },
];

// Create a new router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const isLoggedIn = casdoorService.isLoggedIn();
  
  // Routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'login' });
      return;
    }
    
    // Check for admin routes
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      // You'll need to implement this function in your casdoorService
      const isAdmin = casdoorService.isUserAdmin();
      if (!isAdmin) {
        next({ name: 'DashboardHome' });
        return;
      }
    }
  }
  
  // Routes for guests only (like login)
  if (to.matched.some(record => record.meta.guest)) {
    if (isLoggedIn && to.name !== 'callback') {
      next({ name: 'DashboardHome' });
      return;
    }
  }
  
  next();
});

export default router;
