<template>
  <form class="card" @submit.prevent="submit">
    <h2>Register</h2>

    <label>Name
      <input v-model="name" autocomplete="name" />
    </label>
    <p v-if="nameError" class="err">{{ nameError }}</p>

    <label>Email
      <input v-model="email" type="email" autocomplete="email" />
    </label>
    <p v-if="emailError" class="err">{{ emailError }}</p>

    <label>Password
      <input v-model="password" type="password" autocomplete="new-password" />
    </label>
    <p v-if="passwordError" class="err">{{ passwordError }}</p>

    <label>Confirm Password
      <input v-model="confirm" type="password" autocomplete="new-password" />
    </label>
    <p v-if="confirmError" class="err">{{ confirmError }}</p>

    <label>Role
      <select v-model="role">
        <option>User</option>
        <option>Admin</option>
      </select>
    </label>

    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Creating...' : 'Create account' }}
    </button>

    <p v-if="serverError" class="err">{{ serverError }}</p>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth' 

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const role = ref('User')
const serverError = ref('')
const submitting = ref(false)

const nameError = computed(() => (!name.value ? 'Name is required.' : ''))
const emailError = computed(() => {
  if (!email.value) return 'Email is required.'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value) ? '' : 'Please enter a valid email.'
})
const passwordError = computed(() => {
  if (!password.value) return 'Password is required.'
  return password.value.length < 6 ? 'Password must be at least 6 characters.' : ''
})
const confirmError = computed(() => (password.value !== confirm.value ? 'Passwords do not match.' : ''))

async function submit () {
  serverError.value = ''
  if (nameError.value || emailError.value || passwordError.value || confirmError.value) return
  submitting.value = true
  try {
    await auth.registerEmail(name.value, email.value, password.value)

    router.push('/dashboard')
  } catch (e) {
    serverError.value = e?.message ?? String(e)
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