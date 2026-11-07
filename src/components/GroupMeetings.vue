<template>
  <section class="card mb-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-navy flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-success"></span>
        مواعيد الاجتماعات
      </h2>
      <button @click="openForm" class="btn-primary text-xs px-3 py-1.5">
        {{ meetings.length > 0 ? 'تعديل' : '+ إضافة موعد' }}
      </button>
    </div>

    <div v-if="showForm" class="bg-page rounded-lg p-4 mb-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">اليوم</label>
          <select v-model="form.day" class="input">
            <option v-for="d in days" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">الوقت</label>
          <input v-model="form.time" type="time" class="input" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">المكان / ملاحظات</label>
          <input v-model.trim="form.location" type="text" class="input" placeholder="مثال: قاعة 2" />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="showForm = false" class="btn-cancel text-xs">إلغاء</button>
        <button @click="saveMeeting" class="btn-success text-xs">حفظ</button>
      </div>
    </div>

    <div v-if="meetings.length === 0 && !showForm" class="text-center text-navy/50 py-6 text-sm">
      مفيش مواعيد محددة لسه
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="m in meetings"
        :key="m.id"
        class="flex items-center justify-between border-b border-border last:border-0 py-2 text-sm"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">📅</span>
          <div>
            <p class="font-medium text-navy">{{ dayLabel(m.day) }} — {{ m.time }}</p>
            <p v-if="m.location" class="text-xs text-navy/60">{{ m.location }}</p>
          </div>
        </div>
        <button
          @click="removeMeeting(m.id)"
          class="text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded"
        >
          حذف
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { DEMO_MODE } from '../config'
import { logActivity } from '../utils/auditLog'

const props = defineProps({
  groupId: { type: Number, required: true },
})

const meetings = ref([])
const showForm = ref(false)
const form = reactive({ day: 'sunday', time: '18:00', location: '' })

const days = [
  { value: 'sunday', label: 'الأحد' },
  { value: 'monday', label: 'الاثنين' },
  { value: 'tuesday', label: 'الثلاثاء' },
  { value: 'wednesday', label: 'الأربعاء' },
  { value: 'thursday', label: 'الخميس' },
  { value: 'friday', label: 'الجمعة' },
  { value: 'saturday', label: 'السبت' },
]

function dayLabel(v) {
  return days.find((d) => d.value === v)?.label || v
}

function saveDemo() {
  const all = JSON.parse(localStorage.getItem('demo_group_meetings') || '{}')
  all[props.groupId] = meetings.value
  localStorage.setItem('demo_group_meetings', JSON.stringify(all))
}

function loadDemo() {
  const all = JSON.parse(localStorage.getItem('demo_group_meetings') || '{}')
  meetings.value = all[props.groupId] || []
}

function openForm() {
  if (meetings.value.length > 0) {
    const m = meetings.value[0]
    Object.assign(form, { day: m.day, time: m.time, location: m.location || '' })
  } else {
    Object.assign(form, { day: 'sunday', time: '18:00', location: '' })
  }
  showForm.value = true
}

function saveMeeting() {
  if (meetings.value.length > 0) {
    meetings.value[0] = { ...meetings.value[0], ...form }
  } else {
    meetings.value.push({
      id: Date.now(),
      ...form,
      created_at: new Date().toISOString(),
    })
  }
  saveDemo()
  logActivity('group_meeting.save', { group_id: props.groupId })
  showForm.value = false
}

function removeMeeting(id) {
  if (!confirm('حذف الموعد؟')) return
  meetings.value = meetings.value.filter((m) => m.id !== id)
  saveDemo()
}

onMounted(() => {
  if (DEMO_MODE) loadDemo()
})
</script>