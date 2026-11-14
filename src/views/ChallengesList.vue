<template>
  <div class="min-h-screen bg-page py-10 px-4 pb-24" dir="rtl">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-navy">التحديات</h1>
          <p class="text-sm text-navy/60 mt-1">إجمالي: {{ challenges.length }} تحدي</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <router-link v-if="isAdmin && pendingCount > 0" to="/challenges-approval" class="btn-cancel text-sm relative">
            ✅ الموافقات
            <span class="absolute -top-1 -left-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ pendingCount }}</span>
          </router-link>
          <button v-if="isAdmin" @click="openAdd" class="btn-primary text-sm">+ تحدي جديد</button>
          <router-link to="/" class="btn-cancel text-sm">رجوع</router-link>
        </div>
      </div>

      <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
        {{ successMessage }}
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="إجمالي" :value="challenges.length" color="brand" />
        <StatCard label="نشطة" :value="activeCount" color="success" />
        <StatCard label="منتهية" :value="endedCount" color="navy" />
        <StatCard v-if="isAdmin" label="معلقة" :value="pendingCount" color="gold" />
        <StatCard v-else label="مشترك فيها" :value="myParticipationCount" color="gold" />
      </div>

      <SkeletonCard v-if="loading" :count="4" />

      <div v-else-if="challenges.length === 0" class="card">
        <EmptyState
          icon="🏆"
          title="مفيش تحديات لسه"
          description="التحديات هتظهر هنا لما الأدمن يضيفها"
          tone="gold"
        >
          <template #actions>
            <button v-if="isAdmin" @click="openAdd" class="btn-primary">+ اعمل أول تحدي</button>
          </template>
        </EmptyState>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="c in challenges" :key="c.id" class="card hover:border-brand transition">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="c.status === 'active' ? 'bg-success/10' : 'bg-navy/10'">{{ c.icon || '🏆' }}</div>
              <div>
                <h2 class="font-semibold text-navy">{{ c.name }}</h2>
                <p class="text-xs text-navy/60">{{ c.total_points }} نقطة</p>
              </div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full" :class="c.status === 'active' ? 'bg-success/10 text-success' : 'bg-navy/10 text-navy/60'">
              {{ c.status === 'active' ? '🟢 نشط' : '⚪ منتهي' }}
            </span>
          </div>

          <p v-if="c.description" class="text-sm text-navy/70 mb-3">{{ c.description }}</p>
          <div class="text-xs text-navy/60 mb-3">📅 {{ formatDate(c.start_date) }} → {{ formatDate(c.end_date) }}</div>

          <div class="flex gap-1 justify-end">
            <router-link :to="`/challenges/${c.id}`" class="text-brand text-xs hover:bg-brand/10 px-2 py-1 rounded">عرض</router-link>
            <button v-if="isAdmin" @click="openEdit(c)" class="text-gold text-xs hover:bg-gold/10 px-2 py-1 rounded">تعديل</button>
            <button v-if="isAdmin" @click="remove(c.id, c.name)" class="text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded">حذف</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal && isAdmin" class="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50 overflow-y-auto">
      <div class="bg-card rounded-xl shadow-lg w-full max-w-lg p-6 my-8 border border-border">
        <h2 class="text-lg font-semibold text-navy mb-4">{{ editingId ? 'تعديل تحدي' : 'إضافة تحدي' }}</h2>
        <form @submit.prevent="save" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">الاسم <span class="text-danger">*</span></label>
            <input v-model.trim="form.name" class="input" :class="{ 'input-error': errors.name }" />
            <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">الوصف</label>
            <textarea v-model.trim="form.description" rows="2" class="input resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">النقاط <span class="text-danger">*</span></label>
              <input v-model.number="form.total_points" type="number" min="1" class="input" :class="{ 'input-error': errors.total_points }" />
              <p v-if="errors.total_points" class="error-text">{{ errors.total_points }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">الحالة</label>
              <select v-model="form.status" class="input">
                <option value="active">🟢 نشط</option>
                <option value="ended">⚪ منتهي</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">البداية</label>
              <input v-model="form.start_date" type="date" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">النهاية</label>
              <input v-model="form.end_date" type="date" class="input" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">الأيقونة</label>
              <select v-model="form.icon" class="input">
                <option value="🏆">🏆 كأس</option>
                <option value="🎯">🎯 هدف</option>
                <option value="📞">📞 افتقاد</option>
                <option value="⭐">⭐ نجمة</option>
                <option value="🔥">🔥 حماس</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">الجايزة</label>
              <input v-model.trim="form.prize" class="input" placeholder="مثال: رحلة" />
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="showModal = false" class="btn-cancel">إلغاء</button>
            <button type="submit" :disabled="saving" class="btn-success">{{ saving ? '...' : (editingId ? 'حفظ' : 'إضافة') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../api/client'
import SkeletonCard from '../components/SkeletonCard.vue'
import EmptyState from '../components/EmptyState.vue'

const StatCard = {
  props: ['label', 'value', 'color'],
  template: `
    <div class="card">
      <p class="text-xs text-navy/50 mb-1">{{ label }}</p>
      <p class="text-2xl font-bold" :class="{
        'text-success': color === 'success',
        'text-gold': color === 'gold',
        'text-navy/60': color === 'navy',
        'text-brand': !color || color === 'brand'
      }">{{ value }}</p>
    </div>
  `,
}

const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = user.role === 'admin'

const challenges = ref([])
const allParticipants = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const errors = reactive({})
const successMessage = ref('')
const form = reactive({ name: '', description: '', total_points: 50, start_date: '', end_date: '', status: 'active', icon: '🏆', prize: '' })

const activeCount = computed(() => challenges.value.filter((c) => c.status === 'active').length)
const endedCount = computed(() => challenges.value.filter((c) => c.status === 'ended').length)
const pendingCount = computed(() => challenges.value.reduce((s, c) => s + Number(c.pending_count || 0), 0))
const myParticipationCount = computed(() => {
  if (isAdmin) return 0
  return allParticipants.value.filter((p) => p.requested_by === user.id).length
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', total_points: 50, start_date: '', end_date: '', status: 'active', icon: '🏆', prize: '' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function openEdit(c) {
  editingId.value = c.id
  Object.assign(form, {
    name: c.name, description: c.description || '', total_points: c.total_points,
    start_date: c.start_date?.slice(0, 10) || '', end_date: c.end_date?.slice(0, 10) || '',
    status: c.status, icon: c.icon || '🏆', prize: c.prize || '',
  })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name) errors.name = 'اسم التحدي مطلوب'
  if (!form.total_points || form.total_points <= 0) errors.total_points = 'النقاط مطلوبة'
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      name: form.name, description: form.description, total_points: Number(form.total_points),
      start_date: form.start_date || null, end_date: form.end_date || null,
      status: form.status, icon: form.icon, prize: form.prize,
    }
    if (editingId.value) {
      await api.put(`/challenges/${editingId.value}`, payload)
      successMessage.value = 'تم حفظ التعديلات ✅'
    } else {
      await api.post('/challenges', payload)
      successMessage.value = 'تم إنشاء التحدي ✅'
    }
    await loadData()
    setTimeout(() => (successMessage.value = ''), 2500)
    showModal.value = false
    editingId.value = null
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحفظ')
  } finally {
    saving.value = false
  }
}

async function remove(id, name) {
  if (!confirm(`حذف "${name}"؟`)) return
  try {
    await api.delete(`/challenges/${id}`)
    challenges.value = challenges.value.filter((c) => c.id !== id)
    successMessage.value = 'تم الحذف ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/challenges')
    challenges.value = data
    if (!isAdmin) {
      const participants = []
      for (const c of data) {
        try {
          const res = await api.get(`/challenges/${c.id}/participants`)
          participants.push(...res.data)
        } catch {}
      }
      allParticipants.value = participants
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>