<script setup lang="ts">
import { computed } from 'vue'
import { useDateFilter } from '@/composables/useDateFilter'
import type { Post } from '@/utils/getPosts'

const props = defineProps<{
  articles: Post[]
}>()

const { selectedDate, clearFilter } = useDateFilter()

// 選択日付に基づいて記事を絞り込み
const filteredArticles = computed(() => {
  if (!selectedDate.value) {
    return props.articles
  }
  return props.articles.filter(article => article.date === selectedDate.value)
})
</script>

<template>
  <div class="article-list">
    <!-- 絞り込み実行中の案内バナー -->
    <div v-if="selectedDate" class="filter-banner">
      <span>📅 <strong>{{ selectedDate }}</strong> の記事（{{ filteredArticles.length }}件）</span>
      <button @click="clearFilter">すべての記事を表示</button>
    </div>

    <!-- 記事一覧の描画 -->
    <div v-if="filteredArticles.length > 0">
      <article v-for="article in filteredArticles" :key="article.id">
        <h2>{{ article.title }}</h2>
        <p class="date">{{ article.date }}</p>
      </article>
    </div>
    <div v-else class="no-posts">
      <p>この日に投稿された記事はありません。</p>
    </div>
  </div>
</template>