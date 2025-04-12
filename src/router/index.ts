// Import vue-router dependencies 
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import { casdoorService } from '@/services/auth';
// Import the user store
import { useUserStore } from '@/stores/userStore';
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
  // Redirect to the uppercase /Dashboard route
  {
    path: '/dashboard',
    redirect: _to => {
      if (casdoorService.isLoggedIn()) {
        return { name: 'DashboardHome' };
      } else {
        return { name: 'login' };
      }
    },
    meta: { requiresAuth: true }
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
      },
      {
        path: 'Assignments',
        name: 'Assignments',
        component: () => import('@/views/dashboard/ScoutingAssignmentView.vue'),
        meta: { requiresAuth: true }
      },
    ]
  },
  // Keep the old routes for backward compatibility, but redirect to dashboard
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
];

// Create a new router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const isLoggedIn = casdoorService.isLoggedIn();
  
  // 需要认证的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ 
        name: 'login',
        query: { redirect: to.fullPath }
      });
      return;
    }
    
    // 仅做基本令牌格式检查，详细验证留给 AuthManager 组件处理
    // 添加超时保护，确保不会无限期等待
    try {
      // 创建一个带超时的验证Promise
      const validateWithTimeout = Promise.race([
        casdoorService.validateLocalToken(),
        // 添加1秒超时
        new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Token validation timeout')), 1000);
        })
      ]);
      
      // 尝试验证令牌，超时或失败都允许继续导航（AuthManager将处理详细验证）
      const isValid = await validateWithTimeout.catch(error => {
        console.warn('Router guard: Token validation timed out or failed:', error.message);
        return true; // 超时时继续导航，让AuthManager处理
      });

      if (!isValid) {
        console.warn('Router guard: Basic token validation failed');
        next({ 
          name: 'login',
          query: { redirect: to.fullPath, reason: 'invalid-token' }
        });
        return;
      }
    } catch (error) {
      console.error('Router guard: Error during token validation:', error);
      // 出现异常时仍然允许导航，让AuthManager组件处理
    }
    
    // 简单检查 - AuthManager 会负责进一步验证
    const userStore = useUserStore();
    
    // 即使没有用户数据也允许继续到 Dashboard 路由，AuthManager 会处理
    // 如果能够预加载用户信息就更好
    if (!userStore.userInfo && userStore.lastFetchTime === null) {
      try {
        // 尝试初始化，但不阻塞导航
        userStore.initializeStore().catch(err => {
          console.warn('Non-blocking user store initialization failed:', err);
        });
      } catch (error) {
        // 忽略错误，让 AuthManager 处理
        console.warn('Pre-navigation user store init error:', error);
      }
    }
  }
  
  // 仅限游客的路由（如登录页）
  if (to.matched.some(record => record.meta.guest)) {
    if (isLoggedIn && to.name !== 'callback') {
      // 如果已登录，尝试跳转到 Dashboard 或请求的 redirect 参数
      const redirect = to.query.redirect as string || '/Dashboard';
      next(redirect);
      return;
    }
  }
  
  next();
});

export default router;
