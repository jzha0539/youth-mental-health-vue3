<template>
  <section>
    <h2 style="margin-top:0">Learn Resources</h2>
    <div class="grid cols-3">
      <article v-for="r in resources" :key="r.id" class="card">
        <h3 style="margin:.2rem 0">{{ r.title }}</h3>
        <p class="badge">{{ r.category }} • {{ r.type }}</p>
        <p>{{ r.summary }}</p>
        <ReviewSection :resource-id="r.id" />
      </article>
    </div>
  </section>
</template>
<script setup>
import { resources } from '../data/resources'
import ReviewSection from '../components/ReviewSection.vue'
</script>
