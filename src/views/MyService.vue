<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- Header -->
      <header class="flex items-start justify-between gap-4 mb-6">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">صفحتي الشخصية</p>
          <h1 class="text-2xl font-bold text-navy truncate">خدمتي</h1>
          <p class="text-sm text-navy/60 mt-1">{{ user?.name }}</p>
        </div>
        <router-link to="/" class="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-brand hover:border-brand/40 transition-colors">
          رجوع
        </router-link>
      </header>

      <div v-if="loading" class="space-y-4 animate-pulse">
        <div class="h-24 rounded-2xl bg-navy/5"></div>
        <div class="h-32 rounded-2xl bg-navy/5"></div>
      </div>

      <div v-else-if="error" class="card text-center py-16">
        <p class="text-danger mb-4">{{ error }}</p>
        <button @click="load" class="btn-primary">إعادة المحاولة</button>
      </div>

      <template v-else>

        <!-- Stats -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border mb-6">
          <Stat label="مخدوميني" :value="data.members.total" color="brand" />
          <Stat label="نسبة الحضور" :value="`${data.attendance.rate}%`" :color="data.attendance.rate >= 70 ? 'success' : 'danger'" />
          <Stat label="محتاجين افتقاد" :value="data.followups.needs_count" :color="data.followups.needs_count ? 'gold' : 'muted'" />
          <Stat label="تحدياتي" :value="data.challenges.length" color="gold" />
        </section>

        <!-- Groups -->
        <section v-if="data.groups.length > 0" class="card mb-6">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-brand"></span>
            مجموعاتي ({{ data.groups.length }})
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <router-link
              v-for="g in data.groups"
              :key="g.id"
              :to="`/groups/${g.id}`"
              class="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-brand hover:bg-brand/5 transition-colors"
            >
              <div class="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold shrink-0">
                {{ g.name.charAt(0) }}
              </div>
              <span class="font-medium text-navy">{{ g.name }}</span>
            </router-link>
          </div>
        </section>

        <!-- Challenges -->
        <section v-if="data.challenges.length > 0" class="card mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-navy flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gold"></span>
              تحدياتي ({{ data.challenges.length }})
            </h2>
            <router-link to="/challenges" class="text-sm text-brand hover:underline">كل التحديات →</router-link>
          </div>
          <ul class="space-y-2">
            <li
              v-for="c in data.challenges"
              :key="c.id"
              class="flex items-center justify-between gap-3 p-3 rounded-xl border border-border"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-2xl shrink-0">{{ c.challenge_icon || '🏆' }}</span>
                <div class="min-w-0">
                  <p class="font-medium text-navy truncate">{{ c.challenge_name }}</p>
                  <p class="text-xs text-navy/60 truncate">{{ c.group_name }}</p>
                </div>
              </div>
              <div class="text-left shrink-0">
                <p class="text-sm font-bold text-gold tabular-nums">{{ c.points || 0 }} / {{ c.challenge_total_points }}</p>
                <p class="text-xs" :class="statusClass(c.status)">{{ statusLabel(c.status) }}</p>
              </div>
            </li>
          </ul>
        </section>

        <!-- Followups -->
        <section v-if="data.followups.list.length > 0" class="card mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-navy flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-danger"></span>
              محتاجين افتقاد ({{ data.followups.needs_count }})
            </h2>
            <router-link to="/followups" class="text-sm text-brand hover:underline">فتح الافتقاد →</router-link>
          </div>
          <ul class="space-y-2">
            <li
              v-for="m in data.followups.list.slice(0, 5)"
              :key="m.member_id"
              class="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
            >
              <router-link :to="`/members/${m.member_id}`" class="text-navy font-medium hover:text-brand">
                {{ m.member_name }}
              </router-link>
              <span class="text-xs" :class="m.days_since === null ? 'text-danger' : 'text-gold'">
                {{ m.days_since === null ? 'لم يتم' : `من ${m.days_since} يوم` }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Members -->
        <section class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-navy flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-success"></span>
              مخدوميني ({{ data.members.total }})
            </h2>
            <router-link to="/members" class="text-sm text-brand hover:underline">عرض الكل →</router-link>
          </div>
          <div v-if="data.members.list.length === 0" class="text-center py-6 text-navy/50 text-sm">
            مفيش مخدومين لسه — <router-link to="/members/new" class="text-brand hover:underline">سجل أول مخدوم</router-link>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <router-link
              v-for="m in data.members.list.slice(0, 10)"
              :key="m.id"
              :to="`/members/${m.id}`"
              class="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-brand hover:bg-brand/5 transition-colors"
            >
              <div class="w-8 h-8 rounded-lg bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                {{ m.full_name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-navy truncate">{{ m.full_name }}</p>
                <p class="text-xs text-navy/50 truncate">{{ m.grade }}</p>
              </div>
            </router-link>
          </div>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import api from '../api/client'

const Stat = {
  props: ['label', 'value', 'color'],
  setup(props) {
    const colors = {
      brand: 'text-brand',
      success: 'text-success',
      danger: 'text-danger',
      gold: 'text-gold',
      muted: 'text-navy/40',
    }
    return () => h('div', { class: 'bg-card px-4 py-4' }, [
      h('p', { class: 'text-xs text-navy/50 mb-1' }, props.label),
      h('p', { class: ['text-2xl font-bold tabular-nums', colors[props.color] || 'text-navy'] }, String(props.value)),
    ])
  },
}

const user = JSON.parse(localStorage.getItem('user') || '{}')
const loading = ref(true)
const error = ref('')
const data = ref({
  members: { total: 0, list: [] },
  groups: [],
  followups: { needs_count: 0, list: [] },
  attendance: { rate: 0, present: 0, total: 0 },
  challenges: [],
})

function statusLabel(s) {
  return s === 'approved' ? 'مقبول' : s === 'pending' ? 'معلق' : 'مرفوض'
}
function statusClass(s) {
  return s === 'approved' ? 'text-success' : s === 'pending' ? 'text-gold' : 'text-danger'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/me/overview')
    data.value = res.data
  } catch (e) {
    error.value = e.response?.data?.message || 'فشل تحميل البيانات'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>