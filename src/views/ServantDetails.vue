<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <div v-if="loading" class="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-navy/5"></div>
          <div class="space-y-2">
            <div class="h-6 w-40 rounded bg-navy/5"></div>
            <div class="h-4 w-64 rounded bg-navy/5"></div>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="i in 4" :key="i" class="h-20 rounded-2xl bg-navy/5"></div>
        </div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <div
        v-else-if="!servant"
        class="rounded-2xl border border-border bg-card p-8 text-center"
      >
        <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <Icon name="alert" class="w-5 h-5" />
        </div>
        <p class="text-navy font-medium mb-1">الخادم غير موجود</p>
        <p class="text-sm text-navy/60 mb-5">يمكن اتحذف أو اللينك غلط</p>
        <router-link
          to="/servants"
          class="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Icon name="arrow-right" class="w-4 h-4" />
          رجوع للخدام
        </router-link>
      </div>

      <template v-else>

        <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
              :class="roleColor(servant.role).bg + ' ' + roleColor(servant.role).text"
            >
              {{ servant.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <p class="text-xs text-navy/50 mb-0.5">ملف الخادم</p>
              <h1 class="text-2xl font-bold text-navy truncate">{{ servant.name }}</h1>
              <div class="flex items-center gap-2 flex-wrap mt-1.5">
                <span
                  class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="statusColor(servant.status).bg + ' ' + statusColor(servant.status).text"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ statusColor(servant.status).label }}
                </span>
                <span
                  class="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="roleColor(servant.role).bg + ' ' + roleColor(servant.role).text"
                >
                  {{ roleLabel(servant.role) }}
                </span>
                <span v-if="servant.joined_at" class="text-xs text-navy/40 tabular-nums">
                  • انضم {{ formatDate(servant.joined_at) }}
                </span>
              </div>
            </div>
          </div>
          <button
            @click="goBack"
            class="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="arrow-right" class="w-4 h-4" />
            رجوع
          </button>
        </header>

        <section
          class="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border mb-5"
          aria-label="إحصائيات الخادم"
        >
          <Stat label="مخدومين" :value="myMembers.length" tone="default" />
          <Stat label="مجموعات" :value="myGroups.length" tone="gold" />
          <Stat label="ملاحظات" :value="myNotesCount" tone="ok" />
          <Stat label="عمليات" :value="myActivity.length" tone="muted" />
        </section>

        <section
          class="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-5"
          aria-labelledby="contact-title"
        >
          <h2 id="contact-title" class="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <Icon name="phone" class="w-4 h-4 text-navy/60" />
            بيانات الاتصال
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info label="البريد الإلكتروني" :value="servant.email" icon="mail" dir="ltr" />
            <Info label="رقم التليفون" :value="servant.phone || '—'" icon="phone" dir="ltr" />
            <Info label="تاريخ الميلاد" :value="servant.birth_date ? formatDate(servant.birth_date) : '—'" icon="calendar" />
            <Info label="العنوان" :value="servant.address || '—'" icon="map-pin" />
          </div>
        </section>

        <section
          class="rounded-2xl border border-border bg-card mb-5"
          aria-labelledby="groups-title"
        >
          <div class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border">
            <h2 id="groups-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="users" class="w-4 h-4 text-gold" />
              المجموعات المسؤول عنها
              <span class="text-sm font-normal text-navy/50">({{ myGroups.length }})</span>
            </h2>
          </div>

          <div v-if="myGroups.length === 0" class="px-5 sm:px-6 py-10 text-center">
            <div class="mx-auto mb-3 w-10 h-10 rounded-full bg-page text-navy/40 flex items-center justify-center">
              <Icon name="users" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60">مش مسؤول عن أي مجموعة</p>
          </div>

          <div v-else class="p-4 sm:p-5 flex flex-wrap gap-2">
            <router-link
              v-for="g in myGroups"
              :key="g.id"
              :to="`/groups/${g.id}`"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <Icon name="users" class="w-3.5 h-3.5" />
              {{ g.name }}
            </router-link>
          </div>
        </section>

        <section
          class="rounded-2xl border border-border bg-card"
          aria-labelledby="members-title"
        >
          <div class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border">
            <h2 id="members-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="user" class="w-4 h-4 text-brand" />
              المخدومين المسؤول عنهم
              <span class="text-sm font-normal text-navy/50">({{ myMembers.length }})</span>
            </h2>
          </div>

          <div v-if="myMembers.length === 0" class="px-5 sm:px-6 py-10 text-center">
            <div class="mx-auto mb-3 w-10 h-10 rounded-full bg-page text-navy/40 flex items-center justify-center">
              <Icon name="user" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60">مش مسؤول عن أي مخدوم</p>
          </div>

          <ul v-else class="divide-y divide-border max-h-96 overflow-y-auto">
            <li
              v-for="m in myMembers"
              :key="m.id"
              class="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 hover:bg-page/40 transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                  {{ m.full_name.charAt(0) }}
                </div>
                <router-link
                  :to="`/members/${m.id}`"
                  class="text-sm font-medium text-navy hover:text-brand transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                >
                  {{ m.full_name }}
                </router-link>
              </div>
              <span class="shrink-0 text-xs text-navy/60 inline-flex items-center gap-1">
                <Icon name="book" class="w-3 h-3" />
                {{ m.grade }}
              </span>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
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

const Stat = {
  props: {
    label: String,
    value: [String, Number],
    tone: { type: String, default: 'default' },
  },
  setup(props) {
    const toneClass = {
      default: 'text-navy',
      ok: 'text-success',
      gold: 'text-gold',
      danger: 'text-danger',
      muted: 'text-navy/40',
    }
    return () =>
      h('div', { class: 'bg-card px-4 py-3.5' }, [
        h('p', { class: 'text-xs text-navy/50 mb-1' }, props.label),
        h(
          'p',
          { class: ['text-2xl font-bold tabular-nums', toneClass[props.tone] || toneClass.default] },
          String(props.value)
        ),
      ])
  },
}

const Info = {
  props: {
    label: String,
    value: [String, Number],
    icon: { type: String, default: '' },
    dir: { type: String, default: '' },
  },
  components: { Icon },
  setup(props) {
    return () =>
      h('div', { class: 'flex items-start gap-3' }, [
        props.icon
          ? h(
              'div',
              {
                class:
                  'w-9 h-9 rounded-lg bg-page text-navy/50 flex items-center justify-center shrink-0',
              },
              [h(Icon, { name: props.icon, class: 'w-4 h-4' })]
            )
          : null,
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'text-xs text-navy/50 mb-0.5' }, props.label),
          h(
            'p',
            {
              class: 'font-medium text-navy text-sm break-words',
              dir: props.dir || undefined,
            },
            String(props.value)
          ),
        ]),
      ])
  },
}

const route = useRoute()
const router = useRouter()
const servant = ref(null)
const allMembers = ref([])
const allGroups = ref([])
const loading = ref(true)

const myMembers = computed(() =>
  allMembers.value.filter((m) => m.servant_id === servant.value?.id)
)
const myGroups = computed(() =>
  allGroups.value.filter(
    (g) => g.servant_id === servant.value?.id || g.co_servant_id === servant.value?.id
  )
)
const myNotesCount = computed(() => 0)
const myActivity = computed(() => [])

function statusColor(status) {
  return {
    active:     { bg: 'bg-success/10', text: 'text-success', label: 'نشط' },
    on_leave:   { bg: 'bg-gold/15',    text: 'text-gold',    label: 'إجازة' },
    stopped:    { bg: 'bg-danger/10',  text: 'text-danger',  label: 'متوقف' },
    inactive:   { bg: 'bg-navy/10',    text: 'text-navy/60', label: 'معطّل' },
    pending:    { bg: 'bg-gold/15',    text: 'text-gold',    label: 'قيد المراجعة' },
    rejected:   { bg: 'bg-danger/10',  text: 'text-danger',  label: 'مرفوض' },
  }[status] || { bg: 'bg-page', text: 'text-navy', label: status }
}

function roleColor(role) {
  return {
    admin:        { bg: 'bg-gold/15',    text: 'text-gold' },
    group_leader: { bg: 'bg-brand/10',   text: 'text-brand' },
    co_servant:   { bg: 'bg-navy/10',    text: 'text-navy' },
    servant:      { bg: 'bg-success/10', text: 'text-success' },
    reader:       { bg: 'bg-gold/15',    text: 'text-gold' },
  }[role] || { bg: 'bg-page', text: 'text-navy' }
}

function roleLabel(role) {
  return {
    admin: 'أدمن',
    group_leader: 'ليدر',
    co_servant: 'مساعد',
    servant: 'خادم',
    reader: 'مسجل قراءات',
  }[role] || role
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/servants')
}

async function loadData() {
  loading.value = true
  try {
    const [servantRes, membersRes, groupsRes] = await Promise.all([
      api.get(`/users/${route.params.id}`),
      api.get('/members'),
      api.get('/groups'),
    ])
    servant.value = servantRes.data
    allMembers.value = membersRes.data
    allGroups.value = groupsRes.data
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
</style>