<script>
export default {
  onLaunch: function () {
    console.log("App Launch");
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>

<style>
text {
  font-family: PingFang SC;
}

:root {
  --brand-primary: #FFD700;
  --brand-accent: #FF6B35;
  --brand-bg: #fffbe6;
  --text-main: #333;
  --text-sub: #666;
  --text-muted: #999;
  --bg-page: #f5f5f5;
  --radius-lg: 20rpx;
  --radius-md: 12rpx;
  --nav-bar-height: 44px;
  --nav-back-icon-size: 16px;
  --nav-back-icon-thickness: 2px;
  --nav-back-icon-color: #333;
}

.btn-primary {
  background-color: var(--brand-primary) !important;
  color: var(--text-main) !important;
  border: none !important;
  border-radius: var(--radius-md);
  font-weight: bold;
  line-height: 1.4;
  text-align: center;
}

.btn-primary::after {
  border: none;
}

.btn-secondary {
  background-color: var(--brand-bg) !important;
  color: var(--text-sub) !important;
  border: none !important;
  border-radius: var(--radius-md);
  line-height: 1.4;
  text-align: center;
}

.btn-secondary::after {
  border: none;
}

.badge-new {
  background-color: var(--brand-accent) !important;
  color: #fff !important;
  border-radius: 12rpx;
  padding: 6rpx 12rpx;
  font-size: 20rpx;
  line-height: 1;
}

/* 微信小程序高度兼容性修复 */
page {
  height: 100vh;
}

/* 全局容器高度修复 */
.container {
  min-height: 100vh;;
}

/* 针对微信小程序的高度修复 */
/* #ifdef MP-WEIXIN */
.container {
  min-height: calc(100vh - env(safe-area-inset-bottom));
}
/* #endif */
</style>
