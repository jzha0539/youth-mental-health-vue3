<template>
  <section class="card" style="max-width:720px;margin:auto">
    <h2>Register</h2>
    <form @submit.prevent="submit" class="grid cols-2">
      <div>
        <label class="label">Name</label>
        <input class="input" v-model.trim="name" placeholder="Your name" />
        <div class="error" v-if="nameError">{{ nameError }}</div>
      </div>
      <div>
        <label class="label">Email</label>
        <input class="input" v-model.trim="email" type="email" placeholder="you@example.com" />
        <div class="error" v-if="emailError">{{ emailError }}</div>
      </div>
      <div>
        <label class="label">Password</label>
        <input class="input" v-model="password" type="password" placeholder="min 6 chars" />
        <div class="error" v-if="passwordError">{{ passwordError }}</div>
      </div>
      <div>
        <label class="label">Confirm Password</label>
        <input class="input" v-model="confirm" type="password" placeholder="re-enter password" />
        <div class="error" v-if="confirmError">{{ confirmError }}</div>
      </div>
      <div>
        <label class="label">Role</label>
        <select class="input" v-model="role">
          <option value="user">User</option>
          <option value="counselor">Counselor</option>
        </select>
      </div>
      <div style="align-self:end"><button class="btn primary">Create account</button></div>
      <div class="error" v-if="serverError">{{ serverError }}</div>
    </form>
  </section>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const role = ref('user')
const serverError = ref('')
const auth = useAuthStore()
const router = useRouter()
const nameError = computed(() => !name.value ? 'Name is required.' : '')
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
const confirmError = computed(() => password.value !== confirm.value ? 'Passwords do not match.' : '')
async function submit(){
  serverError.value = ''
  if (nameError.value || emailError.value || passwordError.value || confirmError.value) return
  try{
    auth.register({ name: name.value, email: email.value, password: password.value, role: role.value })
    auth.login({ email: email.value, password: password.value })
    router.push('/dashboard')
  }catch(e){ serverError.value = e.message }
}
</script>
