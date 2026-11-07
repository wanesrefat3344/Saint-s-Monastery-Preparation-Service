<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- الهيدر -->
      <header class="flex items-start justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">{{ todayLabel }}</p>
          <h1 class="text-2xl font-bold text-navy truncate">
            أهلاً {{ user?.name || 'بك' }}
          </h1>
          <p class="text-sm text-navy/60 mt-1">{{ roleLabel }}</p>
        </div>
        <button
          @click="logout"
          class="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy/70 hover:text-danger hover:border-danger/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Icon name="logout" class="w-4 h-4" />
          <span>خروج</span>
        </button>
      </header>

      <!-- التحميل -->
      <div v-if="loading" class="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
        <div class="h-28 rounded-2xl bg-navy/5"></div>
        <div class="h-24 rounded-2xl bg-navy/5"></div>
        <div class="h-40 rounded-2xl bg-navy/5"></div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <!-- خطأ -->
      <div v-else-if="error" class="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center">
        <p class="text-navy font-medium mb-1">مقدرناش نحمّل البيانات</p>
        <p class="text-sm text-navy/60 mb-4">اتأكد من الاتصال بالنت وجرّب تاني.</p>
        <button
          @click="loadData"
          class="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          إعادة المحاولة
        </button>
      </div>

      <template v-else>

        <!-- صحة الخدمة -->
        <section class="rounded-2xl border border-border bg-white p-5 sm:p-6 mb-6" aria-labelledby="health-title">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <h2 id="health-title" class="flex items-center gap-2 text-base font-semibold text-navy">
                <span class="inline-block w-2.5 h-2.5 rounded-full" :class="healthColor.dot"></span>
                صحة الخدمة: {{ healthLabel }}
              </h2>
              <p class="text-sm text-navy/60 mt-1">{{ healthMessage }}</p>
            </div>
            <p class="shrink-0 text-3xl font-bold tabular-nums" :class="healthColor.text">
              {{ healthScore }}<span class="text-sm font-normal text-navy/40">/100</span>
            </p>
          </div>
          <div
            class="mt-4 h-1.5 w-full rounded-full bg-navy/5 overflow-hidden"
            role="progressbar"
            :aria-valuenow="healthScore"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="h-full rounded-full transition-all duration-700" :class="healthColor.bar" :style="{ width: healthScore + '%' }"></div>
          </div>
        </section>

        <!-- إحصائيات -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border mb-6" aria-label="إحصائيات">
          <Stat label="إجمالي المخدومين" :value="members.length" />
          <Stat
            label="حضور الأسبوع"
            :value="`${attendanceRate}%`"
            :tone="attendanceRate >= 70 ? 'ok' : 'danger'"
          />
          <Stat label="غايبين 3 مرات" :value="consecutiveAbsent.length" :tone="consecutiveAbsent.length ? 'danger' : 'muted'" />
          <Stat label="محتاجين افتقاد" :value="needsFollowupCount" :tone="needsFollowupCount ? 'gold' : 'muted'" />
        </section>

        <!-- محتاج انتباهك -->
        <section class="rounded-2xl border border-border bg-white mb-8" aria-labelledby="attention-title">
          <div class="flex items-center justify-between px-5 sm:px-6 pt-5">
            <h2 id="attention-title" class="text-base font-semibold text-navy">محتاج انتباهك</h2>
            <router-link
              v-if="needsFollowupCount > 0"
              to="/followups"
              class="text-sm text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
            >
              فتح الافتقاد ({{ needsFollowupCount }})
            </router-link>
          </div>

          <!-- كله تمام -->
          <div v-if="!alerts.length" class="px-5 sm:px-6 py-8 text-center">
            <div class="mx-auto mb-3 w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
              <Icon name="check" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/70">مفيش حاجة محتاجة متابعة دلوقتي.</p>
          </div>

          <div v-else class="px-5 sm:px-6 pb-5 pt-3 space-y-4">
            <ul class="space-y-2">
              <li
                v-for="(a, i) in alerts"
                :key="i"
                class="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                :class="a.type === 'danger' ? 'bg-danger/5 text-danger' : 'bg-gold/10 text-navy'"
              >
                <Icon :name="a.type === 'danger' ? 'alert' : 'phone'" class="w-4 h-4 mt-0.5 shrink-0" :class="a.type === 'danger' ? '' : 'text-gold'" />
                <span>{{ a.message }}</span>
              </li>
            </ul>

            <div v-if="consecutiveAbsent.length">
              <p class="text-xs text-navy/50 mb-1">غابوا 3 مرات متتالية</p>
              <ul class="text-sm">
                <li
                  v-for="m in visibleAbsent"
                  :key="m.id"
                  class="flex items-center justify-between gap-3 border-b border-border last:border-0 py-2.5"
                >
                  <router-link
                    :to="`/members/${m.id}`"
                    class="text-navy font-medium hover:text-brand truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                  >
                    {{ m.full_name }}
                  </router-link>
                  <span class="shrink-0 text-xs text-danger bg-danger/5 rounded-full px-2.5 py-1">
                    غايب {{ m.absentCount }} اجتماع
                  </span>
                </li>
              </ul>
              <button
                v-if="consecutiveAbsent.length > 5"
                @click="showAllAbsent = !showAllAbsent"
                class="mt-2 text-sm text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
              >
                {{ showAllAbsent ? 'عرض أقل' : `عرض الكل (${consecutiveAbsent.length})` }}
              </button>
            </div>
          </div>
        </section>

        <!-- الإجراءات الأساسية -->
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" aria-label="إجراءات سريعة">
          <router-link
            to="/attendance"
            class="group flex items-center gap-4 rounded-2xl bg-brand text-white p-5 hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
          >
            <span class="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <Icon name="check" class="w-5 h-5" />
            </span>
            <span>
              <span class="block font-semibold">تسجيل الحضور</span>
              <span class="block text-sm text-white/80 mt-0.5">سجّل حضور الاجتماع</span>
            </span>
          </router-link>

          <router-link
            to="/members/new"
            class="group flex items-center gap-4 rounded-2xl border border-border bg-white p-5 hover:border-brand/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span class="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Icon name="plus" class="w-5 h-5" />
            </span>
            <span>
              <span class="block font-semibold text-navy">تسجيل مخدوم</span>
              <span class="block text-sm text-navy/60 mt-0.5">إضافة مخدوم جديد</span>
            </span>
          </router-link>

          <!-- جديد: الإعدادات للأدمن -->
          <router-link
            v-if="isAdmin"
            to="/settings"
            class="group flex items-center gap-4 rounded-2xl border border-border bg-white p-5 hover:border-brand/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span class="w-11 h-11 rounded-xl bg-navy/5 text-navy/70 group-hover:bg-brand/10 group-hover:text-brand transition-colors flex items-center justify-center">
              <Icon name="settings" class="w-5 h-5" />
            </span>
            <span>
              <span class="block font-semibold text-navy group-hover:text-brand transition-colors">الإعدادات</span>
              <span class="block text-sm text-navy/60 mt-0.5">النسخ الاحتياطي والبيانات</span>
            </span>
          </router-link>
        </section>

        <!-- باقي الأقسام -->
        <section v-for="group in linkGroups" :key="group.title" class="mb-8 last:mb-0">
          <h2 class="text-sm font-semibold text-navy/60 mb-3">{{ group.title }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <router-link
              v-for="l in group.items"
              :key="l.to"
              :to="l.to"
              class="group relative flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 hover:border-brand/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <span class="w-9 h-9 rounded-lg bg-page text-navy/70 group-hover:bg-brand/10 group-hover:text-brand transition-colors flex items-center justify-center">
                <Icon :name="l.icon" class="w-[18px] h-[18px]" />
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-navy group-hover:text-brand transition-colors">{{ l.label }}</span>
                <span class="block text-xs text-navy/50 mt-0.5 truncate">{{ l.desc }}</span>
              </span>
              <span
                v-if="l.badge"
                class="absolute top-3 left-3 min-w-[20px] text-center bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              >
                {{ l.badge }}
              </span>
            </router-link>
          </div>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'

/* ───────── أيقونات بسيطة (stroke) ───────── */
const ICONS = {
  plus: 'M12 5v14M5 12h14',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  check: 'M20 6 9 17l-5-5',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  chart: 'M3 3v18h18M7 14l4-4 4 4 5-5',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
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
        },
        [h('path', { d: ICONS[props.name] || '' })]
      )
  },
}

/* ───────── خانة الإحصائية ───────── */
const Stat = {
  props: { label: String, value: [String, Number], tone: { type: String, default: 'default' } },
  setup(props) {
    const toneClass = {
      default: 'text-navy',
      ok: 'text-success',
      danger: 'text-danger',
      gold: 'text-gold',
      muted: 'text-navy/40',
    }
    return () =>
      h('div', { class: 'bg-white px-5 py-4' }, [
        h('p', { class: 'text-xs text-navy/50 mb-1.5' }, props.label),
        h('p', { class: ['text-2xl font-bold tabular-nums', toneClass[props.tone] || toneClass.default] }, String(props.value)),
      ])
  },
}

/* ───────── الحالة ───────── */
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = user.role === 'admin'

const members = ref([])
const followupsMap = ref({})
const attendanceData = ref({})
const loading = ref(false)
const error = ref(false)
const showAllAbsent = ref(false)

const todayLabel = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
const roleLabel = computed(() =>
  user?.role === 'admin' ? 'أدمن' : user?.role === 'reader' ? 'مسجل قراءات' : 'خادم'
)

/* ───────── الحسابات ───────── */
const needsFollowupList = computed(() => {
  const today = new Date()
  const result = []
  members.value.forEach((m) => {
    const list = followupsMap.value[m.id] || []
    if (list.length === 0) { result.push({ ...m, daysSince: null }); return }
    const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
    const days = Math.floor((today - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24))
    if (days > 30) result.push({ ...m, daysSince: days })
  })
  return result
})
const needsFollowupCount = computed(() => needsFollowupList.value.length)

const attendanceRate = computed(() => {
  if (members.value.length === 0) return 0
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  let total = 0, present = 0
  Object.entries(attendanceData.value).forEach(([key, records]) => {
    const date = new Date(key.split('_')[0])
    if (date >= weekAgo && date <= today) {
      Object.values(records).forEach((v) => { total++; if (v) present++ })
    }
  })
  return total === 0 ? 0 : Math.round((present / total) * 100)
})

const consecutiveAbsent = computed(() => {
  const dates = Object.keys(attendanceData.value).map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i).sort().reverse().slice(0, 5)
  if (dates.length < 3) return []

  const result = []
  members.value.forEach((m) => {
    let count = 0
    for (const d of dates) {
      const key = Object.keys(attendanceData.value).find((k) => k.startsWith(d))
      if (!key) break
      const records = attendanceData.value[key]
      if (records[m.id] === false || records[m.id] === undefined) count++
      else break
    }
    if (count >= 3) result.push({ ...m, absentCount: count })
  })
  return result.sort((a, b) => b.absentCount - a.absentCount)
})

const visibleAbsent = computed(() =>
  showAllAbsent.value ? consecutiveAbsent.value : consecutiveAbsent.value.slice(0, 5)
)

const healthScore = computed(() => {
  let score = 100
  if (attendanceRate.value < 70) score -= (70 - attendanceRate.value) * 0.5
  score -= consecutiveAbsent.value.length * 5
  score -= needsFollowupCount.value * 1
  return Math.max(0, Math.min(100, Math.round(score)))
})

const healthLabel = computed(() =>
  healthScore.value >= 80 ? 'ممتازة' : healthScore.value >= 60 ? 'جيدة' : healthScore.value >= 40 ? 'تحتاج متابعة' : 'في خطر'
)
const healthMessage = computed(() =>
  healthScore.value >= 80 ? 'الخدمة ماشية كويس!' : healthScore.value >= 60 ? 'فيه نقاط محتاجة متابعة' : 'فيه مشاكل محتاجة تدخل'
)
const healthColor = computed(() =>
  healthScore.value >= 80
    ? { dot: 'bg-success', bar: 'bg-success', text: 'text-success' }
    : healthScore.value >= 60
      ? { dot: 'bg-gold', bar: 'bg-gold', text: 'text-gold' }
      : { dot: 'bg-danger', bar: 'bg-danger', text: 'text-danger' }
)

const alerts = computed(() => {
  const list = []
  if (consecutiveAbsent.value.length > 0) list.push({ type: 'danger', message: `${consecutiveAbsent.value.length} مخدوم غابوا 3 مرات متتالية` })
  if (needsFollowupCount.value > 0) list.push({ type: 'warn', message: `${needsFollowupCount.value} مخدوم محتاجين افتقاد` })
  return list
})

/* ───────── الروابط ───────── */
const linkGroups = computed(() => {
  const groups = [
    {
      title: 'الخدمة',
      items: [
        { to: '/members', label: 'قائمة المخدومين', desc: 'عرض وبحث', icon: 'list' },
        { to: '/followups', label: 'الافتقاد', desc: 'متابعة المحتاجين', icon: 'phone', badge: needsFollowupCount.value || null },
        { to: '/readings', label: 'القراءات', desc: 'قراءات الإنجيل', icon: 'book' },
        { to: '/reports', label: 'التقارير', desc: 'إحصائيات', icon: 'chart' },
      ],
    },
  ]
  if (isAdmin) {
    groups.push({
      title: 'الإدارة',
      items: [
        { to: '/servants', label: 'الخدام', desc: 'إدارة الخدام', icon: 'user' },
        { to: '/groups', label: 'المجموعات', desc: 'إدارة المجموعات', icon: 'users' },
        { to: '/challenges', label: 'التحديات', desc: 'إدارة التحديات', icon: 'trophy' },
        { to: '/audit-log', label: 'سجل النشاط', desc: 'كل العمليات', icon: 'list' },
        { to: '/settings', label: 'الإعدادات', desc: 'النسخ الاحتياطي والبيانات', icon: 'settings' },
      ],
    })
  }
  return groups
})

/* ───────── الأكشنز ───────── */
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}

async function loadData() {
  loading.value = true
  error.value = false
  try {
    const [membersRes, followupsRes, attendanceRes] = await Promise.all([
      api.get('/members'),
      api.get('/followups'),
      api.get('/attendance'),
    ])
    members.value = membersRes.data

    const fmap = {}
    followupsRes.data.forEach((f) => {
      if (!fmap[f.member_id]) fmap[f.member_id] = []
      fmap[f.member_id].push(f)
    })
    followupsMap.value = fmap

    const amap = {}
    attendanceRes.data.forEach((a) => {
      const key = `${a.date.slice(0, 10)}_${a.meeting_type}`
      if (!amap[key]) amap[key] = {}
      amap[key][a.member_id] = a.present
    })
    attendanceData.value = amap
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>