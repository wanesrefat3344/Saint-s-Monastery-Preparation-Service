<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">إدارة</p>
          <h1 class="text-2xl font-bold text-navy truncate">إدارة الحسابات</h1>
          <p class="text-sm text-navy/60 mt-1">
            إجمالي: <span class="font-medium text-navy tabular-nums">{{ users.length }}</span> حساب
          </p>
        </div>
        <button
          v-if="isAdmin"
          @click="openAdd"
          class="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Icon name="plus" class="w-4 h-4" />
          إضافة حساب
        </button>
      </header>

      <transition name="fade">
        <div
          v-if="successMessage"
          class="mb-5 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success"
          role="status"
        >
          <Icon name="check" class="w-4 h-4 shrink-0" />
          <span>{{ successMessage }}</span>
        </div>
      </transition>

      <div
        v-if="!isAdmin"
        class="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center"
      >
        <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <Icon name="alert" class="w-5 h-5" />
        </div>
        <p class="text-navy font-medium mb-1">الصفحة دي للأدمن بس</p>
        <p class="text-sm text-navy/60">مالكش صلاحية الوصول لإدارة الحسابات</p>
      </div>

      <template v-else>

        <!-- Filters -->
        <section class="rounded-2xl border border-border bg-card p-4 mb-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              v-model.trim="search"
              type="text"
              placeholder="ابحث بالاسم أو الإيميل..."
              class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
            />
            <select
              v-model="filterRole"
              class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <option value="">كل الأدوار</option>
              <option v-for="r in ROLES" :key="r" :value="r">{{ roleLabel(r) }}</option>
            </select>
            <select
              v-model="filterStatus"
              class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <option value="">كل الحالات</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ statusColor(s).label }}</option>
            </select>
          </div>
          <div v-if="hasActiveFilters" class="mt-3 flex items-center gap-2 flex-wrap text-xs">
            <span class="text-navy/50">فلاتر نشطة:</span>
            <span v-if="search" class="badge">{{ search }}</span>
            <span v-if="filterRole" class="badge">{{ roleLabel(filterRole) }}</span>
            <span v-if="filterStatus" class="badge">{{ statusColor(filterStatus).label }}</span>
            <button @click="clearFilters" class="text-brand hover:underline">مسح الكل</button>
          </div>
        </section>

        <!-- Loading -->
        <div v-if="loading" class="rounded-2xl border border-border bg-card overflow-hidden" aria-busy="true">
          <div class="h-10 bg-page/40 border-b border-border"></div>
          <div v-for="i in 4" :key="i" class="px-4 py-4 border-b border-border last:border-0 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="h-4 w-32 rounded bg-navy/5"></div>
              <div class="h-4 w-40 rounded bg-navy/5"></div>
              <div class="h-4 w-20 rounded bg-navy/5"></div>
              <div class="h-4 w-16 rounded bg-navy/5"></div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="rounded-2xl border border-border bg-card p-10 text-center">
          <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
            <Icon name="users" class="w-6 h-6" />
          </div>
          <p class="text-navy font-medium mb-1">
            {{ users.length === 0 ? 'مفيش حسابات لسه' : 'لا توجد نتائج مطابقة' }}
          </p>
          <p class="text-sm text-navy/60 mb-5">
            {{ users.length === 0 ? 'ابدأ بإضافة أول حساب' : 'جرّب تغيير الفلاتر' }}
          </p>
          <button
            v-if="users.length === 0"
            @click="openAdd"
            class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90"
          >
            <Icon name="plus" class="w-4 h-4" />
            إضافة حساب
          </button>
          <button
            v-else
            @click="clearFilters"
            class="text-brand hover:underline text-sm"
          >
            مسح الفلاتر
          </button>
        </div>

        <!-- Table -->
        <section v-else class="rounded-2xl border border-border bg-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-page/40">
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الاسم</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs hidden md:table-cell">البريد</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الدور</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الحالة</th>
                  <th class="text-center px-4 py-3 font-medium text-navy/60 text-xs">إجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="u in filtered"
                  :key="u.id"
                  class="hover:bg-page/40 transition-colors"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div
                        class="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
                        :class="roleClass(u.role)"
                      >
                        {{ u.name.charAt(0) }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-navy truncate">
                          {{ u.name }}
                          <span v-if="u.id === me.id" class="text-[10px] text-brand">(أنت)</span>
                        </p>
                        <p class="text-xs text-navy/50 truncate md:hidden" dir="ltr">{{ u.email }}</p>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 py-3 text-navy/70 hidden md:table-cell" dir="ltr">
                    {{ u.email }}
                  </td>

                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                      :class="roleClass(u.role)"
                    >
                      {{ roleLabel(u.role) }}
                    </span>
                  </td>

                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                      :class="statusColor(u.status).bg + ' ' + statusColor(u.status).text"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {{ statusColor(u.status).label }}
                    </span>
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-1 flex-wrap">
                      <!-- تغيير الباسورد -->
                      <button
                        @click="openPasswordModal(u)"
                        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg text-gold hover:bg-gold/10 transition-colors"
                        title="تغيير كلمة المرور"
                      >
                        🔑 باسورد
                      </button>

                      <!-- تغيير الدور -->
                      <select
                        :value="u.role"
                        @change="changeRole(u, $event.target.value)"
                        :disabled="u.id === me.id"
                        class="text-xs px-2 py-1 rounded-lg border border-border bg-card hover:border-brand disabled:opacity-50 disabled:cursor-not-allowed"
                        title="تغيير الدور"
                      >
                        <option v-for="r in ROLES" :key="r" :value="r">{{ roleLabel(r) }}</option>
                      </select>

                      <!-- تعطيل/تنشيط -->
                      <button
                        @click="toggleStatus(u)"
                        :disabled="u.id === me.id"
                        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="u.status === 'active'
                          ? 'text-danger hover:bg-danger/10'
                          : 'text-success hover:bg-success/10'"
                        :title="u.status === 'active' ? 'تعطيل' : 'تنشيط'"
                      >
                        <Icon :name="u.status === 'active' ? 'x' : 'check'" class="w-3.5 h-3.5" />
                        {{ u.status === 'active' ? 'تعطيل' : 'تنشيط' }}
                      </button>

                      <!-- حذف -->
                      <button
                        @click="removeUser(u)"
                        :disabled="u.id === me.id"
                        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="حذف"
                      >
                        <Icon name="trash" class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>

    <!-- Modal: إضافة حساب -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showAddModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          @click.self="closeAddModal"
        >
          <div class="w-full max-w-md rounded-2xl bg-card shadow-xl border border-border p-6">
            <div class="flex items-start justify-between gap-3 mb-5">
              <h2 class="text-lg font-semibold text-navy">إضافة حساب جديد</h2>
              <button @click="closeAddModal" class="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center">
                <Icon name="x" class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="addUser" class="space-y-3.5">
              <div>
                <label class="block text-sm font-medium mb-1 text-navy">الاسم</label>
                <input v-model.trim="newUser.name" type="text" class="input" :class="{ 'input-error': errors.name }" />
                <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-navy">البريد</label>
                <input v-model.trim="newUser.email" type="email" dir="ltr" class="input" :class="{ 'input-error': errors.email }" />
                <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-navy">كلمة المرور</label>
                <input v-model="newUser.password" type="password" class="input" :class="{ 'input-error': errors.password }" />
                <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1 text-navy">الدور</label>
                  <select v-model="newUser.role" class="input">
                    <option v-for="r in ROLES" :key="r" :value="r">{{ roleLabel(r) }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1 text-navy">الحالة</label>
                  <select v-model="newUser.status" class="input">
                    <option v-for="s in ['active', 'inactive', 'on_leave', 'stopped']" :key="s" :value="s">{{ statusColor(s).label }}</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-2 pt-3 border-t border-border mt-5">
                <button type="button" @click="closeAddModal" :disabled="saving" class="btn-cancel">إلغاء</button>
                <button type="submit" :disabled="saving" class="btn-success">
                  {{ saving ? '...' : 'إضافة' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Modal: تغيير الباسورد -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showPasswordModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          @click.self="closePasswordModal"
        >
          <div class="w-full max-w-md rounded-2xl bg-card shadow-xl border border-border p-6">
            <div class="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 class="text-lg font-semibold text-navy">تغيير كلمة المرور</h2>
                <p class="text-xs text-navy/50 mt-0.5">
                  للمستخدم: <strong>{{ passwordTarget?.name }}</strong>
                  <span class="text-navy/40" dir="ltr">({{ passwordTarget?.email }})</span>
                </p>
              </div>
              <button @click="closePasswordModal" class="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center">
                <Icon name="x" class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="changePassword" class="space-y-3.5">
              <div>
                <label class="block text-sm font-medium mb-1 text-navy">كلمة المرور الجديدة</label>
                <input
                  v-model="newPassword"
                  type="text"
                  dir="ltr"
                  class="input font-mono"
                  :class="{ 'input-error': passwordError }"
                  placeholder="6 أحرف على الأقل"
                  autocomplete="new-password"
                />
                <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
                <p class="text-xs text-navy/40 mt-1">هتظهر للمستخدم — انسخها وقوله عليها</p>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-border mt-5">
                <button type="button" @click="closePasswordModal" :disabled="saving" class="btn-cancel">إلغاء</button>
                <button type="submit" :disabled="saving" class="btn-success">
                  {{ saving ? '...' : 'حفظ' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import api from '../api/client'

const ICONS = {
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
}

const Icon = {
  props: { name: String },
  setup(props) {
    return () =>
      h('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
        class: 'shrink-0',
      }, [h('path', { d: ICONS[props.name] || '' })])
  },
}

const ROLES = ['admin', 'servant', 'co_servant', 'group_leader', 'reader']
const STATUSES = ['active', 'inactive', 'on_leave', 'stopped', 'pending', 'rejected']

const me = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = me.role === 'admin'

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')

const search = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const showAddModal = ref(false)
const showPasswordModal = ref(false)
const passwordTarget = ref(null)
const newPassword = ref('')
const passwordError = ref('')

const newUser = reactive({ name: '', email: '', password: '', role: 'servant', status: 'active' })
const errors = reactive({})

const hasActiveFilters = computed(() => !!(search.value || filterRole.value || filterStatus.value))

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return users.value.filter((u) => {
    if (q && !u.name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false
    if (filterRole.value && u.role !== filterRole.value) return false
    if (filterStatus.value && u.status !== filterStatus.value) return false
    return true
  })
})

function roleLabel(role) {
  return {
    admin: 'أدمن',
    servant: 'خادم',
    co_servant: 'مساعد',
    group_leader: 'ليدر',
    reader: 'مسجل قراءات',
  }[role] || role
}

function roleClass(role) {
  return {
    admin: 'bg-gold/15 text-gold',
    group_leader: 'bg-brand/10 text-brand',
    co_servant: 'bg-navy/10 text-navy',
    servant: 'bg-success/10 text-success',
    reader: 'bg-gold/15 text-gold',
  }[role] || 'bg-page text-navy'
}

function statusColor(status) {
  return {
    active:   { bg: 'bg-success/10', text: 'text-success', label: 'نشط' },
    inactive: { bg: 'bg-navy/10',    text: 'text-navy/60', label: 'معطّل' },
    on_leave: { bg: 'bg-gold/15',    text: 'text-gold',    label: 'إجازة' },
    stopped:  { bg: 'bg-danger/10',  text: 'text-danger',  label: 'متوقف' },
    pending:  { bg: 'bg-gold/15',    text: 'text-gold',    label: 'قيد المراجعة' },
    rejected: { bg: 'bg-danger/10',  text: 'text-danger',  label: 'مرفوض' },
  }[status] || { bg: 'bg-page', text: 'text-navy', label: status }
}

function clearFilters() {
  search.value = ''
  filterRole.value = ''
  filterStatus.value = ''
}

function openAdd() {
  Object.assign(newUser, { name: '', email: '', password: '', role: 'servant', status: 'active' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showAddModal.value = true
}

function closeAddModal() {
  if (saving.value) return
  showAddModal.value = false
}

function validateNewUser() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!newUser.name) errors.name = 'الاسم مطلوب'
  if (!newUser.email) errors.email = 'البريد مطلوب'
  else if (!/^\S+@\S+\.\S+$/.test(newUser.email)) errors.email = 'بريد غير صحيح'
  if (!newUser.password || newUser.password.length < 6) errors.password = '6 أحرف على الأقل'
  return Object.keys(errors).length === 0
}

async function addUser() {
  if (!validateNewUser()) return
  saving.value = true
  try {
    const { data } = await api.post('/users', newUser)
    users.value.unshift(data)
    showAddModal.value = false
    successMessage.value = `تم إنشاء حساب ${data.name} ✅`
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الإضافة')
  } finally {
    saving.value = false
  }
}

function openPasswordModal(u) {
  passwordTarget.value = u
  newPassword.value = ''
  passwordError.value = ''
  showPasswordModal.value = true
}

function closePasswordModal() {
  if (saving.value) return
  showPasswordModal.value = false
}

async function changePassword() {
  passwordError.value = ''
  if (!newPassword.value || newPassword.value.length < 6) {
    passwordError.value = '6 أحرف على الأقل'
    return
  }
  saving.value = true
  try {
    await api.patch(`/users/${passwordTarget.value.id}/password`, { password: newPassword.value })
    successMessage.value = `تم تغيير باسورد ${passwordTarget.value.name} ✅`
    setTimeout(() => (successMessage.value = ''), 2500)
    showPasswordModal.value = false
  } catch (e) {
    passwordError.value = e.response?.data?.message || 'فشل التغيير'
  } finally {
    saving.value = false
  }
}

async function changeRole(u, newRole) {
  if (u.role === newRole) return
  if (!confirm(`تغيير دور "${u.name}" من "${roleLabel(u.role)}" لـ "${roleLabel(newRole)}"؟`)) {
    // revert select
    return
  }
  try {
    const { data } = await api.patch(`/users/${u.id}/role`, { role: newRole })
    u.role = data.role
    successMessage.value = `تم تغيير دور ${u.name} لـ ${roleLabel(newRole)} ✅`
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل التغيير')
    // reload to reset select
    await loadUsers()
  }
}

async function toggleStatus(u) {
  const next = u.status === 'active' ? 'inactive' : 'active'
  if (!confirm(`${next === 'active' ? 'تنشيط' : 'تعطيل'} "${u.name}"؟`)) return
  try {
    const { data } = await api.patch(`/users/${u.id}/status`, { status: next })
    u.status = data.status
    successMessage.value = `تم ${next === 'active' ? 'تنشيط' : 'تعطيل'} ${u.name} ✅`
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل التغيير')
  }
}

async function removeUser(u) {
  if (!confirm(`حذف "${u.name}" نهائيًا؟`)) return
  if (!confirm('آخر تأكيد: كل بيانات الحساب هتتشال. متأكد؟')) return
  try {
    await api.delete(`/users/${u.id}`)
    users.value = users.value.filter((x) => x.id !== u.id)
    successMessage.value = `تم حذف ${u.name} ✅`
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await api.get('/users')
    users.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isAdmin) loadUsers()
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: rgb(var(--color-navy) / 0.08);
  color: rgb(var(--color-navy));
  font-size: 0.75rem;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>