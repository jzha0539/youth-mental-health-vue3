<template>
  <div class="page">
    <h1>Youth Mental Health</h1>

    <section class="grid grid-2">
      <!-- Mood -->
      <div class="card">
        <h2 style="margin-top:0">Mood Tracker</h2>
        <div class="nav">
          <button
            v-for="m in moods"
            :key="m"
            class="btn"
            :class="{ 'btn-primary': mood === m }"
            @click="mood = m"
          >
            {{ m }}
          </button>
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

        <p class="badge" style="margin-top:0.5rem">
          Goal: 8h sleep, 30m exercise, &lt; 6h screen
        </p>
      </div>

      <!-- Recos -->
      <div class="card" style="grid-column:1 / -1">
        <h2 style="margin-top:0">Recommendations</h2>
        <ul>
          <li v-for="rec in recos" :key="rec" v-text="rec"></li>
        </ul>
        <RouterLink class="btn" to="/resources">Explore Learn resources</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'

const moods = ['🙂', '😐', '😟', '😣', '😄']

const mood = ref(localStorage.getItem('ymh_mood') || '')
const sleep = ref(Number(localStorage.getItem('ymh_sleep') || 0))
const exercise = ref(Number(localStorage.getItem('ymh_ex') || 0))
const screen = ref(Number(localStorage.getItem('ymh_screen') || 0))

watch(mood, v => localStorage.setItem('ymh_mood', v))
watch(sleep, v => localStorage.setItem('ymh_sleep', String(v)))
watch(exercise, v => localStorage.setItem('ymh_ex', String(v)))
watch(screen, v => localStorage.setItem('ymh_screen', String(v)))

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
.nav { display:flex; gap:8px; flex-wrap:wrap; margin:.5rem 0 .25rem; }

.label {
  display:block;
  margin-top:10px;
  margin-bottom:6px;
  font-size:12px;
  color: var(--muted, #6b7280);
}

.badge{
  display:inline-block;
  padding:4px 10px;
  border-radius:9999px;
  background:#f3f4f6;
  color:#374151;
  border:1px solid var(--line, #e5e7eb);
  font-size:12px;
}
</style>