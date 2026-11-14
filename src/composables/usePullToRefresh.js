import { ref, onMounted, onBeforeUnmount } from 'vue'

export function usePullToRefresh(onRefresh, options = {}) {
  const {
    threshold = 80,
    maxPull = 120,
  } = options

  const pullDistance = ref(0)
  const isPulling = ref(false)
  const isRefreshing = ref(false)
  const startY = ref(0)
  let container = null

  function handleTouchStart(e) {
    if (window.scrollY > 0) return
    startY.value = e.touches[0].clientY
    isPulling.value = true
  }

  function handleTouchMove(e) {
    if (!isPulling.value || isRefreshing.value) return
    if (window.scrollY > 0) {
      isPulling.value = false
      pullDistance.value = 0
      return
    }

    const currentY = e.touches[0].clientY
    const distance = currentY - startY.value

    if (distance > 0) {
      e.preventDefault()
      pullDistance.value = Math.min(distance * 0.5, maxPull)
    }
  }

  async function handleTouchEnd() {
    if (!isPulling.value) return
    isPulling.value = false

    if (pullDistance.value >= threshold && !isRefreshing.value) {
      isRefreshing.value = true
      try {
        await onRefresh()
      } catch (e) {
        console.error('Refresh error:', e)
      } finally {
        isRefreshing.value = false
        pullDistance.value = 0
      }
    } else {
      pullDistance.value = 0
    }
  }

  onMounted(() => {
    container = document
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
  })

  onBeforeUnmount(() => {
    if (!container) return
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
    container.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    threshold,
  }
}