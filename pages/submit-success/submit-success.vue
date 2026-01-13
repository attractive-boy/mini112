<template>
  <view class="container">
    <view class="bg"></view>
    <view class="content">
      <image class="success-icon" src="/static/e8ed3a5a-79fb-45a2-a27c-0d473dd37818@1x.png"></image>
      <view style="font-size: 32px; color: #FFBB00;">提交成功!</view>
      <button class="back-hall-btn" @click="backToHall">返回任务大厅</button>
    </view>
  </view>
</template>
<script>
export default {
  methods: {
    backToHall() {
      uni.switchTab({
        url: '/pages/task-hall/task-hall'
      })
    }
  }
}
</script>

<style scoped>
.container {
  height: calc(100vh - var(--nav-bar-height));
  background: var(--bg-page);
}

.bg {
  height: 25%;
  background: #FFE85C;
}

.content {
  height: 80%;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top-left-radius: 45px;
  border-top-right-radius: 45px;
  box-sizing: border-box;
  background: white;
  transform: translateY(-5%);
}

.success-icon {
  height: 184px;
  margin-bottom: 40rpx;
}

.back-hall-btn {
  width: 100%;
  background-color: var(--brand-primary) !important;
  color: var(--text-main) !important;
  border: none !important;
  border-radius: var(--radius-lg);
  font-size: 32rpx;
  font-weight: bold;
  transform: translateY(143px);
  line-height: 1.4;
  text-align: center;
}

.back-hall-btn::after {
  border: none;
}

.continue-btn {
  width: 300rpx;
  height: 80rpx;
  background-color: #FFD700;
  color: #333;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn {
  width: 200rpx;
  height: 60rpx;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
