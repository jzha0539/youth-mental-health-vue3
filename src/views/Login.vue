<template>
  <section class="card" style="max-width:560px;margin:auto">
    <h2>Login</h2>
    <form @submit.prevent="submit" class="grid">
      <div>
        <label class="label">Email</label>
        <input class="input" v-model.trim="email" type="email" placeholder="you@example.com" />
        <div class="error" v-if="emailError">{{ emailError }}</div>
      </div>
      <div>
        <label class="label">Password</label>
        <input class="input" v-model="password" type="password" placeholder="••••••••" minlength="6" />
        <div class="error" v-if="passwordError">{{ passwordError }}</div>
      </div>
      <button class="btn primary">Login</button>
      <div class="error" v-if="serverError">{{ serverError }}</div>
    </form>
  </section>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const serverError = ref('')
const emailError = computed(() => {
  if (!email.value) return 'Email is required.'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email.value)) return 'Please enter a valid email.'
  return ''
})
const passwordError = computed(() => {
  if (!password.value) return 'Password is required.'
  if (password.value.length < 6) return 'Password must be at least 6 characters.'
  return ''
})
async function submit(){
  serverError.value = ''
  if (emailError.value || passwordError.value) return
  try{
    auth.login({ email: email.value, password: password.value })
    router.push(route.query.redirect || '/dashboard')
  }catch(e){ serverError.value = e.message }
}
</script>
