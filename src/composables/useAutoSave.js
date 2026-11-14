import { watch, onBeforeUnmount, ref } from 'vue'

/**
 * Auto-save form data to localStorage
 * @param {string} key - localStorage key
 * @param {Object} form - reactive form object
 * @param {number} delay - debounce delay in ms
 */
export function useAutoSave(key, form, delay = 1000) {
  const hasDraft = ref(false)
  const lastSavedAt = ref(null)
  let timeout = null

  // Check for existing draft on init
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const draft = JSON.parse(saved)
      hasDraft.value = true
      lastSavedAt.value = draft.savedAt
    } catch {}
  }

  // Save on form changes
  watch(
    () => JSON.stringify(form),
    () => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify({
            data: { ...form },
            savedAt: new Date().toISOString(),
          }))
          lastSavedAt.value = new Date().toISOString()
        } catch (e) {
          console.error('Auto-save failed:', e)
        }
      }, delay)
    },
    { deep: true }
  )

  function loadDraft() {
    const saved = localStorage.getItem(key)
    if (!saved) return null
    try {
      const draft = JSON.parse(saved)
      return draft.data
    } catch {
      return null
    }
  }

  function clearDraft() {
    localStorage.removeItem(key)
    hasDraft.value = false
    lastSavedAt.value = null
    if (timeout) clearTimeout(timeout)
  }

  onBeforeUnmount(() => {
    if (timeout) clearTimeout(timeout)
  })

  return {
    hasDraft,
    lastSavedAt,
    loadDraft,
    clearDraft,
  }
}