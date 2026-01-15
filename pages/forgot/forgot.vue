<template>
  <view class="container">
    <view class="content">
      <view class="header">
        <text class="title">忘记密码</text>
        <view class="line"></view>
        <!-- <text class="subtitle">验证码验证后即可修改</text> -->
      </view>

      <view class="form">
        <view class="form-group">
          <text class="label">手机号 / 邮箱</text>
          <view class="input-wrapper">
            <text class="input-icon"></text>
            <input class="input" placeholder="请输入手机号或邮箱" v-model="contact" />
          </view>
        </view>

        <view class="form-group">
          <text class="label">验证码</text>
          <view class="input-wrapper">
            <text class="input-icon lock"></text>
            <input class="input" placeholder="请输入验证码" v-model="code" />
            <button class="verify-btn btn-secondary" @tap="sendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
            </button>
          </view>
        </view>

        <view class="form-group">
          <text class="label">新密码</text>
          <view class="input-wrapper">
            <text class="input-icon lock"></text>
            <input class="input" type="password" placeholder="请输入新密码" v-model="newPassword" />
          </view>
        </view>

        <view class="form-group">
          <text class="label">确认密码</text>
          <view class="input-wrapper">
            <text class="input-icon lock"></text>
            <input class="input" type="password" placeholder="再次输入新密码" v-model="confirmPassword" />
          </view>
        </view>

        <button class="primary-btn btn-primary" style="margin-top: 80rpx;" :disabled="!canSubmit" @tap="resetPassword">确认修改</button>
      </view>
    </view>
  </view>
</template>

<script>
import { post } from '@/utils/request.js'

export default {
  data() {
    return {
      contact: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
      countdown: 0,
      timer: null
    }
  },
  async onLoad() {
    // 检查登录状态
    await this.checkLoginStatus()
  },
  computed: {
    canSubmit() {
      return this.contact.trim() && this.code.trim() && this.newPassword.trim() && this.newPassword === this.confirmPassword
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
          uni.showToast({ title: '您已登录，正在跳转...', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/home/home' })
          }, 1000)
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      }
    },
    async sendCode() {
      if (!this.contact.trim()) {
        uni.showToast({ title: '请输入手机号或邮箱', icon: 'none' })
        return
      }
      
      if (this.countdown > 0) {
        return
      }
      
      try {
        const response = await post('/api/user/send-verification-code', {
          account: this.contact.trim(),
          codeType: 'RESET_PASSWORD'
        })
        
        if (response && response.code === 200) {
          this.countdown = response.data.nextSendTime || 60
          uni.showToast({ title: response.data.message || '验证码发送成功', icon: 'success' })
          
          this.timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(this.timer)
              this.timer = null
            }
          }, 1000)
        } else {
          uni.showToast({ title: response.message || '发送验证码失败', icon: 'none' })
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },
    async resetPassword() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      if (this.newPassword.length < 6 || this.newPassword.length > 20) {
        uni.showToast({ title: '密码长度应为6-20位', icon: 'none' })
        return
      }
      
      try {
        const response = await post('/api/user/reset-password', {
          account: this.contact.trim(),
          newPassword: this.newPassword.trim(),
          confirmNewPassword: this.confirmPassword.trim(),
          verificationCode: this.code.trim()
        })
        
        if (response && response.code === 200) {
          uni.showToast({ title: response.data.message || '密码重置成功', icon: 'success' })
          
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/login/login' })
          }, 1500)
        } else {
          uni.showToast({ title: response.message || '密码重置失败', icon: 'none' })
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        uni.showToast({ title: error.message, icon: 'none' })
      }
    }
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.container {
  /* min-height: 50vh; */
  background-color: #fff8d8;
  padding-top: 50rpx;
  background-image: linear-gradient(180deg, #FFE979, #FFE979);
}

.content {
  background-color: #fff;
  border-radius: 50rpx;
  padding: 50rpx 60rpx 80rpx 60rpx;
  box-shadow: 0 -12rpx 30rpx rgba(0, 0, 0, 0.05);
  /* height: calc(100vh - 50%); */
  transform: translateY(10%);
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 12rpx;
  display: block;
  z-index: 100;
  position: relative;
}
.line {
  width: 200rpx;
  height: 20rpx;
  background-color: #FFD700;
  margin: 20rpx auto;
  clip-path: polygon(5% 0, 95% 0, 100% 100%, 0 100%);
  transform: translateY(-180%);
}

.subtitle {
  font-size: 28rpx;
  color: var(--text-sub);
}

.form-group {
  margin-bottom: 28rpx;
}

.label {
  font-size: 30rpx;
  color: var(--text-main);
  margin-bottom: 12rpx;
  display: block;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-radius: 50rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
  background-color: #fff;
  box-shadow: 0 8rpx 18rpx rgba(255, 215, 0, 0.2);
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
  font-size: 26rpx;
  border: none;
  background-color: transparent;
  color: var(--text-main);
}

.verify-btn {
  border-radius: 22px;
  background-color: #FFDD00;
  color: #3D3D3D;
  font-size: 24rpx;
  height: 60rpx;
  padding: 0 20rpx;
  line-height: 60rpx;
  border: none;
  white-space: nowrap;
}

.verify-btn:disabled {
  background-color: #ccc !important;
  color: #999 !important;
}

.primary-btn {
  width: 100%;
  border-radius: 22px;
  height: 44px;
  line-height: 44px;
  font-size: 32rpx;
  font-weight: bold;
  background-color: #FFD700;
  color: #333;
  border: none;
  margin-top: 32rpx;
}

.primary-btn:disabled {
  background-color: #ccc !important;
  color: #999 !important;
}
</style>
