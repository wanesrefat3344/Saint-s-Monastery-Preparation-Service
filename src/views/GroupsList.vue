<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-24">

      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">إدارة</p>
          <h1 class="text-2xl font-bold text-navy truncate">المجموعات</h1>
          <p class="text-sm text-navy/60 mt-1">إجمالي: {{ groups.length }} مجموعة</p>
        </div>
        <div class="flex gap-2 flex-wrap self-start sm:self-auto">
          <button
            v-if="isAdmin"
            @click="exportExcel"
            :disabled="groups.length === 0"
            class="btn-cancel text-sm"
          >تصدير Excel</button>
          <button
            v-if="isAdmin"
            @click="openAdd"
            class="btn-primary text-sm"
          >+ مجموعة جديدة</button>
          <button @click="goBack" class="btn-cancel text-sm">رجوع</button>
        </div>
      </header>

      <transition name="fade">
        <div v-if="successMessage" class="mb-5 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          ✅ {{ successMessage }}
        </div>
      </transition>

      <SkeletonCard v-if="loading" :count="6" />

      <div v-else-if="groups.length === 0" class="card">
        <EmptyState
          icon="📁"
          title="مفيش مجموعات لسه"
          description="ابدأ بإنشاء أول مجموعة"
          tone="brand"
        >
          <template #actions>
            <button v-if="isAdmin" @click="openAdd" class="btn-primary">+ اعمل أول مجموعة</button>
          </template>
        </EmptyState>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article
          v-for="g in groups"
          :key="g.id"
          class="group rounded-2xl border border-border bg-card p-5 hover:border-brand/40 hover:shadow-sm transition-all"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg font-bold shrink-0">
                {{ g.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <h2 class="font-semibold text-navy truncate">{{ g.name }}</h2>
                <p class="text-xs text-navy/60 truncate">{{ g.servant_name || 'بدون خادم' }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-gold/15 text-gold">👥 {{ g.members_count }}</span>
              <span class="text-[11px] tabular-nums" :class="g.attendance_rate >= 70 ? 'text-success' : 'text-danger'">{{ g.attendance_rate }}% حضور</span>
              <span class="text-[11px] font-bold text-gold tabular-nums">🏆 {{ g.score }} نقطة</span>
            </div>
          </div>

          <p v-if="g.description" class="text-sm text-navy/70 mb-3 line-clamp-2">{{ g.description }}</p>

          <div class="flex items-center justify-end gap-1 pt-2 border-t border-border">
            <router-link :to="`/groups/${g.id}`" class="text-brand text-xs font-medium hover:bg-brand/10 px-2.5 py-1.5 rounded-lg">عرض</router-link>
            <button v-if="isAdmin" @click="openEdit(g)" class="text-gold text-xs font-medium hover:bg-gold/10 px-2.5 py-1.5 rounded-lg">تعديل</button>
            <button v-if="isAdmin" @click="remove(g.id, g.name)" class="text-danger text-xs font-medium hover:bg-danger/10 px-2.5 py-1.5 rounded-lg">حذف</button>
          </div>
        </article>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50 overflow-y-auto">
      <div class="bg-card rounded-xl shadow-lg w-full max-w-md p-6 my-8 border border-border">
        <h2 class="text-lg font-semibold text-navy mb-4">{{ editingId ? 'تعديل مجموعة' : 'إضافة مجموعة' }}</h2>
        <form @submit.prevent="save" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">اسم المجموعة <span class="text-danger">*</span></label>
            <input v-model.trim="form.name" class="input" :class="{ 'input-error': errors.name }" />
            <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">الوصف</label>
            <textarea v-model.trim="form.description" rows="2" class="input resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">الخادم الرئيسي</label>
            <select v-model="form.servant_id" class="input">
              <option value="">بدون</option>
              <option v-for="s in servants" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-navy">الخادم المساعد</label>
            <select v-model="form.co_servant_id" class="input">
              <option value="">بدون</option>
              <option v-for="s in servants" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
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
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import api from '../api/client'
import SkeletonCard from '../components/SkeletonCard.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const me = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = me.role === 'admin'

const groups = ref([])
const servants = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const errors = reactive({})
const successMessage = ref('')

const form = reactive({ name: '', description: '', servant_id: '', co_servant_id: '' })

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', servant_id: '', co_servant_id: '' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function openEdit(g) {
  editingId.value = g.id
  Object.assign(form, { name: g.name, description: g.description || '', servant_id: g.servant_id || '', co_servant_id: g.co_servant_id || '' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name) errors.name = 'الاسم مطلوب'
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description || null,
      servant_id: form.servant_id ? Number(form.servant_id) : null,
      co_servant_id: form.co_servant_id ? Number(form.co_servant_id) : null,
    }
    if (editingId.value) {
      await api.put(`/groups/${editingId.value}`, payload)
      successMessage.value = 'تم حفظ التعديلات ✅'
    } else {
      await api.post('/groups', payload)
      successMessage.value = 'تم إنشاء المجموعة ✅'
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
  if (!confirm(`متأكد من حذف "${name}"؟`)) return
  try {
    await api.delete(`/groups/${id}`)
    groups.value = groups.value.filter((g) => g.id !== id)
    successMessage.value = 'تم الحذف ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

function exportExcel() {
  const rows = groups.value.map((g) => ({
    'اسم المجموعة': g.name,
    'الخادم الرئيسي': g.servant_name || '',
    'الخادم المساعد': g.co_servant_name || '',
    'عدد الأعضاء': g.members_count,
    'نسبة الحضور': `${g.attendance_rate}%`,
    'النقاط': g.score,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'المجموعات')
  XLSX.writeFile(wb, `المجموعات_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function loadData() {
  loading.value = true
  try {
    const [groupsRes, servantsRes] = await Promise.all([
      api.get('/groups/stats'),
      api.get('/users').catch(() => ({ data: [] })),
    ])
    groups.value = groupsRes.data
    servants.value = servantsRes.data.filter(
      (s) => ['servant', 'co_servant', 'group_leader'].includes(s.role) && s.status === 'active'
    )
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>