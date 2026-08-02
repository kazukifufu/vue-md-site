export interface Post {
  id: string
  title: string
  date: string // YYYY-MM-DD
  content: string
  path: string
}

// Front Matterの解析用関数
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
  const modules = import.meta.glob('/src/assets/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  })

  const posts: Post[] = []

  for (const path in modules) {
    // 💡 default.md（トップページ用）は記事データ・カレンダー判定から除外
    if (path.endsWith('/default.md')) continue
    
    const rawContent = modules[path] as string
    const { data, content } = parseFrontMatter(rawContent)

    if (data.date) {
      // pop() が undefined になった場合のフォールバックを明示的に記述
      const lastSegment = path.split('/').pop() ?? ''
      const fileName = lastSegment.replace(/\.md$/, '') || '無題'

      posts.push({
        id: path,
        title: data.title || fileName,
        date: data.date.trim(),
        content,
        path,
      })
    }
  }

  // 日付の降順（新しい順）でソート
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}