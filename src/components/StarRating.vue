<template>
  <div style="display:flex;align-items:center;gap:4px">
    <button v-for="n in 5" :key="n" class="btn" :style="{padding:'0.2rem 0.5rem'}" @click="$emit('update:modelValue', n)">
      <span>{{ n <= modelValue ? '★' : '☆' }}</span>
    </button>
    <span class="badge" v-if="modelValue">{{ modelValue }}/5</span>
  </div>
</template>
<script setup>
defineProps({ modelValue: { type: Number, default: 0 } })
defineEmits(['update:modelValue'])
</script>
