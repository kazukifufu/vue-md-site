import { ref } from 'vue'

// 選択中の日付 (例: "2026-07-25", 未選択時は null)
const selectedDate = ref<string | null>(null)

export function useDateFilter() {
  // 日付のセット（トグル処理）
  const setDate = (dateStr: string) => {
    if (selectedDate.value === dateStr) {
      selectedDate.value = null
    } else {
      selectedDate.value = dateStr
    }
  }

  // フィルタ解除
  const clearFilter = () => {
    selectedDate.value = null
  }

  return {
    selectedDate,
    setDate,
    clearFilter,
  }
}