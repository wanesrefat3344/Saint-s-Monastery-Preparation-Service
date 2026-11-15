<template>
  <div class="min-h-screen bg-page py-8 px-4 pb-24" dir="rtl">
    <div class="max-w-3xl mx-auto">

      <div class="flex items-start gap-3 mb-6">
        <button @click="goBack" class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-navy">تقييم الخدام</h1>
          <p class="text-sm text-navy/60 mt-1">تقييم أداء الخادم بعد الاجتماع</p>
        </div>
      </div>

      <transition name="fade">
        <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
          {{ successMessage }}
        </div>
      </transition>

      <form @submit.prevent="submit" class="space-y-4">
        <!-- Servant -->
        <div class="card">
          <label class="block text-sm font-medium mb-2 text-navy">الخادم <span class="text-danger">*</span></label>
          <select v-model="form.servantId" class="input" required>
            <option value="">— اختر الخادم —</option>
            <option v-for="s in servants" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <!-- Meeting -->
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">تاريخ الاجتماع</label>
              <input v-model="form.meetingDate" type="date" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">نوع الاجتماع</label>
              <select v-model="form.meetingType" class="input">
                <option value="social">اجتماع عام</option>
                <option value="prep">إعدادي</option>
                <option value="youth">شباب</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Rating -->
        <div class="card space-y-4">
          <h2 class="text-lg font-semibold text-navy mb-2">التقييم</h2>
          <div v-for="crit in criteria" :key="crit.key">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-navy">{{ crit.label }}</label>
              <span class="text-xs text-navy/50">{{ form[crit.key] }}/5</span>
            </div>
            <div class="flex gap-1">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                @click="form[crit.key] = n"
                class="flex-1 h-10 rounded-lg text-lg transition-colors"
                :class="n <= form[crit.key] ? 'bg-gold text-white' : 'bg-page text-navy/30 hover:bg-gold/10'"
              >
                ⭐
              </button>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="card">
          <label class="block text-sm font-medium mb-2 text-navy">ملاحظات</label>
          <textarea v-model.trim="form.notes" rows="3" class="input resize-none" placeholder="ملاحظات عن أداء الخادم..."></textarea>
        </div>

        <!-- Submit -->
        <div class="flex justify-end gap-3">
          <button type="button" @click="goBack" class="btn-cancel">إلغاء</button>
          <button type="submit" :disabled="saving" class="btn-success">
            {{ saving ? 'جارٍ الحفظ...' : 'حفظ التقييم' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

const route = useRoute()
const router = useRouter()
const servants = ref([])
const saving = ref(false)
const successMessage = ref('')

const criteria = [
  { key: 'score', label: 'التقييم العام' },
  { key: 'attendanceScore', label: 'الحضور والالتزام' },
  { key: 'participationScore', label: 'المشاركة' },
  { key: 'commitmentScore', label: 'الالتزام' },
  { key: 'interactionScore', label: 'التعامل مع المخدومين' },
]

const form = reactive({
  servantId: '',
  meetingDate: new Date().toISOString().slice(0, 10),
  meetingType: 'social',
  score: 3,
  attendanceScore: 3,
  participationScore: 3,
  commitmentScore: 3,
  interactionScore: 3,
  notes: '',
})

async function loadData() {
  try {
    const { data } = await api.get('/team/servants')
    servants.value = data
    if (route.query.servant) {
      form.servantId = Number(route.query.servant)
    }
  } catch (e) {
    console.error(e)
  }
}

async function submit() {
  if (!form.servantId) { alert('اختر الخادم'); return }
  saving.value = true
  successMessage.value = ''
  try {
    await api.post('/servant-evaluations', {
      servant_id: Number(form.servantId),
      meeting_date: form.meetingDate,
      meeting_type: form.meetingType,
      score: form.score,
      attendance_score: form.attendanceScore,
      participation_score: form.participationScore,
      commitment_score: form.commitmentScore,
      interaction_score: form.interactionScore,
      notes: form.notes || null,
    })
    successMessage.value = 'تم حفظ التقييم ✅'
    setTimeout(() => router.push('/servants-activity'), 1500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحفظ')
  } finally {
    saving.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/servants-activity')
}

onMounted(loadData)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>