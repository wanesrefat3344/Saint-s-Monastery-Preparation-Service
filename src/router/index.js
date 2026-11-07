import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import MemberForm from '../views/MemberForm.vue'
import MemberList from '../views/MemberList.vue'
import MemberDetails from '../views/MemberDetails.vue'
import MemberEdit from '../views/MemberEdit.vue'
import UsersList from '../views/UsersList.vue'
import Attendance from '../views/Attendance.vue'
import Followups from '../views/Followups.vue'
import Reports from '../views/Reports.vue'
import AuditLog from '../views/AuditLog.vue'
import Settings from '../views/Settings.vue'
import GroupsList from '../views/GroupsList.vue'
import GroupDetails from '../views/GroupDetails.vue'
import LeadersApproval from '../views/LeadersApproval.vue'
import ServantsList from '../views/ServantsList.vue'
import ServantDetails from '../views/ServantDetails.vue'
import ServantsApproval from '../views/ServantsApproval.vue'
import ChallengesList from '../views/ChallengesList.vue'
import ChallengesApproval from '../views/ChallengesApproval.vue'
import ChallengeDetails from '../views/ChallengeDetails.vue'
import GroupChallenges from '../views/GroupChallenges.vue'
import ReadingBooksList from '../views/ReadingBooksList.vue'
import ReadingsList from '../views/ReadingsList.vue'
import ReadingForm from '../views/ReadingForm.vue'

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true, title: 'تسجيل الدخول' } },
  { path: '/', name: 'dashboard', component: Dashboard, meta: { title: 'لوحة التحكم' } },
  { path: '/members', name: 'members', component: MemberList, meta: { title: 'قائمة المخدومين' } },
  { path: '/members/new', name: 'member-new', component: MemberForm, meta: { title: 'تسجيل مخدوم' } },
  { path: '/members/:id', name: 'member-details', component: MemberDetails, meta: { title: 'تفاصيل المخدوم' } },
  { path: '/members/:id/edit', name: 'member-edit', component: MemberEdit, meta: { title: 'تعديل مخدوم' } },
  { path: '/users', name: 'users', component: UsersList, meta: { adminOnly: true, title: 'إدارة الحسابات' } },
  { path: '/attendance', name: 'attendance', component: Attendance, meta: { title: 'الحضور والغياب' } },
  { path: '/followups', name: 'followups', component: Followups, meta: { title: 'الافتقاد' } },
  { path: '/reports', name: 'reports', component: Reports, meta: { title: 'التقارير' } },
  { path: '/audit-log', name: 'audit-log', component: AuditLog, meta: { adminOnly: true, title: 'سجل النشاط' } },
  { path: '/settings', name: 'settings', component: Settings, meta: { adminOnly: true, title: 'الإعدادات' } },
  { path: '/groups', name: 'groups', component: GroupsList, meta: { adminOnly: true, title: 'المجموعات' } },
  { path: '/groups/:id', name: 'group-details', component: GroupDetails, meta: { title: 'تفاصيل المجموعة' } },
  { path: '/groups/:id/challenges', name: 'group-challenges', component: GroupChallenges, meta: { title: 'تحديات المجموعة' } },
  { path: '/leaders-approval', name: 'leaders-approval', component: LeadersApproval, meta: { adminOnly: true, title: 'ترشيحات الليدز' } },
  { path: '/servants', name: 'servants', component: ServantsList, meta: { adminOnly: true, title: 'الخدام' } },
  { path: '/servants/:id', name: 'servant-details', component: ServantDetails, meta: { adminOnly: true, title: 'بروفايل الخادم' } },
  { path: '/servants-approval', name: 'servants-approval', component: ServantsApproval, meta: { adminOnly: true, title: 'طلبات إضافة خدام' } },
  { path: '/challenges', name: 'challenges', component: ChallengesList, meta: { adminOnly: true, title: 'التحديات' } },
  { path: '/challenges-approval', name: 'challenges-approval', component: ChallengesApproval, meta: { adminOnly: true, title: 'طلبات الاشتراك في التحديات' } },
  { path: '/challenges/:id', name: 'challenge-details', component: ChallengeDetails, meta: { adminOnly: true, title: 'تفاصيل التحدي' } },
  { path: '/reading-books', name: 'reading-books', component: ReadingBooksList, meta: { adminOnly: true, title: 'أسفار القراءة' } },
  { path: '/readings', name: 'readings', component: ReadingsList, meta: { public: true, title: 'القراءات' } },
  { path: '/readings/new', name: 'reading-new', component: ReadingForm, meta: { public: true, title: 'تسجيل قراءة' } },
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // ===== الصفحات العامة =====
  if (to.meta.public) {
    // لو مسجل دخول وحاول يفتح login
    if (to.name === 'login' && token) {
      return user.role === 'reader'
        ? { name: 'reading-new' }
        : { name: 'dashboard' }
    }
    return true
  }

  // ===== الصفحات المحمية =====
  if (!token) return { name: 'login' }

  // ===== دور reader: يقدر بس على /readings/new =====
  if (user.role === 'reader' && to.name !== 'reading-new') {
    return { name: 'reading-new' }
  }

  // ===== صفحات الأدمن فقط =====
  if (to.meta.adminOnly && user.role !== 'admin') {
    // reader بيترجع لـ reading-new، غيره لـ dashboard
    if (user.role === 'reader') return { name: 'reading-new' }
    return { name: 'dashboard' }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | خدمة إعدادي` : 'خدمة إعدادي'
})

export default router