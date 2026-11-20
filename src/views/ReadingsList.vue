<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy">📖 القراءات</h1>
          <p class="text-sm text-navy/60 mt-1">تصفح قراءات المخدومين</p>
        </div>
        <router-link to="/readings/new" class="btn-primary text-sm">
          <Icon name="plus" class="w-4 h-4" />
          تسجيل قراءة
        </router-link>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="card animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-navy/5"></div>
            <div class="space-y-2 flex-1">
              <div class="h-5 w-3/4 rounded bg-navy/5"></div>
              <div class="h-4 w-1/2 rounded bg-navy/5"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="card text-center py-8">
        <Icon name="alert" class="w-10 h-10 text-danger mx-auto mb-2" />
        <p class="text-navy/60 mb-2">{{ errorMessage }}</p>
        <button @click="loadReadings" class="btn-primary text-sm">إعادة المحاولة</button>
      </div>

      <div v-else-if="readings.length === 0" class="card text-center py-16">
        <div class="text-4xl mb-3">📖</div>
        <p class="text-navy/60 mb-1">لا توجد قراءات بعد</p>
        <p class="text-xs text-navy/40 mb-4">
          <span v-if="isAuthenticated">كن أول من يسجل قراءة!</span>
          <span v-else>سجل دخولك لتسجيل قراءة أو تصفح القراءات العامة</span>
        </p>
        <router-link v-if="!isAuthenticated" to="/login" class="btn-primary text-sm">تسجيل الدخول</router-link>
        <router-link v-else to="/readings/new" class="btn-primary text-sm">
          <Icon name="plus" class="w-4 h-4" />
          تسجيل قراءة جديدة
        </router-link>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="reading in readings"
          :key="reading.id"
          class="card hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-xl shrink-0">
              📖
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <h3 class="font-semibold text-navy truncate">{{ reading.book_name }} - أصحاح {{ reading.chapter }}</h3>
                <span class="text-xs text-navy/50 whitespace-nowrap">{{ formatDate(reading.created_at) }}</span>
              </div>
              <p class="text-sm text-navy/70 mb-2">{{ reading.member_name }} · {{ reading.country }}</p>
              <div class="flex items-center gap-2 text-xs text-navy/50 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" :class="reading.visibility === 'public' ? 'bg-success/10 text-success' : 'bg-gold/10 text-gold'">
                  <span v-if="reading.visibility === 'public'">🌐</span>
                  <span v-else>🔒</span>
                  {{ reading.visibility === 'public' ? 'عامة' : 'خاصة' }}
                </span>
                <span v-if="reading.notes && isAuthenticated" class="bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full">
                  {{ reading.notes }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination if needed -->
      <div v-if="!loading && readings.length > 0 && totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 rounded-lg border border-border text-navy hover:bg-page disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          السابق
        </button>
        <span class="text-sm text-navy/60">صفحة {{ currentPage }} من {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 rounded-lg border border-border text-navy hover:bg-page disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          التالي
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'

const router = useRouter()

const user = JSON.parse(localStorage.getItem('user') || '{}')
const token = localStorage.getItem('token')
const isAuthenticated = computed(() => !!token)

const readings = ref([])
const loading = ref(true)
const errorMessage = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = 20
const totalPages = ref(1)

async function loadReadings() {
  loading.value = true
  errorMessage.value = ''
  try {
    // The API handles authentication via interceptor
    // If no token, it will return only public readings with hidden fields
    const { data } = await api.get('/readings', {
      params: {
        page: currentPage.value,
        limit: pageSize,
      },
    })

    readings.value = data.data || data.readings || data
    totalPages.value = data.totalPages || Math.ceil((data.total || readings.value.length) / pageSize)
  } catch (e) {
    console.error('Failed to load readings:', e)
    errorMessage.value = e.response?.data?.message || 'فشل تحميل القراءات، تأكد من الاتصال بالإنترنت وحاول تاني'
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadReadings()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadReadings()
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(loadReadings)
</script>