<template>
  <view class="container">
    <view class="content">
      <!-- 钱包余额卡片 -->
      <view class="wallet-card">
        <text class="wallet-title">钱包余额</text>
        <view class="balance-row">
          <view class="balance-main">
            <text class="balance-amount">{{ incomeStats.currentBalance || '0.00' }}</text>
            <text class="balance-unit">元</text>
          </view>
          <button class="withdraw-btn" @click="showWithdrawModal">立即提现</button>
        </view>
        <view class="balance-stats">
          <view class="stat-item">
            <text class="stat-label">今日赚取</text>
            <text class="stat-value">{{ incomeStats.todayIncome || '0.00' }} 元</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">本月赚取金额</text>
            <text class="stat-value">{{ incomeStats.monthIncome || '0.00' }} 元</text>
          </view>
        </view>
      </view>

      <!-- 筛选条件 -->
      <view class="filter-section">
        <view class="filter-item" 
              :class="{ active: filterParams.type === '' }"
              @click="setFilter('')">
          <text class="filter-text">全部</text>
        </view>
        <view class="filter-item" 
              :class="{ active: filterParams.type === 'TASK_REWARD' }"
              @click="setFilter('TASK_REWARD')">
          <text class="filter-text">任务奖励</text>
        </view>
        <view class="filter-item" 
              :class="{ active: filterParams.type === 'INVITE_COMMISSION' }"
              @click="setFilter('INVITE_COMMISSION')">
          <text class="filter-text">邀请佣金</text>
        </view>
        <view class="filter-item" 
              :class="{ active: filterParams.type === 'WITHDRAW' }"
              @click="setFilter('WITHDRAW')">
          <text class="filter-text">提现</text>
        </view>
      </view>

      <!-- 余额明细 -->
      <view class="details-section">
        <text class="details-title">余额明细</text>
        <view class="detail-list" v-if="balanceLogs.length > 0">
          <view class="detail-item" v-for="item in balanceLogs" :key="item.id">
            <view class="detail-info">
              <text class="detail-title">{{ item.description }}</text>
              <text class="detail-time">{{ formatTime(item.createdAt) }}</text>
            </view>
            <text class="detail-amount" :class="getAmountClass(item.type)">
              {{ formatAmount(item.amount, item.type) }}
            </text>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text class="empty-text">暂无记录</text>
        </view>
        
        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore" @click="loadMore">
          <text class="load-more-text">加载更多</text>
        </view>
      </view>

      <!-- 提现规则 -->
      <view class="rules-section">
        <text class="rules-title">提现规则：</text>
        <text class="rule-item">1.单笔最低提现10元。</text>
        <text class="rule-item">2.每日最多可提现3次。</text>
        <text class="rule-item">3.提现手续费0.01%。</text>
        <text class="rule-item">4.微信/支付宝自动到账。</text>
        <text class="rule-item">5.72小时内到账，请等候。</text>
        <text class="rule-item">6.更多提现限制请咨询客服。</text>
      </view>
    </view>

    <!-- 提现弹窗 -->
    <view class="withdraw-modal" v-if="showModal">
      <view class="modal-content">
        <text class="modal-title">确认提现</text>
        <view class="withdraw-info">
          <text class="current-balance">可提现余额</text>
          <text class="balance-text">{{ incomeStats.currentBalance || '0.00' }} 元</text>
        </view>
        <view class="form-group">
          <text class="form-label">请输入提现金额</text>
          <input class="form-input" type="digit" placeholder="请输入提现金额" v-model="withdrawAmount" />
        </view>
        <view class="payment-methods">
          <view class="method-item" :class="{ active: selectedMethod === 'wechat' }" @click="selectMethod('wechat')">
            <image class="method-icon" src="/static/wechatpay.png" mode="aspectFit"></image>
            <text class="method-name">微信提现</text>
            <view class="radio-icon" :class="{ checked: selectedMethod === 'wechat' }">
              <view class="radio-dot" v-if="selectedMethod === 'wechat'"></view>
            </view>
          </view>
          <view class="method-item" :class="{ active: selectedMethod === 'alipay' }" @click="selectMethod('alipay')">
            <image class="method-icon" src="/static/alipay.png" mode="aspectFit"></image>
            <text class="method-name">支付宝提现</text>
            <view class="radio-icon" :class="{ checked: selectedMethod === 'alipay' }">
              <view class="radio-dot" v-if="selectedMethod === 'alipay'"></view>
            </view>
          </view>
        </view>
        <view class="modal-buttons">
          <button class="cancel-btn" @click="hideWithdrawModal" :disabled="submitting">取消</button>
          <button class="confirm-btn" @click="confirmWithdraw" :disabled="submitting">
            {{ submitting ? '提交中...' : '确认提现' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { get, post } from '@/utils/request.js'

export default {
  data() {
    return {
      showModal: false,
      withdrawAmount: '',
      selectedMethod: 'alipay', // 默认选择支付宝
      submitting: false, // 添加提交状态
      
      // 收入统计数据
      incomeStats: {
        userId: null,
        totalIncome: 0,
        todayIncome: 0,
        monthIncome: 0,
        currentBalance: 0,
        statisticsTime: ''
      },
      
      // 余额变动记录
      balanceLogs: [],
      
      // 筛选参数
      filterParams: {
        page: 1,
        size: 10,
        type: ''
      },
      
      // 分页信息
      hasMore: true,
      loading: false
    }
  },
  
  onLoad() {
    this.getIncomeStats()
    this.getBalanceLogs()
  },
  
  methods: {
    // 获取收入统计
    async getIncomeStats() {
      try {
        const response = await get('/api/user/balance/income-stats')
        if (response.code === 200) {
          this.incomeStats = response.data
        }
      } catch (error) {
        console.error('获取收入统计失败:', error)
      }
    },
    
    // 获取余额变动记录
    async getBalanceLogs(isLoadMore = false) {
      if (this.loading) return
      
      try {
        this.loading = true
        
        const params = {
          page: this.filterParams.page,
          size: this.filterParams.size
        }
        
        if (this.filterParams.type) {
          params.type = this.filterParams.type
        }
        
        const response = await get('/api/user/balance/logs', params)
        
        if (response.code === 200) {
          const { records, total, current, size, pages, incomeStats } = response.data
          
          if (isLoadMore) {
            this.balanceLogs = [...this.balanceLogs, ...records]
          } else {
            this.balanceLogs = records
          }
          
          // 更新收入统计（如果返回了）
          if (incomeStats) {
            this.incomeStats = incomeStats
          }
          
          // 判断是否还有更多数据
          this.hasMore = current < pages
        }
      } catch (error) {
        console.error('获取余额记录失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 设置筛选条件
    setFilter(type) {
      this.filterParams.type = type
      this.filterParams.page = 1
      this.getBalanceLogs()
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.filterParams.page++
        this.getBalanceLogs(true)
      }
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      return timeStr.replace('T', ' ').split('.')[0]
    },
    
    // 格式化金额
    formatAmount(amount, type) {
      const formattedAmount = parseFloat(amount).toFixed(2)
      return type === 'WITHDRAW' ? `-${formattedAmount}元` : `+${formattedAmount}元`
    },
    
    // 获取金额样式类
    getAmountClass(type) {
      return type === 'WITHDRAW' ? 'expense' : 'income'
    },
    
    goBack() {
      uni.navigateBack()
    },
    showWithdrawModal() {
      this.showModal = true
    },
    
    hideWithdrawModal() {
      this.showModal = false
      this.withdrawAmount = ''
      this.submitting = false
    },
    
    selectMethod(method) {
      this.selectedMethod = method
    },
    
    // 验证提现金额
    validateWithdrawAmount() {
      if (!this.withdrawAmount) {
        uni.showToast({
          title: '请输入提现金额',
          icon: 'none'
        })
        return false
      }
      
      const amount = parseFloat(this.withdrawAmount)
      
      if (isNaN(amount) || amount <= 0) {
        uni.showToast({
          title: '请输入有效的提现金额',
          icon: 'none'
        })
        return false
      }
      
      if (amount < 10) {
        uni.showToast({
          title: '提现金额不能少于10.00元',
          icon: 'none'
        })
        return false
      }
      
      const totalIncome = parseFloat(this.incomeStats.currentBalance || 0)
      if (amount > totalIncome) {
        uni.showToast({
          title: '提现金额不能超过可用余额',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 确认提现
    async confirmWithdraw() {
      if (!this.validateWithdrawAmount()) {
        return
      }
      
      if (this.submitting) {
        return
      }
      
      try {
        this.submitting = true
        
        const response = await post('/api/withdrawal/apply', {
          amount: parseFloat(this.withdrawAmount),
          accountType: this.selectedMethod
        })
        
        if (response.success) {
          // 提现申请成功
          const data = response.data
          
          uni.showModal({
            title: '提现申请成功',
            content: `提现金额：${data.amount}元\n手续费：${data.fee}元\n实际到账：${data.actualAmount}元\n预计到账时间：${data.estimatedArrivalTime}`,
            showCancel: false,
            confirmText: '确定',
            success: () => {
              this.hideWithdrawModal()
              // 刷新余额和记录
              this.getIncomeStats()
              this.filterParams.page = 1
              this.getBalanceLogs()
            }
          })
        } else {
          // 提现申请失败
          uni.showToast({
            title: response.message || '提现申请失败',
            icon: 'none',
            duration: 3000
          })
        }
      } catch (error) {
        console.error('提现申请失败:', error)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100%;
  background-color: #f8f8f8;
}

.nav-bar {
  background-color: white;
}

.status-bar {
  height: 44px;
}

.nav-content {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 30rpx;
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
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-left: auto;
}

.more-dots {
  display: flex;
  gap: 6rpx;
  padding: 12rpx;
}

.dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background-color: #666;
}

.more-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon {
  font-size: 24rpx;
  color: #666;
}



.content {
  padding: 30rpx;
}

.wallet-card {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 20rpx;
  position: relative;
}

.wallet-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 20rpx;
}

.balance-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.balance-main {
  display: flex;
  align-items: flex-end;
  gap: 10rpx;
}

.balance-amount {
  color: #333;
  font-family: DengXian;
  font-size: 36px;
  font-weight: bold;
}

.balance-unit {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.withdraw-btn {
  background-color: transparent;
  margin-left: auto;
  margin-right: 0;
  height: 30px;
  font-size: 14px;
  border-radius: 15px;
  border: 1px solid black;
  display: flex;
  align-items: center;
}

.balance-stats {
  display: flex;
  gap: 60rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.details-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.details-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.detail-list {
  max-height: 600rpx;
  overflow-y: auto;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-info {
  flex: 1;
}

.detail-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.detail-time {
  font-size: 24rpx;
  color: #999;
}

.detail-amount {
  font-size: 28rpx;
  font-weight: bold;
}

.detail-amount.income {
  color: #FF6B35;
}

.detail-amount.expense {
  color: #666;
}

.rules-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.rules-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.rule-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 10rpx;
}

.withdraw-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 85%;
  max-width: 600rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  display: block;
  margin-bottom: 40rpx;
}

.withdraw-info {
  background-color: #f8f8f8;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  margin-bottom: 30rpx;
}

.current-balance {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.balance-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B35;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.form-input {
  padding: 25rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.payment-methods {
  margin-bottom: 40rpx;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  margin-bottom: 15rpx;
}

.method-item.active {
  border-color: #FFD700;
  background-color: #fffbe6;
}

.method-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 20rpx;
}

.method-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.radio-icon {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.radio-icon.checked {
  border-color: #FFD700;
  background-color: #FFD700;
}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  background-color: white;
  border-radius: 50%;
}

.modal-buttons {
  display: flex;
  gap: 20rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.cancel-btn {
  background-color: #f8f8f8;
  color: #666;
}

.confirm-btn {
  background-color: #FFD700;
  color: #333;
}

/* 筛选条件样式 */
.filter-section {
  display: flex;
  background-color: white;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 8rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.filter-item.active {
  background: linear-gradient(135deg, #FFC300 0%, #FFB000 100%);
  border: 1rpx solid #f0f0f0;
}

.filter-text {
  font-size: 28rpx;
  color: #666;
  transition: color 0.3s ease;
}

.filter-item.active .filter-text {
  color: white;
  font-weight: 500;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

/* 加载更多样式 */
.load-more {
  text-align: center;
  padding: 32rpx 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 24rpx;
}

.load-more-text {
  color: #667eea;
  font-size: 28rpx;
}
.withdraw-btn {
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

.withdraw-btn:disabled {
  background-color: #ccc;
  color: #999;
}

.record-btn {
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
</style>

