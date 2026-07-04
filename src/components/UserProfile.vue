<template>
  <div class="profile-container">
    
    <div class="profile-header">
      <div class="avatar-area">
        <i class="fa-solid fa-user-gear profile-avatar-icon"></i>
      </div>
      <div class="profile-title-area">
        <h1>PROFILE</h1>
        <p class="subtitle">毎週の役割と目標（Weekly Compass）</p>
      </div>
    </div>

    <div class="compass-grid">
      
      <div class="compass-card card-personal">
        <div class="card-header">
          <i class="fa-solid fa-heart"></i>
          <h3>自分自身 <span class="en-title">Personal</span></h3>
        </div>
        <div class="card-body">
          <p class="objective-label">【今週の目標】</p>
          <ul class="objective-list">
            <li>健康管理：毎朝のストレッチと十分な睡眠を確保する。</li>
            <li>インプット：技術書を今週中に1章分読み進める。</li>
          </ul>
        </div>
      </div>

      <div class="compass-card card-dev">
        <div class="card-header">
          <i class="fa-solid fa-code"></i>
          <h3>開発者 / ブロガー <span class="en-title">Developer & Blogger</span></h3>
        </div>
        <div class="card-body">
          <p class="objective-label">【今週の目標】</p>
          <ul class="objective-list">
            <li>ブログ執筆：Vue 3の解説記事（番外編）を2本公開する。</li>
            <li>リファクタリング：コンポーネントの分割設計を完了させる。</li>
          </ul>
        </div>
      </div>

      <div class="compass-card card-family">
        <div class="card-header">
          <i class="fa-solid fa-house-user"></i>
          <h3>ファミリー <span class="en-title">Family & Private</span></h3>
        </div>
        <div class="card-body">
          <p class="objective-label">【今週の目標】</p>
          <ul class="objective-list">
            <li>家事・役割：週末に部屋の片付けと機材の整理を行う。</li>
            <li>コミュニケーション：家族との時間を大切にし、美味しい料理を作る。</li>
          </ul>
        </div>
      </div>

      <div class="compass-card card-other">
        <div class="card-header">
          <i class="fa-solid fa-compass"></i>
          <h3>その他 / 趣味 <span class="en-title">Other Interests</span></h3>
        </div>
        <div class="card-body">
          <p class="objective-label">【今週の目標】</p>
          <ul class="objective-list">
            <li>オーディオ：CDからFLAC形式へのデジタルアーカイブを進める。</li>
            <li>タスク管理：来週の週間の役割と目標をしっかり見直す。</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// 今回もまだロジックは使わないため空っぽでOKです
</script>

<style scoped>
/* スタイルは次回の記事でドカンと作り込みます！ */
.profile-container {
  padding: 20px;
}
</style>