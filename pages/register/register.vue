<template>
  <view class="container">
    <view class="content">
      <view class="header">
        <text class="title">欢迎注册</text>
        <text class="subtitle">任务多，悬赏高</text>
      </view>
      <view class="tab-container">
        <view class="tab-item" @click="goToLogin">
          <text class="tab-text">登录</text>
          <view class="tab-underline"></view>
        </view>
        <view class="tab-item active">
          <text class="tab-text">注册</text>
          <view class="tab-underline"></view>
        </view>
      </view>
      <view class="form">
        <view class="form-group">
          <text class="label">账户</text>
          <view class="input-wrapper">
            <text class="input-icon"></text>
            <input class="input" placeholder="请输入手机号或邮箱" v-model="formData.account" />
          </view>
        </view>
        <view class="form-group">
          <text class="label">昵称</text>
          <view class="input-wrapper">
            <text class="input-icon no-bg">👤</text>
            <input class="input" placeholder="请输入昵称" v-model="formData.nickname" />
          </view>
        </view>
        <view class="form-group">
          <text class="label">验证码</text>
          <view class="input-wrapper">
            <text class="input-icon"></text>
            <input class="input" placeholder="请输入验证码" v-model="formData.verificationCode" />
            <button class="verify-btn btn-secondary" @click="sendCode" :disabled="countdown > 0 || !formData.account">
              {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
            </button>
          </view>
        </view>
        <view class="form-group">
          <text class="label">设置密码</text>
          <view class="input-wrapper">
            <text class="input-icon lock"></text>
            <input class="input" type="password" placeholder="请设置登录密码" v-model="formData.password" />
          </view>
        </view>
        <view class="form-group">
          <text class="label">确认密码</text>
          <view class="input-wrapper">
            <text class="input-icon lock"></text>
            <input class="input" type="password" placeholder="再次输入密码" v-model="formData.confirmPassword" />
          </view>
        </view>
        <view class="form-group">
          <text class="label">邀请码（选填）</text>
          <view class="input-wrapper">
            <text class="input-icon no-bg">🎁</text>
            <input class="input" placeholder="请输入邀请码（可选）" v-model="formData.inviteCode" />
          </view>
        </view>
        <view class="agreement-wrapper">
          <checkbox-group class="agreement-checkbox" @change="onAgreeChange">
            <checkbox :checked="agree" color="#FFCE00" />
          </checkbox-group>
          <view class="agreement-text-only">
            <text class="agreement-text">注册即表示同意</text>
            <text class="agreement-link" @click="goToUserAgreement">《用户协议》</text>
            <text class="agreement-text">和</text>
            <text class="agreement-link" @click="goToPrivacyPolicy">《隐私政策》</text>
          </view>
        </view>
        <button class="primary-btn btn-primary" @click="register" :disabled="!canSubmit || loading">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { post } from '@/utils/request.js'

export default {
  data() {
    return {
      formData: {
        account: '',
        nickname: '',
        verificationCode: '',
        password: '',
        confirmPassword: '',
        inviteCode: ''
      },
      countdown: 0,
      timer: null,
      agree: true,
      loading: false
    }
  },
  async onLoad() {
    // 检查登录状态
    await this.checkLoginStatus()
  },
  computed: {
    canSubmit() {
      const { account, nickname, verificationCode, password, confirmPassword } = this.formData
      return account && account.trim() &&
        verificationCode && verificationCode.trim() &&
        password && password.trim() &&
        confirmPassword && confirmPassword.trim() &&
        password === confirmPassword &&
        this.validateAccount(account) &&
        this.validatePassword(password) &&
        // 如果填写了昵称，需要验证长度
        (!nickname || !nickname.trim() || nickname.trim().length <= 50)
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
    goToLogin() {
      uni.navigateBack()
    },

    goToUserAgreement() {
      uni.navigateTo({ url: '/pages/user-agreement/user-agreement' })
    },

    goToPrivacyPolicy() {
      uni.navigateTo({ url: '/pages/privacy-policy/privacy-policy' })
    },

    // 验证账户格式（手机号或邮箱）
    validateAccount(account) {
      const phoneRegex = /^1[3-9]\d{9}$/
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return phoneRegex.test(account) || emailRegex.test(account)
    },

    // 验证密码强度
    validatePassword(password) {
      return password.length >= 6 && password.length <= 20
    },

    // 发送验证码
    async sendCode() {
      const account = this.formData.account

      if (!account || !account.trim()) {
        uni.showToast({ title: '请输入账户', icon: 'none' })
        return
      }

      if (!this.validateAccount(account)) {
        uni.showToast({ title: '请输入正确的手机号或邮箱', icon: 'none' })
        return
      }

      if (this.countdown > 0) {
        return
      }

      try {
        const result = await post('/api/user/send-verification-code', {
          account: account,
          codeType: 'register'
        })

        if (result && result.code === 200) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })

          // 开始倒计时
          this.countdown = 60
          this.timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(this.timer)
              this.timer = null
            }
          }, 1000)
        } else {
          uni.showToast({ title: result.message || '发送验证码失败', icon: 'none' })
        }

      } catch (error) {
        console.error('发送验证码失败:', error)
        uni.showToast({ title: error.message, icon: 'none' })
      }
    },

    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    },

    // 注册
    async register() {
      if (!this.canSubmit) {
        this.validateForm() // 调用详细验证，会显示具体的错误信息
        return
      }

      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        // 构建请求参数，只包含有值的字段
        const requestData = {
          account: this.formData.account,
          password: this.formData.password,
          confirmPassword: this.formData.confirmPassword,
          verificationCode: this.formData.verificationCode
        }

        // 添加可选字段
        if (this.formData.nickname && this.formData.nickname.trim()) {
          requestData.nickname = this.formData.nickname.trim()
        }

        if (this.formData.inviteCode && this.formData.inviteCode.trim()) {
          requestData.inviteCode = this.formData.inviteCode.trim()
        }

        const result = await post('/api/user/register', requestData)

        if (result && result.code === 200) {
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })

          // 延迟跳转到登录页面
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            })
          }, 1500)
        } else {
          uni.showToast({ title: result.message || '注册失败', icon: 'none' })
        }

      } catch (error) {
        console.error('注册失败:', error)
        uni.showToast({ title: error.message, icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // 表单验证
    validateForm() {
      const { account, nickname, verificationCode, password, confirmPassword } = this.formData

      if (!account || !account.trim()) {
        uni.showToast({ title: '请输入账户', icon: 'none' })
        return false
      }

      if (!this.validateAccount(account)) {
        uni.showToast({ title: '请输入正确的手机号或邮箱', icon: 'none' })
        return false
      }

      // 昵称是可选的，但如果填写了需要验证长度
      if (nickname && nickname.trim() && nickname.trim().length > 50) {
        uni.showToast({ title: '昵称长度不能超过50个字符', icon: 'none' })
        return false
      }

      if (!verificationCode || !verificationCode.trim()) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return false
      }

      if (!password || !password.trim()) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return false
      }

      if (!this.validatePassword(password)) {
        uni.showToast({ title: '密码长度需要6-20个字符', icon: 'none' })
        return false
      }

      if (!confirmPassword || !confirmPassword.trim()) {
        uni.showToast({ title: '请确认密码', icon: 'none' })
        return false
      }

      if (password !== confirmPassword) {
        uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
        return false
      }

      return true
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
  background-color: #fff8d8;
  background-image: linear-gradient(180deg, #FFE979, #FFE979);
  min-height: 100vh;
}

.content {
  background-color: rgba(255, 255, 255, 1);
  border-radius: 30rpx;
  padding: 50rpx 60rpx 40rpx 60rpx;
  box-shadow: 0 -12rpx 30rpx rgba(0, 0, 0, 0.05);
  min-height: 1400rpx;
  transform: translateY(10%);
}

.header {
  /* text-align: center; */
  margin-bottom: 40rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: #3D3D3D;
  margin-bottom: 12rpx;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: #3D3D3D;
}

.tab-container {
  display: flex;
  justify-content: center;
  gap: 250rpx;
  margin-bottom: 40rpx;
}

.tab-item {
  position: relative;
  padding-bottom: 12rpx;
}

.tab-text {
  font-size: 32rpx;
  color: #3D3D3D;
}

.tab-item.active .tab-text {
  color: #3D3D3D;
  font-weight: bold;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  width: 100rpx;
  z-index: 1;
  height: 10rpx;
  /* 梯形：上宽下窄 */
  clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);
  background-color: #FFCE00;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-item.active .tab-underline {
  opacity: 1;
}

.form-group {
  margin-bottom: 28rpx;
}

.label {
  font-size: 26rpx;
  color: #3D3D3D;
  margin-bottom: 12rpx;
  display: block;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
  background-color: #fff;
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

.input-icon.no-bg {
  font-size: 28rpx;
  background-image: none;
  text-align: center;
  width: unset;
  height: unset;
}

.input-icon.lock {
  background-image: url("/static/lock.png");
}

.input {
  flex: 1;
  font-size: 26rpx;
  border: none;
  background-color: transparent;
  color: #3D3D3D;
  min-width: 0;
}

.verify-btn {
  border-radius: 30rpx;
  background-color: #FFCE00;
  color: #3D3D3D;
  font-size: 24rpx;
  height: 60rpx;
  padding: 0 20rpx;
  line-height: 60rpx;
  border: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.verify-btn:active {
  transform: scale(0.98);
}

.verify-btn:disabled {
  background-color: #ccc !important;
  color: #999 !important;
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
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #FFCE00;
  color: #3D3D3D;
  border: none;
  width: 100%;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.primary-btn:active {
  transform: scale(0.98);
}

.primary-btn:disabled {
  background-color: #ccc !important;
  color: #999 !important;
}
</style>
