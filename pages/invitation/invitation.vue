<template>
  <view class="container">
    <view class="content">
      <view class="invitation-banner">
        <text class="banner-title">邀请好友，轻松赚佣金！</text>
        <text class="banner-subtitle">好友完成任务后可以获得奖励</text>
        <view class="character-section">
          <image src="/static/ad6f2e1d-7383-4f85-9c57-81e6a6e2bdff@1x.png" />
        </view>
        <view class="invite-code-section">
          <view style="display: flex; align-items: center; margin-bottom: 20rpx; justify-content: space-between;">
            <text class="invite-label">我的专属邀请码</text>
            <view class="copy-btn" @click="copyCode">复制</view>
          </view>
          <view class="invite-code-container">
            <text class="invite-code">{{ userInfo.inviteCode || 'X8F3B92A' }}</text>
          </view>
        </view>
      </view>
      <view class="ranking-section">
        <text class="ranking-title">邀请排行榜</text>
        <view class="ranking-header">
          <text class="header-rank">排名</text>
          <text class="header-people">成功邀请人数</text>
          <text class="header-reward">邀请奖励</text>
        </view>
        <view class="ranking-list" v-if="!loading && rankingList.length > 0">
          <view class="ranking-item" v-for="(item, index) in rankingList" :key="item.userId">
            <view class="rank-info">
              <text class="rank-icon">{{ getRankIcon(item.rank - 1) }}</text>
              <text class="rank-name">{{ item.nickname }}</text>
            </view>
            <text class="rank-people">{{ item.inviteCount }}人</text>
            <text class="rank-reward">{{ item.totalReward }}元</text>
          </view>
        </view>
        <view class="loading" v-if="loading">
          <text>加载中...</text>
        </view>
        <view class="empty" v-if="!loading && rankingList.length === 0">
          <text>暂无排行榜数据</text>
        </view>
      </view>
      <view class="notice-section">
        <text class="notice-title">【邀请须知】</text>
        <text class="notice-item">1.请勿通过非正规方式进行虚假邀请，一经核实将取消奖励资格</text>
        <text class="notice-item">2.邀请行为需符合平台规则，系统将自动记录邀请数据</text>
      </view>
      <view class="tools-section">
        <view class="tool-item" @click="showPosterTool">
          <view class="tool-icon">📋</view>
          <view class="tool-info">
            <text class="tool-title">推广攻略</text>
            <text class="tool-desc">收益玩法汇总</text>
          </view>
          <text class="tool-arrow">></text>
        </view>
        <view class="tool-item" @click="showCaseTool">
          <view class="tool-icon">📄</view>
          <view class="tool-info">
            <text class="tool-title">推广案例</text>
            <text class="tool-desc">精准找到用户</text>
          </view>
          <text class="tool-arrow">></text>
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
      isTabPage: true,
      loading: false,
      userInfo: {},
      rankingList: []
    }
  },
  onLoad() {
    this.getUserInfo()
    this.getRankingList()
  },
  methods: {
    async getUserInfo() {
      try {
        const response = await get('/api/user/info')
        if (response.success) {
          this.userInfo = response.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    async getRankingList() {
      this.loading = true
      try {
        const response = await get('/api/invitation/ranking', {
          limit: 10,
          type: 'people'
        })
        if (response.success) {
          this.rankingList = response.data.list || []
        }
      } catch (error) {
        console.error('获取排行榜失败:', error)
        uni.showToast({
          title: '获取排行榜失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    goBack() {
      uni.navigateBack()
    },
    getRankIcon(index) {
      if (index === 0) return '🥇'
      if (index === 1) return '🥈'
      if (index === 2) return '🥉'
      return `${index + 1}.`
    },
    copyCode() {
      const inviteCode = this.userInfo.inviteCode || 'X8F3B92A'
      uni.setClipboardData({
        data: inviteCode,
        success: () => {
          uni.showToast({
            title: '邀请码已复制',
            icon: 'success'
          })
        }
      })
    },
    showPosterTool() {
      uni.navigateTo({
        url: '/pages/promotion/promotion?type=1'
      })
    },
    showCaseTool() {
      uni.navigateTo({
        url: '/pages/promotion/promotion?type=2'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.content {
  padding: 20rpx;
}

.invitation-banner {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 20rpx;
  text-align: center;
  margin-bottom: 30rpx;
  padding: 12px;
}

.banner-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.banner-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
}

.character-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40rpx;
  margin-bottom: 40rpx;
  height: 290px;
}

.invite-code-section {
  background: #FFE8A7;
  padding: 30px;
  border-radius: 10px;
}

.invite-label {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.invite-code-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30rpx;
  height: 52px;
}

.invite-code {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  letter-spacing: 4rpx;
}

.copy-btn {
  width: 120rpx;
  height: 50rpx;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25rpx;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.ranking-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.ranking-header {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
  margin-bottom: 20rpx;
  background: #FFE077;
}

.header-rank {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
}

.header-people {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
  text-align: center;
}

.header-reward {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
  text-align: right;
}

.ranking-list {
  max-height: 600rpx;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.rank-icon {
  font-size: 24rpx;
}

.rank-name {
  font-size: 26rpx;
  color: #333;
}

.rank-people {
  font-size: 26rpx;
  color: #333;
  text-align: center;
}

.rank-reward {
  font-size: 26rpx;
  color: #FF6B35;
  font-weight: bold;
  text-align: right;
}

.loading, .empty {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.notice-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.notice-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.notice-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 15rpx;
}

.tools-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.tool-item {
  flex: 1;
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.tool-icon {
  font-size: 48rpx;
}

.tool-info {
  flex: 1;
}

.tool-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.tool-desc {
  font-size: 24rpx;
  color: #666;
}

.tool-arrow {
  font-size: 24rpx;
  color: #ccc;
}
</style>