<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-7xl mx-auto py-8 px-4 pb-24">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-start gap-3">
          <button
            type="button"
            @click="goBack"
            class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
            aria-label="رجوع"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-navy">قائمة المخدومين</h1>
            <p class="text-sm text-navy/60 mt-1">
              إجمالي: {{ members.length }} مخدوم
              <span v-if="filtered.length !== members.length" class="text-brand">
                · معروض: {{ filtered.length }}
              </span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            @click="exportExcel"
            :disabled="filtered.length === 0"
            class="px-4 py-2 rounded-lg border border-border text-navy bg-card hover:bg-navy/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            تصدير Excel
          </button>
          <router-link
            to="/members/new"
            class="px-4 py-2 rounded-lg bg-navy text-white font-medium hover:bg-navy/90 transition-colors text-sm flex items-center gap-1"
          >
            + تسجيل مخدوم
          </router-link>
        </div>
      </div>

      <!-- Search & Filters -->
      <SearchFilter
        v-model="search"
        search-placeholder="ابحث بالاسم أو الهاتف..."
        :filters="filterDefs"
        :filters-values="{ grade: filterGrade, gender: filterGender, servant: filterServant }"
        @update:filter="updateFilter"
        @clear="clearFilters"
      />

      <!-- Risk filter -->
      <div class="card mb-4 flex items-center gap-2 flex-wrap">
        <span class="text-sm text-navy/60">فلتر الخطر:</span>
        <button
          @click="filterRisk = ''"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="filterRisk === '' ? 'bg-navy text-white' : 'bg-page text-navy hover:bg-navy/10'"
        >
          الكل
        </button>
        <button
          @click="filterRisk = 'high'"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="filterRisk === 'high' ? 'bg-danger text-white' : 'bg-danger/10 text-danger hover:bg-danger/20'"
        >
          خطر عالي ({{ highRiskCount }})
        </button>
        <button
          @click="filterRisk = 'medium'"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="filterRisk === 'medium' ? 'bg-gold text-white' : 'bg-gold/20 text-gold hover:bg-gold/30'"
        >
          متوسط
        </button>
      </div>

      <!-- Success -->
      <transition name="fade">
        <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
          {{ successMessage }}
        </div>
      </transition>

      <!-- Loading -->
      <SkeletonTable v-if="loading" :rows="8" :columns="6" />

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="card">
        <EmptyState
          icon="👥"
          :title="members.length === 0 ? 'لا يوجد مخدومين بعد' : 'لا توجد نتائج مطابقة'"
          :description="members.length === 0 ? 'ابدأ بتسجيل أول مخدوم في الخدمة' : 'جرّب تغيير الفلاتر أو البحث بكلمة تانية'"
          :tone="members.length === 0 ? 'brand' : 'navy'"
        >
          <template #actions>
            <router-link v-if="members.length === 0" to="/members/new" class="btn-primary">
              + سجّل أول مخدوم
            </router-link>
            <button v-else @click="clearFilters" class="btn-cancel">
              مسح الفلاتر
            </button>
          </template>
        </EmptyState>
      </div>

      <!-- Content: Desktop Table + Mobile Cards -->
      <template v-else>
        <!-- Desktop Table -->
        <div class="card overflow-hidden p-0 hidden md:block">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-navy text-white dark:bg-slate-800 dark:text-slate-100">
                <tr>
                  <th class="text-right px-3 py-3 font-medium">#</th>
                  <th class="text-right px-3 py-3 font-medium">الاسم</th>
                  <th class="text-center px-3 py-3 font-medium">الخطر</th>
                  <th class="text-right px-3 py-3 font-medium">الصف</th>
                  <th class="text-right px-3 py-3 font-medium hidden lg:table-cell">المجموعة</th>
                  <th class="text-right px-3 py-3 font-medium hidden lg:table-cell">ولي الأمر</th>
                  <th class="text-right px-3 py-3 font-medium">الهاتف</th>
                  <th class="text-right px-3 py-3 font-medium hidden xl:table-cell">الخادم</th>
                  <th class="text-right px-3 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(m, i) in paginatedItems"
                  :key="m.id"
                  class="border-b border-border last:border-0 hover:bg-page/60 transition-colors"
                >
                  <td class="px-3 py-3 text-navy/50 text-xs">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                  <td class="px-3 py-3">
                    <router-link :to="`/members/${m.id}`" class="font-medium text-navy hover:text-brand">
                      {{ m.full_name }}
                    </router-link>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="riskColorClass(getRisk(m))">
                      {{ riskLabel(getRisk(m)) }}
                    </span>
                  </td>
                  <td class="px-3 py-3">
                    <span class="inline-block px-2 py-0.5 rounded bg-gold/20 text-gold text-xs whitespace-nowrap">{{ m.grade }}</span>
                  </td>
                  <td class="px-3 py-3 text-xs hidden lg:table-cell">
                    <span v-if="m.group_name" class="inline-block px-2 py-0.5 rounded bg-brand/10 text-brand">{{ m.group_name }}</span>
                    <span v-else class="text-navy/40">—</span>
                  </td>
                  <td class="px-3 py-3 text-navy hidden lg:table-cell">{{ m.parent_name }}</td>
                  <td class="px-3 py-3 font-mono text-xs">
                    <span dir="ltr" class="text-navy/80">{{ m.parent_phone }}</span>
                  </td>
                  <td class="px-3 py-3 text-xs text-navy/70 hidden xl:table-cell">{{ m.servant_name || '—' }}</td>
                  <td class="px-3 py-3">
                    <div class="flex items-center gap-1">
                      <router-link :to="`/members/${m.id}`" class="text-brand hover:bg-brand/10 px-2 py-1 rounded text-xs">عرض</router-link>
                      <button v-if="user.role === 'admin'" @click="remove(m.id, m.full_name)" class="text-danger hover:bg-danger/10 px-2 py-1 rounded text-xs">حذف</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-3">
          <router-link
            v-for="m in paginatedItems"
            :key="m.id"
            :to="`/members/${m.id}`"
            class="card block hover:border-brand transition-colors"
          >
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand text-lg font-bold flex items-center justify-center shrink-0">
                {{ m.full_name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <h3 class="font-semibold text-navy truncate">{{ m.full_name }}</h3>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap" :class="riskColorClass(getRisk(m))">
                    {{ riskLabel(getRisk(m)) }}
                  </span>
                </div>
                <p class="text-xs text-navy/60 mb-1">{{ m.grade }}</p>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <span v-if="m.group_name" class="bg-brand/10 text-brand px-2 py-0.5 rounded">{{ m.group_name }}</span>
                  <span class="text-navy/60" dir="ltr">{{ m.parent_phone }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </template>

      <!-- Pagination -->
      <Pagination
        v-if="!loading && filtered.length > pageSize"
        :current-page="currentPage"
        :total-pages="totalPages"
        @prev="prevPage"
        @next="nextPage"
        @go="goToPage"
      />

      <!-- Footer stats -->
      <p v-if="!loading && filtered.length > 0" class="text-center text-xs text-navy/40 mt-4">
        صفحة {{ currentPage }} من {{ totalPages }} · {{ filtered.length }} مخدوم
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import api from '../api/client'
import { calculateRiskScore, riskColor } from '../utils/riskScore'
import { usePagination } from '../composables/usePagination'
import SkeletonTable from '../components/SkeletonTable.vue'
import EmptyState from '../components/EmptyState.vue'
import SearchFilter from '../components/SearchFilter.vue'
import Pagination from '../components/Pagination.vue'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const members = ref([])
const servants = ref([])
const followupsMap = ref({})
const attendanceData = ref({})
const loading = ref(false)
const successMessage = ref('')

const search = ref('')
const filterGrade = ref('')
const filterGender = ref('')
const filterServant = ref('')
const filterRisk = ref('')

const grades = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي',
  'جامعي', 'خريج',
]

const pageSize = 20

const filterDefs = computed(() => [
  {
    key: 'grade',
    label: 'الصف',
    placeholder: 'كل الصفوف',
    options: grades.map((g) => ({ value: g, label: g })),
  },
  {
    key: 'gender',
    label: 'النوع',
    placeholder: 'كل الأنواع',
    options: [
      { value: 'male', label: 'ذكر' },
      { value: 'female', label: 'أنثى' },
    ],
  },
  {
    key: 'servant',
    label: 'الخادم',
    placeholder: 'كل الخدام',
    options: servants.value.map((s) => ({ value: String(s.id), label: s.name })),
  },
])

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return members.value.filter((m) => {
    if (q && !m.full_name?.toLowerCase().includes(q) && !m.parent_phone?.includes(q) && !m.member_phone?.includes(q)) return false
    if (filterGrade.value && m.grade !== filterGrade.value) return false
    if (filterGender.value && m.gender !== filterGender.value) return false
    if (filterServant.value && m.servant_id !== Number(filterServant.value)) return false
    if (filterRisk.value) {
      const r = getRisk(m)
      if (filterRisk.value === 'high' && r.level !== 'high') return false
      if (filterRisk.value === 'medium' && r.level !== 'medium') return false
    }
    return true
  })
})

const { currentPage, totalPages, paginatedItems, nextPage, prevPage, goToPage, reset } = usePagination(filtered, { pageSize })

watch([search, filterGrade, filterGender, filterServant, filterRisk], () => reset())

const highRiskCount = computed(() =>
  members.value.filter((m) => getRisk(m).level === 'high').length
)

function updateFilter(key, value) {
  if (key === 'grade') filterGrade.value = value
  else if (key === 'gender') filterGender.value = value
  else if (key === 'servant') filterServant.value = value
}

function getRisk(member) {
  return calculateRiskScore(member, followupsMap.value[member.id] || [], attendanceData.value)
}

function riskColorClass(risk) {
  return riskColor(risk.level).bg + ' ' + riskColor(risk.level).text
}

function riskLabel(risk) {
  const c = riskColor(risk.level)
  return `${c.icon} ${c.label}`
}

function clearFilters() {
  search.value = ''
  filterGrade.value = ''
  filterGender.value = ''
  filterServant.value = ''
  filterRisk.value = ''
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/dashboard')
}

async function remove(id, name) {
  if (!confirm(`متأكد من حذف "${name}"؟`)) return
  try {
    await api.delete(`/members/${id}`)
    members.value = members.value.filter((m) => m.id !== id)
    successMessage.value = 'تم الحذف ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

function exportExcel() {
  const rows = filtered.value.map((m) => ({
    'الاسم': m.full_name,
    'تاريخ الميلاد': m.birth_date,
    'النوع': m.gender === 'male' ? 'ذكر' : 'أنثى',
    'الصف': m.grade,
    'المجموعة': m.group_name || '',
    'هاتف المخدوم': m.member_phone || '',
    'ولي الأمر': m.parent_name,
    'هاتف ولي الأمر': m.parent_phone,
    'الخادم المسؤول': m.servant_name || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'المخدومين')
  XLSX.writeFile(wb, `المخدومين_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function loadData() {
  loading.value = true
  try {
    const [membersRes, servantsRes, followupsRes, attendanceRes] = await Promise.all([
      api.get('/members'),
      api.get('/users').catch(() => ({ data: [] })),
      api.get('/followups').catch(() => ({ data: [] })),
      api.get('/attendance').catch(() => ({ data: [] })),
    ])
    members.value = membersRes.data
    servants.value = servantsRes.data.filter(
      (s) => ['servant', 'co_servant', 'group_leader'].includes(s.role) && s.status === 'active'
    )

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