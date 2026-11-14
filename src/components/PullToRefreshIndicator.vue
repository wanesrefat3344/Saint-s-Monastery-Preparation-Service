<template>
  <div
    v-if="isPulling || isRefreshing"
    class="fixed top-0 inset-x-0 z-30 flex items-center justify-center pt-3 pointer-events-none"
    :style="{ transform: `translateY(${Math.max(0, pullDistance - 20)}px)` }"
  >
    <div
      class="flex items-center gap-2 px-4 py-2 rounded-full bg-card dark:bg-slate-800 shadow-lg border border-border text-sm"
      :class="isRefreshing ? 'text-brand' : 'text-navy/60'"
    >
      <svg
        v-if="isRefreshing"
        class="animate-spin w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <svg
        v-else
        class="w-4 h-4 transition-transform"
        :style="{ transform: `rotate(${Math.min(180, pullDistance * 2)}deg)` }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
      <span>{{ isRefreshing ? 'جارٍ التحديث...' : (pullDistance >= threshold ? 'اترك للتحديث' : 'اسحب للتحديث') }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pullDistance: { type: Number, default: 0 },
  isPulling: { type: Boolean, default: false },
  isRefreshing: { type: Boolean, default: false },
  threshold: { type: Number, default: 80 },
})
</script>