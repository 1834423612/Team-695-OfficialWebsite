// Import vue-router dependencies 
import { createRouter, createWebHistory } from 'vue-router';
import NotFound from '../components/404NotFound.vue';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
// import Mentors from '../views/Mentors.vue';
import mentorsData from "../components/Mentor/info.json";
import MentorDetail from '../views/MentorDetail.vue';
import Members from '../views/Members.vue';
import Robots from '../views/Robots.vue';
import News from '../views/News.vue';
import Sponsors from '../views/Sponsors.vue';
import Resources from '../views/Resources.vue';
import Contact from '@/views/Contact.vue';

// Define the routes 
// A route is an object that contains the path and the component that should be rendered when the path is matched
// The path is the URL that the user will navigate to
// The component is the Vue component that should be rendered when the path is matched
// Example: https://example.com/[path] [path] -> [component]
const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: '404NotFound',
    component: NotFound
  },
  { path: '/', component: Home },
  { path: '/about', component: About },
  // { path: '/mentors', component: Mentors },
  // { path: '/mentors/:id', component: Mentors },
  {
    path: '/mentors/:name',
    component: MentorDetail,
    props: (route: { params: { name: string; }; }) => {
      const mentorName = route.params.name.replace(/-/g, ' '); // Use '-' in the URL
      const mentor = mentorsData.find((m: { name: string; }) => m.name === mentorName);
      return { mentor };
    }
  },
  { path: '/members', component: Members },
  { path: '/robots', component: Robots },
  { path: '/news', component: News },
  { path: '/sponsors', component: Sponsors },
  { path: '/resources', component: Resources },
  { path: '/contact', component: Contact },
];

// Create a new router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
