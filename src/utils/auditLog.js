import api from '../api/client'

// ===== ACTION LABELS =====
// دي للعرض في الفرونت بس — الباك بيبعت action كـ string
export const ACTION_LABELS = {
  'user.create':         { label: 'إنشاء حساب',       icon: '👤', color: 'text-success', bubble: 'bg-success/10 text-success' },
  'user.update':         { label: 'تعديل حساب',       icon: '✏️', color: 'text-brand',   bubble: 'bg-brand/10 text-brand' },
  'user.delete':         { label: 'حذف حساب',         icon: '🗑️', color: 'text-danger',  bubble: 'bg-danger/10 text-danger' },
  'user.password_change':{ label: 'تغيير باسورد',      icon: '🔑', color: 'text-gold',    bubble: 'bg-gold/10 text-gold' },
  'user.role_change':    { label: 'تغيير دور',         icon: '🎭', color: 'text-brand',   bubble: 'bg-brand/10 text-brand' },
  'user.status_change':  { label: 'تغيير حالة',        icon: '⚡', color: 'text-gold',    bubble: 'bg-gold/10 text-gold' },
  'user.approve':        { label: 'موافقة حساب',       icon: '✅', color: 'text-success', bubble: 'bg-success/10 text-success' },
  'user.reject':         { label: 'رفض حساب',          icon: '❌', color: 'text-danger',  bubble: 'bg-danger/10 text-danger' },
}

// ===== API Functions =====
export async function getLogs(limit = 500) {
  try {
    const { data } = await api.get('/audit-log', { params: { limit } })
    return data
  } catch (e) {
    console.error('Failed to load audit logs:', e)
    return []
  }
}

// حذف السجل — للأدمن بس
export async function clearLogs() {
  try {
    await api.delete('/audit-log')
    return true
  } catch (e) {
    console.error('Failed to clear audit logs:', e)
    return false
  }
}

// دالة helper للتسجيل من الفرونت (مش مستخدمة حاليًا — الباك بيسجل تلقائي)
export function logActivity(action, details = {}) {
  console.log(`[audit] ${action}`, details)
}