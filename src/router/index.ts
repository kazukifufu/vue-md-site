import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// 表示用のコンポーネント
import PostDetail from '@/views/PostDetail.vue'
import UserProfile from '@/components/UserProfile.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: PostDetail,
    meta: { title: "Kazuki's Blog - ITは活用する道具である！" },
  },
  {
    // 記事詳細ページ (/posts/Tech/vue3-router など)
    path: '/posts/:category/:slug',
    name: 'PostDetail',
    component: PostDetail,
    // 記事ロード前の初期表示タイトル
    meta: { title: "記事詳細 | Kazuki's Blog" },
  },
  {
    // プロフィールページ (/profile)
    path: '/profile',
    name: 'Profile',
    component: UserProfile,
    meta: { title: "プロフィール | Kazuki's Blog" },
  },
  {
    // 💡 定義されていないすべてのパスにマッチする正規表現
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    // トップページへリダイレクト（または専用の NotFound.vue を表示）
    redirect: '/',
  },
]

const router = createRouter({
  // HTML5 History モードを使用（URLに # がつかない綺麗な形式）
  history: createWebHistory(),
  routes,
  // 💡 ページ遷移時に自動でトップへスクロールさせる
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // ブラウザの「戻る・進む」ボタンを押した場合は元の位置を復元
      return savedPosition
    } else {
      // 通常のページ遷移は最上部へスクロール
      return { top: 0 }
    }
  },
})

// 画面遷移後に meta.title が存在すれば <title> を書き換える
router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
})

export default router