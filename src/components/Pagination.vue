<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
    <button
      @click="$emit('prev')"
      :disabled="currentPage === 1"
      class="p-2 rounded-lg border border-border bg-card hover:bg-page disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      aria-label="السابق"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div class="flex items-center gap-1">
      <button
        v-for="p in visiblePages"
        :key="p"
        @click="$emit('go', p)"
        class="min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors"
        :class="p === currentPage
          ? 'bg-brand text-white'
          : 'bg-card border border-border text-navy hover:bg-page'"
      >
        {{ p }}
      </button>
    </div>

    <button
      @click="$emit('next')"
      :disabled="currentPage === totalPages"
      class="p-2 rounded-lg border border-border bg-card hover:bg-page disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      aria-label="التالي"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

defineEmits(['prev', 'next', 'go'])

const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages.filter((p) => p === '...' || typeof p === 'number')
})
</script>