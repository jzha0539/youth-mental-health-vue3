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

    <!-- History (Interactive Table) -->
    <div class="card" style="grid-column:1/-1">
      <div class="row">
        <h2 style="margin:0">Last 7 days</h2>
        <div class="spacer"></div>
        <button class="btn outline" @click="exportHistoryCSV">Export CSV</button>
        <button class="btn" style="margin-left:8px" @click="exportHistoryPDF">Export PDF</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input v-model="searchAll" placeholder="Search all columns..." />
        <input v-model="filterDate" placeholder="Filter date (YYYY-MM-DD)..." />
        <select v-model="filterMood">
          <option value="">All moods</option>
          <option v-for="m in moods" :key="'f-'+m" :value="m">{{ m }}</option>
        </select>
        <div class="range">
          <label>Sleep</label>
          <input v-model.number="sleepMin" type="number" min="0" placeholder="min" />
          <span>–</span>
          <input v-model.number="sleepMax" type="number" min="0" placeholder="max" />
          <span>h</span>
        </div>
        <div class="range">
          <label>Exercise</label>
          <input v-model.number="exMin" type="number" min="0" placeholder="min" />
          <span>–</span>
          <input v-model.number="exMax" type="number" min="0" placeholder="max" />
          <span>min</span>
        </div>
        <div class="range">
          <label>Screen</label>
          <input v-model.number="scrMin" type="number" min="0" placeholder="min" />
          <span>–</span>
          <input v-model.number="scrMax" type="number" min="0" placeholder="max" />
          <span>h</span>
        </div>
        <button class="btn" @click="resetFilters">Reset</button>
      </div>

      <!-- EasyDataTable -->
      <EasyDataTable
        :headers="headers"
        :items="filteredRows"
        :rows-per-page="10"
        :sort-by="['date']"
        :sort-type="['desc']"
        show-index
      />
      <div class="muted" style="margin-top:6px">Tip: click a column header to sort.</div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

import { useAuthStore } from '@/stores/auth'
import { loadToday, saveToday, loadLastNDays } from '@/api/profile'
import { exportCSV, exportPDF } from '@/utils/export'

const moods = ['🙂','😐','😟','😣','😄']
const MOOD_LABEL = {
  '😄': 'Great',
  '🙂': 'Good',
  '😐': 'Neutral',
  '😟': 'Worried',
  '😣': 'Stressed',
}
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

const headers = [
  { text:'Date',      value:'date',     sortable:true },
  { text:'Mood',      value:'mood',     sortable:true },
  { text:'Sleep (h)', value:'sleep',    sortable:true },
  { text:'Exercise',  value:'exercise', sortable:true },
  { text:'Screen (h)',value:'screen',   sortable:true },
]

const tableRows = computed(() =>
  (history.value || []).map(d => ({
    date: d.day,
    mood: d.mood || '',
    sleep: Number(d.sleep ?? 0),
    exercise: Number(d.exercise ?? 0),
    screen: Number(d.screen ?? 0),
  }))
)

const searchAll  = ref('')
const filterDate = ref('')
const filterMood = ref('')
const sleepMin   = ref()
const sleepMax   = ref()
const exMin      = ref()
const exMax      = ref()
const scrMin     = ref()
const scrMax     = ref()

function inRange(v, min, max) {
  if (min !== undefined && min !== null && min !== '' && v < Number(min)) return false
  if (max !== undefined && max !== null && max !== '' && v > Number(max)) return false
  return true
}

const filteredRows = computed(() => {
  const all = tableRows.value
  return all.filter(r => {
    if (searchAll.value) {
      const s = searchAll.value.toLowerCase()
      const joined = `${r.date} ${r.mood} ${r.sleep} ${r.exercise} ${r.screen}`.toLowerCase()
      if (!joined.includes(s)) return false
    }
    if (filterDate.value && !String(r.date).includes(filterDate.value)) return false
    if (filterMood.value && r.mood !== filterMood.value) return false
    if (!inRange(r.sleep,    sleepMin.value, sleepMax.value)) return false
    if (!inRange(r.exercise, exMin.value,    exMax.value))    return false
    if (!inRange(r.screen,   scrMin.value,   scrMax.value))    return false
    return true
  })
})

function resetFilters() {
  searchAll.value = ''
  filterDate.value = ''
  filterMood.value = ''
  sleepMin.value = sleepMax.value = undefined
  exMin.value = exMax.value = undefined
  scrMin.value = scrMax.value = undefined
}

const pdfColumns = [
  { header:'Date', dataKey:'date' },
  { header:'Mood', dataKey:'mood' },
  { header:'Sleep (h)', dataKey:'sleep' },
  { header:'Exercise (min)', dataKey:'exercise' },
  { header:'Screen (h)', dataKey:'screen' },
]

function exportHistoryCSV() {
  const rows = filteredRows.value.map(r => ({ ...r, mood: MOOD_LABEL[r.mood] || r.mood }))
  exportCSV(rows, 'history_7days')
}

function exportHistoryPDF() {
  const rows = filteredRows.value.map(r => ({ ...r, mood: MOOD_LABEL[r.mood] || r.mood }))
  exportPDF(
    rows,
    [
      { header: 'Date', dataKey: 'date' },
      { header: 'Mood', dataKey: 'mood' },
      { header: 'Sleep (h)', dataKey: 'sleep' },
      { header: 'Exercise (min)', dataKey: 'exercise' },
      { header: 'Screen (h)', dataKey: 'screen' },
    ],
    'history_7days'
  )
}
</script>

<style scoped>
.table{ width:100%; border-collapse: collapse; }
.table th,.table td{ border-bottom:1px solid #eee; padding:8px 10px; text-align:left; }
.muted{ color:#888; }

.row{ display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.spacer{ flex:1; }

.filters{
  display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 12px;
}
.filters input, .filters select{
  padding:8px 10px; border:1px solid #d0d5dd; border-radius:8px; min-width: 180px;
}
.range{
  display:flex; align-items:center; gap:6px; padding:6px 8px;
  border:1px dashed #e5e7eb; border-radius:8px;
}
.range label{ font-size:12px; color:#555; }

.btn.outline{
  background:#fff; color:#1f2937; border:1px solid #cbd5e1;
}
.btn.outline:hover{ background:#f8fafc; }
</style>