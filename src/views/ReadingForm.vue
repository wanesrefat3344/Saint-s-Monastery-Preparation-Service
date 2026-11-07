<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy">📖 تسجيل قراءة جديدة</h1>
          <p class="text-sm text-navy/60 mt-1">سجّل قراءتك من الإنجيل</p>
        </div>
        <router-link to="/readings" class="btn-cancel text-sm">رجوع</router-link>
      </div>

      <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
        {{ successMessage }}
      </div>
      <div v-if="generalError" class="mb-4 rounded-lg bg-danger/10 border border-danger text-danger px-4 py-3 text-sm">
        {{ generalError }}
      </div>

      <div v-if="books.length === 0" class="card text-center py-16">
        <p class="text-navy/60 mb-4">مفيش أسفار متاحة للقراءة دلوقتي</p>
        <p class="text-xs text-navy/40">اطلب من الأدمن يضيف أسفار الأول</p>
      </div>

      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <!-- نوع القراءة (أدمن بس) -->
        <section v-if="isAdmin" class="card bg-gold/5 border-gold/30">
          <h2 class="text-lg font-semibold text-navy mb-3">نوع القراءة</h2>
          <div class="flex gap-2">
            <button type="button" @click="form.visibility = 'public'" class="flex-1 px-3 py-2 rounded-lg text-sm transition" :class="form.visibility === 'public' ? 'bg-brand text-white' : 'bg-page text-navy'">
              🌐 عامة (تظهر للكل)
            </button>
            <button type="button" @click="form.visibility = 'private'" class="flex-1 px-3 py-2 rounded-lg text-sm transition" :class="form.visibility === 'private' ? 'bg-gold text-white' : 'bg-page text-navy'">
              🔒 خاصة (للأدمن بس)
            </button>
          </div>
        </section>

        <!-- بيانات القارئ -->
        <section class="card">
          <h2 class="text-lg font-semibold text-navy mb-4">بياناتك</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">اسمك <span class="text-danger">*</span></label>
              <input v-model.trim="form.memberName" type="text" class="input" :class="{ 'input-error': errors.memberName }" placeholder="اكتب اسمك الكامل" />
              <p v-if="errors.memberName" class="error-text">{{ errors.memberName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">البلد <span class="text-danger">*</span></label>
              <input v-model.trim="form.country" type="text" class="input" :class="{ 'input-error': errors.country }" placeholder="مثال: مصر" />
              <p v-if="errors.country" class="error-text">{{ errors.country }}</p>
            </div>
          </div>
        </section>

        <!-- القراءة -->
        <section class="card">
          <h2 class="text-lg font-semibold text-navy mb-4">القراءة</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">السفر <span class="text-danger">*</span></label>
              <select v-model="form.bookId" class="input" :class="{ 'input-error': errors.bookId }" @change="form.chapter = ''">
                <option value="">— اختر السفر —</option>
                <optgroup label="📜 العهد القديم">
                  <option v-for="b in oldBooks" :key="b.id" :value="b.id">{{ b.book_name }} ({{ b.total_chapters }} أصحاح)</option>
                </optgroup>
                <optgroup label="✝️ العهد الجديد">
                  <option v-for="b in newBooks" :key="b.id" :value="b.id">{{ b.book_name }} ({{ b.total_chapters }} أصحاح)</option>
                </optgroup>
              </select>
              <p v-if="errors.bookId" class="error-text">{{ errors.bookId }}</p>
            </div>

            <div v-if="selectedBook">
              <label class="block text-sm font-medium mb-1">الأصحاح <span class="text-danger">*</span></label>
              <select v-model.number="form.chapter" class="input" :class="{ 'input-error': errors.chapter }">
                <option value="">— اختر الأصحاح —</option>
                <option v-for="n in selectedBook.total_chapters" :key="n" :value="n">الأصحاح {{ n }}</option>
              </select>
              <p v-if="errors.chapter" class="error-text">{{ errors.chapter }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">ملاحظات (اختياري)</label>
              <textarea v-model.trim="form.notes" rows="2" class="input resize-none" placeholder="أي ملاحظات..."></textarea>
            </div>
          </div>
        </section>

        <div class="flex items-center justify-end gap-3">
          <button type="button" @click="resetForm" class="btn-cancel">إلغاء</button>
          <button type="submit" :disabled="loading" class="btn-success">
            {{ loading ? 'جارٍ الحفظ...' : 'حفظ القراءة' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import api from '../api/client'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = computed(() => user.role === 'admin')

const books = ref([])

const form = reactive({
  memberName: '', country: '', bookId: '', chapter: '', notes: '', visibility: 'public',
})

const errors = reactive({})
const loading = ref(false)
const successMessage = ref('')
const generalError = ref('')

const oldBooks = computed(() => books.value.filter((b) => b.book_type === 'old'))
const newBooks = computed(() => books.value.filter((b) => b.book_type === 'new'))
const selectedBook = computed(() => {
  if (!form.bookId) return null
  return books.value.find((b) => b.id === Number(form.bookId)) || null
})

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.memberName) errors.memberName = 'الاسم مطلوب'
  if (!form.country) errors.country = 'البلد مطلوب'
  if (!form.bookId) errors.bookId = 'السفر مطلوب'
  if (!form.chapter) errors.chapter = 'الأصحاح مطلوب'
  return Object.keys(errors).length === 0
}

async function submitForm() {
  successMessage.value = ''
  generalError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await api.post('/readings', {
      member_name: form.memberName,
      country: form.country,
      book_id: Number(form.bookId),
      chapter: Number(form.chapter),
      notes: form.notes || null,
      visibility: form.visibility,
    })
    successMessage.value = 'تم تسجيل القراءة ✅'
    setTimeout(() => (successMessage.value = ''), 3000)
    form.chapter = ''
    form.notes = ''
  } catch (e) {
    generalError.value = e.response?.data?.message || 'فشل الحفظ'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, { memberName: '', country: '', bookId: '', chapter: '', notes: '', visibility: 'public' })
  Object.keys(errors).forEach((k) => delete errors[k])
  successMessage.value = ''
  generalError.value = ''
}

async function loadBooks() {
  try {
    const { data } = await api.get('/reading-books')
    books.value = data
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadBooks)
</script>