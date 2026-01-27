<template>
  <view class="container">
    <view class="content">
      <!-- 统计信息 -->
      <view class="stats-card">
        <view class="stats-header">
          <text class="stats-title">已成功邀请好友总数</text>
          <text class="stats-amount">已获得佣金</text>
        </view>
        <view class="stats-numbers">
          <text class="people-count">{{ totalInvites }} 人</text>
          <text class="amount-earned">¥{{ totalCommission.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 好友列表 -->
      <view class="friend-list" v-if="!loading">
        <view class="friend-item" v-for="(friend, index) in invitedUsers" :key="index">
          <view class="friend-info">
            <text class="friend-name">{{ friend.nickname || '用户' + friend.userId.slice(-4) }}</text>
            <view class="friend-details">
              <text class="friend-account">用户ID：{{ friend.userId }}</text>
              <text class="friend-time">邀请时间：{{ formatDate(friend.createdAt) }}</text>
            </view>
          </view>
          <view class="friend-reward">
            <text class="reward-amount">¥{{ friend.commission.toFixed(2) }}</text>
            <text class="reward-status">已获得佣金</text>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-if="invitedUsers.length === 0">
          <text class="empty-text">暂无邀请记录</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { get } from '@/utils/request.js'

export default {
  data() {
    return {
      loading: true,
      totalInvites: 0,
      totalCommission: 0.0,
      invitedUsers: []
    }
  },
  onLoad() {
    this.loadInvitationStats()
  },
  methods: {
    async loadInvitationStats() {
      try {
        this.loading = true
        const response = await get('/api/invitation/stats')

        if (response && response.code === 200) {
          const data = response.data
          this.totalInvites = data.totalInvites || 0
          this.totalCommission = data.totalCommission || 0.0
          this.invitedUsers = data.invitedUsers || []
        } else {
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载邀请统计失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0')
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 40rpx;
}

.stats-card {
  background: #FFD13A;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 215, 0, 0.3);
  height: 200rpx;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.stats-title,
.stats-amount {
  font-size: 38rpx;
  color: #333;
  font-weight: 500;
}

.stats-numbers {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.people-count {
  font-size: 58rpx;
  font-weight: bold;
  color: #FF6B35;
}

.amount-earned {
  font-size: 58rpx;
  font-weight: bold;
  color: #FF6B35;
}

.friend-list {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
}

.friend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.friend-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.friend-account,
.friend-time {
  font-size: 26rpx;
  color: #666;
}

.friend-reward {
  text-align: right;
}

.reward-amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B35;
  display: block;
  margin-bottom: 10rpx;
}

.reward-status {
  font-size: 24rpx;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading-state {
  text-align: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>