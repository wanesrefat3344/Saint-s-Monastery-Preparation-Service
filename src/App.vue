<template>
  <div>
    <div v-if="!isLoginPage && !isPublicPage" class="fixed top-3 left-3 z-40">
      <NotificationBell />
    </div>

    <!-- المحتوى — padding-bottom لو في bottom nav -->
    <div :class="showBottomNav ? 'pb-20' : ''">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <OfflineIndicator />

    <!-- Bottom nav — للخادم والمساعد والليدر -->
    <nav
      v-if="showBottomNav"
      class="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border"
    >
      <div class="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-2">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg transition-colors"
          :class="isActive(item.to) ? 'text-brand bg-brand/5' : 'text-navy/60 hover:text-navy'"
        >
          <span class="text-lg leading-none">{{ item.icon }}</span>
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NotificationBell from './components/NotificationBell.vue'
import OfflineIndicator from './components/OfflineIndicator.vue'

const route = useRoute()

const isLoginPage = computed(() => route.name === 'login')
const isPublicPage = computed(() => route.meta?.public === true)
const user = JSON.parse(localStorage.getItem('user') || '{}')

const showBottomNav = computed(() => {
  // أخفي في login والصفحات العامة
  if (isLoginPage.value || isPublicPage.value) return false
  // الأدمن عنده dashboard، الباقي عنده bottom nav
  return user.role && user.role !== 'admin'
})

const navItems = computed(() => [
  { to: '/', label: 'الرئيسية', icon: '🏠' },
  { to: '/my-service', label: 'خدمتي', icon: '👤' },
  { to: '/attendance', label: 'الحضور', icon: '✓' },
  { to: '/followups', label: 'الافتقاد', icon: '📞' },
  { to: '/challenges', label: 'التحديات', icon: '🏆' },
])

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

body {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>