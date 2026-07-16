<template>
  <div class="site-wrapper">
    <header class="global-header">
      <div class="header-left">
        <div class="logo">
          <i class="fa-solid fa-pen-nib"></i> <span>Kazuki's Blog. ITは活用する道具である！</span>
        </div>
      </div>
      
      <div class="header-ticker">
        <div class="ticker-wrapper">
          <div class="ticker-content">
            【お知らせ】Vue 3 と Cloudflare Pages を使った自作ブログのカスタマイズ連載を更新中！ 🚀 &nbsp;&nbsp;&nbsp;&nbsp;
            【今週の目標】プロフィール画面に Weekly Compass を導入しました。右上のアバターアイコンからぜひチェックしてください！ ✨
          </div>
        </div>
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
                  :class="{ active: currentArticlePath === article.path }"
                  @click="selectArticle(article)"
                >
                  {{ article.title }}
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </aside>

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
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import UserProfile from '@/components/UserProfile.vue'

// 状態管理
const menuData = ref({})
const expandedCategories = ref({})
const htmlContent = ref('')
const currentArticlePath = ref('')
// 💡 第3回の修正: プロフィール表示フラグ
const showProfile = ref(false)

// Viteの機能でMarkdownファイルを一括インポート
const markdownFiles = import.meta.glob('./assets/content/**/*.md', { query: '?raw', import: 'default' })

onMounted(() => {
  const structure = {}
  
  Object.keys(markdownFiles).forEach((filePath) => {
    const parts = filePath.replace('./assets/content/', '').split('/')
    if (parts.length === 2) {
      const category = parts[0]
      const fileName = parts[1]
      const title = fileName.replace('.md', '')

      if (!structure[category]) {
        structure[category] = []
      }
      structure[category].push({
        title,
        path: filePath
      })
    }
  })

  menuData.value = structure
  
  Object.keys(structure).forEach(category => {
    expandedCategories.value[category] = false
  })
})

// カテゴリの開閉切り替え
const toggleCategory = (category) => {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

// 💡 第3回の修正: 記事の選択とパース（プロフィールを閉じる挙動を追加）
const selectArticle = async (article) => {
  showProfile.value = false // 左メニューの記事が選ばれたら、プロフィール画面は閉じる！
  currentArticlePath.value = article.path
  
  const rawContent = await markdownFiles[article.path]()
  htmlContent.value = marked(rawContent)
}

// 💡 第3回の修正: プロフィール画面を呼び出す専用の関数
const openProfile = () => {
  showProfile.value = true  // プロフィールフラグをONにする！
  currentArticlePath.value = '' // 左メニューの選択ハイライトを綺麗に消す
  htmlContent.value = ''        // 念のため、現在表示中だった記事のデータをクリア
}
</script>

<style scoped>
/* 全体を包むラッパー：縦に並べる */
.site-wrapper {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  font-family: sans-serif;
  color: #333;
}

/* ヘッダーのスタイル */
.global-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

/* 左側：ロゴエリア（伸縮しないよう固定） */
.header-left {
  flex-shrink: 0;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 1.1rem;
}

/* 💡 追加：中央のテロップ全体コンテナ（左右の隙間を自動で埋める） */
.header-ticker {
  flex-grow: 1;          /* 左右の空きスペースを埋めるように横幅を自動確保 */
  margin: 0 30px;        /* 左右の要素と重ならないようマージンを確保 */
  overflow: hidden;      /* 枠からはみ出たテキストを隠す */
  background: #f9fafb;   /* 薄いグレーにして背景から少し浮かせる */
  border-radius: 20px;   /* 今風の丸みのあるカプセルデザイン */
  padding: 6px 15px;
  display: flex;
  align-items: center;
}

/* 💡 追加：テロップが通る道（ラッパー） */
.ticker-wrapper {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;   /* テキストを絶対に改行させない */
}

/* 💡 追加：実際に横スクロールするテキスト要素 */
.ticker-content {
  display: inline-block;
  padding-left: 100%;    /* 開始時に画面の右端からスタートさせる */
  font-size: 0.85rem;
  color: #4b5563;
  font-weight: 500;
  
  /* 15秒かけて左へ無限スクロール（文字量に合わせてお好みで調整してください） */
  animation: ticker-scroll 30s linear infinite;
}

/* 💡 UX：マウスを乗せた時は一時停止して読めるようにする */
.ticker-content:hover {
  animation-play-state: paused;
}

/* 💡 追加：テロップを動かすためのアニメーション定義 */
@keyframes ticker-scroll {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-100%, 0, 0); /* テキストの長さ分だけ左へ滑らかにスライド */
  }
}

/* 右側：ナビゲーションメニュー（伸縮しないよう固定） */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #333;
}

.nav-btn:hover {
  color: #007acc;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
}

.user-icon {
  font-size: 1.5rem;
  cursor: pointer;
}

/* コンテンツエリア：1対3の横並び */
.app-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

/* 左側サイドバー（割合 1） */
.sidebar {
  flex: 1;
  border-right: 1px solid #ddd;
  background-color: #f9f9f9;
  padding: 20px;
  overflow-y: auto;
}

/* 右側メインエリア（割合 3） */
.content-area {
  flex: 3;
  padding: 40px;
  overflow-y: auto;
}

/* サイドバーの各種スタイル */
.category-list, .article-list {
  list-style: none;
  padding-left: 0;
}

.category-item {
  margin-bottom: 15px;
}

.category-title {
  font-weight: bold;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

.category-title:hover {
  background-color: #eaeaea;
}

.arrow {
  display: inline-block;
  width: 15px;
  font-size: 0.8em;
}

.article-list {
  padding-left: 20px;
  margin-top: 5px;
}

.article-list li {
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 2px;
}

.article-list li:hover {
  background-color: #f0f0f0;
}

.article-list li.active {
  background-color: #007acc;
  color: white;
}

/* Markdown表示のスタイル */
.markdown-body :deep(h1) {
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20px 0;
  border-radius: 6px;
}

.placeholder {
  color: #999;
  text-align: center;
  margin-top: 10vh;
}

/* 💡 追加：モバイルレスポンシブ対応（画面幅が狭いスマホなどはテロップを隠す） */
@media (max-width: 768px) {
  .header-ticker {
    display: none;
  }
}
</style>