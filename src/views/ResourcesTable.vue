<script setup lang="ts">
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { ref, computed } from 'vue'
import { exportCSV, exportPDF } from '@/utils/export'

const rows = ref([
  { title:'Mindfulness Basics', type:'article', level:'Beginner', minutes:6 },
  { title:'Study Stress Video', type:'video', level:'All', minutes:6 },
  { title:'Breathing Module', type:'module', level:'Beginner', minutes:8 },
])

const search = ref('')
const colSearch = ref({ type:'', level:'' })
const headers = [
  { text:'Title', value:'title', sortable:true },
  { text:'Type', value:'type', sortable:true },
  { text:'Level', value:'level', sortable:true },
  { text:'Minutes', value:'minutes', sortable:true },
]

const filtered = computed(() =>
  rows.value.filter(r =>
    (search.value ? JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase()) : true) &&
    (colSearch.value.type ? r.type.includes(colSearch.value.type) : true) &&
    (colSearch.value.level ? r.level.includes(colSearch.value.level) : true)
  )
)

function doExportCSV() { exportCSV(filtered.value, 'resources.csv') }
function doExportPDF() {
  exportPDF(filtered.value, [
    { header:'Title', dataKey:'title' },
    { header:'Type', dataKey:'type' },
    { header:'Level', dataKey:'level' },
    { header:'Minutes', dataKey:'minutes' },
  ], 'resources.pdf')
}
</script>

<template>
  <h1>Learn Resources</h1>
  <div class="filters">
    <input v-model="search" placeholder="Search all..." />
    <input v-model="colSearch.type" placeholder="Filter type..." />
    <input v-model="colSearch.level" placeholder="Filter level..." />
    <button @click="doExportCSV">Export CSV</button>
    <button @click="doExportPDF">Export PDF</button>
  </div>
  <EasyDataTable :headers="headers" :items="filtered" :rows-per-page="10" show-index />
</template>