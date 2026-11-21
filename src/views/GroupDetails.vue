<template>
  <div class="min-h-screen bg-page" dir="rtl">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      <!-- Loading -->
      <div v-if="loading" class="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-navy/5"></div>
          <div class="space-y-2">
            <div class="h-6 w-40 rounded bg-navy/5"></div>
            <div class="h-4 w-56 rounded bg-navy/5"></div>
          </div>
        </div>
        <div class="h-32 rounded-2xl bg-navy/5"></div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="i in 4" :key="i" class="h-20 rounded-2xl bg-navy/5"></div>
        </div>
        <div class="h-64 rounded-2xl bg-navy/5"></div>
        <span class="sr-only">جارٍ التحميل...</span>
      </div>

      <!-- Not found / error -->
      <div v-else-if="!group" class="rounded-2xl border border-border bg-card p-8 text-center">
        <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <Icon name="alert" class="w-5 h-5" />
        </div>
        <template v-if="notFound">
          <p class="text-navy font-medium mb-1">المجموعة غير موجودة</p>
          <p class="text-sm text-navy/60 mb-5">يمكن اتحذفت أو اللينك غلط</p>
        </template>
        <template v-else>
          <p class="text-navy font-medium mb-1">حصلت مشكلة في التحميل</p>
          <p class="text-sm text-navy/60 mb-5">{{ loadError }}</p>
        </template>
        <div class="flex justify-center gap-2 flex-wrap">
          <button
            v-if="!notFound"
            @click="loadData()"
            class="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity"
          >
            إعادة المحاولة
          </button>
          <router-link
            to="/groups"
            class="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-navy/70 hover:text-brand transition-colors"
          >
            <Icon name="arrow-right" class="w-4 h-4" />
            رجوع للمجموعات
          </router-link>
        </div>
      </div>

      <template v-else>

        <!-- Header -->
        <PageHeader
          :title="group.name"
          :subtitle="`تفاصيل المجموعة · ${group.servant_name || 'بدون خادم'} ${group.co_servant_name ? '· مساعد: ' + group.co_servant_name : ''}`"
          showHome
        >
          <template #actions>
            <router-link
              :to="`/groups/${group.id}/challenges`"
              class="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <Icon name="trophy" class="w-4 h-4" />
              التحديات
            </router-link>

            <!-- ترشيح ليدر - للخادم المسؤول أو المساعد فقط -->
            <button
              v-if="isResponsibleServant && !group.leader_id && !group.leader_pending"
              @click="openNominateLeader"
              class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <Icon name="user" class="w-4 h-4" />
              ترشيح ليدر
            </button>

            <!-- إذا فيه ترشيح معلق -->
            <div v-else-if="isResponsibleServant && group.leader_pending" class="inline-flex items-center gap-2 px-3.5 py-2 text-sm text-gold font-medium bg-gold/10 rounded-lg">
              <Icon name="clock" class="w-4 h-4" />
              <span>بانتظار الموافقة: {{ group.leader_pending_name || 'عضو' }}</span>
            </div>

            <!-- إذا فيه ليدر معتمد -->
            <div v-else-if="group.leader_id" class="inline-flex items-center gap-2 px-3.5 py-2 text-sm text-success font-medium bg-success/10 rounded-lg">
              <Icon name="trophy" class="w-4 h-4" />
              <span>ليد معتمد: {{ group.leader_name || 'عضو' }}</span>
            </div>
          </template>
        </PageHeader>

        <!-- Success -->
        <transition name="fade">
          <div
            v-if="successMessage"
            class="mb-5 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success"
            role="status"
          >
            <Icon name="check" class="w-4 h-4 shrink-0" />
            <span>{{ successMessage }}</span>
          </div>
        </transition>

        <!-- Description -->
        <section v-if="group.description" class="rounded-2xl border border-border bg-card p-4 sm:p-5 mb-5">
          <p class="text-sm text-navy/70 leading-relaxed">{{ group.description }}</p>
        </section>

        <!-- Score -->
        <section
          class="rounded-2xl border border-border bg-gradient-to-l from-gold/5 to-transparent p-5 sm:p-6 mb-5"
          aria-labelledby="score-title"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="min-w-0">
              <h2 id="score-title" class="text-base font-semibold text-navy flex items-center gap-2">
                <Icon name="trophy" class="w-4 h-4 text-gold" />
                نقاط المجموعة
              </h2>
              <p class="text-xs text-navy/50 mt-0.5">محسوبة من الحضور والافتقاد والتحديات</p>
            </div>
            <div class="text-left shrink-0">
              <p class="text-3xl font-bold tabular-nums leading-none" :class="scoreLevelClass(scoreData.total)">
                {{ scoreData.total }}
              </p>
              <p class="text-xs mt-1 inline-flex items-center gap-1" :class="scoreLevelClass(scoreData.total)">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                {{ scoreLevelLabel(scoreData.total) }}
              </p>
            </div>
          </div>

          <ul v-if="scoreData.breakdown.length > 0" class="divide-y divide-border">
            <li v-for="(b, i) in scoreData.breakdown" :key="i" class="flex items-center justify-between py-2.5 text-sm gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-base shrink-0">{{ b.icon }}</span>
                <span class="text-navy truncate">{{ b.label }}</span>
              </div>
              <span class="shrink-0 font-bold tabular-nums" :class="b.points >= 0 ? 'text-success' : 'text-danger'">
                {{ b.points > 0 ? '+' : '' }}{{ b.points }}
              </span>
            </li>
          </ul>

          <div v-else class="text-center py-6">
            <div class="mx-auto mb-2 w-10 h-10 rounded-full bg-navy/5 text-navy/40 flex items-center justify-center">
              <Icon name="chart" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60">مفيش معايير متاحة لحساب النقاط لسه</p>
          </div>
        </section>

        <!-- Stats -->
        <section
          class="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border mb-5"
          aria-label="إحصائيات"
        >
          <Stat
            label="نسبة الحضور"
            :value="attendanceRate === null ? '—' : `${attendanceRate}%`"
            :tone="attendanceRate === null ? 'muted' : attendanceRate >= 70 ? 'ok' : 'danger'"
            :hint="`آخر ${ATTENDANCE_WINDOW_MEETINGS} اجتماعات`"
          />
          <Stat
            label="محتاجين افتقاد"
            :value="needsFollowupCount"
            :tone="needsFollowupCount ? 'gold' : 'muted'"
            :hint="`ما اتفتقدوش من ${FOLLOWUP_THRESHOLD_DAYS_CALC} يوم`"
          />
          <Stat
            label="متوسط الخطر"
            :value="avgRisk"
            :tone="avgRisk >= 50 ? 'danger' : 'ok'"
            hint="من 100"
          />
          <Stat
            label="غياب متتالي"
            :value="consecutiveAbsent.length"
            :tone="consecutiveAbsent.length ? 'danger' : 'muted'"
            :hint="`${CONSECUTIVE_ABSENT_THRESHOLD_CALC} مرات ورا بعض أو أكتر`"
          />
        </section>

        <!-- Members -->
        <section class="rounded-2xl border border-border bg-card" aria-labelledby="members-title">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-border">
            <h2 id="members-title" class="text-base font-semibold text-navy flex items-center gap-2">
              <Icon name="users" class="w-4 h-4 text-navy/60" />
              الأعضاء
              <span class="text-sm font-normal text-navy/50">({{ members.length }})</span>
            </h2>

            <div class="flex items-center gap-2 flex-wrap">
              <div v-if="members.length > 1" class="flex rounded-lg bg-page p-0.5 text-xs" role="group" aria-label="ترتيب الأعضاء">
                <button
                  v-for="o in sortOptions"
                  :key="o.value"
                  type="button"
                  @click="sortBy = o.value"
                  class="px-2.5 py-1 rounded-md transition-colors"
                  :class="sortBy === o.value ? 'bg-card text-navy shadow-sm font-medium' : 'text-navy/60 hover:text-navy'"
                  :aria-pressed="sortBy === o.value"
                >
                  {{ o.label }}
                </button>
              </div>

              <button
                type="button"
                @click="openAdd"
                class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Icon name="plus" class="w-4 h-4" />
                إضافة أعضاء
              </button>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="members.length === 0" class="px-5 sm:px-6 py-12 text-center">
            <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-page text-navy/40 flex items-center justify-center">
              <Icon name="users" class="w-5 h-5" />
            </div>
            <p class="text-sm text-navy/60 mb-4">مفيش أعضاء في المجموعة دي لسه</p>
            <button
              type="button"
              @click="openAdd"
              class="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Icon name="plus" class="w-4 h-4" />
              أضف من المخدومين بدون مجموعة
            </button>
          </div>

          <ul v-else class="divide-y divide-border">
            <li
              v-for="r in memberRows"
              :key="r.id"
              class="flex items-center gap-3 px-5 sm:px-6 py-3 hover:bg-page/40 transition-colors"
            >
              <div class="w-9 h-9 rounded-lg bg-brand/10 text-brand text-sm font-bold flex items-center justify-center shrink-0">
                {{ r.full_name.charAt(0) }}
              </div>

              <div class="min-w-0 flex-1">
                <router-link
                  :to="`/members/${r.id}`"
                  class="text-sm font-medium text-navy hover:text-brand transition-colors truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
                >
                  {{ r.full_name }}
                </router-link>
                <p class="text-xs text-navy/50 truncate">
                  {{ r.grade || '—' }}<span v-if="r.address"> • {{ r.address }}</span>
                  <span v-if="r.servant_name"> • {{ r.servant_name }}</span>
                </p>

                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <span class="chip" :class="rateChip(r.rate)">
                    {{ r.rate === null ? 'مفيش حضور مسجّل' : `${r.rate}% حضور` }}
                  </span>
                  <span v-if="r.streak >= 2" class="chip bg-danger/10 text-danger">غايب {{ r.streak }} ورا بعض</span>
                  <span v-if="r.needsFollowup" class="chip bg-gold/15 text-gold">
                    {{ r.followupDays === null ? 'ما اتفتقدش' : `آخر افتقاد من ${r.followupDays} يوم` }}
                  </span>
                  <span v-else class="chip bg-navy/5 text-navy/50">افتُقد من {{ r.followupDays }} يوم</span>
                </div>
              </div>

              <div class="shrink-0 text-center" :title="'درجة الخطر'">
                <p class="text-lg font-bold tabular-nums leading-none" :class="riskText(r.risk)">{{ r.risk }}</p>
                <p class="text-[10px] text-navy/40 mt-1">خطر</p>
              </div>
            </li>
          </ul>
        </section>

        <!-- ============ Add members sheet ============ -->
        <transition name="fade">
          <div
            v-if="showAdd"
            class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
            @click.self="closeAdd"
          >
            <div
              class="flex flex-col w-full sm:max-w-2xl max-h-[92vh] rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-title"
            >
              <!-- Sheet header -->
              <div class="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                <div class="min-w-0">
                  <h3 id="add-title" class="text-lg font-semibold text-navy">إضافة أعضاء لـ «{{ group.name }}»</h3>
                  <p class="text-xs text-navy/50 mt-0.5">
                    المخدومين اللي مش في أي مجموعة
                    <span v-if="!addLoading && !addLoadError">({{ candidates.length }})</span>
                  </p>
                </div>
                <button
                  type="button"
                  @click="closeAdd"
                  class="shrink-0 w-9 h-9 rounded-full text-navy/60 hover:bg-page hover:text-navy flex items-center justify-center transition-colors"
                  aria-label="إغلاق"
                >
                  <Icon name="x" class="w-5 h-5" />
                </button>
              </div>

              <!-- Filters -->
              <div v-if="!addLoading && !addLoadError && candidates.length > 0" class="px-5 pb-3 space-y-3 border-b border-border">
                <div class="relative">
                  <Icon name="search" class="w-4 h-4 text-navy/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input v-model="addSearch" type="search" placeholder="ابحث بالاسم..." class="input !pr-9 w-full" />
                </div>

                <div v-if="townOptions.length > 2" class="flex items-center gap-2">
                  <span class="text-xs text-navy/50 shrink-0 w-12">البلد</span>
                  <div class="flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      v-for="t in townOptions"
                      :key="t.value"
                      type="button"
                      @click="townFilter = t.value"
                      class="filter-chip"
                      :class="townFilter === t.value ? 'bg-navy text-white' : 'bg-page text-navy hover:bg-navy/10'"
                      :aria-pressed="townFilter === t.value"
                    >
                      {{ t.label }} <span class="opacity-60">{{ t.count }}</span>
                    </button>
                  </div>
                </div>

                <div v-if="gradeOptions.length > 2" class="flex items-center gap-2">
                  <span class="text-xs text-navy/50 shrink-0 w-12">المرحلة</span>
                  <div class="flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      v-for="g in gradeOptions"
                      :key="g.value"
                      type="button"
                      @click="gradeFilter = g.value"
                      class="filter-chip"
                      :class="gradeFilter === g.value ? 'bg-navy text-white' : 'bg-page text-navy hover:bg-navy/10'"
                      :aria-pressed="gradeFilter === g.value"
                    >
                      {{ g.label }} <span class="opacity-60">{{ g.count }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Body -->
              <div class="flex-1 overflow-y-auto min-h-[12rem]">
                <div v-if="addLoading" class="py-16 text-center">
                  <div class="animate-spin w-7 h-7 mx-auto border-2 border-navy/20 border-t-navy rounded-full"></div>
                  <p class="mt-3 text-sm text-navy/60">جارٍ تحميل المخدومين...</p>
                </div>

                <div v-else-if="addLoadError" class="py-14 px-5 text-center">
                  <p class="text-danger text-sm mb-3">{{ addLoadError }}</p>
                  <button @click="loadCandidates" class="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:opacity-90">إعادة المحاولة</button>
                </div>

                <div v-else-if="candidates.length === 0" class="py-14 px-5 text-center">
                  <p class="text-3xl mb-2">🎉</p>
                  <p class="text-sm text-navy/70">كل المخدومين متوزعين على مجموعات</p>
                </div>

                <div v-else-if="filteredCandidates.length === 0" class="py-14 px-5 text-center">
                  <p class="text-sm text-navy/60">مفيش نتايج مطابقة</p>
                  <button @click="resetAddFilters" class="mt-2 text-sm text-brand hover:underline">مسح الفلاتر</button>
                </div>

                <template v-else>
                  <label class="flex items-center gap-3 px-5 py-2.5 bg-page/60 border-b border-border text-sm text-navy cursor-pointer sticky top-0 z-10">
                    <input
                      type="checkbox"
                      class="w-4 h-4 accent-brand shrink-0"
                      :checked="allVisibleSelected"
                      @change="toggleAllVisible"
                    />
                    <span>تحديد الكل الظاهرين ({{ filteredCandidates.length }})</span>
                  </label>

                  <ul class="divide-y divide-border">
                    <li v-for="m in filteredCandidates" :key="m.id">
                      <label
                        class="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-page/60 transition-colors"
                        :class="selected.has(m.id) ? 'bg-brand/5' : ''"
                      >
                        <input
                          type="checkbox"
                          class="w-4 h-4 accent-brand shrink-0"
                          :checked="selected.has(m.id)"
                          @change="toggleSelect(m.id)"
                        />
                        <div class="w-8 h-8 rounded-lg bg-navy/5 text-navy/70 text-xs font-bold flex items-center justify-center shrink-0">
                          {{ (m.full_name || '?').charAt(0) }}
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-sm font-medium text-navy truncate">{{ m.full_name }}</p>
                          <p class="text-xs text-navy/50 truncate flex items-center gap-2">
                            <span class="inline-flex items-center gap-1">
                              <Icon name="book" class="w-3 h-3" />{{ m.grade || '—' }}
                            </span>
                            <span v-if="m.address" class="inline-flex items-center gap-1">
                              <Icon name="pin" class="w-3 h-3" />{{ m.address }}
                            </span>
                          </p>
                        </div>
                      </label>
                    </li>
                  </ul>
                </template>
              </div>

              <!-- Footer -->
              <div class="px-5 py-4 border-t border-border">
                <p v-if="addError" class="text-sm text-danger mb-3" role="alert">{{ addError }}</p>
                <div class="flex items-center justify-between gap-3">
                  <div class="text-sm min-w-0">
                    <template v-if="selected.size">
                      اخترت <b class="text-navy">{{ selected.size }}</b>
                      <button type="button" @click="selected.clear()" class="text-brand hover:underline mr-2">إلغاء التحديد</button>
                    </template>
                    <span v-else class="text-navy/50">اختار مخدومين للإضافة</span>
                  </div>
                  <button
                    type="button"
                    @click="addSelected"
                    :disabled="adding || selected.size === 0"
                    class="shrink-0 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {{ adding ? 'جارٍ الإضافة...' : selected.size ? `إضافة (${selected.size}) للمجموعة` : 'إضافة للمجموعة' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- ============ Nominate Leader Modal ============ -->
        <transition name="fade">
          <div
            v-if="showNominateLeader"
            class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
            @click.self="closeNominateLeader"
          >
            <div
              class="flex flex-col w-full sm:max-w-md max-h-[92vh] rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="nominate-title"
            >
              <!-- Sheet header -->
              <div class="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                <div class="min-w-0">
                  <h3 id="nominate-title" class="text-lg font-semibold text-navy">ترشيح ليدر لـ «{{ group.name }}»</h3>
                  <p class="text-xs text-navy/50 mt-0.5">
                    اختر عضو من المجموعة لترشيحه كقائد
                  </p>
                </div>
                <button
                  type="button"
                  @click="closeNominateLeader"
                  class="shrink-0 w-9 h-9 rounded-full text-navy/60 hover:bg-page hover:text-navy flex items-center justify-center transition-colors"
                  aria-label="إغلاق"
                >
                  <Icon name="x" class="w-5 h-5" />
                </button>
              </div>

              <!-- Body -->
              <div class="flex-1 overflow-y-auto min-h-[12rem] px-5 pb-4">
                <div v-if="eligibleForLeader.length === 0" class="py-14 px-5 text-center">
                  <p class="text-sm text-navy/60">مفيش أعضاء مؤهلين للترشيح في المجموعة</p>
                </div>

                <template v-else>
                  <label class="flex items-center gap-3 px-5 py-2.5 bg-page/60 border-b border-border text-sm text-navy cursor-pointer sticky top-0 z-10">
                    <input
                      type="checkbox"
                      class="w-4 h-4 accent-brand shrink-0"
                      :checked="false"
                    />
                    <span>اختر عضو</span>
                  </label>

                  <ul class="divide-y divide-border">
                    <li v-for="m in eligibleForLeader" :key="m.id">
                      <label
                        class="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-page/60 transition-colors"
                        :class="selectedLeaderId == m.id ? 'bg-brand/5' : ''"
                      >
                        <input
                          type="radio"
                          class="w-4 h-4 accent-brand shrink-0"
                          :checked="selectedLeaderId == m.id"
                          @change="selectedLeaderId = String(m.id)"
                        />
                        <div class="w-8 h-8 rounded-lg bg-navy/5 text-navy/70 text-xs font-bold flex items-center justify-center shrink-0">
                          {{ (m.full_name || '?').charAt(0) }}
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-sm font-medium text-navy truncate">{{ m.full_name }}</p>
                          <p class="text-xs text-navy/50 truncate flex items-center gap-2">
                            <span class="inline-flex items-center gap-1">
                              <Icon name="book" class="w-3 h-3" />{{ m.grade || '—' }}
                            </span>
                            <span v-if="m.address" class="inline-flex items-center gap-1">
                              <Icon name="pin" class="w-3 h-3" />{{ m.address }}
                            </span>
                          </p>
                        </div>
                      </label>
                    </li>
                  </ul>
                </template>
              </div>

              <!-- Footer -->
              <div class="px-5 py-4 border-t border-border">
                <p v-if="nominateError" class="text-sm text-danger mb-3" role="alert">{{ nominateError }}</p>
                <div class="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    @click="closeNominateLeader"
                    :disabled="nominateLoading"
                    class="px-4 py-2 rounded-lg border border-border text-navy hover:bg-page transition-colors disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    @click="submitNominateLeader"
                    :disabled="nominateLoading || !selectedLeaderId"
                    class="shrink-0 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {{ nominateLoading ? 'جارٍ الترشيح...' : 'ترشيح' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'
import { useCalculations } from '../composables/useCalculations'
import { calculateGroupScore as calculateGroupScoreUtil, getGroupChallengeDetails } from '../utils/groupScore'
import {
  ATTENDANCE_WINDOW_MEETINGS,
  RISK_LEVELS,
} from '../constants/app'
import PageHeader from '../components/PageHeader.vue'

/* ---------- Icons ---------- */
const ICONS = {
  'arrow-right': 'M9 5l7 7-7 7',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  check: 'M20 6 9 17l-5-5',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  chart: 'M3 3v18h18M7 14l4-4 4 4 5-5',
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6 6 18M6 6l12 12',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  clock: 'M12 8v4l2 2M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z',
}

const Icon = {
  props: { name: String },
  setup(props) {
    return () =>
      h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
          class: 'shrink-0',
        },
        [h('path', { d: ICONS[props.name] || '' })],
      )
  },
}

const Stat = {
  props: {
    label: String,
    value: [String, Number],
    tone: { type: String, default: 'default' },
    hint: { type: String, default: '' },
  },
  setup(props) {
    const toneClass = {
      default: 'text-navy',
      ok: 'text-success',
      danger: 'text-danger',
      gold: 'text-gold',
      muted: 'text-navy/40',
    }
    return () =>
      h('div', { class: 'bg-card px-4 py-3.5' }, [
        h('p', { class: 'text-xs text-navy/50 mb-1' }, props.label),
        h('p', { class: ['text-2xl font-bold tabular-nums', toneClass[props.tone] || toneClass.default] }, String(props.value)),
        props.hint ? h('p', { class: 'text-[11px] text-navy/40 mt-1 leading-snug' }, props.hint) : null,
      ])
  },
}

const route = useRoute()
const router = useRouter()

const user = JSON.parse(localStorage.getItem('user') || '{}')

/* ---------- Page state ---------- */
const group = ref(null)
const members = ref([])
const followupsMap = ref({})
const attendanceData = ref({}) // { 'YYYY-MM-DD_type': { [memberId]: boolean } }
const challenges = ref([])
const groupChallenges = ref([])
const loading = ref(true)
const loadError = ref('')
const notFound = ref(false)
const successMessage = ref('')
const sortBy = ref('name')

// Nominate Leader modal state
const showNominateLeader = ref(false)
const nominateLoading = ref(false)
const nominateError = ref('')
const selectedLeaderId = ref('')

const sortOptions = [
  { value: 'name', label: 'الاسم' },
  { value: 'risk', label: 'الأعلى خطراً' },
  { value: 'attendance', label: 'الأقل حضوراً' },
]

// Check if current user is the responsible servant (servant or co_servant) for this group
const isResponsibleServant = computed(() => {
  if (!group.value || !user.id) return false
  return group.value.servant_id === user.id || group.value.co_servant_id === user.id
})

// Eligible members for leader nomination (members of this group without a leader role)
const eligibleForLeader = computed(() => {
  return members.value.filter((m) => m.id !== group.value?.leader_id)
})

let successTimer
function showSuccess(text) {
  clearTimeout(successTimer)
  successMessage.value = text
  successTimer = setTimeout(() => (successMessage.value = ''), 3000)
}

/* ---------- Унифицированные вычисления ---------- */
const {
  attendanceRate,
  memberRows,
  needsFollowupCount,
  consecutiveAbsentList,
  consecutiveAbsentCount,
  calculateGroupScore: calcGroupScore,
  getFollowupStatus,
  getConsecutiveAbsent,
  CONSECUTIVE_ABSENT_THRESHOLD: CONSECUTIVE_ABSENT_THRESHOLD_CALC,
  FOLLOWUP_THRESHOLD_DAYS: FOLLOWUP_THRESHOLD_DAYS_CALC,
} = useCalculations(members, attendanceData, followupsMap)

// Alias для совместимости с шаблоном
const consecutiveAbsent = consecutiveAbsentList

// avgRisk computed from memberRows
const avgRisk = computed(() => {
  if (!memberRows.value.length) return 0
  return Math.round(memberRows.value.reduce((s, r) => s + (r.riskScore || 0), 0) / memberRows.value.length)
})

/* ---------- Score ---------- */
const scoreData = computed(() => {
  if (!group.value) return { total: 0, breakdown: [] }
  return calculateGroupScoreUtil(
    group.value,
    members.value,
    groupChallenges.value,
    challenges.value,
  )
})

/* ---------- Styling helpers (using constants) ---------- */
function scoreLevelClass(score) {
  if (score >= 80) return 'text-success'
  if (score >= 40) return 'text-gold'
  return 'text-danger'
}
function scoreLevelLabel(score) {
  if (score >= 80) return 'ممتاز'
  if (score >= 60) return 'جيد'
  if (score >= 40) return 'متوسط'
  return 'ضعيف'
}
function rateChip(rate) {
  if (rate === null) return 'bg-navy/5 text-navy/40'
  if (rate >= 70) return 'bg-success/10 text-success'
  if (rate >= 50) return 'bg-gold/15 text-gold'
  return 'bg-danger/10 text-danger'
}
function riskText(score) {
  if (score >= RISK_LEVELS.high.min) return 'text-danger'
  if (score >= RISK_LEVELS.medium.min) return 'text-gold'
  return 'text-success'
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/groups')
}

/* ---------- Nominate Leader ---------- */
function openNominateLeader() {
  selectedLeaderId.value = ''
  nominateError.value = ''
  showNominateLeader.value = true
}

function closeNominateLeader() {
  showNominateLeader.value = false
}

async function submitNominateLeader() {
  if (!selectedLeaderId.value) {
    nominateError.value = 'اختر عضو لترشيحه'
    return
  }

  nominateLoading.value = true
  nominateError.value = ''

  try {
    // POST /groups/:id/nominate-leader
    await api.post(`/groups/${group.value.id}/nominate-leader`, {
      member_id: Number(selectedLeaderId.value),
    })

    showNominateLeader.value = false
    showSuccess('تم ترشيح العضو كليد بنجاح ✅')
    await loadData(true)
  } catch (e) {
    console.error(e)
    nominateError.value = e.response?.data?.message || 'فشل الترشيح، حاول تاني'
  } finally {
    nominateLoading.value = false
  }
}

/* ---------- Load ---------- */
async function loadData(silent = false) {
  if (!silent) loading.value = true
  loadError.value = ''
  notFound.value = false
  try {
    const { data } = await api.get(`/groups/${route.params.id}/full`)
    group.value = data.group
    members.value = data.members
    followupsMap.value = data.followups
    attendanceData.value = data.attendance
    challenges.value = data.challenges
    groupChallenges.value = data.groupChallenges
  } catch (e) {
    console.error(e)
    if (silent) return // نسيب البيانات الحالية زي ما هي
    group.value = null
    notFound.value = e.response?.status === 404
    loadError.value = e.response?.data?.message || 'تأكد من الاتصال بالإنترنت وحاول تاني'
  } finally {
    if (!silent) loading.value = false
  }
}

/* ======================================================
   إضافة أعضاء من المخدومين اللي مش في مجموعات
   ====================================================== */
const showAdd = ref(false)
const candidates = ref([])
const addLoading = ref(false)
const addLoadError = ref('')
const addError = ref('')
const adding = ref(false)
const selected = reactive(new Set())

const addSearch = ref('')
const townFilter = ref('all')
const gradeFilter = ref('all')
const NO_VALUE = '__none__'

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim()
}

const townKey = (m) => (m.address || '').trim() || NO_VALUE
const gradeKey = (m) => (m.grade || '').trim() || NO_VALUE

function buildOptions(list, keyOf) {
  const map = new Map()
  for (const m of list) {
    const k = keyOf(m)
    map.set(k, (map.get(k) || 0) + 1)
  }
  const opts = [...map.entries()]
    .map(([value, count]) => ({ value, count, label: value === NO_VALUE ? 'غير محدد' : value }))
    .sort((a, b) => (a.value === NO_VALUE) - (b.value === NO_VALUE) || a.label.localeCompare(b.label, 'ar'))
  return [{ value: 'all', label: 'الكل', count: list.length }, ...opts]
}

const townOptions = computed(() => buildOptions(candidates.value, townKey))
const gradeOptions = computed(() => buildOptions(candidates.value, gradeKey))

const filteredCandidates = computed(() => {
  const q = norm(addSearch.value)
  return candidates.value
    .filter((m) => {
      if (townFilter.value !== 'all' && townKey(m) !== townFilter.value) return false
      if (gradeFilter.value !== 'all' && gradeKey(m) !== gradeFilter.value) return false
      if (q && !norm(m.full_name).includes(q)) return false
      return true
    })
    .sort((a, b) => a.full_name.localeCompare(b.full_name, 'ar'))
})

const allVisibleSelected = computed(
  () => filteredCandidates.value.length > 0 && filteredCandidates.value.every((m) => selected.has(m.id)),
)

function toggleSelect(id) {
  if (selected.has(id)) selected.delete(id)
  else selected.add(id)
}

function toggleAllVisible() {
  if (allVisibleSelected.value) filteredCandidates.value.forEach((m) => selected.delete(m.id))
  else filteredCandidates.value.forEach((m) => selected.add(m.id))
}

function resetAddFilters() {
  addSearch.value = ''
  townFilter.value = 'all'
  gradeFilter.value = 'all'
}

// المخدوم "من غير مجموعة" = مفيش group_id ولا group_name
const hasGroup = (m) => !!(m.group_id || m.group_name)

async function loadCandidates() {
  addLoading.value = true
  addLoadError.value = ''
  try {
    const { data } = await api.get('/members')
    const inThisGroup = new Set(members.value.map((m) => m.id))
    candidates.value = data.filter((m) => !hasGroup(m) && !inThisGroup.has(m.id))
  } catch (e) {
    console.error(e)
    addLoadError.value = e.response?.data?.message || 'فشل تحميل المخدومين'
  } finally {
    addLoading.value = false
  }
}

function openAdd() {
  selected.clear()
  resetAddFilters()
  addError.value = ''
  showAdd.value = true
  loadCandidates()
}

function closeAdd() {
  if (adding.value) return
  showAdd.value = false
}

async function addSelected() {
  if (!selected.size || adding.value) return
  adding.value = true
  addError.value = ''
  try {
    const ids = [...selected]
    await api.post(`/groups/${group.value.id}/members`, { member_ids: ids })
    showAdd.value = false
    showSuccess(`تمت إضافة ${ids.length} مخدوم للمجموعة ✅`)
    selected.clear()
    await loadData(true)
  } catch (e) {
    console.error(e)
    addError.value = e.response?.data?.message || 'فشلت الإضافة، حاول تاني'
  } finally {
    adding.value = false
  }
}

/* ---------- Escape + قفل سكرول الصفحة ---------- */
function onKeydown(e) {
  if (e.key === 'Escape' && showAdd.value) closeAdd()
}

watch(showAdd, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  loadData()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  clearTimeout(successTimer)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.chip {
  display: inline-block;
  font-size: 11px;
  line-height: 1.6;
  padding: 0 0.5rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.filter-chip {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}
</style>