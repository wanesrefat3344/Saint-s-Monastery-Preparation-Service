<template>
  <div class="card mb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <!-- Search -->
      <div class="relative md:col-span-2 lg:col-span-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-navy/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          type="text"
          class="input pr-9"
          :placeholder="searchPlaceholder"
        />
      </div>

      <!-- Filters -->
      <select
        v-for="f in filters"
        :key="f.key"
        :value="filtersValues[f.key]"
        @change="$emit('update:filter', f.key, $event.target.value)"
        class="input"
      >
        <option value="">{{ f.placeholder || f.label }}</option>
        <option v-for="o in f.options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </div>

    <!-- Active filters -->
    <div v-if="hasActive" class="mt-3 flex items-center gap-2 flex-wrap text-xs">
      <span class="text-navy/50">فلاتر نشطة:</span>
      <span v-if="modelValue" class="badge">{{ modelValue }}</span>
      <span
        v-for="(v, k) in filtersValues"
        v-show="v"
        :key="k"
        class="badge"
      >
        {{ getFilterLabel(k, v) }}
      </span>
      <button @click="$emit('clear')" class="text-brand hover:underline">مسح الكل</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'بحث...' },
  filters: { type: Array, default: () => [] },
  filtersValues: { type: Object, default: () => ({}) },
})

defineEmits(['update:modelValue', 'update:filter', 'clear'])

const hasActive = computed(() => {
  if (props.modelValue) return true
  return Object.values(props.filtersValues).some(Boolean)
})

function getFilterLabel(key, value) {
  const f = props.filters.find((x) => x.key === key)
  if (!f) return value
  const o = f.options.find((x) => x.value === value)
  return o?.label || value
}
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: rgb(var(--color-navy) / 0.08);
  color: rgb(var(--color-navy));
  font-size: 0.75rem;
  font-weight: 500;
}
</style>