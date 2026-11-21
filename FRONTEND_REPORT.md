# تقرير تحليل مشروع الفرونت إند - خدمة إعدادي

> **تاريخ التقرير:** 20 نوفمبر 2026  
> **الإصدار:** 1.0  
> **المشروع:** واجهة إدارة خدمة إعدادي دير القديسين بالطود

---

## 1. التقنيات المستخدمة

| التصنيف | التقنية | الإصدار | ملاحظات |
|-----------|---------|---------|---------|
| **Framework** | Vue 3 | 3.5.12 | Composition API + `<script setup>` |
| **Build Tool** | Vite | 5.4.10 | HOT reload، تحسينات الإنتاج |
| **Routing** | Vue Router | 4.4.5 | `createWebHistory`، guards للتنقل |
| **State Management** | Local Storage + Reactive State | - | لا يوجد Pinia/Vuex، الاعتماد على `ref`/`reactive` و `localStorage` للتوكن والمستخدم |
| **UI Library** | **Tailwind CSS** | 3.4.14 | Custom CSS Variables للألوان (نظام تصميم مخصص) |
| **HTTP Client** | Axios | 1.7.7 | Interceptors للتوكن و 401 handling |
| **PWA** | vite-plugin-pwa | 2.0.0 | Service Worker، Offline support، Cache strategies |
| **Charts/Export** | html2canvas, jsPDF, xlsx | 1.4.1, 4.2.1, 0.18.5 | طباعة البطاقات، PDF، Excel export |
| **QR/Scanner** | html5-qrcode, qrcode | 2.3.8, 1.5.4 | مسح QR للحضور، توليد QR للبطاقات |
| **Icons** | SVG Inline (Custom) | - | لا مكتبة أيقونات خارجية، SVG paths مدمجة |

### مميزات التقنية المتبعة:
- **لا توجد مكتبات UI ثقيلة** (لا Vuetify، لا PrimeVue، لا Element Plus) — الكود خفيف وقابل للتخصيص بالكامل
- **CSS Variables** للألوان تدعم Dark/Light mode تلقائياً
- **Component-driven architecture** مع Composables للمنطق المشترك
- **TypeScript غير مستخدم** — JavaScript مع JSDoc في بعض الأماكن

---

## 2. هيكل الفولدرات وشرح كل جزء

```
frontend/
├── public/                      # ملفات ثابتة (manifest، icons)
├── dev-dist/                    # Build للتطوير (SW development)
├── dist/                        # Build للإنتاج
├── src/
│   ├── api/
│   │   └── client.js           # Axios instance + interceptors (auth، 401 handling)
│   ├── assets/                 # صور، لوجو
│   ├── components/             # Shared UI Components (15 component)
│   │   ├── PageHeader.vue      # رأس صفحة موحد (عنوان، إجراءات، زر رجوع/منزل)
│   │   ├── SearchFilter.vue    # بحث + فلاتر select مع عرض الفلاتر النشطة
│   │   ├── Pagination.vue      # ترقيم صفحات
│   │   ├── Skeleton.vue        # Skeleton loaders (Table، Card، Generic)
│   │   ├── EmptyState.vue      # حالات فارغة مع أيقونة ووصف وأزرار إجراءات
│   │   ├── NotificationBell.vue # جرس إشعارات مع polling كل دقيقة
│   │   ├── OfflineIndicator.vue # مؤشر اتصال (Online/Offline)
│   │   ├── QRScanner.vue       # مسح QR بالكاميرا (html5-qrcode)
│   │   ├── WhatsAppButton.vue  # قوالب رسائل واتساب جاهزة
│   │   ├── MemberQR.vue        # عرض QR كود العضو
│   │   ├── MemberFollowups.vue # سجل افتقاد عضو
│   │   ├── MemberNotes.vue     # ملاحظات عضو
│   │   ├── GroupMeetings.vue   # اجتماعات مجموعة
│   │   ├── GroupNotes.vue      # ملاحظات مجموعة
│   │   └── PullToRefreshIndicator.vue # Pull-to-refresh للموبايل
│   ├── composables/            # منطق مشترك قابل لإعادة الاستخدام
│   │   ├── useAutoSave.js      # حفظ تلقائي للمسودات في localStorage
│   │   ├── usePagination.js    # منطق ترقيم الصفحات
│   │   ├── usePullToRefresh.js # Pull-to-refresh logic
│   │   ├── useTheme.js         # Dark/Light mode toggle
│   │   └── ThemeToggle.vue     # مكون تبديل الثيم
│   ├── config.js               # DEMO_MODE flag
│   ├── router/
│   │   └── index.js            # 35+ route مع meta (adminOnly، public، title)
│   ├── utils/
│   │   ├── riskScore.js        # خوارزمية حساب درجة الخطر (0-100)
│   │   ├── groupScore.js       # خوارزمية حساب نقاط المجموعة
│   │   ├── auditLog.js         # API و labels لسجل النشاط
│   │   └── bibleBooks.js       # بيانات أسفار الكتاب المقدس
│   ├── views/                  # الصفحات (30+ view)
│   │   ├── Dashboard.vue       # لوحة التحكم الرئيسية (معقدة جداً)
│   │   ├── Login.vue           # تسجيل الدخول
│   │   ├── MemberList.vue      # قائمة المخدومين مع بحث/فلاتر/تصدير
│   │   ├── MemberForm.vue      # تسجيل/تعديل مخدوم (مع auto-save)
│   │   ├── MemberDetails.vue   # تفاصيل مخدوم
│   │   ├── MemberEdit.vue      # تعديل مخدوم
│   │   ├── MemberCard.vue      # بطاقة مخدوم قابلة للطباعة (4 في A4)
│   │   ├── GroupsList.vue      # قائمة المجموعات
│   │   ├── GroupDetails.vue    # تفاصيل المجموعة + إضافة أعضاء + ترشيح ليدر
│   │   ├── GroupChallenges.vue # تحديات المجموعة
│   │   ├── Attendance.vue      # تسجيل الحضور (مع QR scanner)
│   │   ├── AttendanceReport.vue # تقارير الحضور (Heatmap، إحصائيات)
│   │   ├── Followups.vue       # الافتقاد (محتاجين تواصل)
│   │   ├── Reports.vue         # تقارير عامة
│   │   ├── AuditLog.vue        # سجل النشاط
│   │   ├── Settings.vue        # إعدادات (Backup/Restore، Clear data)
│   │   ├── ServantsList.vue    # قائمة الخدام
│   │   ├── ServantDetails.vue  # بروفايل خادم
│   │   ├── ServantsApproval.vue # موافقات طلبات إضافة خدام
│   │   ├── ChallengesList.vue  # التحديات
│   │   ├── ChallengesApproval.vue # موافقات اشتراك التحديات
│   │   ├── ChallengeDetails.vue # تفاصيل تحدي
│   │   ├── LeadersApproval.vue # موافقات ترشيح الليدز
│   │   ├── ReadingBooksList.vue # أسفار القراءة
│   │   ├── ReadingsList.vue    # القراءات
│   │   ├── ReadingForm.vue     # تسجيل قراءة
│   │   ├── MyService.vue       # خدمتي (للخادم)
│   │   ├── Team.vue            # الفريق (للأدمن)
│   │   ├── ServantAttendance.vue # حضور الخدام
│   │   ├── ServantEvaluation.vue # تقييم الخدام
│   │   └── ServantsActivity.vue # نشاط الخدام
│   ├── App.vue                 # Root component (Bottom nav، NotificationBell، OfflineIndicator)
│   ├── main.js                 # Entry point
│   └── style.css               # Tailwind + CSS Variables + Component classes
├── index.html
├── package.json
├── vite.config.js              # PWA config، dev server port 3000
├── tailwind.config.js
└── postcss.config.js
```

---

## 3. قائمة كل الصفحات (Pages/Routes) ووظيفة كل صفحة

### 3.1 صفحات عامة (Public)
| المسار | الاسم | الوظيفة |
|--------|-------|----------|
| `/login` | login | تسجيل الدخول (email/password) — يوجّه للقارئ لـ `/readings` وللغير لـ `/dashboard` |
| `/readings` | readings | عرض القراءات (عام) |
| `/readings/new` | reading-new | تسجيل قراءة جديدة (عام — للمسجلين ك `reader`) |

### 3.2 صفحات الأدمن فقط (`adminOnly: true`)
| المسار | الاسم | الوظيفة |
|--------|-------|----------|
| `/users` | users | إدارة الحسابات (CRUD كامل، تغيير باسورد/دور/حالة) |
| `/audit-log` | audit-log | سجل النشاط (جميع العمليات في النظام) |
| `/settings` | settings | إعدادات النظام (Backup/Restore، Clear demo data) |
| `/team` | team | إدارة الفريق (عرض الخدام، تفاصيل) |
| `/team/:id` | team-servant | تفاصيل خادم محدد |
| `/servant-attendance` | servant-attendance | تسجيل حضور الخدام |
| `/servant-evaluation` | servant-evaluation | تقييم الخدام |
| `/servants-activity` | servants-activity | تقرير نشاط شامل للخدام |
| `/servants-approval` | servants-approval | موافقة/رفض طلبات إضافة خدام جدد |
| `/challenges-approval` | challenges-approval | موافقة/رفض طلبات اشتراك في التحديات |
| `/leaders-approval` | leaders-approval | موافقة/رفض ترشيح الليدز للمجموعات |
| `/reading-books` | reading-books | إدارة أسفار القراءة |
| `/servant-details` (مع adminOnly) | servant-details | بروفايل خادم (للأدمن فقط) |

### 3.3 صفحات الأدوار الأخرى (servant، co_servant، group_leader)
| المسار | الاسم | الوظيفة | متاح لـ |
|--------|-------|----------|---------|
| `/` | dashboard | **لوحة التحكم الرئيسية** — إحصائيات، تنبيهات، اختصارات، أقسام | الكل |
| `/my-service` | my-service | خدمتي الشخصية (مخدومي، مجموعاتي، مهامي) | الخدام |
| `/members` | members | قائمة المخدومين (بحث، فلاتر، تصدير Excel، خطر) | الكل |
| `/members/new` | member-new | تسجيل مخدوم جديد (Auto-save draft) | الكل |
| `/members/:id` | member-details | تفاصيل مخدوم كاملة | الكل |
| `/members/:id/edit` | member-edit | تعديل بيانات مخدوم | الكل |
| `/members/:id/card` | member-card | بطاقة مخدوم قابلة للطباعة (QR + 4 في A4) | الكل |
| `/groups` | groups | قائمة المجموعات | الكل |
| `/groups/:id` | group-details | تفاصيل المجموعة (أعضاء، نقاط، إضافة أعضاء، ترشيح ليدر) | الكل |
| `/groups/:id/challenges` | group-challenges | تحديات المجموعة | الكل |
| `/attendance` | attendance | **تسجيل الحضور** (تاريخ، نوع اجتماع، QR scanner، bulk actions) | الكل |
| `/attendance-report` | attendance-report | **تقارير حضور** (Heatmap، إحصائيات، ترند، Top/Bottom) | الكل |
| `/followups` | followups | الافتقاد (من محتاج تواصل، تسجيل تواصل) | الكل |
| `/reports` | reports | تقارير عامة | الكل |
| `/servants` | servants | قائمة الخدام (فلترة، تصدير، إضافة، موافقة) | الكل (بدون adminOnly) |
| `/servants/:id` | servant-details | بروفايل خادم (للأدمن فقط حسب الكود) | الأدمن |
| `/challenges` | challenges | قائمة التحديات (CRUD للأدمن، اشتراك لغيرهم) | الكل |
| `/challenges/:id` | challenge-details | تفاصيل تحدي + مشاركين | الكل |

### 3.4 تفصيل **صفحة الداشبورد** (`Dashboard.vue` — 600+ سطر)
أعقد صفحة في المشروع، تحتوي على:

1. **Hero Section** — ترحيب بالاسم، دور المستخدم، مؤشر "صحة الخدمة" (دائرةProgress)، أزرار إجراءات سريعة (حضور، تسجيل مخدوم)
2. **4 كروت إحصائيات** — إجمالي مخدومين، حضور الأسبوع، غائبين 3 مرات، محتاجين افتقاد
3. **قسم "محتاج انتباهك"** — تبويبين: غياب متتالي + محتاجين افتقاد، مع قائمة قابلة للضغط للاتصال
4. **اختصارات** — روابط سريعة للأقسام الرئيسية (تقرير حضور، قراءات، تحديات، مجموعات، تقارير، حضور خدام، نشاط خدام)
5. **كل الأقسام** — شبكة روابط مقسمة لـ "الخدمة" و "الإدارة" (للأدمن)، مع بحث فوري
6. **Bottom Navigation (Mobile)** — 4 أيقونات: رئيسية، حضور، مخدومين، افتقاد
7. **Mobile Bottom Nav** — شريط سفلي ثابت للموبايل

**API Calls في الداشبورد:** 3 استدعاءات متوازية عند التحميل:
- `GET /members`
- `GET /followups`
- `GET /attendance`

---

## 4. الـ Components الرئيسية وإزاي بتتشارك

### 4.1 Components التشاركية (Shared Components)
| Component | الاستخدام | Props رئيسية | Emits |
|-----------|-----------|---------------|-------|
| **PageHeader** | رأس موحد لكل الصفحات | `title`، `subtitle`، `showBack`، `showHome`، `backRoute` | slot `actions` |
| **SearchFilter** | بحث + فلاتر select متعددة | `modelValue`، `searchPlaceholder`، `filters`، `filtersValues` | `update:modelValue`، `update:filter`، `clear` |
| **Pagination** | ترقيم صفحات | `currentPage`، `totalPages` | `prev`، `next`، `go` |
| **EmptyState** | حالات فارغة | `icon`، `title`، `description`، `tone` | slot `actions` |
| **Skeleton\*** | Loading placeholders | `rows`، `columns`، `count` | - |
| **NotificationBell** | جرس إشعارات عام | - | - (تستخدم router داخلياً) |
| **QRScanner** | مسح QR | - | `scanned(id)`، `close` |
| **WhatsAppButton** | قوالب واتساب | `phone`، `memberName`، `parentName` | - |
| **OfflineIndicator** | مؤشر اتصال | - | - |

### 4.2 Composables المشتركة
| Composable | الوظيفة | الصفحات المستخدمة فيها |
|------------|----------|------------------------|
| **useAutoSave** | حفظ مسودة في localStorage مع debounce | `MemberForm.vue` |
| **usePagination** | منطق ترقيم الصفحات | `MemberList.vue`، `Followups.vue`، `AttendanceReport.vue` |
| **usePullToRefresh** | Pull-to-refresh للموبايل | `Followups.vue`، `Attendance.vue` |
| **useTheme** | Dark/Light mode | `App.vue`، `Dashboard.vue`، `Settings.vue` |

### 4.3 Utils المشتركة (Business Logic)
| Utility | الوظيفة | تستخدم في |
|---------|----------|-----------|
| **riskScore.js** | حساب درجة خطر العضو (0-100) + اقتراحات متابعة | `MemberList.vue`، `Dashboard.vue`، `GroupDetails.vue`، `Followups.vue`، `NotificationBell.vue` |
| **groupScore.js** | حساب نقاط المجموعة (حضور، افتقاد، أعضاء جدد، تحديات) | `GroupDetails.vue`، `Dashboard.vue` |
| **auditLog.js** | API لسجل النشاط + Action labels | `UsersList.vue`، `LeadersApproval.vue`، `ChallengesApproval.vue`، `Settings.vue` |

### 4.4 نمط المشاركة
- **Composition API** مع `<script setup>` في كل المكونات
- **لا يوجد Global State Management** — كل view تدير state خاص بها وتستدعي API مباشرة
- **البيانات المشتركة** (members، followups، attendance) تُحمل في كل صفحة على حدة — **لا يوجد caching مركزي**
- **LocalStorage** يستخدم للـ: token، user، demo data، auto-save drafts

---

## 5. الاتصال بالباك: كل الـ API Calls المستخدمة وفين في الكود

### 5.1 Axios Client (`src/api/client.js`)
```javascript
baseURL: 'https://service-api.wanesrefat.workers.dev/api'
timeout: 20000
```
**Interceptors:**
- **Request:** يضيف `Authorization: Bearer <token>` من localStorage
- **Response:** عند 401 يمسح token/user ويعيد للتسجيل

### 5.2 قائمة الـ Endpoints المستخدمة

| Endpoint | Method | مستخدم في | وصف |
|----------|--------|-----------|------|
| `/auth/login` | POST | `Login.vue` | تسجيل دخول |
| `/members` | GET | `Dashboard.vue`، `MemberList.vue`، `MemberForm.vue`، `GroupDetails.vue`، `Followups.vue`، `Attendance.vue`، `AttendanceReport.vue`، `ServantDetails.vue`، `MemberCard.vue`، `MemberDetails.vue` | قائمة المخدومين |
| `/members` | POST | `MemberForm.vue` | إنشاء مخدوم |
| `/members/:id` | GET | `MemberDetails.vue`، `MemberEdit.vue`، `MemberCard.vue` | تفاصيل مخدوم |
| `/members/:id` | PUT | `MemberEdit.vue` | تحديث مخدوم |
| `/members/:id` | DELETE | `MemberList.vue`، `MemberDetails.vue` | حذف مخدوم |
| `/followups` | GET | `Dashboard.vue`، `MemberList.vue`، `GroupDetails.vue`، `Followups.vue`، `NotificationBell.vue` | سجل الافتقاد |
| `/followups` | POST | `Followups.vue`، `Attendance.vue` (scan) | تسجيل تواصل |
| `/attendance` | GET | `Dashboard.vue`، `MemberList.vue`، `GroupDetails.vue`، `Attendance.vue`، `AttendanceReport.vue`، `NotificationBell.vue` | سجل الحضور |
| `/attendance` | POST | `Attendance.vue` | حفظ الحضور (bulk) |
| `/attendance/scan` | POST | `Attendance.vue` (QRScanner) | مسح QR للحضور |
| `/users` | GET | `MemberList.vue`، `MemberForm.vue`، `ServantsList.vue`، `UsersList.vue`، `ServantDetails.vue`، `NotificationBell.vue`، `ServantsApproval.vue` | قائمة المستخدمين/الخدام |
| `/users` | POST | `ServantsList.vue`، `UsersList.vue` | إضافة خادم/مستخدم |
| `/users/:id` | GET | `ServantDetails.vue` | تفاصيل خادم |
| `/users/:id` | PUT | `ServantsList.vue`، `UsersList.vue` | تحديث خادم |
| `/users/:id` | DELETE | `ServantsList.vue`، `UsersList.vue` | حذف خادم |
| `/users/:id/approve` | PATCH | `ServantsList.vue`، `ServantsApproval.vue` | موافقة/رفض طلب خادم |
| `/users/:id/role` | PATCH | `UsersList.vue` | تغيير الدور |
| `/users/:id/status` | PATCH | `UsersList.vue` | تغيير الحالة |
| `/users/:id/password` | PATCH | `UsersList.vue` | تغيير الباسورد |
| `/groups` | GET | `MemberForm.vue`، `GroupDetails.vue`، `GroupsList.vue`، `LeadersApproval.vue`، `ChallengesApproval.vue`، `NotificationBell.vue`، `ServantDetails.vue` | قائمة المجموعات |
| `/groups/:id/full` | GET | `GroupDetails.vue` | تفاصيل كاملة للمجموعة (أعضاء، حضور، افتقاد، تحديات) |
| `/groups/:id/members` | POST | `GroupDetails.vue` | إضافة أعضاء للمجموعة |
| `/groups/:id/nominate-leader` | POST | `GroupDetails.vue` | ترشيح ليدر |
| `/groups/:id/approve-leader` | PATCH | `LeadersApproval.vue` | موافقة على ليدر |
| `/groups/:id/reject-leader` | PATCH | `LeadersApproval.vue` | رفض ليدر |
| `/groups/:id/leader` | DELETE | `LeadersApproval.vue` | إزالة ليدر |
| `/challenges` | GET | `ChallengesList.vue`، `ChallengesApproval.vue`، `Dashboard.vue`، `GroupChallenges.vue`، `NotificationBell.vue` | قائمة التحديات |
| `/challenges` | POST | `ChallengesList.vue` | إنشاء تحدي |
| `/challenges/:id` | PUT | `ChallengesList.vue` | تحديث تحدي |
| `/challenges/:id` | DELETE | `ChallengesList.vue` | حذف تحدي |
| `/challenges/:id/participants` | GET | `ChallengesList.vue`، `ChallengesApproval.vue`، `GroupChallenges.vue`، `ChallengeDetails.vue` | مشاركي التحدي |
| `/challenges/participants/:id` | PATCH | `ChallengesApproval.vue` | موافقة/رفض اشتراك |
| `/audit-log` | GET | `AuditLog.vue` | سجل النشاط |
| `/audit-log` | DELETE | `Settings.vue`، `AuditLog.vue` | مسح السجل |
| `/reading-books` | GET | `ReadingBooksList.vue` | أسفار القراءة |
| `/readings` | GET | `ReadingsList.vue` | القراءات |
| `/readings` | POST | `ReadingForm.vue` | تسجيل قراءة |

### 5.3 ملاحظات على الـ API
- **لا يوجد API موحد للـ Dashboard** — يحمل 3 endpoints متوازية
- **GroupDetails** يستخدم endpoint مخصص `/groups/:id/full` يرجع كل شيء دفعة واحدة
- **لا يوجد Request Deduplication** — نفس البيانات قد تُحمل في صفحات متعددة
- **Error Handling** بسيط: `try/catch` مع `alert()` أو toast بسيط

---

## 6. إدارة الـ Authentication والصلاحيات في الواجهة

### 6.1 Authentication Flow
1. **Login** (`Login.vue`) → POST `/auth/login` → يحفظ `token` و `user` في `localStorage`
2. **Axios Interceptor** يضيف token تلقائياً لكل طلب
3. **401 Response** → يمسح البيانات ويعيد لـ `/login`

### 6.2 Route Guards (`router/index.js`)
```javascript
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // صفحات عامة
  if (to.meta.public) { ... }
  
  // لا يوجد توكن
  if (!token) return { name: 'login' }
  
  // قارئ (reader) — فقط صفحة القراءات
  if (user.role === 'reader' && to.name !== 'reading-new') {
    return { name: 'reading-new' }
  }
  
  // Admin only pages
  if (to.meta.adminOnly && user.role !== 'admin') {
    if (user.role === 'reader') return { name: 'reading-new' }
    return { name: 'dashboard' }
  }
  
  return true
})
```

### 6.3 الأدوار (Roles) والصلاحيات
| الدور | الوصف | الصفحات المتاحة | ملاحظات |
|-------|-------|-----------------|---------|
| `admin` | مدير النظام | **جميع الصفحات** بما فيها `/users`، `/settings`، `/audit-log`، `/team`، `/servant-*`، `/leaders-approval`، `/servants-approval`، `/challenges-approval`، `/reading-books` | صلاحيات كاملة |
| `servant` | خادم | Dashboard، Members، Groups، Attendance، Followups، Challenges، My Service، Servants List (قراءة فقط) | يرى مخدوميه فقط في بعض الصفحات |
| `co_servant` | خادم مساعد | مثل `servant` | - |
| `group_leader` | ليدر مجموعة | مثل `servant` + إدارة مجموعته | - |
| `reader` | مسجل قراءات | **فقط** `/readings` و `/readings/new` | محجوب عن باقي النظام |

### 6.4 UI-Level Authorization
- **`v-if="isAdmin"`** على أزرار الحذف، التعديل، التصدير
- **`v-if="user.role !== 'reader'"`** لإخفاء أقسام كاملة
- **`canEdit()`** في `ServantsList.vue` — الخادم يعدل فقط ما أضافه وهو `pending`
- **Bottom Nav** مخفي للأدمن، ظاهر لغيرهم (`App.vue`)

### 6.5 مشاكل في الـ Auth
1. **لا يوجد Refresh Token** — الـ token قد ينتهي والمستخدم يطرد فجأة
2. **الـ Role في localStorage** — يمكن التلاعب به من Console (Client-side only)
3. **لا يوجد Permission-based Components** — مجرد `v-if` على الأزرار
4. **Route Guard يعتمد على `localStorage` فقط** — لا يتحقق من صلاحية التوكن مع السيرفر

---

## 7. أجزاء ناقصة أو مش متوصلة بالباك (Mock Data / TODO)

### 7.1 بيانات Mock / Demo Mode
```javascript
// src/config.js
export const DEMO_MODE = false
```
- **`Settings.vue`** يقرأ من `localStorage` مفاتيح `demo_*` عند `DEMO_MODE = true`
- **`MemberForm.vue`** يحتوي قائمة `areas` ثابتة (14 منطقة) — **يجب أن تأتي من API**
- **`grades`** قائمة ثابتة في عدة ملفات — **يجب أن تأتي من API أو Config**

### 7.2 صفحات/مكونات غير مكتملة
| الملف | الحالة | الملاحظات |
|-------|--------|-----------|
| `ServantForm.vue` | **ملف فارغ (0 bytes)** | غير مستخدم — `ServantsList` يستخدم modal داخلي |
| `ServantEvaluation.vue` | UI فقط | لا توجد API calls للتقييم الفعلي |
| `ServantAttendance.vue` | UI فقط | لا توجد API calls لحضور الخدام |
| `ServantsActivity.vue` | UI فقط | لا توجد API calls لنشاط الخدام |
| `Reports.vue` | Basic | تقارير بسيطة، غير متصلة بـ API متقدم |
| `Team.vue` | Basic | مجرد قائمة، لا تفاصيل |
| `ReadingBooksList.vue` | CRUD UI | API endpoints غير مؤكدة |
| `ReadingForm.vue` | Form UI | للـ `reader` role فقط |
| `ChallengeDetails.vue` | موجود | يحتاج مراجعة API calls |

### 7.3 Features مش متصلة بالباك
1. **Notifications** — `NotificationBell.vue` تحسب الإشعارات **محلياً** من البيانات المحملة (followups، attendance، servants) — **لا يوجد Push notifications ولا WebSocket**
2. **Auto-save** — محفوظ في `localStorage` فقط، لا يُرسل للسيرفر
3. **Export Excel/PDF** — يتم **محلياً** في المتصفح (xlsx، html2canvas، jsPDF)
4. **QR Code Generation** — يتم محلياً بمكتبة `qrcode`
5. **Risk Score / Group Score** — تحسب **محلياً** في الفرونت (`riskScore.js`، `groupScore.js`)

### 7.4 TODOs في الكود (Comments)
- `MemberList.vue` سطر 35: `// ✅ شيلنا adminOnly من /servants`
- `GroupDetails.vue` سطر 58: `// ترشيح ليدر - للخادم المسؤول أو المساعد فقط`
- `ChallengesApproval.vue` سطر 178: `// Based on the audit, the backend's GET /groups should include these fields`
- عدة أماكن بـ `// TODO` أو `// FIXME` في التعليقات

---

## 8. مشاكل في الـ UX أو الكود أو الأداء

### 8.1 مشاكل الأداء (Performance)
| المشكلة | الموقع | التأثير | الحل المقترح |
|----------|---------|---------|-------------|
| **إعادة تحميل البيانات في كل صفحة** | جميع الـ Views | بطء التنقل، عبء على السيرفر | Centralized State (Pinia) + Caching |
| **Dashboard يحمل 3 APIs متتالية** | `Dashboard.vue:565` | تأخير أول تحميل | Combine في endpoint واحد `/dashboard/stats` |
| **GroupDetails يحمل بيانات ضخمة** | `GroupDetails.vue:845` | بطء في المجموعات الكبيرة | Pagination للأعضاء، Lazy loading |
| **ChallengesApproval يحمل participants لكل challenge في حلقة** | `ChallengesApproval.vue:226` | N+1 Problem | Batch endpoint أو include في `/challenges` |
| **NotificationBell polling كل دقيقة بـ 5-6 APIs** | `NotificationBell.vue:191` | استهلاك موارد، بطء | WebSocket أو Server-Sent Events |
| **لا يوجد Virtual Scrolling** | قوائم طويلة (Members، Attendance) | بطء في DOM | `@tanstack/vue-virtual` أو مشابه |
| **صور اللوجو مكررة في MemberCard** | `MemberCard.vue` | حجم طباعة كبير | تحسين CSS print، SVG بدلاً من PNG |

### 8.2 مشاكل الكود (Code Quality)
| المشكلة | أمثلة |
|----------|--------|
| **تكرار منطق كبير** | حساب `consecutiveAbsent`، `needsFollowup`، `attendanceRate` مكرر في: `Dashboard.vue`، `GroupDetails.vue`، `Followups.vue`، `AttendanceReport.vue`، `NotificationBell.vue`، `MemberList.vue` |
| **Magic Numbers** | `RECENT = 4`، `STREAK_WINDOW = 8`، `FOLLOWUP_DAYS = 30`، `MAX_ROWS = 5` في `Dashboard.vue` |
| **Inline SVG Icons مكررة** | كل view/component فيه `ICONS` object مكرر (30+ تعريف) |
| **لا يوجد TypeScript** | صيانة صعبة، لا type safety للـ API responses |
| **Business Logic في Components** | `Dashboard.vue` 600+ سطر، `GroupDetails.vue` 1000+ سطر، `Attendance.vue` 670 سطر |
| **Error Handling ضعيف** | `alert()` في عدة أماكن، لا يوجد Toast system موحد |
| **Hardcoded Strings** | نصوص عربية في الكود، لا i18n |
| **`console.error` في الإنتاج** | في كل catch blocks |

### 8.3 مشاكل UX/UI
| المشكلة | التفاصيل |
|----------|-----------|
| **لا يوجد Loading States موحدة** | كل صفحة تدير loading بطريقتها (Skeleton، Spinner، Text) |
| **لا يوجد Confirmation Dialogs موحدة** | `confirm()` nativos المتصفح — غير متناسق |
| **Toast Notifications بسيطة** | متغيرة محلية `successMessage` في كل view — لا يوجد نظام مركزي |
| **Offline Support محدود** | `OfflineIndicator` يعرض الحالة فقط، لا يوجد Queue للعمليات |
| **Accessibility (a11y)** | ناقصة: `aria-labels` في بعض الأماكن، focus management في modals، color contrast في بعض الـ chips |
| **Mobile UX** | Bottom nav موجود لكن بعض الجداول لا تتجاوب جيداً، modals لا تغلق بال swipe down |
| **Empty States غير موحدة** | نصوص مختلفة، أيقونات مختلفة |
| **لا يوجد Undo Actions** | حذف فوري بدون إمكانية التراجع |

### 8.4 مشاكل أمنية (Security)
1. **Role في localStorage** — يمكن تغيير `user.role` لـ `admin` من Console
2. **لا يوجد CSRF Protection** — axios لا يرسل CSRF token
3. **Password في Plain Text** في `UsersList.vue` عند تغيير الباسورد (يظهر للمستخدم)
4. **لا يوجد Rate Limiting** على الواجهة (Login، QR Scan، Save)
5. **QR Scanner** يفتح كاميرا بدون تحقق من الصلاحيات بوضوح

---

## 9. اقتراحات تطوير للواجهة

### 9.1 أولوية عالية (Critical)

#### 1. **Centralized State Management (Pinia)**
```javascript
// Stores مقترحة:
- useAuthStore()        // token، user، permissions، login/logout
- useMembersStore()     // members، followups، attendance، caching
- useGroupsStore()      // groups، challenges، leaders
- useChallengesStore()  // challenges، participants
- useNotificationsStore() // real-time notifications
- useUIStore()          // toasts، modals، loading states
```
**الفائدة:** إلغاء التكرار، caching ذكي، optimistic updates، reactivity عبر المكونات.

#### 2. **API Layer موحد (Service Layer)**
```javascript
// src/services/api.js
export const membersApi = {
  list: (params) => api.get('/members', { params }),
  get: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  // ...
}
```
**الفائدة:** DRY، سهولة الـ mocking للاختبارات، error handling موحد، request deduplication.

#### 3. **Dashboard Endpoint مخصص**
```bash
GET /api/dashboard/stats
# Response: { membersCount, attendanceRate, consecutiveAbsent, needsFollowup, healthScore, ... }
```
**الفائدة:** تقليل 3 requests لـ 1، تحسين أول تحميل الداشبورد.

#### 4. **TypeScript Migration**
- ابدأ بـ `shims-vue.d.ts`، `env.d.ts`
- Interface لكل API Response
- Type-safe Composables و Stores

### 9.2 أولوية متوسطة (High Impact)

#### 5. **Notification System موحد**
```javascript
// src/composables/useToast.js
export function useToast() {
  const toasts = ref([])
  const show = (type, message, options) => { ... }
  return { toasts, show, success, error, warning, info }
}
```
- استبدال كل `successMessage`/`alert()` بنظام Toast واحد
- دعم queue، auto-dismiss، actions

#### 6. **Confirmation Dialog Component**
```vue
<!-- ConfirmDialog.vue -->
<Teleport to="body">
  <dialog v-model:open="open" class="modal">
    <p>{{ message }}</p>
    <div class="actions">
      <button @click="resolve(false)">إلغاء</button>
      <button @click="resolve(true)" :class="variant">{{ confirmText }}</button>
    </div>
  </dialog>
</Teleport>
```
- استبدال كل `window.confirm()` بـ component قابل للتخصيص

#### 7. **Virtual Scrolling للقوائم الطويلة**
```bash
npm install @tanstack/vue-virtual
```
- `MemberList.vue`، `Attendance.vue`، `AttendanceReport.vue` (Heatmap)

#### 8. **Offline-First Architecture**
- Queue للعمليات (Attendance، Followups) عند انقطاع النت
- Background Sync عند عودة الاتصال
- IndexedDB للبيانات الكبيرة

#### 9. **Real-time Notifications (WebSocket/SSE)**
- استبدال polling في `NotificationBell` بـ WebSocket
- Events: `member.created`، `attendance.recorded`، `followup.added`، `challenge.approved`

### 9.3 أولوية متوسطة (Code Quality)

#### 10. **Extract Business Logic إلى Composables**
```javascript
// src/composables/useAttendanceCalculations.js
export function useAttendanceCalculations(members, attendanceData, followupsMap) {
  // كل منطق: attendanceRate، consecutiveAbsent، needsFollowup، healthScore
  // يعيد computed properties جاهزة للاستخدام
}
```
- يستخدم في: `Dashboard.vue`، `GroupDetails.vue`، `Followups.vue`، `AttendanceReport.vue`، `NotificationBell.vue`

#### 11. **Unified Icon System**
```javascript
// src/utils/icons.js
export const ICONS = { plus: '...', check: '...', ... }
export function Icon({ name }) { return h('svg', ..., [h('path', { d: ICONS[name] })]) }
```
- ملف واحد لكل الأيقونات، component عام `BaseIcon.vue`

#### 12. **Constants File**
```javascript
// src/constants/app.js
export const RECENT_MEETINGS = 4
export const STREAK_WINDOW = 8
export const FOLLOWUP_THRESHOLD_DAYS = 30
export const MAX_DASHBOARD_ROWS = 5
export const GRADES = [...]
export const AREAS = [...]
export const RELATIONS = [...]
```

#### 13. **Form Validation Library**
```bash
npm install @vee-validate/zod zod
```
- استبدال validation اليدوي بـ Schema-based validation
- يدعم i18n للرسائل

### 9.4 أولوية منخفضة (Nice to Have)

#### 14. **i18n Support**
```bash
npm install vue-i18n
```
- ملفات ترجمة: `ar.json`، `en.json`
- يدعم RTL/LTR تلقائي

#### 15. **Component Library Storybook**
```bash
npm install storybook
```
- توثيق كل Shared Components
- Visual Regression Testing

#### 16. **E2E Testing**
```bash
npm install cypress
```
- Critical flows: Login → Dashboard → Attendance → Followups

#### 17. **Performance Monitoring**
- Web Vitals tracking
- Bundle Analyzer (`vite-bundle-analyzer`)
- Lighthouse CI في Pipeline

#### 18. **Design System Documentation**
- توثيق الألوان، المسافات، الـ Components
- Figma Sync

---

## ملخص خطة العمل المقترحة

| المرحلة | المهام | المدة المتوقعة |
|----------|--------|--------------|
| **Phase 1: Foundation** | Pinia Stores، API Service Layer، TypeScript Setup | 2-3 أسابيع |
| **Phase 2: Dashboard Optimization** | Dashboard Endpoint، Unified Calculations Composable | 1 أسبوع |
| **Phase 3: UX Polish** | Toast System، Confirm Dialog، Virtual Scroll، Offline Queue | 2-3 أسابيع |
| **Phase 4: Real-time** | WebSocket/SSE، Notification System | 1-2 أسابيع |
| **Phase 5: Quality** | E2E Tests، Storybook، i18n، Performance Monitoring | 2-3 أسابيع |

**إجمالي تقديري:** 8-12 أسبوع لتحويل المشروع لـ Production-ready، Maintainable، Scalable.

---

## خلاصة

المشروع **وظيفي وغني بالمميزات** ويغطي احتياجات الخدمة بشكل جيد، لكن الكود بحاجة لـ **Refactoring جوهري** ليكون قابل للصيانة والتوسع. النقاط القوية: تصميم UI متميز، Components قابلة لإعادة الاستخدام، منطق أعمال معقد (Risk/Group Scores)، PWA Support. النقاط الضعيفة: تكرار كود كبير، لا State Management، أداء محدود في القوائم الكبيرة، أمنية Client-side فقط.

**التوصية الفورية:** ابدأ بـ **Pinia + API Service Layer + TypeScript** — هذا سيحل 70% من مشاكل الصيانة والأداء.

---

*تم إنشاء هذا التقرير آلياً بتحليل شامل لكود المشروع — نوفمبر 2026*