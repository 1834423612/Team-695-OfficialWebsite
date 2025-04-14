// Import vue-router dependencies 
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { casdoorService } from '@/services/auth';

// Define routes
const routes: Array<RouteRecordRaw> = [
  // 404 route
  {
    path: '/:pathMatch(.*)*',
    name: '404NotFound',
    component: () => import('@/components/NotFound.vue'),
  },
  
  // Public routes
  { 
    path: '/', 
    component: () => import('@/views/Home.vue') 
  },
  { 
    path: '/sponsors', 
    component: () => import('@/views/Sponsors.vue') 
  },
  { 
    path: '/about', 
    component: () => import('@/views/AboutContainerPage.vue') 
  },
  { 
    path: '/members', 
    component: () => import('@/views/AboutContainerPage.vue') 
  },
  { 
    path: '/achievements', 
    component: () => import('@/views/AboutContainerPage.vue') 
  },
  { 
    path: '/gallery', 
    component: () => import('@/views/Gallery.vue') 
  },
  { 
    path: '/resources', 
    component: () => import('@/views/Resources.vue') 
  },
  { 
    path: '/contact', 
    component: () => import('@/views/Contact.vue') 
  },
  { 
    path: '/2025strategy', 
    component: () => import('@/views/strategy/2025chart.vue') 
  },
  { 
    path: '/2025strategy/html', 
    component: () => import('@/views/strategy/2025chart-html.vue') 
  },
  { 
    path: '/legal/PrivacyPolicy', 
    component: () => import('@/views/legal/PrivacyPolicy.vue') 
  },
  { 
    path: '/legal/TermsOfService', 
    component: () => import('@/views/legal/TermsOfService.vue') 
  },
  
  // Authentication routes
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
  
  // Dashboard routes
  {
    path: '/dashboard',
    redirect: () => {
      return casdoorService.isLoggedIn() ? { name: 'DashboardHome' } : { name: 'login' };
    }
  },
  {
    path: '/Dashboard',
    component: () => import('@/views/dashboard/Index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: () => import('@/views/dashboard/HomeView.vue'),
      },
      {
        path: 'Profile',
        name: 'Profile',
        component: () => import('@/views/dashboard/ProfileView.vue'),
      },
      {
        path: 'API',
        name: 'API',
        component: () => import('@/views/dashboard/User/APIView.vue'),
      },
      {
        path: 'Calendar',
        name: 'Calendar',
        component: () => import('@/views/dashboard/CalendarView.vue'),
      },
      {
        path: 'Pit-Scouting',
        name: 'PitScouting',
        component: () => import('@/views/dashboard/PitScouting/PitScoutingView.vue'),
      },
      {
        path: 'Pit-Scouting/Admin',
        name: 'PitScoutingAdmin',
        component: () => import('@/views/dashboard/PitScouting/PitScoutingAdminView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'Assignments',
        name: 'Assignments',
        component: () => import('@/views/dashboard/ScoutingAssignmentView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'System/Version',
        name: 'SystemVersion',
        component: () => import('@/views/dashboard/System/VersionView.vue'),
      }
    ]
  },
  
  // Legacy redirects for backward compatibility
  { 
    path: '/pit-scouting', 
    redirect: '/Dashboard/Pit-Scouting',
    meta: { requiresAuth: true } 
  },
  { 
    path: '/pit-scouting/dashboard', 
    redirect: '/Dashboard/Pit-Scouting/Admin',
    meta: { requiresAuth: true } 
  },
  {
    path: '/User/Profile',
    redirect: '/Dashboard/Profile',
    meta: { requiresAuth: true }
  },
  {
    path: '/User/API',
    redirect: '/Dashboard/API',
    meta: { requiresAuth: true }
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const isLoggedIn = casdoorService.isLoggedIn();
  
  // Check for absolute trust flag
  if (localStorage.getItem('token_absolute_trust') === 'true') {
    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else {
      next();
    }
    return;
  }
  
  // Special handling for callback route
  if (to.name === 'callback') {
    const hasCode = to.query.code;
    
    if (!hasCode && isLoggedIn) {
      next('/Dashboard');
      return;
    }
    
    next();
    return;
  }
  
  // Check for routes requiring authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ 
        name: 'login',
        query: { redirect: to.fullPath }
      });
      return;
    }
    
    // Check for admin-only routes
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      const userStore = await import('@/stores/userStore').then(m => m.useUserStore());
      const userData = userStore.userInfo;
      
      if (!userData?.isAdmin) {
        next('/Dashboard');
        return;
      }
    }
    
    // Defer validation to AuthManager component
    localStorage.setItem('validation_deferred_to_auth_manager', Date.now().toString());
    next();
    return;
  }
  
  // Handle guest-only routes (like login)
  if (to.matched.some(record => record.meta.guest)) {
    if (isLoggedIn && to.name !== 'callback') {
      const redirect = to.query.redirect as string || '/Dashboard';
      next(redirect);
      return;
    }
  }
  
  next();
});

export default router;