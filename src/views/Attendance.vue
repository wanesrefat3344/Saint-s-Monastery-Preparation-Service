<template>
  <div class="min-h-screen bg-page py-8 px-4 pb-28" dir="rtl">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="flex items-start gap-3 mb-6">
        <button
          type="button"
          @click="goBack"
          class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
          aria-label="رجوع"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-navy">تسجيل الحضور والغياب</h1>
          <p class="text-sm text-navy/60 mt-1">اختر التاريخ والاجتماع ثم حدّد حضور المخدومين</p>
        </div>
      </div>

      <!-- Toast -->
      <transition name="fade">
        <div v-if="notice" class="fixed top-4 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
          <div
            class="rounded-lg border px-4 py-3 text-sm shadow-lg bg-card"
            :class="{
              'border-success text-success': notice.type === 'success',
              'border-danger text-danger': notice.type === 'error',
              'border-brand text-brand': notice.type === 'info',
            }"
            role="status"
          >
            {{ notice.text }}
          </div>
        </div>
      </transition>

      <!-- Session: date + meeting type + scan -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-end">

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">التاريخ</label>
            <div class="flex items-center gap-1">
              <button type="button" @click="shiftDay(-7)" class="w-9 h-10 rounded-lg border border-border bg-card text-navy hover:bg-navy hover:text-white transition-colors" aria-label="الأسبوع السابق" title="الأسبوع السابق">››</button>
              <input v-model="date" type="date" class="input !w-auto" />
              <button type="button" @click="shiftDay(7)" class="w-9 h-10 rounded-lg border border-border bg-card text-navy hover:bg-navy hover:text-white transition-colors" aria-label="الأسبوع التالي" title="الأسبوع التالي">‹‹</button>
              <button
                v-if="!isToday"
                type="button"
                @click="date = todayStr()"
                class="px-3 h-10 rounded-lg bg-page text-navy text-xs hover:bg-navy/10 transition-colors"
              >
                اليوم
              </button>
            </div>
            <p class="text-xs text-navy/60 mt-1.5">
              {{ dateLabel }}
              <span v-if="isToday" class="inline-block mr-1 rounded-full bg-success/15 text-success px-2 py-0.5">النهارده</span>
              <span v-else-if="isFuture" class="inline-block mr-1 rounded-full bg-danger/10 text-danger px-2 py-0.5">تاريخ في المستقبل</span>
            </p>
          </div>

          <!-- Meeting type -->
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">نوع الاجتماع</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in meetingTypes"
                :key="t.value"
                type="button"
                @click="meetingType = t.value"
                class="px-4 py-2 rounded-lg text-sm transition-colors"
                :class="meetingType === t.value ? 'bg-navy text-white' : 'bg-page text-navy hover:bg-navy/10'"
                :aria-pressed="meetingType === t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <!-- Scan -->
          <button
            type="button"
            @click="showScanner = true"
            class="px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 transition-colors"
          >
            📱 مسح QR
          </button>
        </div>

        <p v-if="hasRecords" class="mt-3 rounded-lg bg-brand/10 text-brand text-xs px-3 py-2">
          ✏️ الاجتماع ده اتسجّل قبل كده — أي تعديل هيحدّث التسجيل القديم.
        </p>
      </div>

      <!-- Loading -->
      <SkeletonTable v-if="loading" :rows="8" :columns="4" />

      <!-- Error -->
      <div v-else-if="loadError" class="card text-center py-12">
        <p class="text-danger mb-4">{{ loadError }}</p>
        <button @click="retry" class="btn-primary">إعادة المحاولة</button>
      </div>

      <!-- Empty -->
      <div v-else-if="members.length === 0" class="card">
        <EmptyState
          icon="👥"
          title="مفيش مخدومين مسجلين"
          description="سجل أول مخدوم عشان تقدر تسجل حضوره"
          tone="brand"
        >
          <template #actions>
            <router-link to="/members/new" class="btn-primary">+ سجل مخدوم</router-link>
          </template>
        </EmptyState>
      </div>

      <template v-else>

        <!-- Summary tiles (clickable filters) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <button
            v-for="t in tiles"
            :key="t.key"
            type="button"
            @click="statusFilter = statusFilter === t.key ? 'all' : t.key"
            class="card text-center py-3 transition-shadow"
            :class="statusFilter === t.key ? 'ring-2 ring-navy' : 'hover:shadow-md'"
            :aria-pressed="statusFilter === t.key"
          >
            <p class="text-xs text-navy/50 mb-1">{{ t.label }}</p>
            <p class="text-2xl font-bold" :class="t.text">{{ t.value }}</p>
          </button>
        </div>

        <!-- Progress -->
        <div class="card mb-4 py-3">
          <div class="flex items-center justify-between text-xs text-navy/60 mb-2">
            <span>
              نسبة الحضور:
              <b :class="attendanceRate === null ? 'text-navy/40' : 'text-navy'">{{ attendanceRate === null ? '—' : attendanceRate + '%' }}</b>
              <span class="text-navy/40"> (من {{ markedCount }} اتحدد)</span>
            </span>
            <span>اتحدد {{ markedCount }} من {{ counts.total }}</span>
          </div>
          <div class="flex h-2.5 rounded-full overflow-hidden bg-navy/10">
            <div class="bg-success transition-all" :style="{ width: pct(counts.present) + '%' }"></div>
            <div class="bg-danger transition-all" :style="{ width: pct(counts.absent) + '%' }"></div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="card mb-3">
          <div class="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div class="relative flex-1">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 pointer-events-none">🔍</span>
              <input v-model="search" type="search" placeholder="ابحث بالاسم..." class="input !pr-10 w-full" />
            </div>

            <select v-if="grades.length > 1" v-model="gradeFilter" class="input lg:!w-auto">
              <option value="all">كل الصفوف</option>
              <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
            </select>

            <div class="flex gap-2 flex-wrap">
              <button @click="markVisible(true)" class="px-3 py-2 rounded-lg border border-success/30 bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors">
                ✓ {{ bulkLabel }} حاضر
              </button>
              <button @click="markVisible(false)" class="px-3 py-2 rounded-lg border border-danger/30 bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors">
                ✕ {{ bulkLabel }} غائب
              </button>
              <button
                v-if="visibleUnmarked > 0"
                @click="markRestAbsent"
                class="px-3 py-2 rounded-lg border border-border bg-card text-navy text-xs font-medium hover:bg-navy/5 transition-colors"
              >
                الباقي غائب ({{ visibleUnmarked }})
              </button>
            </div>
          </div>

          <p class="text-xs text-navy/50 mt-3">
            عرض {{ filteredMembers.length }} من {{ members.length }}
            <button v-if="filtersActive" @click="clearFilters" class="text-brand hover:underline mr-2">مسح الفلاتر</button>
          </p>
        </div>

        <!-- List -->
        <div v-if="filteredMembers.length === 0" class="card text-center text-navy/50 py-10">
          مفيش نتايج مطابقة
          <button @click="clearFilters" class="block mx-auto mt-3 text-sm text-brand hover:underline">مسح الفلاتر</button>
        </div>

        <ul
          v-else
          class="grid grid-cols-1 lg:grid-cols-2 gap-2 transition-opacity"
          :class="refreshing ? 'opacity-50 pointer-events-none' : ''"
        >
          <li
            v-for="m in filteredMembers"
            :key="m.id"
            class="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 border-r-4 transition-colors"
            :class="[rowAccent(m.id), highlightId === m.id ? 'ring-2 ring-success' : '']"
          >
            <span
              class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              :class="avatarClass(m.id)"
              aria-hidden="true"
            >
              {{ initial(m.full_name) }}
            </span>

            <div class="min-w-0 flex-1">
              <router-link :to="`/members/${m.id}`" class="block font-medium text-navy hover:text-brand truncate">
                {{ m.full_name }}
              </router-link>
              <p class="text-xs text-navy/50 truncate">
                {{ m.grade || '—' }}<span v-if="m.group_name"> • {{ m.group_name }}</span>
              </p>
            </div>

            <div class="flex shrink-0 rounded-lg overflow-hidden border border-border" role="group" :aria-label="`حالة ${m.full_name}`">
              <button
                type="button"
                @click="setStatus(m.id, true)"
                class="px-3.5 py-2 text-xs font-medium transition-colors"
                :class="status[m.id] === true ? 'bg-success text-white' : 'bg-card text-navy/60 hover:bg-success/10 hover:text-success'"
                :aria-pressed="status[m.id] === true"
              >
                حاضر
              </button>
              <button
                type="button"
                @click="setStatus(m.id, false)"
                class="px-3.5 py-2 text-xs font-medium border-r border-border transition-colors"
                :class="status[m.id] === false ? 'bg-danger text-white' : 'bg-card text-navy/60 hover:bg-danger/10 hover:text-danger'"
                :aria-pressed="status[m.id] === false"
              >
                غائب
              </button>
            </div>
          </li>
        </ul>
      </template>
    </div>

    <!-- Sticky save bar -->
    <div class="fixed bottom-4 inset-x-0 z-10 px-4 pointer-events-none">
      <div class="max-w-5xl mx-auto pointer-events-auto bg-card/95 backdrop-blur rounded-xl border border-border shadow-lg p-3 flex items-center justify-between gap-3">
        <div class="text-sm min-w-0">
          <p v-if="dirty" class="text-danger font-medium">● فيه {{ dirtyCount }} تعديل لسه ما اتحفظش</p>
          <p v-else-if="lastSaved" class="text-success">✓ تم الحفظ {{ lastSaved }}</p>
          <p v-else class="text-navy/50">مفيش تعديلات</p>
          <p class="text-xs text-navy/50 hidden sm:block mt-0.5">
            حاضر <b class="text-success">{{ counts.present }}</b> •
            غائب <b class="text-danger">{{ counts.absent }}</b> •
            لم يحدد <b class="text-navy">{{ counts.unmarked }}</b>
          </p>
        </div>
        <button
          @click="onSaveClick"
          :disabled="saving || !dirty || members.length === 0"
          class="px-6 py-2.5 rounded-lg bg-success text-white font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {{ saving ? 'جارٍ الحفظ...' : 'حفظ الحضور' }}
        </button>
      </div>
    </div>

    <!-- Unmarked prompt -->
    <transition name="fade">
      <div
        v-if="showUnmarkedPrompt"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
        @click.self="showUnmarkedPrompt = false"
      >
        <div class="card w-full max-w-md" role="dialog" aria-modal="true">
          <h3 class="text-lg font-semibold text-navy mb-1">فيه {{ counts.unmarked }} لسه ما اتحددش</h3>
          <p class="text-sm text-navy/60 mb-4">تحب نسجّلهم غايبين، ولا نحفظ اللي اتحدد بس ونسيبهم من غير تسجيل؟</p>
          <div class="flex flex-col gap-2">
            <button class="px-4 py-2.5 rounded-lg bg-success text-white font-medium hover:bg-success/90" @click="doSave(true)">
              سجّلهم غياب واحفظ
            </button>
            <button class="px-4 py-2.5 rounded-lg border border-border bg-card text-navy hover:bg-navy/5" @click="doSave(false)">
              احفظ اللي اتحدد بس
            </button>
            <button class="px-4 py-2 text-sm text-navy/60 hover:text-navy" @click="showUnmarkedPrompt = false">
              رجوع للتعديل
            </button>
          </div>
        </div>
      </div>
    </transition>

    <QRScanner v-if="showScanner" @scanned="onScanned" @close="showScanner = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import api from '../api/client'
import QRScanner from '../components/QRScanner.vue'
import SkeletonTable from '../components/SkeletonTable.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()

const meetingTypes = [
  { value: 'prep', label: 'إعدادي' },
  { value: 'social', label: 'اجتماع عام' },
  { value: 'youth', label: 'شباب' },
  { value: 'other', label: 'أخرى' },
]

/* ---------- Date helpers (بالتوقيت المحلي، مش UTC) ---------- */
function toStr(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
function todayStr() {
  return toStr(new Date())
}
function parseStr(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/* ---------- State ---------- */
const members = ref([])
// id -> true (حاضر) | false (غائب) | null (لم يحدد)
const status = reactive({})
const baseline = ref({}) // آخر حالة اتحفظت على السيرفر
const date = ref(todayStr())
const meetingType = ref('prep')

const loading = ref(true)
const refreshing = ref(false)
const loadError = ref('')
const saving = ref(false)
const hasRecords = ref(false)
const lastSaved = ref('')

const showScanner = ref(false)
const showUnmarkedPrompt = ref(false)

const search = ref('')
const gradeFilter = ref('all')
const statusFilter = ref('all')

const notice = ref(null)
const highlightId = ref(null)

/* ---------- Derived ---------- */
const isToday = computed(() => date.value === todayStr())
const isFuture = computed(() => date.value > todayStr())
const dateLabel = computed(() => {
  if (!date.value) return ''
  return parseStr(date.value).toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const counts = computed(() => {
  let present = 0
  let absent = 0
  let unmarked = 0
  for (const m of members.value) {
    const s = status[m.id]
    if (s === true) present++
    else if (s === false) absent++
    else unmarked++
  }
  return { present, absent, unmarked, total: members.value.length }
})

const markedCount = computed(() => counts.value.present + counts.value.absent)
const attendanceRate = computed(() =>
  markedCount.value ? Math.round((counts.value.present / markedCount.value) * 100) : null,
)

const tiles = computed(() => [
  { key: 'all', label: 'الإجمالي', value: counts.value.total, text: 'text-navy' },
  { key: 'present', label: 'حاضر', value: counts.value.present, text: 'text-success' },
  { key: 'absent', label: 'غائب', value: counts.value.absent, text: 'text-danger' },
  { key: 'unmarked', label: 'لم يحدد', value: counts.value.unmarked, text: 'text-navy/60' },
])

function pct(n) {
  return counts.value.total ? (n / counts.value.total) * 100 : 0
}

const dirtyCount = computed(() => {
  let n = 0
  for (const m of members.value) {
    if ((status[m.id] ?? null) !== (baseline.value[m.id] ?? null)) n++
  }
  return n
})
const dirty = computed(() => dirtyCount.value > 0)

/* ---------- Filtering ---------- */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim()
}

const grades = computed(() => [...new Set(members.value.map((m) => m.grade).filter(Boolean))])

const filteredMembers = computed(() => {
  const q = norm(search.value)
  return members.value.filter((m) => {
    if (gradeFilter.value !== 'all' && m.grade !== gradeFilter.value) return false
    if (q && !norm(m.full_name).includes(q)) return false
    const s = status[m.id] ?? null
    if (statusFilter.value === 'present' && s !== true) return false
    if (statusFilter.value === 'absent' && s !== false) return false
    if (statusFilter.value === 'unmarked' && s !== null) return false
    return true
  })
})

const filtersActive = computed(
  () => !!search.value || gradeFilter.value !== 'all' || statusFilter.value !== 'all',
)
const bulkLabel = computed(() => (filtersActive.value ? `الظاهرين (${filteredMembers.value.length})` : 'الكل'))
const visibleUnmarked = computed(() => filteredMembers.value.filter((m) => (status[m.id] ?? null) === null).length)

function clearFilters() {
  search.value = ''
  gradeFilter.value = 'all'
  statusFilter.value = 'all'
}

/* ---------- Row styling ---------- */
function rowAccent(id) {
  if (status[id] === true) return 'border-r-success'
  if (status[id] === false) return 'border-r-danger'
  return 'border-r-navy/15'
}
function avatarClass(id) {
  if (status[id] === true) return 'bg-success/15 text-success'
  if (status[id] === false) return 'bg-danger/10 text-danger'
  return 'bg-navy/10 text-navy/60'
}
function initial(name) {
  return (name || '?').trim().charAt(0)
}

/* ---------- Actions ---------- */
function setStatus(id, v) {
  status[id] = v
}
function markVisible(v) {
  filteredMembers.value.forEach((m) => (status[m.id] = v))
}
function markRestAbsent() {
  filteredMembers.value.forEach((m) => {
    if ((status[m.id] ?? null) === null) status[m.id] = false
  })
}
function shiftDay(days) {
  const d = parseStr(date.value)
  d.setDate(d.getDate() + days)
  date.value = toStr(d)
}
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

/* ---------- Notices ---------- */
let noticeTimer
function notify(type, text, ms = 2500) {
  clearTimeout(noticeTimer)
  notice.value = { type, text }
  noticeTimer = setTimeout(() => (notice.value = null), ms)
}

/* ---------- Scan ---------- */
const scanning = new Set()

async function onScanned(rawId) {
  const id = Number(rawId)
  if (!Number.isFinite(id)) {
    notify('error', 'الكود مش صالح')
    return
  }
  const m = members.value.find((x) => x.id === id)
  if (!m) {
    notify('error', 'المخدوم مش موجود في القائمة')
    return
  }
  if (status[id] === true) {
    notify('info', `${m.full_name} متسجل حاضر بالفعل`)
    return
  }
  if (scanning.has(id)) return
  scanning.add(id)
  try {
    const { data } = await api.post('/attendance/scan', {
      member_id: id,
      date: date.value,
      meeting_type: meetingType.value,
    })
    status[id] = true
    baseline.value = { ...baseline.value, [id]: true } // اتحفظ على السيرفر فعلاً
    hasRecords.value = true
    highlightId.value = id
    setTimeout(() => {
      if (highlightId.value === id) highlightId.value = null
    }, 2500)
    notify('success', `✅ تم تسجيل ${data?.member?.full_name || m.full_name} حاضر`, 1800)
  } catch (e) {
    notify('error', e.response?.data?.message || 'فشل تسجيل الحضور')
  } finally {
    scanning.delete(id)
  }
}

/* ---------- Load ---------- */
let loadToken = 0

async function loadAttendance() {
  const token = ++loadToken
  refreshing.value = true
  loadError.value = ''
  try {
    const { data } = await api.get('/attendance', {
      params: { date: date.value, meeting_type: meetingType.value },
    })
    if (token !== loadToken) return // طلب أقدم، اتجاهله
    const saved = {}
    data.forEach((a) => {
      saved[a.member_id] = a.present === true || a.present === 1 || a.present === '1'
    })
    const snap = {}
    members.value.forEach((m) => {
      const v = saved[m.id] === undefined ? null : saved[m.id]
      status[m.id] = v
      snap[m.id] = v
    })
    baseline.value = snap
    hasRecords.value = data.length > 0
    lastSaved.value = ''
  } catch (e) {
    if (token !== loadToken) return
    console.error(e)
    loadError.value = e.response?.data?.message || 'فشل تحميل بيانات الحضور'
  } finally {
    if (token === loadToken) refreshing.value = false
  }
}

async function init() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get('/members')
    members.value = data
    await loadAttendance()
  } catch (e) {
    console.error(e)
    loadError.value = e.response?.data?.message || 'فشل تحميل المخدومين'
  } finally {
    loading.value = false
  }
}

function retry() {
  if (members.value.length) loadAttendance()
  else init()
}

/* ---------- Save ---------- */
function onSaveClick() {
  if (!dirty.value) return
  if (counts.value.unmarked > 0) showUnmarkedPrompt.value = true
  else doSave(false)
}

async function doSave(fillAbsent) {
  showUnmarkedPrompt.value = false

  const snapshot = {}
  members.value.forEach((m) => {
    let s = status[m.id] ?? null
    if (s === null && fillAbsent) {
      s = false
      status[m.id] = false
    }
    snapshot[m.id] = s
  })

  const records = members.value
    .filter((m) => snapshot[m.id] !== null)
    .map((m) => ({ member_id: m.id, present: snapshot[m.id] }))

  if (!records.length) {
    notify('error', 'حدد حضور أو غياب مخدوم واحد على الأقل')
    return
  }

  saving.value = true
  try {
    await api.post('/attendance', { date: date.value, meeting_type: meetingType.value, records })
    baseline.value = snapshot
    hasRecords.value = true
    lastSaved.value = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    notify('success', `تم حفظ ${records.length} تسجيل ✅`)
  } catch (e) {
    notify('error', e.response?.data?.message || 'فشل الحفظ', 3500)
  } finally {
    saving.value = false
  }
}

/* ---------- تغيير التاريخ/الاجتماع مع حماية التعديلات ---------- */
let reverting = false
watch([date, meetingType], (_, [oldDate, oldType]) => {
  if (reverting) {
    reverting = false
    return
  }
  if (dirty.value && !window.confirm('فيه تعديلات لسه ما اتحفظتش، لو غيّرت هتضيع. تكمل؟')) {
    reverting = true
    date.value = oldDate
    meetingType.value = oldType
    return
  }
  loadAttendance()
})

/* ---------- حماية الخروج بتعديلات غير محفوظة ---------- */
function onBeforeUnload(e) {
  if (dirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onBeforeRouteLeave(() => {
  if (dirty.value && !window.confirm('فيه تعديلات لسه ما اتحفظتش. تخرج برضه؟')) return false
})

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload)
  init()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  clearTimeout(noticeTimer)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>