<template>
  <div
    v-if="!isOnline"
    class="fixed bottom-4 left-4 z-50 bg-danger text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2"
  >
    <span class="text-lg">📡</span>
    <span>مفيش اتصال بالإنترنت — البيانات بتتخزن محلياً</span>
  </div>
  <div
    v-else-if="showOnline"
    class="fixed bottom-4 left-4 z-50 bg-success text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2"
  >
    <span class="text-lg">✓</span>
    <span>رجع الاتصال بالإنترنت</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isOnline = ref(navigator.onLine)
const showOnline = ref(false)
let timer = null

function handleOnline() {
  isOnline.value = true
  showOnline.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (showOnline.value = false), 3000)
}

function handleOffline() {
  isOnline.value = false
  showOnline.value = false
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  clearTimeout(timer)
})
</script>