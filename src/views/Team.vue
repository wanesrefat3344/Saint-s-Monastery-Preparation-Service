<template>
  <div class="min-h-screen bg-page py-8 px-4" dir="rtl">
    <div class="max-w-5xl mx-auto">

      <header class="flex items-start justify-between gap-4 mb-6">
        <div class="min-w-0">
          <p class="text-xs text-navy/50 mb-1">إدارة</p>
          <h1 class="text-2xl font-bold text-navy">الفريق</h1>
          <p class="text-sm text-navy/60 mt-1">الخدام والمسؤولين</p>
        </div>
        <router-link to="/" class="btn-cancel text-sm">رجوع</router-link>
      </header>

      <!-- Tabs -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="activeTab = t.key"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === t.key ? 'bg-navy text-white' : 'bg-card text-navy/70 hover:bg-page border border-border'"
        >
          {{ t.label }}
        </button>
      </div>

      <div v-if="loading" class="card text-center py-16 text-navy/50">جارٍ التحميل...</div>

      <div v-else-if="activeTab === 'servants'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="servants.length === 0" class="col-span-2 card text-center py-16 text-navy/50">
          مفيش خدامين
        </div>
        <router-link
          v-for="s in servants"
          :key="s.id"
          :to="`/team/${s.id}`"
          class="card hover:border-brand transition"
        >
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand text-xl font-bold flex items-center justify-center shrink-0">
              {{ s.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-navy truncate">{{ s.name }}</h3>
              <p class="text-xs text-navy/60 truncate" dir="ltr">{{ s.email }}</p>
              <div class="flex gap-3 mt-2 text-xs text-navy/70">
                <span>👥 {{ s.members_count }} مخدوم</span>
                <span>📁 {{ s.groups_count }} مجموعة</span>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <div v-else-if="activeTab === 'leaders'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="leaders.length === 0" class="col-span-2 card text-center py-16 text-navy/50">
          مفيش ليدرز
        </div>
        <div v-for="l in leaders" :key="l.id" class="card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gold/10 text-gold text-xl font-bold flex items-center justify-center">
              {{ l.name.charAt(0) }}
            </div>
            <div>
              <h3 class="font-semibold text-navy">{{ l.name }}</h3>
              <p class="text-xs text-navy/60">{{ l.group_name || 'بدون مجموعة' }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'

const tabs = [
  { key: 'servants', label: 'الخدام' },
  { key: 'leaders', label: 'الليدرز' },
]
const activeTab = ref('servants')
const loading = ref(true)
const servants = ref([])
const leaders = ref([])

async function load() {
  loading.value = true
  try {
    const [sRes, lRes] = await Promise.all([
      api.get('/team/servants'),
      api.get('/team/leaders'),
    ])
    servants.value = sRes.data
    leaders.value = lRes.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>