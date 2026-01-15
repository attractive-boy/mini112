<template>
  <view class="container">
    <view class="content">
      <view class="notice-list">
        <view
          class="notice-wrapper"
          v-for="(notice, index) in noticeList"
          :key="notice.id"
        >
          <view class="notice-time-container">
            <text class="notice-time">{{ formatDate(notice.publishedAt) }}</text>
          </view>
          
          <view class="notice-card" @tap="viewNotice(notice)">
            <view class="card-content">
              <text class="notice-title">{{ notice.title }}</text>
              <text class="notice-preview">{{ notice.summary }}</text>
            </view>
            <view class="card-divider"></view>
            <view class="card-footer">
              <text class="view-more">查看更多</text>
              <text class="arrow">›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!loading && noticeList.length === 0" class="empty-state">
        <text class="empty-text">暂无公告</text>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <!-- 公告详情弹窗 -->
    <view class="notice-modal" v-if="selectedNotice">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ selectedNotice.title }}</text>
          <button class="close-btn" @tap="closeModal">✕</button>
        </view>
        <view class="modal-body">
          <view class="modal-meta">
            <text class="modal-date">{{ formatDate(selectedNotice.publishedAt) }}</text>
            <text class="modal-type">{{ selectedNotice.typeDescription }}</text>
          </view>
          <text class="modal-text">{{ selectedNotice.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { get } from '@/utils/request.js'

export default {
  data() {
    return {
      selectedNotice: null,
      noticeList: [],
      loading: false,
      limit: 20
    }
  },
  onLoad() {
    this.loadNoticeList()
  },
  methods: {
    async loadNoticeList() {
      try {
        this.loading = true
        const response = await get('/api/announcement/latest', {
          limit: this.limit
        })
        
        if (response.success) {
          this.noticeList = response.data || []
        } else {
          uni.showToast({
            title: response.message || '获取公告失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取公告列表失败:', error)
        uni.showToast({
          title: '获取公告失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async viewNotice(notice) {
      try {
        // 获取公告详情
        const response = await get(`/api/announcement/${notice.id}`)
        
        if (response.success) {
          this.selectedNotice = response.data
        } else {
          uni.showToast({
            title: response.message || '获取公告详情失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取公告详情失败:', error)
        uni.showToast({
          title: '获取公告详情失败',
          icon: 'none'
        })
      }
    },
    
    closeModal() {
      this.selectedNotice = null
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style scoped>
.container { 
  min-height: 100vh; 
  background: linear-gradient(to bottom, #FBF9F3, #FBF9F3);
  padding-top: 20rpx;
}

.content { 
  padding: 30rpx; 
}

.notice-list { 
  display: flex; 
  flex-direction: column; 
}

.notice-wrapper {
  margin-bottom: 40rpx;
}

.notice-time-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.notice-time {
  font-size: 30rpx;
  color: #3D3D3D;
}

.notice-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.notice-card:active {
  background-color: #f9f9f9;
}

.card-content {
  padding: 30rpx;
}

.notice-title { 
  font-size: 30rpx; 
  font-weight: bold; 
  color: #333; 
  display: block; 
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.notice-preview { 
  font-size: 28rpx; 
  color: #666; 
  line-height: 1.6; 
  display: -webkit-box; 
  -webkit-box-orient: vertical; 
  -webkit-line-clamp: 3; 
  overflow: hidden;
}

.card-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 0 30rpx;
}

.card-footer { 
  padding: 24rpx 30rpx; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.view-more { 
  font-size: 28rpx; 
  color: #E22600;
  font-weight: 500;
}

.arrow { 
  font-size: 40rpx; 
  color: #ccc; 
  line-height: 1;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #3D3D3D;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #3D3D3D;
}

.notice-modal { 
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  background: rgba(0,0,0,0.5); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 3D3D3D; 
}

.modal-content { 
  background: #fff; 
  border-radius: 20rpx; 
  width: 85%; 
  max-width: 600rpx; 
  max-height: 80vh;
  overflow: hidden; 
}

.modal-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  padding: 30rpx; 
  border-bottom: 2rpx solid rgba(0,0,0,0.05); 
}

.modal-title { 
  font-size: 32rpx; 
  font-weight: bold; 
  color: #333; 
  flex: 1;
  line-height: 1.4;
  margin-right: 20rpx;
}

.close-btn { 
  border: none; 
  background: transparent; 
  font-size: 36rpx; 
  color: #3D3D3D;
  padding: 0;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body { 
  padding: 30rpx; 
  max-height: 60vh;
  overflow-y: auto; 
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);
}

.modal-date { 
  font-size: 24rpx; 
  color: #3D3D3D; 
}

.modal-type {
  font-size: 24rpx;
  color: #007AFF;
  background: rgba(0, 122, 255, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.modal-text { 
  font-size: 28rpx; 
  color: #333; 
  line-height: 1.6; 
  white-space: pre-line; 
}
</style>
