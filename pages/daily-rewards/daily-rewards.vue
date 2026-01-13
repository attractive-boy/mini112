<template>
  <view class="container">
    <!-- 背景图片层 -->
    <view class="bg-layer"></view>

    <view class="content">
      <view class="daily-banner">
        <view class="banner-content">
          <text class="banner-title">每日专享</text>
          <view class="time-display">
            <text class="time-block">{{ timeData.hours }}</text>
            <text class="time-separator">:</text>
            <text class="time-block">{{ timeData.minutes }}</text>
            <text class="time-separator">:</text>
            <text class="time-block">{{ timeData.seconds }}</text>
          </view>
        </view>
      </view>
      <!-- 任务进度列表 -->
      <view class="progress-section" v-if="!loading">
        <view class="progress-item" v-for="(task, index) in dailyTaskData.tasks" :key="task.taskId">
          <view class="task-number">{{ index + 1 }}</view>
          <view class="task-info">
            <text class="task-title">{{ task.taskName }}</text>
            <text class="task-desc">{{ task.taskDescription }}</text>
          </view>
          <view class="task-reward">
            <text class="reward-amount">+{{ task.rewardAmount.toFixed(2) }}元</text>
            <view class="claim-btn" :class="getButtonClass(task)" @tap="handleTaskAction(task)">
              {{ getButtonText(task) }}
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <!-- 注意事项 -->
      <view class="warning-section">
        <view class="warning-header">
          <text class="warning-icon">⚠️</text>
          <text class="warning-title">注意事项</text>
          <text class="warning-icon">⚠️</text>
        </view>
        <text class="warning-desc">
          禁止使用非法手段获取奖励!!!!
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '@/utils/request.js'

export default {
  data() {
    return {
      loading: true,
      // API返回的数据结构
      dailyTaskData: {
        queryDate: '',
        tasks: [],
        totalTasks: 0,
        completedTasks: 0,
        totalReward: 0.00,
        earnedReward: 0.00
      },
      timeData: {
        hours: '00',
        minutes: '00',
        seconds: '00'
      },
      timer: null
    }
  },
  onLoad() {
    this.loadDailyTasks()
    this.startTimer()
  },
  onUnload() {
    this.stopTimer()
  },
  methods: {
    startTimer() {
      this.updateTime()
      this.timer = setInterval(() => {
        this.updateTime()
      }, 1000)
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    updateTime() {
      const now = new Date()
      this.timeData = {
        hours: String(now.getHours()).padStart(2, '0'),
        minutes: String(now.getMinutes()).padStart(2, '0'),
        seconds: String(now.getSeconds()).padStart(2, '0')
      }
    },
    // 获取每日任务列表
    async loadDailyTasks() {
      try {
        this.loading = true
        const response = await request({
          url: '/api/daily-task/list',
          method: 'GET'
        })
        
        if (response.code === 200 && response.data) {
          this.dailyTaskData = response.data
        }
      } catch (error) {
        console.error('获取每日任务失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 每日签到
    async signIn() {
      try {
        uni.showLoading({
          title: '签到中...'
        })
        
        const response = await request({
          url: '/api/daily-task/sign-in',
          method: 'GET'
        })
        
        if (response.code === 200 && response.data) {
          const { success, message, rewardAmount } = response.data
          
          if (success) {
            uni.showToast({
              title: message || `签到成功！`,
              icon: 'success'
            })
            
            // 重新加载任务列表
            await this.loadDailyTasks()
          } else {
            uni.showToast({
              title: message || '签到失败',
              icon: 'error'
            })
          }
        }
      } catch (error) {
        console.error('签到失败:', error)
        uni.showToast({
          title: '签到失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 处理任务操作
    handleTaskAction(task) {
      if (task.taskName === '每日签到') {
        // 签到任务
        if (task.isCompleted) {
          uni.showToast({
            title: '今日已签到',
            icon: 'success'
          })
        } else {
          this.signIn()
        }
      } else {
        // 其他任务，跳转到任务大厅
        if (task.isCompleted) {
          uni.showToast({
            title: '任务已完成',
            icon: 'success'
          })
        } else {
          uni.switchTab({
            url: '/pages/task-hall/task-hall'
          })
        }
      }
    },

    // 获取按钮文本
    getButtonText(task) {
      if (task.taskName === '每日签到') {
        return task.isCompleted ? '已签到' : '立即签到'
      } else {
        return task.isCompleted ? '已完成' : '去完成'
      }
    },

    // 获取按钮样式类
    getButtonClass(task) {
      return task.isCompleted ? 'completed' : 'pending'
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #FE8C0A;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50vh;
  background-image: url('/static/3530d48b-4300-4c3d-899a-aec565837df4@1x.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 0;
}

.content {
  padding: 0 30rpx;
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.daily-banner {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
  padding: 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.banner-title {
  font-size: 72rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 20rpx;
  display: block;
  text-align: center;
  width: 100%;
}

.time-display {
  margin-top: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 100%;
}

.time-block {
  background-color: black;
  color: white;
  padding: 10rpx 15rpx;
  border-radius: 10rpx;
  font-size: 40rpx;
  font-weight: bold;
  min-width: 60rpx;
  text-align: center;
}

.time-separator {
  color: black;
  font-size: 40rpx;
  font-weight: bold;
}

.progress-section {
  margin-top: 35%;
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 180rpx; /* 增加底部间距，避免被注意事项遮挡 */
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.task-number {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #FFCE00;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #333;
  font-size: 28rpx;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  font-weight: bold;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.task-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.task-reward {
  text-align: right;
  flex-shrink: 0;
}

.reward-amount {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: bold;
  display: block;
  margin-bottom: 15rpx;
}

.claim-btn {
  width: 100rpx;
  height: 60rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.claim-btn.pending {
  background: #F02B01;
}

.claim-btn.completed {
  background: #ccc;
}

.claim-btn:active {
  transform: scale(0.95);
}

.sign-btn {
  width: 200rpx;
  height: 60rpx;
  background-color: #FFCE00;
  color: #333;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sign-btn:disabled {
  background-color: #ccc;
  color: #999;
}

.sign-btn.signed {
  background-color: #4CAF50;
  color: white;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #666;
  font-size: 28rpx;
}

.warning-section {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  padding: 30rpx;
  text-align: center;
  z-index: 10;
  box-shadow: 0 -4rpx 10rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.warning-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 15rpx;
  flex-wrap: wrap;
}

.warning-icon {
  font-size: 32rpx;
}

.warning-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B35;
}

.warning-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
