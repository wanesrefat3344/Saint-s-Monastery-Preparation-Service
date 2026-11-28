<template>
  <div
    v-if="m.isToday"
    class="group flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3 sm:p-4 hover:border-brand/50 hover:shadow-md transition-all motion-reduce:hover:translate-y-0 transition-colors"
    :class="{ 'bg-gold/20 ring-2 ring-gold/50': m.isToday }"
  >
    <!-- Avatar with first letter -->
    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold" :class="m.isToday ? 'bg-gold/20 text-gold' : 'bg-brand/10 text-brand'">
      {{ nameOf(m).charAt(0) }}
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1 flex flex-col sm:flex-row gap-2">
      <p class="text-sm font-semibold text-navy sm:text-base truncate">{{ nameOf(m) }}</p>

      <!-- Birthday badge -->
      <span
        v-if="m.isToday"
        class="inline-flex items-center gap-1 rounded bg-gold/20 text-gold text-xs font-medium px-2.5 py-0.5 whitespace-nowrap"
      >
        🎂 {{ m.formattedDate }}
      </span>
      <span
        v-else-if="m.isPast"
        class="inline-flex items-center gap-1 rounded bg-navy/10 text-navy/50 text-xs font-medium px-2.5 py-0.5 whitespace-nowrap"
        >
          فات ({{ m.formattedDate }})
        </span>
      <span
        v-else
        class="inline-flex items-center gap-1 rounded bg-brand/10 text-brand text-xs font-medium px-2.5 py-0.5 whitespace-nowrap"
        >
          {{ m.formattedDate }}
        </span>

      <!-- Age + Group + Days Remaining -->
      <p class="text-xs text-navy/50 mt-0.5 sm:mt-0 flex items-center gap-2 flex-wrap">
        <span>العمر: <strong>{{ m.turningAge }}</strong> سنة</span>
        <span v-if="m.daysUntil !== null" class="bg-brand/10 text-brand px-1.5 py-0.5 rounded text-[10px] font-medium">{{ m.daysUntil }} يوم</span>
        <span v-else class="text-navy/40 text-[10px]">بدون مجموعة</span>
      </p>
    </div>

    <!-- WhatsApp button (mobile: icon-only) -->
    <div class="flex items-center gap-2 sm:hidden">
      <WhatsAppButton
        :phone="phoneOf(m)"
        :member-name="nameOf(m)"
       :parent-name="m.parent_name || ''"
        />
    </div>

    <!-- Today indicator dot -->
    <div
      v-if="m.isToday"
      class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold text-white"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import WhatsAppButton from './WhatsAppButton.vue'

const props = defineProps({
  m: { type: Object, required: true }
})

const nameOf = (m) => m.name || m.full_name || 'بدون اسم'
const phoneOf = (m) => m.parent_phone || m.member_phone || m.phone || m.mobile || ''
</script>