<template>
  <view class="container">
    <view class="content">
      <view class="header">
        <text class="title">欢迎登录</text>
        <text class="subtitle">任务多，悬赏高</text>
      </view>
      <view class="tab-container">
        <view class="tab-item active">
          <text class="tab-text">登录</text>
          <view class="tab-underline"></view>
        </view>
        <view class="tab-item" @click="goToRegister">
          <text class="tab-text">注册</text>
          <view class="tab-underline"></view>
        </view>
      </view>
      <view class="form">
        <view class="form-group">
          <text class="label">手机号 / 邮箱</text>
          <view class="input-wrapper">
            <text class="input-icon"></text>
            <input class="input" placeholder="请输入手机号或邮箱" v-model="phone" />
          </view>
        </view>
        <view class="form-group" style="margin-bottom: 0rpx;">
          <text class="label">密码</text>
          <view class="input-wrapper">
            <text class="input-icon lock"></text>
            <input class="input" type="password" placeholder="请输入密码" v-model="password" />
            <text class="forgot-link" @tap="goToForgot">忘记密码？</text>
          </view>
        </view>
        <view class="agreement-wrapper">
          <checkbox-group class="agreement-checkbox" @change="onAgreeChange">
            <checkbox :checked="agree" color="#FFCE00" />
          </checkbox-group>
          <view class="agreement-text-only">
            <text class="agreement-text">登录即表示同意</text>
            <text class="agreement-link" @click="goToUserAgreement">《用户协议》</text>
            <text class="agreement-text">和</text>
            <text class="agreement-link" @click="goToPrivacyPolicy">《隐私政策》</text>
          </view>
        </view>
        <button class="primary-btn btn-primary" @click="login">立即登录</button>
      </view>
    </view>
  </view>
</template>

<script>
import { post } from '@/utils/request.js'

export default {
  data() {
    return {
      phone: '',
      password: '',
      agree: true
    }
  },
  async onLoad() {
    // 检查登录状态
    await this.checkLoginStatus()
  },
  computed: {
    canSubmit() {
      return this.phone.trim() && this.password.trim()
    }
  },
  methods: {
    // 检查登录状态
    async checkLoginStatus() {
      try {
        const accessToken = uni.getStorageSync('accessToken')
        const userInfo = uni.getStorageSync('userInfo')
        
        if (accessToken && userInfo) {
          // 已登录，跳转到首页
          uni.showToast({ title: '已登录', icon: 'none' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/home/home' })
          }, 1000)
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      }
    },
    async login() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      try {
        const response = await post('/api/user/login', {
          account: this.phone.trim(),
          password: this.password.trim()
        })
        
        if (response && response.code === 200) {
          // 缓存token信息
          uni.setStorageSync('accessToken', response.data.accessToken)
          uni.setStorageSync('refreshToken', response.data.refreshToken)
          uni.setStorageSync('tokenType', response.data.tokenType)
          uni.setStorageSync('expiresIn', response.data.expiresIn)
          
          // 缓存用户信息
          uni.setStorageSync('userInfo', response.data.userInfo)
          
          uni.showToast({ title: '登录成功', icon: 'success' })
          
          setTimeout(() => {
            uni.switchTab({ url: '/pages/home/home' })
          }, 1500)
        } else {
          uni.showToast({ title: response.message || '登录失败', icon: 'none' })
        }
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    goToRegister() {
      uni.navigateTo({ url: '/pages/register/register' })
    },
    
    goToForgot() {
      uni.navigateTo({ url: '/pages/forgot/forgot' })
    },
    
    goToUserAgreement() {
      uni.navigateTo({ url: '/pages/user-agreement/user-agreement' })
    },
    
    goToPrivacyPolicy() {
      uni.navigateTo({ url: '/pages/privacy-policy/privacy-policy' })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #fff8d8;
  background-image: linear-gradient(180deg, #FFE979, #FFE979);
}

.content {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30rpx;
  padding: 40rpx 60rpx 80rpx 60rpx;
  box-shadow: 0 -12rpx 30rpx rgba(0, 0, 0, 0.05);
  transform: translateY(25%);
}

.header {
  text-align: left;
  margin-bottom: 60rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #3D3D3D;
  /* margin-bottom: 5rpx; */
  display: block;
}

.subtitle {
  font-size: 35rpx;
  color: rgba(61, 61, 61, 0.8);
}

.tab-container {
  display: flex;
  justify-content: center;
  gap: 250rpx;
  margin-bottom: 60rpx;
}

.tab-item {
  position: relative;
  padding-bottom: 12rpx;
}

.tab-text {
  font-size: 32rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #3D3D3D;
  font-weight: bold;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 130rpx;
  height: 15rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 206, 0, 0.8);
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(10rpx);
}

.tab-item.active .tab-underline {
  opacity: 1;
}

.form-group {
  margin-bottom: 40rpx;
}

.label {
  font-size: 28rpx;
  color: #3D3D3D;
  margin-bottom: 16rpx;
  display: block;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-radius: 50rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
  background: #fff;
  box-shadow: 0 8rpx 18rpx rgba(255, 206, 0, 0.2);
}

.input-icon {
  /* font-size: 28rpx; */
  margin-right: 16rpx;
  flex-shrink: 0;
  background-image: url("/static/phone.png");
  width: 30rpx;
  height: 30rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.input-icon.lock {
  background-image: url("/static/lock.png");
}

.input {
  flex: 1;
  font-size: 32rpx;
  border: none;
  background: transparent;
  color: #3D3D3D;
  min-width: 0;
}

.forgot-link {
  position: absolute;
  right: 24rpx;
  font-size: 24rpx;
  color: rgba(61, 61, 61, 0.5);
  top: -50%;
  transform: translateY(-50%);
  z-index: 2;
  flex-shrink: 0;
}
.agreement-wrapper {
  display: flex;
  height: 80rpx;
  align-items: center;
  margin-bottom: 40rpx;
}
.agreement-checkbox {
  margin-right: 10rpx;
}
/* 深度作用选择器，确保 uni-checkbox 内部元素样式生效 */
.agreement-checkbox >>> .uni-checkbox-input {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
}

.agreement-checkbox >>> svg {
  width: 25rpx;
  height: 25rpx;
}

.agreement-text-only {
  text-align: left;
  margin: 40rpx 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.agreement-text {
  font-size: 24rpx;
  color: rgba(61, 61, 61, 0.5);
}

.agreement-link {
  font-size: 24rpx;
  color: rgba(61, 61, 61, 0.8);
  text-decoration: underline;
}

.primary-btn {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  border-radius: 44rpx;
  background-color: #FFCE00;
  color: #3D3D3D;
  border: none;
  width: 100%;
  transition: all 0.3s ease;
}

.primary-btn:active {
  transform: scale(0.98);
}

.primary-btn:disabled {
  background: #ccc;
  color: #999;
}
</style>
