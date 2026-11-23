<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <PullToRefreshIndicator
      :pull-distance="pullDistance"
      :is-pulling="isPulling"
      :is-refreshing="isRefreshing"
      :threshold="threshold"
    />

    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-24">

      <header class="flex items-start justify-between gap-4 mb-6">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">متابعة المخدومين</p>
          <h1 class="text-2xl font-bold text-navy truncate">الافتقاد</h1>
          <p class="text-sm text-navy/60 mt-1">
            <template v-if="needsFollowup.length > 0">
              محتاجين تواصل: <span class="text-danger font-bold">{{ needsFollowup.length }}</span>
            </template>
            <template v-else>الكل متابَع ✅</template>
          </p>
        </div>
        <button @click="goBack" class="shrink-0 btn-cancel text-sm">رجوع</button>
      </header>

      <SearchFilter
        v-model="search"
        search-placeholder="ابحث بالاسم أو الهاتف..."
        :filters="filterDefs"
        :filters-values="{ type: filterType, grade: filterGrade }"
        @update:filter="updateFilter"
        @clear="clearFilters"
      />

      <transition name="fade">
        <div v-if="successMessage" class="mb-5 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          ✅ {{ successMessage }}
        </div>
      </transition>

      <!-- Loading -->
      <SkeletonTable v-if="loading" :rows="6" :columns="5" />

      <!-- Error -->
      <div v-else-if="loadError" class="card text-center py-10">
        <p class="text-navy font-bold mb-1">مقدرناش نحمّل البيانات</p>
        <p class="text-sm text-navy/60 mb-4">اتأكد من الاتصال بالنت وجرّب تاني.</p>
        <button @click="loadData" class="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          إعادة المحاولة
        </button>
      </div>

      <!-- Empty: no followups needed -->
      <div v-else-if="needsFollowup.length === 0" class="card">
        <EmptyState
          icon="✅"
          title="كل المخدومين تم التواصل معهم"
          description="مفيش حد محتاج متابعة دلوقتي"
          tone="success"
        />
      </div>

      <!-- Empty: no filtered results -->
      <div v-else-if="filtered.length === 0" class="card">
        <EmptyState
          icon="🔍"
          title="لا توجد نتائج مطابقة"
          description="جرّب تغيير الفلاتر أو البحث بكلمة تانية"
        >
          <template #actions>
            <button @click="clearFilters" class="btn-cancel">مسح الفلاتر</button>
          </template>
        </EmptyState>
      </div>

      <!-- Content: Desktop Table + Mobile Cards -->
      <template v-else>
        <!-- Desktop Table -->
        <div class="card overflow-hidden p-0 hidden md:block">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-page/40">
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">#</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الاسم</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs hidden lg:table-cell">الصف</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الهاتف</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">آخر تواصل</th>
                  <th class="text-center px-4 py-3 font-medium text-navy/60 text-xs">إجراء</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="(m, i) in paginatedItems" :key="m.id" class="hover:bg-page/40 transition-colors">
                  <td class="px-4 py-3 text-navy/40 text-xs">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                  <td class="px-4 py-3">
                    <router-link :to="`/members/${m.id}`" class="font-medium text-navy hover:text-brand">{{ nameOf(m) }}</router-link>
                  </td>
                  <td class="px-4 py-3 hidden lg:table-cell">
                    <span v-if="m.grade" class="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-xs">{{ m.grade }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-navy/80" dir="ltr">{{ phoneOf(m) }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs">
                    <span v-if="m.followupDays == null" class="rounded-full bg-danger/5 text-danger px-2 py-0.5">لم يتم</span>
                    <span v-else class="rounded-full bg-danger/5 text-danger px-2 py-0.5">من {{ m.followupDays }} يوم</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button @click="markDone(m.id)" :disabled="marking === m.id" class="rounded-lg bg-brand px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50">
                      {{ marking === m.id ? '...' : 'تم' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-3">
          <div v-for="m in paginatedItems" :key="m.id" class="card">
            <div class="flex items-start justify-between gap-2 mb-2">
              <router-link :to="`/members/${m.id}`" class="font-medium text-navy">{{ nameOf(m) }}</router-link>
              <span class="text-xs px-2 py-0.5 rounded-full bg-danger/5 text-danger">
                {{ m.followupDays == null ? 'لم يتم' : `من ${m.followupDays} يوم` }}
              </span>
            </div>
            <p class="text-xs text-navy/60 mb-3" dir="ltr">{{ phoneOf(m) }}</p>
            <button @click="markDone(m.id)" :disabled="marking === m.id" class="w-full rounded-lg bg-brand px-3 py-2 text-xs text-white disabled:opacity-50">
              {{ marking === m.id ? '...' : 'تم التواصل' }}
            </button>
          </div>
        </div>
      </template>

      <!-- Pagination -->
      <Pagination
        v-if="!loading && !loadError && filtered.length > pageSize"
        :current-page="currentPage"
        :total-pages="totalPages"
        @prev="prevPage"
        @next="nextPage"
        @go="goToPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'
import { useCalculations } from '../composables/useCalculations'
import { usePagination } from '../composables/usePagination'
import { usePullToRefresh } from '../composables/usePullToRefresh'
import SkeletonTable from '../components/SkeletonTable.vue'
import EmptyState from '../components/EmptyState.vue'
import SearchFilter from '../components/SearchFilter.vue'
import Pagination from '../components/Pagination.vue'
import PullToRefreshIndicator from '../components/PullToRefreshIndicator.vue'
import { FOLLOWUP_THRESHOLD_DAYS } from '../constants/app'

const router = useRouter()
const members = ref([])
const followupsMap = ref({})
const attendanceData = ref({}) // مش مستخدمة هنا، بس useCalculations محتاجها كـ ref
const loading = ref(true)
const loadError = ref(false)
const successMessage = ref('')
const marking = ref(null)

const search = ref('')
const filterType = ref('all')
const filterGrade = ref('')

const grades = ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي']
const pageSize = 20

const filterDefs = computed(() => [
  {
    key: 'type',
    label: 'النوع',
    placeholder: 'كل المحتاجين',
    options: [
      { value: 'never', label: 'لم يتم التواصل' },
      { value: 'late', label: `عدّى ${FOLLOWUP_THRESHOLD_DAYS} يوم` },
    ],
  },
  {
    key: 'grade',
    label: 'الصف',
    placeholder: 'كل الصفوف',
    options: grades.map((g) => ({ value: g, label: g })),
  },
])

const nameOf = (m) => m.full_name || m.name || 'بدون اسم'
const phoneOf = (m) => m.parent_phone || m.member_phone || m.phone || m.mobile || ''

// الحسابات الموحّدة
const { needsFollowupList: needsFollowup } = useCalculations(members, attendanceData, followupsMap)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return needsFollowup.value.filter((m) => {
    // followupDays = null/undefined يعني عمره ما اتفتقد
    if (filterType.value === 'never' && m.followupDays != null) return false
    if (filterType.value === 'late' && (m.followupDays == null || m.followupDays <= FOLLOWUP_THRESHOLD_DAYS)) return false
    if (filterGrade.value && m.grade !== filterGrade.value) return false
    if (q && !nameOf(m).toLowerCase().includes(q) && !phoneOf(m).includes(q)) return false
    return true
  })
})

const { currentPage, totalPages, paginatedItems, nextPage, prevPage, goToPage, reset } = usePagination(filtered, { pageSize })

watch([search, filterType, filterGrade], () => reset())

const { pullDistance, isPulling, isRefreshing, threshold } = usePullToRefresh(async () => {
  await loadData()
})

function updateFilter(key, value) {
  if (key === 'type') filterType.value = value
  else if (key === 'grade') filterGrade.value = value
}

function clearFilters() {
  search.value = ''
  filterType.value = 'all'
  filterGrade.value = ''
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

async function markDone(memberId) {
  marking.value = memberId
  try {
    await api.post('/followups', {
      member_id: memberId,
      date: new Date().toISOString().slice(0, 10),
      method: 'call',
      result: 'تم التواصل',
    })
    const old = followupsMap.value[memberId] || []
    followupsMap.value = {
      ...followupsMap.value,
      [memberId]: [...old, { member_id: memberId, date: new Date().toISOString(), method: 'call' }],
    }
    successMessage.value = 'تم تسجيل التواصل ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل التسجيل')
  } finally {
    marking.value = null
  }
}

// يحوّل أي شكل رد (مصفوفة مباشرة أو { data: [...] }) لمصفوفة
const toArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [])

async function loadData() {
  loading.value = true
  loadError.value = false
  try {
    const [membersRes, followupsRes] = await Promise.allSettled([
      api.get('/members'),
      api.get('/followups'),
    ])

    if (membersRes.status === 'fulfilled') {
      members.value = toArray(membersRes.value.data)
    } else {
      loadError.value = true // من غير الأعضاء مفيش حاجة نعرضها
    }

    if (followupsRes.status === 'fulfilled') {
      const map = {}
      toArray(followupsRes.value.data).forEach((f) => {
        if (!map[f.member_id]) map[f.member_id] = []
        map[f.member_id].push(f)
      })
      followupsMap.value = map
    }
  } catch (e) {
    console.error(e)
    loadError.value = true
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