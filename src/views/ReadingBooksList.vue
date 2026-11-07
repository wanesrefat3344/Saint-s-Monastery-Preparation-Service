<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy">📚 أسفار القراءة</h1>
          <p class="text-sm text-navy/60 mt-1">إجمالي: {{ books.length }} سفر</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <router-link to="/readings" class="btn-cancel text-sm">📖 القراءات</router-link>
          <button @click="openAdd" class="btn-primary text-sm">+ إضافة سفر</button>
          <router-link to="/" class="btn-cancel text-sm">رجوع</router-link>
        </div>
      </div>

      <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
        {{ successMessage }}
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="إجمالي الأسفار" :value="books.length" color="brand" />
        <StatCard label="عهد قديم" :value="oldCount" color="gold" />
        <StatCard label="عهد جديد" :value="newCount" color="brand" />
        <StatCard label="نشطة" :value="activeCount" color="success" />
      </div>

      <div v-if="loading" class="card text-center py-16 text-navy/50">جارٍ التحميل...</div>

      <div v-else-if="books.length === 0" class="card text-center py-16">
        <p class="text-navy/60 mb-4">مفيش أسفار لسه</p>
        <button @click="openAdd" class="btn-primary">أضف أول سفر</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="b in books" :key="b.id" class="card">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="b.book_type === 'old' ? 'bg-gold/10' : 'bg-brand/10'">📖</div>
              <div>
                <h2 class="font-semibold text-navy">{{ b.book_name }}</h2>
                <p class="text-xs text-navy/60">{{ b.book_type === 'old' ? 'عهد قديم' : 'عهد جديد' }} • {{ b.total_chapters }} أصحاح</p>
              </div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full" :class="isActive(b) ? 'bg-success/10 text-success' : 'bg-navy/10 text-navy/60'">
              {{ isActive(b) ? '🟢 نشط' : '⚪ منتهي' }}
            </span>
          </div>
          <div class="text-xs text-navy/70 space-y-1 mb-3">
            <p>📅 من: {{ formatDate(b.start_date) }}</p>
            <p>📅 إلى: {{ formatDate(b.end_date) }}</p>
          </div>
          <div class="flex gap-1 justify-end">
            <router-link :to="`/readings?book=${b.id}`" class="text-brand text-xs hover:bg-brand/10 px-2 py-1 rounded">عرض القراءات</router-link>
            <button @click="remove(b.id, b.book_name)" class="text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded">حذف</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal إضافة -->
    <div v-if="showModal" class="fixed inset-0 bg-navy/40 flex items-center justify-center px-4 z-50 overflow-y-auto">
      <div class="bg-card rounded-xl shadow-lg w-full max-w-lg p-6 my-8">
        <h2 class="text-lg font-semibold text-navy mb-4">إضافة سفر جديد</h2>
        <form @submit.prevent="save" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">نوع العهد</label>
            <div class="flex gap-2">
              <button type="button" @click="form.book_type = 'old'" class="flex-1 px-3 py-2 rounded-lg text-sm transition" :class="form.book_type === 'old' ? 'bg-brand text-white' : 'bg-page text-navy'">📜 عهد قديم</button>
              <button type="button" @click="form.book_type = 'new'" class="flex-1 px-3 py-2 rounded-lg text-sm transition" :class="form.book_type === 'new' ? 'bg-brand text-white' : 'bg-page text-navy'">✝️ عهد جديد</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">اسم السفر <span class="text-danger">*</span></label>
            <input v-model.trim="form.book_name" class="input" :class="{ 'input-error': errors.book_name }" />
            <p v-if="errors.book_name" class="error-text">{{ errors.book_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">عدد الأصحاحات <span class="text-danger">*</span></label>
            <input v-model.number="form.total_chapters" type="number" min="1" class="input" :class="{ 'input-error': errors.total_chapters }" />
            <p v-if="errors.total_chapters" class="error-text">{{ errors.total_chapters }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">تاريخ البداية</label>
            <input v-model="form.start_date" type="date" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">تاريخ النهاية</label>
            <input v-model="form.end_date" type="date" class="input" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="showModal = false" class="btn-cancel">إلغاء</button>
            <button type="submit" :disabled="saving" class="btn-success">{{ saving ? 'جارٍ...' : 'إضافة' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../api/client'

const StatCard = {
  props: ['label', 'value', 'color'],
  template: `
    <div class="card">
      <p class="text-xs text-navy/50 mb-1">{{ label }}</p>
      <p class="text-2xl font-bold" :class="{
        'text-success': color === 'success',
        'text-gold': color === 'gold',
        'text-brand': !color || color === 'brand'
      }">{{ value }}</p>
    </div>
  `,
}

const books = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const errors = reactive({})
const successMessage = ref('')

const form = reactive({
  book_name: '', book_type: 'old', total_chapters: 0, start_date: '', end_date: '',
})

const oldCount = computed(() => books.value.filter((b) => b.book_type === 'old').length)
const newCount = computed(() => books.value.filter((b) => b.book_type === 'new').length)
const activeCount = computed(() => books.value.filter((b) => isActive(b)).length)

function isActive(b) {
  if (!b.end_date) return true
  return new Date(b.end_date) >= new Date()
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openAdd() {
  Object.assign(form, { book_name: '', book_type: 'old', total_chapters: 0, start_date: '', end_date: '' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.book_name) errors.book_name = 'اسم السفر مطلوب'
  if (!form.total_chapters || form.total_chapters < 1) errors.total_chapters = 'عدد الأصحاحات مطلوب'
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    await api.post('/reading-books', {
      book_name: form.book_name,
      book_type: form.book_type,
      total_chapters: Number(form.total_chapters),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    })
    await loadData()
    successMessage.value = 'تم إضافة السفر ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
    showModal.value = false
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحفظ')
  } finally {
    saving.value = false
  }
}

async function remove(id, name) {
  if (!confirm(`حذف "${name}"؟ القراءات المرتبطة هتتشال كمان.`)) return
  try {
    await api.delete(`/reading-books/${id}`)
    books.value = books.value.filter((b) => b.id !== id)
    successMessage.value = 'تم الحذف ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/reading-books')
    books.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>