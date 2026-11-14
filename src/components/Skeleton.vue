<template>
  <div
    :class="[
      'animate-pulse rounded-lg bg-navy/5 dark:bg-white/5',
      customClass,
    ]"
    :style="{ width, height }"
  ></div>
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  customClass: { type: String, default: '' },
})
</script>