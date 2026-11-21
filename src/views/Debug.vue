<template>
  <div style="padding: 20px; direction: rtl;">
    <h1>صفحة فحص البيانات</h1>
    <div v-if="loading">جارٍ التحميل...</div>
    <div v-else-if="error" style="color: red;">خطأ: {{ error }}</div>
    <div v-else>
      <p>عدد الأعضاء المجلوبين: {{ members.length }}</p>
      <pre>{{ JSON.stringify(members.slice(0, 5), null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'

const members = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const { data } = await api.get('/members')
    members.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>
