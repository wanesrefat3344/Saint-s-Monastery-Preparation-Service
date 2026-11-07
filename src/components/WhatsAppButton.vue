<template>
  <div class="relative inline-block">
    <button
      @click="open = !open"
      class="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition flex items-center gap-1"
    >
      💬 واتساب
    </button>

    <div
      v-if="open"
      class="absolute left-0 mt-2 w-64 bg-card rounded-xl shadow-lg border border-border z-50"
      dir="rtl"
    >
      <div class="p-2 border-b border-border">
        <p class="text-xs text-navy/50 px-2 py-1">اختر نوع الرسالة:</p>
      </div>
      <ul class="py-1">
        <li v-for="t in templates" :key="t.key">
          <button
            @click="send(t)"
            class="w-full text-right px-3 py-2 text-sm hover:bg-page transition flex items-center gap-2"
          >
            <span>{{ t.icon }}</span>
            <span>{{ t.label }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div v-if="open" @click="open = false" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  phone: { type: String, required: true },
  memberName: { type: String, default: '' },
  parentName: { type: String, default: '' },
})

const open = ref(false)

const templates = [
  {
    key: 'greeting',
    icon: '👋',
    label: 'ترحيب',
    text: () => `أهلاً ${props.parentName}، بنرحب بـ ${props.memberName} في خدمة إعدادي. ربنا يبارك حياتكم.`,
  },
  {
    key: 'absence',
    icon: '📞',
    label: 'افتقاد (غياب)',
    text: () => `أهلاً ${props.parentName}، افتقدنا ${props.memberName} في الاجتماع الأخير. ربنا يباركك، نتمنى نشوفه الاجتماع الجاي.`,
  },
  {
    key: 'birthday',
    icon: '🎂',
    label: 'تهنئة عيد ميلاد',
    text: () => `كل سنة و${props.memberName} طيب! 🎂 أسرة خدمة إعدادي بتتمنى لكم سنة مليانة بركة.`,
  },
  {
    key: 'followup',
    icon: '💬',
    label: 'متابعة عامة',
    text: () => `أهلاً ${props.parentName}، بنطمن على ${props.memberName}. لو محتاجين أي حاجة، إحنا في الخدمة.`,
  },
]

function send(t) {
  const phone = props.phone.replace(/^0/, '20').replace(/\D/g, '')
  const msg = encodeURIComponent(t.text())
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  open.value = false
}
</script>