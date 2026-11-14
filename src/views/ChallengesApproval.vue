<template>
  <div class="min-h-screen bg-page py-8 px-4" dir="rtl">
    <div class="max-w-4xl mx-auto">

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-start gap-3">
          <button
            type="button"
            @click="goBack"
            class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/30"
            aria-label="رجوع"
            title="رجوع"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-navy">طلبات الاشتراك في التحديات</h1>
            <p class="text-sm text-navy/60 mt-1">
              <span v-if="pendingRequests.length > 0" class="text-gold font-medium">{{ pendingRequests.length }}</span>
              <span v-else>{{ pendingRequests.length }}</span>
              طلب بانتظار الموافقة
            </p>
          </div>
        </div>
        <div class="flex gap-2 self-start sm:self-auto">
          <router-link
            to="/challenges"
            class="px-4 py-2 rounded-lg border border-border text-navy bg-card text-sm hover:bg-navy/5 transition-colors duration-200 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            التحديات
          </router-link>
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

      <div v-if="loading" class="card flex flex-col items-center justify-center py-16 gap-3">
        <svg class="animate-spin w-7 h-7 text-navy/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span class="text-navy/50 text-sm">جارٍ التحميل...</span>
      </div>

      <div v-else-if="pendingRequests.length === 0" class="card text-center py-16">
        <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-navy/60 font-medium">مفيش طلبات معلقة</p>
        <p class="text-xs text-navy/40 mt-1">كل الطلبات تمت معالجتها</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="r in pendingRequests"
          :key="r.id"
          class="card hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-gold/20 text-gold flex items-center justify-center text-2xl shrink-0">
                {{ r.challenge_icon || '🏆' }}
              </div>
              <div class="min-w-0">
                <h2 class="font-semibold text-navy truncate">{{ r.challenge_name }}</h2>
                <p class="text-sm text-navy/60 truncate">
                  مجموعة: <strong class="text-navy">{{ r.group_name }}</strong>
                </p>
              </div>
            </div>
            <span class="text-xs text-navy/50 whitespace-nowrap shrink-0">{{ formatDate(r.created_at) }}</span>
          </div>

          <div class="bg-page/50 rounded-lg p-3 mb-3 text-sm text-navy/70 space-y-1.5">
            <p class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-navy/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              طلب بواسطة: <strong class="text-navy">{{ r.requested_by_name }}</strong>
            </p>
            <p class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              النقاط الكلية: <strong class="text-gold">{{ r.challenge_total_points }} نقطة</strong>
            </p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              @click="reject(r)"
              :disabled="actionLoadingId === r.id"
              class="px-4 py-2 rounded-lg bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1.5"
            >
              <svg v-if="actionLoadingId === r.id && actionType === 'reject'" class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              رفض
            </button>
            <button
              @click="approve(r)"
              :disabled="actionLoadingId === r.id"
              class="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1.5"
            >
              <svg v-if="actionLoadingId === r.id && actionType === 'approve'" class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              موافقة
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'

const router = useRouter()

const groupChallenges = ref([])
const challenges = ref([])
const groups = ref([])
const loading = ref(false)
const successMessage = ref('')
const actionLoadingId = ref(null)
const actionType = ref('')

const pendingRequests = computed(() =>
  groupChallenges.value
    .filter((gc) => gc.status === 'pending')
    .map((gc) => {
      const c = challenges.value.find((x) => x.id === gc.challenge_id)
      const g = groups.value.find((x) => x.id === gc.group_id)
      return {
        ...gc,
        challenge_name: c?.name || 'تحدي محذوف',
        challenge_icon: c?.icon || '🏆',
        challenge_total_points: c?.total_points || 0,
        group_name: g?.name || 'مجموعة محذوفة',
      }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/challenges')
}

async function approve(r) {
  if (!confirm(`موافقة على اشتراك "${r.group_name}"؟`)) return
  actionLoadingId.value = r.id
  actionType.value = 'approve'
  try {
    await api.patch(`/challenges/participants/${r.id}`, { status: 'approved' })
    await loadData()
    successMessage.value = 'تمت الموافقة ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل')
  } finally {
    actionLoadingId.value = null
    actionType.value = ''
  }
}

async function reject(r) {
  if (!confirm(`رفض اشتراك "${r.group_name}"؟`)) return
  actionLoadingId.value = r.id
  actionType.value = 'reject'
  try {
    await api.patch(`/challenges/participants/${r.id}`, { status: 'rejected' })
    await loadData()
    successMessage.value = 'تم الرفض ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل')
  } finally {
    actionLoadingId.value = null
    actionType.value = ''
  }
}

async function loadData() {
  loading.value = true
  try {
    const [challengesRes, groupsRes] = await Promise.all([
      api.get('/challenges'),
      api.get('/groups'),
    ])
    challenges.value = challengesRes.data
    groups.value = groupsRes.data

    const allParticipants = []
    for (const c of challengesRes.data) {
      const res = await api.get(`/challenges/${c.id}/participants`)
      allParticipants.push(...res.data)
    }
    groupChallenges.value = allParticipants
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