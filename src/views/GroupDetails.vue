<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- ============ Loading skeleton ============ -->
      <div v-if="loading" class="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-navy/5"></div>
          <div class="space-y-2">
            <div class="h-6 w-40 rounded bg-navy/5"></div>
            <div class="h-4 w-56 rounded bg-navy/5"></div>
          </div>
        </div>
        <div class="h-32 rounded-2xl bg-navy/5"></div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="i in 4" :key="i" class="h-20 rounded-2xl bg-navy/5"></div>
        </div>
        <div class="h-64 rounded-2xl bg-navy/5"></div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <!-- ============ Not found ============ -->
      <div
        v-else-if="!group"
        class="rounded-2xl border border-border bg-white p-8 text-center"
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

        <!-- ============ Header ============ -->
        <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-2xl font-bold shrink-0">
              {{ group.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <p class="text-xs text-navy/50 mb-0.5">تفاصيل المجموعة</p>
              <h1 class="text-2xl font-bold text-navy truncate">{{ group.name }}</h1>
              <p class="text-sm text-navy/60 mt-1 flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1">
                  <Icon name="user" class="w-3.5 h-3.5" />
                  {{ group.servant_name || 'بدون خادم' }}
                </span>
                <span v-if="group.co_servant_name" class="inline-flex items-center gap-1 text-navy/40">
                  • مساعد: {{ group.co_servant_name }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <Icon name="users" class="w-3.5 h-3.5" />
                  {{ members.length }} عضو
                </span>
              </p>
            </div>
          </div>

          <div class="flex gap-2 flex-wrap self-start sm:self-auto">
            <router-link
              :to="`/groups/${group.id}/challenges`"
              class="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <Icon name="trophy" class="w-4 h-4" />
              التحديات
            </router-link>
            <button
              @click="goBack"
              class="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <Icon name="arrow-right" class="w-4 h-4" />
              رجوع
            </button>
          </div>
        </header>

        <!-- ============ Success ============ -->
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

        <!-- ============ Description ============ -->
        <section
          v-if="group.description"
          class="rounded-2xl border border-border bg-white p-4 sm:p-5 mb-5"
        >
          <p class="text-sm text-navy/70 leading-relaxed">{{ group.description }}</p>
        </section>

        <!-- ============ Score card ============ -->
        <section
          class="rounded-2xl border border-border bg-gradient-to-l from-gold/5 to-transparent p-5 sm:p-6 mb-5"
          aria-labelledby="score-title"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="min-w-0">
              <h2 id="score-title" class="text-base font-semibold text-navy flex items-center gap-2">
                <Icon name="trophy" class="w-4 h-4 text-gold" />
                نقاط المجموعة
              </h2>
              <p class="text-xs text-navy/50 mt-0.5">محسوبة من الحضور والافتقاد والتحديات</p>
            </div>
            <div class="text-left shrink-0">
              <p class="text-3xl font-bold tabular-nums leading-none" :class="scoreLevelClass(scoreData.total).text">
                {{ scoreData.total }}
              </p>
              <p class="text-xs mt-1 inline-flex items-center gap-1" :class="scoreLevelClass(scoreData.total).text">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                {{ scoreLevelLabel(scoreData.total) }}
              </p>
            </div>
          </div>

          <ul v-if="scoreData.breakdown.length > 0" class="divide-y divide-border">
            <li
              v-for="(b, i) in scoreData.breakdown"
              :key="i"
              class="flex items-center justify-between py-2.5 text-sm gap-3"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-base shrink-0">{{ b.icon }}</span>
                <span class="text-navy truncate">{{ b.label }}</span>
              </div>
              <span
                class="shrink-0 font-bold tabular-nums"
                :class="b.points >= 0 ? 'text-success' : 'text-danger'"
              >
                {{ b.points > 0 ? '+' : '' }}{{ b.points }}
              </span>
            </li>
          </ul>

          <div v-else class="text-center py-6">
            <div class="mx-auto mb-2 w-10 h-10 rounded-full bg-navy/5 text-navy/40 flex items-center justify-center">
              <Icon name="chart" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60">مفيش معايير متاحة لحساب النقاط لسه</p>
          </div>
        </section>

        <!-- ============ Stats ============ -->
        <section
          class="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border mb-5"
          aria-label="إحصائيات"
        >
          <Stat label="نسبة الحضور" :value="`${attendanceRate}%`" :tone="attendanceRate >= 70 ? 'ok' : 'danger'" />
          <Stat label="محتاجين افتقاد" :value="needsFollowupCount" :tone="needsFollowupCount ? 'gold' : 'muted'" />
          <Stat label="متوسط الخطر" :value="avgRisk" :tone="avgRisk >= 50 ? 'danger' : 'ok'" />
          <Stat label="غايبين 3 مرات" :value="consecutiveAbsent.length" :tone="consecutiveAbsent.length ? 'danger' : 'muted'" />
        </section>

        <!-- ============ Members ============ -->
        <section
          class="rounded-2xl border border-border bg-white"
          aria-labelledby="members-title"
        >
          <div class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border">
            <h2 id="members-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="users" class="w-4 h-4 text-navy/60" />
              الأعضاء
              <span class="text-sm font-normal text-navy/50">({{ members.length }})</span>
            </h2>
          </div>

          <!-- Empty -->
          <div v-if="members.length === 0" class="px-5 sm:px-6 py-12 text-center">
            <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
              <Icon name="users" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60">مفيش أعضاء في المجموعة دي لسه</p>
          </div>

          <!-- List -->
          <ul v-else class="divide-y divide-border">
            <li
              v-for="m in members"
              :key="m.id"
              class="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 hover:bg-page/40 transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-lg bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                  {{ m.full_name.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <router-link
                    :to="`/members/${m.id}`"
                    class="text-sm font-medium text-navy hover:text-brand transition-colors truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                  >
                    {{ m.full_name }}
                  </router-link>
                  <p class="text-xs text-navy/50 truncate">{{ m.grade }}</p>
                </div>
              </div>
              <span class="shrink-0 text-xs text-navy/60 inline-flex items-center gap-1">
                <Icon name="user" class="w-3 h-3" />
                {{ m.servant_name || '—' }}
              </span>
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
import { calculateRiskScore } from '../utils/riskScore'
import { calculateGroupScore } from '../utils/groupScore'

/* ================= Icon component ================= */
const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  check: 'M20 6 9 17l-5-5',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  chart: 'M3 3v18h18M7 14l4-4 4 4 5-5',
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

/* ================= Stat component ================= */
const Stat = {
  props: {
    label: String,
    value: [String, Number],
    tone: { type: String, default: 'default' },
  },
  setup(props) {
    const toneClass = {
      default: 'text-navy',
      ok: 'text-success',
      danger: 'text-danger',
      gold: 'text-gold',
      muted: 'text-navy/40',
    }
    return () =>
      h('div', { class: 'bg-white px-4 py-3.5' }, [
        h('p', { class: 'text-xs text-navy/50 mb-1' }, props.label),
        h(
          'p',
          { class: ['text-2xl font-bold tabular-nums', toneClass[props.tone] || toneClass.default] },
          String(props.value)
        ),
      ])
  },
}

/* ================= State ================= */
const route = useRoute()
const router = useRouter()

const group = ref(null)
const members = ref([])
const followupsMap = ref({})
const attendanceData = ref({})
const challenges = ref([])
const groupChallenges = ref([])
const loading = ref(true)
const successMessage = ref('')

/* ================= Computed ================= */
const scoreData = computed(() => {
  if (!group.value) return { total: 0, breakdown: [] }
  return calculateGroupScore(
    group.value,
    members.value,
    attendanceData.value,
    followupsMap.value,
    groupChallenges.value,
    challenges.value
  )
})

const attendanceRate = computed(() => {
  const dates = Object.keys(attendanceData.value)
    .map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()
    .slice(0, 4)
  if (dates.length === 0 || members.value.length === 0) return 0

  const memberIds = members.value.map((m) => m.id)
  let total = 0
  let present = 0
  dates.forEach((d) => {
    const key = Object.keys(attendanceData.value).find((k) => k.startsWith(d))
    if (!key) return
    const records = attendanceData.value[key]
    memberIds.forEach((id) => {
      if (records[id] !== undefined) {
        total++
        if (records[id]) present++
      }
    })
  })
  return total === 0 ? 0 : Math.round((present / total) * 100)
})

const needsFollowupCount = computed(() => {
  const today = new Date()
  return members.value.filter((m) => {
    const list = followupsMap.value[m.id] || []
    if (list.length === 0) return true
    const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
    const days = Math.floor((today - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24))
    return days > 30
  }).length
})

const avgRisk = computed(() => {
  if (members.value.length === 0) return 0
  const total = members.value.reduce((sum, m) => {
    const r = calculateRiskScore(m, followupsMap.value[m.id] || [], attendanceData.value)
    return sum + r.score
  }, 0)
  return Math.round(total / members.value.length)
})

const consecutiveAbsent = computed(() => {
  const dates = Object.keys(attendanceData.value)
    .map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()
    .slice(0, 5)
  if (dates.length < 3) return []

  return members.value.filter((m) => {
    let count = 0
    for (const d of dates) {
      const key = Object.keys(attendanceData.value).find((k) => k.startsWith(d))
      if (!key) break
      const records = attendanceData.value[key]
      if (records[m.id] === false || records[m.id] === undefined) count++
      else break
    }
    return count >= 3
  })
})

/* ================= Helpers ================= */
function scoreLevelClass(score) {
  if (score >= 80) return { text: 'text-success' }
  if (score >= 60) return { text: 'text-gold' }
  if (score >= 40) return { text: 'text-gold' }
  return { text: 'text-danger' }
}

function scoreLevelLabel(score) {
  if (score >= 80) return 'ممتاز'
  if (score >= 60) return 'جيد'
  if (score >= 40) return 'متوسط'
  return 'ضعيف'
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/groups')
}

/* ================= Actions ================= */
async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get(`/groups/${route.params.id}/full`)
    group.value = data.group
    members.value = data.members
    followupsMap.value = data.followups
    attendanceData.value = data.attendance
    challenges.value = data.challenges
    groupChallenges.value = data.groupChallenges
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