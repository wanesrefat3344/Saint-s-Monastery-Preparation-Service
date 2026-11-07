<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- ============ Header ============ -->
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">إدارة</p>
          <h1 class="text-2xl font-bold text-navy truncate">المجموعات</h1>
          <p class="text-sm text-navy/60 mt-1">
            إجمالي: <span class="font-medium text-navy tabular-nums">{{ groups.length }}</span> مجموعة
          </p>
        </div>
        <div class="flex gap-2 flex-wrap self-start sm:self-auto">
          <button
            @click="exportExcel"
            :disabled="groups.length === 0"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="download" class="w-4 h-4" />
            تصدير Excel
          </button>
          <button
            @click="openAdd"
            class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="plus" class="w-4 h-4" />
            مجموعة جديدة
          </button>
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

      <!-- ============ Sort tabs ============ -->
      <section
        class="rounded-2xl border border-border bg-white p-2 mb-5 flex items-center gap-1 flex-wrap"
        aria-label="ترتيب المجموعات"
      >
        <span class="text-xs text-navy/50 px-2">ترتيب:</span>
        <button
          v-for="opt in sortOptions"
          :key="opt.key"
          @click="sortBy = opt.key"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          :class="sortBy === opt.key
            ? 'bg-navy text-white'
            : 'text-navy/70 hover:bg-page'"
        >
          {{ opt.label }}
        </button>
      </section>

      <!-- ============ Loading skeleton ============ -->
      <div v-if="loading" class="space-y-4 animate-pulse" aria-busy="true" aria-live="polite">
        <div class="h-32 rounded-2xl bg-navy/5"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="h-40 rounded-2xl bg-navy/5"></div>
        </div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <template v-else>

        <!-- ============ Leaderboard ============ -->
        <section
          v-if="topGroups.length > 0"
          class="rounded-2xl border border-gold/30 bg-gradient-to-l from-gold/10 to-transparent p-5 sm:p-6 mb-5"
          aria-labelledby="leaderboard-title"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 id="leaderboard-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="trophy" class="w-4 h-4 text-gold" />
              أعلى 3 مجموعات نقاطاً
            </h2>
            <span class="text-xs text-navy/40">هذا الشهر</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              v-for="(g, i) in topGroups"
              :key="g.id"
              class="flex items-center gap-3 p-3.5 rounded-xl transition-shadow hover:shadow-sm"
              :class="podiumClass(i)"
            >
              <span class="text-2xl shrink-0">{{ ['🥇', '🥈', '🥉'][i] }}</span>
              <div class="flex-1 min-w-0">
                <router-link
                  :to="`/groups/${g.id}`"
                  class="font-semibold text-navy hover:text-brand block truncate transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                >
                  {{ g.name }}
                </router-link>
                <p class="text-xs text-navy/60 mt-0.5 tabular-nums">
                  <strong :class="scoreTextClass(g.score)">{{ g.score }} نقطة</strong>
                  <span class="text-navy/30">·</span>
                  {{ g.attendance_rate }}% حضور
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ Empty ============ -->
        <div
          v-if="groups.length === 0"
          class="rounded-2xl border border-border bg-white p-8 text-center"
        >
          <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
            <Icon name="users" class="w-6 h-6" />
          </div>
          <p class="text-navy font-medium mb-1">مفيش مجموعات لسه</p>
          <p class="text-sm text-navy/60 mb-5">ابدأ بإنشاء أول مجموعة</p>
          <button
            @click="openAdd"
            class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="plus" class="w-4 h-4" />
            اعمل أول مجموعة
          </button>
        </div>

        <!-- ============ Groups grid ============ -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article
            v-for="g in sortedGroups"
            :key="g.id"
            class="group rounded-2xl border border-border bg-white p-5 hover:border-brand/40 hover:shadow-sm transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg font-bold shrink-0">
                  {{ g.name.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <h2 class="font-semibold text-navy truncate">{{ g.name }}</h2>
                  <p class="text-xs text-navy/60 truncate">
                    {{ g.servant_name || 'بدون خادم' }}
                    <span v-if="g.co_servant_name" class="text-navy/40"> • مساعد: {{ g.co_servant_name }}</span>
                  </p>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1 shrink-0">
                <span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gold/15 text-gold tabular-nums">
                  <Icon name="users" class="w-3 h-3" />
                  {{ g.members_count }}
                </span>
                <span
                  class="text-[11px] tabular-nums inline-flex items-center gap-1"
                  :class="g.attendance_rate >= 70 ? 'text-success' : 'text-danger'"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ g.attendance_rate }}% حضور
                </span>
                <span class="text-[11px] font-bold tabular-nums inline-flex items-center gap-1" :class="scoreTextClass(g.score)">
                  <Icon name="trophy" class="w-3 h-3" />
                  {{ g.score }} نقطة
                </span>
              </div>
            </div>

            <p v-if="g.description" class="text-sm text-navy/70 mb-3 line-clamp-2">{{ g.description }}</p>

            <div class="flex items-center justify-end gap-1 pt-2 border-t border-border">
              <router-link
                :to="`/groups/${g.id}`"
                class="inline-flex items-center gap-1 text-brand text-xs font-medium hover:bg-brand/10 px-2.5 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Icon name="eye" class="w-3.5 h-3.5" />
                عرض
              </router-link>
              <button
                @click="openEdit(g)"
                class="inline-flex items-center gap-1 text-gold text-xs font-medium hover:bg-gold/10 px-2.5 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
              >
                <Icon name="edit" class="w-3.5 h-3.5" />
                تعديل
              </button>
              <button
                @click="remove(g.id, g.name)"
                class="inline-flex items-center gap-1 text-danger text-xs font-medium hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
              >
                <Icon name="trash" class="w-3.5 h-3.5" />
                حذف
              </button>
            </div>
          </article>
        </div>
      </template>
    </div>

    <!-- ============ Modal ============ -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-navy/50 backdrop-blur-sm"
          @click.self="closeModal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="editingId ? 'modal-title-edit' : 'modal-title-add'"
        >
          <div class="w-full max-w-md rounded-2xl bg-white shadow-xl border border-border p-6">
            <div class="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2
                  :id="editingId ? 'modal-title-edit' : 'modal-title-add'"
                  class="text-lg font-semibold text-navy"
                >
                  {{ editingId ? 'تعديل مجموعة' : 'إضافة مجموعة جديدة' }}
                </h2>
                <p class="text-xs text-navy/50 mt-0.5">
                  {{ editingId ? 'عدّل بيانات المجموعة' : 'املأ بيانات المجموعة الجديدة' }}
                </p>
              </div>
              <button
                @click="closeModal"
                class="shrink-0 w-8 h-8 rounded-full text-navy/40 hover:bg-page hover:text-navy transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                aria-label="إغلاق"
              >
                <Icon name="x" class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="save" class="space-y-3.5">
              <div>
                <label class="block text-sm font-medium mb-1 text-navy">
                  اسم المجموعة <span class="text-danger">*</span>
                </label>
                <input
                  v-model.trim="form.name"
                  type="text"
                  class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-colors"
                  :class="errors.name ? 'border-danger focus-visible:ring-danger/30' : 'border-border focus-visible:border-brand'"
                  placeholder="مثال: مجموعة مارمرقس"
                />
                <p v-if="errors.name" class="text-xs text-danger mt-1">{{ errors.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1 text-navy">الوصف</label>
                <textarea
                  v-model.trim="form.description"
                  rows="2"
                  class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors resize-none"
                  placeholder="وصف مختصر للمجموعة (اختياري)"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1 text-navy">الخادم الرئيسي</label>
                  <select
                    v-model="form.servant_id"
                    class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
                  >
                    <option value="">بدون</option>
                    <option v-for="s in servants" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1 text-navy">الخادم المساعد</label>
                  <select
                    v-model="form.co_servant_id"
                    class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
                  >
                    <option value="">بدون</option>
                    <option v-for="s in servants" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-2 border-t border-border mt-5 -mb-1">
                <button
                  type="button"
                  @click="closeModal"
                  :disabled="saving"
                  class="rounded-lg border border-border bg-white px-4 py-2 text-sm text-navy/70 hover:bg-page disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <svg
                    v-if="saving"
                    class="animate-spin w-3.5 h-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <Icon v-else name="check" class="w-3.5 h-3.5" />
                  {{ saving ? 'جارٍ الحفظ...' : (editingId ? 'حفظ التعديلات' : 'إضافة') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import api from '../api/client'
import { scoreLevel } from '../utils/groupScore'

/* ================= Icon component ================= */
const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
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

/* ================= State ================= */
const router = useRouter()
const groups = ref([])
const servants = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const errors = reactive({})
const successMessage = ref('')
const sortBy = ref('alpha')

const form = reactive({ name: '', description: '', servant_id: '', co_servant_id: '' })

const sortOptions = [
  { key: 'alpha', label: 'أبجدي' },
  { key: 'score', label: 'حسب النقاط' },
  { key: 'attendance', label: 'حسب الحضور' },
  { key: 'members', label: 'حسب الأعضاء' },
]

/* ================= Computed ================= */
const sortedGroups = computed(() => {
  const arr = [...groups.value]
  if (sortBy.value === 'alpha') return arr.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  if (sortBy.value === 'score') return arr.sort((a, b) => b.score - a.score)
  if (sortBy.value === 'attendance') return arr.sort((a, b) => b.attendance_rate - a.attendance_rate)
  if (sortBy.value === 'members') return arr.sort((a, b) => b.members_count - a.members_count)
  return arr
})

const topGroups = computed(() =>
  [...groups.value].filter((g) => g.members_count > 0).sort((a, b) => b.score - a.score).slice(0, 3)
)

/* ================= Helpers ================= */
function podiumClass(i) {
  if (i === 0) return 'bg-gold/20'
  if (i === 1) return 'bg-navy/10'
  return 'bg-brand/10'
}

function scoreTextClass(score) {
  const level = scoreLevel(score)
  const colorMap = {
    success: 'text-success',
    gold: 'text-gold',
    danger: 'text-danger',
    brand: 'text-brand',
  }
  return colorMap[level.color] || 'text-navy'
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function closeModal() {
  if (saving.value) return
  showModal.value = false
}

/* ================= Actions ================= */
function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', servant_id: '', co_servant_id: '' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function openEdit(g) {
  editingId.value = g.id
  Object.assign(form, {
    name: g.name,
    description: g.description || '',
    servant_id: g.servant_id || '',
    co_servant_id: g.co_servant_id || '',
  })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name) errors.name = 'اسم المجموعة مطلوب'
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return

  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description || null,
      servant_id: form.servant_id ? Number(form.servant_id) : null,
      co_servant_id: form.co_servant_id ? Number(form.co_servant_id) : null,
    }

    if (editingId.value) {
      await api.put(`/groups/${editingId.value}`, payload)
      successMessage.value = 'تم حفظ التعديلات'
    } else {
      await api.post('/groups', payload)
      successMessage.value = 'تم إنشاء المجموعة'
    }

    await loadData()
    setTimeout(() => (successMessage.value = ''), 2500)
    showModal.value = false
    editingId.value = null
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحفظ')
  } finally {
    saving.value = false
  }
}

async function remove(id, name) {
  if (!confirm(`متأكد من حذف "${name}"؟`)) return
  try {
    await api.delete(`/groups/${id}`)
    groups.value = groups.value.filter((g) => g.id !== id)
    successMessage.value = 'تم الحذف'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

function exportExcel() {
  const rows = sortedGroups.value.map((g) => ({
    'اسم المجموعة': g.name,
    'الخادم الرئيسي': g.servant_name || '',
    'الخادم المساعد': g.co_servant_name || '',
    'عدد الأعضاء': g.members_count,
    'نسبة الحضور': `${g.attendance_rate}%`,
    'النقاط': g.score,
    'الوصف': g.description || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'المجموعات')
  XLSX.writeFile(wb, `المجموعات_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function loadData() {
  loading.value = true
  try {
    const [groupsRes, servantsRes] = await Promise.all([
      api.get('/groups/stats'),
      api.get('/users'),
    ])
    groups.value = groupsRes.data
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .max-w-md,
.modal-leave-active .max-w-md {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .max-w-md,
.modal-leave-to .max-w-md {
  transform: scale(0.96) translateY(4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>