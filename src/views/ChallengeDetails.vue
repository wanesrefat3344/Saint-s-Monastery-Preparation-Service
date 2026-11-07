<template>
  <div class="min-h-screen bg-page py-8 px-4" dir="rtl">
    <div class="max-w-5xl mx-auto">

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <svg class="animate-spin w-7 h-7 text-navy/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span class="text-navy/50 text-sm">جارٍ التحميل...</span>
      </div>

      <!-- Not found -->
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
              class="mt-2 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/30"
              aria-label="رجوع"
              title="رجوع"
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
                  :class="challenge.status === 'active'
                    ? 'bg-success/10 text-success'
                    : 'bg-navy/10 text-navy/60'"
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
        </div>

        <!-- Success message -->
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

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="مجموعات مشتركة" :value="approvedGroups.length" color="brand" />
          <StatCard label="معلقة" :value="pendingGroups.length" color="gold" />
          <StatCard label="متوسط النقاط" :value="avgPoints" color="success" />
          <StatCard label="أعلى نقاط" :value="maxPoints" color="gold" />
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
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p class="text-navy/60 text-sm">مفيش مجموعات مشتركة لسه</p>
          </div>

          <ul v-else class="space-y-3">
            <li
              v-for="g in approvedGroups"
              :key="g.id"
              class="border border-border rounded-xl p-4 bg-page/40 hover:bg-page/60 transition-colors duration-150"
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
              <div class="flex items-center gap-2 flex-wrap">
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
                  class="px-3 py-1.5 rounded-lg bg-success text-white text-xs font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1.5"
                >
                  <svg v-if="savingId === g.id" class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  {{ savingId === g.id ? 'حفظ...' : 'حفظ' }}
                </button>
                <span v-if="g.points > 0" class="text-xs text-gold font-bold mr-auto">🏆 {{ g.points }} نقطة</span>
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
                to="/challenges-approval"
                class="shrink-0 text-brand text-xs font-medium hover:underline inline-flex items-center gap-1"
              >
                الموافقة
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const challenge = ref(null)
const participants = ref([])
const groups = ref([])
const loading = ref(true)
const successMessage = ref('')
const pointsInput = reactive({})
const savingId = ref(null)

const approvedGroups = computed(() =>
  participants.value
    .filter((p) => p.status === 'approved')
    .map((p) => {
      const g = groups.value.find((x) => x.id === p.group_id)
      return { ...p, group_name: g?.name || 'محذوفة' }
    })
)

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

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/challenges')
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
</style>