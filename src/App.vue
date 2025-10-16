<template>
  <div>
    <a
      href="#main"
      class="skip-link"
      @click.stop.prevent="jumpToMain"
      @keydown.enter.stop.prevent="jumpToMain"
    >
      Skip to main content
    </a>

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

    <main id="main" ref="mainRef" class="container" tabindex="-1" role="main">
      <RouterView />
    </main>

    <footer class="container">
      © 2025 Youth Mental Health & Wellbeing Hub — Crisis support: 000 (AU) or Lifeline 13 11 14
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route  = useRoute()

const isAuthed = computed(() => !!auth.user)
const isCounselor = computed(() => auth.user?.role === 'counselor' || auth.user?.role === 'admin')

const logout = async () => {
  await auth.logout()
  router.push('/')
}

const mainRef = ref(null)

function preferReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
}

function focusAndScrollMain({ updateHash = true } = {}) {
  const el = mainRef.value || document.getElementById('main')
  if (!el) return

  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')

  try { el.focus({ preventScroll: true }) } catch { el.focus() }

  const behavior = preferReducedMotion() ? 'auto' : 'smooth'
  try {
    el.scrollIntoView({ block: 'start', behavior })
  } catch {
    const rect = el.getBoundingClientRect()
    window.scrollTo({ top: window.scrollY + rect.top, behavior })
  }

  if (updateHash) {
    const id = el.id || 'main'
    if (history.replaceState) {
      history.replaceState(null, '', `#${id}`)
    } else {
      location.hash = id
    }
  }
}

function jumpToMain() {
  requestAnimationFrame(() => focusAndScrollMain())
}

onMounted(() => {
  if (location.hash === '#main') {
    nextTick(() => requestAnimationFrame(() => focusAndScrollMain({ updateHash: false })))
  }
})

router.afterEach((to) => {
  if (to.hash === '#main') {
    nextTick(() => requestAnimationFrame(() => focusAndScrollMain({ updateHash: false })))
  }
})
</script>