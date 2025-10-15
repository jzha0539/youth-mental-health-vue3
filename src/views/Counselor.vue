<template>
  <section class="card">
    <h2 style="margin:0">Counselor Workspace</h2>
    <p>This page is restricted to users with the <b>counselor</b> role.</p>
    <ul>
      <li>Review aggregated ratings and feedback trends.</li>
      <li>Post announcements to the Connect forum (future work).</li>
    </ul>
    <p class="badge">Role-based access controlled via router guard.</p>
  </section>

  <section v-if="isAdmin" class="card" style="margin-top:16px">
    <div class="header-row">
      <div>
        <h3 style="margin:0">Admin · Manage User Roles</h3>
        <p class="muted">Change a user's role (student / counselor / admin).</p>
      </div>
      <div class="tools">
        <input
          v-model="q"
          class="input"
          placeholder="Search name/email…"
          @keydown.enter.prevent
        />
        <select v-model="roleFilter" class="input">
          <option value="">All roles</option>
          <option value="student">student</option>
          <option value="counselor">counselor</option>
          <option value="admin">admin</option>
        </select>
        <button class="btn secondary" @click="resetFilters">Reset</button>
      </div>
    </div>

    <div v-if="loading">Loading users…</div>

    <template v-else>
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th @click="setSort('displayName')" :aria-sort="ariaSort('displayName')">
                Name
                <span class="sort" :class="sortIndicator('displayName')"></span>
              </th>
              <th @click="setSort('email')" :aria-sort="ariaSort('email')">
                Email
                <span class="sort" :class="sortIndicator('email')"></span>
              </th>
              <th @click="setSort('role')" :aria-sort="ariaSort('role')" style="width:140px">
                Role
                <span class="sort" :class="sortIndicator('role')"></span>
              </th>
              <th @click="setSort('createdAtMs')" :aria-sort="ariaSort('createdAtMs')" style="width:160px">
                Created
                <span class="sort" :class="sortIndicator('createdAtMs')"></span>
              </th>
              <th style="width:90px"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="u in pageRows" :key="u.uid">
              <td>{{ u.displayName || '—' }}</td>
              <td class="mono">{{ u.email }}</td>
              <td>
                <select v-model="u._role" class="input">
                  <option value="student">student</option>
                  <option value="counselor">counselor</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td class="mono">{{ fmtDate(u.createdAtMs) }}</td>
              <td>
                <button
                  class="btn"
                  @click="save(u)"
                  :disabled="u._saving || u._role === u.role"
                >
                  {{ u._saving ? 'Saving…' : 'Save' }}
                </button>
              </td>
            </tr>

            <tr v-if="!pageRows.length">
              <td colspan="5" class="muted" style="text-align:center;padding:18px">
                No results.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager" v-if="totalPages > 1">
        <button class="btn secondary" :disabled="page===1" @click="page--">Prev</button>
        <span>Page {{ page }} / {{ totalPages }}</span>
        <button class="btn secondary" :disabled="page===totalPages" @click="page++">Next</button>
      </div>

      <p v-if="err" class="err">{{ err }}</p>
    </template>
  </section>

  <section v-else class="card" style="margin-top:16px">
    <p class="muted">Only <b>admin</b> users can manage roles.</p>
  </section>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/api/firebase'
import { collection, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore'

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

const rows = ref([])        
const loading = ref(false)
const err = ref('')


const q = ref('')
const roleFilter = ref('')
const sortKey = ref('createdAtMs') 
const sortDir = ref('desc')        
const page = ref(1)
const perPage = 10


onMounted(async () => {
  if (!isAdmin.value) return
  loading.value = true
  try {
    const qy = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(200))
    const snap = await getDocs(qy)
    rows.value = snap.docs.map(d => {
      const data = d.data() || {}
      const createdAtMs = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 0
      return {
        uid: d.id,
        email: data.email || '',
        displayName: data.displayName || '',
        role: (data.role || 'student'),
        _role: (data.role || 'student'),
        createdAtMs,
        _saving: false,
      }
    })
  } catch (e) {
    err.value = e.message || String(e)
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  const text = q.value.trim().toLowerCase()
  return rows.value.filter(r => {
    const hit = !text
      || r.displayName.toLowerCase().includes(text)
      || r.email.toLowerCase().includes(text)
    const roleOk = !roleFilter.value || r.role === roleFilter.value
    return hit && roleOk
  })
})


const sorted = computed(() => {
  const list = [...filtered.value]
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  list.sort((a, b) => {
    const va = a[key] ?? ''
    const vb = b[key] ?? ''
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage)))
const pageRows = computed(() => {
  const p = Math.min(page.value, totalPages.value)
  const start = (p - 1) * perPage
  return sorted.value.slice(start, start + perPage)
})

function resetFilters() {
  q.value = ''
  roleFilter.value = ''
  sortKey.value = 'createdAtMs'
  sortDir.value = 'desc'
  page.value = 1
}
function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}
function ariaSort(key) {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}
function sortIndicator(key) {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? 'asc' : 'desc'
}
watch([q, roleFilter], () => { page.value = 1 })

function fmtDate(ms) {
  if (!ms) return '—'
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function save(u) {
  err.value = ''
  u._saving = true
  try {
    await updateDoc(doc(db, 'users', u.uid), { role: u._role })
    u.role = u._role
  } catch (e) {
    err.value = e.message || String(e)
  } finally {
    u._saving = false
  }
}
</script>

<style scoped>
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.badge{display:inline-block;padding:4px 8px;font-size:12px;color:#334155;background:#eef2ff;border-radius:999px}
.muted{color:#6b7280}
.header-row{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:8px}
.tools{display:flex;gap:8px;align-items:center}
.input{padding:8px 10px;border:1px solid #d0d5dd;border-radius:8px;background:#fff;min-width:180px}
.btn{padding:8px 12px;border-radius:8px;background:#2563eb;color:#fff;border:none;cursor:pointer}
.btn.secondary{background:#fff;color:#334155;border:1px solid #cbd5e1}
.btn:disabled{opacity:.6;cursor:not-allowed}
.table-wrap{overflow:auto;border:1px solid #eef2f7;border-radius:10px}
.tbl{width:100%;border-collapse:collapse}
.tbl th,.tbl td{padding:10px 10px;border-bottom:1px solid #eef2f7;text-align:left;white-space:nowrap}
.tbl th{cursor:pointer;user-select:none;background:#fafafa;position:relative}
.sort{margin-left:6px;display:inline-block;border:5px solid transparent;vertical-align:middle}
.sort.asc{border-bottom-color:#6b7280;margin-top:-6px}
.sort.desc{border-top-color:#6b7280;margin-bottom:-2px}
.mono{font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}
.pager{display:flex;gap:12px;align-items:center;justify-content:center;margin-top:12px}
.err{color:#b42318;margin-top:10px}
</style>