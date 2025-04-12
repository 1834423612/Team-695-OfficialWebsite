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
      next({ name: 'login' });
      return;
    }
    
    // 增强的token有效性验证 - 使用团队API
    try {
      // 使用团队API验证
      const validationResult = await casdoorService.validateWithTeamApi();
      
      if (!validationResult.valid) {
        console.warn('Team API indicates token is invalid during navigation');
        // 尝试刷新令牌
        try {
          await casdoorService.refreshAccessToken();
          // 刷新后再次验证
          const refreshedResult = await casdoorService.validateWithTeamApi();
          if (!refreshedResult.valid) {
            // 刷新后仍然无效
            console.error('Token remains invalid after refresh during navigation');
            await casdoorService.logout();
            next({ name: 'login', query: { redirect: to.fullPath, reason: 'invalid-token' } });
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed during navigation:', refreshError);
          next({ name: 'login', query: { redirect: to.fullPath, reason: 'invalid-token' } });
          return;
        }
      }
      
      // 验证后的管理员状态
      if (validationResult.isAdmin) {
        // 标记为管理员进行缓存
        localStorage.setItem('is_admin_validated', 'true');
      }
    } catch (error) {
      console.error('Error validating token with Team API:', error);
      
      // 降级到本地验证
      const isValid = await casdoorService.isTokenValid();
      if (!isValid) {
        console.warn('Local validation indicates token is invalid');
        next({ name: 'login' });
        return;
      }
    }
    
    // 获取用户存储
    const userStore = useUserStore();
    
    // 确保用户信息已加载
    if (!userStore.userInfo) {
      try {
        await userStore.initializeStore();
      } catch (error) {
        console.error('Failed to initialize user store during navigation:', error);
        // 如果出现认证错误，重定向到登录
        if (error instanceof Error && 
            (error.message.includes('Authentication') || 
             error.message.includes('Unauthorized') || 
             error.message.includes('token'))) {
          next({ name: 'login' });
          return;
        }
      }
    }
    
    // 检查管理员路由
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      // 优先使用团队API的管理员状态
      const useValidatedAdmin = localStorage.getItem('is_admin_validated') === 'true';
      
      let isAdmin;
      if (useValidatedAdmin) {
        isAdmin = true;
      } else {
        try {
          // 重新验证以确认管理员状态
          const validationResult = await casdoorService.validateWithTeamApi();
          isAdmin = validationResult.isAdmin || userStore.isAdmin || casdoorService.isUserAdmin();
          
          // 缓存结果
          if (validationResult.isAdmin) {
            localStorage.setItem('is_admin_validated', 'true');
          }
        } catch (error) {
          // 降级到本地验证
          isAdmin = userStore.isAdmin || casdoorService.isUserAdmin();
        }
      }
      
      if (!isAdmin) {
        console.warn('User is not an admin, redirecting to dashboard home');
        next({ name: 'DashboardHome' });
        return;
      }
    }
  }
  
  // 仅限游客的路由（如登录页）
  if (to.matched.some(record => record.meta.guest)) {
    if (isLoggedIn && to.name !== 'callback') {
      // 即使是guest路由，也要验证token有效性
      try {
        const isValid = await casdoorService.isTokenValid();
        if (isValid) {
          next({ name: 'DashboardHome' });
          return;
        }
        // 如果token无效，继续访问guest路由
      } catch (error) {
        // 忽略错误，继续访问guest路由
        console.warn('Token validation failed on guest route:', error);
      }
    }
  }
  
  next();
});

export default router;
