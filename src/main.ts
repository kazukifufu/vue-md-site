import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 作成した router をインポート

const app = createApp(App)

// ルーターをアプリに統合
app.use(router)

app.mount('#app')