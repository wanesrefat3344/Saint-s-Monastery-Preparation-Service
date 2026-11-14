<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-3xl mx-auto">
      <div v-if="loading" class="text-center text-navy/50 py-20">جارٍ التحميل...</div>

      <div v-else-if="!found" class="card text-center py-16">
        <p class="text-navy/60 mb-4">المخدوم غير موجود</p>
        <router-link to="/members" class="btn-primary inline-block">رجوع</router-link>
      </div>

      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-navy">تعديل بيانات مخدوم</h1>
          <router-link :to="`/members/${route.params.id}`" class="text-sm text-brand hover:underline">عرض التفاصيل</router-link>
        </div>

        <div v-if="successMessage" class="rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">{{ successMessage }}</div>
        <div v-if="generalError" class="rounded-lg bg-danger/10 border border-danger text-danger px-4 py-3 text-sm">{{ generalError }}</div>

        <section class="card">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>بيانات المخدوم
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1 text-navy">الاسم رباعي <span class="text-danger">*</span></label>
              <input v-model.trim="form.fullName" type="text" class="input" :class="{ 'input-error': errors.fullName }" />
              <p v-if="errors.fullName" class="error-text">{{ errors.fullName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">تاريخ الميلاد <span class="text-danger">*</span></label>
              <input v-model="form.birthDate" type="date" class="input" :class="{ 'input-error': errors.birthDate }" />
              <p v-if="errors.birthDate" class="error-text">{{ errors.birthDate }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">النوع <span class="text-danger">*</span></label>
              <select v-model="form.gender" class="input" :class="{ 'input-error': errors.gender }">
                <option value="">اختر</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              <p v-if="errors.gender" class="error-text">{{ errors.gender }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">الصف الدراسي <span class="text-danger">*</span></label>
              <select v-model="form.grade" class="input" :class="{ 'input-error': errors.grade }">
                <option value="">اختر</option>
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
              <input v-model.trim="form.memberPhone" type="tel" class="input" :class="{ 'input-error': errors.memberPhone }" dir="ltr" />
              <p v-if="errors.memberPhone" class="error-text">{{ errors.memberPhone }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1 text-navy">العنوان</label>
              <textarea v-model.trim="form.address" rows="2" class="input resize-none"></textarea>
            </div>
          </div>
        </section>

        <section class="card">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>بيانات ولي الأمر
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">اسم ولي الأمر <span class="text-danger">*</span></label>
              <input v-model.trim="form.parentName" type="text" class="input" :class="{ 'input-error': errors.parentName }" />
              <p v-if="errors.parentName" class="error-text">{{ errors.parentName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">رقم ولي الأمر <span class="text-danger">*</span></label>
              <input v-model.trim="form.parentPhone" type="tel" class="input" :class="{ 'input-error': errors.parentPhone }" dir="ltr" />
              <p v-if="errors.parentPhone" class="error-text">{{ errors.parentPhone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">صلة القرابة <span class="text-danger">*</span></label>
              <select v-model="form.relation" class="input" :class="{ 'input-error': errors.relation }">
                <option value="">اختر</option>
                <option v-for="r in relations" :key="r" :value="r">{{ r }}</option>
              </select>
              <p v-if="errors.relation" class="error-text">{{ errors.relation }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">رقم بديل</label>
              <input v-model.trim="form.altPhone" type="tel" class="input" :class="{ 'input-error': errors.altPhone }" dir="ltr" />
              <p v-if="errors.altPhone" class="error-text">{{ errors.altPhone }}</p>
            </div>
          </div>
        </section>

        <div class="flex items-center justify-end gap-3">
          <router-link to="/members" class="btn-cancel">إلغاء</router-link>
          <button type="submit" :disabled="loading2" class="btn-success">
            {{ loading2 ? 'جارٍ الحفظ...' : 'حفظ التعديلات' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const loading2 = ref(false)
const found = ref(false)
const successMessage = ref('')
const generalError = ref('')
const servants = ref([])
const groups = ref([])

const grades = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي',
  'جامعي', 'خريج',
]
const relations = ['أب', 'أم', 'أخ', 'أخت', 'عم', 'خال', 'جد', 'جدة', 'غير ذلك']

const form = reactive({
  fullName: '', birthDate: '', gender: '', grade: '',
  servantId: '', groupId: '',
  memberPhone: '', address: '', parentName: '',
  parentPhone: '', relation: '', altPhone: '',
})
const errors = reactive({})

const activeServants = computed(() =>
  servants.value.filter((s) => ['servant', 'co_servant', 'group_leader'].includes(s.role) && s.status === 'active')
)

const isValidPhone = (v) => /^01[0-2,5]\d{8}$/.test(v)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.fullName) errors.fullName = 'مطلوب'
  else if (form.fullName.split(/\s+/).length < 4) errors.fullName = 'الاسم رباعي بالكامل'
  if (!form.birthDate) errors.birthDate = 'مطلوب'
  if (!form.gender) errors.gender = 'مطلوب'
  if (!form.grade) errors.grade = 'مطلوب'
  if (form.memberPhone && !isValidPhone(form.memberPhone)) errors.memberPhone = 'رقم غير صحيح'
  if (!form.parentName) errors.parentName = 'مطلوب'
  if (!form.parentPhone) errors.parentPhone = 'مطلوب'
  else if (!isValidPhone(form.parentPhone)) errors.parentPhone = 'رقم غير صحيح'
  if (!form.relation) errors.relation = 'مطلوب'
  if (form.altPhone && !isValidPhone(form.altPhone)) errors.altPhone = 'رقم غير صحيح'
  return Object.keys(errors).length === 0
}

async function loadData() {
  try {
    const [memberRes, servantsRes, groupsRes] = await Promise.all([
      api.get(`/members/${route.params.id}`),
      api.get('/users'),
      api.get('/groups'),
    ])
    const m = memberRes.data
    servants.value = servantsRes.data
    groups.value = groupsRes.data

    Object.assign(form, {
      fullName: m.full_name,
      birthDate: m.birth_date?.slice(0, 10) || '',
      gender: m.gender || '',
      grade: m.grade || '',
      servantId: m.servant_id || '',
      groupId: m.group_id || '',
      memberPhone: m.member_phone || '',
      address: m.address || '',
      parentName: m.parent_name || '',
      parentPhone: m.parent_phone || '',
      relation: m.relation || '',
      altPhone: m.alt_phone || '',
    })
    found.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  successMessage.value = ''
  generalError.value = ''
  if (!validate()) return

  loading2.value = true
  try {
    await api.put(`/members/${route.params.id}`, {
      full_name: form.fullName,
      birth_date: form.birthDate,
      gender: form.gender,
      grade: form.grade,
      servant_id: form.servantId ? Number(form.servantId) : null,
      group_id: form.groupId ? Number(form.groupId) : null,
      member_phone: form.memberPhone || null,
      address: form.address || null,
      parent_name: form.parentName,
      parent_phone: form.parentPhone,
      relation: form.relation,
      alt_phone: form.altPhone || null,
    })
    successMessage.value = 'تم حفظ التعديلات ✅'
    setTimeout(() => router.push(`/members/${route.params.id}`), 800)
  } catch (e) {
    generalError.value = e.response?.data?.message || 'فشل الحفظ'
  } finally {
    loading2.value = false
  }
}

onMounted(loadData)
</script>