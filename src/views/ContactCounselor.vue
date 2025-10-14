<template>
  <div class="contact-wrap">
    <h2>Contact a Counselor</h2>

    <form class="form" @submit.prevent="submit">
      <label class="field">
        <span>To</span>
        <input
          v-model.trim="to"
          type="email"
          required
          placeholder="counselor@example.org"
        />
      </label>

      <label class="field">
        <span>Subject</span>
        <input
          v-model.trim="subject"
          type="text"
          required
          placeholder="Consultation request"
        />
      </label>

      <label class="field">
        <span>Message</span>
        <textarea
          v-model.trim="text"
          rows="5"
          placeholder="Briefly describe your request…"
        ></textarea>
      </label>

      <label class="field">
        <span>Attachment</span>
        <div>
          <!-- Hidden native input -->
          <input
            id="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            class="sr-only"
            @change="onFile"
          />
          <!-- Custom button + filename -->
          <label class="file-btn" for="file">
            {{ fileName || 'Choose file' }}
          </label>
          <span class="muted">{{ fileName ? '' : '(No file chosen)' }}</span>
        </div>
      </label>

      <div class="actions">
        <button class="primary" type="submit" :disabled="sending">
          {{ sending ? 'Sending…' : 'Send' }}
        </button>
        <p v-if="msg" :class="ok ? 'ok' : 'err'">{{ msg }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sendEmail } from '@/api/email'

const to = ref('counselor@example.org')
const subject = ref('Consultation request')
const text = ref('')

const file = ref<File | null>(null)
const fileName = ref('')

const sending = ref(false)
const msg = ref('')
const ok = ref(false)

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  file.value = f
  fileName.value = f ? f.name : ''
}

function validateFile(f: File) {
  const allow = ['application/pdf', 'image/png', 'image/jpeg']
  if (!allow.includes(f.type)) {
    throw new Error('Only PDF/PNG/JPG files are allowed.')
  }
  // 5MB limit (示例，可按需调整)
  if (f.size > 5 * 1024 * 1024) {
    throw new Error('File must be ≤ 5MB.')
  }
}

async function fileToBase64(f: File) {
  const buf = await f.arrayBuffer()
  const bytes = new Uint8Array(buf)
  // 分块避免超出调用栈
  const chunk = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

async function submit() {
  msg.value = ''
  ok.value = false
  sending.value = true
  try {
    let base64: string | undefined
    let filename: string | undefined

    if (file.value) {
      validateFile(file.value)
      base64 = await fileToBase64(file.value)
      filename = file.value.name
    }

    await sendEmail({
      to: to.value,
      subject: subject.value,
      text: text.value,
      base64,
      filename
    })

    ok.value = true
    msg.value = 'Email sent.'
  } catch (e: any) {
    ok.value = false
    msg.value = e?.message || 'Failed to send email.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.contact-wrap {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px;
}

h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 8px 0 20px;
}

.form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.field > span {
  display: inline-block;
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;
}

input[type="text"],
input[type="email"],
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.04) inset;
}
textarea { resize: vertical; }

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border: 0;
}

.file-btn {
  display: inline-block;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}
.file-btn:hover { background: #f9fafb; }

.muted {
  margin-left: 8px;
  color: #6b7280;
  font-size: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

button.primary {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #eef2ff;
  color: #1e40af;
  font-weight: 600;
  cursor: pointer;
}
button.primary:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.ok { color: #059669; }
.err { color: #dc2626; }
</style>