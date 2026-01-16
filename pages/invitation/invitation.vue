<template>
  <view class="container">
    <view class="nav-bar">
      <view class="status-bar"></view>
      <view class="nav-content">
        <view class="nav-left" @tap="goBack">
          <text class="back-icon">‹</text>
        </view>
        <!-- <text class="nav-title">新人专享</text> -->
      </view>
    </view>
    <view class="content">
      <view class="invitation-banner">
        <text class="banner-title">邀请好友，轻松赚佣金！</text>
        <text class="banner-subtitle">好友完成任务后可以获得奖励</text>
        <view class="character-section">
          <!-- <image src="/static/invitenew.png" /> -->
        </view>
        <view class="invite-code-section">
          <view style="display: flex; align-items: center; margin-bottom: 20rpx; justify-content: space-between;">
            <text class="invite-label">我的专属邀请码</text>
            <view class="copy-btn" @click="copyCode"></view>
          </view>
          <view class="invite-code-container">
            <text class="invite-code">{{ userInfo.inviteCode || 'X8F3B92A' }}</text>
          </view>
        </view>
        <!-- 两个按钮 -->
         <view class="btn-container">
          <view class="btn-item" @click="showInviteCode">生成推广海报</view>
          <view class="btn-item share"  @click="showInviteRules">一键分享</view>
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
        <view class="tool-item" @click="showPosterTool" style="background-color: #FFE0BF;">
          
          <view class="tool-info" >
            <text class="tool-title">推广攻略</text>
            <text class="tool-desc">收益玩法汇总</text>
          </view>
          <view class="tool-icon" :style="{ backgroundImage: `url(${ $staticUrl('/static/4b13e081-7acc-4c49-9641-e26cf449475b@1x.png') })` }"></view>
          <!-- <text class="tool-arrow">></text> -->
        </view>
        <view class="tool-item" @click="showCaseTool" style="background-color: #CEE6FF;">
          
          <view class="tool-info" >
            <text class="tool-title">推广案例</text>
            <text class="tool-desc" style="background: linear-gradient(75deg, #51CEFF 0%, #038AFD 99%);">精准找到用户</text>
          </view>
          <view class="tool-icon" :style="{ backgroundImage: `url(${ $staticUrl('/static/ae6562c7-8f74-4c1f-b9e7-48e642acd54b@1x.png') })` }"></view>
          <!-- <text class="tool-arrow">></text> -->
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
  background: #fff;
  padding-bottom: 120rpx;
}

.content {
  /* padding: 20rpx; */
  
}

.invitation-banner {
  background: url('/static/invitenew.png') no-repeat center center;
  /* background-size: 100% 100%; */
  background-size: 100% auto;
  /* border-radius: 20rpx; */
  text-align: left;
  margin-bottom: 30rpx;
  padding: 12px;
  /* height: 300rpx; */
  display: block;
}

.banner-title {
  font-size: 50rpx;
  font-weight: bold;
  margin-top: 50rpx;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
  margin-left: 10rpx;
}

.banner-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
  margin-left: 10rpx;
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
  padding: 20px;
  border-radius: 10px;
  font-size: 50rpx;
  margin: 0 40rpx;
  transform: translateY(-60%);
}

.invite-label {
  font-size: 35rpx;
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
  margin-left: 10rpx;
  margin-right: 10rpx;
  
}

.invite-code {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  letter-spacing: 4rpx;
}
.btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30rpx;
  transform: translateY(-120%);
  height: 80rpx;
}

.btn-item {
  width: 200rpx;
  height: 80rpx;
  background-color: #FFAC46;
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rpx 40rpx;
}
.share {
  background-color: #FFDF86;
  color: #333;
}



.copy-btn {
  width: 30rpx;
  height: 30rpx;
  /* background-color: #4CAF50; */
  color: white;
  border: none;
  /* border-radius: 25rpx; */
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/static/copyimg.png');
  background-size: 100% 100%;
}

.ranking-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  transform: translateY(-100rpx);
}

.ranking-title {
  font-size: 40rpx;
  margin-left: 30rpx;
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
  border-radius: 20rpx 20rpx 0 0;
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

.loading,
.empty {
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
  padding: 0 60rpx;
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
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  background-position: center;
  background-repeat: no-repeat;
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
  text-align: center;
}

.tool-desc {
  font-size: 20rpx;
  color: #fff;
  background: linear-gradient(75deg, #FE976D 0%, #F7554C 100%);
  padding: 8rpx 5rpx;
  border-radius: 10rpx;
}

.tool-arrow {
  font-size: 24rpx;
  color: #ccc;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background: transparent;
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
  font-size: 30rpx;
  color: #333;
  /* font-weight: bold; */
  /* 放大 */
  transform: scale(2);
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
</style>