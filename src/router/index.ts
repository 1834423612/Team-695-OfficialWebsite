// Import vue-router dependencies 
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import { casdoorService } from '@/services/auth';
// Import the user store
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
router.beforeEach(async (to, from, next) => {
  const isLoggedIn = casdoorService.isLoggedIn();
  
  // 检查绝对信任标记 - 如果存在，跳过所有验证
  if (localStorage.getItem('token_absolute_trust') === 'true' || 
      localStorage.getItem('skip_all_token_validation') === 'true') {
    console.log('Router guard: Absolute trust flag detected, skipping ALL validation');
    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else {
      next();
    }
    return;
  }
  
  // 避免回调循环 - 如果来自callback并前往Dashboard，检查是否有token
  if (from.path.includes('/callback') && to.path.includes('/Dashboard') && isLoggedIn) {
    console.log('Router guard: Skipping validation for post-callback navigation');
    // 设置绝对信任标记，防止后续验证
    localStorage.setItem('token_absolute_trust', 'true');
    next();
    return;
  }
  
  // 特殊处理callback路由
  if (to.name === 'callback') {
    // 检查是否有授权码参数
    const hasCode = to.query.code;
    
    // 如果没有授权码但已登录，直接跳转到Dashboard
    if (!hasCode && isLoggedIn) {
      next('/Dashboard');
      return;
    }
    
    // 正常进入回调页面处理
    next();
    return;
  }
  
  // 需要认证的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ 
        name: 'login',
        query: { redirect: to.fullPath }
      });
      return;
    }
    
    try {
      // 严格禁止重复验证 - 如果在最近10分钟内完成过认证，完全跳过验证
      const callbackTime = localStorage.getItem('auth_callback_completed_time');
      if (callbackTime && Date.now() - parseInt(callbackTime) < 10 * 60 * 1000) {
        console.log('Router guard: Recent auth detected, setting absolute trust flag');
        // 设置绝对信任标记，防止所有验证
        localStorage.setItem('token_absolute_trust', 'true');
        next();
        return;
      }

      // 检查localStorage中是否已有标记表示token有效，避免重复验证
      const lastValidated = localStorage.getItem('last_token_validated_time');
      const now = Date.now();
      
      // 如果最近2分钟内已经验证过，无需重新验证
      if (lastValidated && now - parseInt(lastValidated) < 2 * 60 * 1000) {
        console.log('Router guard: Using recent token validation result (< 2 min)');
        next();
        return;
      }
      
      // 完全跳过token验证，交给AuthManager在组件加载后处理
      // 这避免了路由导航过程中的并发token验证
      console.log('Router guard: Deferring validation to AuthManager component');
      localStorage.setItem('validation_deferred_to_auth_manager', Date.now().toString());
      next();
      return;
    } catch (error) {
      console.error('Router guard: Error during navigation handling:', error);
      // 出现异常时仍然允许导航，让AuthManager组件处理
      next();
      return;
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
