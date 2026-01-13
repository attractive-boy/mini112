<template>
  <view class="container">
    <view class="content">
      <view class="contact-section">
        <text class="section-title">联系方式</text>
        <view class="contact-info">
          <text class="contact-item">工作时间：{{ contactInfo.workingHours || '工作日周一~至周五9:00~12:00，14:00~18:00' }}</text>
          <text class="contact-item">联系邮箱：{{ contactInfo.email || 'youzhihubang@163.com' }}</text>
          <text class="contact-item">请将你的用户ID及相关的问题一起发送到邮箱，我们会尽快回复你。</text>
        </view>
        <text class="service-note">{{ contactInfo.platformName || '互助互帮平台' }}</text>
      </view>
    </view>
    
    <!-- 底部客服组件 -->
    <view class="bottom-service">
      <view class="service-content">
        <image src="/static/aaaaa.svg" class="service-icon" mode="aspectFit"></image>
        <view class="service-left">
          <text class="service-title">平台客服</text>
          <text class="service-desc">添加客服微信可获取任务协助与问题处理</text>
        </view>
        <view class="service-right" v-if="contactInfo.qrCodeUrl">
          <image :src="getImageUrl(contactInfo.qrCodeUrl)" mode="aspectFit" class="qr-code"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { get, BASE_URL } from '@/utils/request.js'

export default {
  data() {
    return {
      contactInfo: {
        workingHours: '',
        email: '',
        platformName: '',
        qrCodeUrl: ''
      }
    }
  },
  onLoad() {
    this.getContactInfo()
  },
  methods: {
    async getContactInfo() {
      try {
        const res = await get('/api/contact')
        if (res.code === 200 && res.data) {
          this.contactInfo = res.data
        }
      } catch (e) {
        console.error('获取联系方式失败', e)
      }
    },
    getImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) return url
      return `${BASE_URL}/api/file/proxy/${url}`
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #FFDD00, #ffffff);
  display: flex;
  flex-direction: column;
}

.content {
  padding: 30rpx;
  flex: 1;
}

.contact-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFD700;
  display: block;
  margin-bottom: 30rpx;
}

.contact-info {
  margin-bottom: 30rpx;
}

.contact-item {
  font-size: 26rpx;
  color: #333;
  line-height: 1.8;
  display: block;
  margin-bottom: 15rpx;
}

.service-note {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFD700;
  text-align: center;
  display: block;
}

.bottom-service {
  padding: 30rpx;
  padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
}

.service-content {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  position: relative;
  overflow: visible;
}

.service-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.service-left {
  flex: 1;
  padding-right: 20rpx;
}

.service-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.service-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

.service-right {
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.qr-code {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  background: #fff;
}
</style>