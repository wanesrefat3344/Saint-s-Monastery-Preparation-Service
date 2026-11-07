<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-7xl mx-auto py-8 px-4">

      <!-- Header -->
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
            class="px-4 py-2 rounded-lg border border-border text-navy hover:bg-navy/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            تصدير Excel
          </button>
          <router-link
            to="/members/new"
            class="px-4 py-2 rounded-lg bg-navy text-white font-medium hover:bg-navy/90 transition-colors duration-200 text-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            تسجيل مخدوم
          </router-link>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div class="md:col-span-2 relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-navy/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model.trim="search"
              type="text"
              class="input pr-9"
              placeholder="ابحث بالاسم أو الهاتف..."
            />
          </div>
          <select v-model="filterGrade" class="input">
            <option value="">كل الصفوف</option>
            <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
          </select>
          <select v-model="filterGender" class="input">
            <option value="">كل الأنواع</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
          <select v-model="filterServant" class="input">
            <option value="">كل الخدام</option>
            <option v-for="s in servants" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <!-- Active filters indicator -->
        <div v-if="hasActiveFilters" class="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span class="text-navy/50">فلاتر نشطة:</span>
          <span v-if="search" class="badge">{{ search }} ✕</span>
          <span v-if="filterGrade" class="badge">{{ filterGrade }} ✕</span>
          <span v-if="filterGender" class="badge">{{ filterGender === 'male' ? 'ذكر' : 'أنثى' }} ✕</span>
          <span v-if="filterServant" class="badge">{{ servants.find(s => s.id === Number(filterServant))?.name }} ✕</span>
          <span v-if="filterRisk" class="badge">
            {{ filterRisk === 'high' ? 'خطر عالي' : 'متوسط' }} ✕
          </span>
          <button @click="clearFilters" class="text-brand hover:underline">مسح الكل</button>
        </div>
      </div>

      <!-- Risk filter -->
      <div class="card mb-4 flex items-center gap-2 flex-wrap">
        <span class="text-sm text-navy/60">فلتر الخطر:</span>
        <button
          @click="filterRisk = ''"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200"
          :class="filterRisk === '' ? 'bg-navy text-white' : 'bg-page text-navy hover:bg-navy/10'"
        >
          الكل
        </button>
        <button
          @click="filterRisk = 'high'"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1"
          :class="filterRisk === 'high' ? 'bg-danger text-white' : 'bg-danger/10 text-danger hover:bg-danger/20'"
        >
          <span class="w-2 h-2 rounded-full bg-current"></span>
          خطر عالي ({{ highRiskCount }})
        </button>
        <button
          @click="filterRisk = 'medium'"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1"
          :class="filterRisk === 'medium' ? 'bg-gold text-white' : 'bg-gold/20 text-gold hover:bg-gold/30'"
        >
          <span class="w-2 h-2 rounded-full bg-current"></span>
          متوسط
        </button>
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

      <!-- Table -->
      <div class="card overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-navy text-white">
              <tr>
                <th class="text-right px-3 py-3 font-medium">#</th>
                <th class="text-right px-3 py-3 font-medium">الاسم</th>
                <th class="text-center px-3 py-3 font-medium">الخطر</th>
                <th class="text-right px-3 py-3 font-medium">النوع</th>
                <th class="text-right px-3 py-3 font-medium">الصف</th>
                <th class="text-right px-3 py-3 font-medium">المجموعة</th>
                <th class="text-right px-3 py-3 font-medium">ولي الأمر</th>
                <th class="text-right px-3 py-3 font-medium">الهاتف</th>
                <th class="text-right px-3 py-3 font-medium">الخادم</th>
                <th class="text-right px-3 py-3 font-medium">آخر تواصل</th>
                <th class="text-right px-3 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading skeleton -->
              <tr v-if="loading">
                <td colspan="11" class="px-4 py-10">
                  <div class="flex flex-col items-center gap-3">
                    <svg class="animate-spin w-6 h-6 text-navy/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span class="text-navy/50 text-sm">جارٍ التحميل...</span>
                  </div>
                </td>
              </tr>
              <!-- Empty state -->
              <tr v-else-if="filtered.length === 0">
                <td colspan="11" class="px-4 py-14 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 rounded-full bg-navy/5 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p class="text-navy/60 font-medium">
                      {{ members.length === 0 ? 'لا يوجد مخدومين بعد' : 'لا توجد نتائج مطابقة للفلاتر' }}
                    </p>
                    <router-link
                      v-if="members.length === 0"
                      to="/members/new"
                      class="text-brand hover:underline text-sm font-medium"
                    >
                      سجّل أول مخدوم →
                    </router-link>
                    <button
                      v-else
                      @click="clearFilters"
                      class="text-brand hover:underline text-sm font-medium"
                    >
                      مسح الفلاتر →
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Rows -->
              <tr
                v-for="(m, i) in filtered"
                :key="m.id"
                class="border-b border-border last:border-0 hover:bg-page/60 transition-colors duration-150"
              >
                <td class="px-3 py-3 text-navy/50">{{ i + 1 }}</td>
                <td class="px-3 py-3">
                  <router-link :to="`/members/${m.id}`" class="font-medium text-navy hover:text-brand transition-colors">
                    {{ m.full_name }}
                  </router-link>
                </td>
                <td class="px-3 py-3 text-center">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap" :class="riskColorClass(getRisk(m))">
                    {{ riskLabel(getRisk(m)) }}
                  </span>
                </td>
                <td class="px-3 py-3">
                  <span class="inline-block px-2 py-0.5 rounded text-xs" :class="m.gender === 'male' ? 'bg-brand/10 text-brand' : 'bg-gold/20 text-gold'">
                    {{ m.gender === 'male' ? 'ذكر' : 'أنثى' }}
                  </span>
                </td>
                <td class="px-3 py-3">
                  <span class="inline-block px-2 py-0.5 rounded bg-gold/20 text-gold text-xs whitespace-nowrap">{{ m.grade }}</span>
                </td>
                <td class="px-3 py-3 text-xs">
                  <span v-if="m.group_name" class="inline-block px-2 py-0.5 rounded bg-brand/10 text-brand">{{ m.group_name }}</span>
                  <span v-else class="text-navy/40">—</span>
                </td>
                <td class="px-3 py-3">{{ m.parent_name }}</td>
                <td class="px-3 py-3 font-mono text-xs">
                  <div class="flex items-center gap-2">
                    <span dir="ltr">{{ m.parent_phone }}</span>
                    <a
                      :href="`https://wa.me/2${m.parent_phone}`"
                      target="_blank"
                      class="text-success hover:bg-success/10 px-1.5 py-0.5 rounded transition-colors inline-flex items-center gap-1"
                      title="مراسلة عبر واتساب"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  </div>
                </td>
                <td class="px-3 py-3 text-xs text-navy/70">{{ m.servant_name || '—' }}</td>
                <td class="px-3 py-3 text-xs">
                  <span v-if="!getLastFollowup(m.id)" class="text-danger font-medium">لم يتم</span>
                  <span v-else :class="getDaysSince(m.id) > 30 ? 'text-danger font-medium' : 'text-success'">
                    من {{ getDaysSince(m.id) }} يوم
                  </span>
                </td>
                <td class="px-3 py-3">
                  <div class="flex items-center gap-1">
                    <router-link
                      :to="`/members/${m.id}`"
                      class="text-brand hover:bg-brand/10 px-2 py-1 rounded text-xs transition-colors"
                    >
                      عرض
                    </router-link>
                    <router-link
                      :to="`/members/${m.id}/edit`"
                      class="text-gold hover:bg-gold/10 px-2 py-1 rounded text-xs transition-colors"
                    >
                      تعديل
                    </router-link>
                    <button
                      v-if="user.role === 'admin'"
                      @click="remove(m.id, m.full_name)"
                      class="text-danger hover:bg-danger/10 px-2 py-1 rounded text-xs transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import api from '../api/client'
import { calculateRiskScore, riskColor } from '../utils/riskScore'

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

const hasActiveFilters = computed(
  () => !!(search.value || filterGrade.value || filterGender.value || filterServant.value || filterRisk.value)
)

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

const highRiskCount = computed(() =>
  members.value.filter((m) => getRisk(m).level === 'high').length
)

function getRisk(member) {
  return calculateRiskScore(member, followupsMap.value[member.id] || [], attendanceData.value)
}

function getLastFollowup(memberId) {
  const list = followupsMap.value[memberId] || []
  if (list.length === 0) return null
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
}

function getDaysSince(memberId) {
  const last = getLastFollowup(memberId)
  if (!last) return null
  return Math.floor((new Date() - new Date(last.date)) / (1000 * 60 * 60 * 24))
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
    const [membersRes, servantsRes] = await Promise.all([
      api.get('/members'),
      api.get('/users'),
    ])
    members.value = membersRes.data
    servants.value = servantsRes.data.filter(
      (s) => ['servant', 'co_servant', 'group_leader'].includes(s.role) && s.status === 'active'
    )
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

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: rgba(30, 41, 59, 0.08);
  color: #1e293b;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>