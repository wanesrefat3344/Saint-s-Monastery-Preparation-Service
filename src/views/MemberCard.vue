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

      <!-- Success -->
      <transition name="fade">
        <div
          v-if="successMessage"
          class="mb-4 rounded-lg bg-success/10 border border-success text-success px-4 py-3 text-sm print:hidden"
        >
          {{ successMessage }}
        </div>
      </transition>

      <!--
        كارت واحد بتصميم واحد:
        - على الشاشة بيظهر أول كارت بس (معاينة)
        - في الطباعة بيظهروا 4 كروت 85×54 مم
      -->
      <div v-if="member" id="print-area">
        <p class="text-xs text-navy/50 mb-3 text-center print:hidden">معاينة البطاقة</p>

        <div class="cards-grid">
          <div v-for="n in 4" :key="n" class="member-card">
            <!-- العلامة المائية (لوجو الخدمة باهت) -->
            <img :src="watermarkLogo" alt="" class="card-watermark" />

            <!-- الهيدر -->
            <div class="card-header">
              <div class="card-logo">
                <div class="logo-badge">
                  <img :src="logo" alt="لوجو الخدمة" />
                </div>
                <div>
                  <p class="logo-title">خدمة إعدادي</p>
                  <p class="logo-sub">دير القديسين بالطود</p>
                </div>
              </div>
              <div class="card-id">#{{ member.id }}</div>
            </div>

            <!-- المحتوى -->
            <div class="card-body">
              <div class="card-qr">
                <canvas :ref="(el) => setQrRef(el, n)" class="qr-canvas"></canvas>
              </div>

              <div class="card-info">
                <p class="info-name">{{ member.full_name }}</p>

                <div class="chips">
                  <span class="chip chip-gold">📚 {{ member.grade || '—' }}</span>
                  <span v-if="member.group_name" class="chip chip-blue">👥 {{ member.group_name }}</span>
                </div>

                <div v-if="member.servant_name" class="info-row">
                  <span class="info-icon">👤</span>
                  <span>{{ member.servant_name }}</span>
                </div>

                <div v-if="member.address" class="info-row">
                  <span class="info-icon">📍</span>
                  <span>{{ member.address }}</span>
                </div>
              </div>
            </div>

            <!-- ولي الأمر -->
            <div class="card-parent">
              <span class="info-icon">👨‍👩‍👦</span>
              <span>{{ member.parent_name || '—' }}</span>
              <span class="dot">•</span>
              <span dir="ltr">{{ member.parent_phone || '—' }}</span>
            </div>

            <div class="card-footer">🎫 بطاقة مخدوم — احتفظ بها</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import api from '../api/client'

// لوجو الكارت (فوق) + العلامة المائية الباهتة
import logo from '../assets/logo.jpeg'
import watermarkLogo from '../assets/logo.jpeg'

const route = useRoute()
const router = useRouter()

const member = ref(null)
const loading = ref(true)
const error = ref('')
const downloading = ref(false)
const successMessage = ref('')
const qrCanvases = ref({})

function setQrRef(el, n) {
  if (el) qrCanvases.value[n] = el
}

async function loadMember() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/members/${route.params.id}`)
    member.value = data
    loading.value = false
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
  const qrOptions = {
    width: 300,
    margin: 1,
    color: { dark: '#16324F', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  }
  for (const n of [1, 2, 3, 4]) {
    const canvas = qrCanvases.value[n]
    if (!canvas) continue
    try {
      await QRCode.toCanvas(canvas, String(member.value.id), qrOptions)
    } catch (e) {
      console.error('QR error:', e)
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
    // استنى الخط والصور يحمّلوا قبل التصوير
    if (document.fonts?.ready) await document.fonts.ready
    const canvas = await html2canvas(el, {
      scale: 4,
      backgroundColor: '#FFFFFF',
      useCORS: true,
      logging: false,
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
/*
  كل المقاسات داخل الكارت بوحدة em،
  فالكارت بيتكبر ويصغر بتغيير font-size بس:
  - الشاشة: 16px  → عرض 400px
  - الطباعة: 3.4mm → عرض 85mm بالظبط
*/
:root {
  --c-navy: #16324f;
  --c-sea: #2b6a8a;
  --c-gold: #d6a756;
  --c-gold-soft: #fbf3e2;
  --c-sky: #eaf3f8;
  --c-text: #3d5a6e;
  --c-muted: #8fa0af;
}

.cards-grid {
  display: flex;
  justify-content: center;
}

.member-card {
  position: relative;
  overflow: hidden;
  font-size: 16px;
  width: 25em;
  max-width: 100%;
  height: 15.9em;
  background: #fff;
  border-radius: 0.9em;
  border: 1px solid #dfe8ee;
  box-shadow: 0 0.5em 1.6em rgba(22, 50, 79, 0.14);
  font-family: 'Cairo', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* على الشاشة: معاينة كارت واحد بس */
.member-card:not(:first-child) {
  display: none;
}

/* العلامة المائية */
.card-watermark {
  position: absolute;
  top: 3.3em;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: calc(100% - 3.3em);
  width: auto;
  max-width: 80%;
  object-fit: contain;
  opacity: 0.08;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

/* الهيدر */
.card-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.3em;
  padding: 0 1em;
  color: #fff;
  background: linear-gradient(115deg, var(--c-navy) 0%, var(--c-sea) 100%);
  border-bottom: 0.2em solid var(--c-gold);
  flex-shrink: 0;
}

.card-logo {
  display: flex;
  align-items: center;
  gap: 0.6em;
}

.logo-badge {
  width: 2.3em;
  height: 2.3em;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.15em;
  box-shadow: 0 0 0 0.12em rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.logo-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.logo-title {
  margin: 0;
  font-size: 0.95em;
  font-weight: 700;
  line-height: 1.6;
}

.logo-sub {
  margin: 0;
  font-size: 0.6em;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
}

.card-id {
  direction: ltr;
  font-size: 0.8em;
  font-weight: 700;
  color: var(--c-navy);
  background: var(--c-gold);
  padding: 0.15em 0.8em;
  line-height: 1.7;
  border-radius: 99em;
}

/* المحتوى */
.card-body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  gap: 0.9em;
  padding: 0.5em 1em 0.3em;
}

.card-qr {
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e3ebf0;
  border-radius: 0.6em;
  padding: 0.3em;
  box-shadow: 0 0.15em 0.5em rgba(22, 50, 79, 0.08);
}

.qr-canvas {
  display: block;
  width: 5.4em !important;
  height: 5.4em !important;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}

.info-name {
  margin: 0;
  font-size: 1.05em;
  font-weight: 700;
  color: var(--c-navy);
  line-height: 1.6;
  white-space: normal;
  word-break: break-word;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3em;
}

.chip {
  font-size: 0.6em;
  font-weight: 600;
  padding: 0.1em 0.7em;
  line-height: 1.7;
  border-radius: 99em;
  white-space: nowrap;
}

.chip-gold {
  background: var(--c-gold-soft);
  color: #8a6420;
}

.chip-blue {
  background: var(--c-sky);
  color: var(--c-sea);
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.6em;
  color: var(--c-text);
  line-height: 1.7;
  white-space: normal;
}

.info-icon {
  flex-shrink: 0;
  font-size: 1em;
}

/* ولي الأمر */
.card-parent {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin: 0 1em;
  padding: 0.3em 0.8em;
  font-size: 0.62em;
  line-height: 1.8;
  color: var(--c-text);
  background: rgba(234, 243, 248, 0.85);
  border-radius: 0.6em;
  flex-wrap: wrap;
}

.card-parent .dot {
  color: var(--c-gold);
}

.card-footer {
  position: relative;
  z-index: 1;
  padding: 0.35em 0 0.45em;
  line-height: 1.8;
  font-size: 0.5em;
  text-align: center;
  color: var(--c-muted);
}

/* ===== Print ===== */
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
    background: white;
  }

  .cards-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 85mm);
    justify-content: center;
    gap: 8mm;
    padding: 5mm 0;
  }

  .member-card,
  .member-card:not(:first-child) {
    display: flex !important;
    font-size: 3.4mm; /* 25em = 85mm */
    width: 85mm;
    height: 54mm;
    box-shadow: none;
    border: 0.2mm dashed #b8c4cc;
    border-radius: 3mm;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .print\:hidden {
    display: none !important;
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