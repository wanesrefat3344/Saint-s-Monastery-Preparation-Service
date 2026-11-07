<template>
  <section class="card mb-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-navy flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-brand"></span>
        سجل الافتقاد
        <span class="text-xs font-normal text-navy/50">({{ followups.length }})</span>
      </h2>
      <button @click="openForm" class="btn-primary text-xs px-3 py-1.5">
        + سجّل تواصل
      </button>
    </div>

    <!-- تنبيه لو محتاج افتقاد -->
    <div
      v-if="needsFollowup"
      class="mb-4 rounded-lg bg-danger/10 border border-danger text-danger px-4 py-3 text-sm flex items-center gap-2"
    >
      <span class="text-lg">⚠️</span>
      <span>
        آخر تواصل كان من <strong>{{ daysSinceLast }} يوم</strong> — محتاج متابعة
      </span>
    </div>
    <div
      v-else-if="lastFollowup"
      class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm flex items-center gap-2"
    >
      <span class="text-lg">✓</span>
      <span>
        آخر تواصل من {{ daysSinceLast }} يوم — تمام
      </span>
    </div>

    <!-- نموذج الإضافة -->
    <div v-if="showForm" class="bg-page rounded-lg p-4 mb-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">التاريخ</label>
          <input v-model="newFollowup.date" type="date" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">وسيلة التواصل</label>
          <select v-model="newFollowup.method" class="input">
            <option value="call">مكالمة</option>
            <option value="whatsapp">واتساب</option>
            <option value="visit">زيارة</option>
            <option value="meeting">مقابلة</option>
            <option value="other">أخرى</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">نتيجة التواصل</label>
        <textarea
          v-model.trim="newFollowup.result"
          rows="2"
          class="input resize-none"
          placeholder="مثال: تم الاطمئنان على المخدوم، ولي الأمر وعد بحضور الاجتماع القادم..."
        ></textarea>
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="showForm = false" class="btn-cancel text-xs">إلغاء</button>
        <button @click="addFollowup" class="btn-success text-xs">حفظ</button>
      </div>
    </div>

    <!-- قائمة الاتصالات -->
    <div v-if="followups.length === 0 && !showForm" class="text-center text-navy/50 py-6 text-sm">
      مفيش سجل تواصل لسه
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="f in sortedFollowups"
        :key="f.id"
        class="border border-border rounded-lg p-3 bg-page/50"
      >
        <div class="flex items-start justify-between gap-2 mb-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-block px-2 py-0.5 rounded bg-brand/10 text-brand text-[10px] font-medium">
              {{ methodLabel(f.method) }}
            </span>
            <span class="text-xs text-navy/60">{{ formatDate(f.date) }}</span>
            <span class="text-xs text-navy/50">— {{ f.created_by_name || 'غير معروف' }}</span>
          </div>
          <button
            v-if="canDelete(f)"
            @click="removeFollowup(f.id)"
            class="text-danger hover:bg-danger/10 px-2 py-0.5 rounded text-xs"
          >
            حذف
          </button>
        </div>
        <p v-if="f.result" class="text-sm text-navy whitespace-pre-line">{{ f.result }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../api/client'
import { DEMO_MODE } from '../config'

const props = defineProps({
  memberId: { type: Number, required: true },
})

const me = JSON.parse(localStorage.getItem('user') || '{}')
const followups = ref([])
const showForm = ref(false)
const error = ref('')

const today = new Date().toISOString().slice(0, 10)
const newFollowup = reactive({ date: today, method: 'call', result: '' })

const sortedFollowups = computed(() =>
  [...followups.value].sort((a, b) => new Date(b.date) - new Date(a.date))
)

const lastFollowup = computed(() => sortedFollowups.value[0] || null)

const daysSinceLast = computed(() => {
  if (!lastFollowup.value) return null
  const last = new Date(lastFollowup.value.date)
  const now = new Date()
  return Math.floor((now - last) / (1000 * 60 * 60 * 24))
})

const needsFollowup = computed(() => {
  if (!lastFollowup.value) return true
  return daysSinceLast.value > 30
})

const methodLabels = {
  call: 'مكالمة',
  whatsapp: 'واتساب',
  visit: 'زيارة',
  meeting: 'مقابلة',
  other: 'أخرى',
}

function methodLabel(m) { return methodLabels[m] || m }

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function canDelete(f) {
  return me.role === 'admin' || f.created_by === me.email
}

function openForm() {
  Object.assign(newFollowup, {
    date: new Date().toISOString().slice(0, 10),
    method: 'call',
    result: '',
  })
  error.value = ''
  showForm.value = true
}

function saveDemo() {
  const all = JSON.parse(localStorage.getItem('demo_followups') || '{}')
  all[props.memberId] = followups.value
  localStorage.setItem('demo_followups', JSON.stringify(all))
}

function loadDemo() {
  const all = JSON.parse(localStorage.getItem('demo_followups') || '{}')
  followups.value = all[props.memberId] || []
}

function addFollowup() {
  error.value = ''
  if (!newFollowup.date) {
    error.value = 'التاريخ مطلوب'
    return
  }

  const f = {
    id: Date.now(),
    member_id: props.memberId,
    date: newFollowup.date,
    method: newFollowup.method,
    result: newFollowup.result,
    created_by: me.email,
    created_by_name: me.name || me.email,
    created_at: new Date().toISOString(),
  }

  if (DEMO_MODE) {
    followups.value.push(f)
    saveDemo()
    showForm.value = false
    return
  }

  api.post(`/members/${props.memberId}/followups`, f)
    .then(({ data }) => {
      followups.value.push(data)
      showForm.value = false
    })
    .catch((e) => (error.value = e.response?.data?.message || 'فشل الحفظ'))
}

function removeFollowup(id) {
  if (!confirm('متأكد من حذف السجل؟')) return

  if (DEMO_MODE) {
    followups.value = followups.value.filter((f) => f.id !== id)
    saveDemo()
    return
  }

  api.delete(`/members/${props.memberId}/followups/${id}`)
    .then(() => (followups.value = followups.value.filter((f) => f.id !== id)))
    .catch((e) => alert(e.response?.data?.message || 'فشل الحذف'))
}

onMounted(() => {
  if (DEMO_MODE) {
    loadDemo()
    return
  }
  api.get(`/members/${props.memberId}/followups`)
    .then(({ data }) => (followups.value = data))
    .catch(console.error)
})
</script>