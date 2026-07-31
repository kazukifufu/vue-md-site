<script setup lang="ts">
import { computed } from 'vue'
import { useDateFilter } from '@/composables/useDateFilter'

const props = defineProps<{
  articleDates: string[]
}>()

const { selectedDate, setDate } = useDateFilter()

// 投稿が存在する日付の高速検索用 Set
const postDateSet = computed(() => new Set(props.articleDates))

const handleDateClick = (dateString: string) => {
  setDate(dateString)
}
</script>

<template>
  <div class="calendar-container">
    <div
      v-for="day in calendarDays"
      :key="day.dateString"
      class="calendar-day"
      :class="{
        'is-selected': selectedDate === day.dateString,
        'has-post': postDateSet.has(day.dateString)
      }"
      @click="handleDateClick(day.dateString)"
    >
      <span>{{ day.dayNumber }}</span>
      <span v-if="postDateSet.has(day.dateString)" class="post-dot"></span>
    </div>
  </div>
</template>

<style scoped>
.calendar-day.is-selected {
  background-color: #42b883;
  color: #fff;
  border-radius: 4px;
}
.post-dot {
  display: block;
  width: 4px;
  height: 4px;
  background-color: #ff4757;
  border-radius: 50%;
  margin: 2px auto 0;
}
</style>