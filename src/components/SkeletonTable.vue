<template>
  <div class="card overflow-hidden p-0">
    <!-- Header -->
    <div class="bg-navy/5 dark:bg-white/5 px-4 py-3 flex gap-4">
      <div v-for="i in columns" :key="i" class="h-4 rounded bg-navy/10 dark:bg-white/10 flex-1 animate-pulse"></div>
    </div>
    <!-- Rows -->
    <div
      v-for="i in rows"
      :key="i"
      class="px-4 py-4 border-b border-border last:border-0 flex gap-4"
    >
      <div v-for="j in columns" :key="j" class="h-4 rounded bg-navy/5 dark:bg-white/5 flex-1 animate-pulse"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 5 },
  columns: { type: Number, default: 4 },
})
</script>