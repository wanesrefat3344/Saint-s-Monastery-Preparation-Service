<template>
  <div>
    <!-- جرس الإشعارات (بيظهر في كل الصفحات ما عدا Login) -->
    <div
      v-if="!isLoginPage"
      class="fixed top-3 left-3 z-40"
    >
      <NotificationBell />
    </div>

    <router-view />
    <OfflineIndicator />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NotificationBell from './components/NotificationBell.vue'
import OfflineIndicator from './components/OfflineIndicator.vue'

const route = useRoute()
const isLoginPage = computed(() => route.name === 'login')
</script>