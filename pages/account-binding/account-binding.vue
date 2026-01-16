<template>
  <view class="container">
    <view class="content">
      <!-- 主要内容区 -->
      <view class="hero-section">
        <!-- 插图 -->
        <view class="illustration">
          <image class="hero-image" :src="$staticUrl('/static/456270fd-9af0-4ed7-810c-cf2d69b75bc7@1x.png')" mode="aspectFit" />
        </view>
        <view>
          <!-- 标题文案 -->
          <view class="title-section">
            <text class="main-title">账号绑定更<text class="highlight">安全</text>，</text>
            <text class="sub-title">提现更<text class="highlight">高效</text>！</text>
          </view>

          <!-- 描述文案 -->
          <view class="description">
            <text class="desc-text">
              绑定微信或支付宝账号，即可快速完成收益提现，确保资金安全，操作便捷。
            </text>
          </view>
        </view>
      </view>

      <!-- 绑定选项 -->
      <view class="binding-options">
        <!-- 支付宝 -->
        <view class="account-option" @tap="bindAccount('alipay')">
          <view class="option-left">
            <view class="option-icon alipay-icon">支</view>
            <view class="option-info">
              <text class="option-title">支付宝账号</text>
              <text v-if="userInfo.hasAlipay" class="bound-account">{{ userInfo.alipayAccount }}</text>
              <text v-else class="unbind-text">未绑定</text>
            </view>
          </view>
          <view v-if="userInfo.hasAlipay" class="unbind-btn" @tap.stop="unbindAccount('alipay')">解绑</view>
          <view v-else class="bind-btn">点击绑定</view>
        </view>

        <!-- 微信 -->
        <view class="account-option" @tap="bindAccount('wechat')">
          <view class="option-left">
            <view class="option-icon wechat-icon">微</view>
            <view class="option-info">
              <text class="option-title">微信账号</text>
              <text v-if="userInfo.hasWechat" class="bound-account">{{ userInfo.wechatAccount }}</text>
              <text v-else class="unbind-text">未绑定</text>
            </view>
          </view>
          <view v-if="userInfo.hasWechat" class="unbind-btn" @tap.stop="unbindAccount('wechat')">解绑</view>
          <view v-else class="bind-btn">点击绑定</view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="footer-note">
        <text class="note-text">
          如需要提现，请先绑定支付宝或者微信后进行提现。
        </text>
      </view>
    </view>

    <!-- 自定义底部弹窗 -->
    <view class="modal-mask" v-if="showBindingModal" @tap="closeModal" @touchmove.stop.prevent></view>
    <view class="bottom-modal" :class="{ 'show': showBindingModal }" @touchmove.stop.prevent>
      <view class="modal-header">
        <text class="modal-title">绑定{{ currentBindTypeName }}账号</text>
        <view class="close-icon-box" @tap="closeModal">
          <text class="close-icon">×</text>
        </view>
      </view>
      <view class="modal-body">
        <view class="warning-box">
          <text class="warning-icon">⚠️</text>
          <text class="warning-text">为了避免打款失败，请使用真实姓名和手机号注册的账号，成功绑定后可使用人民币取款方式</text>
        </view>
        
        <view class="input-group">
          <text class="input-label">真实姓名</text>
          <input class="modal-input" 
            v-model="realNameInput" 
            placeholder="请输入真实姓名"
            :adjust-position="true"
          />
        </view>

        <view class="input-group">
          <text class="input-label">{{ currentBindTypeName }}账号</text>
          <input class="modal-input" 
            v-model="bindAccountInput" 
            :placeholder="'请输入' + currentBindTypeName + '账号'"
            :adjust-position="true"
          />
        </view>
        
        <button class="modal-confirm-btn" @tap="confirmBind" :disabled="loading">
          {{ loading ? '绑定中...' : '立即绑定' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { get, post } from '@/utils/request.js'

export default {
  data() {
    return {
      userInfo: {
        hasAlipay: false,
        alipayAccount: '',
        hasWechat: false,
        wechatAccount: ''
      },
      loading: false,
      showBindingModal: false,
      bindAccountInput: '',
      realNameInput: '',
      currentBindType: ''
    }
  },
  computed: {
    currentBindTypeName() {
      return this.currentBindType === 'alipay' ? '支付宝' : '微信'
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      try {
        this.loading = true
        const response = await get('/api/user/info')
        if (response.success) {
          const { hasAlipay, alipayAccount, hasWechat, wechatAccount } = response.data
          this.userInfo = {
            hasAlipay,
            alipayAccount: alipayAccount || '',
            hasWechat,
            wechatAccount: wechatAccount || ''
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    bindAccount(type) {
      // 如果已经绑定，不执行绑定操作
      if ((type === 'alipay' && this.userInfo.hasAlipay) || 
          (type === 'wechat' && this.userInfo.hasWechat)) {
        return
      }
      
      this.currentBindType = type
      this.bindAccountInput = ''
      this.realNameInput = ''
      this.showBindingModal = true
    },
    
    closeModal() {
      this.showBindingModal = false
      this.bindAccountInput = ''
      this.realNameInput = ''
    },
    
    async confirmBind() {
      if (!this.realNameInput.trim()) {
        uni.showToast({
          title: '请输入真实姓名',
          icon: 'none'
        })
        return
      }

      if (!this.bindAccountInput.trim()) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none'
        })
        return
      }
      
      const success = await this.performBind(this.currentBindType, this.bindAccountInput.trim(), this.realNameInput.trim())
      if (success) {
        this.closeModal()
      }
    },
    
    async performBind(type, account, realName) {
      try {
        this.loading = true
        const platformName = type === 'alipay' ? '支付宝' : '微信'
        const apiUrl = type === 'alipay' ? '/api/user/bind-alipay' : '/api/user/bind-wechat'
        const paramKey = type === 'alipay' ? 'alipayAccount' : 'wechatAccount'
        
        const response = await post(apiUrl, {
          [paramKey]: account,
          realName: realName
        })
        
        if (response.success) {
          // 更新本地状态
          if (type === 'alipay') {
            this.userInfo.hasAlipay = true
            this.userInfo.alipayAccount = account
          } else {
            this.userInfo.hasWechat = true
            this.userInfo.wechatAccount = account
          }
          
          uni.showToast({
            title: `${platformName}账号绑定成功`,
            icon: 'success'
          })
          return true
        } else {
          uni.showToast({
            title: response.message || `${platformName}账号绑定失败`,
            icon: 'none'
          })
          return false
        }
      } catch (error) {
        console.error('绑定失败:', error)
        uni.showToast({
          title: '绑定失败，请重试',
          icon: 'none'
        })
        return false
      } finally {
        this.loading = false
      }
    },
    
    async unbindAccount(type) {
      const platformName = type === 'alipay' ? '支付宝' : '微信'
      uni.showModal({
        title: '解绑提示',
        content: `确定要解绑${platformName}账号吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.performUnbind(type)
          }
        }
      })
    },
    
    async performUnbind(type) {
      try {
        this.loading = true
        const platformName = type === 'alipay' ? '支付宝' : '微信'
        const apiUrl = type === 'alipay' ? '/api/user/unbind-alipay' : '/api/user/unbind-wechat'
        
        const response = await post(apiUrl, {})
        
        if (response.success) {
          // 更新本地状态
          if (type === 'alipay') {
            this.userInfo.hasAlipay = false
            this.userInfo.alipayAccount = ''
          } else {
            this.userInfo.hasWechat = false
            this.userInfo.wechatAccount = ''
          }
          
          uni.showToast({
            title: `${platformName}账号解绑成功`,
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.message || `${platformName}账号解绑失败`,
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('解绑失败:', error)
        uni.showToast({
          title: '解绑失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
}

.nav-right-icons {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.dots-icon {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.settings-icon {
  font-size: 32rpx;
  color: #333;
}

.content {
  flex: 1;
  padding: 0 30rpx 30rpx 30rpx;
}

.hero-section {
  display: flex;
  background: white;
  border-radius: 20rpx;
  padding: 60rpx 40rpx 40rpx 40rpx;
  margin: 20rpx 0;
  text-align: center;
}

.illustration {
  margin-bottom: 40rpx;
}

.hero-image {
  width: 200rpx;
  height: 200rpx;
}

.title-section {
  margin-bottom: 30rpx;
}

.main-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  line-height: 1.4;
}

.sub-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  line-height: 1.4;
}

.highlight {
  color: #00AAFF;
}

.description {
  margin-bottom: 20rpx;
}

.desc-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.binding-options {
  margin-bottom: 40rpx;
}

.account-option {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
}

.option-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.option-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.alipay-icon {
  background: #1677FF;
}

.wechat-icon {
  background: #07C160;
}

.option-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.bind-btn {
  width: 200rpx;
  height: 60rpx;
  background-color: #FFD700;
  color: #333;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bind-btn:disabled {
  background-color: #ccc;
  color: #999;
}

.bind-btn.bound {
  background-color: #4CAF50;
  color: white;
}

.unbind-btn {
  width: 200rpx;
  height: 60rpx;
  background-color: #FF5722;
  color: white;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bound-account {
  font-size: 24rpx;
  color: #666;
}

.unbind-text {
  font-size: 24rpx;
  color: #999;
}

.footer-note {
  padding: 0 20rpx;
}

.note-text {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
  text-align: center;
}

/* 底部弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.bottom-modal {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50vh;
  background: white;
  border-radius: 30rpx 30rpx 0 0;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.bottom-modal.show {
  transform: translateY(0);
}

.modal-header {
  padding: 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-icon-box {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 10rpx;
}

.close-icon {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  flex: 1;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
}

.warning-box {
  background: #FFF9E6;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 40rpx;
  display: flex;
  gap: 15rpx;
}

.warning-icon {
  font-size: 32rpx;
}

.warning-text {
  font-size: 26rpx;
  color: #FAAD14;
  line-height: 1.5;
  flex: 1;
}

.input-group {
  margin-bottom: 60rpx;
}

.input-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
  font-weight: 500;
}

.modal-input {
  height: 88rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}

.modal-confirm-btn {
  width: 100%;
  height: 88rpx;
  background: #FFD700;
  color: #333;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-top: auto;
}

.modal-confirm-btn:active {
  opacity: 0.9;
}
</style>
