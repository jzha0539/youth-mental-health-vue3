<template>
  <section class="card" :id="'reviews-'+resourceId">
    <h3 style="margin-top:0">Reviews & Ratings</h3>
    <div v-if="!isAuthed" class="error">Please log in to post a review.</div>
    <form @submit.prevent="submitReview" class="grid cols-2" style="align-items:center">
      <div>
        <label class="label">Your Rating</label>
        <StarRating v-model="rating" />
      </div>
      <div>
        <label class="label">Your Comment</label>
        <textarea class="input" rows="3" v-model.trim="comment" :maxlength="300" placeholder="Share how this resource helped you..." />
        <div class="error" v-if="commentError">{{ commentError }}</div>
      </div>
      <div><button class="btn primary" :disabled="!isAuthed">Submit Review</button></div>
    </form>
    <div style="margin-top:1rem">
      <div class="badge" v-if="reviews.length">Average Rating: {{ average.toFixed(2) }}/5 ({{ reviews.length }})</div>
      <div v-else class="badge">No reviews yet</div>
    </div>
    <ul style="list-style:none;padding:0;margin-top:1rem">
      <li v-for="r in reviews" :key="r.id" class="card" style="margin-bottom:0.5rem">
        <div style="display:flex;justify-content:space-between">
          <strong>{{ r.author }}</strong>
          <span>{{ '★'.repeat(r.rating) + '☆'.repeat(5-r.rating) }}</span>
        </div>
        <p v-text="r.safeComment" style="margin:0.25rem 0 0"></p>
      </li>
    </ul>
  </section>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import StarRating from './StarRating.vue'
import { sanitize } from '../utils/sanitize'
const props = defineProps({ resourceId: { type: Number, required: true } })
const key = 'ymh_reviews_' + props.resourceId
const rating = ref(0)
const comment = ref('')
const reviews = ref([])
const auth = useAuthStore()
const isAuthed = computed(() => !!auth.user)
const commentError = computed(() => {
  if (!comment.value) return 'Comment is required.'
  if (comment.value.length < 6) return 'Comment must be at least 6 characters.'
  if (/https?:\/\//i.test(comment.value)) return 'Links are not allowed.'
  return ''
})
function load(){ try{ reviews.value = JSON.parse(localStorage.getItem(key)) || [] }catch{ reviews.value = [] } }
function save(){ localStorage.setItem(key, JSON.stringify(reviews.value)) }
const average = computed(() => reviews.value.length ? reviews.value.reduce((s,r)=>s+r.rating,0)/reviews.value.length : 0)
function submitReview(){
  if (!isAuthed.value) return
  if (rating.value < 1 || rating.value > 5) return
  if (commentError.value) return
  const safeComment = sanitize(comment.value)
  reviews.value.unshift({ id: Date.now(), author: auth.user.name || auth.user.email, rating: rating.value, safeComment })
  save(); rating.value = 0; comment.value = ''
}
onMounted(load)
</script>
