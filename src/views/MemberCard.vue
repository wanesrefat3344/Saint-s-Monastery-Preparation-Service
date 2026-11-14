<template>
  <div class="min-h-screen bg-page py-8 px-4" dir="rtl">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 print:hidden">
        <div class="flex items-start gap-3">
          <button
            type="button"
            @click="goBack"
            class="mt-1 shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
            aria-label="رجوع"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-navy">بطاقة المخدوم</h1>
            <p class="text-sm text-navy/60 mt-1">جاهزة للطباعة — 4 بطاقات في ورقة A4</p>
          </div>
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            @click="printCard"
            class="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90"
          >
            🖨️ طباعة
          </button>
          <button
            @click="downloadPNG"
            :disabled="downloading"
            class="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-navy/70 hover:text-brand"
          >
            {{ downloading ? '...' : '🖼️ تحميل PNG' }}
          </button>
          <button
            @click="registerAnother"
            class="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm text-white font-medium hover:opacity-90"
          >
            ➕ تسجيل مخدوم تاني
          </button>
          <button
            @click="goBack"
            class="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-navy/70 hover:text-brand"
          >
            رجوع
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-16">
        <div class="animate-spin w-8 h-8 mx-auto text-navy/40 border-2 border-navy/20 border-t-navy rounded-full"></div>
        <p class="mt-4 text-navy/60">جارٍ تحميل البطاقة...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="card text-center py-16">
        <p class="text-danger mb-4">{{ error }}</p>
        <button @click="loadMember" class="btn-primary">إعادة المحاولة</button>
      </div>

      <!-- Success message -->
      <transition name="fade">
        <div
          v-if="successMessage"
          class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm print:hidden"
        >
          {{ successMessage }}
        </div>
      </transition>

      <!-- Print area: 4 cards per A4 -->
      <div v-if="member" id="print-area" class="bg-white p-4 rounded-xl">
        <div class="cards-grid">
          <div
            v-for="n in 4"
            :key="n"
            class="member-card"
          >
            <!-- Header -->
            <div class="card-header">
              <div class="card-logo">
                <span class="logo-icon">✝️</span>
                <div>
                  <p class="logo-title">خدمة إعدادي</p>
                  <p class="logo-sub">دير القديسين بالطود</p>
                </div>
              </div>
              <div class="card-id">#{{ member.id }}</div>
            </div>

            <!-- Divider -->
            <div class="card-divider"></div>

            <!-- Body: QR + Info -->
            <div class="card-body">
              <div class="card-qr">
                <canvas :ref="(el) => setCanvasRef(el, n)" class="qr-canvas"></canvas>
              </div>
              <div class="card-info">
                <p class="info-name">{{ member.full_name }}</p>
                <p class="info-row"><strong>الصف:</strong> {{ member.grade || '—' }}</p>
                <p class="info-row"><strong>ولي الأمر:</strong> {{ member.parent_name || '—' }}</p>
                <p class="info-row"><strong>📞</strong> <span dir="ltr">{{ member.parent_phone || '—' }}</span></p>
              </div>
            </div>

            <!-- Footer -->
            <div class="card-footer">
              🎫 بطاقة مخدوم — احتفظ بها
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-navy/50 text-center mt-4 print:hidden">
        * في الطباعة: 4 نسخ من البطاقة في ورقة A4
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import api from '../api/client'

const route = useRoute()
const router = useRouter()

const member = ref(null)
const loading = ref(true)
const error = ref('')
const downloading = ref(false)
const successMessage = ref('')
const canvasRefs = ref({})

function setCanvasRef(el, n) {
  if (el) canvasRefs.value[n] = el
}

async function loadMember() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/members/${route.params.id}`)
    member.value = data
    await nextTick()
    await generateQRs()
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'فشل تحميل بيانات المخدوم'
  } finally {
    loading.value = false
  }
}

async function generateQRs() {
  for (const n of [1, 2, 3, 4]) {
    const canvas = canvasRefs.value[n]
    if (!canvas) continue
    try {
      await QRCode.toCanvas(canvas, String(member.value.id), {
        width: 120,
        margin: 1,
        color: { dark: '#16324F', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      })
    } catch (e) {
      console.error('QR generation error:', e)
    }
  }
}

function printCard() {
  window.print()
}

async function downloadPNG() {
  downloading.value = true
  try {
    const el = document.querySelector('.member-card')
    if (!el) return
    const canvas = await html2canvas(el, {
      scale: 3,
      backgroundColor: '#FFFFFF',
      useCORS: true,
    })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `بطاقة_${member.value.full_name}_${member.value.id}.png`
    a.click()
    successMessage.value = 'تم تحميل البطاقة كصورة ✅'
    setTimeout(() => (successMessage.value = ''), 2500)
  } catch (e) {
    console.error(e)
    alert('فشل تحميل الصورة')
  } finally {
    downloading.value = false
  }
}

function registerAnother() {
  router.push('/members/new')
}

function goBack() {
  router.push(`/members/${route.params.id}`)
}

onMounted(loadMember)
</script>

<style>
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }

  body * {
    visibility: hidden;
  }

  #print-area,
  #print-area * {
    visibility: visible;
  }

  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  #print-area .cards-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8mm !important;
    page-break-inside: avoid;
    padding: 5mm;
  }

  #print-area .member-card {
    width: 85mm !important;
    height: 54mm !important;
    border: 1px solid #ccc !important;
    border-radius: 3mm !important;
    background: white !important;
    page-break-inside: avoid;
    overflow: hidden;
    box-shadow: none !important;
  }

  #print-area .card-header,
  #print-area .card-body,
  #print-area .card-footer {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 700px;
  margin: 0 auto;
}

.member-card {
  width: 100%;
  aspect-ratio: 85 / 54;
  border: 1.5px solid #D9E2E8;
  border-radius: 6px;
  background: linear-gradient(135deg, #F5F8FA 0%, #FFFFFF 100%);
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  font-family: 'Cairo', system-ui, sans-serif;
}

.member-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #D6A756 0%, #F5E6B8 50%, #D6A756 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-logo {
  display: flex;
  align-items: center;
  gap: 4px;
}

.logo-icon {
  font-size: 14px;
}

.logo-title {
  font-size: 8.5px;
  font-weight: 700;
  color: #16324F;
  line-height: 1.2;
  margin: 0;
}

.logo-sub {
  font-size: 7px;
  color: #5A7386;
  line-height: 1.2;
  margin: 0;
}

.card-id {
  font-size: 9px;
  font-weight: 700;
  color: #D6A756;
  background: rgba(214, 167, 86, 0.1);
  padding: 2px 5px;
  border-radius: 3px;
  direction: ltr;
}

.card-divider {
  height: 1px;
  background: #E5ECF0;
  margin: 3px 0;
}

.card-body {
  display: flex;
  gap: 8px;
  flex: 1;
  align-items: center;
}

.card-qr {
  flex-shrink: 0;
  background: white;
  border: 1px solid #E5ECF0;
  border-radius: 4px;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-canvas {
  display: block;
  width: 42px !important;
  height: 42px !important;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.info-name {
  font-size: 9px;
  font-weight: 700;
  color: #16324F;
  margin: 0 0 2px 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-row {
  font-size: 7px;
  color: #5A7386;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-row strong {
  color: #16324F;
  font-weight: 600;
}

.card-footer {
  font-size: 6.5px;
  color: #8FA0AF;
  text-align: center;
  padding-top: 2px;
  border-top: 1px dashed #E5ECF0;
  margin-top: 3px;
}

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>