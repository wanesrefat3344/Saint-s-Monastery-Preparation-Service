// حساب درجة الخطر لكل مخدوم (0-100)
export function calculateRiskScore(member, followups = [], attendanceData = {}) {
  let score = 0
  const reasons = []

  // 1. غيابات متتالية (وزن عالي)
  const consecutive = getConsecutiveAbsences(member.id, attendanceData)
  if (consecutive >= 3) {
    score += Math.min(consecutive * 15, 50)
    reasons.push(`غايب من ${consecutive} اجتماع متتالي`)
  }

  // 2. أيام من غير تواصل
  const daysSinceFollowup = getDaysSinceLastFollowup(followups)
  if (daysSinceFollowup === null) {
    score += 30
    reasons.push('لم يتم التواصل معه مطلقاً')
  } else if (daysSinceFollowup > 60) {
    score += 25
    reasons.push(`آخر تواصل من ${daysSinceFollowup} يوم`)
  } else if (daysSinceFollowup > 30) {
    score += 15
    reasons.push(`آخر تواصل من ${daysSinceFollowup} يوم`)
  }

  // 3. مفيش خادم مسؤول
  if (!member.servant_id) {
    score += 20
    reasons.push('معندوش خادم مسؤول')
  }

  // 4. مخدوم جديد (محتاج ترحيب)
  const daysSinceJoined = getDaysSinceJoined(member.created_at)
  if (daysSinceJoined !== null && daysSinceJoined <= 14) {
    score += 10
    reasons.push(`مسجّل من ${daysSinceJoined} يوم — محتاج ترحيب`)
  }

  return {
    score: Math.min(100, score),
    level: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
    reasons,
  }
}

// عدد الغيابات المتتالية
function getConsecutiveAbsences(memberId, attendanceData) {
  const dates = Object.keys(attendanceData)
    .map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()
    .slice(0, 10)

  if (dates.length === 0) return 0

  let count = 0
  for (const d of dates) {
    const key = Object.keys(attendanceData).find((k) => k.startsWith(d))
    if (!key) break
    const records = attendanceData[key]
    if (records[memberId] === false || records[memberId] === undefined) {
      count++
    } else {
      break
    }
  }
  return count
}

// أيام من آخر تواصل
function getDaysSinceLastFollowup(followups) {
  if (!followups || followups.length === 0) return null
  const sorted = [...followups].sort((a, b) => new Date(b.date) - new Date(a.date))
  return Math.floor((new Date() - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24))
}

// أيام من التسجيل
function getDaysSinceJoined(createdAt) {
  if (!createdAt) return null
  return Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24))
}

// ألوان الخطر
export function riskColor(level) {
  return {
    high: { bg: 'bg-danger/10', text: 'text-danger', label: 'خطر عالي', icon: '🔴' },
    medium: { bg: 'bg-gold/20', text: 'text-gold', label: 'متوسط', icon: '🟡' },
    low: { bg: 'bg-success/10', text: 'text-success', label: 'تمام', icon: '🟢' },
  }[level] || { bg: 'bg-page', text: 'text-navy', label: '—', icon: '' }
}

// اقتراحات المتابعة
export function getFollowupSuggestions(member, followups = [], attendanceData = {}) {
  const suggestions = []
  const consecutive = getConsecutiveAbsences(member.id, attendanceData)
  const daysSince = getDaysSinceLastFollowup(followups)
  const daysSinceJoined = getDaysSinceJoined(member.created_at)

  // غياب متتالي
  if (consecutive >= 3) {
    suggestions.push({
      icon: '📞',
      text: `اتصل بولي الأمر — غايب من ${consecutive} اجتماع متتالي`,
      priority: 'high',
    })
  }

  // مفيش تواصل
  if (daysSince === null) {
    suggestions.push({
      icon: '👋',
      text: 'تواصل معه لأول مرة — لم يتم التواصل مطلقاً',
      priority: 'high',
    })
  } else if (daysSince > 30) {
    suggestions.push({
      icon: '📞',
      text: `اتصل بولي الأمر — آخر تواصل من ${daysSince} يوم`,
      priority: 'medium',
    })
  }

  // مخدوم جديد
  if (daysSinceJoined !== null && daysSinceJoined <= 14) {
    suggestions.push({
      icon: '🎉',
      text: `رحّب به — مسجّل من ${daysSinceJoined} يوم`,
      priority: 'low',
    })
  }

  // عيد ميلاد قريب
  if (member.birth_date) {
    const birth = new Date(member.birth_date)
    const today = new Date()
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1)
    const daysToBirthday = Math.floor((nextBirthday - today) / (1000 * 60 * 60 * 24))
    if (daysToBirthday <= 7) {
      suggestions.push({
        icon: '🎂',
        text: `عيد ميلاده بعد ${daysToBirthday} يوم — ابعت تهنئة`,
        priority: 'low',
      })
    }
  }

  // مفيش خادم
  if (!member.servant_id) {
    suggestions.push({
      icon: '👤',
      text: 'عيّن له خادم مسؤول',
      priority: 'medium',
    })
  }

  return suggestions
}