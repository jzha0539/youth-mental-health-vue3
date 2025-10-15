<template>
  <section class="grid cols-2">
    <!-- Mood -->
    <div class="card">
      <h2 style="margin-top:0">Mood Tracker</h2>
      <div class="nav">
        <button
          v-for="m in moods"
          :key="m"
          class="btn"
          :class="{primary: mood===m}"
          @click="mood=m"
        >{{ m }}</button>
      </div>
      <p class="badge" style="margin-top:0.5rem">Today: {{ mood || 'Not set' }}</p>
    </div>

    <!-- Habit -->
    <div class="card">
      <h2 style="margin-top:0">Habit Tracker</h2>
      <label class="label">Sleep (hrs)</label>
      <input class="input" type="number" v-model.number="sleep" min="0" max="14" />
      <label class="label">Exercise (mins)</label>
      <input class="input" type="number" v-model.number="exercise" min="0" max="300" />
      <label class="label">Screen Time (hrs)</label>
      <input class="input" type="number" v-model.number="screen" min="0" max="16" />
      <p class="badge" style="margin-top:0.5rem">Goal: 8h sleep, 30m exercise, &lt; 6h screen</p>
    </div>

    <!-- Recos -->
    <div class="card" style="grid-column:1/-1">
      <h2 style="margin-top:0">Recommendations</h2>
      <ul><li v-for="rec in recos" :key="rec" v-text="rec"></li></ul>
      <RouterLink class="btn" to="/resources">Explore Learn resources</RouterLink>
    </div>

    <!-- History -->
    <div class="card" style="grid-column:1/-1">
      <h2 style="margin-top:0">Last 7 days</h2>
      <div v-if="history.length===0" class="muted">No history yet.</div>
      <table v-else class="table">
        <thead>
          <tr><th style="width:120px">Date</th><th>Mood</th><th>Sleep</th><th>Exercise</th><th>Screen</th></tr>
        </thead>
        <tbody>
          <tr v-for="d in history" :key="d.day">
            <td>{{ d.day }}</td>
            <td>{{ d.mood || '-' }}</td>
            <td>{{ d.sleep ?? '-' }} h</td>
            <td>{{ d.exercise ?? '-' }} min</td>
            <td>{{ d.screen ?? '-' }} h</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { loadToday, saveToday, loadLastNDays } from '@/api/profile'

const moods = ['🙂','😐','😟','😣','😄']

const mood     = ref('')
const sleep    = ref(0)
const exercise = ref(0)
const screen   = ref(0)
const history  = ref([])

const auth = useAuthStore()

let t = null
function debouncedSave() {
  clearTimeout(t)
  t = setTimeout(persistToday, 500)
}

async function persistToday() {
  if (!auth.user?.uid) return
  await saveToday(auth.user.uid, {
    mood: mood.value || null,
    sleep: Number.isFinite(sleep.value) ? sleep.value : null,
    exercise: Number.isFinite(exercise.value) ? exercise.value : null,
    screen: Number.isFinite(screen.value) ? screen.value : null,
  })

  history.value = await loadLastNDays(auth.user.uid, 7)
}

onMounted(async () => {

  if (!auth.user?.uid) {
    const stop = watch(() => auth.user?.uid, async (v) => {
      if (v) {
        stop()
        await bootstrap()
      }
    }, { immediate: true })
  } else {
    await bootstrap()
  }
})

async function bootstrap() {
  const today = await loadToday(auth.user.uid)
  if (today) {
    mood.value     = today.mood || ''
    sleep.value    = Number(today.sleep ?? 0)
    exercise.value = Number(today.exercise ?? 0)
    screen.value   = Number(today.screen ?? 0)
  }
  history.value = await loadLastNDays(auth.user.uid, 7)
}

watch([mood, sleep, exercise, screen], debouncedSave)

const recos = computed(() => {
  const out = []
  if (sleep.value < 7) out.push('Try a guided sleep routine tonight (10 minutes).')
  if (exercise.value < 30) out.push('Take a short walk: 3x10 minutes today.')
  if (screen.value > 6) out.push('Use focus mode to reduce evening screen time.')
  if (!out.length) out.push('Great job! Explore new skills in Learn.')
  return out
})
</script>

<style scoped>
.table{
  width:100%;
  border-collapse: collapse;
}
.table th,.table td{
  border-bottom:1px solid #eee;
  padding:8px 10px;
  text-align:left;
}
.muted{ color:#888; }
</style>