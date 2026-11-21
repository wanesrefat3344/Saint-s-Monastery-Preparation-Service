// Константы приложения — все magic numbers в одном месте
// Источник правды для всех вычислений

// === Attendance Windows ===
// Dashboard использует 7 дней, GroupDetails — 4 встречи
// НОВОЕ ЕДИНОЕ ПРАВИЛО: считаем за последние 7 дней (или последние 4 встречи, что больше)
export const ATTENDANCE_WINDOW_DAYS = 7
export const ATTENDANCE_WINDOW_MEETINGS = 4

// === Streak (Consecutive Absent) ===
// Сколько последних встреч проверяем на отсутствие подряд
export const STREAK_WINDOW_MEETINGS = 8

// === Followup ===
// Через сколько дней без общения считаем, что нужен followup
export const FOLLOWUP_THRESHOLD_DAYS = 30
// Срочный followup (для risk score)
export const FOLLOWUP_URGENT_DAYS = 60
// Порог "consecutive absent" — 3 пропуска подряд
export const CONSECUTIVE_ABSENT_THRESHOLD = 3

// === Risk Score Weights ===
export const RISK_WEIGHTS = {
  consecutive_absent_per: 15,      // за каждую встречу подряд
  consecutive_absent_cap: 50,      // максимум за подряд
  days_since_followup_60: 25,      // > 60 дней без общения
  days_since_followup_30: 15,      // > 30 дней без общения
  no_servant: 20,                  // нет ответственного слуги
  new_member_14d: 10,              // новичок до 14 дней
}

// === Group Score Weights ===
export const GROUP_SCORE_WEIGHTS = {
  attendance_90: 20,       // посещаемость >= 90%
  attendance_70: 10,       // посещаемость >= 70%
  attendance_below_70: -10, // посещаемость < 70% (и > 0)
  followup_90: 15,         // followup >= 90%
  followup_70: 8,          // followup >= 70%
  followup_below_70: -15,  // followup < 70%
  new_member_each: 10,     // за каждого нового члена за месяц
  consecutive_absent_each: -10, // за каждого с подряд идущим пропуском
  no_servant_each: -5,     // за каждого без слуги
}

// === Challenge Points ===
export const CHALLENGE_POINTS_ENDED = 1  // множитель для завершенных челленджей

// === Health Score (Dashboard) ===
// НОВЫЙ ПОДХОД: healthScore строится на основе groupScore логики
// но упрощен для дашборда
export const HEALTH_SCORE_BASE = 100
export const HEALTH_PENALTY_ATTENDANCE_PER_POINT = 0.5  // за каждый % ниже 70
export const HEALTH_PENALTY_CONSECUTIVE_ABSENT = 5     // за каждого с подряд
export const HEALTH_PENALTY_NEEDS_FOLLOWUP = 1         // за каждого нуждающегося в followup

// === Dashboard UI ===
export const MAX_DASHBOARD_ROWS = 5

// === Report ===
export const TOP_N_RANKING = 5

// === Data Constants (для форм) ===
export const GRADES = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي',
  'جامعي', 'خريج',
]

export const RELATIONS = [
  'أب', 'أم', 'أخ', 'أخت', 'عم', 'خال', 'جد', 'جدة', 'غير ذلك',
]

export const AREAS = [
  'الطود',
  'الحسينات',
  'مكي',
  'مكي الجبل',
  'الوحدة',
  'الضمان',
  'الطود البلد',
  'المهيدات',
  'الشغب منطقة 1',
  'الشغب منطقة 2',
  'الدبابية',
  'المعلا',
]

// === Meeting Types ===
export const MEETING_TYPES = [
  { value: 'prep', label: 'إعدادي' },
  { value: 'social', label: 'اجتماع عام' },
  { value: 'youth', label: 'شباب' },
  { value: 'other', label: 'أخرى' },
]

// === Servant Attendance Statuses ===
export const SERVANT_ATTENDANCE_STATUSES = [
  { value: 'present', label: 'حاضر', icon: '✓', activeClass: 'bg-success text-white' },
  { value: 'late', label: 'متأخر', icon: '⏰', activeClass: 'bg-gold text-white' },
  { value: 'excused', label: 'معذور', icon: '📝', activeClass: 'bg-brand text-white' },
  { value: 'absent', label: 'غايب', icon: '✕', activeClass: 'bg-danger text-white' },
]

// === Role Labels ===
export const ROLE_LABELS = {
  admin: 'أدمن',
  servant: 'خادم',
  co_servant: 'خادم مساعد',
  group_leader: 'ليدر مجموعة',
  reader: 'مسجل قراءات',
}

// === Risk Levels ===
export const RISK_LEVELS = {
  high: { min: 60, label: 'خطر عالي', icon: '🔴', bg: 'bg-danger/10', text: 'text-danger' },
  medium: { min: 30, label: 'متوسط', icon: '🟡', bg: 'bg-gold/20', text: 'text-gold' },
  low: { min: 0, label: 'تمام', icon: '🟢', bg: 'bg-success/10', text: 'text-success' },
}

// === Score Levels ===
export const SCORE_LEVELS = {
  excellent: { min: 80, label: 'ممتاز', color: 'success', icon: '🥇' },
  good: { min: 60, label: 'جيد', color: 'brand', icon: '🥈' },
  fair: { min: 40, label: 'مقبول', color: 'gold', icon: '🥉' },
  needs_support: { min: 0, label: 'محتاج دعم', color: 'danger', icon: '⚠️' },
}