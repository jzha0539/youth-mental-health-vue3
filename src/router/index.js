import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Resources from '../views/Resources.vue'
import Counselor from '../views/Counselor.vue'
import GetHelp from '../views/GetHelp.vue'
import ContactCounselor from '../views/ContactCounselor.vue'
import { useAuthStore } from '../stores/auth'
const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/resources', name: 'resources', component: Resources },
  { path: '/get-help', name: 'gethelp', component: GetHelp },
  { path: '/counselor', name: 'counselor', component: Counselor, meta: { requiresAuth: true, roles: ['counselor','admin'] } },
  { path: '/contact', name: 'ContactCounselor', component: ContactCounselor, meta: { requiresAuth: true } },
]
const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.user) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) return { name: 'home' }
})
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const needAuth = Boolean(to.meta.requiresAuth)
  if (needAuth && !auth.user) return next('/login')
  next()
})
export default router
