<template>
  <view class="container">
    <view class="content">
      <!-- 常见问题列表 -->
      <view class="faq-section" v-if="!loading && list.length > 0">
        <text class="section-title">【常见问题】</text>
        <view class="faq-item" v-for="(item, index) in list" :key="index">
          <text class="question">Q: {{ item.question }}</text>
          <text class="answer">A: {{ item.answer }}</text>
        </view>
      </view>

      <!-- 加载中 -->
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && list.length === 0">
        <text>暂无常见问题</text>
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
        <view class="service-right" v-if="qrCodeUrl">
          <image :src="getImageUrl(qrCodeUrl)" mode="aspectFit" class="qr-code"></image>
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
      list: [],
      loading: false,
      qrCodeUrl: ''
    }
  },
  onLoad() {
    this.loadFaqList()
    this.getContactInfo()
  },
  methods: {
    async loadFaqList() {
      this.loading = true
      try {
        const res = await get('/api/faq/list')
        if (res.code === 200) {
          this.list = res.data || []
        }
      } catch (error) {
        console.error('获取常见问题失败:', error)
      } finally {
        this.loading = false
      }
    },
    async getContactInfo() {
      try {
        const res = await get('/api/contact')
        if (res.code === 200 && res.data) {
          this.qrCodeUrl = res.data.qrCodeUrl
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
  overflow-y: auto;
}

.faq-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.faq-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.question {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.answer {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.loading, .empty-state {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
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
