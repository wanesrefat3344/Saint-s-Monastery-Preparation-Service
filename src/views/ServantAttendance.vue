<template>
  <div class="min-h-screen bg-page py-8 px-4 pb-24" dir="rtl">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-start gap-3">
          <button
            @click="goBack"
            class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
            aria-label="رجوع"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-navy">حضور الخدام</h1>
            <p class="text-sm text-navy/60 mt-1">تسجيل حضور الخدام في الاجتماعات</p>
          </div>
        </div>
        <router-link
          to="/servants-activity"
          class="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors"
        >
          📊 تقرير النشاط
        </router-link>
      </div>

      <!-- Success -->
      <transition name="fade">
        <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
          {{ successMessage }}
        </div>
      </transition>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-3 mb-4">
        <div class="card text-center py-4">
          <p class="text-xs text-navy/50 mb-1">حاضر</p>
          <p class="text-2xl font-bold text-success">{{ presentCount }}</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-xs text-navy/50 mb-1">متأخر</p>
          <p class="text-2xl font-bold text-gold">{{ lateCount }}</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-xs text-navy/50 mb-1">غايب</p>
          <p class="text-2xl font-bold text-danger">{{ absentCount }}</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-xs text-navy/50 mb-1">إجمالي</p>
          <p class="text-2xl font-bold text-navy">{{ servants.length }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">التاريخ</label>
            <input v-model="date" type="date" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">نوع الاجتماع</label>
            <select v-model="meetingType" class="input">
              <option value="social">اجتماع عام</option>
              <option value="prep">إعدادي</option>
              <option value="youth">شباب</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button @click="markAll('present')" class="flex-1 px-3 py-2.5 rounded-lg border border-success/30 bg-success/10 text-success text-xs font-medium hover:bg-success/20">
              ✓ الكل حاضر
            </button>
            <button @click="markAll('absent')" class="flex-1 px-3 py-2.5 rounded-lg border border-danger/30 bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20">
              ✕ الكل غايب
            </button>
          </div>
          <div class="flex items-end">
            <button @click="showScanner = true" class="w-full px-3 py-2.5 rounded-lg bg-navy text-white text-xs font-medium hover:bg-navy/90 flex items-center justify-center gap-2">
              📱 مسح QR
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <SkeletonTable v-if="loading" :rows="6" :columns="4" />

      <!-- Empty -->
      <div v-else-if="servants.length === 0" class="card">
        <EmptyState icon="👤" title="مفيش خدامين" description="أضف خدامين الأول من صفحة الخدام" tone="brand">
          <template #actions>
            <router-link to="/servants" class="btn-primary">+ إضافة خادم</router-link>
          </template>
        </EmptyState>
      </div>

      <!-- Table -->
      <div v-else class="card overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-navy text-white dark:bg-slate-800">
              <tr>
                <th class="text-right px-4 py-3 font-medium">#</th>
                <th class="text-right px-4 py-3 font-medium">الاسم</th>
                <th class="text-right px-4 py-3 font-medium hidden sm:table-cell">الدور</th>
                <th class="text-center px-4 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in servants" :key="s.id" class="border-b border-border last:border-0 hover:bg-page/60">
                <td class="px-4 py-3 text-navy/50">{{ i + 1 }}</td>
                <td class="px-4 py-3">
                  <p class="font-medium text-navy">{{ s.name }}</p>
                  <p class="text-xs text-navy/50" dir="ltr">{{ s.email }}</p>
                </td>
                <td class="px-4 py-3 text-xs hidden sm:table-cell">{{ roleLabel(s.role) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      v-for="st in statuses"
                      :key="st.value"
                      @click="setStatus(s.id, st.value)"
                      class="px-2 py-1 rounded text-[10px] font-medium transition-colors"
                      :class="attendance[s.id] === st.value ? st.activeClass : 'bg-page text-navy/40 hover:bg-navy/5'"
                      :title="st.label"
                    >
                      {{ st.icon }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Save -->
      <div v-if="servants.length > 0" class="sticky bottom-4 mt-6 z-10">
        <div class="bg-card/95 backdrop-blur rounded-xl border border-border shadow-sm p-3 flex items-center justify-between gap-3">
          <p class="text-sm text-navy/60 hidden sm:block">
            حاضر: <span class="text-success font-medium">{{ presentCount }}</span> /
            متأخر: <span class="text-gold font-medium">{{ lateCount }}</span> /
            غايب: <span class="text-danger font-medium">{{ absentCount }}</span>
          </p>
          <button @click="save" :disabled="saving" class="px-6 py-2.5 rounded-lg bg-success text-white font-medium hover:bg-success/90 disabled:opacity-60 ml-auto">
            {{ saving ? '...' : 'حفظ الحضور' }}
          </button>
        </div>
      </div>
    </div>

    <QRScanner v-if="showScanner" @scanned="onScanned" @close="showScanner = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'
import SkeletonTable from '../components/SkeletonTable.vue'
import EmptyState from '../components/EmptyState.vue'
import QRScanner from '../components/QRScanner.vue'

const router = useRouter()
const servants = ref([])
const attendance = reactive({})
const date = ref(new Date().toISOString().slice(0, 10))
const meetingType = ref('social')
const showScanner = ref(false)
const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')

const statuses = [
  { value: 'present', label: 'حاضر', icon: '✓', activeClass: 'bg-success text-white' },
  { value: 'late', label: 'متأخر', icon: '⏰', activeClass: 'bg-gold text-white' },
  { value: 'excused', label: 'معذور', icon: '📝', activeClass: 'bg-brand text-white' },
  { value: 'absent', label: 'غايب', icon: '✕', activeClass: 'bg-danger text-white' },
]

const presentCount = computed(() => Object.values(attendance).filter((v) => v === 'present').length)
const lateCount = computed(() => Object.values(attendance).filter((v) => v === 'late').length)
const absentCount = computed(() => Object.values(attendance).filter((v) => v === 'absent').length)

function roleLabel(role) {
  return { admin: 'أدمن', servant: 'خادم', co_servant: 'مساعد', group_leader: 'ليدر', reader: 'قارئ' }[role] || role
}

function setStatus(id, status) {
  attendance[id] = status
}

function markAll(status) {
  servants.value.forEach((s) => (attendance[s.id] = status))
}

async function onScanned(servantId) {
  const s = servants.value.find((x) => x.id === servantId)
  if (!s) { alert('الخادم مش في القائمة'); return }
  try {
    const { data } = await api.post('/servant-attendance/scan', {
      servant_id: servantId,
      date: date.value,
      meeting_type: meetingType.value,
    })
    attendance[servantId] = 'present'
    successMessage.value = `✅ تم تسجيل ${data.servant?.name || s.name} حاضر`
    setTimeout(() => (successMessage.value = ''), 1500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل')
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

async function loadData() {
  loading.value = true
  try {
    const [servantsRes, attRes] = await Promise.all([
      api.get('/team/servants'),
      api.get('/servant-attendance', { params: { date: date.value, meeting_type: meetingType.value } }),
    ])
    servants.value = servantsRes.data
    const saved = {}
    attRes.data.forEach((a) => { saved[a.servant_id] = a.status })
    servants.value.forEach((s) => {
      attendance[s.id] = saved[s.id] || 'absent'
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  successMessage.value = ''
  try {
    const records = Object.entries(attendance).map(([servant_id, status]) => ({
      servant_id: Number(servant_id),
      status,
    }))
    await api.post('/servant-attendance', {
      date: date.value,
      meeting_type: meetingType.value,
      records,
    })
    successMessage.value = 'تم حفظ الحضور ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحفظ')
  } finally {
    saving.value = false
  }
}

watch([date, meetingType], loadData)
onMounted(loadData)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>