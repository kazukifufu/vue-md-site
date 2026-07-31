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

  if (!match) {
    return { data: {}, content: rawContent }
  }

  const yamlBlock = match[1]
  const content = match[2]
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
    const rawContent = modules[path] as string
    const { data, content } = parseFrontMatter(rawContent)

    if (data.date) {
      // パスからファイル名（xxxxx.md の xxxxx 部分）を抽出
      const fileName = path.split('/').pop()?.replace(/\.md$/, '') || '無題'

      posts.push({
        id: path,
        title: data.title || fileName, // Front Matterにtitleがなければファイル名を使用
        date: data.date.trim(),
        content,
        path,
      })
    }
  }

  // 日付の降順（新しい順）でソート
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}