// قائمة أسفار العهد القديم (39 سفر)
export const OLD_TESTAMENT = [
  { name: 'التكوين', chapters: 50 },
  { name: 'الخروج', chapters: 40 },
  { name: 'اللاويين', chapters: 27 },
  { name: 'العدد', chapters: 36 },
  { name: 'التثنية', chapters: 34 },
  { name: 'يشوع', chapters: 24 },
  { name: 'القضاة', chapters: 21 },
  { name: 'راعوث', chapters: 4 },
  { name: 'صموئيل الأول', chapters: 31 },
  { name: 'صموئيل الثاني', chapters: 24 },
  { name: 'الملوك الأول', chapters: 22 },
  { name: 'الملوك الثاني', chapters: 25 },
  { name: 'أخبار الأيام الأول', chapters: 29 },
  { name: 'أخبار الأيام الثاني', chapters: 36 },
  { name: 'عزرا', chapters: 10 },
  { name: 'نحميا', chapters: 13 },
  { name: 'أستير', chapters: 10 },
  { name: 'أيوب', chapters: 42 },
  { name: 'المزامير', chapters: 150 },
  { name: 'الأمثال', chapters: 31 },
  { name: 'الجامعة', chapters: 12 },
  { name: 'نشيد الأنشاد', chapters: 8 },
  { name: 'إشعياء', chapters: 66 },
  { name: 'إرميا', chapters: 52 },
  { name: 'مراثي إرميا', chapters: 5 },
  { name: 'حزقيال', chapters: 48 },
  { name: 'دانيال', chapters: 12 },
  { name: 'هوشع', chapters: 14 },
  { name: 'يوئيل', chapters: 3 },
  { name: 'عاموس', chapters: 9 },
  { name: 'عوبديا', chapters: 1 },
  { name: 'يونان', chapters: 4 },
  { name: 'ميخا', chapters: 7 },
  { name: 'ناحوم', chapters: 3 },
  { name: 'حبقوق', chapters: 3 },
  { name: 'صفنيا', chapters: 3 },
  { name: 'حجي', chapters: 2 },
  { name: 'زكريا', chapters: 14 },
  { name: 'ملاخي', chapters: 4 },
]

// قائمة أسفار العهد الجديد (27 سفر)
export const NEW_TESTAMENT = [
  { name: 'متى', chapters: 28 },
  { name: 'مرقس', chapters: 16 },
  { name: 'لوقا', chapters: 24 },
  { name: 'يوحنا', chapters: 21 },
  { name: 'أعمال الرسل', chapters: 28 },
  { name: 'رومية', chapters: 16 },
  { name: 'كورنثوس الأولى', chapters: 16 },
  { name: 'كورنثوس الثانية', chapters: 13 },
  { name: 'غلاطية', chapters: 6 },
  { name: 'أفسس', chapters: 6 },
  { name: 'فيلبي', chapters: 4 },
  { name: 'كولوسي', chapters: 4 },
  { name: 'تسالونيكي الأولى', chapters: 5 },
  { name: 'تسالونيكي الثانية', chapters: 3 },
  { name: 'تيموثاوس الأولى', chapters: 6 },
  { name: 'تيموثاوس الثانية', chapters: 4 },
  { name: 'تيطس', chapters: 3 },
  { name: 'فليمون', chapters: 1 },
  { name: 'العبرانيين', chapters: 13 },
  { name: 'يعقوب', chapters: 5 },
  { name: 'بطرس الأولى', chapters: 5 },
  { name: 'بطرس الثانية', chapters: 3 },
  { name: 'يوحنا الأولى', chapters: 5 },
  { name: 'يوحنا الثانية', chapters: 1 },
  { name: 'يوحنا الثالثة', chapters: 1 },
  { name: 'يهوذا', chapters: 1 },
  { name: 'الرؤيا', chapters: 22 },
]

// كل الأسفار
export const ALL_BOOKS = [
  ...OLD_TESTAMENT.map((b) => ({ ...b, type: 'old' })),
  ...NEW_TESTAMENT.map((b) => ({ ...b, type: 'new' })),
]

// البحث عن سفر بالاسم
export function findBook(name) {
  return ALL_BOOKS.find((b) => b.name === name)
}

// حساب تاريخ النهاية (يوم لكل أصحاح)
export function calculateEndDate(startDate, chapters) {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + chapters - 1) // -1 لأن اليوم الأول محسوب
  return end.toISOString().slice(0, 10)
}

// حساب عدد الأيام المتبقية
export function daysRemaining(endDate) {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}

// هل التحدي/القراءة منتهية؟
export function isEnded(endDate) {
  return new Date(endDate) < new Date()
}

// تنسيق التاريخ
export function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}