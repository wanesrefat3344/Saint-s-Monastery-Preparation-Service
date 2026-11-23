<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-28 lg:pb-12">

      <!-- الشريط العلوي -->
      <div class="flex items-center justify-between gap-3 mb-5">
        <p class="text-sm text-navy/60">{{ todayLabel }}</p>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            @click="logout"
            class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-navy/70 hover:text-danger hover:border-danger/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            aria-label="تسجيل الخروج"
          >
            <Icon name="logout" class="w-4 h-4" />
            <span class="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>

      <!-- التحميل -->
      <div v-if="loading" class="space-y-4 animate-pulse motion-reduce:animate-none">
        <div class="h-64 rounded-[28px] bg-navy/5"></div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="n in 4" :key="n" class="h-24 rounded-2xl bg-navy/5"></div>
        </div>
        <div class="h-56 rounded-3xl bg-navy/5"></div>
      </div>

      <!-- خطأ -->
      <div v-else-if="error" class="rounded-3xl border border-danger/30 bg-danger/5 p-10 text-center">
        <div class="mx-auto mb-4 w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center">
          <Icon name="alert" class="w-7 h-7" />
        </div>
        <p class="text-navy font-bold mb-1">مقدرناش نحمّل البيانات</p>
        <p class="text-sm text-navy/60 mb-5">اتأكد من الاتصال بالنت وجرّب تاني.</p>
        <button @click="loadData" class="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
          إعادة المحاولة
        </button>
      </div>

      <!-- تعذر تحميل الإحصائيات -->
      <div v-else-if="statsError" class="rounded-3xl border border-danger/30 bg-danger/5 p-10 text-center">
        <div class="mx-auto mb-4 w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center">
          <Icon name="alert" class="w-7 h-7" />
        </div>
        <p class="text-navy font-bold mb-1">تعذر تحميل الإحصائيات</p>
        <p class="text-sm text-navy/60 mb-5">لا يمكن تحميل بيانات الصحة والإحصائيات</p>
        <button @click="loadData" class="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
          إعادة المحاولة
        </button>
      </div>

      <!-- المحتوى -->
      <div v-else>

        <!-- الهيرو -->
        <section class="relative overflow-hidden rounded-[28px] bg-brand text-white p-6 sm:p-9 mb-4 shadow-lg">
          <!-- زخرفة -->
          <div class="pointer-events-none absolute -top-24 -start-16 w-72 h-72 rounded-full bg-white/[0.07]"></div>
          <div class="pointer-events-none absolute -bottom-32 end-1/3 w-80 h-80 rounded-full bg-white/[0.05]"></div>

          <div class="relative flex flex-col-reverse lg:flex-row lg:items-center justify-between gap-8">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-4">
                <span class="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{{ roleLabel }}</span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full" :class="healthColor.dot"></span>
                  الخدمة {{ healthLabel }}
                </span>
              </div>
              <p class="text-white/75 text-sm mb-1">{{ greeting }}</p>
              <h1 class="text-3xl sm:text-4xl font-extrabold leading-tight truncate">
                أهلاً {{ user?.name || 'بك' }}
              </h1>
              <p class="text-white/80 mt-3 max-w-md text-[15px] leading-relaxed">{{ heroSentence }}</p>

              <div class="flex flex-wrap items-center gap-3 mt-6">
                <router-link
                  to="/attendance"
                  class="inline-flex items-center gap-2 rounded-xl bg-white text-brand px-5 py-3 text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
                >
                  <Icon name="check" class="w-4 h-4" />
                  تسجيل الحضور
                </router-link>
                <router-link
                  to="/members/new"
                  class="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Icon name="plus" class="w-4 h-4" />
                  تسجيل مخدوم
                </router-link>
              </div>
            </div>

            <!-- دايرة الصحة -->
            <div class="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 self-center">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="7" class="text-white/20" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"
                  class="text-white motion-reduce:!transition-none"
                  :stroke-dasharray="RING_C"
                  :stroke-dashoffset="ringOffset"
                  style="transition: stroke-dashoffset 0.9s ease"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl sm:text-5xl font-extrabold tabular-nums leading-none">{{ healthScore }}</span>
                <span class="text-xs text-white/70 mt-1.5">صحة الخدمة</span>
              </div>
            </div>
          </div>
        </section>

        <!-- الإحصائيات -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat label="إجمالي المخدومين" :value="members.length" icon="users" />
          <Stat label="حضور الأسبوع" :value="`${attendanceRate}%`" icon="chart" :tone="attendanceRate >= 70 ? 'ok' : 'danger'" :progress="attendanceRate" />
          <Stat label="غايبين 3 مرات" :value="consecutiveAbsent.length" icon="alert" :tone="consecutiveAbsent.length ? 'danger' : 'muted'" />
          <Stat label="محتاجين افتقاد" :value="needsFollowupCount" icon="phone" :tone="needsFollowupCount ? 'gold' : 'muted'" />
        </section>

        <!-- محتاج انتباهك + اختصارات -->
        <section class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-10">

          <!-- محتاج انتباهك -->
          <div class="lg:col-span-3 rounded-3xl border border-border bg-card shadow-sm">
            <div class="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5">
              <h2 class="text-base font-bold text-navy">محتاج انتباهك</h2>
              <router-link
                v-if="needsFollowupCount > 0"
                to="/followups"
                class="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
              >
                فتح الافتقاد
                <Icon name="chevron" class="w-4 h-4" />
              </router-link>
            </div>

            <!-- تبويبات -->
            <div v-if="alertCount" class="px-5 sm:px-6 mt-4">
              <div class="inline-flex rounded-xl bg-page p-1 text-sm" role="tablist">
                <button
                  role="tab"
                  :aria-selected="activeTab === 'absent'"
                  @click="tab = 'absent'"
                  class="rounded-lg px-4 py-1.5 font-medium transition-colors"
                  :class="activeTab === 'absent' ? 'bg-card text-navy shadow-sm' : 'text-navy/50 hover:text-navy'"
                >
                  غياب متتالي
                  <span class="ms-1 tabular-nums" :class="consecutiveAbsent.length ? 'text-danger' : ''">{{ consecutiveAbsent.length }}</span>
                </button>
                <button
                  role="tab"
                  :aria-selected="activeTab === 'followup'"
                  @click="tab = 'followup'"
                  class="rounded-lg px-4 py-1.5 font-medium transition-colors"
                  :class="activeTab === 'followup' ? 'bg-card text-navy shadow-sm' : 'text-navy/50 hover:text-navy'"
                >
                  محتاجين افتقاد
                  <span class="ms-1 tabular-nums" :class="needsFollowupCount ? 'text-gold' : ''">{{ needsFollowupCount }}</span>
                </button>
              </div>
            </div>

            <!-- فاضي -->
            <div v-if="!alertCount" class="px-6 py-12 text-center">
              <div class="mx-auto mb-3 w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
                <Icon name="check" class="w-6 h-6" />
              </div>
              <p class="font-semibold text-navy">كله تمام</p>
              <p class="text-sm text-navy/60 mt-1">مفيش حد محتاج متابعة دلوقتي.</p>
            </div>

            <div v-else-if="!visibleList.length" class="px-6 py-10 text-center text-sm text-navy/60">
              مفيش حد في القايمة دي.
            </div>

            <!-- القايمة -->
            <ul v-else class="px-3 sm:px-4 pt-3 pb-4">
              <li v-for="m in visibleList" :key="m.id">
                <div class="flex items-center gap-3 rounded-2xl px-2 sm:px-3 py-2.5 hover:bg-page transition-colors">
                  <span
                    class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold"
                    :class="activeTab === 'absent' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold'"
                  >{{ nameOf(m).charAt(0) }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-navy truncate">{{ nameOf(m) }}</p>
                    <p class="text-xs text-navy/50 mt-0.5">{{ metaOf(m) }}</p>
                  </div>
                  <a
                    v-if="phoneOf(m)"
                    :href="`tel:${phoneOf(m)}`"
                    class="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand hover:text-white px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    :aria-label="`اتصال بـ ${nameOf(m)}`"
                  >
                    <Icon name="phone" class="w-3.5 h-3.5" />
                    اتصال
                  </a>
                </div>
              </li>
            </ul>

            <div v-if="hiddenCount > 0" class="px-5 sm:px-6 pb-5 -mt-1">
              <router-link
                :to="activeTab === 'followup' ? '/followups' : '/attendance-report'"
                class="text-sm text-navy/60 hover:text-brand transition-colors"
              >
                و {{ hiddenCount }} كمان…
              </router-link>
            </div>
          </div>

          <!-- اختصارات -->
          <div class="lg:col-span-2 rounded-3xl border border-border bg-card shadow-sm p-5 sm:p-6">
            <h2 class="text-base font-bold text-navy mb-3">اختصارات</h2>
            <div class="space-y-1.5">
              <router-link
                v-for="s in shortcuts"
                :key="s.to"
                :to="s.to"
                class="group flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-page transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <span class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors" :class="s.tint">
                  <Icon :name="s.icon" class="w-[18px] h-[18px]" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-semibold text-navy group-hover:text-brand transition-colors">{{ s.label }}</span>
                  <span class="block text-xs text-navy/50 mt-0.5 truncate">{{ s.desc }}</span>
                </span>
                <Icon name="chevron" class="w-4 h-4 shrink-0 text-navy/25 group-hover:text-brand transition-colors" />
              </router-link>
            </div>
          </div>
        </section>

        <!-- أعياد ميلاد الشهر -->
        <section class="mb-10">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-bold text-navy flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gold"></span>
              أعياد ميلاد {{ currentMonthLabel }}
              <span v-if="hasTodayBirthdays" class="text-xs bg-gold text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                {{ todayBirthdaysCount }} النهاردة 🎂
              </span>
            </h2>
            <label class="relative block sm:w-48">
              <span class="sr-only">اختر الشهر</span>
              <Icon name="chevron" class="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-navy/40 pointer-events-none rotate-90" />
              <select
                v-model="selectedMonth"
                class="w-full rounded-xl border border-border bg-card ps-10 pe-8 py-2.5 text-sm text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition cursor-pointer"
              >
                <option v-for="(month, i) in MONTHS_AR" :key="i" :value="i + 1">
                  {{ month }}
                </option>
              </select>
            </label>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="birthdaysLoading" class="space-y-2 animate-pulse motion-reduce:animate-none">
            <Skeleton class="h-14 rounded-xl" v-for="n in 5" :key="n" />
          </div>

          <!-- Empty State -->
          <div v-else-if="!birthdaysForMonth.length" class="rounded-2xl border border-dashed border-border">
            <EmptyState
              icon="🎂"
              title="مفيش أعياد ميلاد في {{ currentMonthLabel }}"
              description="لا يوجد مخدومين عيد ميلادهم في هذا الشهر"
              tone="gold"
            />
          </div>

          <!-- Birthdays List -->
          <div v-else class="space-y-2">
            <div
              v-for="m in birthdaysForMonth"
              :key="m.id"
              class="group relative flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-brand/50 hover:shadow-md transition-all"
              :class="{ 'ring-2 ring-gold/50 bg-gold/5': m.isToday }"
            >
              <!-- مؤشر "النهاردة" -->
              <div v-if="m.isToday" class="absolute -top-2 -start-2 w-5 h-5 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                🎂
              </div>

              <!-- صورة/حرف أول -->
              <div class="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold" :class="m.isToday ? 'bg-gold/20 text-gold' : 'bg-brand/10 text-brand'">
                {{ nameOf(m).charAt(0) }}
              </div>

              <!-- المعلومات -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-semibold text-navy truncate">{{ nameOf(m) }}</p>
                  <span v-if="m.isToday" class="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full font-medium whitespace-nowrap animate-pulse">
                    🎂 النهاردة!
                  </span>
                  <span v-else-if="m.isPast" class="text-xs bg-navy/10 text-navy/50 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    فات ({{ m.formattedDate }})
                  </span>
                  <span v-else class="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    {{ m.formattedDate }}
                  </span>
                </div>
                <p class="text-xs text-navy/50 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>العمر: <strong>{{ m.turningAge }}</strong> سنة</span>
                  <span v-if="m.group_name" class="bg-brand/10 text-brand px-1.5 py-0.5 rounded text-[10px]">{{ m.group_name }}</span>
                  <span v-else class="text-navy/40 text-[10px]">بدون مجموعة</span>
                </p>
              </div>

              <!-- أزرار الإجراءات -->
              <div class="flex items-center gap-2 shrink-0">
                <WhatsAppButton
                  :phone="phoneOf(m)"
                  :member-name="nameOf(m)"
                  :parent-name="m.parent_name || ''"
                />
                <a
                  v-if="phoneOf(m)"
                  :href="`tel:${phoneOf(m)}`"
                  class="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand hover:text-white px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  :aria-label="`اتصال بـ ${nameOf(m)}`"
                >
                  <Icon name="phone" class="w-3.5 h-3.5" />
                  اتصال
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- كل الأقسام -->
        <section>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-bold text-navy">كل الأقسام</h2>
            <label class="relative block sm:w-72">
              <span class="sr-only">ابحث في الأقسام</span>
              <Icon name="search" class="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-navy/40 pointer-events-none" />
              <input
                v-model="query"
                type="search"
                placeholder="ابحث في الأقسام…"
                class="w-full rounded-xl border border-border bg-card ps-10 pe-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition"
              />
            </label>
          </div>

          <div v-if="!filteredGroups.length" class="rounded-2xl border border-dashed border-border py-12 text-center">
            <p class="text-sm text-navy/60">مفيش قسم بالاسم ده. جرّب كلمة تانية.</p>
          </div>

          <div v-for="group in filteredGroups" :key="group.title" class="mb-7 last:mb-0">
            <h3 class="text-sm font-semibold text-navy/50 mb-3 px-1">{{ group.title }}</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <router-link
                v-for="l in group.items"
                :key="l.to"
                :to="l.to"
                class="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 hover:border-brand/50 hover:shadow-md hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <span class="w-10 h-10 rounded-xl bg-page text-navy/70 group-hover:bg-brand group-hover:text-white transition-colors flex items-center justify-center">
                  <Icon :name="l.icon" class="w-[18px] h-[18px]" />
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-bold text-navy">{{ l.label }}</span>
                  <span class="block text-xs text-navy/50 mt-0.5 truncate">{{ l.desc }}</span>
                </span>
                <span
                  v-if="l.badge"
                  class="absolute top-3 end-3 min-w-[22px] text-center bg-danger text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                >{{ l.badge }}</span>
              </router-link>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- شريط التنقل السفلي (موبايل) -->
    <nav
      class="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/90 backdrop-blur-md"
      style="padding-bottom: env(safe-area-inset-bottom, 0px)"
      aria-label="التنقل الرئيسي"
    >
      <ul class="grid grid-cols-4 max-w-md mx-auto">
        <li v-for="n in bottomNav" :key="n.to">
          <router-link
            :to="n.to"
            class="relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors"
            :class="isActive(n.to) ? 'text-brand' : 'text-navy/50'"
          >
            <span
              class="w-12 h-7 rounded-full flex items-center justify-center transition-colors"
              :class="isActive(n.to) ? 'bg-brand/10' : ''"
            >
              <Icon :name="n.icon" class="w-[18px] h-[18px]" />
            </span>
            {{ n.label }}
            <span
              v-if="n.badge"
              class="absolute top-1.5 end-[calc(50%-22px)] min-w-[16px] text-center bg-danger text-white text-[9px] font-bold px-1 rounded-full"
            >{{ n.badge }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api/client'
import ThemeToggle from '../composables/ThemeToggle.vue'
import { useCalculations } from '../composables/useCalculations'
import { MAX_DASHBOARD_ROWS, ROLE_LABELS } from '../constants/app'
import WhatsAppButton from '../components/WhatsAppButton.vue'
import EmptyState from '../components/EmptyState.vue'
import Skeleton from '../components/Skeleton.vue'
import { getBirthdaysForMonth, MONTHS_AR, getCurrentMonth, filterMembersByPermission, countTodayBirthdays } from '../utils/birthdays'

const ICONS = {
  plus: 'M12 5v14M5 12h14',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  check: 'M20 6 9 17l-5-5',
  chevron: 'm15 18-6-6 6-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  chart: 'M3 3v18h18M7 14l4-4 4 4 5-5',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
}

const Icon = {
  props: { name: String },
  setup(props) {
    return () =>
      h('svg', {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
      }, [h('path', { d: ICONS[props.name] || '' })])
  },
}

const Stat = {
  props: {
    label: String,
    value: [String, Number],
    icon: String,
    tone: { type: String, default: 'default' },
    progress: { type: Number, default: null },
  },
  setup(props) {
    const text = { default: 'text-navy', ok: 'text-success', danger: 'text-danger', gold: 'text-gold', muted: 'text-navy/40' }
    const soft = { default: 'bg-navy/5 text-navy/70', ok: 'bg-success/10 text-success', danger: 'bg-danger/10 text-danger', gold: 'bg-gold/10 text-gold', muted: 'bg-navy/5 text-navy/40' }
    const bar = { default: 'bg-navy', ok: 'bg-success', danger: 'bg-danger', gold: 'bg-gold', muted: 'bg-navy/30' }
    return () =>
      h('div', { class: 'rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm' }, [
        h('div', { class: 'flex items-center justify-between gap-2 mb-3' }, [
          h('p', { class: 'text-xs text-navy/55' }, props.label),
          props.icon ? h('span', { class: ['w-8 h-8 rounded-lg flex items-center justify-center', soft[props.tone] || soft.default] }, [h(Icon, { name: props.icon, class: 'w-4 h-4' })]) : null,
        ]),
        h('p', { class: ['text-3xl font-extrabold tabular-nums leading-none', text[props.tone] || text.default] }, String(props.value)),
        props.progress !== null
          ? h('div', { class: 'mt-3 h-1.5 rounded-full bg-navy/5 overflow-hidden' }, [
              h('div', { class: ['h-full rounded-full', bar[props.tone] || bar.default], style: { width: `${Math.min(100, props.progress)}%` } }),
            ])
          : null,
      ])
  },
}

const router = useRouter()
const route = useRoute()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = user.role === 'admin'

const members = ref([])
const followupsMap = ref({})
const attendanceData = ref({})
const loading = ref(false)
const error = ref(false)
const tab = ref(null)
const query = ref('')

// أعياد الميلاد
const selectedMonth = ref(getCurrentMonth())
const birthdaysLoading = ref(false)

const RING_C = 2 * Math.PI * 42

const todayLabel = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
const greeting = (() => {
  const hr = new Date().getHours()
  if (hr < 12) return 'صباح الخير'
  if (hr < 18) return 'نهارك سعيد'
  return 'مساء الخير'
})()

const roleLabel = computed(() => {
  if (!user?.role) return 'مستخدم'
  return ROLE_LABELS[user.role] || 'خادم'
})

const statsError = computed(() => dashboardStats === null && !loading)

// === Используем унифицированные вычисления ===
const {
  attendanceRate,
  healthScore,
  healthLabel,
  healthColor,
  needsFollowupList,
  needsFollowupCount,
  consecutiveAbsentList,
  consecutiveAbsentCount,
  memberRows,
  CONSECUTIVE_ABSENT_THRESHOLD,
  FOLLOWUP_THRESHOLD_DAYS,
} = useCalculations(members, attendanceData, followupsMap)

/* قايمة الانتباه */
const alertCount = computed(() => consecutiveAbsentCount.value + needsFollowupCount.value)
const activeTab = computed(() => {
  if (tab.value) return tab.value
  return consecutiveAbsentCount.value ? 'absent' : 'followup'
})
const fullList = computed(() => {
  if (activeTab.value === 'absent') return consecutiveAbsentList.value
  return [...needsFollowupList.value].sort((a, b) => (b.followupDays ?? Infinity) - (a.followupDays ?? Infinity))
})
const visibleList = computed(() => fullList.value.slice(0, MAX_DASHBOARD_ROWS))
const hiddenCount = computed(() => Math.max(0, fullList.value.length - MAX_DASHBOARD_ROWS))

const nameOf = (m) => m.name || m.full_name || 'بدون اسم'
const phoneOf = (m) => m.parent_phone || m.member_phone || m.phone || m.mobile || ''
const metaOf = (m) => {
  if (activeTab.value === 'absent') return `غاب ${m.consecutiveAbsent} مرات متتالية`
  return m.followupDays === null ? 'لم يتم افتقاده من قبل' : `آخر افتقاد من ${m.followupDays} يوم`
}

/* الأقسام */
const shortcuts = computed(() => {
  const list = [
    { to: '/attendance-report', label: 'تقرير الحضور', desc: 'حضور حسب التاريخ', icon: 'chart', tint: 'bg-success/10 text-success' },
    { to: '/readings', label: 'القراءات', desc: 'قراءات الإنجيل', icon: 'book', tint: 'bg-brand/10 text-brand' },
    { to: '/challenges', label: 'التحديات', desc: 'التحديات المتاحة', icon: 'trophy', tint: 'bg-gold/10 text-gold' },
  ]
  if (isAdmin) list.push({ to: '/users', label: 'إدارة الحسابات', desc: 'المستخدمين والصلاحيات', icon: 'users', tint: 'bg-navy/5 text-navy/70' })
  return list
})

const linkGroups = computed(() => {
  const groups = [
    {
      title: 'الخدمة',
      items: [
        { to: '/members', label: 'قائمة المخدومين', desc: 'عرض وبحث', icon: 'list' },
        { to: '/followups', label: 'الافتقاد', desc: 'متابعة المحتاجين', icon: 'phone', badge: needsFollowupCount.value || null },
        { to: '/challenges', label: 'التحديات', desc: 'التحديات المتاحة', icon: 'trophy' },
        { to: '/groups', label: 'المجموعات', desc: 'مجموعاتي', icon: 'users' },
        { to: '/readings', label: 'القراءات', desc: 'قراءات الإنجيل', icon: 'book' },
        { to: '/reports', label: 'التقارير', desc: 'إحصائيات', icon: 'chart' },
        { to: '/servant-attendance', label: 'حضور الخدام', desc: 'تسجيل حضور الخدام', icon: 'check' },
        { to: '/servants-activity', label: 'نشاط الخدام', desc: 'تقرير شامل', icon: 'chart' },
      ],
    },
  ]
  if (isAdmin) {
    groups.push({
      title: 'الإدارة',
      items: [
        { to: '/users', label: 'الحسابات', desc: 'المستخدمين والصلاحيات', icon: 'user' },
        { to: '/servants', label: 'الخدام', desc: 'إدارة الخدام', icon: 'user' },
        { to: '/challenges-approval', label: 'موافقات التحديات', desc: 'طلبات الاشتراك', icon: 'trophy' },
        { to: '/audit-log', label: 'سجل النشاط', desc: 'كل العمليات', icon: 'list' },
        { to: '/settings', label: 'الإعدادات', desc: 'النسخ الاحتياطي والبيانات', icon: 'settings' },
      ],
    })
  }
  return groups
})

const filteredGroups = computed(() => {
  const q = query.value.trim()
  if (!q) return linkGroups.value
  return linkGroups.value
    .map((g) => ({ ...g, items: g.items.filter((l) => l.label.includes(q) || l.desc.includes(q)) }))
    .filter((g) => g.items.length)
})

/* التنقل السفلي */
const bottomNav = computed(() => [
  { to: '/', label: 'الرئيسية', icon: 'home' },
  { to: '/attendance', label: 'الحضور', icon: 'check' },
  { to: '/members', label: 'المخدومين', icon: 'users' },
  { to: '/followups', label: 'الافتقاد', icon: 'phone', badge: needsFollowupCount.value || null },
])
const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

// === أعياد الميلاد ===
// فلترة الأعضاء حسب صلاحيات المستخدم
const permittedMembers = computed(() => filterMembersByPermission(members.value, user))

// أعياد الميلاد للشهر المحدد
const birthdaysForMonth = computed(() => {
  return getBirthdaysForMonth(permittedMembers.value, selectedMonth.value)
})

// عدد أعياد الميلاد اليوم
const todayBirthdaysCount = computed(() => {
  return countTodayBirthdays(permittedMembers.value)
})

// الشهر الحالي
const currentMonthLabel = computed(() => MONTHS_AR[selectedMonth.value - 1])

// هل في أعياد ميلاد النهاردة؟
const hasTodayBirthdays = computed(() => todayBirthdaysCount.value > 0)

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}

async function loadData() {
  loading.value = true
  error.value = false
  try {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) {
      // No token - redirect to login
      error.value = 'يجب تسجيل الدخول أولاً للوصول إلى لوحة التحكم'
      router.push({ name: 'login' })
      return
    }

    // Verify token is valid by checking stored user data
    // (Removed /api/me call - auth state now depends on stored token after login)
    // TODO: re-enable /api/me later
    // const { data } = await api.get('/me')
    // if (!data?.user) {
    //   localStorage.removeItem('token')
    //   localStorage.removeItem('refreshToken')
    //   localStorage.removeItem('user')
    //   error.value = 'انتهت صلاحية الجلسة، برجاء تسجيل الدخول مجدداً'
    //   router.push({ name: 'login' })
    //   return
    // }

    // Try to get dashboard stats first (new endpoint)
    // Use try/catch so failure doesn't break the page
    let dashboardStats = null
    try {
      const statsRes = await api.get('/dashboard/stats')
      dashboardStats = statsRes.data
    } catch (e) {
      // Dashboard stats failed - use defaults (zeros) so page doesn't break
      console.log('Dashboard stats failed, using defaults')
      dashboardStats = {
        health: { score: 100, label: 'جيد', color: 'success' },
        attendance: { rate: 0, label: '0%', color: 'danger' },
        consecutiveAbsent: { count: 0 },
        needsFollowup: { count: 0 }
      }
    }

    // Always load the three main data sources (required for dashboard UI)
    // Use Promise.allSettled so failure of one request doesn't stop the others
    const results = await Promise.allSettled([
      api.get('/members'),
      api.get('/followups'),
      api.get('/attendance'),
    ])

    // Handle each request independently - skip failed ones
    if (results[0].status === 'fulfilled') {
      members.value = results[0].value.data
    }
    if (results[1].status === 'fulfilled') {
      const fmap = {}
      results[1].value.data.forEach((f) => {
        if (!fmap[f.member_id]) fmap[f.member_id] = []
        fmap[f.member_id].push(f)
      })
      followupsMap.value = fmap
    }
    if (results[2].status === 'fulfilled') {
      const amap = {}
      results[2].value.data.forEach((a) => {
        const key = `${a.date.slice(0, 10)}_${a.meeting_type}`
        if (!amap[key]) amap[key] = {}
        amap[key][a.member_id] = a.present
      })
      attendanceData.value = amap
    }

    // Update dashboard state from dashboard stats if available
    if (dashboardStats) {
      // Apply dashboard stats data if needed
      if (dashboardStats.health) {
        healthScore.value = dashboardStats.health.score
        healthLabel.value = dashboardStats.health.label
        healthColor.value = dashboardStats.health.color
      }
      if (dashboardStats.attendance !== undefined) {
        attendanceRate.value = dashboardStats.attendance.rate
      }
      if (dashboardStats.consecutiveAbsent) {
        consecutiveAbsentCount.value = dashboardStats.consecutiveAbsent.count
      }
      if (dashboardStats.needsFollowup !== undefined) {
        needsFollowupCount.value = dashboardStats.needsFollowup.count
      }
    }

  } catch (e) {
    console.error(e)
    // General error state - show retry option
    error.value = 'حدث خطأ في تحميل البيانات، جرّب الضغط على إعادة المحاولة'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Check auth status on mount
  const token = localStorage.getItem('token')
  if (!token) {
    // No token - redirect to login, don't try to load data
    router.push({ name: 'login' })
    return
  }
  // Verify auth state from stored user data (no /api/me call)
  // TODO: re-enable /api/me later

  await loadData()
})
</script>