<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- ============ Header ============ -->
      <header class="flex items-start justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">متابعة المخدومين</p>
          <h1 class="text-2xl font-bold text-navy truncate">الافتقاد</h1>
          <p class="text-sm text-navy/60 mt-1 flex items-center gap-1.5 flex-wrap">
            <template v-if="needsFollowup.length > 0">
              محتاجين تواصل:
              <span class="text-danger font-bold tabular-nums">{{ needsFollowup.length }}</span>
              من إجمالي {{ members.length }} مخدوم
            </template>
            <template v-else>
              إجمالي {{ members.length }} مخدوم — الكل متابَع
            </template>
          </p>
        </div>
        <button
          @click="goBack"
          class="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Icon name="arrow-right" class="w-4 h-4" />
          <span>رجوع</span>
        </button>
      </header>

      <!-- ============ Loading skeleton ============ -->
      <div v-if="loading" class="space-y-4" aria-busy="true" aria-live="polite">
        <div class="h-16 rounded-2xl bg-navy/5 animate-pulse"></div>
        <div class="h-96 rounded-2xl bg-navy/5 animate-pulse"></div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <template v-else>

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

        <!-- ============ Filters ============ -->
        <section
          class="rounded-2xl border border-border bg-white p-4 mb-5"
          aria-label="فلاتر البحث"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="relative">
              <Icon
                name="search"
                class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-navy/30 pointer-events-none"
              />
              <input
                v-model.trim="search"
                type="text"
                placeholder="ابحث بالاسم أو الهاتف..."
                class="w-full rounded-lg border border-border bg-white pr-9 pl-3 py-2 text-sm text-navy placeholder:text-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
              />
            </div>

            <select
              v-model="filterType"
              class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
            >
              <option value="all">كل المحتاجين</option>
              <option value="never">لم يتم التواصل معهم</option>
              <option value="late">عدّى 30 يوم</option>
            </select>

            <select
              v-model="filterGrade"
              class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
            >
              <option value="">كل الصفوف</option>
              <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <!-- Active filters -->
          <div
            v-if="activeFilterCount > 0"
            class="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap text-xs"
          >
            <span class="text-navy/40">فلاتر نشطة:</span>
            <span
              v-if="search"
              class="inline-flex items-center gap-1 rounded-full bg-navy/5 text-navy px-2.5 py-1"
            >
              {{ search }}
            </span>
            <span
              v-if="filterType !== 'all'"
              class="inline-flex items-center gap-1 rounded-full bg-navy/5 text-navy px-2.5 py-1"
            >
              {{ filterType === 'never' ? 'لم يتم التواصل' : 'عدّى 30 يوم' }}
            </span>
            <span
              v-if="filterGrade"
              class="inline-flex items-center gap-1 rounded-full bg-navy/5 text-navy px-2.5 py-1"
            >
              {{ filterGrade }}
            </span>
            <button
              @click="clearFilters"
              class="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
            >
              مسح الكل
            </button>
          </div>
        </section>

        <!-- ============ Results header ============ -->
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-navy/60">
            النتائج
            <span class="text-navy/40 font-normal">({{ filtered.length }})</span>
          </h2>
        </div>

        <!-- ============ Table ============ -->
        <section class="rounded-2xl border border-border bg-white overflow-hidden">

          <!-- Empty: everything done -->
          <div
            v-if="needsFollowup.length === 0"
            class="px-5 py-14 text-center"
          >
            <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
              <Icon name="check" class="w-6 h-6" />
            </div>
            <p class="text-navy font-semibold mb-1">كل المخدومين تم التواصل معهم</p>
            <p class="text-sm text-navy/50">مفيش حد محتاج متابعة دلوقتي</p>
          </div>

          <!-- Empty: no results for filters -->
          <div
            v-else-if="filtered.length === 0"
            class="px-5 py-14 text-center"
          >
            <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-navy/5 text-navy/40 flex items-center justify-center">
              <Icon name="search" class="w-5 h-5" />
            </div>
            <p class="text-navy/70 font-medium mb-1">لا توجد نتائج مطابقة</p>
            <p class="text-sm text-navy/50 mb-4">جرّب تغيير الفلاتر أو البحث بكلمة تانية</p>
            <button
              @click="clearFilters"
              class="rounded-lg border border-border bg-white px-4 py-2 text-sm text-navy hover:bg-page transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              مسح الفلاتر
            </button>
          </div>

          <!-- Table rows -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-page/40">
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">#</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الاسم</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs hidden sm:table-cell">الصف</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs hidden md:table-cell">ولي الأمر</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الهاتف</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">آخر تواصل</th>
                  <th class="text-center px-4 py-3 font-medium text-navy/60 text-xs">إجراء</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="(m, i) in filtered"
                  :key="m.id"
                  class="hover:bg-page/40 transition-colors"
                >
                  <td class="px-4 py-3 text-navy/40 tabular-nums text-xs">{{ i + 1 }}</td>

                  <td class="px-4 py-3">
                    <router-link
                      :to="`/members/${m.id}`"
                      class="font-medium text-navy hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                    >
                      {{ m.full_name }}
                    </router-link>
                  </td>

                  <td class="px-4 py-3 hidden sm:table-cell">
                    <span class="inline-block px-2 py-0.5 rounded-full bg-gold/15 text-gold text-xs whitespace-nowrap">
                      {{ m.grade }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-navy/70 hidden md:table-cell">{{ m.parent_name }}</td>

                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs text-navy/80 tabular-nums" dir="ltr">{{ m.parent_phone }}</span>
                      <a
                        :href="`https://wa.me/2${m.parent_phone}`"
                        target="_blank"
                        rel="noopener"
                        class="text-success hover:bg-success/10 p-1 rounded transition-colors"
                        title="مراسلة عبر واتساب"
                        aria-label="مراسلة عبر واتساب"
                      >
                        <Icon name="whatsapp" class="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  <td class="px-4 py-3 text-xs">
                    <span
                      v-if="m.daysSince === null"
                      class="inline-flex items-center gap-1 rounded-full bg-danger/5 text-danger px-2 py-0.5"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-danger"></span>
                      لم يتم
                    </span>
                    <span
                      v-else-if="m.daysSince > 30"
                      class="inline-flex items-center gap-1 rounded-full bg-danger/5 text-danger px-2 py-0.5 tabular-nums"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-danger"></span>
                      من {{ m.daysSince }} يوم
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full bg-success/5 text-success px-2 py-0.5 tabular-nums"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                      من {{ m.daysSince }} يوم
                    </span>
                  </td>

                  <td class="px-4 py-3 text-center">
                    <button
                      @click="markDone(m.id)"
                      :disabled="marking === m.id"
                      class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <svg
                        v-if="marking === m.id"
                        class="animate-spin w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <Icon v-else name="check" class="w-3.5 h-3.5" />
                      {{ marking === m.id ? 'جارٍ...' : 'تم' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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

/* ================= Icon component ================= */
const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  check: 'M20 6 9 17l-5-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  whatsapp:
    'M17.5 14.4c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 2 .5 3.9 1.5 5.6L2 22l4.5-1.5C8.1 21.5 10 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z',
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
const members = ref([])
const followupsMap = ref({})
const loading = ref(false)
const successMessage = ref('')
const marking = ref(null)

const filterType = ref('all')
const filterGrade = ref('')
const search = ref('')

const grades = [
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
]

/* ================= Computed ================= */
const needsFollowup = computed(() => {
  const today = new Date()
  const result = []
  members.value.forEach((m) => {
    const list = followupsMap.value[m.id] || []
    let daysSince = null
    if (list.length > 0) {
      const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
      daysSince = Math.floor((today - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24))
    }
    if (list.length === 0 || daysSince > 30) {
      result.push({ ...m, daysSince })
    }
  })
  return result.sort((a, b) => {
    if (a.daysSince === null && b.daysSince !== null) return -1
    if (a.daysSince !== null && b.daysSince === null) return 1
    return (b.daysSince || 0) - (a.daysSince || 0)
  })
})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return needsFollowup.value.filter((m) => {
    if (filterType.value === 'never' && m.daysSince !== null) return false
    if (filterType.value === 'late' && (m.daysSince === null || m.daysSince <= 30)) return false
    if (filterGrade.value && m.grade !== filterGrade.value) return false
    if (q && !m.full_name?.toLowerCase().includes(q) && !m.parent_phone?.includes(q)) return false
    return true
  })
})

const activeFilterCount = computed(() => {
  let n = 0
  if (search.value) n++
  if (filterType.value !== 'all') n++
  if (filterGrade.value) n++
  return n
})

/* ================= Actions ================= */
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

    if (!followupsMap.value[memberId]) followupsMap.value[memberId] = []
    followupsMap.value[memberId].push({
      date: new Date().toISOString(),
      method: 'call',
    })

    successMessage.value = 'تم تسجيل التواصل بنجاح'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل التسجيل')
  } finally {
    marking.value = null
  }
}

async function loadData() {
  loading.value = true
  try {
    const [membersRes, followupsRes] = await Promise.all([
      api.get('/members'),
      api.get('/followups'),
    ])
    members.value = membersRes.data

    const map = {}
    followupsRes.data.forEach((f) => {
      if (!map[f.member_id]) map[f.member_id] = []
      map[f.member_id].push(f)
    })
    followupsMap.value = map
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