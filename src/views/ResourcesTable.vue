<script setup lang="ts">
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { ref, computed } from 'vue'
import { exportCSV, exportPDF } from '@/utils/export'

const rows = ref([
  { title:'Mindfulness Basics',    type:'article', level:'Beginner', minutes:6 },
  { title:'Managing Study Stress', type:'video',   level:'All',      minutes:6 },
  { title:'Breathing Module',      type:'module',  level:'Beginner', minutes:8 },
])

const search = ref('')
const colSearch = ref({ type:'', level:'' })

const headers = [
  { text:'Title',   value:'title',   sortable:true },
  { text:'Type',    value:'type',    sortable:true },
  { text:'Level',   value:'level',   sortable:true },
  { text:'Minutes', value:'minutes', sortable:true },
]

const filtered = computed(() =>
  rows.value.filter(r =>
    (search.value ? JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase()) : true) &&
    (colSearch.value.type  ? r.type.toLowerCase().includes(colSearch.value.type.toLowerCase())   : true) &&
    (colSearch.value.level ? r.level.toLowerCase().includes(colSearch.value.level.toLowerCase()) : true)
  )
)

function doExportCSV() {
  exportCSV(filtered.value, 'resources')
}
function doExportPDF() {
  exportPDF(
    filtered.value,
    [
      { header:'Title',   dataKey:'title' },
      { header:'Type',    dataKey:'type' },
      { header:'Level',   dataKey:'level' },
      { header:'Minutes', dataKey:'minutes' },
    ],
    'resources'
  )
}
</script>

<template>
  <section class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
      <h2 style="margin:0">Learn Resources (table)</h2>
      <div style="display:flex; gap:8px">
        <button class="btn" :disabled="filtered.length===0" @click="doExportCSV">Export CSV</button>
        <button class="btn" :disabled="filtered.length===0" @click="doExportPDF">Export PDF</button>
      </div>
    </div>

    <div style="display:flex; gap:8px; margin-bottom:8px">
      <input class="input" v-model="search" placeholder="Search all..." style="width:220px" />
      <input class="input" v-model="colSearch.type"  placeholder="Filter by type..."  style="width:180px" />
      <input class="input" v-model="colSearch.level" placeholder="Filter by level..." style="width:180px" />
    </div>

    <EasyDataTable
      :headers="headers"
      :items="filtered"
      :rows-per-page="10"
      show-index
      table-class-name="edt"
    />
  </section>
</template>

<style scoped>
.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; box-shadow:0 1px 2px rgba(0,0,0,.04) }
.input { padding:8px 10px; border:1px solid #d0d5dd; border-radius:8px; background:#fff; }
.btn { padding:8px 12px; border-radius:8px; background:#2563eb; color:#fff; border:none; cursor:pointer; }
</style>