<template>
  <div class="min-h-screen bg-page flex items-center justify-center px-4" dir="rtl">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img
          src="./WhatsApp Image 2026-11-07 at 5.41.05 PM.jpeg"
          alt="خدمة إعدادي"
          class="w-16 h-16 rounded-full mx-auto mb-3 object-contain bg-white p-1"
        />
        <h1 class="text-2xl font-bold text-navy">خدمة إعدادي دير القديسين بالطود</h1>
        <p class="text-sm text-navy/60 mt-1">سجّل دخولك للمتابعة</p>
      </div>

      <form @submit.prevent="submit" class="card space-y-4">
        <div v-if="error" class="rounded-lg bg-danger/10 border border-danger text-danger px-3 py-2 text-sm">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-navy">البريد الإلكتروني</label>
          <input v-model.trim="email" type="email" class="input" placeholder="admin@test.com" dir="ltr" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-navy">كلمة المرور</label>
          <input v-model="password" type="password" class="input" placeholder="••••••••" dir="ltr" />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'جارٍ الدخول...' : 'تسجيل الدخول' }}
        </button>

        <div class="text-center text-xs text-navy/40 pt-2">
          أو
          <router-link to="/readings" class="text-brand hover:underline">
            تصفح القراءات بدون تسجيل دخول →
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/client'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'أدخل البريد وكلمة المرور'
    return
  }

  loading.value = true

  try {
    const { data } = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    if (data.user?.role === 'reader') {
      router.push({ name: 'reading-new' })
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'بيانات الدخول غير صحيحة'
  } finally {
    loading.value = false
  }
}
</script>