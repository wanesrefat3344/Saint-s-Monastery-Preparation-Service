<template>
  <div class="min-h-screen bg-page py-10 px-4 pb-28" dir="rtl">
    <div class="max-w-3xl mx-auto">

      <!-- Header -->
      <div class="mb-6 flex items-start justify-between gap-3">
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
            <h1 class="text-2xl font-bold text-navy">تسجيل مخدوم جديد</h1>
            <p class="text-sm text-navy/60 mt-1">املأ البيانات التالية لتسجيل مخدوم في الخدمة</p>
          </div>
        </div>
      </div>

      <!-- Draft notice -->
      <div v-if="hasDraft && !draftLoaded" class="mb-4 rounded-lg bg-gold/10 border border-gold text-navy px-4 py-3 text-sm flex items-center justify-between gap-3">
        <span>📝 عندك مسودة محفوظة من قبل</span>
        <div class="flex gap-2">
          <button @click="restoreDraft" class="text-brand font-medium hover:underline text-xs">استرجاع</button>
          <button @click="clearDraft" class="text-danger font-medium hover:underline text-xs">مسح</button>
        </div>
      </div>

      <transition name="fade">
        <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
          {{ successMessage }}
        </div>
      </transition>
      <transition name="fade">
        <div v-if="generalError" class="mb-4 rounded-lg bg-danger/10 border border-danger text-danger px-4 py-3 text-sm">
          {{ generalError }}
        </div>
      </transition>

      <form @submit.prevent="submitForm" class="space-y-6">
        <section class="card">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>
            بيانات المخدوم
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1 text-navy">الاسم رباعي <span class="text-danger">*</span></label>
              <input
                v-model.trim="form.fullName"
                type="text"
                placeholder="مثال: يوسف مجدي محمد علي"
                class="input"
                :class="{ 'input-error': errors.fullName }"
                @blur="touched.fullName = true"
              />
              <p v-if="errors.fullName" class="error-text">{{ errors.fullName }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-navy">تاريخ الميلاد <span class="text-danger">*</span></label>
              <input v-model="form.birthDate" type="date" class="input" :class="{ 'input-error': errors.birthDate }" />
              <p v-if="errors.birthDate" class="error-text">{{ errors.birthDate }}</p>
              <p v-else-if="age !== null" class="text-xs text-navy/50 mt-1">العمر: {{ age }} سنة</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-navy">النوع <span class="text-danger">*</span></label>
              <select v-model="form.gender" class="input" :class="{ 'input-error': errors.gender }">
                <option value="">اختر النوع</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              <p v-if="errors.gender" class="error-text">{{ errors.gender }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-navy">الصف الدراسي <span class="text-danger">*</span></label>
              <select v-model="form.grade" class="input" :class="{ 'input-error': errors.grade }">
                <option value="">اختر الصف</option>
                <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
              </select>
              <p v-if="errors.grade" class="error-text">{{ errors.grade }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-navy">الخادم المسؤول</label>
              <select v-model="form.servantId" class="input">
                <option value="">بدون</option>
                <option v-for="s in activeServants" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-navy">المجموعة</label>
              <select v-model="form.groupId" class="input">
                <option value="">بدون</option>
                <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-navy">رقم هاتف المخدوم</label>
              <input v-model.trim="form.memberPhone" type="tel" inputmode="numeric" placeholder="01xxxxxxxxx" class="input" :class="{ 'input-error': errors.memberPhone }" dir="ltr" />
              <p v-if="errors.memberPhone" class="error-text">{{ errors.memberPhone }}</p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1 text-navy">العنوان</label>
              <textarea v-model.trim="form.address" rows="2" placeholder="المدينة - الشارع - رقم المنزل" class="input resize-none"></textarea>
            </div>
          </div>
        </section>

        <section class="card">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>
            بيانات ولي الأمر
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">اسم ولي الأمر <span class="text-danger">*</span></label>
              <input v-model.trim="form.parentName" type="text" class="input" :class="{ 'input-error': errors.parentName }" />
              <p v-if="errors.parentName" class="error-text">{{ errors.parentName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">رقم هاتف ولي الأمر <span class="text-danger">*</span></label>
              <input v-model.trim="form.parentPhone" type="tel" inputmode="numeric" placeholder="01xxxxxxxxx" class="input" :class="{ 'input-error': errors.parentPhone }" dir="ltr" />
              <p v-if="errors.parentPhone" class="error-text">{{ errors.parentPhone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">صلة القرابة <span class="text-danger">*</span></label>
              <select v-model="form.relation" class="input" :class="{ 'input-error': errors.relation }">
                <option value="">اختر صلة القرابة</option>
                <option v-for="r in relations" :key="r" :value="r">{{ r }}</option>
              </select>
              <p v-if="errors.relation" class="error-text">{{ errors.relation }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">رقم هاتف بديل</label>
              <input v-model.trim="form.altPhone" type="tel" inputmode="numeric" placeholder="01xxxxxxxxx" class="input" :class="{ 'input-error': errors.altPhone }" dir="ltr" />
              <p v-if="errors.altPhone" class="error-text">{{ errors.altPhone }}</p>
            </div>
          </div>
        </section>
      </form>
    </div>

    <div class="fixed bottom-0 inset-x-0 z-20 bg-card/95 backdrop-blur border-t border-border">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-end gap-3">
        <button type="button" @click="resetForm" :disabled="loading" class="btn-cancel">إلغاء</button>
        <button type="button" @click="submitForm" :disabled="loading" class="btn-success">
          {{ loading ? 'جارٍ الحفظ...' : 'حفظ البيانات' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'
import { useAutoSave } from '../composables/useAutoSave'

const router = useRouter()

const grades = ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي']
const relations = ['أب', 'أم', 'أخ', 'أخت', 'عم', 'خال', 'جد', 'جدة', 'غير ذلك']

const form = reactive({
  fullName: '', birthDate: '', gender: '', grade: '',
  memberPhone: '', address: '', servantId: '', groupId: '',
  parentName: '', parentPhone: '', relation: '', altPhone: '',
})

const errors = reactive({})
const touched = reactive({})
const loading = ref(false)
const successMessage = ref('')
const generalError = ref('')
const servants = ref([])
const groups = ref([])
const draftLoaded = ref(false)

// ✅ Auto-save
const { hasDraft, loadDraft, clearDraft } = useAutoSave('member_draft', form, 800)

const activeServants = computed(() =>
  servants.value.filter((s) => ['servant', 'co_servant', 'group_leader'].includes(s.role) && s.status === 'active')
)

const age = computed(() => {
  if (!form.birthDate) return null
  const birth = new Date(form.birthDate)
  const today = new Date()
  let a = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--
  return a >= 0 ? a : null
})

const isValidPhone = (v) => /^01[0-2,5]\d{8}$/.test(v)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.fullName) errors.fullName = 'الاسم رباعي مطلوب'
  else if (form.fullName.split(/\s+/).length < 4) errors.fullName = 'يرجى كتابة الاسم رباعي بالكامل'
  if (!form.birthDate) errors.birthDate = 'تاريخ الميلاد مطلوب'
  if (!form.gender) errors.gender = 'النوع مطلوب'
  if (!form.grade) errors.grade = 'الصف الدراسي مطلوب'
  if (form.memberPhone && !isValidPhone(form.memberPhone)) errors.memberPhone = 'رقم غير صحيح'
  if (!form.parentName) errors.parentName = 'اسم ولي الأمر مطلوب'
  if (!form.parentPhone) errors.parentPhone = 'رقم ولي الأمر مطلوب'
  else if (!isValidPhone(form.parentPhone)) errors.parentPhone = 'رقم غير صحيح'
  if (!form.relation) errors.relation = 'صلة القرابة مطلوبة'
  if (form.altPhone && !isValidPhone(form.altPhone)) errors.altPhone = 'رقم غير صحيح'
  return Object.keys(errors).length === 0
}

async function submitForm() {
  successMessage.value = ''
  generalError.value = ''
  if (!validate()) {
    Object.keys(errors).forEach((k) => (touched[k] = true))
    return
  }

  loading.value = true
  try {
    const payload = {
      full_name: form.fullName,
      birth_date: form.birthDate,
      gender: form.gender,
      grade: form.grade,
      member_phone: form.memberPhone || null,
      address: form.address || null,
      servant_id: form.servantId ? Number(form.servantId) : null,
      group_id: form.groupId ? Number(form.groupId) : null,
      parent_name: form.parentName,
      parent_phone: form.parentPhone,
      relation: form.relation,
      alt_phone: form.altPhone || null,
    }

    const { data } = await api.post('/members', payload)

    successMessage.value = 'تم حفظ بيانات المخدوم بنجاح ✅'
    clearDraft()
    resetForm(false)
    setTimeout(() => router.push(`/members/${data.id}/card`), 1200)
  } catch (err) {
    generalError.value = err.response?.data?.message || 'حدث خطأ أثناء الحفظ'
  } finally {
    loading.value = false
  }
}

function restoreDraft() {
  const draft = loadDraft()
  if (draft) {
    Object.assign(form, draft)
    draftLoaded.value = true
  }
}

function resetForm(clearMessages = true) {
  Object.assign(form, {
    fullName: '', birthDate: '', gender: '', grade: '',
    memberPhone: '', address: '', servantId: '', groupId: '',
    parentName: '', parentPhone: '', relation: '', altPhone: '',
  })
  Object.keys(errors).forEach((k) => delete errors[k])
  Object.keys(touched).forEach((k) => delete touched[k])
  if (clearMessages) {
    successMessage.value = ''
    generalError.value = ''
    clearDraft()
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/members')
}

async function loadData() {
  try {
    const [servantsRes, groupsRes] = await Promise.all([
      api.get('/users'),
      api.get('/groups'),
    ])
    servants.value = servantsRes.data
    groups.value = groupsRes.data
  } catch (e) {
    console.error(e)
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