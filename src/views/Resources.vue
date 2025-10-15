<template>
  <section>
    <header class="header">
      <h2>Learn Resources</h2>

      <div class="seg">
        <button
          type="button"
          class="seg-btn"
          :class="{ active: mode === 'cards' }"
          @click="mode = 'cards'"
        >
          Cards
        </button>
        <button
          type="button"
          class="seg-btn"
          :class="{ active: mode === 'table' }"
          @click="mode = 'table'"
        >
          Table
        </button>
      </div>
    </header>

    <div v-show="mode === 'cards'" class="grid cols-3">
      <article v-for="r in resources" :key="r.id" class="card">
        <h3 style="margin:.2rem 0">{{ r.title }}</h3>
        <p class="badge">{{ r.category }} • {{ r.type }}</p>
        <p>{{ r.summary }}</p>
        <ReviewSection :resource-id="r.id" />
      </article>
    </div>

    <div v-show="mode === 'table'" class="card" style="margin-top:16px">
      <ResourcesTable />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

import { resources } from '@/data/resources'
import ReviewSection from '@/components/ReviewSection.vue'
import ResourcesTable from '@/views/ResourcesTable.vue'

const mode = ref('cards') // 'cards' | 'table'
</script>

<style scoped>
.header{
  display:flex; align-items:center; justify-content:space-between;
  margin: 0 0 12px 0;
}
.grid{ display:grid; gap:16px; }
.cols-3{ grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.card{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; box-shadow:0 1px 2px rgba(0,0,0,.04) }
.badge{ display:inline-block; padding:4px 8px; font-size:12px; color:#334155; background:#eef2ff; border-radius:999px }

.seg{ display:inline-flex; gap:6px; background:#f1f5f9; padding:4px; border-radius:999px; }
.seg-btn{
  padding:6px 10px; border:0; border-radius:999px; background:transparent; cursor:pointer;
  font-weight:600; color:#334155;
}
.seg-btn.active{ background:#2563eb; color:#fff; }
</style>