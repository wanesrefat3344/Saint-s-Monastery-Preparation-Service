// حساب نقاط مجموعة بناءً على معايير متعددة

export function calculateGroupScore(group, members = [], attendanceData = {}, followupsMap = {}, groupChallenges = [], challenges = []) {
  const groupMembers = members.filter((m) => m.group_id === group.id)
  if (groupMembers.length === 0) {
    return { total: 0, breakdown: [], memberCount: 0, challengePoints: 0, pendingChallengePoints: 0 }
  }

  const breakdown = []
  let total = 0

  // ===== 1. الحضور =====
  const attendanceRate = getGroupAttendanceRate(groupMembers, attendanceData)
  if (attendanceRate >= 90) {
    breakdown.push({ label: 'حضور ممتاز', points: 20, icon: '🏆', color: 'success' })
    total += 20
  } else if (attendanceRate >= 70) {
    breakdown.push({ label: 'حضور جيد', points: 10, icon: '✓', color: 'brand' })
    total += 10
  } else if (attendanceRate > 0) {
    breakdown.push({ label: 'حضور ضعيف', points: -10, icon: '⚠️', color: 'danger' })
    total -= 10
  }

  // ===== 2. الافتقاد =====
  const followupRate = getGroupFollowupRate(groupMembers, followupsMap)
  if (followupRate >= 90) {
    breakdown.push({ label: 'افتقاد منتظم', points: 15, icon: '📞', color: 'success' })
    total += 15
  } else if (followupRate >= 70) {
    breakdown.push({ label: 'افتقاد جيد', points: 8, icon: '📞', color: 'brand' })
    total += 8
  } else {
    breakdown.push({ label: 'افتقاد ضعيف', points: -15, icon: '❌', color: 'danger' })
    total -= 15
  }

  // ===== 3. الأعضاء الجدد =====
  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const newMembers = groupMembers.filter((m) => m.created_at && new Date(m.created_at) >= monthAgo)
  if (newMembers.length > 0) {
    const points = newMembers.length * 10
    breakdown.push({
      label: `${newMembers.length} عضو جديد`,
      points,
      icon: '🎉',
      color: 'success',
    })
    total += points
  }

  // ===== 4. غياب متكرر =====
  const consecutiveAbsentCount = groupMembers.filter((m) =>
    isConsecutiveAbsent(m.id, attendanceData)
  ).length
  if (consecutiveAbsentCount > 0) {
    const points = consecutiveAbsentCount * -10
    breakdown.push({
      label: `${consecutiveAbsentCount} عضو غايب 3+ مرات`,
      points,
      icon: '🚨',
      color: 'danger',
    })
    total += points
  }

  // ===== 5. مخدومين بدون خادم =====
  const noServant = groupMembers.filter((m) => !m.servant_id).length
  if (noServant > 0) {
    const points = noServant * -5
    breakdown.push({
      label: `${noServant} عضو بدون خادم`,
      points,
      icon: '👤',
      color: 'gold',
    })
    total += points
  }

  // ===== 6. التحديات =====
  const challengeResult = getChallengePoints(group.id, groupChallenges, challenges)
  if (challengeResult.ended > 0) {
    breakdown.push({
      label: `${challengeResult.endedCount} تحدي منتهي`,
      points: challengeResult.ended,
      icon: '🏆',
      color: 'gold',
    })
    total += challengeResult.ended
  }

  // نقاط التحديات المعلقة (لسه منتهتش)
  const pendingPoints = challengeResult.pending

  return {
    total: Math.max(0, total),
    breakdown,
    memberCount: groupMembers.length,
    attendanceRate,
    followupRate,
    newMembersCount: newMembers.length,
    challengePoints: challengeResult.ended,
    pendingChallengePoints: pendingPoints,
    challengeDetails: challengeResult.details,
  }
}

// حساب نقاط التحديات
function getChallengePoints(groupId, groupChallenges = [], challenges = []) {
  const groupEntries = groupChallenges.filter(
    (gc) => gc.group_id === groupId && gc.status === 'approved'
  )

  let ended = 0
  let pending = 0
  let endedCount = 0
  const details = []

  const today = new Date()

  groupEntries.forEach((gc) => {
    const challenge = challenges.find((c) => c.id === gc.challenge_id)
    if (!challenge) return

    const endDate = new Date(challenge.end_date)
    const isEnded = challenge.status === 'ended' || endDate < today

    if (isEnded) {
      ended += gc.points || 0
      endedCount++
      details.push({
        challenge_name: challenge.name,
        challenge_id: challenge.id,
        points: gc.points || 0,
        status: 'ended',
        end_date: challenge.end_date,
        icon: challenge.icon || '🏆',
      })
    } else {
      pending += gc.points || 0
      details.push({
        challenge_name: challenge.name,
        challenge_id: challenge.id,
        points: gc.points || 0,
        status: 'pending',
        end_date: challenge.end_date,
        icon: challenge.icon || '🏆',
      })
    }
  })

  return { ended, pending, endedCount, details }
}

// دالة مساعدة: جلب تفاصيل التحديات لمجموعة
export function getGroupChallengeDetails(groupId, groupChallenges = [], challenges = []) {
  const groupEntries = groupChallenges.filter((gc) => gc.group_id === groupId)

  return groupEntries.map((gc) => {
    const challenge = challenges.find((c) => c.id === gc.challenge_id)
    return {
      ...gc,
      challenge_name: challenge?.name || 'تحدي محذوف',
      challenge_icon: challenge?.icon || '🏆',
      challenge_end_date: challenge?.end_date,
      challenge_total_points: challenge?.total_points || 0,
      challenge_status: challenge?.status || 'active',
      is_ended: challenge ? (challenge.status === 'ended' || new Date(challenge.end_date) < new Date()) : false,
    }
  })
}

// حساب نسبة الحضور لمجموعة
function getGroupAttendanceRate(groupMembers, attendanceData) {
  const dates = Object.keys(attendanceData)
    .map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()
    .slice(0, 4)

  if (dates.length === 0) return 0

  const memberIds = groupMembers.map((m) => m.id)
  let total = 0
  let present = 0

  dates.forEach((d) => {
    const key = Object.keys(attendanceData).find((k) => k.startsWith(d))
    if (!key) return
    const records = attendanceData[key]
    memberIds.forEach((id) => {
      if (records[id] !== undefined) {
        total++
        if (records[id]) present++
      }
    })
  })

  return total === 0 ? 0 : Math.round((present / total) * 100)
}

// حساب نسبة الافتقاد لمجموعة
function getGroupFollowupRate(groupMembers, followupsMap) {
  const today = new Date()
  let contacted = 0
  groupMembers.forEach((m) => {
    const list = followupsMap[m.id] || []
    if (list.length === 0) return
    const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
    const days = Math.floor((today - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24))
    if (days <= 30) contacted++
  })
  return groupMembers.length === 0 ? 0 : Math.round((contacted / groupMembers.length) * 100)
}

// هل المخدوم غايب 3+ مرات متتالية؟
function isConsecutiveAbsent(memberId, attendanceData) {
  const dates = Object.keys(attendanceData)
    .map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()
    .slice(0, 5)

  if (dates.length < 3) return false

  let count = 0
  for (const d of dates) {
    const key = Object.keys(attendanceData).find((k) => k.startsWith(d))
    if (!key) break
    const records = attendanceData[key]
    if (records[memberId] === false || records[memberId] === undefined) count++
    else break
  }
  return count >= 3
}

// ألوان حسب النقاط
export function scoreLevel(total) {
  if (total >= 50) return { label: 'ممتاز', color: 'success', icon: '🥇' }
  if (total >= 30) return { label: 'جيد', color: 'brand', icon: '🥈' }
  if (total >= 15) return { label: 'مقبول', color: 'gold', icon: '🥉' }
  return { label: 'محتاج دعم', color: 'danger', icon: '⚠️' }
}

// ===== المقارنة الشهرية =====
export function calculateGroupScoreForPeriod(
  group,
  members = [],
  attendanceData = {},
  followupsMap = {},
  dateFrom = null,
  dateTo = null,
  groupChallenges = [],
  challenges = []
) {
  const from = dateFrom ? new Date(dateFrom) : null
  const to = dateTo ? new Date(dateTo) : new Date()

  const filteredAttendance = {}
  Object.entries(attendanceData).forEach(([key, records]) => {
    const dateStr = key.split('_')[0]
    const date = new Date(dateStr)
    if (from && date < from) return
    if (date > to) return
    filteredAttendance[key] = records
  })

  const filteredFollowups = {}
  Object.entries(followupsMap).forEach(([memberId, list]) => {
    filteredFollowups[memberId] = list.filter((f) => {
      const date = new Date(f.date)
      if (from && date < from) return false
      if (date > to) return false
      return true
    })
  })

  return calculateGroupScore(group, members, filteredAttendance, filteredFollowups, groupChallenges, challenges)
}

// مقارنة شهرية
export function getMonthlyComparison(
  group,
  members = [],
  attendanceData = {},
  followupsMap = {},
  groupChallenges = [],
  challenges = []
) {
  const now = new Date()

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const thisMonth = calculateGroupScoreForPeriod(
    group, members, attendanceData, followupsMap,
    thisMonthStart, thisMonthEnd, groupChallenges, challenges
  )

  const lastMonth = calculateGroupScoreForPeriod(
    group, members, attendanceData, followupsMap,
    lastMonthStart, lastMonthEnd, groupChallenges, challenges
  )

  const diff = thisMonth.total - lastMonth.total
  const diffPercent = lastMonth.total > 0
    ? Math.round((diff / lastMonth.total) * 100)
    : (thisMonth.total > 0 ? 100 : 0)

  let trend = 'stable'
  if (diff > 0) trend = 'up'
  else if (diff < 0) trend = 'down'

  return {
    thisMonth,
    lastMonth,
    diff,
    diffPercent,
    trend,
    trendIcon: trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️',
    trendLabel: trend === 'up' ? 'تحسن' : trend === 'down' ? 'تراجع' : 'ثابت',
    trendColor: trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'navy',
  }
}