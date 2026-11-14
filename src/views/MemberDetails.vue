<template>
  <div class="min-h-screen bg-page py-10 px-4" dir="rtl">
    <div class="max-w-3xl mx-auto">
      <div v-if="loading" class="text-center text-navy/50 py-20">جارٍ التحميل...</div>

      <div v-else-if="!member" class="card text-center py-16">
        <p class="text-navy/60 mb-4">المخدوم غير موجود</p>
        <router-link to="/members" class="btn-primary inline-block">العودة للقائمة</router-link>
      </div>

      <div v-else>
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-navy">{{ member.full_name }}</h1>
            <p class="text-sm text-navy/60 mt-1">مسجّل في: {{ formatDate(member.created_at) }}</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <!-- ✅ زرار البطاقة -->
            <router-link
              :to="`/members/${member.id}/card`"
              class="px-4 py-2 rounded-lg bg-gold text-white text-sm font-medium hover:opacity-90 inline-flex items-center gap-1.5"
            >
              🪪 البطاقة
            </router-link>
            <router-link :to="`/members/${member.id}/edit`" class="px-4 py-2 rounded-lg bg-brand text-white text-sm hover:bg-brand/90">تعديل</router-link>
            <router-link to="/members" class="px-4 py-2 rounded-lg border border-border text-navy bg-card hover:bg-navy/5">رجوع</router-link>
          </div>
        </div>

        <section class="card mb-4">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-brand"></span>
            بيانات المخدوم
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label="الاسم رباعي" :value="member.full_name" />
            <Info label="تاريخ الميلاد" :value="formatDate(member.birth_date)" />
            <Info label="النوع" :value="member.gender === 'male' ? 'ذكر' : 'أنثى'" />
            <Info label="الصف الدراسي" :value="member.grade" />
            <Info label="الخادم المسؤول" :value="member.servant_name || '—'" />
            <Info label="المجموعة" :value="member.group_name || '—'" />
            <Info label="رقم هاتف المخدوم" :value="member.member_phone || '—'" dir="ltr" />
            <Info label="العنوان" :value="member.address || '—'" class="md:col-span-2" />
          </div>
        </section>

        <section class="card mb-4">
          <h2 class="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gold"></span>
            بيانات ولي الأمر
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label="اسم ولي الأمر" :value="member.parent_name" />
            <Info label="صلة القرابة" :value="member.relation" />
            <div>
              <p class="text-xs text-navy/50 mb-1">رقم ولي الأمر</p>
              <div class="flex items-center gap-2">
                <span class="font-mono text-navy" dir="ltr">{{ member.parent_phone }}</span>
                <a :href="`https://wa.me/2${member.parent_phone}`" target="_blank" class="text-success text-xs hover:underline">واتساب</a>
              </div>
            </div>
            <Info label="رقم بديل" :value="member.alt_phone || '—'" dir="ltr" />
          </div>
        </section>

        <div v-if="user.role === 'admin'" class="flex justify-end">
          <button @click="remove" class="px-4 py-2 rounded-lg bg-danger/10 text-danger text-sm hover:bg-danger/20">حذف المخدوم</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

const Info = {
  props: ['label', 'value', 'dir'],
  template: `
    <div>
      <p class="text-xs text-navy/50 mb-1">{{ label }}</p>
      <p class="font-medium text-navy" :dir="dir || undefined">{{ value }}</p>
    </div>
  `,
}

const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const member = ref(null)
const loading = ref(true)

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return d }
}

async function load() {
  try {
    const { data } = await api.get(`/members/${route.params.id}`)
    member.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function remove() {
  if (!confirm('متأكد من حذف المخدوم؟')) return
  try {
    await api.delete(`/members/${route.params.id}`)
    router.push('/members')
  } catch (e) {
    alert(e.response?.data?.message || 'فشل الحذف')
  }
}

onMounted(load)
</script>