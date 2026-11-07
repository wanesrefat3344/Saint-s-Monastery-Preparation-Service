<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- ============ Header ============ -->
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

      <!-- ============ Success ============ -->
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

      <!-- ============ Not admin ============ -->
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

        <!-- ============ Loading skeleton ============ -->
        <div v-if="loading" class="rounded-2xl border border-border bg-white overflow-hidden" aria-busy="true" aria-live="polite">
          <div class="h-10 bg-page/40 border-b border-border"></div>
          <div v-for="i in 4" :key="i" class="px-4 py-4 border-b border-border last:border-0 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="h-4 w-32 rounded bg-navy/5"></div>
              <div class="h-4 w-40 rounded bg-navy/5"></div>
              <div class="h-4 w-20 rounded bg-navy/5"></div>
              <div class="h-4 w-16 rounded bg-navy/5"></div>
            </div>
          </div>
          <span class="sr-only">جارٍ التحميل...</span>
        </div>

        <!-- ============ Empty ============ -->
        <div
          v-else-if="users.length === 0"
          class="rounded-2xl border border-border bg-white p-10 text-center"
        >
          <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
            <Icon name="users" class="w-6 h-6" />
          </div>
          <p class="text-navy font-medium mb-1">مفيش حسابات لسه</p>
          <p class="text-sm text-navy/60 mb-5">ابدأ بإضافة أول حساب</p>
          <button
            @click="openAdd"
            class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="plus" class="w-4 h-4" />
            إضافة حساب
          </button>
        </div>

        <!-- ============ Table ============ -->
        <section v-else class="rounded-2xl border border-border bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-page/40">
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الاسم</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs hidden sm:table-cell">البريد</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الدور</th>
                  <th class="text-right px-4 py-3 font-medium text-navy/60 text-xs">الحالة</th>
                  <th class="text-center px-4 py-3 font-medium text-navy/60 text-xs">إجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="u in users"
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
                        <p class="font-medium text-navy truncate">{{ u.name }}</p>
                        <p class="text-xs text-navy/50 truncate sm:hidden" dir="ltr">{{ u.email }}</p>
                      </div>
                    </div>
                  </td>

                  <td class="px-4 py-3 text-navy/70 hidden sm:table-cell" dir="ltr">
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

                  <td class="px-4 py-3 text-center">
                    <button
                      @click="toggleStatus(u)"
                      class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
                      :class="u.status === 'active'
                        ? 'text-danger hover:bg-danger/10 focus-visible:ring-danger/40'
                        : 'text-success hover:bg-success/10 focus-visible:ring-success/40'"
                    >
                      <Icon :name="u.status === 'active' ? 'x' : 'check'" class="w-3.5 h-3.5" />
                      {{ u.status === 'active' ? 'تعطيل' : 'تنشيط' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>

    <!-- ============ Modal ============ -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-navy/50 backdrop-blur-sm"
          @click.self="closeModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div class="w-full max-w-md rounded-2xl bg-white shadow-xl border border-border p-6">
            <div class="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 id="modal-title" class="text-lg font-semibold text-navy">إضافة حساب جديد</h2>
                <p class="text-xs text-navy/50 mt-0.5">املأ بيانات الحساب الجديد</p>
              </div>
              <button
                @click="closeModal"
                class="shrink-0 w-8 h-8 rounded-full text-navy/40 hover:bg-page hover:text-navy transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                aria-label="إغلاق"
              >
                <Icon name="x" class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="addUser" class="space-y-3.5">
              <div>
                <label class="block text-sm font-medium mb-1 text-navy">الاسم</label>
                <input
                  v-model.trim="newUser.name"
                  type="text"
                  placeholder="مثال: يوسف مجدي"
                  class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-colors"
                  :class="errors.name ? 'border-danger focus-visible:ring-danger/30' : 'border-border focus-visible:border-brand'"
                />
                <p v-if="errors.name" class="text-xs text-danger mt-1">{{ errors.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1 text-navy">البريد الإلكتروني</label>
                <input
                  v-model.trim="newUser.email"
                  type="email"
                  dir="ltr"
                  placeholder="user@example.com"
                  class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-colors"
                  :class="errors.email ? 'border-danger focus-visible:ring-danger/30' : 'border-border focus-visible:border-brand'"
                />
                <p v-if="errors.email" class="text-xs text-danger mt-1">{{ errors.email }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1 text-navy">كلمة المرور</label>
                <input
                  v-model="newUser.password"
                  type="password"
                  placeholder="6 أحرف على الأقل"
                  class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-colors"
                  :class="errors.password ? 'border-danger focus-visible:ring-danger/30' : 'border-border focus-visible:border-brand'"
                />
                <p v-if="errors.password" class="text-xs text-danger mt-1">{{ errors.password }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1 text-navy">الدور</label>
                <select
                  v-model="newUser.role"
                  class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand transition-colors"
                >
                  <option value="servant">خادم</option>
                  <option value="co_servant">خادم مساعد</option>
                  <option value="reader">مسجل قراءات</option>
                  <option value="admin">أدمن</option>
                </select>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-border mt-5 -mb-1">
                <button
                  type="button"
                  @click="closeModal"
                  :disabled="saving"
                  class="rounded-lg border border-border bg-white px-4 py-2 text-sm text-navy/70 hover:bg-page disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <svg
                    v-if="saving"
                    class="animate-spin w-3.5 h-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <Icon v-else name="check" class="w-3.5 h-3.5" />
                  {{ saving ? 'جارٍ الإضافة...' : 'إضافة' }}
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
import { ref, reactive, onMounted, h } from 'vue'
import api from '../api/client'

/* ================= Icon component ================= */
const ICONS = {
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
}

const Icon = {
  props: { name: String },
  setup(props) {
    return () =>
      h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
          class: 'shrink-0',
        },
        [h('path', { d: ICONS[props.name] || '' })]
      )
  },
}

/* ================= State ================= */
const me = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = me.role === 'admin'

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const successMessage = ref('')
const newUser = reactive({ name: '', email: '', password: '', role: 'servant' })
const errors = reactive({})

/* ================= Helpers ================= */
function roleLabel(role) {
  return {
    admin: 'أدمن',
    group_leader: 'ليدر',
    co_servant: 'مساعد',
    servant: 'خادم',
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
    active:     { bg: 'bg-success/10', text: 'text-success', label: 'نشط' },
    inactive:   { bg: 'bg-navy/10',    text: 'text-navy/60', label: 'معطّل' },
    pending:    { bg: 'bg-gold/15',    text: 'text-gold',    label: 'قيد المراجعة' },
    rejected:   { bg: 'bg-danger/10',  text: 'text-danger',  label: 'مرفوض' },
    on_leave:   { bg: 'bg-gold/15',    text: 'text-gold',    label: 'إجازة' },
    stopped:    { bg: 'bg-danger/10',  text: 'text-danger',  label: 'متوقف' },
  }[status] || { bg: 'bg-page', text: 'text-navy', label: status }
}

function closeModal() {
  if (saving.value) return
  showModal.value = false
}

function openAdd() {
  Object.assign(newUser, { name: '', email: '', password: '', role: 'servant' })
  Object.keys(errors).forEach((k) => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!newUser.name) errors.name = 'مطلوب'
  if (!newUser.email) errors.email = 'مطلوب'
  else if (!/^\S+@\S+\.\S+$/.test(newUser.email)) errors.email = 'بريد غير صحيح'
  else if (users.value.some((u) => u.email === newUser.email)) errors.email = 'البريد مستخدم بالفعل'
  if (!newUser.password || newUser.password.length < 6) errors.password = '6 أحرف على الأقل'
  return Object.keys(errors).length === 0
}

/* ================= Actions ================= */
async function addUser() {
  if (!validate()) return

  saving.value = true
  try {
    const { data } = await api.post('/users', newUser)
    users.value.unshift(data)
    showModal.value = false
    successMessage.value = 'تم إضافة الحساب'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الإضافة')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(u) {
  const nextStatus = u.status === 'active' ? 'inactive' : 'active'

  if (!confirm(`متأكد من ${nextStatus === 'active' ? 'تنشيط' : 'تعطيل'} "${u.name}"؟`)) return

  try {
    await api.put(`/users/${u.id}`, {
      name: u.name,
      email: u.email,
      role: u.role,
      status: nextStatus,
      phone: u.phone,
      birth_date: u.birth_date,
      address: u.address,
    })
    u.status = nextStatus
    successMessage.value = `تم ${nextStatus === 'active' ? 'تنشيط' : 'تعطيل'} الحساب`
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل التعديل')
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
.modal-enter-active .max-w-md,
.modal-leave-active .max-w-md {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .max-w-md,
.modal-leave-to .max-w-md {
  transform: scale(0.96) translateY(4px);
}
</style>