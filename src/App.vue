<template>
  <div class="site-wrapper">
    <header class="global-header">
      <div class="header-left">
        <!-- ロゴクリックでデフォルト記事（トップページ）を表示 -->
        <div class="logo clickable" @click="loadDefaultPost" title="トップページへ">
          <i class="fa-solid fa-pen-nib"></i> <span>Kazuki's Blog. ITは活用する道具である！</span>
        </div>
      </div>
      
      <div class="header-ticker">
        <div class="ticker-wrapper">
          <div class="ticker-content" :class="{ paused: !isPlaying }">
            【お知らせ】Vue 3 と Cloudflare Pages を使った自作ブログのカスタマイズ連載を更新中！ 🚀 &nbsp;&nbsp;&nbsp;&nbsp;
            【今週の目標】プロフィール画面に Weekly Compass を導入しました。右上のアバターアイコンからぜひチェックしてください！ ✨
          </div>
        </div>
        <!-- 再生 / 停止 切り替えボタン -->
        <button 
          class="ticker-toggle-btn" 
          @click="toggleTicker" 
          :title="isPlaying ? 'スクロールを一時停止' : 'スクロールを再開'"
        >
          <i :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
        </button>
      </div>

      <div class="header-right">
        <button class="nav-btn"><i class="fa-solid fa-list-ul"></i> List</button>
        <button class="nav-btn"><i class="fa-regular fa-bell"></i> Notifications</button>
        <button class="icon-btn" @click="openProfile" title="プロフィール">
          <i class="fa-regular fa-user"></i>
        </button>
        <div class="user-icon"><i class="fa-regular fa-circle-user"></i></div>
      </div>
    </header>

    <div class="app-container">
      <aside class="sidebar">
        <h2>カテゴリー</h2>

        <!-- 📅 日付選択中の解除バッジ -->
        <div v-if="selectedDate" class="filter-info">
          <span class="filter-icon">📅</span>
          <span class="filter-text">{{ selectedDate }} の記事で絞込み</span>
          <button class="clear-btn" @click="clearFilter">解除</button>
        </div>

        <!-- カテゴリー＆記事リスト -->
        <ul class="category-list">
          <li v-for="(articles, category) in menuData" :key="category" class="category-item">
            <div class="category-title" @click="toggleCategory(category)">
              <span class="arrow">{{ expandedCategories[category] ? '▼' : '▶' }}</span>
              {{ category }}
            </div>
            <transition name="slide">
              <ul v-if="expandedCategories[category]" class="article-list">
                <li 
                  v-for="article in articles" 
                  :key="article.path"
                  v-show="!selectedDate || article.date === selectedDate"
                  :class="{ active: currentArticlePath === article.path }"
                  @click="selectArticle(article)"
                >
                  {{ article.title }}
                </li>
              </ul>
            </transition>
          </li>
        </ul>

        <!-- カレンダー部分 -->
        <div class="sidebar-calendar">
          <div class="calendar-header">
            <button @click="prevMonth" class="cal-btn">&lt;</button>
            <span class="calendar-title">{{ calendarTitle }}</span>
            <button @click="nextMonth" class="cal-btn">&gt;</button>
          </div>
          
          <div class="calendar-weekdays">
            <span v-for="day in weekdays" :key="day" class="weekday-cell">{{ day }}</span>
          </div>

          <div class="calendar-grid">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index" 
              class="day-cell"
              :class="{ 
                'is-today': day.isToday, 
                'empty-cell': !day.date,
                'has-article': day.hasArticle,
                'is-selected': selectedDate === day.fullDate
              }"
              @click="handleDateClick(day)"
            >
              {{ day.date }}
            </div>
          </div>
        </div>
      </aside>

      <!-- メイン表示エリア -->
      <main class="content-area">
        <div v-if="showProfile">
          <UserProfile />
        </div>

        <div v-else-if="htmlContent" class="markdown-body" v-html="htmlContent"></div>

        <div v-else class="placeholder">
          <p>左側のメニューから記事を選択してください.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import UserProfile from '@/components/UserProfile.vue'
import { getAllPosts } from '@/utils/getPosts'
import { useDateFilter } from '@/composables/useDateFilter'

// 状態管理
const menuData = ref({})
const expandedCategories = ref({})
const htmlContent = ref('')
const currentArticlePath = ref('')
const showProfile = ref(false)
// スクロール状態の管理（初期値は true = 再生）
const isPlaying = ref(true)

// スクロールの再生・停止切り替え
const toggleTicker = () => {
  isPlaying.value = !isPlaying.value
}

// 全記事データと Composable の呼び出し
const allArticles = ref([])
const { selectedDate, setDate, clearFilter } = useDateFilter()

// Viteの機能でMarkdownファイルを動的ロード用に保持
const markdownFiles = import.meta.glob('/src/assets/content/**/*.md', { query: '?raw', import: 'default' })

// デフォルト表示用 Markdown のパス
const DEFAULT_MD_PATH = '/src/assets/content/default.md'

// デフォルト表示用 Markdown を読み込む関数
const loadDefaultPost = async () => {
  showProfile.value = false
  currentArticlePath.value = DEFAULT_MD_PATH

  if (markdownFiles[DEFAULT_MD_PATH]) {
    const rawContent = await markdownFiles[DEFAULT_MD_PATH]()
    const bodyContent = rawContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    htmlContent.value = marked(bodyContent)
  } else {
    htmlContent.value = ''
  }
}

// 記事が存在する日付のリスト（重複なし）
const articleDates = computed(() => {
  const dates = allArticles.value.map(article => article.date)
  return Array.from(new Set(dates))
})

// 📅 カレンダー描画用ロジック
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const calendarTitle = computed(() => `${currentYear.value}年 ${currentMonth.value + 1}月`)

const formatDate = (year, month, date) => {
  const m = String(month + 1).padStart(2, '0')
  const d = String(date).padStart(2, '0')
  return `${year}-${m}-${d}`
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDay = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const days = []

  for (let i = 0; i < startDay; i++) {
    days.push({ date: null, isToday: false, hasArticle: false, fullDate: '' })
  }

  for (let d = 1; d <= totalDays; d++) {
    const fullDate = formatDate(year, month, d)
    const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
    
    const hasArticle = articleDates.value.includes(fullDate)

    days.push({
      date: d,
      isToday,
      hasArticle,
      fullDate
    })
  }

  return days
})

const handleDateClick = (day) => {
  if (!day.hasArticle) return
  setDate(day.fullDate)
}

const toggleCategory = (category) => {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

// 初期化処理
onMounted(() => {
  allArticles.value = getAllPosts()

  const structure = {}
  allArticles.value.forEach((article) => {
    // デフォルト用の default.md はカテゴリーメニューに含めない
    if (article.path.endsWith('/default.md')) return

    const relativePath = article.path.replace('/src/assets/content/', '')
    const parts = relativePath.split('/')
    if (parts.length >= 2) {
      const category = parts[0]
      if (!structure[category]) structure[category] = []
      
      structure[category].push({
        title: article.title,
        path: article.path,
        date: article.date
      })
    }
  })

  menuData.value = structure
  Object.keys(structure).forEach(cat => expandedCategories.value[cat] = true)

  // 初期起動時にデフォルト記事を表示
  loadDefaultPost()
})

const selectArticle = async (article) => {
  showProfile.value = false
  currentArticlePath.value = article.path
  
  if (markdownFiles[article.path]) {
    const rawContent = await markdownFiles[article.path]()
    const bodyContent = rawContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    htmlContent.value = marked(bodyContent)
  }
}

const openProfile = () => {
  showProfile.value = true
  htmlContent.value = ''
  currentArticlePath.value = ''
}

const prevMonth = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value--; }
  else { currentMonth.value--; }
}
const nextMonth = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++; }
  else { currentMonth.value++; }
}
</script>

<style scoped>
/* 全体レイアウト */
.site-wrapper {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

/* ヘッダー */
.global-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  gap: 16px;
}

.header-left .logo {
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
}

.header-left .logo.clickable {
  cursor: pointer;
  user-select: none;
}
.header-left .logo.clickable:hover {
  opacity: 0.7;
}
/* ヘッダーの中央ティッカーエリア */
.header-ticker {
  flex: 1;
  overflow: hidden;
  font-size: 12px;
  color: #666;
  background-color: #f8f9fa;
  padding: 4px 32px 4px 8px; /* 右側にボタン分のスペース（32px）を確保 */
  border-radius: 4px;
  white-space: nowrap;
  position: relative;
  display: flex;
  align-items: center;
}

.ticker-wrapper {
  display: inline-block;
  width: 100%;
  overflow: hidden;
}

/* アニメーション用コンテンツ */
.ticker-content {
  display: inline-block;
  white-space: nowrap;
  padding-left: 100%;
  animation: ticker-scroll 25s linear infinite;
}

/* 停止状態のクラス（isPlaying === false の時に適用） */
.ticker-content.paused {
  animation-play-state: paused;
}

/* 右側に固定配置する切り替えボタン */
.ticker-toggle-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 11px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background-color 0.2s, color 0.2s;
  z-index: 2;
}

.ticker-toggle-btn:hover {
  background-color: #e9ecef;
  color: #333;
}

/* 右から左へ移動させるアニメーション定義 */
@keyframes ticker-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.nav-btn, .icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-icon {
  font-size: 18px;
  color: #555;
}

/* メインコンテナ */
.app-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* サイドバー（固定幅 280px） */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
  background-color: #fdfdfd;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar h2 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #222;
}

/* カテゴリーリスト（箇条書きのリセット） */
.category-list, .article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  margin-bottom: 8px;
}

.category-title {
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.category-title .arrow {
  font-size: 10px;
  color: #888;
}

.article-list {
  padding-left: 16px;
}

.article-list li {
  font-size: 13px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  color: #555;
  margin-top: 2px;
}

.article-list li:hover {
  background-color: #f0f0f0;
  color: #000;
}

.article-list li.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

/* カレンダー部分 */
.sidebar-calendar {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.calendar-title {
  font-weight: bold;
  font-size: 13px;
}

.cal-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 8px;
  font-size: 12px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 4px;
  color: #444;
}

.day-cell.has-article {
  cursor: pointer;
  font-weight: bold;
  color: #1890ff;
  background-color: #e6f7ff;
}

.day-cell.has-article:hover {
  background-color: #bae7ff;
}

.day-cell.is-today {
  border: 1px solid #1890ff;
}

.day-cell.is-selected {
  background-color: #1890ff !important;
  color: #fff !important;
}

/* メインコンテンツ表示域 */
.content-area {
  flex: 1;
  padding: 32px 48px;
  overflow-y: auto;
  background-color: #ffffff;
}

/* Markdownデザインの補正 */
.markdown-body {
  line-height: 1.6;
  color: #24292e;
}

.markdown-body h1 {
  font-size: 24px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.markdown-body h3 {
  font-size: 16px;
  margin-top: 24px;
  margin-bottom: 12px;
}

.markdown-body ul {
  padding-left: 20px;
}

/* 絞り込み状態を表示するエリア全体 */
.filter-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

/* カレンダーアイコンの調整 */
.filter-icon {
  font-size: 14px;
}

/* カテゴリータイトル（下部のコンテンツタイトル）と同等のスタイル設定 */
.filter-text {
  /* カテゴリータイトル（Test, Techなど）と同じサイズ・太さに合わせる */
  font-size: 14px;       /* または 16px や inherit（親要素に合わせる場合） */
  font-weight: bold;      /* bold: カテゴリータイトルが太字の場合 */
  line-height: 1.4;
  color: #333333;        /* カテゴリータイトルのテキスト色に合わせる */
}

/* 「解除」ボタンのスタイル */
.clear-btn {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #e0e0e0;
  color: #444;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.clear-btn:hover {
  background-color: #d0d0d0;
}

</style>