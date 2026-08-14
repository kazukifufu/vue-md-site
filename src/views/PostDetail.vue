<template>
  <div class="post-detail">
    <!-- Markdown から変換された HTML を描画 -->
    <div v-if="htmlContent" class="markdown-body" v-html="htmlContent"></div>
    <!-- 該当記事が存在しない場合のメッセージ -->
    <div v-else class="placeholder">
      <p>記事が見つかりませんでした。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'

const route = useRoute()
const htmlContent = ref('')

// Vite の import.meta.glob で全 Markdown ファイルの動的読み込み関数を取得
const markdownFiles = import.meta.glob('/src/assets/content/**/*.md', { 
  query: '?raw', 
  import: 'default' 
})

// トップページ用の初期表示ファイルパスとサイト名
const DEFAULT_MD_PATH = '/src/assets/content/default.md'
const SITE_TITLE = "Kazuki's Blog"

const loadPost = async () => {
  // URL パラメータ (/posts/:category/:slug) を取得
  const { category, slug } = route.params

  let targetPath = ''

  if (category && slug) {
    // パラメータが存在する場合は対応する md ファイルのパスを構築
    targetPath = `/src/assets/content/${category}/${slug}.md`
  } else {
    // パラメータがないルート (/) アクセスの場合は default.md を指定
    targetPath = DEFAULT_MD_PATH
  }

  // 該当する Markdown ファイルが存在するか確認して読み込む
  if (markdownFiles[targetPath]) {
    const rawContent = await markdownFiles[targetPath]()

    // Front Matter (--- 内) から title: の行を抽出
    const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    let articleTitle = ''
    if (match && match[1]) {
      const titleMatch = match[1].match(/^title:\s*(.+)$/m)
      if (titleMatch) {
        // シングル/ダブルクォーテーションを除去して綺麗にする
        articleTitle = titleMatch[1].trim().replace(/^['"]|['"]$/g, '')
      }
    }

    // <title> タグを動的に更新
    if (articleTitle) {
      document.title = `${articleTitle} | ${SITE_TITLE}`
    } else if (!category && !slug) {
      // トップページ (default.md) の場合
      document.title = `Kazuki's Blog - ITは活用する道具である！`
    } else {
      // タイトルが取得できなかった場合のフォールバック（スラグ名を使用）
      document.title = `${slug} | ${SITE_TITLE}`
    }

    // Front Matter ヘッダー（--- から --- まで）を除去して本文のみ抽出
    const bodyContent = rawContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    // marked ライブラリで HTML に変換
    htmlContent.value = marked(bodyContent)
  } else {
    htmlContent.value = ''
    // 該当記事が存在しない場合のタイトル
    document.title = `404 記事が見つかりません | ${SITE_TITLE}`
  }
}

// 初回レンダリング時に記事を読み込み
onMounted(loadPost)

// 💡 重要: URL パラメータ（route.params）が変更されたら記事を再読み込み
watch(() => route.params, loadPost, { deep: true })
</script>

<style scoped>
.post-detail {
  padding: 16px;
}

.placeholder {
  text-align: center;
  color: #888;
  padding: 48px 0;
}
</style>