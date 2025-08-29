import { defineStore } from 'pinia'
const USERS_KEY = 'ymh_users'
const SESSION_KEY = 'ymh_session'
function loadUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY))||[] }catch{ return [] } }
function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)) }
export const useAuthStore = defineStore('auth', {
  state: () => ({ user: JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }),
  actions: {
    register({ name, email, password, role }){
      const users = loadUsers()
      if (users.find(u => u.email === email)) throw new Error('Email already registered.')
      const newUser = { id: Date.now(), name, email, passwordHash: btoa(password), role }
      users.push(newUser); saveUsers(users); return true
    },
    login({ email, password }){
      const users = loadUsers()
      const u = users.find(u => u.email === email && u.passwordHash === btoa(password))
      if (!u) throw new Error('Invalid email or password.')
      const sessionUser = { id: u.id, name: u.name, email: u.email, role: u.role }
      this.user = sessionUser; localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser)); return true
    },
    logout(){ this.user = null; localStorage.removeItem(SESSION_KEY) }
  }
})
