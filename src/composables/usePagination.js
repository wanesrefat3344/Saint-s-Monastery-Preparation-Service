import { ref, computed } from 'vue'

export function usePagination(items, options = {}) {
  const { pageSize = 20, infinite = false } = options
  const currentPage = ref(1)
  const loadingMore = ref(false)

  const totalPages = computed(() => Math.ceil(items.value.length / pageSize))
  const hasMore = computed(() => currentPage.value < totalPages.value)

  const paginatedItems = computed(() => {
    if (infinite) {
      const end = currentPage.value * pageSize
      return items.value.slice(0, end)
    }
    const start = (currentPage.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  function nextPage() {
    if (hasMore.value) currentPage.value++
  }

  function prevPage() {
    if (currentPage.value > 1) currentPage.value--
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
  }

  function reset() {
    currentPage.value = 1
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    await new Promise((r) => setTimeout(r, 300))
    nextPage()
    loadingMore.value = false
  }

  return {
    currentPage,
    totalPages,
    hasMore,
    loadingMore,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    reset,
    loadMore,
  }
}