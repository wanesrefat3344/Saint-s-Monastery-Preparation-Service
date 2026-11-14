<template>
  <div class="min-h-screen bg-page py-8 px-4 pb-24" dir="rtl">
    <div class="max-w-6xl mx-auto">

      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-navy">الخدام</h1>
          <p class="text-sm text-navy/60 mt-1">إجمالي: {{ servants.length }} خادم</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button v-if="isAdmin" @click="exportExcel" class="btn-cancel text-sm">تصدير Excel</button>
          <button @click="openAdd" class="btn-primary text-sm">+ إضافة خادم</button>
          <router-link to="/" class="btn-cancel text-sm">رجوع</router-link>
        </div>
      </div>

      <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm">
        {{ successMessage }}
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="إجمالي" :value="servants.length" color="brand" />
        <StatCard label="نشط" :value="activeCount" color="success" />
        <StatCard label="قيد المراجعة" :value="pendingCount" color="gold" />
        <StatCard v-if="isAdmin" label="متوقف" :value="stoppedCount" color="danger" />
        <StatCard v-else label="أضفتهم" :value="myAddedCount" color="gold" />
      </div>

      <div class="card mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input v-model.trim="search" type="text" class="input" placeholder="ابحث بالاسم أو البريد..." />
        <select v-model="filterStatus" class="input">
          <option value="">كل الحالات</option>
          <option value="active">🟢 نشط</option>
          <option value="pending">⏳ قيد المراجعة</option>
          <option value="inactive">⚪ معطّل</option>
          <option value="rejected">❌ مرفوض</option>
          <option value="on_leave">🟡 إجازة</option>
          <option value="stopped">🔴 متوقف</option>
        </select>
        <select v-model="filterRole" class="input">
          <option value="">كل الأدوار</option>
          <option value="admin">👑 أدمن</option>
          <option value="group_leader">⭐ ليدر</option>
          <option value="co_servant">🧑‍🏫 مساعد</option>
          <option value="servant">🧑‍🏫 خادم</option>
          <option value="reader">📖 مسجل قراءات</option>
        </select>
      </div>

      <SkeletonCard v-if="loading" :count="6" />

      <div v-else-if="filtered.length === 0" class="card">
        <EmptyState
          icon="👤"
          :title="servants.length === 0 ? 'مفيش خدامين' : 'لا توجد نتائج مطابقة'"
          :description="servants.length === 0 ? 'ابدأ بإضافة أول خادم' : 'جرّب تغيير الفلاتر'"
          tone="brand"
        >
          <template #actions>
            <button @click="openAdd" class="btn-primary">+ إضافة خادم</button>
          </template>
        </EmptyState>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="s in filtered" :key="s.id" class="card hover:border-brand transition">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold" :class="roleColor(s.role).bg + ' ' + roleColor(s.role).text">
              {{ s.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="font-semibold text-navy truncate">{{ s.name }}</h2>
              <p class="text-xs text-navy/60 truncate" dir="ltr">{{ s.email }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1 mb-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="statusColor(s.status).bg + ' ' + statusColor(s.status).text">
              {{ statusColor(s.status).icon }} {{ statusColor(s.status).label }}
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="roleColor(s.role).bg + ' ' + roleColor(s.role).text">
              {{ roleLabel(s.role) }}
            </span>
            <span v-if="s.id === myId" class="text-[10px] px-2 py-0.5 rounded-full font-medium bg-brand/10 text-brand">(أنت)</span>
          </div>

          <div class="text-xs text-navy/60 space-y-1 mb-3">
            <p v-if="s.phone">📱 <span dir="ltr">{{ s.phone }}</span></p>
            <p v-if="s.joined_at">📅 انضم {{ formatDate(s.joined_at) }}</p>
            <p v-if="s.added_by_name" class="text-navy/40">👤 أضافه: {{ s.added_by_name }}</p>
          </div>

          <div class="flex gap-1 justify-end flex-wrap">
            <router-link v-if="s.role !== 'reader' && isAdmin" :to="`/servants/${s.id}`" class="text-brand text-xs hover:bg-brand/10 px-2 py-1 rounded">عرض</router-link>
            <button v-if="canEdit(s)" @click="openEdit(s)" class="text-gold text-xs hover:bg-gold/10 px-2 py-1 rounded">تعديل</button>
            <button v-if="isAdmin" @click="remove(s.id, s.name)" class="text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded">حذف</button>
            <button v-if="isAdmin && s.status === 'pending'" @click="approve(s.id)" class="text-success text-xs hover:bg-success/10 px-2 py-1 rounded">موافقة</button>
            <button v-if="isAdmin && s.status === 'pending'" @click="reject(s.id)" class="text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded">رفض</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50 overflow-y-auto">
      <div class="bg-card rounded-xl shadow-lg w-full max-w-lg p-6 my-8 border border-border">
        <h2 class="text-lg font-semibold text-navy mb-4">{{ editingId ? 'تعديل خادم' : 'إضافة خادم جديد' }}</h2>
        <form @submit.prevent="save" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">الاسم <span class="text-danger">*</span></label>
            <input v-model.trim="form.name" class="input" :class="{ 'input-error': errors.name }" />
            <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">البريد <span class="text-danger">*</span></label>
            <input v-model.trim="form.email" type="email" class="input" :class="{ 'input-error': errors.email }" dir="ltr" />
            <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">رقم التليفون</label>
            <input v-model.trim="form.phone" type="tel" class="input" dir="ltr" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1 text-navy">الدور</label>
              <select v-model="form.role" class="input" :disabled="!isAdmin">
                <option value="servant">خادم</option>
                <option v-if="isAdmin" value="co_servant">مساعد</option>
                <option v-if="isAdmin" value="reader">مسجل قراءات</option>
                <option v-if="isAdmin" value="group_leader">ليدر</option>
                <option v-if="isAdmin" value="admin">أدمن</option>
              </select>
            </div>
            <div v-if="isAdmin">
              <label class="block text-sm font-medium mb-1 text-navy">الحالة</label>
              <select v-model="form.status" class="input">
                <option value="active">نشط</option>
                <option value="inactive">معطّل</option>
                <option value="on_leave">إجازة</option>
                <option value="stopped">متوقف</option>
              </select>
            </div>
          </div>
          <div v-if="!editingId">
            <label class="block text-sm font-medium mb-1 text-navy">كلمة المرور <span class="text-danger">*</span></label>
            <input v-model="form.password" type="password" class="input" :class="{ 'input-error': errors.password }" />
            <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
          </div>
          <div v-if="!isAdmin" class="text-xs text-gold bg-gold/10 rounded-lg p-2">
            ⚠️ الخادم اللي هتضيفه هيفضل "قيد المراجعة" لحد ما الأدمن يوافق عليه.
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
import * as XLSX from 'xlsx'
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
        'text-danger': color === 'danger',
        'text-brand': !color || color === 'brand'
      }">{{ value }}</p>
    </div>
  `,
}

const me = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = me.role === 'admin'
const myId = me.id
const myEmail = me.email

const servants = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const filterStatus = ref('')
const filterRole = ref('')
const showModal = ref(false)
const editingId = ref(null)
const errors = reactive({})
const successMessage = ref('')

const form = reactive({ name: '', email: '', phone: '', role: 'servant', status: 'active', password: '' })

const activeCount = computed(() => servants.value.filter((s) => s.status === 'active').length)
const pendingCount = computed(() => servants.value.filter((s) => s.status === 'pending').length)
const stoppedCount = computed(() => servants.value.filter((s) => s.status === 'stopped').length)
const myAddedCount = computed(() => servants.value.filter((s) => s.added_by === myEmail).length)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return servants.value.filter((s) => {
    if (q && !s.name?.toLowerCase().includes(q) && !s.email?.toLowerCase().includes(q)) return false
    if (filterStatus.value && s.status !== filterStatus.value) return false
    if (filterRole.value && s.role !== filterRole.value) return false
    return true
  })
})

function canEdit(s) {
  if (isAdmin) return true
  return s.added_by === myEmail && s.status === 'pending'
}

function statusColor(status) {
  return {
    active: { bg: 'bg-success/10', text: 'text-success', label: 'نشط', icon: '🟢' },
    on_leave: { bg: 'bg-gold/20', text: 'text-gold', label: 'إجازة', icon: '🟡' },
    stopped: { bg: 'bg-danger/10', text: 'text-danger', label: 'متوقف', icon: '🔴' },
    inactive: { bg: 'bg-navy/10', text: 'text-navy/60', label: 'معطّل', icon: '⚪' },
    pending: { bg: 'bg-gold/20', text: 'text-gold', label: 'قيد المراجعة', icon: '⏳' },
    rejected: { bg: 'bg-danger/10', text: 'text-danger', label: 'مرفوض', icon: '❌' },
  }[status] || { bg: 'bg-page', text: 'text-navy', label: status, icon: '—' }
}

function roleColor(role) {
  return {
    admin: { bg: 'bg-gold/20', text: 'text-gold' },
    group_leader: { bg: 'bg-brand/10', text: 'text-brand' },
    co_servant: { bg: 'bg-navy/10', text: 'text-navy' },
    servant: { bg: 'bg-success/10', text: 'text-success' },
    reader: { bg: 'bg-gold/20', text: 'text-gold' },
  }[role] || { bg: 'bg-page', text: 'text-navy' }
}

function roleLabel(role) {
  return { admin: '👑 أدمن', group_leader: '⭐ ليدر', co_servant: '🧑‍🏫 مساعد', servant: '🧑‍🏫 خادم', reader: '📖 مسجل قراءات' }[role] || role
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' })
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', email: '', phone: '', role: 'servant', status: isAdmin ? 'active' : 'pending', password: '' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function openEdit(s) {
  editingId.value = s.id
  Object.assign(form, { name: s.name, email: s.email, phone: s.phone || '', role: s.role, status: s.status, password: '' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name) errors.name = 'الاسم مطلوب'
  if (!form.email) errors.email = 'البريد مطلوب'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'بريد غير صحيح'
  if (!editingId.value && (!form.password || form.password.length < 6)) errors.password = '6 أحرف على الأقل'
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = { name: form.name, email: form.email, phone: form.phone }
    if (isAdmin) {
      payload.role = form.role
      payload.status = form.status
    }
    if (editingId.value) {
      await api.put(`/users/${editingId.value}`, payload)
      successMessage.value = 'تم حفظ التعديلات ✅'
    } else {
      payload.password = form.password
      await api.post('/users', payload)
      successMessage.value = isAdmin ? 'تم إضافة الخادم ✅' : 'تم إرسال الطلب ⏳'
    }
    await loadData()
    setTimeout(() => (successMessage.value = ''), 3000)
    showModal.value = false
    editingId.value = null
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحفظ')
  } finally {
    saving.value = false
  }
}

async function remove(id, name) {
  if (!confirm(`متأكد من حذف "${name}"؟`)) return
  try {
    await api.delete(`/users/${id}`)
    servants.value = servants.value.filter((s) => s.id !== id)
    successMessage.value = 'تم الحذف ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

async function approve(id) {
  try {
    await api.patch(`/users/${id}/approve`, { status: 'active' })
    await loadData()
    successMessage.value = 'تمت الموافقة ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل')
  }
}

async function reject(id) {
  try {
    await api.patch(`/users/${id}/approve`, { status: 'rejected' })
    await loadData()
    successMessage.value = 'تم الرفض ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل')
  }
}

function exportExcel() {
  const rows = filtered.value.map((s) => ({
    'الاسم': s.name, 'البريد': s.email, 'التليفون': s.phone || '',
    'الدور': roleLabel(s.role), 'الحالة': statusColor(s.status).label,
    'مضاف بواسطة': s.added_by_name || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'الخدام')
  XLSX.writeFile(wb, `الخدام_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/users')
    servants.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>