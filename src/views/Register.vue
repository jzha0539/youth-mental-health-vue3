<template>
  <form class="card" @submit.prevent="submit">
    <h2>Register</h2>

    <label>Name
      <input v-model="form.name" autocomplete="name" />
    </label>
    <p v-if="nameError" class="err">{{ nameError }}</p>

    <label>Email
      <input v-model="form.email" type="email" autocomplete="email" />
    </label>
    <p v-if="emailError" class="err">{{ emailError }}</p>

    <label>Password
      <input v-model="form.password" type="password" autocomplete="new-password" />
    </label>
    <p v-if="passwordError" class="err">{{ passwordError }}</p>

    <label>Confirm Password
      <input v-model="form.confirm" type="password" autocomplete="new-password" />
    </label>
    <p v-if="confirmError" class="err">{{ confirmError }}</p>

    <label>Role
      <select v-model="form.role">
        <option value="student">Student</option>
        <option value="counselor">Counselor</option>
        <option value="admin">Admin</option>
      </select>
    </label>

    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Creating...' : 'Create account' }}
    </button>

    <p v-if="serverError" class="err" style="margin-top:6px">{{ serverError }}</p>
  </form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
  role: 'student', 
})

const submitting = ref(false)
const serverError = ref('')

const nameError = computed(() => (!form.name ? 'Name is required.' : ''))
const emailError = computed(() => {
  if (!form.email) return 'Email is required.'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(form.email) ? '' : 'Please enter a valid email.'
})
const passwordError = computed(() => {
  if (!form.password) return 'Password is required.'
  return form.password.length < 6 ? 'Password must be at least 6 characters.' : ''
})
const confirmError = computed(() =>
  form.password !== form.confirm ? 'Passwords do not match.' : ''
)

async function submit() {
  serverError.value = ''
 
  if (nameError.value || emailError.value || passwordError.value || confirmError.value) {
    serverError.value = 'Please fix the errors above.'
    return
  }

  try {
    submitting.value = true
    await store.register({
      email: form.email,
      password: form.password,
      displayName: form.name,
      role: String(form.role || '').toLowerCase(), 
    })
    router.push('/dashboard')
  } catch (e) {
    serverError.value = (e && e.message) || String(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.card { max-width: 640px; margin: 32px auto; display: grid; gap: 8px; }
label { display: grid; gap: 4px; font-weight: 600; }
input, select { padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 8px; }
button { margin-top: 8px; padding: 10px 14px; border: 0; border-radius: 8px; background:#2563eb; color:#fff; font-weight:600; cursor:pointer; }
button[disabled] { opacity: .6; cursor: not-allowed; }
.err { color:#b42318; font-size: 13px; margin: 0; }
</style>