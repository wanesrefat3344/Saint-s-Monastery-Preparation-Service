<template>
  <div class="min-h-screen bg-page py-8 px-4" dir="rtl">
    <div class="max-w-5xl mx-auto">

      <!-- Header with back button -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-start gap-3">
          <button
            type="button"
            @click="goBack"
            class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/30"
            aria-label="رجوع"
            title="رجوع"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-navy">تسجيل الحضور والغياب</h1>
            <p class="text-sm text-navy/60 mt-1">اختر التاريخ والاجتماع ثم حدّد حضور المخدومين</p>
          </div>
        </div>
      </div>

      <!-- Success message -->
      <transition name="fade">
        <div v-if="successMessage" class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </transition>

      <!-- Stats cards -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="card text-center py-4">
          <p class="text-xs text-navy/50 mb-1">حاضر</p>
          <p class="text-2xl font-bold text-success">{{ presentCount }}</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-xs text-navy/50 mb-1">غائب</p>
          <p class="text-2xl font-bold text-danger">{{ absentCount }}</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-xs text-navy/50 mb-1">إجمالي</p>
          <p class="text-2xl font-bold text-navy">{{ members.length }}</p>
        </div>
      </div>

      <!-- Settings -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">التاريخ</label>
            <input v-model="date" type="date" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">نوع الاجتماع</label>
            <select v-model="meetingType" class="input">
              <option value="social">اجتماع عام</option>
              <option value="prep">إعدادي</option>
              <option value="youth">شباب</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="markAll(true)"
              class="flex-1 px-3 py-2.5 rounded-lg border border-success/30 bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              الكل حاضر
            </button>
            <button
              @click="markAll(false)"
              class="flex-1 px-3 py-2.5 rounded-lg border border-danger/30 bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              الكل غائب
            </button>
          </div>
          <div class="flex items-end">
            <button
              @click="showScanner = true"
              class="w-full px-3 py-2.5 rounded-lg bg-navy text-white text-xs font-medium hover:bg-navy/90 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              مسح QR
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-navy text-white">
              <tr>
                <th class="text-right px-4 py-3 font-medium">#</th>
                <th class="text-right px-4 py-3 font-medium">الاسم</th>
                <th class="text-right px-4 py-3 font-medium">الصف</th>
                <th class="text-center px-4 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="loading">
                <td colspan="4" class="px-4 py-10">
                  <div class="flex flex-col items-center gap-3">
                    <svg class="animate-spin w-6 h-6 text-navy/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span class="text-navy/50 text-sm">جارٍ التحميل...</span>
                  </div>
                </td>
              </tr>
              <!-- Empty -->
              <tr v-else-if="members.length === 0">
                <td colspan="4" class="px-4 py-14 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-14 h-14 rounded-full bg-navy/5 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p class="text-navy/60 font-medium">مفيش مخدومين مسجلين</p>
                    <router-link to="/members/new" class="text-brand hover:underline text-sm font-medium">
                      سجّل أول مخدوم →
                    </router-link>
                  </div>
                </td>
              </tr>
              <!-- Rows -->
              <tr
                v-for="(m, i) in members"
                :key="m.id"
                class="border-b border-border last:border-0 hover:bg-page/60 transition-colors duration-150"
              >
                <td class="px-4 py-3 text-navy/50">{{ i + 1 }}</td>
                <td class="px-4 py-3">
                  <router-link :to="`/members/${m.id}`" class="font-medium text-navy hover:text-brand transition-colors">
                    {{ m.full_name }}
                  </router-link>
                </td>
                <td class="px-4 py-3 text-navy/70 text-xs">{{ m.grade }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="toggle(m.id)"
                    class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5 min-w-[80px] justify-center"
                    :class="attendance[m.id]
                      ? 'bg-success/15 text-success hover:bg-success/25'
                      : 'bg-danger/10 text-danger hover:bg-danger/20'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ attendance[m.id] ? 'حاضر' : 'غائب' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Save bar -->
      <div class="sticky bottom-4 mt-6 z-10">
        <div class="bg-card/95 backdrop-blur rounded-xl border border-border shadow-sm p-3 flex items-center justify-between gap-3">
          <p class="text-sm text-navy/60 hidden sm:block">
            حاضر: <span class="text-success font-medium">{{ presentCount }}</span> /
            غائب: <span class="text-danger font-medium">{{ absentCount }}</span>
          </p>
          <button
            @click="save"
            :disabled="saving || members.length === 0"
            class="px-6 py-2.5 rounded-lg bg-success text-white font-medium hover:bg-success/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 ml-auto"
          >
            <svg v-if="saving" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {{ saving ? 'جارٍ الحفظ...' : 'حفظ الحضور' }}
          </button>
        </div>
      </div>
    </div>

    <QRScanner v-if="showScanner" @scanned="onScanned" @close="showScanner = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'
import QRScanner from '../components/QRScanner.vue'

const router = useRouter()

const members = ref([])
const attendance = reactive({})
const date = ref(new Date().toISOString().slice(0, 10))
const meetingType = ref('prep')
const showScanner = ref(false)
const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')

const presentCount = computed(() => Object.values(attendance).filter(Boolean).length)
const absentCount = computed(() => members.value.length - presentCount.value)

function toggle(id) {
  attendance[id] = !attendance[id]
}

function markAll(v) {
  members.value.forEach((m) => (attendance[m.id] = v))
}

function onScanned(memberId) {
  const m = members.value.find((x) => x.id === memberId)
  if (!m) {
    showScanner.value = false
    alert('المخدوم مش موجود في القائمة')
    return
  }
  attendance[memberId] = true
  showScanner.value = false
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/dashboard')
}

async function loadForDate() {
  loading.value = true
  try {
    const membersRes = await api.get('/members')
    members.value = membersRes.data

    const attRes = await api.get('/attendance', {
      params: { date: date.value, meeting_type: meetingType.value },
    })
    const saved = {}
    attRes.data.forEach((a) => { saved[a.member_id] = a.present })

    members.value.forEach((m) => {
      attendance[m.id] = saved[m.id] ?? false
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  successMessage.value = ''
  saving.value = true
  try {
    await api.post('/attendance', {
      date: date.value,
      meeting_type: meetingType.value,
      records: { ...attendance },
    })
    successMessage.value = 'تم حفظ الحضور ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحفظ')
  } finally {
    saving.value = false
  }
}

watch([date, meetingType], loadForDate)
onMounted(loadForDate)
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