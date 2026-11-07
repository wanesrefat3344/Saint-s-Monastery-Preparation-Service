<template>
  <section class="card mb-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-navy flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-gold"></span>
        ملاحظات المتابعة
        <span class="text-xs font-normal text-navy/50">({{ notes.length }})</span>
      </h2>
      <button @click="openForm" class="btn-primary text-xs px-3 py-1.5">
        + إضافة ملاحظة
      </button>
    </div>

    <!-- نموذج الإضافة -->
    <div v-if="showForm" class="bg-page rounded-lg p-4 mb-4 space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">نوع الملاحظة</label>
        <select v-model="newNote.type" class="input">
          <option value="general">عامة</option>
          <option value="behavior">سلوك</option>
          <option value="followup">متابعة</option>
          <option value="contact">تواصل مع ولي الأمر</option>
          <option value="health">صحية</option>
          <option value="other">أخرى</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">الملاحظة</label>
        <textarea
          v-model.trim="newNote.text"
          rows="3"
          class="input resize-none"
          placeholder="اكتب الملاحظة هنا..."
        ></textarea>
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="showForm = false" class="btn-cancel text-xs">إلغاء</button>
        <button @click="addNote" class="btn-success text-xs">حفظ الملاحظة</button>
      </div>
    </div>

    <!-- قائمة الملاحظات -->
    <div v-if="notes.length === 0 && !showForm" class="text-center text-navy/50 py-6 text-sm">
      مفيش ملاحظات لسه
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="n in sortedNotes"
        :key="n.id"
        class="border border-border rounded-lg p-3 bg-page/50"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="inline-block px-2 py-0.5 rounded text-[10px] font-medium"
              :class="typeClass(n.type)"
            >
              {{ typeLabel(n.type) }}
            </span>
            <span class="text-xs text-navy/50">{{ formatDate(n.created_at) }}</span>
            <span class="text-xs text-navy/50">— {{ n.created_by_name || 'غير معروف' }}</span>
          </div>
          <button
            v-if="canDelete(n)"
            @click="removeNote(n.id)"
            class="text-danger hover:bg-danger/10 px-2 py-0.5 rounded text-xs"
          >
            حذف
          </button>
        </div>
        <p class="text-sm text-navy whitespace-pre-line">{{ n.text }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../api/client'
import { DEMO_MODE } from '../config'
import { logActivity } from '../utils/auditLog'

const props = defineProps({
  memberId: { type: Number, required: true },
})

const me = JSON.parse(localStorage.getItem('user') || '{}')
const notes = ref([])
const showForm = ref(false)
const error = ref('')
const newNote = reactive({ type: 'general', text: '' })

const sortedNotes = computed(() =>
  [...notes.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
)

const typeLabels = {
  general: 'عامة',
  behavior: 'سلوك',
  followup: 'متابعة',
  contact: 'تواصل',
  health: 'صحية',
  other: 'أخرى',
}

const typeColors = {
  general: 'bg-navy/10 text-navy',
  behavior: 'bg-gold/20 text-gold',
  followup: 'bg-brand/10 text-brand',
  contact: 'bg-success/10 text-success',
  health: 'bg-danger/10 text-danger',
  other: 'bg-page text-navy/70',
}

function typeLabel(t) { return typeLabels[t] || t }
function typeClass(t) { return typeColors[t] || typeColors.other }

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function canDelete(n) {
  return me.role === 'admin' || n.created_by === me.email
}

function openForm() {
  Object.assign(newNote, { type: 'general', text: '' })
  error.value = ''
  showForm.value = true
}

function saveDemo() {
  const all = JSON.parse(localStorage.getItem('demo_notes') || '{}')
  all[props.memberId] = notes.value
  localStorage.setItem('demo_notes', JSON.stringify(all))
}

function loadDemo() {
  const all = JSON.parse(localStorage.getItem('demo_notes') || '{}')
  notes.value = all[props.memberId] || []
}
logActivity('note.create')
logActivity('note.delete')
function addNote() {
  error.value = ''
  if (!newNote.text) {
    error.value = 'اكتب نص الملاحظة'
    return
  }

  const note = {
    id: Date.now(),
    member_id: props.memberId,
    type: newNote.type,
    text: newNote.text,
    created_by: me.email,
    created_by_name: me.name || me.email,
    created_at: new Date().toISOString(),
  }

  if (DEMO_MODE) {
    notes.value.push(note)
    saveDemo()
    showForm.value = false
    return
  }

  api.post(`/members/${props.memberId}/notes`, newNote)
    .then(({ data }) => {
      notes.value.push(data)
      showForm.value = false
    })
    .catch((e) => (error.value = e.response?.data?.message || 'فشل الحفظ'))
}

function removeNote(id) {
  if (!confirm('متأكد من حذف الملاحظة؟')) return

  if (DEMO_MODE) {
    notes.value = notes.value.filter((n) => n.id !== id)
    saveDemo()
    return
  }

  api.delete(`/members/${props.memberId}/notes/${id}`)
    .then(() => (notes.value = notes.value.filter((n) => n.id !== id)))
    .catch((e) => alert(e.response?.data?.message || 'فشل الحذف'))
}

onMounted(() => {
  if (DEMO_MODE) {
    loadDemo()
    return
  }
  api.get(`/members/${props.memberId}/notes`)
    .then(({ data }) => (notes.value = data))
    .catch(console.error)
})
</script>