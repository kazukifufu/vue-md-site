export interface Post {
  id: string
  title: string
  date: string
  category: string
  slug: string
  content: string
  path: string
}

// Front Matter（--- で囲まれたヘッダー情報）の解析関数
function parseFrontMatter(rawContent: string) {
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
  const match = rawContent.match(frontMatterRegex)

  if (!match || !match[1] || !match[2]) {
    return { data: {}, content: rawContent }
  }

  const yamlBlock: string = match[1]
  const content: string = match[2]
  const data: Record<string, string> = {}

  yamlBlock.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()
      value = value.replace(/^['"]|['"]$/g, '')
      data[key] = value
    }
  })

  return { data, content }
}

export function getAllPosts(): Post[] {
  // Vite の import.meta.glob で同期的に全 Markdown を取得
  const modules = import.meta.glob('/src/assets/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  })

  const posts: Post[] = []

  for (const path in modules) {
    // 💡 トップページ専用の default.md は記事一覧・カレンダー判定から除外する
    if (path.endsWith('/default.md')) continue

    const rawContent = modules[path] as string
    const { data, content } = parseFrontMatter(rawContent)

    if (data.date) {
      // パスから category と slug を抽出
      const relativePath = path.replace('/src/assets/content/', '')
      const parts = relativePath.split('/')
      
      // ⚠️ 修正箇所: TSの型エラー (undefinedの可能性) を防ぐために ?? (Nullish coalescing) を追加
      const category = parts.length >= 2 ? (parts[0] ?? 'Uncategorized') : 'Uncategorized'
      const fileName = parts[parts.length - 1] ?? ''
      const slug = fileName.replace(/\.md$/, '')

      posts.push({
        id: path,
        title: data.title || slug,
        date: data.date.trim(),
        category,
        slug,
        content,
        path,
      })
    }
  }

  // 日付の降順（新しい順）でソートして返却
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}