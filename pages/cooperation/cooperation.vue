<template>
  <view class="container">
    <view class="content">
      <image class="dev-icon" src="/static/3a582535-e694-4171-a2e7-d897d08e1536@1x.png"></image>
      <view class="dev-subtitle">敬请期待</view>
    </view>
  </view>
</template>

<script>

export default {
  components: {},
  data() {
    return {
    }
  },
}
</script>

<style scoped>
.container {
  height: 100vh;
  background: #FFFCE7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dev-icon {
  margin-bottom: 40rpx;
}

.gear {
  font-size: 120rpx;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.dev-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.content {
  width: 100%;
}

.dev-subtitle {
  text-align: center;
  font-family: PingFang SC;
  font-size: 36px;
  font-weight: normal;
  line-height: normal;
  letter-spacing: 0em;

  font-variation-settings: "opsz" auto;
  color: #3D3D3D;
}

.dev-icon {
  width: 100%;
  height: 325px;
}

.contact-btn {
  width: 200rpx;
  height: 60rpx;
  background-color: #FFD700;
  color: #333;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-btn:hover {
  background-color: #FFC107;
}
</style>
