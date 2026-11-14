<template>
  <div class="min-h-screen bg-page py-8 px-4" dir="rtl">
    <div class="max-w-5xl mx-auto">

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
            <h1 class="text-2xl font-bold text-navy">سجل النشاط</h1>
            <p class="text-sm text-navy/60 mt-1">
              إجمالي: {{ logs.length }} عملية (آخر 500)
              <span v-if="filtered.length !== logs.length" class="text-brand">
                · معروض: {{ filtered.length }}
              </span>
            </p>
          </div>
        </div>
        <div class="flex gap-2 self-start sm:self-auto">
          <button
            @click="refresh"
            :disabled="loading"
            class="px-4 py-2 rounded-lg border border-border bg-card text-navy/70 text-sm font-medium hover:bg-page disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-navy/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model.trim="search"
              type="text"
              class="input pr-9"
              placeholder="ابحث في السجل..."
            />
          </div>
          <select v-model="filterAction" class="input">
            <option value="">كل العمليات</option>
            <option v-for="(info, key) in ACTION_LABELS" :key="key" :value="key">
              {{ info.icon }} {{ info.label }}
            </option>
          </select>
        </div>

        <div v-if="search || filterAction" class="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span class="text-navy/50">فلاتر نشطة:</span>
          <span v-if="search" class="badge">{{ search }}</span>
          <span v-if="filterAction" class="badge">{{ ACTION_LABELS[filterAction]?.label }}</span>
          <button @click="clearFilters" class="text-brand hover:underline">مسح الكل</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && logs.length === 0" class="card text-center py-16 text-navy/50">
        <svg class="animate-spin w-6 h-6 mx-auto mb-3 text-navy/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        جارٍ التحميل...
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="card py-14 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 rounded-full bg-navy/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-navy/60 font-medium">
            {{ logs.length === 0 ? 'مفيش سجلات لسه' : 'لا توجد نتائج مطابقة' }}
          </p>
          <button
            v-if="logs.length > 0"
            @click="clearFilters"
            class="text-brand hover:underline text-sm font-medium"
          >
            مسح الفلاتر →
          </button>
        </div>
      </div>

      <!-- List -->
      <div v-else class="card p-0 overflow-hidden">
        <ul class="divide-y divide-border">
          <li
            v-for="log in filtered"
            :key="log.id"
            class="p-4 hover:bg-page/60 transition-colors duration-150"
          >
            <div class="flex items-start gap-3">
              <div
                class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                :class="actionInfo(log.action).bubble"
              >
                {{ actionInfo(log.action).icon }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="font-medium text-sm" :class="actionInfo(log.action).color">
                    {{ actionInfo(log.action).label }}
                  </span>
                  <span class="text-xs text-navy/30">•</span>
                  <span class="text-xs text-navy/70 font-medium">{{ log.user_name }}</span>
                  <span class="text-xs text-navy/40 hidden sm:inline" dir="ltr">({{ log.user_email }})</span>
                </div>

                <!-- Details -->
                <p v-if="log.details?.name" class="text-sm text-navy truncate">
                  {{ log.details.name }}
                </p>
                <p v-else-if="log.details?.email" class="text-sm text-navy truncate" dir="ltr">
                  {{ log.details.email }}
                </p>
                <p v-else-if="log.details?.role" class="text-sm text-navy truncate">
                  الدور: {{ log.details.role }}
                </p>
                <p v-else-if="log.details?.status" class="text-sm text-navy truncate">
                  الحالة: {{ log.details.status }}
                </p>

                <div class="flex items-center gap-1.5 text-xs text-navy/50 mt-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDateTime(log.created_at) }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLogs, ACTION_LABELS } from '../utils/auditLog'

const router = useRouter()

const logs = ref([])
const loading = ref(false)
const search = ref('')
const filterAction = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return logs.value.filter((l) => {
    if (filterAction.value && l.action !== filterAction.value) return false
    if (q) {
      const hay = `${l.user_name} ${l.user_email} ${l.action} ${l.details?.name || ''} ${l.details?.email || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
})

const DEFAULT_BUBBLE = 'bg-navy/10 text-navy'

function actionInfo(action) {
  const info = ACTION_LABELS[action] || { label: action, icon: '•', color: 'text-navy' }
  return {
    ...info,
    bubble: info.bubble || DEFAULT_BUBBLE,
  }
}

function formatDateTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function clearFilters() {
  search.value = ''
  filterAction.value = ''
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

async function refresh() {
  loading.value = true
  logs.value = await getLogs()
  loading.value = false
}

onMounted(refresh)
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: rgb(var(--color-navy) / 0.08);
  color: rgb(var(--color-navy));
  font-size: 0.75rem;
  font-weight: 500;
}
</style>