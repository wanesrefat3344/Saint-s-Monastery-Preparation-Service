/**
 * يحسب أعياد الميلاد لشهر معين
 * @param {Array} members - قائمة الأعضاء (فيهم birth_date)
 * @param {number} month - 1-12
 * @param {number} year - السنة الحالية (افتراضي: السنة الحالية)
 * @returns {Array} - مرتبة: النهاردة أولاً، بعدين الأقرب
 */
export function getBirthdaysForMonth(members, month, year = new Date().getFullYear()) {
  if (!members || !Array.isArray(members)) return []

  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  const currentYear = today.getFullYear()

  return members
    .filter(m => m && m.birth_date) // التأكد إن العضو موجود وله تاريخ ميلاد
    .map(m => {
      const bd = new Date(m.birth_date)
      const birthDay = bd.getDate()
      // العمر اللي هيكمله في السنة الحالية
      const turningAge = year - bd.getFullYear()
      // هل عيد الميلاد ده النهاردة؟
      const isToday = (month === currentMonth && birthDay === currentDay && year === currentYear)
      // هل فات في السنة الحالية؟
      const isPast = (year === currentYear &&
        (month < currentMonth || (month === currentMonth && birthDay < currentDay)))
      // الأيام المتبقية (لو الشهر ده)
      let daysUntil = null
      if (month === currentMonth && year === currentYear) {
        daysUntil = birthDay - currentDay
      }

      return {
        ...m,
        birthDay,
        birthMonth: month,
        birthYear: bd.getFullYear(),
        turningAge,
        isToday,
        isPast,
        daysUntil,
        formattedDate: `${birthDay}/${month}`,
      }
    })
    .sort((a, b) => {
      // النهاردة أولاً
      if (a.isToday && !b.isToday) return -1
      if (!a.isToday && b.isToday) return 1
      // بعدين حسب اليوم في الشهر
      return a.birthDay - b.birthDay
    })
}

/**
 * أسماء الشهور بالعربي
 */
export const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

/**
 * يرجع الشهر الحالي (1-12)
 */
export function getCurrentMonth() {
  return new Date().getMonth() + 1
}

/**
 * يرجع عدد أعياد الميلاد النهاردة
 */
export function countTodayBirthdays(members) {
  const today = new Date()
  return members.filter(m => {
    if (!m.birth_date) return false
    const bd = new Date(m.birth_date)
    return bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate()
  }).length
}

/**
 * يفلتر الأعضاء حسب صلاحيات المستخدم
 * admin: يشوف الكل
 * servant/co_servant: يشوف مخدوميه فقط (اللي servant_id = user.id)
 * group_leader: يشوف أعضاء مجموعاته (يتطلب group_ids في user object)
 * reader/other: لا يشوف حاجة
 */
export function filterMembersByPermission(members, user) {
  if (!user) return []

  if (user.role === 'admin') {
    return members
  }

  if (user.role === 'servant' || user.role === 'co_servant') {
    return members.filter(m => m.servant_id === user.id)
  }

  if (user.role === 'group_leader') {
    // group_leader - يحتاج group_ids في user object
    // إذا لم يتوفر، نرجع فارغاً (يمكن تحسينه لاحقاً من الباك)
    if (!user.group_ids || !Array.isArray(user.group_ids)) {
      return []
    }
    return members.filter(m => m.group_id && user.group_ids.includes(m.group_id))
  }

  // roles أخرى (reader, etc.) لا تشوف أعياد الميلاد
  return []
}