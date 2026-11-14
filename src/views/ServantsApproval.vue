<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">مراجعة</p>
          <h1 class="text-2xl font-bold text-navy truncate">طلبات إضافة خدام</h1>
          <p class="text-sm text-navy/60 mt-1">
            <span v-if="pendingServants.length > 0" class="text-gold font-medium tabular-nums">
              {{ pendingServants.length }}
            </span>
            <span v-else class="tabular-nums">0</span>
            طلب بانتظار الموافقة
          </p>
        </div>
        <button
          @click="goBack"
          class="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Icon name="arrow-right" class="w-4 h-4" />
          رجوع
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
        v-if="pendingServants.length === 0"
        class="rounded-2xl border border-border bg-card p-8 text-center"
      >
        <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
          <Icon name="check" class="w-6 h-6" />
        </div>
        <p class="text-navy font-medium mb-1">مفيش طلبات معلقة</p>
        <p class="text-sm text-navy/60">كل الطلبات تمت معالجتها</p>
      </div>

      <div v-else class="space-y-3">
        <article
          v-for="s in pendingServants"
          :key="s.id"
          class="rounded-2xl border border-border bg-card p-5 hover:shadow-sm transition-shadow duration-200"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center text-lg font-bold shrink-0">
                {{ s.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <h2 class="font-semibold text-navy truncate">{{ s.name }}</h2>
                <p class="text-sm text-navy/60 truncate" dir="ltr">{{ s.email }}</p>
              </div>
            </div>
            <span class="shrink-0 text-xs text-navy/50 tabular-nums whitespace-nowrap">
              {{ formatDate(s.added_at) }}
            </span>
          </div>

          <div class="rounded-xl bg-page/60 border border-border/60 p-3.5 mb-4 space-y-2 text-sm">
            <p class="flex items-center gap-2 text-navy/70">
              <Icon name="user" class="w-4 h-4 text-navy/40 shrink-0" />
              أضافه:
              <strong class="text-navy font-medium">{{ s.added_by_name || 'غير معروف' }}</strong>
            </p>
            <p class="flex items-center gap-2 text-navy/70">
              <Icon name="shield" class="w-4 h-4 text-navy/40 shrink-0" />
              الدور المطلوب:
              <strong class="font-medium" :class="roleColor(s.role).text">{{ roleLabel(s.role) }}</strong>
            </p>
            <p v-if="s.phone" class="flex items-center gap-2 text-navy/70">
              <Icon name="phone" class="w-4 h-4 text-navy/40 shrink-0" />
              <span dir="ltr" class="tabular-nums">{{ s.phone }}</span>
            </p>
            <p v-if="s.address" class="flex items-start gap-2 text-navy/70">
              <Icon name="map-pin" class="w-4 h-4 text-navy/40 shrink-0 mt-0.5" />
              <span>{{ s.address }}</span>
            </p>
            <p v-if="s.status_reason" class="flex items-start gap-2 text-navy/70">
              <Icon name="note" class="w-4 h-4 text-navy/40 shrink-0 mt-0.5" />
              <span>سبب: {{ s.status_reason }}</span>
            </p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              @click="reject(s)"
              class="inline-flex items-center gap-1.5 rounded-lg bg-danger/10 text-danger px-4 py-2 text-sm font-medium hover:bg-danger/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              <Icon name="x" class="w-4 h-4" />
              رفض
            </button>
            <button
              @click="approve(s)"
              class="inline-flex items-center gap-1.5 rounded-lg bg-success text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
            >
              <Icon name="check" class="w-4 h-4" />
              موافقة
            </button>
          </div>
        </article>
      </div>

      <section
        v-if="rejectedServants.length > 0"
        class="rounded-2xl border border-border bg-card mt-6"
        aria-labelledby="rejected-title"
      >
        <div class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border">
          <h2 id="rejected-title" class="text-base font-semibold text-navy flex items-center gap-2">
            <Icon name="x" class="w-4 h-4 text-danger" />
            مرفوضين
            <span class="text-sm font-normal text-navy/50">({{ rejectedServants.length }})</span>
          </h2>
        </div>

        <ul class="divide-y divide-border">
          <li
            v-for="s in rejectedServants"
            :key="s.id"
            class="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 hover:bg-page/40 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-danger/10 text-danger text-xs font-bold flex items-center justify-center shrink-0">
                {{ s.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-navy truncate">{{ s.name }}</p>
                <p class="text-xs text-navy/50 truncate">
                  <span dir="ltr">{{ s.email }}</span>
                  <span class="text-navy/30 mx-1">·</span>
                  أضافه: {{ s.added_by_name || 'غير معروف' }}
                </p>
              </div>
            </div>
            <button
              @click="remove(s.id, s.name)"
              class="shrink-0 inline-flex items-center gap-1 text-danger text-xs font-medium hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              <Icon name="trash" class="w-3.5 h-3.5" />
              حذف
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { DEMO_MODE } from '../config'
import { logActivity } from '../utils/auditLog'

const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  note: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
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

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const servants = ref([])
const successMessage = ref('')

const pendingServants = computed(() =>
  servants.value
    .filter((s) => s.status === 'pending')
    .sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
)

const rejectedServants = computed(() =>
  servants.value.filter((s) => s.status === 'rejected')
)

function roleLabel(role) {
  return {
    admin: 'أدمن',
    group_leader: 'ليدر',
    co_servant: 'مساعد',
    servant: 'خادم',
    reader: 'مسجل قراءات',
  }[role] || role
}

function roleColor(role) {
  return {
    admin: { text: 'text-gold' },
    group_leader: { text: 'text-brand' },
    co_servant: { text: 'text-navy' },
    servant: { text: 'text-success' },
    reader: { text: 'text-gold' },
  }[role] || { text: 'text-navy' }
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/servants')
}

function loadData() {
  servants.value = JSON.parse(localStorage.getItem('demo_servants') || '[]')
}

function saveData() {
  localStorage.setItem('demo_servants', JSON.stringify(servants.value))
  syncToUsers()
}

function syncToUsers() {
  const users = servants.value
    .filter((s) => s.password && (s.status === 'active' || s.status === 'on_leave'))
    .map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role === 'admin' ? 'admin' : s.role === 'reader' ? 'reader' : 'servant',
      active: s.status === 'active',
      password: s.password,
      created_at: s.joined_at,
    }))
  localStorage.setItem('demo_users', JSON.stringify(users))
}

function approve(s) {
  if (!confirm(`موافقة على إضافة "${s.name}"؟`)) return

  const idx = servants.value.findIndex((x) => x.id === s.id)
  if (idx !== -1) {
    servants.value[idx] = {
      ...servants.value[idx],
      status: 'active',
      active: true,
      approved_by: user.email,
      approved_at: new Date().toISOString(),
    }
  }
  saveData()
  logActivity('servant.approve', { name: s.name, added_by: s.added_by_name })
  successMessage.value = `تمت الموافقة على "${s.name}"`
  setTimeout(() => (successMessage.value = ''), 2500)
}

function reject(s) {
  if (!confirm(`رفض "${s.name}"؟`)) return

  const idx = servants.value.findIndex((x) => x.id === s.id)
  if (idx !== -1) {
    servants.value[idx] = {
      ...servants.value[idx],
      status: 'rejected',
      active: false,
      rejected_by: user.email,
      rejected_at: new Date().toISOString(),
    }
  }
  saveData()
  logActivity('servant.reject', { name: s.name, added_by: s.added_by_name })
  successMessage.value = `تم رفض "${s.name}"`
  setTimeout(() => (successMessage.value = ''), 2500)
}

function remove(id, name) {
  if (!confirm(`حذف "${name}" نهائياً؟`)) return
  servants.value = servants.value.filter((s) => s.id !== id)
  saveData()
}

onMounted(() => {
  if (DEMO_MODE) loadData()
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
</style>