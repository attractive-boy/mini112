<template>
  <view class="container">
    <view class="nav-bar">
      <view class="status-bar"></view>
      <view class="nav-content">
        <view class="nav-left" @tap="goBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">提交任务</text>
      </view>
    </view>
    <!-- <view class="bg"></view> -->
    <view class="content">
      <view class="success-icon" :style="{ backgroundImage: `url(${ $staticUrl('/static/e8ed3a5a-79fb-45a2-a27c-0d473dd37818@1x.png') })` }"></view>
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
  background: linear-gradient(180deg, #FFDD00 -2%, #FFFFFF 50%);
}

/* 导航栏样式 */
.nav-bar {
  z-index: 100;
  background: #FFDD00;
}

.status-bar {
  height: var(--status-bar-height, 44px);
}

.nav-content {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 10rpx;
  position: relative;
}

.nav-left {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-left: auto;
}




.content {
  height: 80%;
  z-index: 100;
  margin-top: 300rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top-left-radius: 85px;
  border-top-right-radius: 85px;
  box-sizing: border-box;
  background: white;
  /* border-radius: 55px; */
  transform: translateY(-5%);
}

.success-icon {
  height: 184px;
  width: 184px;
  margin-bottom: 40rpx;
  background-size: cover;
  background-position: center;
}

.back-hall-btn {
  width: calc(100% - 250rpx);
  background-color: var(--brand-primary) !important;
  color: #3D3D3D !important;
  border: none !important;
  border-radius: var(--radius-lg);
  font-size: 38rpx;
  font-weight: bold;
  transform: translateY(143px);
  line-height: 1.4;
  text-align: center;
  padding: 20rpx 0;
  margin: 0 40rpx;
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
