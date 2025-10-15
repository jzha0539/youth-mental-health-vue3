<template>
  <div>
    <header class="container header">
      <h1 style="margin:0">🧠 Youth Mental Health</h1>
      <nav class="nav">
        <RouterLink class="btn" to="/">Home</RouterLink>
        <RouterLink class="btn" to="/resources">Learn</RouterLink>

        <RouterLink v-if="isAuthed" class="btn" to="/dashboard">Dashboard</RouterLink>
        <RouterLink v-if="isAuthed" class="btn" to="/contact">Contact</RouterLink>

        <RouterLink v-if="isCounselor" class="btn" to="/counselor">Counselor</RouterLink>

        <RouterLink class="btn" to="/get-help">Get Help</RouterLink>

        <RouterLink v-if="!isAuthed" class="btn" to="/login">Login</RouterLink>
        <RouterLink v-if="!isAuthed" class="btn" to="/register">Register</RouterLink>
        <button v-if="isAuthed" class="btn" @click="logout">Logout</button>
      </nav>
    </header>

    <main class="container">
      <RouterView />
    </main>

    <footer class="container">
      © 2025 Youth Mental Health & Wellbeing Hub — Crisis support: 000 (AU) or Lifeline 13 11 14
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()

const isAuthed = computed(() => !!auth.user)
const isCounselor = computed(() => auth.user?.role === 'counselor' || auth.user?.role === 'admin')

const logout = async () => {
  await auth.logout()
  router.push('/')
}
</script>