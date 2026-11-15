<template>
  <div class="min-h-screen bg-page py-8 px-4 pb-24" dir="rtl">
    <div class="max-w-7xl mx-auto">

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-start gap-3">
          <button @click="goBack" class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-navy">نشاط الخدام</h1>
            <p class="text-sm text-navy/60 mt-1">تقرير شامل لكل خادم — مين شغال ومين لا</p>
          </div>
        </div>
        <router-link to="/servant-attendance" class="btn-cancel text-sm self-start sm:self-auto">
          ✓ تسجيل الحضور
        </router-link>
      </div>

      <SkeletonCard v-if="loading" :count="6" />

      <div v-else-if="servants.length === 0" class="card">
        <EmptyState icon="👤" title="مفيش خدامين" description="لسه مفيش خدامين نشطين" tone="brand" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="s in servants" :key="s.id" class="card hover:border-brand transition">
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand text-lg font-bold flex items-center justify-center shrink-0">
                {{ s.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <h2 class="font-semibold text-navy truncate">{{ s.name }}</h2>
                <p class="text-xs text-navy/60 truncate" dir="ltr">{{ s.email }}</p>
              </div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0" :class="levelClass(s.level)">
              {{ levelLabel(s.level) }}
            </span>
          </div>

          <!-- Attendance rate -->
          <div class="mb-3">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-navy/60">نسبة الحضور</span>
              <span class="font-bold" :class="rateColor(s.attendance_rate)">{{ s.attendance_rate }}%</span>
            </div>
            <div class="h-2 bg-navy/5 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :class="rateBarColor(s.attendance_rate)" :style="{ width: s.attendance_rate + '%' }"></div>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
            <div class="bg-page rounded p-2">
              <p class="text-navy/50 text-[10px]">👥 مخدومين</p>
              <p class="font-bold text-navy text-base">{{ s.members_count }}</p>
            </div>
            <div class="bg-page rounded p-2">
              <p class="text-navy/50 text-[10px]">📁 مجموعات</p>
              <p class="font-bold text-navy text-base">{{ s.groups_count }}</p>
            </div>
            <div class="bg-page rounded p-2">
              <p class="text-navy/50 text-[10px]">📞 افتقاد</p>
              <p class="font-bold text-navy text-base">{{ s.followups_count }}</p>
            </div>
          </div>

          <!-- Challenges + Eval -->
          <div class="flex items-center justify-between text-xs mb-3 text-navy/60">
            <span>🏆 {{ s.challenges_count }} تحدي</span>
            <span v-if="s.avg_score">⭐ تقييم: {{ s.avg_score }}/5</span>
            <span v-else class="text-navy/30">⭐ مفيش تقييم</span>
          </div>

          <!-- Attendance details -->
          <div class="flex items-center gap-2 text-xs mb-3 flex-wrap">
            <span class="bg-success/10 text-success px-2 py-0.5 rounded">✓ {{ s.present_count }} حاضر</span>
            <span v-if="s.late_count > 0" class="bg-gold/10 text-gold px-2 py-0.5 rounded">⏰ {{ s.late_count }} متأخر</span>
            <span v-if="s.absent_count > 0" class="bg-danger/10 text-danger px-2 py-0.5 rounded">✕ {{ s.absent_count }} غايب</span>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-1 pt-2 border-t border-border">
            <router-link :to="`/servant-evaluation?servant=${s.id}`" class="text-gold text-xs font-medium hover:bg-gold/10 px-2 py-1 rounded">
              ⭐ تقييم
            </router-link>
            <router-link :to="`/servants/${s.id}`" class="text-brand text-xs font-medium hover:bg-brand/10 px-2 py-1 rounded">
              عرض
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'
import SkeletonCard from '../components/SkeletonCard.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const servants = ref([])
const loading = ref(true)

function levelLabel(level) {
  return {
    excellent: '⭐ ممتاز',
    good: '✅ جيد',
    needs_attention: '⚠️ محتاج متابعة',
    at_risk: '🚨 في خطر',
    no_data: '📊 مفيش بيانات',
  }[level] || level
}

function levelClass(level) {
  return {
    excellent: 'bg-success/10 text-success',
    good: 'bg-brand/10 text-brand',
    needs_attention: 'bg-gold/10 text-gold',
    at_risk: 'bg-danger/10 text-danger',
    no_data: 'bg-navy/10 text-navy/60',
  }[level] || 'bg-page text-navy'
}

function rateColor(rate) {
  if (rate >= 80) return 'text-success'
  if (rate >= 60) return 'text-brand'
  if (rate >= 40) return 'text-gold'
  return 'text-danger'
}

function rateBarColor(rate) {
  if (rate >= 80) return 'bg-success'
  if (rate >= 60) return 'bg-brand'
  if (rate >= 40) return 'bg-gold'
  return 'bg-danger'
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

async function loadData() {
  loading.value = true
  try {
    const { data } = await api.get('/servants-activity')
    servants.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>