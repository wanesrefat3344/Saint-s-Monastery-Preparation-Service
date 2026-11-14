<template>
  <div class="min-h-screen bg-page py-8 px-4" dir="rtl">
    <div class="max-w-5xl mx-auto">

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <svg class="animate-spin w-7 h-7 text-navy/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span class="text-navy/50 text-sm">جارٍ التحميل...</span>
      </div>

      <div v-else-if="!challenge" class="card text-center py-16">
        <div class="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-navy/60 mb-4">التحدي غير موجود</p>
        <router-link to="/challenges" class="btn-primary inline-block">رجوع للتحديات</router-link>
      </div>

      <div v-else>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div class="flex items-start gap-3">
            <button
              type="button"
              @click="goBack"
              class="mt-2 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
              :class="challenge.status === 'active' ? 'bg-success/10' : 'bg-navy/10'"
            >
              {{ challenge.icon || '🏆' }}
            </div>

            <div>
              <h1 class="text-2xl font-bold text-navy">{{ challenge.name }}</h1>
              <div class="text-sm text-navy/60 mt-1 flex items-center gap-2 flex-wrap">
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
                  :class="challenge.status === 'active' ? 'bg-success/10 text-success' : 'bg-navy/10 text-navy/60'"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ challenge.status === 'active' ? 'نشط' : 'منتهي' }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(challenge.start_date) }} → {{ formatDate(challenge.end_date) }}
                </span>
                <span class="font-bold text-gold inline-flex items-center gap-1">
                  🏆 {{ challenge.total_points }} نقطة
                </span>
              </div>
            </div>
          </div>

          <!-- ✅ أزرار التصدير — للأدمن بس -->
          <div v-if="isAdmin" class="flex gap-2 flex-wrap self-start sm:self-auto shrink-0">
            <button
              @click="exportExcel"
              :disabled="approvedGroups.length === 0"
              class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-success hover:border-success/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              @click="exportPDF"
              :disabled="approvedGroups.length === 0"
              class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-danger hover:border-danger/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        <transition name="fade">
          <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ successMessage }}</span>
          </div>
        </transition>

        <!-- Description -->
        <div v-if="challenge.description || challenge.prize" class="card mb-4">
          <p v-if="challenge.description" class="text-sm text-navy/70 leading-relaxed">{{ challenge.description }}</p>
          <div v-if="challenge.prize" class="mt-3 flex items-center gap-2 text-sm text-gold bg-gold/5 rounded-lg px-3 py-2">
            <span class="text-base">🎁</span>
            <span>{{ challenge.prize }}</span>
          </div>
        </div>

        <!-- ✅ زر "اشترك" للخادم — في تحدي نشط -->
        <div v-if="!isAdmin && challenge.status === 'active'" class="card mb-4 bg-brand/5 border-brand/30">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-navy flex items-center gap-2">
                <Icon name="trophy" class="w-4 h-4 text-gold" />
                اشترك في التحدي
              </h2>
              <p class="text-sm text-navy/60 mt-1">اختار مجموعة أنت مسؤول عنها</p>
            </div>
            <button
              @click="openJoinModal"
              :disabled="availableGroups.length === 0"
              class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Icon name="plus" class="w-4 h-4" />
              اشترك
            </button>
          </div>
          <p v-if="availableGroups.length === 0" class="text-xs text-navy/50 mt-2">
            مفيش مجموعات متاحة للاشتراك (ممكن تكون مشتركة بالفعل أو مش مسؤول عنها)
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="مجموعات مشتركة" :value="approvedGroups.length" color="brand" />
          <StatCard label="معلقة" :value="pendingGroups.length" color="gold" />
          <StatCard label="متوسط النقاط" :value="avgPoints" color="success" />
          <StatCard label="أعلى نقاط" :value="maxPoints" color="gold" />
        </div>

        <!-- Leaderboard -->
        <div v-if="approvedGroups.length > 0" class="card mb-4 bg-gradient-to-l from-gold/10 to-transparent border-gold/30">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="text-2xl">🏆</span>
            الترتيب النهائي
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              v-for="(g, i) in topThree"
              :key="g.id"
              class="flex items-center gap-3 p-3.5 rounded-xl"
              :class="podiumClass(i)"
            >
              <span class="text-3xl shrink-0">{{ ['🥇', '🥈', '🥉'][i] }}</span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-navy truncate">{{ g.group_name }}</p>
                <p class="text-xs text-navy/60 mt-0.5 tabular-nums">
                  <strong class="text-gold">{{ g.points || 0 }}</strong> / {{ challenge.total_points }} نقطة
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Approved groups -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-success"></span>
            مجموعات مشتركة
            <span class="text-sm font-normal text-navy/50">({{ approvedGroups.length }})</span>
          </h2>

          <div v-if="approvedGroups.length === 0" class="text-center py-10">
            <div class="w-14 h-14 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-3">
              <Icon name="users" class="w-7 h-7 text-navy/40" />
            </div>
            <p class="text-navy/60 text-sm">مفيش مجموعات مشتركة لسه</p>
          </div>

          <ul v-else class="space-y-3">
            <li
              v-for="g in approvedGroups"
              :key="g.id"
              class="border border-border rounded-xl p-4 bg-page/40 hover:bg-page/60 transition-colors"
            >
              <div class="flex items-center justify-between mb-3 gap-2">
                <router-link
                  :to="`/groups/${g.group_id}`"
                  class="font-medium text-navy hover:text-brand transition-colors truncate"
                >
                  {{ g.group_name }}
                </router-link>
                <span class="text-xs text-navy/50 whitespace-nowrap">{{ formatDate(g.created_at) }}</span>
              </div>

              <!-- ✅ إدخال النقاط — للأدمن بس -->
              <div v-if="isAdmin" class="flex items-center gap-2 flex-wrap">
                <label class="text-xs text-navy/60">النقاط:</label>
                <input
                  v-model.number="pointsInput[g.id]"
                  type="number"
                  :min="0"
                  :max="challenge.total_points"
                  class="input w-20 text-sm text-center"
                />
                <span class="text-xs text-navy/40">/ {{ challenge.total_points }}</span>
                <button
                  @click="savePoints(g)"
                  :disabled="pointsInput[g.id] === g.points || savingId === g.id"
                  class="px-3 py-1.5 rounded-lg bg-success text-white text-xs font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ savingId === g.id ? 'حفظ...' : 'حفظ' }}
                </button>
                <span v-if="g.points > 0" class="text-xs text-gold font-bold mr-auto">🏆 {{ g.points }} نقطة</span>
              </div>

              <!-- ✅ للخادم: عرض النقاط بس -->
              <div v-else class="flex items-center gap-2">
                <span class="text-xs text-navy/50">النقاط:</span>
                <span class="text-sm font-bold text-gold tabular-nums">{{ g.points || 0 }} / {{ challenge.total_points }}</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Pending groups -->
        <div v-if="pendingGroups.length > 0" class="card bg-gold/5 border-gold/30">
          <h2 class="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>
            طلبات معلقة
            <span class="text-sm font-normal text-navy/50">({{ pendingGroups.length }})</span>
          </h2>
          <ul class="space-y-2">
            <li
              v-for="g in pendingGroups"
              :key="g.id"
              class="flex items-center justify-between gap-3 border-b border-border last:border-0 py-2.5 text-sm"
            >
              <div class="min-w-0">
                <p class="font-medium text-navy truncate">{{ g.group_name }}</p>
                <p class="text-xs text-navy/60 mt-0.5">بواسطة: {{ g.requested_by_name }}</p>
              </div>
              <router-link
                v-if="isAdmin"
                to="/challenges-approval"
                class="shrink-0 text-brand text-xs font-medium hover:underline"
              >
                الموافقة →
              </router-link>
              <span v-else class="text-xs text-gold">⏳ معلق</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ✅ Modal: اختيار المجموعة للاشتراك (للخادم) -->
    <div v-if="showJoinModal" class="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
      <div class="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border border-border">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-navy">اشترك في التحدي</h2>
          <button @click="showJoinModal = false" class="text-navy/40 hover:text-navy">✕</button>
        </div>
        <p class="text-sm text-navy/60 mb-4">اختار المجموعة اللي عايز تشترك بيها</p>

        <div v-if="availableGroups.length === 0" class="text-center py-6 text-navy/50 text-sm">
          مفيش مجموعات متاحة
        </div>

        <div v-else class="space-y-2 max-h-80 overflow-y-auto">
          <button
            v-for="g in availableGroups"
            :key="g.id"
            @click="joinChallenge(g.id)"
            :disabled="joining === g.id"
            class="w-full text-right flex items-center justify-between gap-2 p-3 rounded-lg border border-border hover:border-brand hover:bg-brand/5 transition-colors disabled:opacity-50"
          >
            <span class="font-medium text-navy">{{ g.name }}</span>
            <span v-if="joining === g.id" class="text-xs text-navy/50">جارٍ...</span>
            <span v-else class="text-xs text-brand">اشترك →</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import api from '../api/client'

const StatCard = {
  props: ['label', 'value', 'color'],
  template: `
    <div class="card text-center py-4">
      <p class="text-xs text-navy/50 mb-1">{{ label }}</p>
      <p class="text-2xl font-bold" :class="{
        'text-success': color === 'success',
        'text-gold': color === 'gold',
        'text-brand': !color || color === 'brand'
      }">{{ value }}</p>
    </div>
  `,
}

const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = user.role === 'admin'

const challenge = ref(null)
const participants = ref([])
const groups = ref([])
const loading = ref(true)
const successMessage = ref('')
const pointsInput = reactive({})
const savingId = ref(null)
const showJoinModal = ref(false)
const joining = ref(null)

const approvedGroups = computed(() =>
  participants.value
    .filter((p) => p.status === 'approved')
    .map((p) => {
      const g = groups.value.find((x) => x.id === p.group_id)
      return { ...p, group_name: g?.name || 'محذوفة' }
    })
)

const sortedApproved = computed(() =>
  [...approvedGroups.value].sort((a, b) => (b.points || 0) - (a.points || 0))
)

const topThree = computed(() => sortedApproved.value.slice(0, 3))

const pendingGroups = computed(() =>
  participants.value
    .filter((p) => p.status === 'pending')
    .map((p) => {
      const g = groups.value.find((x) => x.id === p.group_id)
      return { ...p, group_name: g?.name || 'محذوفة' }
    })
)

const avgPoints = computed(() => {
  if (approvedGroups.value.length === 0) return 0
  const total = approvedGroups.value.reduce((s, g) => s + (g.points || 0), 0)
  return Math.round(total / approvedGroups.value.length)
})

const maxPoints = computed(() => {
  if (approvedGroups.value.length === 0) return 0
  return Math.max(...approvedGroups.value.map((g) => g.points || 0))
})

// ✅ المجموعات المتاحة للاشتراك (اللي الخادم مسؤول عنها + مش مشتركة بالفعل)
const availableGroups = computed(() => {
  if (isAdmin) return []
  const myGroupIds = participants.value.map((p) => p.group_id)
  return groups.value.filter((g) => !myGroupIds.includes(g.id))
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function podiumClass(i) {
  if (i === 0) return 'bg-gold/20'
  if (i === 1) return 'bg-navy/10'
  return 'bg-brand/10'
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/challenges')
}

function openJoinModal() {
  showJoinModal.value = true
}

async function joinChallenge(groupId) {
  joining.value = groupId
  try {
    await api.post(`/challenges/${route.params.id}/join`, { group_id: groupId })
    showJoinModal.value = false
    successMessage.value = 'تم إرسال طلب الاشتراك — بانتظار موافقة الأدمن ✅'
    setTimeout(() => (successMessage.value = ''), 3000)
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الاشتراك')
  } finally {
    joining.value = null
  }
}

async function savePoints(g) {
  const newPoints = Number(pointsInput[g.id]) || 0
  if (newPoints < 0 || newPoints > challenge.value.total_points) {
    alert(`النقاط لازم تكون بين 0 و ${challenge.value.total_points}`)
    return
  }
  savingId.value = g.id
  try {
    await api.patch(`/challenges/participants/${g.id}`, { status: 'approved', points: newPoints })
    const idx = participants.value.findIndex((p) => p.id === g.id)
    if (idx !== -1) participants.value[idx].points = newPoints
    successMessage.value = `تم إضافة ${newPoints} نقطة لـ "${g.group_name}" ✅`
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل')
  } finally {
    savingId.value = null
  }
}

// ✅ Excel — للأدمن بس
function exportExcel() {
  if (sortedApproved.value.length === 0) return
  const rows = sortedApproved.value.map((g, i) => ({
    'الترتيب': i + 1, 'المجموعة': g.group_name, 'النقاط': g.points || 0,
    'النقاط الكلية': challenge.value.total_points,
    'النسبة %': Math.round(((g.points || 0) / challenge.value.total_points) * 100),
    'تاريخ الاشتراك': formatDate(g.created_at),
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'نتائج التحدي')
  const safeName = challenge.value.name.replace(/[\\/:*?"<>|]/g, '_')
  XLSX.writeFile(wb, `نتائج_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  successMessage.value = 'تم تصدير النتائج كـ Excel ✅'
  setTimeout(() => (successMessage.value = ''), 3000)
}

// ✅ PDF — للأدمن بس
function exportPDF() {
  if (sortedApproved.value.length === 0) return
  window.print()
}

async function loadData() {
  loading.value = true
  try {
    const [challengeRes, participantsRes, groupsRes] = await Promise.all([
      api.get(`/challenges/${route.params.id}`),
      api.get(`/challenges/${route.params.id}/participants`),
      api.get('/groups'),
    ])
    challenge.value = challengeRes.data
    participants.value = participantsRes.data
    groups.value = groupsRes.data
    participants.value.forEach((p) => { pointsInput[p.id] = p.points || 0 })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
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

@media print {
  body * { visibility: hidden; }
  .card { visibility: visible; }
}
</style>