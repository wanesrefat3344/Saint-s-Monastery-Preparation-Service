<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">إدارة</p>
          <h1 class="text-2xl font-bold text-navy truncate">الإعدادات</h1>
          <p class="text-sm text-navy/60 mt-1">النسخ الاحتياطي، البيانات، ومعلومات النظام</p>
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

      <section
        class="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-5"
        aria-labelledby="backup-title"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
            <Icon name="database" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h2 id="backup-title" class="text-base font-semibold text-navy">نسخة احتياطية</h2>
            <p class="text-sm text-navy/60 mt-0.5 leading-relaxed">
              حمّل نسخة من كل بيانات الخدمة (مخدومين + ملاحظات + افتقاد + حضور + حسابات).
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            @click="exportBackup"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-success text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
          >
            <Icon name="download" class="w-4 h-4" />
            تحميل نسخة احتياطية
          </button>

          <label
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer focus-within:ring-2 focus-within:ring-brand/40"
          >
            <Icon name="upload" class="w-4 h-4" />
            استرجاع نسخة
            <input type="file" accept=".json" @change="importBackup" class="hidden" />
          </label>
        </div>

        <div class="mt-4 p-3.5 rounded-xl bg-gold/5 border border-gold/30 flex items-start gap-2.5">
          <Icon name="alert" class="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p class="text-xs text-navy/70 leading-relaxed">
            <strong class="text-navy">ملاحظة:</strong> استرجاع نسخة هيستبدل كل البيانات الحالية. تأكد إنك عايز ده.
          </p>
        </div>
      </section>

      <section
        class="rounded-2xl border border-danger/30 bg-danger/[0.02] p-5 sm:p-6 mb-5"
        aria-labelledby="clear-title"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0">
            <Icon name="trash" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h2 id="clear-title" class="text-base font-semibold text-navy">مسح بيانات التجربة</h2>
            <p class="text-sm text-navy/60 mt-0.5 leading-relaxed">
              هيتمسح كل شيء: مخدومين، ملاحظات، افتقاد، حضور، إعدادات.
            </p>
          </div>
        </div>

        <button
          @click="clearAll"
          class="inline-flex items-center gap-2 rounded-lg bg-danger/10 text-danger px-4 py-2 text-sm font-medium hover:bg-danger/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
        >
          <Icon name="trash" class="w-4 h-4" />
          مسح كل البيانات
        </button>
      </section>

      <section
        class="rounded-2xl border border-border bg-card"
        aria-labelledby="system-title"
      >
        <div class="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-border">
          <div class="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Icon name="info" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h2 id="system-title" class="text-base font-semibold text-navy">معلومات النظام</h2>
            <p class="text-sm text-navy/60 mt-0.5">حالة النظام وإحصائيات البيانات الحالية</p>
          </div>
        </div>

        <div class="px-5 sm:px-6 pt-4">
          <div
            class="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm border"
            :class="DEMO_MODE
              ? 'bg-gold/5 border-gold/30 text-gold'
              : 'bg-success/5 border-success/30 text-success'"
          >
            <Icon :name="DEMO_MODE ? 'database' : 'cloud'" class="w-4 h-4 shrink-0" />
            <span>
              الوضع الحالي:
              <strong class="font-semibold">{{ DEMO_MODE ? 'تجريبي (localStorage)' : 'حقيقي (API)' }}</strong>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-px bg-border border-t border-border mt-4 rounded-b-2xl overflow-hidden">
          <StatItem label="المخدومين" :value="stats.members" tone="default" icon="user" />
          <StatItem label="الحسابات" :value="stats.users" tone="brand" icon="users" />
          <StatItem label="سجلات الافتقاد" :value="stats.followups" tone="gold" icon="phone" />
          <StatItem label="سجلات الحضور" :value="stats.attendance" tone="ok" icon="check" />
          <StatItem label="سجلات النشاط" :value="stats.auditLog" tone="muted" icon="list" />
          <StatItem label="تاريخ اليوم" :value="todayLabel" tone="muted" icon="calendar" is-text />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DEMO_MODE } from '../config'
import { logActivity } from '../utils/auditLog'

const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  check: 'M20 6 9 17l-5-5',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  database: 'M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3zM3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3',
  cloud: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
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

const StatItem = {
  props: {
    label: String,
    value: [String, Number],
    tone: { type: String, default: 'default' },
    icon: { type: String, default: '' },
    isText: Boolean,
  },
  components: { Icon },
  setup(props) {
    const toneClass = {
      default: 'text-navy',
      ok: 'text-success',
      gold: 'text-gold',
      danger: 'text-danger',
      brand: 'text-brand',
      muted: 'text-navy/40',
    }
    return () =>
      h('div', { class: 'bg-card px-4 py-3.5 flex items-start gap-2.5' }, [
        props.icon
          ? h(
              'div',
              {
                class: [
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  props.tone === 'gold' ? 'bg-gold/10' : props.tone === 'ok' ? 'bg-success/10' : props.tone === 'danger' ? 'bg-danger/10' : props.tone === 'brand' ? 'bg-brand/10' : props.tone === 'muted' ? 'bg-page' : 'bg-page',
                  toneClass[props.tone] || toneClass.default,
                ],
              },
              [h(Icon, { name: props.icon, class: 'w-4 h-4' })]
            )
          : null,
        h('div', { class: 'min-w-0 flex-1' }, [
          h('p', { class: 'text-xs text-navy/50 mb-0.5' }, props.label),
          h(
            'p',
            {
              class: [
                props.isText ? 'text-sm' : 'text-lg',
                'font-bold tabular-nums',
                toneClass[props.tone] || toneClass.default,
              ],
            },
            String(props.value)
          ),
        ]),
      ])
  },
}

const router = useRouter()
const successMessage = ref('')
const stats = ref({ members: 0, users: 0, followups: 0, attendance: 0, auditLog: 0 })

const todayLabel = computed(() =>
  new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
)

const KEYS = {
  members: 'demo_members',
  users: 'demo_users',
  notes: 'demo_notes',
  followups: 'demo_followups',
  attendance: 'demo_attendance',
  auditLog: 'demo_audit_log',
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function exportBackup() {
  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    exported_by: JSON.parse(localStorage.getItem('user') || '{}').email || 'unknown',
    data: {},
  }

  Object.entries(KEYS).forEach(([name, key]) => {
    try {
      backup.data[name] = JSON.parse(localStorage.getItem(key) || 'null')
    } catch {
      backup.data[name] = null
    }
  })

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `service-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)

  logActivity('backup.export')
  successMessage.value = 'تم تحميل النسخة الاحتياطية'
  setTimeout(() => (successMessage.value = ''), 3000)
}

function importBackup(e) {
  const file = e.target.files[0]
  if (!file) return

  if (!confirm('استرجاع النسخة هيستبدل كل البيانات الحالية. متأكد؟')) {
    e.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const backup = JSON.parse(ev.target.result)
      if (!backup.data) throw new Error('ملف غير صالح')

      Object.entries(KEYS).forEach(([name, key]) => {
        if (backup.data[name] !== null && backup.data[name] !== undefined) {
          localStorage.setItem(key, JSON.stringify(backup.data[name]))
        }
      })

      logActivity('backup.restore')
      successMessage.value = 'تم استرجاع النسخة الاحتياطية — جاري إعادة التحميل...'
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      alert('ملف النسخة الاحتياطية غير صالح')
    }
    e.target.value = ''
  }
  reader.readAsText(file)
}

function clearAll() {
  if (!confirm('هتمسح كل البيانات نهائياً. متأكد؟')) return
  if (!confirm('آخر تأكيد: كل المخدومين والملاحظات والحضور هيتمسحوا. متأكد؟')) return

  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  window.location.href = '/login'
}

function loadStats() {
  stats.value = {
    members: JSON.parse(localStorage.getItem('demo_members') || '[]').length,
    users: JSON.parse(localStorage.getItem('demo_users') || '[]').length,
    followups: Object.values(JSON.parse(localStorage.getItem('demo_followups') || '{}')).reduce(
      (s, a) => s + a.length,
      0
    ),
    attendance: Object.keys(JSON.parse(localStorage.getItem('demo_attendance') || '{}')).length,
    auditLog: JSON.parse(localStorage.getItem('demo_audit_log') || '[]').length,
  }
}

onMounted(loadStats)
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