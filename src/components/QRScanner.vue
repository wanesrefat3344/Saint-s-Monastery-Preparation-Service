<template>
  <div class="fixed inset-0 bg-navy/60 flex items-center justify-center z-50 px-4">
    <div class="bg-card rounded-xl shadow-lg w-full max-w-md p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-navy">
          مسح QR المخدوم
          <span v-if="scanCount > 0" class="text-xs text-success mr-2">({{ scanCount }} تم)</span>
        </h3>
        <button @click="close" class="text-danger text-sm hover:underline">إغلاق ✕</button>
      </div>

      <div id="qr-reader" class="w-full rounded-lg overflow-hidden bg-black"></div>

      <p v-if="error" class="text-danger text-xs mt-3 text-center">{{ error }}</p>
      <p v-else class="text-navy/60 text-xs mt-3 text-center">
        وجّه الكاميرا ناحية كود المخدوم — الكاميرا هتفضل مفتوحة
      </p>

      <!-- آخر اللي اتسجل -->
      <div v-if="lastScanned" class="mt-3 rounded-lg bg-success/10 border border-success/30 p-2 text-xs text-success text-center">
        ✅ تم تسجيل <strong>{{ lastScanned }}</strong> حاضر
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const emit = defineEmits(['scanned', 'close'])
const error = ref('')
const scanCount = ref(0)
const lastScanned = ref('')
let scanner = null

async function start() {
  try {
    scanner = new Html5Qrcode('qr-reader')
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        const id = Number(decodedText)
        if (!isNaN(id)) {
          emit('scanned', id)
          scanCount.value++
          lastScanned.value = id
          // ✅ ما نوقفش الكاميرا — تفضل شغالة
        }
      },
      () => {}
    )
  } catch (e) {
    error.value = 'مش قادر أفتح الكاميرا. تأكد من الصلاحيات.'
  }
}

async function stop() {
  if (scanner) {
    try { await scanner.stop(); await scanner.clear() } catch {}
    scanner = null
  }
}

function close() {
  stop()
  emit('close')
}

onMounted(start)
onBeforeUnmount(stop)
</script>