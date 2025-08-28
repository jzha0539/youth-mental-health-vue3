<template>
  <div>
    <header class="container header">
      <h1 style="margin:0">🧠 Youth Mental Health</h1>
      <nav class="nav">
        <RouterLink class="btn" to="/">Home</RouterLink>
        <RouterLink class="btn" to="/resources">Learn</RouterLink>
        <RouterLink class="btn" to="/dashboard" v-if="isAuthed">Dashboard</RouterLink>
        <RouterLink class="btn" to="/counselor" v-if="isCounselor">Counselor</RouterLink>
        <RouterLink class="btn" to="/get-help">Get Help</RouterLink>
        <RouterLink class="btn" to="/login" v-if="!isAuthed">Login</RouterLink>
        <RouterLink class="btn" to="/register" v-if="!isAuthed">Register</RouterLink>
        <button class="btn" v-if="isAuthed" @click="logout">Logout</button>
      </nav>
    </header>
    <main class="container"><RouterView /></main>
    <footer class="container">© 2025 Youth Mental Health & Wellbeing Hub — Crisis support: 000 (AU) or Lifeline 13 11 14</footer>
  </div>
</template>
<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'
const auth = useAuthStore()
const router = useRouter()
const isAuthed = computed(() => !!auth.user)
const isCounselor = computed(() => auth.user?.role === 'counselor' || auth.user?.role === 'admin')
const logout = () => { auth.logout(); router.push('/') }
</script>
