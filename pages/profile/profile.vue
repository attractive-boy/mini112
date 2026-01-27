<template>
  <view class="profile-page">
    <!-- 固定头部区域 -->
    <!-- <view class="safe-area-top"></view> -->
    <view class="header-section">
      <view class="user-info" @click="editProfile">
        <image class="avatar" :src="getAvatarUrl(userInfo.avatar)" />
        <view class="user-details">
          <text class="username">{{ userInfo.nickname || '未设昵称' }}</text>
          <text class="user-id">邀请码: {{ userInfo.inviteCode || '未设置' }} / {{ userInfo.hasPhone ? '已绑定' : '未绑定' }}</text>
        </view>
        <view class="arrow-icon">›</view>
      </view>
    </view>

    <!-- 内容区域 - 移除scroll-view，改为普通view -->
    <view class="content-container">
      <!-- 余额卡片 -->
      <view class="balance-card">
        <view class="balance-item">
          <text class="balance-amount">¥{{ userInfo.balance || '0.00' }}</text>
          <text class="balance-label">余额</text>
        </view>
        <view class="divider"></view>
        <view class="balance-item">
          <text class="balance-amount">¥{{ incomeStats.totalIncome || '0.00' }}</text>
          <text class="balance-label">累计收益</text>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-section">
        <view class="menu-item" v-for="item in menus" :key="item.title" @click="navigate(item)">
          <view class="menu-icon-wrapper">
            <view class="menu-icon" :style="{ backgroundImage: `url(${ item.icon })` }"></view>
          </view>
          <text class="menu-title">{{ item.title }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <button class="logout-btn" @click="logout">退出登录</button>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-area-bottom"></view>
    </view>
  </view>
</template>

<script>

import { get } from '@/utils/request.js'
import { staticUrl } from '../../utils/static.js'
export default {
  components: {},
  data() {
    return {
      userInfo: {
        id: null,
        phone: '',
        email: null,
        nickname: '',
        avatar: null,
        inviteCode: '',
        balance: 0,
        totalIncome: 0,
        status: 1,
        lastLoginAt: '',
        createdAt: '',
        hasPhone: false,
        hasEmail: false
      },
      incomeStats: {
        userId: null,
        totalIncome: 0,
        todayIncome: 0,
        monthIncome: 0,
        statisticsTime: ''
      },
      menus: [
        { title: '钱包管理', icon: staticUrl('/static/容器@1x.png'), url: '/pages/wallet/wallet' },
        { title: '任务记录', icon: staticUrl('/static/容器@1x1.png'), url: '/pages/task-records/task-records' },
        { title: '绑定账号管理', icon: staticUrl('/static/容器@1x2.png'), url: '/pages/account-binding/account-binding' },
        { title: '邀请好友', icon: staticUrl('/static/容器@1x3.png'), url: '/pages/invitation/invitation' }, 
        { title: '直邀列表', icon: staticUrl('/static/容器@1x4.png'), url: '/pages/direct-list/direct-list' },
        { title: '常见问题解答', icon: staticUrl('/static/容器@1x5.png'), url: '/pages/faq/faq' },
        { title: '关于我们', icon: staticUrl('/static/容器@1x6.png'), url: '/pages/about/about' } 
      ]
    }
  },
  onShow() {
    this.loadUserInfo()
    this.loadIncomeStats()
  },
  methods: {
    // 获取用户信息
    async loadUserInfo() {
      try {
        const response = await get('/api/user/info')
        if (response.code === 200) {
          this.userInfo = response.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    
    // 获取收入统计
    async loadIncomeStats() {
      try {
        const response = await get('/api/user/balance/income-stats')
        if (response.code === 200) {
          this.incomeStats = response.data
        }
      } catch (error) {
        console.error('获取收入统计失败:', error)
      }
    },
    
    navigate(item) {
      if (item.tab) {
        uni.switchTab({ url: item.url })
      } else {
        uni.navigateTo({ url: item.url })
      }
    },
    editProfile() {
      uni.navigateTo({ url: '/pages/edit-profile/edit-profile' })
    },
    showSettings() {
      uni.showActionSheet({
        itemList: ['设置', '帮助'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            uni.navigateTo({ url: '/pages/settings/settings' })
          } else if (tapIndex === 1) {
            uni.navigateTo({ url: '/pages/help/help' })
          }
        }
      })
    },
    
    getAvatarUrl(avatar) {
      if (!avatar) {
        return '/static/boy.png'
      }
      
      // 如果已经是完整URL，直接返回
      if (avatar.startsWith('http')) {
        return avatar
      }
      
      // 构建完整的头像URL
      return `http://localhost:8080/api/file/proxy/${avatar}`
    },
    
    showMore() {
      uni.navigateTo({ url: '/pages/profile-more/profile-more' })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确认退出当前账号吗？',
        success: ({ confirm }) => {
          if (confirm) {
            // 清除本地存储的用户信息和token
            uni.removeStorageSync('accessToken')
            uni.removeStorageSync('refreshToken')
            uni.removeStorageSync('tokenType')
            uni.removeStorageSync('expiresIn')
            uni.removeStorageSync('userInfo')
            
            // 跳转到登录页面
            uni.reLaunch({ url: '/pages/login/login' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
/* 页面容器 - 移除高度限制，让内容自然堆叠 */
.profile-page {
  min-height: 100vh;
  background: #fff;

}



/* 固定头部区域 */
.header-section {
  padding-top: 100rpx;
  background: #FFDD00;
  border-radius: 0  0 80rpx 80rpx;
  padding-bottom: 180rpx;
  padding-left: 20rpx;
  padding-right: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 30rpx;
}

.avatar {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  margin-right: 30rpx;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.user-id {
  font-size: 26rpx;
  color: #666;
}

.arrow-icon {
  font-size: 48rpx;
  color: #666;
}

/* 内容容器 - 让系统自动处理滚动 */
.content-container {
  margin-left: 20rpx;
  margin-right: 20rpx;
  padding: 0 20rpx;
  transform: translateY(-180rpx);
}

/* 余额卡片 */
.balance-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 20rpx 0;
  border: 1rpx solid #f0f0f0;
  box-sizing: border-box;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.balance-amount {
  font-size: 44rpx;
  font-weight: bold;
  color: #FF6B35;
}

.balance-label {
  font-size: 26rpx;
  color: #999;
}

.divider {
  width: 8rpx;
  height: 80rpx;
  background: #e5e5e5;
}

/* 菜单区域 */
.menu-section {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  padding: 0 30rpx;
  border: 1rpx solid #f0f0f0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
  /* border-radius: 50%; */
  background-size: cover;
  background-position: center;

}

.menu-title {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}

/* 退出登录区域 */
.logout-section {
  padding: 20rpx 0;
  display: flex;
  justify-content: center;
}

.logout-btn {
  width: calc(100% - 140rpx);
  height: 100rpx;
  background-color: #FFDD00;
  color: #3D3D3D;
  border: none;
  border-radius: 30rpx;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 底部安全区域 */
.safe-area-bottom {
  height: 60rpx;
}
</style>

