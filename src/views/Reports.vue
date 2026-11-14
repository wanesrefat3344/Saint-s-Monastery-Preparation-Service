<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy">التقارير</h1>
          <p class="text-sm text-navy/60 mt-1">نظرة شاملة على الخدمة</p>
        </div>
        <div class="flex gap-2">
          <button @click="exportPDF" class="btn-cancel text-sm">تصدير PDF</button>
          <router-link to="/" class="btn-cancel text-sm">رجوع</router-link>
        </div>
      </div>

      <div class="card mb-4 flex items-center gap-2 flex-wrap">
        <span class="text-sm text-navy/60">آخر:</span>
        <button
          v-for="n in [4, 8, 12]"
          :key="n"
          @click="weeksLimit = n"
          class="px-3 py-1 rounded text-xs"
          :class="weeksLimit === n ? 'bg-navy text-white' : 'bg-page text-navy'"
        >{{ n }} أسابيع</button>
      </div>

      <div v-if="loading" class="card text-center py-16 text-navy/50">جارٍ التحميل...</div>

      <template v-else>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="إجمالي المخدومين" :value="members.length" color="brand" />
          <StatCard label="متوسط الحضور" :value="`${avgAttendance}%`" :color="avgAttendance >= 70 ? 'brand' : 'danger'" />
          <StatCard label="أكثر الملتزمين" :value="topAttendees.length" color="brand" />
          <StatCard label="أكثر الغايبين" :value="topAbsentees.length" color="danger" />
        </div>

        <div class="card mb-6">
          <h2 class="text-lg font-semibold text-navy mb-4">خريطة حرارة الحضور</h2>
          <div v-if="weekDates.length === 0" class="text-center text-navy/50 py-6">مفيش بيانات حضور لسه</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr>
                  <th class="text-right px-2 py-2 font-medium text-navy sticky right-0 bg-card z-10">الاسم</th>
                  <th v-for="d in weekDates" :key="d" class="text-center px-1 py-2 font-medium text-navy/70 min-w-[50px]">{{ formatShortDate(d) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in members" :key="m.id" class="border-t border-border">
                  <td class="px-2 py-2 sticky right-0 bg-card z-10">
                    <router-link :to="`/members/${m.id}`" class="text-navy hover:text-brand font-medium">{{ m.full_name }}</router-link>
                  </td>
                  <td v-for="d in weekDates" :key="d" class="text-center px-1 py-2">
                    <span class="inline-block w-6 h-6 rounded text-xs leading-6 text-white font-bold" :class="cellColor(m.id, d)">{{ cellIcon(m.id, d) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card">
            <h2 class="text-lg font-semibold text-navy mb-4">🏆 أكثر الملتزمين</h2>
            <div v-if="topAttendees.length === 0" class="text-center text-navy/50 py-4 text-sm">مفيش بيانات</div>
            <ul v-else class="space-y-2">
              <li v-for="(m, i) in topAttendees" :key="m.id" class="flex items-center justify-between border-b border-border last:border-0 py-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-navy/50 w-5">{{ i + 1 }}.</span>
                  <router-link :to="`/members/${m.id}`" class="text-navy hover:text-brand font-medium">{{ m.full_name }}</router-link>
                </div>
                <span class="text-success text-xs font-medium">{{ m.attended }} / {{ m.total }}</span>
              </li>
            </ul>
          </div>

          <div class="card">
            <h2 class="text-lg font-semibold text-navy mb-4">🚨 أكثر الغايبين</h2>
            <div v-if="topAbsentees.length === 0" class="text-center text-navy/50 py-4 text-sm">مفيش بيانات</div>
            <ul v-else class="space-y-2">
              <li v-for="(m, i) in topAbsentees" :key="m.id" class="flex items-center justify-between border-b border-border last:border-0 py-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-navy/50 w-5">{{ i + 1 }}.</span>
                  <router-link :to="`/members/${m.id}`" class="text-navy hover:text-brand font-medium">{{ m.full_name }}</router-link>
                </div>
                <span class="text-danger text-xs font-medium">{{ m.absent }} غياب</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/client'

const StatCard = {
  props: ['label', 'value', 'color'],
  template: `
    <div class="card">
      <p class="text-xs text-navy/50 mb-1">{{ label }}</p>
      <p class="text-2xl font-bold" :class="{
        'text-gold': color === 'gold',
        'text-danger': color === 'danger',
        'text-brand': !color || color === 'brand'
      }">{{ value }}</p>
    </div>
  `,
}

const members = ref([])
const attendanceData = ref({})
const loading = ref(false)
const weeksLimit = ref(8)

const weekDates = computed(() => {
  return Object.keys(attendanceData.value)
    .map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()
    .slice(0, weeksLimit.value)
    .reverse()
})

function getRecordsForDate(d) {
  const key = Object.keys(attendanceData.value).find((k) => k.startsWith(d))
  return key ? attendanceData.value[key] : null
}

function cellColor(memberId, date) {
  const records = getRecordsForDate(date)
  if (!records || records[memberId] === undefined) return 'bg-navy/10'
  return records[memberId] ? 'bg-success' : 'bg-danger'
}

function cellIcon(memberId, date) {
  const records = getRecordsForDate(date)
  if (!records || records[memberId] === undefined) return '?'
  return records[memberId] ? '✓' : '✗'
}

const avgAttendance = computed(() => {
  let total = 0, present = 0
  weekDates.value.forEach((d) => {
    const records = getRecordsForDate(d)
    if (!records) return
    Object.values(records).forEach((v) => { total++; if (v) present++ })
  })
  return total === 0 ? 0 : Math.round((present / total) * 100)
})

const topAttendees = computed(() => {
  return members.value.map((m) => {
    let attended = 0, total = 0
    weekDates.value.forEach((d) => {
      const records = getRecordsForDate(d)
      if (records && records[m.id] !== undefined) {
        total++
        if (records[m.id]) attended++
      }
    })
    return { ...m, attended, total }
  })
  .filter((m) => m.total > 0)
  .sort((a, b) => (b.attended / b.total) - (a.attended / a.total))
  .slice(0, 5)
})

const topAbsentees = computed(() => {
  return members.value.map((m) => {
    let absent = 0
    weekDates.value.forEach((d) => {
      const records = getRecordsForDate(d)
      if (records && records[m.id] === false) absent++
    })
    return { ...m, absent }
  })
  .filter((m) => m.absent > 0)
  .sort((a, b) => b.absent - a.absent)
  .slice(0, 5)
})

function formatShortDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function exportPDF() { window.print() }

async function loadData() {
  loading.value = true
  try {
    const [membersRes, attendanceRes] = await Promise.all([
      api.get('/members'),
      api.get('/attendance'),
    ])
    members.value = membersRes.data

    const amap = {}
    attendanceRes.data.forEach((a) => {
      const key = `${a.date.slice(0, 10)}_${a.meeting_type}`
      if (!amap[key]) amap[key] = {}
      amap[key][a.member_id] = a.present
    })
    attendanceData.value = amap
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style>
@media print {
  .btn-cancel, .btn-primary { display: none !important; }
}
</style>