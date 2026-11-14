<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <div v-if="loading" class="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-navy/5"></div>
          <div class="space-y-2">
            <div class="h-6 w-48 rounded bg-navy/5"></div>
            <div class="h-4 w-64 rounded bg-navy/5"></div>
          </div>
        </div>
        <div class="h-64 rounded-2xl bg-navy/5"></div>
        <div class="h-48 rounded-2xl bg-navy/5"></div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <div
        v-else-if="!group"
        class="rounded-2xl border border-border bg-card p-8 text-center"
      >
        <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <Icon name="alert" class="w-5 h-5" />
        </div>
        <p class="text-navy font-medium mb-1">المجموعة غير موجودة</p>
        <p class="text-sm text-navy/60 mb-5">يمكن اتحذفت أو اللينك غلط</p>
        <router-link
          to="/groups"
          class="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Icon name="arrow-right" class="w-4 h-4" />
          رجوع للمجموعات
        </router-link>
      </div>

      <template v-else>

        <header class="flex items-start justify-between gap-4 mb-8">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-2xl font-bold shrink-0">
              {{ group.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <p class="text-xs text-navy/50 mb-0.5">تحديات المجموعة</p>
              <h1 class="text-2xl font-bold text-navy truncate">{{ group.name }}</h1>
              <p class="text-sm text-navy/60 mt-1 flex items-center gap-3 flex-wrap tabular-nums">
                <span class="inline-flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                  {{ approvedCount }} مشترك
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  {{ pendingCount }} معلق
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-navy/30"></span>
                  {{ availableChallenges.length }} متاح
                </span>
              </p>
            </div>
          </div>
          <button
            @click="goBack"
            class="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="arrow-right" class="w-4 h-4" />
            <span>رجوع</span>
          </button>
        </header>

        <transition name="fade">
          <div
            v-if="successMessage"
            class="mb-5 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success"
            role="status"
          >
            <Icon name="check" class="w-4 h-4 shrink-0" />
            <span>{{ successMessage }}</span>
          </div>
        </transition>

        <section
          class="rounded-2xl border border-border bg-card mb-6"
          aria-labelledby="available-title"
        >
          <div class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border">
            <h2 id="available-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="trophy" class="w-4 h-4 text-gold" />
              تحديات متاحة للاشتراك
              <span class="text-sm font-normal text-navy/50">({{ availableChallenges.length }})</span>
            </h2>
          </div>

          <div v-if="availableChallenges.length === 0" class="px-5 sm:px-6 py-10 text-center">
            <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
              <Icon name="trophy" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60">مفيش تحديات متاحة للاشتراك دلوقتي</p>
            <p class="text-xs text-navy/40 mt-1">تابع لما الأدمن يضيف تحديات جديدة</p>
          </div>

          <div v-else class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <article
              v-for="c in availableChallenges"
              :key="c.id"
              class="group rounded-xl border border-border bg-card p-4 hover:border-brand/50 hover:shadow-sm transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center text-xl shrink-0">
                    {{ c.icon || '🏆' }}
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-semibold text-navy text-sm truncate">{{ c.name }}</h3>
                    <p class="text-xs text-navy/50 tabular-nums">{{ c.total_points }} نقطة</p>
                  </div>
                </div>
                <span
                  class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
                  :class="c.status === 'active'
                    ? 'bg-success/10 text-success'
                    : 'bg-navy/10 text-navy/60'"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ c.status === 'active' ? 'نشط' : 'منتهي' }}
                </span>
              </div>

              <p v-if="c.description" class="text-xs text-navy/70 mb-3 line-clamp-2">{{ c.description }}</p>

              <div class="flex items-center gap-1.5 text-[11px] text-navy/50 mb-3">
                <Icon name="calendar" class="w-3.5 h-3.5" />
                <span class="tabular-nums">{{ formatDate(c.start_date) }} → {{ formatDate(c.end_date) }}</span>
              </div>

              <button
                @click="joinChallenge(c)"
                :disabled="joining === c.id"
                class="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <svg
                  v-if="joining === c.id"
                  class="animate-spin w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <Icon v-else name="plus" class="w-3.5 h-3.5" />
                {{ joining === c.id ? 'جارٍ الإرسال...' : 'اشترك في التحدي' }}
              </button>
            </article>
          </div>
        </section>

        <section
          class="rounded-2xl border border-border bg-card"
          aria-labelledby="mine-title"
        >
          <div class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border">
            <h2 id="mine-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="check" class="w-4 h-4 text-success" />
              تحديات مشترك فيها
              <span class="text-sm font-normal text-navy/50">({{ myChallenges.length }})</span>
            </h2>
          </div>

          <div v-if="myChallenges.length === 0" class="px-5 sm:px-6 py-10 text-center">
            <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
              <Icon name="trophy" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60">مش مشترك في أي تحدي لسه</p>
            <p class="text-xs text-navy/40 mt-1">اختار تحدي من فوق وابدأ</p>
          </div>

          <ul v-else class="divide-y divide-border">
            <li
              v-for="gc in myChallenges"
              :key="gc.id"
              class="px-5 sm:px-6 py-4 hover:bg-page/40 transition-colors"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center text-xl shrink-0">
                    {{ gc.challenge_icon }}
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-semibold text-navy text-sm truncate">{{ gc.challenge_name }}</h3>
                    <p class="text-xs text-navy/50 tabular-nums">{{ gc.challenge_total_points }} نقطة كحد أقصى</p>
                  </div>
                </div>

                <span
                  class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"
                  :class="statusClass(gc.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ statusLabel(gc.status) }}
                </span>
              </div>

              <div
                v-if="gc.status === 'approved'"
                class="mt-3 flex items-center gap-2 text-sm"
              >
                <span class="text-xs text-navy/50">النقاط:</span>
                <span class="font-bold text-gold tabular-nums">{{ gc.points || 0 }}</span>
                <span class="text-xs text-navy/40 tabular-nums">/ {{ gc.challenge_total_points }}</span>
                <div class="flex-1 h-1.5 rounded-full bg-navy/5 overflow-hidden mr-2" role="progressbar" :aria-valuenow="gc.points || 0" aria-valuemin="0" :aria-valuemax="gc.challenge_total_points">
                  <div
                    class="h-full rounded-full bg-gold transition-all duration-500"
                    :style="{ width: progressPercent(gc) + '%' }"
                  ></div>
                </div>
              </div>

              <p v-if="gc.status === 'pending'" class="mt-2.5 text-xs text-gold inline-flex items-center gap-1.5">
                <Icon name="clock" class="w-3.5 h-3.5" />
                بانتظار موافقة الأدمن
              </p>

              <p v-if="gc.status === 'rejected'" class="mt-2.5 text-xs text-danger inline-flex items-center gap-1.5">
                <Icon name="x" class="w-3.5 h-3.5" />
                تم رفض الاشتراك
              </p>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

const ICONS = {
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  clock: 'M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  'arrow-right': 'M9 5l7 7-7 7',
}

const Icon = {
  props: { name: String },
  setup(props) {
    return () =>
      h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
          class: 'shrink-0',
        },
        [h('path', { d: ICONS[props.name] || '' })]
      )
  },
}

const route = useRoute()
const router = useRouter()
const group = ref(null)
const challenges = ref([])
const groupChallenges = ref([])
const loading = ref(true)
const joining = ref(null)
const successMessage = ref('')

const myChallenges = computed(() =>
  groupChallenges.value
    .filter((gc) => gc.group_id === group.value?.id)
    .map((gc) => {
      const c = challenges.value.find((x) => x.id === gc.challenge_id)
      return {
        ...gc,
        challenge_name: c?.name || 'تحدي محذوف',
        challenge_icon: c?.icon || '🏆',
        challenge_total_points: c?.total_points || 0,
      }
    })
)

const availableChallenges = computed(() => {
  const myIds = myChallenges.value.map((gc) => gc.challenge_id)
  return challenges.value.filter((c) => c.status === 'active' && !myIds.includes(c.id))
})

const approvedCount = computed(() => myChallenges.value.filter((gc) => gc.status === 'approved').length)
const pendingCount = computed(() => myChallenges.value.filter((gc) => gc.status === 'pending').length)

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

function statusLabel(status) {
  return status === 'approved' ? 'مقبول' : status === 'pending' ? 'معلق' : 'مرفوض'
}

function statusClass(status) {
  if (status === 'approved') return 'bg-success/10 text-success'
  if (status === 'pending') return 'bg-gold/15 text-gold'
  return 'bg-danger/10 text-danger'
}

function progressPercent(gc) {
  if (!gc.challenge_total_points) return 0
  return Math.min(100, Math.round(((gc.points || 0) / gc.challenge_total_points) * 100))
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/groups')
}

async function joinChallenge(challenge) {
  if (!confirm(`الاشتراك في تحدي "${challenge.name}"؟`)) return
  joining.value = challenge.id
  try {
    await api.post(`/challenges/${challenge.id}/join`, { group_id: group.value.id })
    await loadData()
    successMessage.value = `تم إرسال طلب الاشتراك — بانتظار موافقة الأدمن`
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل')
  } finally {
    joining.value = null
  }
}

async function loadData() {
  loading.value = true
  try {
    const [groupRes, challengesRes] = await Promise.all([
      api.get(`/groups/${route.params.id}`),
      api.get('/challenges'),
    ])
    group.value = groupRes.data
    challenges.value = challengesRes.data

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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>