<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- ============ Header ============ -->
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">قراءات الإنجيل</p>
          <h1 class="text-2xl font-bold text-navy truncate">القراءات</h1>
          <p class="text-sm text-navy/60 mt-1">
            إجمالي: <span class="font-medium text-navy tabular-nums">{{ readings.length }}</span> قراءة
          </p>
        </div>
        <div class="flex gap-2 flex-wrap self-start sm:self-auto">
          <router-link
            v-if="isAdmin"
            to="/reading-books"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="book" class="w-4 h-4" />
            الأسفار
          </router-link>
          <router-link
            to="/readings/new"
            class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="plus" class="w-4 h-4" />
            تسجيل قراءة
          </router-link>
          <button
            v-if="isLoggedIn"
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

      <!-- ============ Stats ============ -->
      <section
        class="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border mb-5"
        aria-label="إحصائيات القراءات"
      >
        <Stat label="إجمالي القراءات" :value="readings.length" />
        <Stat label="مخدومين" :value="uniqueMembers.length" tone="ok" />
        <Stat label="أسفار" :value="uniqueBooks.length" tone="gold" />
        <Stat label="بلدان" :value="uniqueCountries.length" tone="muted" />
      </section>

      <!-- ============ Filters ============ -->
      <section
        class="rounded-2xl border border-border bg-white p-4 mb-5"
        aria-label="فلاتر البحث"
      >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="relative">
            <Icon
              name="search"
              class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-navy/30 pointer-events-none"
            />
            <input
              v-model.trim="search"
              type="text"
              placeholder="ابحث بالاسم أو البلد..."
              class="w-full rounded-lg border border-border bg-white pr-9 pl-3 py-2 text-sm text-navy placeholder:text-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
            />
          </div>

          <select
            v-model="filterBook"
            class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
          >
            <option value="">كل الأسفار</option>
            <option v-for="b in books" :key="b.id" :value="b.id">{{ b.book_name }}</option>
          </select>

          <select
            v-model="filterCountry"
            class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
          >
            <option value="">كل البلدان</option>
            <option v-for="c in uniqueCountries" :key="c" :value="c">{{ c }}</option>
          </select>

          <select
            v-model="filterSort"
            class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
          >
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
          </select>
        </div>

        <div
          v-if="activeFilterCount > 0"
          class="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap text-xs"
        >
          <span class="text-navy/40">فلاتر نشطة:</span>
          <span v-if="search" class="inline-flex items-center rounded-full bg-navy/5 text-navy px-2.5 py-1">{{ search }}</span>
          <span v-if="filterBook" class="inline-flex items-center rounded-full bg-navy/5 text-navy px-2.5 py-1">{{ bookName(filterBook) }}</span>
          <span v-if="filterCountry" class="inline-flex items-center rounded-full bg-navy/5 text-navy px-2.5 py-1">{{ filterCountry }}</span>
          <span v-if="filterSort === 'oldest'" class="inline-flex items-center rounded-full bg-navy/5 text-navy px-2.5 py-1">الأقدم أولاً</span>
          <button
            @click="clearFilters"
            class="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
          >
            مسح الكل
          </button>
        </div>
      </section>

      <!-- ============ Loading skeleton ============ -->
      <div v-if="loading" class="space-y-4 animate-pulse" aria-busy="true" aria-live="polite">
        <div class="h-24 rounded-2xl bg-navy/5"></div>
        <div class="h-96 rounded-2xl bg-navy/5"></div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <template v-else>

        <!-- ============ Top readers ============ -->
        <section
          v-if="topReaders.length > 0"
          class="rounded-2xl border border-gold/30 bg-gradient-to-l from-gold/10 to-transparent p-5 sm:p-6 mb-5"
          aria-labelledby="top-readers-title"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 id="top-readers-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="trophy" class="w-4 h-4 text-gold" />
              أعلى 5 مخدومين قراءة
            </h2>
            <span class="text-xs text-navy/40">على مستوى الخدمة</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div
              v-for="(r, i) in topReaders"
              :key="r.name"
              class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 border border-border/60"
            >
              <span class="text-lg shrink-0">{{ ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] }}</span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-navy text-sm truncate">{{ r.name }}</p>
                <p class="text-xs text-navy/60 tabular-nums">{{ r.count }} قراءة</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ Empty: no readings ============ -->
        <div
          v-if="readings.length === 0"
          class="rounded-2xl border border-border bg-white p-8 text-center"
        >
          <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
            <Icon name="book" class="w-6 h-6" />
          </div>
          <p class="text-navy font-medium mb-1">مفيش قراءات لسه</p>
          <p class="text-sm text-navy/60 mb-5">سجّل أول قراءة لمخدوم من الخدمة</p>
          <router-link
            to="/readings/new"
            class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="plus" class="w-4 h-4" />
            سجّل أول قراءة
          </router-link>
        </div>

        <!-- ============ Empty: no results ============ -->
        <div
          v-else-if="filtered.length === 0"
          class="rounded-2xl border border-border bg-white p-8 text-center"
        >
          <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
            <Icon name="search" class="w-5 h-5" />
          </div>
          <p class="text-navy font-medium mb-1">لا توجد نتائج مطابقة</p>
          <p class="text-sm text-navy/60 mb-5">جرّب تغيير الفلاتر أو البحث بكلمة تانية</p>
          <button
            @click="clearFilters"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm text-navy hover:bg-page transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            مسح الفلاتر
          </button>
        </div>

        <!-- ============ Table ============ -->
        <section v-else class="rounded-2xl border border-border bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-page/40">
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">#</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الاسم</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs hidden sm:table-cell">البلد</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">السفر</th>
                  <th class="text-center px-4 py-3 font-medium text-navy/60 text-xs">الأصحاح</th>
                  <th v-if="isAdmin" class="text-center px-4 py-3 font-medium text-navy/60 text-xs hidden md:table-cell">النوع</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">التاريخ</th>
                  <th v-if="isAdmin" class="text-center px-4 py-3 font-medium text-navy/60 text-xs">إجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="(r, i) in filtered"
                  :key="r.id"
                  class="hover:bg-page/40 transition-colors"
                >
                  <td class="px-4 py-3 text-navy/40 tabular-nums text-xs">{{ i + 1 }}</td>

                  <td class="px-4 py-3">
                    <span class="font-medium text-navy">{{ r.member_name }}</span>
                  </td>

                  <td class="px-4 py-3 text-xs text-navy/70 hidden sm:table-cell">
                    {{ r.country || '—' }}
                  </td>

                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                      :class="r.book_type === 'old'
                        ? 'bg-gold/15 text-gold'
                        : 'bg-brand/10 text-brand'"
                    >
                      <Icon name="book" class="w-3 h-3" />
                      {{ r.book_name }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-brand/10 text-brand font-bold text-sm tabular-nums">
                      {{ r.chapter }}
                    </span>
                  </td>

                  <td v-if="isAdmin" class="px-4 py-3 text-center hidden md:table-cell">
                    <span
                      class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                      :class="r.visibility === 'private'
                        ? 'bg-gold/15 text-gold'
                        : 'bg-success/10 text-success'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {{ r.visibility === 'private' ? 'خاصة' : 'عامة' }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-xs text-navy/60 tabular-nums whitespace-nowrap">
                    {{ formatDate(r.read_at) }}
                  </td>

                  <td v-if="isAdmin" class="px-4 py-3 text-center">
                    <button
                      @click="remove(r.id)"
                      class="inline-flex items-center gap-1 text-danger text-xs font-medium hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                      aria-label="حذف القراءة"
                    >
                      <Icon name="trash" class="w-3.5 h-3.5" />
                      حذف
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
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

/* ================= Icon component ================= */
const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
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
      gold: 'text-gold',
      danger: 'text-danger',
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
const readings = ref([])
const books = ref([])
const loading = ref(false)
const successMessage = ref('')

const search = ref('')
const filterBook = ref(route.query.book ? Number(route.query.book) : '')
const filterCountry = ref('')
const filterSort = ref('newest')

const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const isAdmin = computed(() => {
  const u = JSON.parse(localStorage.getItem('user') || '{}')
  return u.role === 'admin'
})

/* ================= Computed ================= */
const uniqueMembers = computed(() => [...new Set(readings.value.map((r) => r.member_name))])
const uniqueBooks = computed(() => [...new Set(readings.value.map((r) => r.book_name))])
const uniqueCountries = computed(() =>
  [...new Set(readings.value.map((r) => r.country).filter(Boolean))]
)

const activeFilterCount = computed(() => {
  let n = 0
  if (search.value) n++
  if (filterBook.value) n++
  if (filterCountry.value) n++
  if (filterSort.value !== 'newest') n++
  return n
})

const topReaders = computed(() => {
  const counts = {}
  readings.value.forEach((r) => {
    counts[r.member_name] = (counts[r.member_name] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let arr = readings.value.filter((r) => {
    if (q && !r.member_name?.toLowerCase().includes(q) && !r.country?.toLowerCase().includes(q)) return false
    if (filterBook.value && r.book_id !== Number(filterBook.value)) return false
    if (filterCountry.value && r.country !== filterCountry.value) return false
    return true
  })
  if (filterSort.value === 'newest') arr.sort((a, b) => new Date(b.read_at) - new Date(a.read_at))
  else arr.sort((a, b) => new Date(a.read_at) - new Date(b.read_at))
  return arr
})

/* ================= Helpers ================= */
function bookName(id) {
  const b = books.value.find((x) => x.id === Number(id))
  return b ? b.book_name : ''
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function clearFilters() {
  search.value = ''
  filterBook.value = ''
  filterCountry.value = ''
  filterSort.value = 'newest'
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

/* ================= Actions ================= */
async function remove(id) {
  if (!confirm('متأكد من حذف القراءة؟')) return
  try {
    await api.delete(`/readings/${id}`)
    readings.value = readings.value.filter((r) => r.id !== id)
    successMessage.value = 'تم الحذف'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

async function loadData() {
  loading.value = true
  try {
    const [readingsRes, booksRes] = await Promise.all([
      api.get('/readings'),
      api.get('/reading-books'),
    ])
    readings.value = readingsRes.data
    books.value = booksRes.data
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