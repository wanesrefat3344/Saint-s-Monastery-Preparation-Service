<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div class="flex items-start gap-3">
      <div class="flex items-center gap-2">
        <button
          v-if="showBack"
          type="button"
          @click="goBack"
          class="shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
          aria-label="رجوع"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <router-link
          v-if="showHome"
          to="/"
          class="shrink-0 w-10 h-10 rounded-full bg-card border border-border text-navy flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
          aria-label="الرئيسية"
        >
          🏠
        </router-link>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-navy">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-navy/60 mt-1">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2 self-start sm:self-auto">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  showHome: { type: Boolean, default: false }, // إضافة الخاصية الجديدة
  backRoute: { type: [String, Object], default: null }
})

const router = useRouter()

function goBack() {
  if (router.options.history.state.back) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
