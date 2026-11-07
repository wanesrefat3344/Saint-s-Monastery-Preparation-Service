// تسجيل نشاط في localStorage
export function logActivity(action, details = {}) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const logs = JSON.parse(localStorage.getItem('demo_audit_log') || '[]')

    logs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user_email: user.email || 'unknown',
      user_name: user.name || 'غير معروف',
      action,
      details,
    })

    // احتفظ بآخر 500 سجل بس
    localStorage.setItem('demo_audit_log', JSON.stringify(logs.slice(0, 500)))
  } catch (e) {
    console.error('Audit log error:', e)
  }
}


export function getLogs() {
  return JSON.parse(localStorage.getItem('demo_audit_log') || '[]')
}


export function clearLogs() {
  localStorage.removeItem('demo_audit_log')
}


export const ACTION_LABELS = {
  'member.create': { label: 'إضافة مخدوم', icon: '➕', color: 'text-success' },
  'member.update': { label: 'تعديل مخدوم', icon: '✏️', color: 'text-gold' },
  'member.delete': { label: 'حذف مخدوم', icon: '🗑️', color: 'text-danger' },
  'attendance.save': { label: 'حفظ حضور', icon: '✓', color: 'text-brand' },
  'followup.create': { label: 'تسجيل تواصل', icon: '📞', color: 'text-brand' },
  'followup.delete': { label: 'حذف تواصل', icon: '🗑️', color: 'text-danger' },
  'note.create': { label: 'إضافة ملاحظة', icon: '📝', color: 'text-gold' },
  'note.delete': { label: 'حذف ملاحظة', icon: '🗑️', color: 'text-danger' },
  'user.create': { label: 'إضافة حساب', icon: '👤', color: 'text-success' },
  'user.toggle': { label: 'تعطيل/تنشيط حساب', icon: '🔒', color: 'text-gold' },
  'backup.export': { label: 'تحميل نسخة احتياطية', icon: '💾', color: 'text-brand' },
  'backup.restore': { label: 'استرجاع نسخة', icon: '📥', color: 'text-danger' },
}