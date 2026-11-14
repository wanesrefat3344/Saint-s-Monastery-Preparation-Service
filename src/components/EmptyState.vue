<template>
  <div class="flex flex-col items-center justify-center py-14 px-4 text-center">
    <div
      class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
      :class="iconBg"
    >
      <span class="text-3xl">{{ icon }}</span>
    </div>
    <h3 class="text-base font-semibold text-navy dark:text-slate-100 mb-1">
      {{ title }}
    </h3>
    <p v-if="description" class="text-sm text-navy/60 dark:text-slate-400 max-w-sm mb-5">
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="flex gap-2 flex-wrap justify-center">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tone: { type: String, default: 'navy' }, // navy, success, danger, gold, brand
})

const iconBg = computed(() => ({
  navy: 'bg-navy/5 dark:bg-white/5',
  success: 'bg-success/10',
  danger: 'bg-danger/10',
  gold: 'bg-gold/10',
  brand: 'bg-brand/10',
}[props.tone] || 'bg-navy/5 dark:bg-white/5'))
</script>