<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-4xl mx-auto">
      <!-- الهيدر -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-navy">ترشيحات الليدز</h1>
          <p class="text-sm text-navy/60 mt-1">
            {{ pendingNominations.length }} ترشيح بانتظار الموافقة
          </p>
        </div>
        <router-link to="/groups" class="btn-cancel text-sm">رجوع</router-link>
      </div>

      <!-- رسالة نجاح -->
      <div
        v-if="successMessage"
        class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm"
      >
        {{ successMessage }}
      </div>

      <!-- مفيش ترشيحات -->
      <div v-if="pendingNominations.length === 0" class="card text-center py-16">
        <div class="text-4xl mb-3">👑</div>
        <p class="text-navy/60 mb-1">مفيش ترشيحات معلقة</p>
        <p class="text-xs text-navy/40">لما خادم يرشح ليدر لمجموعته، هيظهر هنا</p>
      </div>

      <!-- الترشيحات -->
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
            <p>👤 رشّحه: <strong>{{ n.nominated_by_name }}</strong></p>
            <p class="mt-1">📋 المجموعة: {{ n.member_count }} عضو</p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              @click="reject(n)"
              class="px-4 py-2 rounded-lg bg-danger/10 text-danger text-sm hover:bg-danger/20 transition"
            >
              ✕ رفض
            </button>
            <button
              @click="approve(n)"
              class="px-4 py-2 rounded-lg bg-success text-white text-sm hover:bg-success/90 transition"
            >
              ✓ موافقة
            </button>
          </div>
        </div>
      </div>

      <!-- الليدرز المعتمدين -->
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
              class="text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded"
            >
              إزالة
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DEMO_MODE } from '../config'
import { logActivity } from '../utils/auditLog'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const groups = ref([])
const members = ref([])
const users = ref([])
const successMessage = ref('')

// ترشيحات معلقة
const pendingNominations = computed(() => {
  return groups.value
    .filter((g) => g.leader_pending)
    .map((g) => {
      const member = members.value.find((m) => m.id === g.leader_pending)
      const nominer = users.value.find((u) => u.email === g.leader_nominated_by)
      return {
        group_id: g.id,
        group_name: g.name,
        member_id: g.leader_pending,
        member_name: member?.full_name || 'غير معروف',
        nominated_by_email: g.leader_nominated_by,
        nominated_by_name: nominer?.name || g.leader_nominated_by,
        nominated_at: g.leader_nominated_at,
        member_count: members.value.filter((m) => m.group_id === g.id).length,
      }
    })
    .sort((a, b) => new Date(b.nominated_at) - new Date(a.nominated_at))
})

// ليدرز معتمدين
const approvedLeaders = computed(() => {
  return groups.value
    .filter((g) => g.leader_id)
    .map((g) => {
      const member = members.value.find((m) => m.id === g.leader_id)
      return {
        group_id: g.id,
        group_name: g.name,
        member_id: g.leader_id,
        member_name: member?.full_name || 'غير معروف',
      }
    })
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

function loadData() {
  groups.value = JSON.parse(localStorage.getItem('demo_groups') || '[]')
  members.value = JSON.parse(localStorage.getItem('demo_members') || '[]')
  users.value = JSON.parse(localStorage.getItem('demo_users') || '[]')
}

function saveGroups() {
  localStorage.setItem('demo_groups', JSON.stringify(groups.value))
}

function approve(nomination) {
  if (!confirm(`تعيين "${nomination.member_name}" كليد لـ "${nomination.group_name}"؟`)) return

  const idx = groups.value.findIndex((g) => g.id === nomination.group_id)
  if (idx !== -1) {
    groups.value[idx] = {
      ...groups.value[idx],
      leader_id: nomination.member_id,
      leader_pending: null,
      leader_nominated_by: null,
      leader_nominated_at: null,
      leader_approved_by: user.email,
      leader_approved_at: new Date().toISOString(),
    }
  }
  saveGroups()

  logActivity('group.approve_leader', {
    group: nomination.group_name,
    member: nomination.member_name,
  })

  successMessage.value = `تم تعيين "${nomination.member_name}" كليد لـ "${nomination.group_name}" ✅`
  setTimeout(() => (successMessage.value = ''), 3000)
}

function reject(nomination) {
  if (!confirm(`رفض ترشيح "${nomination.member_name}"؟`)) return

  const idx = groups.value.findIndex((g) => g.id === nomination.group_id)
  if (idx !== -1) {
    groups.value[idx] = {
      ...groups.value[idx],
      leader_pending: null,
      leader_nominated_by: null,
      leader_nominated_at: null,
    }
  }
  saveGroups()

  logActivity('group.reject_leader', {
    group: nomination.group_name,
    member: nomination.member_name,
  })

  successMessage.value = `تم رفض الترشيح ✅`
  setTimeout(() => (successMessage.value = ''), 2500)
}

function removeLeader(leader) {
  if (!confirm(`إزالة "${leader.member_name}" من ليدر "${leader.group_name}"؟`)) return

  const idx = groups.value.findIndex((g) => g.id === leader.group_id)
  if (idx !== -1) {
    groups.value[idx] = {
      ...groups.value[idx],
      leader_id: null,
      leader_approved_by: null,
      leader_approved_at: null,
    }
  }
  saveGroups()

  logActivity('group.remove_leader', {
    group: leader.group_name,
    member: leader.member_name,
  })

  successMessage.value = `تم إزالة "${leader.member_name}" ✅`
  setTimeout(() => (successMessage.value = ''), 2500)
}

onMounted(() => {
  if (DEMO_MODE) loadData()
})
</script>