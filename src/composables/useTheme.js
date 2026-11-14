import { ref, watch } from 'vue'

const THEME_KEY = 'app-theme' // 'light' | 'dark' | 'system'
const theme = ref(getInitialTheme())

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(value) {
  const resolved = value === 'system' ? getSystemTheme() : value
  const isDark = resolved === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', isDark ? '#0F172A' : '#F5F8FA')
}

applyTheme(theme.value)

watch(theme, (val) => {
  localStorage.setItem(THEME_KEY, val)
  applyTheme(val)
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (theme.value === 'system') applyTheme('system')
})

export function useTheme() {
  const toggle = () => {
    const current = theme.value === 'system' ? getSystemTheme() : theme.value
    theme.value = current === 'dark' ? 'light' : 'dark'
  }
  const setTheme = (v) => { theme.value = v }
  const isDark = () => {
    const resolved = theme.value === 'system' ? getSystemTheme() : theme.value
    return resolved === 'dark'
  }
  return { theme, toggle, setTheme, isDark }
}