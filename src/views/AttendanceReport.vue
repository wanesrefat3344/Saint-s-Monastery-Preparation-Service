<template>
  <div class="min-h-screen bg-page py-8 px-4 pb-24" dir="rtl">
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy">التقارير</h1>
          <p class="text-sm text-navy/60 mt-1">نظرة شاملة ودقيقة على الحضور والغياب</p>
        </div>
        <div class="flex gap-2 flex-wrap self-start sm:self-auto print:hidden">
          <router-link to="/attendance-report" class="btn-cancel text-sm">📊 تقرير الحضور</router-link>
          <button @click="exportPDF" class="btn-cancel text-sm">🖨️ طباعة</button>
          <router-link to="/" class="btn-cancel text-sm">رجوع</router-link>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4 flex items-center gap-x-6 gap-y-3 flex-wrap print:hidden">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-navy/60">آخر:</span>
          <button
            v-for="n in [4, 8, 12, 24]"
            :key="n"
            @click="limit = n"
            class="px-3 py-1 rounded text-xs transition-colors"
            :class="limit === n ? 'bg-navy text-white' : 'bg-page text-navy hover:bg-navy/10'"
          >
            {{ n }} اجتماع
          </button>
        </div>

        <div v-if="groups.length > 1" class="flex items-center gap-2">
          <span class="text-sm text-navy/60">المجموعة:</span>
          <select v-model="groupFilter" class="rounded border border-border bg-card px-2 py-1 text-xs text-navy">
            <option value="all">الكل</option>
            <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <div v-if="meetingTypes.length > 1" class="flex items-center gap-2">
          <span class="text-sm text-navy/60">نوع الاجتماع:</span>
          <select v-model="typeFilter" class="rounded border border-border bg-card px-2 py-1 text-xs text-navy">
            <option value="all">الكل</option>
            <option v-for="t in meetingTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2 sm:mr-auto">
          <span class="text-sm text-navy/60">ترتيب الجدول:</span>
          <button
            v-for="o in sortOptions"
            :key="o.value"
            @click="sortBy = o.value"
            class="px-3 py-1 rounded text-xs transition-colors"
            :class="sortBy === o.value ? 'bg-navy text-white' : 'bg-page text-navy hover:bg-navy/10'"
          >
            {{ o.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <SkeletonTable v-if="loading" :rows="6" :columns="5" />

      <!-- Error -->
      <div v-else-if="error" class="card text-center py-12">
        <p class="text-danger mb-4">{{ error }}</p>
        <button @click="loadData" class="btn-primary">إعادة المحاولة</button>
      </div>

      <template v-else>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div v-for="s in stats" :key="s.label" class="card">
            <p class="text-xs text-navy/50 mb-1">{{ s.label }}</p>
            <p class="text-2xl font-bold" :class="s.color === 'danger' ? 'text-danger' : 'text-brand'">{{ s.value }}</p>
            <p v-if="s.sub" class="text-[11px] text-navy/50 mt-1 leading-snug">{{ s.sub }}</p>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="sessions.length === 0" class="card text-center text-navy/50 py-10">
          مفيش بيانات حضور في الفترة دي لسه
        </div>

        <template v-else>

          <!-- Trend -->
          <div class="card mb-6">
            <h2 class="text-lg font-semibold text-navy mb-1">نسبة الحضور في كل اجتماع</h2>
            <p class="text-xs text-navy/50 mb-4">محسوبة من المسجّل فقط (الحاضر ÷ الحاضر + الغايب)</p>
            <div class="overflow-x-auto">
              <div class="flex items-end gap-2 h-40 min-w-max px-1">
                <div
                  v-for="s in sessionStats"
                  :key="s.key"
                  class="flex flex-col items-center justify-end h-full w-12"
                  :title="`${formatShortDate(s.date)} — حضر ${s.present} / ${s.recorded}`"
                >
                  <span class="text-[11px] font-medium mb-1" :class="rateText(s.rate)">
                    {{ s.rate === null ? '—' : s.rate + '%' }}
                  </span>
                  <div
                    class="w-full rounded-t transition-all"
                    :class="rateBg(s.rate)"
                    :style="{ height: (s.rate ?? 0) + '%', minHeight: s.rate === null ? '0' : '3px' }"
                  ></div>
                  <span class="text-[11px] text-navy/60 mt-1">{{ formatShortDate(s.date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Heatmap -->
          <div class="card mb-6">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h2 class="text-lg font-semibold text-navy">خريطة حرارة الحضور</h2>
              <div class="flex items-center gap-3 text-xs text-navy/60">
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded bg-success"></span> حضر</span>
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded bg-danger"></span> غاب</span>
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded bg-navy/10"></span> مش مسجّل</span>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr>
                    <th class="text-right px-2 py-2 font-medium text-navy sticky right-0 bg-card z-10">الاسم</th>
                    <th
                      v-for="s in sessions"
                      :key="s.key"
                      class="text-center px-1 py-2 font-medium text-navy/70 min-w-[50px]"
                    >
                      {{ formatShortDate(s.date) }}
                      <span v-if="meetingTypes.length > 1 && s.type" class="block text-[10px] font-normal text-navy/40">{{ s.type }}</span>
                    </th>
                    <th class="text-center px-2 py-2 font-medium text-navy">النسبة</th>
                    <th class="text-center px-2 py-2 font-medium text-navy whitespace-nowrap">غياب متتالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in sortedMembers" :key="m.id" class="border-t border-border">
                    <td class="px-2 py-2 sticky right-0 bg-card z-10 whitespace-nowrap">
                      <router-link :to="`/members/${m.id}`" class="text-navy hover:text-brand font-medium">{{ m.full_name }}</router-link>
                    </td>
                    <td v-for="s in sessions" :key="s.key" class="text-center px-1 py-2">
                      <span
                        class="inline-block w-6 h-6 rounded text-xs leading-6 text-white font-bold"
                        :class="cellColor(m.id, s)"
                        :title="`${m.full_name} — ${formatShortDate(s.date)}`"
                      >{{ cellIcon(m.id, s) }}</span>
                    </td>
                    <td class="text-center px-2 py-2 font-bold whitespace-nowrap" :class="rateText(m.rate)">
                      {{ m.rate === null ? '—' : m.rate + '%' }}
                      <span class="block text-[10px] font-normal text-navy/40">{{ m.attended }}/{{ m.total }}</span>
                    </td>
                    <td class="text-center px-2 py-2">
                      <span v-if="m.streak >= 2" class="inline-block rounded-full bg-danger/10 text-danger px-2 py-0.5 font-medium">{{ m.streak }}</span>
                      <span v-else class="text-navy/30">—</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-border">
                    <td class="px-2 py-2 font-medium text-navy sticky right-0 bg-card z-10">نسبة الحضور</td>
                    <td v-for="s in sessionStats" :key="s.key" class="text-center px-1 py-2 font-bold" :class="rateText(s.rate)">
                      {{ s.rate === null ? '—' : s.rate + '%' }}
                    </td>
                    <td class="text-center px-2 py-2 font-bold" :class="rateText(avgAttendance)">
                      {{ avgAttendance === null ? '—' : avgAttendance + '%' }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Needs follow-up -->
          <div v-if="atRisk.length" class="card mb-6 border-danger/40">
            <h2 class="text-lg font-semibold text-navy mb-1 flex items-center gap-2">
              📞 محتاجين افتقاد
              <span class="text-xs font-normal text-navy/50">({{ atRisk.length }})</span>
            </h2>
            <p class="text-xs text-navy/50 mb-4">غابوا آخر اجتماعين مسجّلين أو أكتر ورا بعض</p>
            <ul class="divide-y divide-border">
              <li v-for="m in atRisk" :key="m.id" class="flex items-center justify-between gap-3 py-2 text-sm">
                <div class="min-w-0">
                  <router-link :to="`/members/${m.id}`" class="text-navy hover:text-brand font-medium">{{ m.full_name }}</router-link>
                  <p class="text-xs text-navy/50 truncate">
                    {{ m.parent_name || 'ولي الأمر' }}
                    <a v-if="m.parent_phone" :href="`tel:${m.parent_phone}`" dir="ltr" class="text-brand mr-1 print:text-navy">{{ m.parent_phone }}</a>
                  </p>
                </div>
                <span class="text-danger text-xs font-medium whitespace-nowrap shrink-0">غايب {{ m.streak }} مرات ورا بعض</span>
              </li>
            </ul>
          </div>

          <!-- Top Attendees + Top Absentees -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="card">
              <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                🏆 أكثر الملتزمين
                <span class="text-xs font-normal text-navy/50">({{ topAttendees.length }})</span>
              </h2>
              <div v-if="topAttendees.length === 0" class="text-center text-navy/50 py-4 text-sm">مفيش بيانات</div>
              <ul v-else class="space-y-2">
                <li
                  v-for="m in topAttendees"
                  :key="m.id"
                  class="flex items-center justify-between border-b border-border last:border-0 py-2 text-sm"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg shrink-0">{{ medal(m.rank) }}</span>
                    <router-link :to="`/members/${m.id}`" class="text-navy hover:text-brand font-medium truncate">{{ m.full_name }}</router-link>
                  </div>
                  <span class="text-success text-xs font-medium whitespace-nowrap shrink-0">
                    {{ m.rate }}% • {{ m.attended }} / {{ m.total }}
                  </span>
                </li>
              </ul>
            </div>

            <div class="card">
              <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                🚨 أكثر الغايبين
                <span class="text-xs font-normal text-navy/50">({{ topAbsentees.length }})</span>
              </h2>
              <div v-if="topAbsentees.length === 0" class="text-center text-navy/50 py-4 text-sm">مفيش غياب في الفترة دي 🎉</div>
              <ul v-else class="space-y-2">
                <li
                  v-for="m in topAbsentees"
                  :key="m.id"
                  class="flex items-center justify-between border-b border-border last:border-0 py-2 text-sm"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg shrink-0">{{ medal(m.rank) }}</span>
                    <router-link :to="`/members/${m.id}`" class="text-navy hover:text-brand font-medium truncate">{{ m.full_name }}</router-link>
                  </div>
                  <span class="text-danger text-xs font-medium whitespace-nowrap shrink-0">
                    {{ m.absent }} غياب من {{ m.total }}
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/client'
import SkeletonTable from '../components/SkeletonTable.vue'

const TOP_N = 5

const members = ref([])
const records = ref([]) // [{ member_id, date, type, present: boolean }]
const loading = ref(true)
const error = ref('')

const limit = ref(8)
const groupFilter = ref('all')
const typeFilter = ref('all')
const sortBy = ref('name')

const sortOptions = [
  { value: 'name', label: 'الاسم' },
  { value: 'rate', label: 'الأقل حضوراً' },
]

/* ---------- الاجتماعات (كل تاريخ + نوع اجتماع = عمود) ---------- */
const meetingTypes = computed(() => [...new Set(records.value.map((r) => r.type).filter(Boolean))])

const groups = computed(() => [...new Set(members.value.map((m) => m.group_name).filter(Boolean))])

const sessions = computed(() => {
  const map = {}
  for (const r of records.value) {
    if (typeFilter.value !== 'all' && r.type !== typeFilter.value) continue
    const key = `${r.date}|${r.type}`
    if (!map[key]) map[key] = { key, date: r.date, type: r.type, byMember: {} }
    map[key].byMember[r.member_id] = r.present
  }
  return Object.values(map)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.type).localeCompare(String(b.type)))
    .slice(-limit.value)
})

/* ---------- المخدومين (الحاليين بس) ---------- */
const visibleMembers = computed(() =>
  members.value.filter((m) => groupFilter.value === 'all' || m.group_name === groupFilter.value),
)

const memberStats = computed(() =>
  visibleMembers.value.map((m) => {
    let attended = 0
    let absent = 0
    for (const s of sessions.value) {
      const v = s.byMember[m.id]
      if (v === undefined) continue
      v ? attended++ : absent++
    }
    const total = attended + absent

    // الغياب المتتالي الحالي: من آخر اجتماع لورا، وبنتخطى الاجتماعات اللي مفيهاش تسجيل
    let streak = 0
    for (let i = sessions.value.length - 1; i >= 0; i--) {
      const v = sessions.value[i].byMember[m.id]
      if (v === undefined) continue
      if (v) break
      streak++
    }

    return {
      ...m,
      attended,
      absent,
      total,
      streak,
      rate: total ? Math.round((attended / total) * 100) : null,
    }
  }),
)

const sortedMembers = computed(() => {
  const list = [...memberStats.value]
  if (sortBy.value === 'rate') {
    return list.sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101) || a.full_name.localeCompare(b.full_name, 'ar'))
  }
  return list.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ar'))
})

/* ---------- إحصائيات كل اجتماع ---------- */
const sessionStats = computed(() =>
  sessions.value.map((s) => {
    let present = 0
    let absent = 0
    for (const m of visibleMembers.value) {
      const v = s.byMember[m.id]
      if (v === undefined) continue
      v ? present++ : absent++
    }
    const recorded = present + absent
    return { ...s, present, absent, recorded, rate: recorded ? Math.round((present / recorded) * 100) : null }
  }),
)

// متوسط مرجّح: إجمالي الحضور ÷ إجمالي المسجّل (مش متوسط نسب)
const avgAttendance = computed(() => {
  let present = 0
  let recorded = 0
  for (const s of sessionStats.value) {
    present += s.present
    recorded += s.recorded
  }
  return recorded ? Math.round((present / recorded) * 100) : null
})

const bestSession = computed(() => {
  const list = sessionStats.value.filter((s) => s.rate !== null)
  return list.length ? list.reduce((a, b) => (b.rate > a.rate ? b : a)) : null
})

const worstSession = computed(() => {
  const list = sessionStats.value.filter((s) => s.rate !== null)
  return list.length ? list.reduce((a, b) => (b.rate < a.rate ? b : a)) : null
})

/* ---------- الغياب المتتالي ---------- */
const atRisk = computed(() =>
  memberStats.value.filter((m) => m.streak >= 2).sort((a, b) => b.streak - a.streak),
)

/* ---------- أعلى الملتزمين / أكثر الغايبين (مع التعادل وترتيب صحيح) ---------- */
function rankWithTies(sorted, valueOf, n) {
  if (!sorted.length) return []
  const cutoff = valueOf(sorted[Math.min(n, sorted.length) - 1])
  const picked = sorted.filter((m) => valueOf(m) >= cutoff)
  let rank = 0
  let prev = null
  return picked.map((m) => {
    if (valueOf(m) !== prev) {
      rank++
      prev = valueOf(m)
    }
    return { ...m, rank }
  })
}

const topAttendees = computed(() => {
  const sorted = memberStats.value
    .filter((m) => m.total > 0)
    .sort((a, b) => b.rate - a.rate || b.attended - a.attended || a.full_name.localeCompare(b.full_name, 'ar'))
  return rankWithTies(sorted, (m) => m.rate, TOP_N)
})

const topAbsentees = computed(() => {
  const sorted = memberStats.value
    .filter((m) => m.absent > 0)
    .sort((a, b) => b.absent - a.absent || a.rate - b.rate || a.full_name.localeCompare(b.full_name, 'ar'))
  return rankWithTies(sorted, (m) => m.absent, TOP_N)
})

/* ---------- كروت الإحصائيات ---------- */
const stats = computed(() => [
  {
    label: 'إجمالي المخدومين',
    value: visibleMembers.value.length,
    sub: groupFilter.value === 'all' ? 'كل المجموعات' : groupFilter.value,
  },
  { label: 'عدد الاجتماعات', value: sessions.value.length, sub: 'في الفترة المحددة' },
  {
    label: 'متوسط الحضور',
    value: avgAttendance.value === null ? '—' : `${avgAttendance.value}%`,
    color: avgAttendance.value !== null && avgAttendance.value < 70 ? 'danger' : 'brand',
    sub: 'من المسجّل فقط',
  },
  {
    label: 'أعلى حضور',
    value: bestSession.value ? `${bestSession.value.rate}%` : '—',
    sub: bestSession.value ? `${formatShortDate(bestSession.value.date)} • ${bestSession.value.present} حاضر` : '',
  },
  {
    label: 'أقل حضور',
    value: worstSession.value ? `${worstSession.value.rate}%` : '—',
    color: 'danger',
    sub: worstSession.value ? `${formatShortDate(worstSession.value.date)} • ${worstSession.value.absent} غايب` : '',
  },
  {
    label: 'غياب متتالي',
    value: atRisk.value.length,
    color: atRisk.value.length ? 'danger' : 'brand',
    sub: 'محتاجين افتقاد',
  },
])

/* ---------- Helpers ---------- */
function cellColor(memberId, session) {
  const v = session.byMember[memberId]
  if (v === undefined) return 'bg-navy/10'
  return v ? 'bg-success' : 'bg-danger'
}

function cellIcon(memberId, session) {
  const v = session.byMember[memberId]
  if (v === undefined) return '?'
  return v ? '✓' : '✗'
}

function rateText(r) {
  if (r === null || r === undefined) return 'text-navy/40'
  if (r >= 80) return 'text-success'
  if (r >= 60) return 'text-brand'
  return 'text-danger'
}

function rateBg(r) {
  if (r === null || r === undefined) return 'bg-navy/10'
  if (r >= 80) return 'bg-success'
  if (r >= 60) return 'bg-brand'
  return 'bg-danger'
}

function medal(rank) {
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '⭐'
}

function formatShortDate(d) {
  if (!d) return ''
  const [, m, day] = d.split('-')
  return `${Number(day)}/${Number(m)}`
}

function exportPDF() {
  window.print()
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [membersRes, attendanceRes] = await Promise.all([api.get('/members'), api.get('/attendance')])
    members.value = membersRes.data
    records.value = attendanceRes.data.map((a) => ({
      member_id: a.member_id,
      date: String(a.date).slice(0, 10),
      type: a.meeting_type || '',
      present: a.present === true || a.present === 1 || a.present === '1', // يدعم true/1
    }))
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'فشل تحميل بيانات التقارير'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style>
@media print {
  .btn-cancel,
  .btn-primary {
    display: none !important;
  }
}
</style>