<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy">ترشيحات الليدز</h1>
          <p class="text-sm text-navy/60 mt-1">
            {{ pendingNominations.length }} ترشيح بانتظار الموافقة
          </p>
        </div>
        <router-link to="/groups" class="btn-cancel text-sm">رجوع</router-link>
      </div>

      <div
        v-if="successMessage"
        class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm"
      >
        {{ successMessage }}
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="card animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-navy/5"></div>
            <div class="space-y-2">
              <div class="h-5 w-48 rounded bg-navy/5"></div>
              <div class="h-4 w-64 rounded bg-navy/5"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="pendingNominations.length === 0" class="card text-center py-16">
        <div class="text-4xl mb-3">👑</div>
        <p class="text-navy/60 mb-1">مفيش ترشيحات معلقة</p>
        <p class="text-xs text-navy/40">لما خادم يرشح ليدر لمجموعته، هيظهر هنا</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="n in pendingNominations"
          :key="n.group_id"
          class="card"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center text-xl">
                👑
              </div>
              <div>
                <h2 class="font-semibold text-navy">
                  {{ n.group_name }}
                </h2>
                <p class="text-sm text-navy/60 mt-0.5">
                  ترشيح: <strong class="text-navy">{{ n.member_name }}</strong>
                </p>
              </div>
            </div>
            <span class="text-xs text-navy/50">
              {{ formatDate(n.nominated_at) }}
            </span>
          </div>

          <div class="bg-page/50 rounded-lg p-3 mb-3 text-sm text-navy/70">
            <p>👤 رشّحه: <strong class="text-navy">{{ n.nominated_by_name }}</strong></p>
            <p class="mt-1">📋 المجموعة: {{ n.member_count }} عضو</p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              @click="reject(n)"
              :disabled="processing === n.group_id"
              class="px-4 py-2 rounded-lg bg-danger/10 text-danger text-sm hover:bg-danger/20 transition disabled:opacity-50"
            >
              <span v-if="processing === n.group_id" class="flex items-center gap-1">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                جارٍ الرفض...
              </span>
              <span v-else>✕ رفض</span>
            </button>
            <button
              @click="approve(n)"
              :disabled="processing === n.group_id"
              class="px-4 py-2 rounded-lg bg-success text-white text-sm hover:bg-success/90 transition disabled:opacity-50"
            >
              <span v-if="processing === n.group_id" class="flex items-center gap-1">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                جارٍ الموافقة...
              </span>
              <span v-else>✓ موافقة</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card mt-6" v-if="approvedLeaders.length > 0">
        <h2 class="text-lg font-semibold text-navy mb-3">👑 ليدرز معتمدين</h2>
        <ul class="space-y-2">
          <li
            v-for="l in approvedLeaders"
            :key="l.group_id"
            class="flex items-center justify-between border-b border-border last:border-0 py-2 text-sm"
          >
            <div class="flex items-center gap-2">
              <span class="text-gold">👑</span>
              <router-link :to="`/groups/${l.group_id}`" class="text-navy hover:text-brand font-medium">
                {{ l.group_name }}
              </router-link>
              <span class="text-navy/60">— {{ l.member_name }}</span>
            </div>
            <button
              @click="removeLeader(l)"
              :disabled="processing === l.group_id"
              class="text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded disabled:opacity-50"
            >
              <span v-if="processing === l.group_id">جارٍ الإزالة...</span>
              <span v-else>إزالة</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/client'
import { logActivity } from '../utils/auditLog'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const loading = ref(true)
const processing = ref(null)
const successMessage = ref('')
const errorMessage = ref('')

// We'll fetch groups with leader info from the backend
const groups = ref([])

const pendingNominations = computed(() => {
  return groups.value
    .filter((g) => g.leader_pending)
    .map((g) => ({
      group_id: g.id,
      group_name: g.name,
      member_id: g.leader_pending,
      member_name: g.leader_pending_name || 'غير معروف',
      nominated_by_name: g.leader_nominated_by_name || g.leader_nominated_by || 'غير معروف',
      nominated_at: g.leader_nominated_at,
      member_count: g.member_count || 0,
    }))
    .sort((a, b) => new Date(b.nominated_at) - new Date(a.nominated_at))
})

const approvedLeaders = computed(() => {
  return groups.value
    .filter((g) => g.leader_id)
    .map((g) => ({
      group_id: g.id,
      group_name: g.name,
      member_id: g.leader_id,
      member_name: g.leader_name || 'غير معروف',
    }))
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    // Fetch groups with leader info - we need an endpoint that includes leader_pending, leader_id, etc.
    // Based on the audit, the backend's GET /groups should include these fields
    const { data } = await api.get('/groups')
    groups.value = data
  } catch (e) {
    console.error('Failed to load leader nominations:', e)
    errorMessage.value = e.response?.data?.message || 'فشل تحميل الترشيحات، تأكد من الاتصال بالإنترنت وحاول تاني'
  } finally {
    loading.value = false
  }
}

function showSuccess(text) {
  successMessage.value = text
  setTimeout(() => (successMessage.value = ''), 3000)
}

async function approve(nomination) {
  if (!confirm(`تعيين "${nomination.member_name}" كليد لـ "${nomination.group_name}"؟`)) return

  processing.value = nomination.group_id
  try {
    // PATCH /groups/:id/approve-leader
    await api.patch(`/groups/${nomination.group_id}/approve-leader`)

    logActivity('group.approve_leader', {
      group: nomination.group_name,
      member: nomination.member_name,
    })

    showSuccess(`تم تعيين "${nomination.member_name}" كليد لـ "${nomination.group_name}" ✅`)
    await loadData()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || 'فشلت الموافقة، حاول تاني')
  } finally {
    processing.value = null
  }
}

async function reject(nomination) {
  if (!confirm(`رفض ترشيح "${nomination.member_name}"؟`)) return

  processing.value = nomination.group_id
  try {
    // PATCH /groups/:id/reject-leader
    await api.patch(`/groups/${nomination.group_id}/reject-leader`)

    logActivity('group.reject_leader', {
      group: nomination.group_name,
      member: nomination.member_name,
    })

    showSuccess(`تم رفض الترشيح ✅`)
    await loadData()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || 'فشل الرفض، حاول تاني')
  } finally {
    processing.value = null
  }
}

async function removeLeader(leader) {
  if (!confirm(`إزالة "${leader.member_name}" من ليدر "${leader.group_name}"؟`)) return

  processing.value = leader.group_id
  try {
    // DELETE /groups/:id/leader
    await api.delete(`/groups/${leader.group_id}/leader`)

    logActivity('group.remove_leader', {
      group: leader.group_name,
      member: leader.member_name,
    })

    showSuccess(`تم إزالة "${leader.member_name}" ✅`)
    await loadData()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || 'فشلت الإزالة، حاول تاني')
  } finally {
    processing.value = null
  }
}

onMounted(loadData)
</script>