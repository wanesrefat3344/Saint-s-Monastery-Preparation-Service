<template>
  <div class="text-center">
    <div v-if="loading" class="text-navy/50 py-6 text-sm">جارٍ التوليد...</div>
    <div v-else class="inline-block p-3 bg-white rounded-xl border border-border">
      <canvas ref="canvasRef"></canvas>
    </div>
    <p class="text-xs text-navy/60 mt-3">
      امسح الكود ده في صفحة الحضور
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  memberId: { type: Number, required: true },
  size: { type: Number, default: 200 },
})

const canvasRef = ref(null)
const loading = ref(true)

async function generate() {
  if (!canvasRef.value) return
  loading.value = true
  try {
    await QRCode.toCanvas(canvasRef.value, String(props.memberId), {
      width: props.size,
      margin: 2,
      color: { dark: '#16324F', light: '#FFFFFF' },
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(generate)
watch(() => props.memberId, generate)
</script>