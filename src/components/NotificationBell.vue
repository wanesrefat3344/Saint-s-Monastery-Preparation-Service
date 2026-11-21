<template>
  <div class="relative">
    <button @click="toggle" class="relative p-2 rounded-lg hover:bg-navy/5 transition" :class="{ 'bg-navy/5': open }">
      <span class="text-xl">🔔</span>
      <span v-if="total > 0" class="absolute top-1 right-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {{ total > 99 ? '99+' : total }}
      </span>
    </button>

    <div v-if="open" class="absolute left-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border z-50 max-h-96 overflow-y-auto" dir="rtl">
      <div class="p-3 border-b border-border sticky top-0 bg-card">
        <h3 class="font-semibold text-navy text-sm">الإشعارات ({{ total }})</h3>
      </div>

      <div v-if="total === 0" class="p-6 text-center text-navy/50 text-sm">مفيش إشعارات 🎉</div>

      <ul v-else class="divide-y divide-border">
        <li v-for="(n, i) in notifications" :key="i" class="p-3 hover:bg-page/50 cursor-pointer transition" @click="goTo(n)">
          <div class="flex items-start gap-2">
            <span class="text-lg shrink-0">{{ n.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-navy font-medium">{{ n.title }}</p>
              <p class="text-xs text-navy/60 mt-0.5">{{ n.message }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="open" @click="open = false" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'
import { useCalculations } from '../composables/useCalculations'
import { CONSECUTIVE_ABSENT_THRESHOLD } from '../constants/app'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const open = ref(false)
const members = ref([])
const followupsMap = ref({})
const attendanceData = ref({})
const servants = ref([])
const challenges = ref([])
const groupChallenges = ref({})

function toggle() { open.value = !open.value }
function goTo(n) { open.value = false; if (n.link) router.push(n.link) }

/* Используем унифицированные вычисления */
const {
  needsFollowupList,
  needsFollowupCount,
  consecutiveAbsentList,
  consecutiveAbsentCount,
  noServantList,
  noServantCount,
  highRiskCount,
} = useCalculations(members, attendanceData, followupsMap)

const notifications = computed(() => {
  const list = []

  if (user.role === 'admin') {
    // 1. محتاجين افتقاد
    if (needsFollowupCount.value > 0) {
      list.push({ icon: '📞', title: `${needsFollowupCount.value} مخدوم محتاجين افتقاد`, message: 'اضغط لمتابعتهم', link: '/followups' })
    }

    // 2. غابوا N مرات подряд
    if (consecutiveAbsentCount.value > 0) {
      list.push({ icon: '🚨', title: `${consecutiveAbsentCount.value} مخدوم غابوا ${CONSECUTIVE_ABSENT_THRESHOLD} مرات متتالية`, message: 'محتاجين متابعة عاجلة', link: '/' })
    }

    // 3. معندهمش خادم
    if (noServantCount.value > 0) {
      list.push({ icon: '👤', title: `${noServantCount.value} مخدوم معندهمش خادم مسؤول`, message: 'عيّن لهم خادم', link: '/members' })
    }

    // 4. طلبات خدام
    const pendingServants = servants.value.filter((s) => s.status === 'pending')
    if (pendingServants.length > 0) {
      list.push({ icon: '👤', title: `${pendingServants.length} طلب إضافة خادم`, message: 'اضغط للموافقة', link: '/servants-approval' })
    }

    // 5. اشتراكات تحديات
    let pendingChallenges = 0
    Object.values(groupChallenges.value).forEach((arr) => {
      pendingChallenges += arr.filter((gc) => gc.status === 'pending').length
    })
    if (pendingChallenges > 0) {
      list.push({ icon: '🏆', title: `${pendingChallenges} طلب اشتراك في تحدي`, message: 'اضغط للموافقة', link: '/challenges-approval' })
    }
  }

  if (user.role === 'servant') {
    const myApproved = servants.value.filter((s) => s.added_by === user.email && s.status === 'active')
    if (myApproved.length > 0) {
      list.push({ icon: '✅', title: `${myApproved.length} خادم تمت الموافقة عليهم`, message: 'اللي أضفتهم بقوا نشطين', link: '/servants' })
    }

    const myPending = servants.value.filter((s) => s.added_by === user.email && s.status === 'pending')
    if (myPending.length > 0) {
      list.push({ icon: '⏳', title: `${myPending.length} طلب بانتظار الموافقة`, message: 'الخدام اللي أضفتهم لسه قيد المراجعة', link: '/servants' })
    }
  }

  return list
})

const total = computed(() => notifications.value.length)

async function loadData() {
  try {
    const promises = [
      api.get('/members').catch(() => ({ data: [] })),
      api.get('/followups').catch(() => ({ data: [] })),
      api.get('/attendance').catch(() => ({ data: [] })),
    ]

    if (user.role === 'admin') {
      promises.push(api.get('/users').catch(() => ({ data: [] })))
      promises.push(api.get('/challenges').catch(() => ({ data: [] })))
    }

    const results = await Promise.all(promises)
    members.value = results[0].data

    const fmap = {}
    results[1].data.forEach((f) => {
      if (!fmap[f.member_id]) fmap[f.member_id] = []
      fmap[f.member_id].push(f)
    })
    followupsMap.value = fmap

    const amap = {}
    results[2].data.forEach((a) => {
      const key = `${a.date.slice(0, 10)}_${a.meeting_type}`
      if (!amap[key]) amap[key] = {}
      amap[key][a.member_id] = a.present
    })
    attendanceData.value = amap

    if (user.role === 'admin') {
      servants.value = results[3].data
      challenges.value = results[4].data

      // جيب المشاركات
      const gcMap = {}
      for (const c of challenges.value) {
        try {
          const res = await api.get(`/challenges/${c.id}/participants`)
          gcMap[c.id] = res.data
        } catch {}
      }
      groupChallenges.value = gcMap
    } else if (user.role === 'servant') {
      try {
        const res = await api.get('/users')
        servants.value = res.data
      } catch {}
    }
  } catch (e) {
    console.error(e)
  }
}

let interval = null

onMounted(() => {
  loadData()
  interval = setInterval(loadData, 60000) // كل دقيقة
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>