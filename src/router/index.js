import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Resources from '../views/Resources.vue'
import Counselor from '../views/Counselor.vue'
import GetHelp from '../views/GetHelp.vue'
import ContactCounselor from '../views/ContactCounselor.vue'

import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/resources', name: 'resources', component: Resources },
  { path: '/get-help', name: 'gethelp', component: GetHelp },
  { path: '/counselor', name: 'counselor', component: Counselor, meta: { requiresAuth: true, roles: ['counselor', 'admin'] } },
  { path: '/contact', name: 'ContactCounselor', component: ContactCounselor, meta: { requiresAuth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

let authReady = false
function waitForAuth() {
  if (authReady) return Promise.resolve()
  const auth = getAuth()
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, () => {
      authReady = true
      stop()
      resolve()
    })
  })
}

router.beforeEach(async (to) => {
  await waitForAuth()
  const store = useAuthStore()
  store.init()
  const fbUser = getAuth().currentUser
  if (fbUser && !store.user) {
    await store.fetchProfile(fbUser.uid, fbUser)
  }

  const needAuth = !!to.meta?.requiresAuth
  const isLoggedIn = !!(getAuth().currentUser || store.user)
  if (needAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const allowRoles = to.meta?.roles
  if (allowRoles && isLoggedIn) {
    const role = store.user?.role || 'student'
    if (!allowRoles.includes(role)) {
      return { name: 'home' }
    }
  }

  return true
})

export default router