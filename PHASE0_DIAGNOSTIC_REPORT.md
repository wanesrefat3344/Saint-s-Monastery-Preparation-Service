# المرحلة 0: تقرير التشخيص الشامل للفرونت إند

**تاريخ التقرير:** 21 نوفمبر 2026  
**الفرع:** main  
**الحالة:** تشخيص فقط — لا تعديلات

---

## 📋 ملخص تنفيذي

تم فحص الكود بالكامل (30+ view، 15 component، 5 composables، 2 utils). تم تحديد **مشاكل جوهرية** في 4 محاور:

| المحور | عدد المشاكل | الخطورة |
|--------|-------------|---------|
| **مشاكل النسب/الحسابات** | 6 | 🔴 حرجة |
| **التوافق مع الباك الجديد** | 5 | 🔴 حرجة |
| **صفحات غير مكتملة/وهمية** | 7 | 🟠 عالية |
| **جودة الكود/الأداء** | 10+ | 🟡 متوسطة |

---

## أ. مشاكل النسب والحسابات

| النسبة/الحساب | فين بتتحسب (الملفات) | الأرقام الثابتة (Magic Numbers) | المشكلة |
|--------------|----------------------|-------------------------------|---------|
| **attendanceRate** (نسبة الحضور) | 1. `Dashboard.vue:421-433` — **آخر 7 أيام**<br>2. `GroupDetails.vue:752-764` — **آخر 4 اجتماعات**<br>3. `AttendanceReport.vue:304-333` — **آخر N اجتماعات** (افتراضي 8)<br>4. `MemberList.vue` — عبر `riskScore.js` فقط<br>5. `Followups.vue` — غير مستخدم مباشرة | Dashboard: `weekAgo = 7 days`<br>GroupDetails: `RECENT = 4`<br>AttendanceReport: `limit = 8` (قابل للتغيير) | **تعريفات مختلفة تماماً** — Dashboard ياخد آخر 7 أيام، GroupDetails ياخد آخر 4 اجتماعات، AttendanceReport ياخد آخر 8 اجتماعات. النسب **مختلفة في كل صفحة** لنفس البيانات. |
| **consecutiveAbsent** (غياب متتالي) | 1. `Dashboard.vue:435-452` — **آخر 5 تواريخ**<br>2. `GroupDetails.vue:711-721` — **آخر 8 اجتماعات** (`STREAK_WINDOW`)<br>3. `AttendanceReport.vue:316-322` — **كل الجلسات المحملة**<br>4. `NotificationBell.vue:114-130` — **آخر 5 تواريخ**<br>5. `riskScore.js:47-69` — **آخر 10 تواريخ**<br>6. `groupScore.js:219-238` — **آخر 5 تواريخ** | Dashboard: 5 dates<br>GroupDetails: `STREAK_WINDOW = 8`<br>AttendanceReport: all sessions<br>NotificationBell: 5 dates<br>riskScore: 10 dates<br>groupScore: 5 dates | **نوافذ زمنية مختلفة** — نفس المنطق مكرر 6 مرات بنوافذ مختلفة. `Dashboard` يقول 3 غيابات، `GroupDetails` يقول 3 غيابات لكن من 8 اجتماعات، `riskScore` من 10 تواريخ. |
| **needsFollowup** (محتاج افتقاد) | 1. `Dashboard.vue:407-418` — **> 30 يوم**<br>2. `GroupDetails.vue:723-732` — **> 30 يوم** (`FOLLOWUP_DAYS`)<br>3. `Followups.vue:184-201` — **> 30 يوم أو لم يتم**<br>4. `NotificationBell.vue:58-67` — **> 30 يوم**<br>5. `MemberFollowups.vue` — غير مفحوص | Dashboard: 30 يوم<br>GroupDetails: `FOLLOWUP_DAYS = 30`<br>Followups: 30 يوم<br>NotificationBell: 30 يوم | **متطابق** (30 يوم) — لكن `Followups.vue` يضيف "لم يتم التواصل مطلقاً" كحالة منفصلة بينما الباقي يدمجها. |
| **riskScore** (درجة الخطر) | 1. `riskScore.js` — المصدر الوحيد<br>2. `Dashboard.vue` — عبر `riskScore.js`<br>3. `GroupDetails.vue` — عبر `riskScore.js`<br>4. `MemberList.vue` — عبر `riskScore.js`<br>5. `NotificationBell.vue` — **لا يستخدم riskScore.js!** يحسب محلياً | `riskScore.js`: <br>- consecutive ≥ 3: +15/cap 50<br>- daysSinceFollowup > 60: +25<br>- daysSinceFollowup > 30: +15<br>- no servant: +20<br>- new member ≤ 14 days: +10 | **NotificationBell تحسب محلياً** ولا تستخدم `riskScore.js` — تكرار ومنطق مختلف. |
| **groupScore** (نقاط المجموعة) | 1. `groupScore.js` — المصدر الوحيد<br>2. `GroupDetails.vue` — عبر `groupScore.js`<br>3. `Dashboard.vue` — **لا يستخدمه!** يحسب healthScore محلياً | `groupScore.js`: <br>- attendance ≥ 90: +20<br>- attendance ≥ 70: +10<br>- followup ≥ 90: +15<br>- new members: +10/عضو<br>- consecutive absent: -10/عضو<br>- no servant: -5/عضو | **Dashboard لا يستخدم groupScore.js** — يحسب `healthScore` محلياً بمنطق مختلف تماماً. |
| **healthScore** (صحة الخدمة) | 1. `Dashboard.vue:454-460` — **محلي فقط** | Dashboard: <br>- attendanceRate < 70: -0.5 per point<br>- consecutiveAbsent.length × 5<br>- needsFollowupCount × 1 | **غير متسق مع groupScore** — يستخدم أرقام ثابتة لا علاقة لها بخوارزمية المجموعة. |

### 🔴 الخلاصة: النسب **مش متسقة إطلاقاً**
- نفس العضو يظهر بنسب حضور مختلفة في Dashboard vs GroupDetails vs AttendanceReport
- `consecutiveAbsent` يعطى قوائم مختلفة في كل صفحة
- `NotificationBell` تحسب منطقها الخاص ولا تشارك مع باقي الصفحات

---

## ب. مشاكل التوافق مع الباك الجديد

| المشكلة | الملف/الموقع | التأثير | التفاصيل |
|---------|-------------|---------|-----------|
| **1. refresh_token غير محفوظ** | `Login.vue:69-70` — يحفظ `token` و `user` فقط<br>`client.js` — لا يقرأ `refresh_token` | المستخدم **يطرد بعد 15 دقيقة** (انتهاء access token) | الباك يرجع `{ token, refresh_token, user }` لكن الفرونت يهمل `refresh_token`. لا يوجد interceptor للـ 401 يجدد التوكن. |
| **2. لا يوجد 401 Interceptor للـ refresh** | `client.js:14-24` — يمسح التوكن ويعيد للوجين مباشرة | **تسجيل خروج إجباري** بدل التجديد الصامت | الكود الحالي: `401 → logout`. المطلوب: `401 → refresh token → retry original request` |
| **3. Pagination غير متعامل معها** | كل `api.get('/members')`, `/followups`, `/attendance`, `/users`, `/groups`, `/challenges`<br>مثال: `MemberList.vue:395-399` يحمل كل شيء بدون `?page=` أو `?limit=` | **أول 50/100 سجل فقط** — البيانات الناقصة تؤثر على النسب | الباك يدعم `X-Total-Count` header و `?page=&limit=`. الفرونت لا يرسل params ولا يقرأ header. |
| **4. Soft Delete غير مدعوم** | `MemberList.vue:359-368` — `api.delete('/members/${id}')`<br>`MemberDetails.vue:112-119` — نفس الشيء | الحذف **قد لا يشتغل** لو الباك يرجع 404 للسجلات المحذوفة soft | الباك يستخدم soft delete — الفرونت محتاج يتعامل مع `deleted_at` أو يستخدم endpoint مختلف. |
| **5. NotificationBell polling مكلف** | `NotificationBell.vue:191` — `setInterval(loadData, 60000)`<br>يحمل 5-6 APIs كل دقيقة | **استهلاك موارد، بطء، rate limiting محتمل** | كل دقيقة: `/members`, `/followups`, `/attendance`, `/users`, `/challenges` + loop على challenges للـ participants. |

---

## ج. صفحات غير مكتملة / مش متصلة بالباك

| الصفحة | الحالة | السبب | API المطلوبة |
|---------|--------|-------|-------------|
| **ServantEvaluation.vue** | UI فقط — **Mock** | يحفظ محلياً، `api.post('/servant-evaluations')` **مش موجودة في الباك** (حسب التقرير) | `POST /api/servant-evaluations` — تحتاج تأكيد من الباك |
| **ServantAttendance.vue** | UI فقط — **Mock** | `api.get('/team/servants')` و `api.post('/servant-attendance')` — endpoints مش مؤكدة | `GET /team/servants`, `POST /servant-attendance`, `POST /servant-attendance/scan` |
| **ServantsActivity.vue** | UI فقط — **Mock** | `api.get('/servants-activity')` — endpoint مش موجودة | `GET /api/servants-activity` — تحتاج تأكيد من الباك |
| **Settings.vue** | **Backup/Restore من localStorage فقط** | `DEMO_MODE` reads من `localStorage` keys — **مش متصلة بالباك** | لو الباك بيدعم backup: `GET/POST /backup` — وإلا قولي |
| **Team.vue** | **بيانات ناقصة** | يعرض servants/leaders بس — مفيش تفاصيل، مفيش إجراءات | يحتاج `GET /team/servants`, `GET /team/leaders` + تفاصيل |
| **Reports.vue** | **Basic فقط** | تقارير بسيطة، غير متصلة بـ API متقدم | تحتاج endpoints للتقارير |
| **ReadingBooksList.vue** | CRUD UI | API endpoints غير مؤكدة | `GET/POST/PUT/DELETE /reading-books` |

---

## د. مشاكل جودة الكود والأداء (مهمة للمراحل اللاحقة)

| المشكلة | الموقع | التأثير |
|----------|---------|---------|
| **تكرار منطق كبير** | `consecutiveAbsent`, `needsFollowup`, `attendanceRate` مكرر في 6+ ملفات | صيانة صعبة، أخطاء عدم اتساق |
| **Magic Numbers** | `Dashboard.vue`: `MAX_ROWS=5`, `RECENT=7days`<br>`GroupDetails.vue`: `RECENT=4`, `STREAK_WINDOW=8`, `FOLLOWUP_DAYS=30`<br>`AttendanceReport.vue`: `limit=8`, `TOP_N=5` | أرقام ثابتة مش موحدة، صعب تغييرها |
| **Inline SVG Icons مكررة** | كل view/component فيه `ICONS` object (30+ تعريف مكرر) | حجم bundle، صيانة |
| **Business Logic في Components** | `Dashboard.vue` 600+ سطر، `GroupDetails.vue` 1000+ سطر، `Attendance.vue` 670 سطر | Components عملاقة، صعب الاختبار |
| **Error Handling ضعيف** | `alert()` في عدة أماكن، `console.error` في الإنتاج | UX سيئة، لا يوجد Toast system موحد |
| **لا يوجد Request Deduplication** | نفس البيانات تُحمل في صفحات متعددة (`/members`, `/followups`, `/attendance`) | عبء على السيرفر، بطء |
| **لا يوجد Centralized State** | كل view تدير state خاص، لا Pinia/Vuex | تكرار، لا caching، لا reactivity عبر الصفحات |

---

## ه. خطة الإصلاح المقترحة (مرتبة حسب الأولوية)

### 🔴 المرحلة 1: إصلاح النسب (أولوية قصوى)
1. **إنشاء `src/constants/app.js`** — كل الأرقام الثابتة موحدة
2. **إنشاء `src/composables/useCalculations.js`** — composable موحد لكل الحسابات
3. **استبدال الحسابات المكررة** في: `Dashboard.vue`, `GroupDetails.vue`, `Followups.vue`, `AttendanceReport.vue`, `NotificationBell.vue`, `MemberList.vue`
4. **حل مشكلة "بيانات ناقصة للحسابات"**: إما تحميل الكل (`?limit=10000`) أو طلب aggregates من الباك

### 🔴 المرحلة 2: توافق الباك (أولوية قصوى)
1. **Refresh Tokens**: تحديث `client.js` بـ interceptor للـ 401 يجدد التوكن، تحديث `Login.vue` لحفظ `refresh_token`
2. **Pagination**: مراجعة كل `GET`، إضافة `params` للصفحات، استخدام `X-Total-Count` للحسابات
3. **Soft Delete**: مراجعة endpoints الحذف
4. **NotificationBell**: تقليل polling، أو استخدام endpoint واحد للـ unread count

### 🟠 المرحلة 3: الصفحات الوهمية
1. **ServantEvaluation** — ربط بـ `POST /servant-evaluations` (تأكيد من الباك)
2. **ServantAttendance** — ربط بـ endpoints الحضور
3. **ServantsActivity** — ربط بـ `GET /servants-activity`
4. **Settings** — Backup/Restore: تأكيد دعم الباك أو إبقاء localStorage
5. **Team** — إكمال البيانات والإجراءات

### 🟠 المرحلة 4: State Management (Pinia)
1. `useAuthStore` — token, user, refresh logic
2. `useMembersStore` — members, followups, attendance مع caching
3. `useGroupsStore` — groups, challenges
4. `useNotificationsStore` — real-time notifications

### 🟡 المرحلة 5: تحسينات UX
1. Toast System موحد
2. Confirm Dialog component
3. Loading States موحدة
4. Error Handling مركزي
5. Empty States موحدة

### 🟡 المرحلة 6: تنظيف الكود
1. إزالة hardcoded data (`areas`, `grades`, `relations` → API أو constants)
2. إزالة `console.error` من الإنتاج
3. Unified Icon System
4. Virtual scrolling للقوائم الطويلة
5. Lazy loading للصفحات

---

## 📝 ملاحظات مهمة للمراجعة

1. **المستخدمون بيستخدموا النظام حالياً** — أي كسر = مشكلة كبيرة. يجب الاختبار بعد كل مرحلة.
2. **الباك اتغير** (refresh tokens, pagination, soft delete) — الفرونت محتاج يلحق بالتغييرات دي.
3. **النسب مش أرقام صح** — ده المشكلة الأكبر، محتاج حل في المرحلة 1.
4. **متعملش كل حاجة مرة واحدة** — مراحل، موافقة، commit، اختبار.

---

## ✅ الخطوة التالية

**في انتظار موافقتك للبدء في المرحلة 1: إصلاح النسب**

المرحلة 1 هتتضمن:
- إنشاء `src/constants/app.js`
- إنشاء `src/composables/useCalculations.js`
- استبدال كل الحسابات المكررة في 6 ملفات
- اختبار إن النسب بقت متسقة في كل الصفحات

**هل نبدأ بالمرحلة 1؟**