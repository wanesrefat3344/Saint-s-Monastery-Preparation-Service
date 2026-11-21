// Унифицированные вычисления — единая точка истины для всех расчетов
// Использует constants/app.js для всех magic numbers

import { ref, computed } from 'vue'
import {
  ATTENDANCE_WINDOW_DAYS,
  ATTENDANCE_WINDOW_MEETINGS,
  STREAK_WINDOW_MEETINGS,
  FOLLOWUP_THRESHOLD_DAYS,
  FOLLOWUP_URGENT_DAYS,
  CONSECUTIVE_ABSENT_THRESHOLD,
  RISK_WEIGHTS,
  GROUP_SCORE_WEIGHTS,
  HEALTH_SCORE_BASE,
  HEALTH_PENALTY_ATTENDANCE_PER_POINT,
  HEALTH_PENALTY_CONSECUTIVE_ABSENT,
  HEALTH_PENALTY_NEEDS_FOLLOWUP,
} from '../constants/app'

// Вспомогательные функции для работы с датами
const DAY_MS = 24 * 60 * 60 * 1000

function daysBetween(from, to = new Date()) {
  return Math.floor((to - new Date(from)) / DAY_MS)
}

// Нормализация ключа встречи: 'YYYY-MM-DD_type'
function normalizeMeetingKey(dateStr, meetingType) {
  return `${dateStr.slice(0, 10)}_${meetingType}`
}

// Получение отсортированных уникальных дат встреч (новые -> старые)
function getSortedMeetingDates(attendanceData) {
  return Object.keys(attendanceData)
    .map((k) => k.split('_')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()
}

// Получение записей для конкретной даты (все типы встреч за этот день)
function getRecordsForDate(attendanceData, dateStr) {
  const key = Object.keys(attendanceData).find((k) => k.startsWith(dateStr))
  return key ? attendanceData[key] : {}
}

/**
 * Основной composable для вычислений
 * @param {Array} members - массив членов [{id, full_name, grade, group_name, servant_id, servant_name, created_at, ...}]
 * @param {Object} attendanceData - { 'YYYY-MM-DD_type': { [memberId]: boolean } }
 * @param {Object} followupsMap - { [memberId]: [{date, method, result}, ...] }
 * @param {Object} options - дополнительные параметры
 */
export function useCalculations(members, attendanceData, followupsMap, options = {}) {
  const {
    // Позволяет переопределить окна для конкретных кейсов
    attendanceWindowDays = ATTENDANCE_WINDOW_DAYS,
    attendanceWindowMeetings = ATTENDANCE_WINDOW_MEETINGS,
    streakWindowMeetings = STREAK_WINDOW_MEETINGS,
    followupThresholdDays = FOLLOWUP_THRESHOLD_DAYS,
    followupUrgentDays = FOLLOWUP_URGENT_DAYS,
    consecutiveAbsentThreshold = CONSECUTIVE_ABSENT_THRESHOLD,
  } = options

  // === Даты встреч ===
  const sortedDates = computed(() => getSortedMeetingDates(attendanceData.value))

  // Окно для attendance rate: последние N дней ИЛИ последние M встреч (что больше)
  const recentDates = computed(() => {
    const today = new Date()
    const cutoffDate = new Date(today.getTime() - attendanceWindowDays * DAY_MS)

    // Сначала фильтруем по дням
    let dates = sortedDates.value.filter(d => new Date(d) >= cutoffDate)

    // Если встреч меньше чем attendanceWindowMeetings, берем последние attendanceWindowMeetings
    if (dates.length < attendanceWindowMeetings) {
      dates = sortedDates.value.slice(0, attendanceWindowMeetings)
    }
    return dates
  })

  // Окно для streak (последние N встреч)
  const streakDates = computed(() => sortedDates.value.slice(0, streakWindowMeetings))

  // === 1. Attendance Rate (общий для группы/дашборда) ===
  const attendanceRate = computed(() => {
    if (!members.value.length) return 0
    const dates = recentDates.value
    if (!dates.length) return 0

    let total = 0
    let present = 0

    for (const dateStr of dates) {
      const records = getRecordsForDate(attendanceData.value, dateStr)
      for (const member of members.value) {
        const v = records[member.id]
        if (v === undefined) continue // не отмечался — не считаем
        total++
        if (v) present++
      }
    }
    return total === 0 ? 0 : Math.round((present / total) * 100)
  })

  // === 2. Consecutive Absent (для конкретного memberId) ===
  function getConsecutiveAbsent(memberId) {
    const dates = streakDates.value
    if (dates.length < consecutiveAbsentThreshold) return 0

    let count = 0
    for (const dateStr of dates) {
      const records = getRecordsForDate(attendanceData.value, dateStr)
      const v = records[memberId]
      if (v === false || v === undefined) {
        count++
      } else {
        break
      }
    }
    return count
  }

  // === 3. Needs Followup (для конкретного memberId) ===
  function getFollowupStatus(memberId) {
    const list = followupsMap.value[memberId] || []
    if (list.length === 0) {
      return { needsFollowup: true, daysSince: null, isUrgent: true }
    }
    const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
    const daysSince = daysBetween(sorted[0].date)
    return {
      needsFollowup: daysSince > followupThresholdDays,
      daysSince,
      isUrgent: daysSince > followupUrgentDays,
    }
  }

  // === 4. Risk Score (для конкретного member) ===
  function calculateRiskScore(member) {
    let score = 0
    const reasons = []

    // 1. Consecutive absences
    const consecutive = getConsecutiveAbsent(member.id)
    if (consecutive >= consecutiveAbsentThreshold) {
      const add = Math.min(consecutive * RISK_WEIGHTS.consecutive_absent_per, RISK_WEIGHTS.consecutive_absent_cap)
      score += add
      reasons.push(`غايب من ${consecutive} اجتماع متتالي`)
    }

    // 2. Days since last followup
    const followup = getFollowupStatus(member.id)
    if (followup.daysSince === null) {
      score += RISK_WEIGHTS.days_since_followup_60 // treat as > 60
      reasons.push('لم يتم التواصل معه مطلقاً')
    } else if (followup.daysSince > followupUrgentDays) {
      score += RISK_WEIGHTS.days_since_followup_60
      reasons.push(`آخر تواصل من ${followup.daysSince} يوم`)
    } else if (followup.daysSince > followupThresholdDays) {
      score += RISK_WEIGHTS.days_since_followup_30
      reasons.push(`آخر تواصل من ${followup.daysSince} يوم`)
    }

    // 3. No servant
    if (!member.servant_id) {
      score += RISK_WEIGHTS.no_servant
      reasons.push('معندوش خادم مسؤول')
    }

    // 4. New member (<= 14 days)
    if (member.created_at) {
      const daysSinceJoined = daysBetween(member.created_at)
      if (daysSinceJoined >= 0 && daysSinceJoined <= 14) {
        score += RISK_WEIGHTS.new_member_14d
        reasons.push(`مسجّل من ${daysSinceJoined} يوم — محتاج ترحيب`)
      }
    }

    const finalScore = Math.min(100, score)
    let level = 'low'
    if (finalScore >= 60) level = 'high'
    else if (finalScore >= 30) level = 'medium'

    return { score: finalScore, level, reasons, consecutive, followup }
  }

  // === 5. Member Row Data (для таблиц/карточек) ===
  const memberRows = computed(() => {
    return members.value.map((member) => {
      const consecutive = getConsecutiveAbsent(member.id)
      const followup = getFollowupStatus(member.id)
      const risk = calculateRiskScore(member)

      // Personal attendance rate (для отображения в карточке)
      let personalAttended = 0
      let personalTotal = 0
      for (const dateStr of recentDates.value) {
        const records = getRecordsForDate(attendanceData.value, dateStr)
        const v = records[member.id]
        if (v === undefined) continue
        personalTotal++
        if (v) personalAttended++
      }
      const personalRate = personalTotal ? Math.round((personalAttended / personalTotal) * 100) : null

      return {
        ...member,
        attendanceRate: personalRate,
        consecutiveAbsent: consecutive,
        needsFollowup: followup.needsFollowup,
        followupDays: followup.daysSince,
        followupUrgent: followup.isUrgent,
        riskScore: risk.score,
        riskLevel: risk.level,
        riskReasons: risk.reasons,
      }
    })
  })

  // === 6. Aggregates для дашборда/уведомлений ===
  const needsFollowupList = computed(() =>
    memberRows.value.filter((m) => m.needsFollowup)
  )
  const needsFollowupCount = computed(() => needsFollowupList.value.length)

  const consecutiveAbsentList = computed(() =>
    memberRows.value.filter((m) => m.consecutiveAbsent >= consecutiveAbsentThreshold)
      .sort((a, b) => b.consecutiveAbsent - a.consecutiveAbsent)
  )
  const consecutiveAbsentCount = computed(() => consecutiveAbsentList.value.length)

  const highRiskList = computed(() =>
    memberRows.value.filter((m) => m.riskLevel === 'high')
  )
  const highRiskCount = computed(() => highRiskList.value.length)

  const noServantList = computed(() =>
    members.value.filter((m) => !m.servant_id)
  )
  const noServantCount = computed(() => noServantList.value.length)

  // === 7. Health Score (Dashboard) ===
  const healthScore = computed(() => {
    let score = HEALTH_SCORE_BASE
    const rate = attendanceRate.value
    if (rate < 70) {
      score -= (70 - rate) * HEALTH_PENALTY_ATTENDANCE_PER_POINT
    }
    score -= consecutiveAbsentCount.value * HEALTH_PENALTY_CONSECUTIVE_ABSENT
    score -= needsFollowupCount.value * HEALTH_PENALTY_NEEDS_FOLLOWUP
    return Math.max(0, Math.min(100, Math.round(score)))
  })

  const healthLabel = computed(() =>
    healthScore.value >= 80 ? 'ممتازة' :
    healthScore.value >= 60 ? 'جيدة' :
    healthScore.value >= 40 ? 'تحتاج متابعة' : 'في خطر'
  )

  const healthColor = computed(() =>
    healthScore.value >= 80 ? 'success' :
    healthScore.value >= 60 ? 'gold' : 'danger'
  )

  // === 8. Group Score (для GroupDetails) ===
  function calculateGroupScore(group, groupMembers, groupChallenges = [], challenges = []) {
    if (!groupMembers.length) {
      return { total: 0, breakdown: [], memberCount: 0, challengePoints: 0, pendingChallengePoints: 0 }
    }

    const breakdown = []
    let total = 0

    // 1. Attendance
    const groupAttendanceRate = getGroupAttendanceRate(groupMembers)
    if (groupAttendanceRate >= 90) {
      breakdown.push({ label: 'حضور ممتاز', points: GROUP_SCORE_WEIGHTS.attendance_90, icon: '🏆', color: 'success' })
      total += GROUP_SCORE_WEIGHTS.attendance_90
    } else if (groupAttendanceRate >= 70) {
      breakdown.push({ label: 'حضور جيد', points: GROUP_SCORE_WEIGHTS.attendance_70, icon: '✓', color: 'brand' })
      total += GROUP_SCORE_WEIGHTS.attendance_70
    } else if (groupAttendanceRate > 0) {
      breakdown.push({ label: 'حضور ضعيف', points: GROUP_SCORE_WEIGHTS.attendance_below_70, icon: '⚠️', color: 'danger' })
      total += GROUP_SCORE_WEIGHTS.attendance_below_70
    }

    // 2. Followup
    const groupFollowupRate = getGroupFollowupRate(groupMembers)
    if (groupFollowupRate >= 90) {
      breakdown.push({ label: 'افتقاد منتظم', points: GROUP_SCORE_WEIGHTS.followup_90, icon: '📞', color: 'success' })
      total += GROUP_SCORE_WEIGHTS.followup_90
    } else if (groupFollowupRate >= 70) {
      breakdown.push({ label: 'افتقاد جيد', points: GROUP_SCORE_WEIGHTS.followup_70, icon: '📞', color: 'brand' })
      total += GROUP_SCORE_WEIGHTS.followup_70
    } else {
      breakdown.push({ label: 'افتقاد ضعيف', points: GROUP_SCORE_WEIGHTS.followup_below_70, icon: '❌', color: 'danger' })
      total += GROUP_SCORE_WEIGHTS.followup_below_70
    }

    // 3. New members (last 30 days)
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * DAY_MS)
    const newMembers = groupMembers.filter((m) => m.created_at && new Date(m.created_at) >= monthAgo)
    if (newMembers.length > 0) {
      const points = newMembers.length * GROUP_SCORE_WEIGHTS.new_member_each
      breakdown.push({ label: `${newMembers.length} عضو جديد`, points, icon: '🎉', color: 'success' })
      total += points
    }

    // 4. Consecutive absent
    const consecutiveAbsentCount = groupMembers.filter((m) =>
      getConsecutiveAbsent(m.id) >= consecutiveAbsentThreshold
    ).length
    if (consecutiveAbsentCount > 0) {
      const points = consecutiveAbsentCount * GROUP_SCORE_WEIGHTS.consecutive_absent_each
      breakdown.push({ label: `${consecutiveAbsentCount} عضو غايب ${consecutiveAbsentThreshold}+ مرات`, points, icon: '🚨', color: 'danger' })
      total += points
    }

    // 5. No servant
    const noServant = groupMembers.filter((m) => !m.servant_id).length
    if (noServant > 0) {
      const points = noServant * GROUP_SCORE_WEIGHTS.no_servant_each
      breakdown.push({ label: `${noServant} عضو بدون خادم`, points, icon: '👤', color: 'gold' })
      total += points
    }

    // 6. Challenges
    const challengeResult = getChallengePoints(group.id, groupChallenges, challenges)
    if (challengeResult.ended > 0) {
      breakdown.push({ label: `${challengeResult.endedCount} تحدي منتهي`, points: challengeResult.ended, icon: '🏆', color: 'gold' })
      total += challengeResult.ended
    }

    return {
      total: Math.max(0, total),
      breakdown,
      memberCount: groupMembers.length,
      attendanceRate: groupAttendanceRate,
      followupRate: groupFollowupRate,
      newMembersCount: newMembers.length,
      challengePoints: challengeResult.ended,
      pendingChallengePoints: challengeResult.pending,
      challengeDetails: challengeResult.details,
    }
  }

  function getGroupAttendanceRate(groupMembers) {
    const dates = recentDates.value // используем то же окно
    if (!dates.length) return 0

    const memberIds = groupMembers.map((m) => m.id)
    let total = 0
    let present = 0

    for (const dateStr of dates) {
      const records = getRecordsForDate(attendanceData.value, dateStr)
      for (const id of memberIds) {
        if (records[id] !== undefined) {
          total++
          if (records[id]) present++
        }
      }
    }
    return total === 0 ? 0 : Math.round((present / total) * 100)
  }

  function getGroupFollowupRate(groupMembers) {
    const today = new Date()
    let contacted = 0
    for (const m of groupMembers) {
      const list = followupsMap.value[m.id] || []
      if (list.length === 0) continue
      const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
      const days = Math.floor((today - new Date(sorted[0].date)) / DAY_MS)
      if (days <= followupThresholdDays) contacted++
    }
    return groupMembers.length === 0 ? 0 : Math.round((contacted / groupMembers.length) * 100)
  }

  function getChallengePoints(groupId, groupChallenges = [], challenges = []) {
    const groupEntries = groupChallenges.filter(
      (gc) => gc.group_id === groupId && gc.status === 'approved'
    )

    let ended = 0
    let pending = 0
    let endedCount = 0
    const details = []

    const today = new Date()

    for (const gc of groupEntries) {
      const challenge = challenges.find((c) => c.id === gc.challenge_id)
      if (!challenge) continue

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
    }

    return { ended, pending, endedCount, details }
  }

  // === 9. Followup Suggestions ===
  function getFollowupSuggestions(member) {
    const suggestions = []
    const consecutive = getConsecutiveAbsent(member.id)
    const followup = getFollowupStatus(member.id)
    const daysSinceJoined = member.created_at ? daysBetween(member.created_at) : null

    if (consecutive >= consecutiveAbsentThreshold) {
      suggestions.push({
        icon: '📞',
        text: `اتصل بولي الأمر — غايب من ${consecutive} اجتماع متتالي`,
        priority: 'high',
      })
    }

    if (followup.daysSince === null) {
      suggestions.push({
        icon: '👋',
        text: 'تواصل معه لأول مرة — لم يتم التواصل مطلقاً',
        priority: 'high',
      })
    } else if (followup.daysSince > followupThresholdDays) {
      suggestions.push({
        icon: '📞',
        text: `اتصل بولي الأمر — آخر تواصل من ${followup.daysSince} يوم`,
        priority: followup.daysSince > followupUrgentDays ? 'high' : 'medium',
      })
    }

    if (daysSinceJoined !== null && daysSinceJoined <= 14) {
      suggestions.push({
        icon: '🎉',
        text: `رحّب به — مسجّل من ${daysSinceJoined} يوم`,
        priority: 'low',
      })
    }

    // Birthday
    if (member.birth_date) {
      const birth = new Date(member.birth_date)
      const today = new Date()
      const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
      if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1)
      const daysToBirthday = Math.floor((nextBirthday - today) / DAY_MS)
      if (daysToBirthday <= 7) {
        suggestions.push({
          icon: '🎂',
          text: `عيد ميلاده بعد ${daysToBirthday} يوم — ابعت تهنئة`,
          priority: 'low',
        })
      }
    }

    if (!member.servant_id) {
      suggestions.push({
        icon: '👤',
        text: 'عيّن له خادم مسؤول',
        priority: 'medium',
      })
    }

    return suggestions
  }

  return {
    // Основные вычисления
    attendanceRate,
    healthScore,
    healthLabel,
    healthColor,
    memberRows,
    needsFollowupList,
    needsFollowupCount,
    consecutiveAbsentList,
    consecutiveAbsentCount,
    highRiskList,
    highRiskCount,
    noServantList,
    noServantCount,

    // Функции для конкретных member
    getConsecutiveAbsent,
    getFollowupStatus,
    calculateRiskScore,
    getFollowupSuggestions,

    // Групповые вычисления
    calculateGroupScore,
    getGroupAttendanceRate,
    getGroupFollowupRate,
    getChallengePoints,

    // Константы (для удобства в шаблонах)
    CONSECUTIVE_ABSENT_THRESHOLD: consecutiveAbsentThreshold,
    FOLLOWUP_THRESHOLD_DAYS: followupThresholdDays,
  }
}