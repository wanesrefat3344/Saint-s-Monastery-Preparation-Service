<template>
  <div class="min-h-screen bg-page py-10 px-4 pb-28" dir="rtl">
    <div class="max-w-3xl mx-auto">

      <!-- Header with back button -->
      <div class="mb-6 flex items-start justify-between gap-3">
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
            <h1 class="text-2xl font-bold text-navy">تسجيل مخدوم جديد</h1>
            <p class="text-sm text-navy/60 mt-1">املأ البيانات التالية لتسجيل مخدوم في الخدمة</p>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <transition name="fade">
        <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </transition>
      <transition name="fade">
        <div v-if="generalError" class="mb-4 rounded-lg bg-danger/10 border border-danger text-danger px-4 py-3 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ generalError }}</span>
        </div>
      </transition>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- بيانات المخدوم -->
        <section class="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>
            بيانات المخدوم
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">الاسم رباعي <span class="text-danger">*</span></label>
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
              <label class="block text-sm font-medium mb-1">تاريخ الميلاد <span class="text-danger">*</span></label>
              <input
                v-model="form.birthDate"
                type="date"
                class="input"
                :class="{ 'input-error': errors.birthDate }"
                @blur="touched.birthDate = true"
              />
              <p v-if="errors.birthDate" class="error-text">{{ errors.birthDate }}</p>
              <p v-else-if="age !== null" class="text-xs text-navy/50 mt-1">العمر: {{ age }} سنة</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">النوع <span class="text-danger">*</span></label>
              <select
                v-model="form.gender"
                class="input"
                :class="{ 'input-error': errors.gender }"
                @blur="touched.gender = true"
              >
                <option value="">اختر النوع</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              <p v-if="errors.gender" class="error-text">{{ errors.gender }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">الصف الدراسي <span class="text-danger">*</span></label>
              <select
                v-model="form.grade"
                class="input"
                :class="{ 'input-error': errors.grade }"
                @blur="touched.grade = true"
              >
                <option value="">اختر الصف</option>
                <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
              </select>
              <p v-if="errors.grade" class="error-text">{{ errors.grade }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">الخادم المسؤول</label>
              <select v-model="form.servantId" class="input">
                <option value="">بدون</option>
                <option v-for="s in activeServants" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">المجموعة</label>
              <select v-model="form.groupId" class="input">
                <option value="">بدون</option>
                <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">رقم هاتف المخدوم</label>
              <input
                v-model.trim="form.memberPhone"
                type="tel"
                inputmode="numeric"
                placeholder="01xxxxxxxxx"
                class="input"
                :class="{ 'input-error': errors.memberPhone }"
                @blur="touched.memberPhone = true"
              />
              <p v-if="errors.memberPhone" class="error-text">{{ errors.memberPhone }}</p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">العنوان</label>
              <textarea
                v-model.trim="form.address"
                rows="2"
                placeholder="المدينة - الشارع - رقم المنزل"
                class="input resize-none"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- بيانات ولي الأمر -->
        <section class="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>
            بيانات ولي الأمر
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">اسم ولي الأمر <span class="text-danger">*</span></label>
              <input
                v-model.trim="form.parentName"
                type="text"
                class="input"
                :class="{ 'input-error': errors.parentName }"
                @blur="touched.parentName = true"
              />
              <p v-if="errors.parentName" class="error-text">{{ errors.parentName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">رقم هاتف ولي الأمر <span class="text-danger">*</span></label>
              <input
                v-model.trim="form.parentPhone"
                type="tel"
                inputmode="numeric"
                placeholder="01xxxxxxxxx"
                class="input"
                :class="{ 'input-error': errors.parentPhone }"
                @blur="touched.parentPhone = true"
              />
              <p v-if="errors.parentPhone" class="error-text">{{ errors.parentPhone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">صلة القرابة <span class="text-danger">*</span></label>
              <select
                v-model="form.relation"
                class="input"
                :class="{ 'input-error': errors.relation }"
                @blur="touched.relation = true"
              >
                <option value="">اختر صلة القرابة</option>
                <option v-for="r in relations" :key="r" :value="r">{{ r }}</option>
              </select>
              <p v-if="errors.relation" class="error-text">{{ errors.relation }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">رقم هاتف بديل</label>
              <input
                v-model.trim="form.altPhone"
                type="tel"
                inputmode="numeric"
                placeholder="01xxxxxxxxx"
                class="input"
                :class="{ 'input-error': errors.altPhone }"
                @blur="touched.altPhone = true"
              />
              <p v-if="errors.altPhone" class="error-text">{{ errors.altPhone }}</p>
            </div>
          </div>
        </section>
      </form>
    </div>

    <!-- Actions fixed bottom -->
    <div class="fixed bottom-0 inset-x-0 z-20 bg-card/95 backdrop-blur border-t border-border">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="resetForm"
          :disabled="loading"
          class="px-5 py-2.5 rounded-lg border border-border text-navy hover:bg-navy/5 disabled:opacity-60 transition-colors duration-200"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form=""
          @click="submitForm"
          :disabled="loading"
          class="px-6 py-2.5 rounded-lg bg-success text-white font-medium hover:bg-success/90 disabled:opacity-60 transition-colors duration-200 flex items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
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

const router = useRouter()

const grades = [
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
]

const relations = ['أب', 'أم', 'أخ', 'أخت', 'عم', 'خال', 'جد', 'جدة', 'غير ذلك']

const form = reactive({
  fullName: '',
  birthDate: '',
  gender: '',
  grade: '',
  memberPhone: '',
  address: '',
  servantId: '',
  groupId: '',
  parentName: '',
  parentPhone: '',
  relation: '',
  altPhone: '',
})

const errors = reactive({})
const touched = reactive({})
const loading = ref(false)
const successMessage = ref('')
const generalError = ref('')
const servants = ref([])
const groups = ref([])

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
  if (form.memberPhone && !isValidPhone(form.memberPhone)) errors.memberPhone = 'رقم غير صحيح (11 رقم يبدأ بـ 01)'
  if (!form.parentName) errors.parentName = 'اسم ولي الأمر مطلوب'
  if (!form.parentPhone) errors.parentPhone = 'رقم ولي الأمر مطلوب'
  else if (!isValidPhone(form.parentPhone)) errors.parentPhone = 'رقم غير صحيح (11 رقم يبدأ بـ 01)'
  if (!form.relation) errors.relation = 'صلة القرابة مطلوبة'
  if (form.altPhone && !isValidPhone(form.altPhone)) errors.altPhone = 'رقم غير صحيح (11 رقم يبدأ بـ 01)'
  return Object.keys(errors).length === 0
}

async function submitForm() {
  successMessage.value = ''
  generalError.value = ''
  if (!validate()) {
    Object.keys(errors).forEach((k) => (touched[k] = true))
    requestAnimationFrame(() => {
      const firstError = document.querySelector('.input-error')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
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

    await api.post('/members', payload)

    successMessage.value = 'تم حفظ بيانات المخدوم بنجاح ✅'
    resetForm(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => router.push('/members'), 1200)
  } catch (err) {
    generalError.value = err.response?.data?.message || 'حدث خطأ أثناء الحفظ'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    loading.value = false
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
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/members')
  }
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