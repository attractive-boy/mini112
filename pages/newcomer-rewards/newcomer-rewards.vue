<template>
  <view class="container">
    <!-- 背景图片层 -->
    <view class="bg-layer"></view>
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
      <!-- 新人专享横幅 -->
      <view class="newcomer-banner">
        <view class="banner-info">
          <text class="banner-title">新人专享</text>
          <text class="banner-amount">{{ totalReward }} 
            <text class="banner-amount-sub">元红包奖励</text></text>
        </view>
      </view>

      <!-- 任务列表 -->
      <view class="task-section" v-if="!loading">
        <view class="task-item" v-for="(task, index) in tasks" :key="task.id">
          <view class="task-number">{{ index + 1 }}</view>
          <view class="task-info">
            <text class="task-title">{{ task.name }}<text class="task-amount">+{{ task.rewardAmount }}元</text></text>
            <text class="task-desc">{{ task.description }}</text>
          </view>
          <view class="task-reward">
            <view
              class="reward-btn"
              :class="getButtonClass(task)"
              @tap="task.isCompleted && !task.hasClaimedReward ? claimReward(task) : null"
            >
              {{ getButtonText(task) }}
            </view>
          </view>
        </view>
      </view>

      <!-- 每日福利按钮 -->
      <view class="daily-reward-btn">
        <view
         class="daily-reward-btn-word"
          @tap="claimDailyReward"
        >
          每日福利
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

    </view>
  </view>
</template>

<script>
import { request } from '@/utils/request.js'

export default {
  components: {},
  data() {
    return {
      tasks: [],
      loading: true,
      totalReward: 0
    };
  },
  onLoad() {
    this.loadTasks()
  },
  computed: {
    // 计算总奖励金额
    totalRewardAmount() {
      return this.tasks.reduce((total, task) => total + task.rewardAmount, 0).toFixed(1)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    // 加载任务列表
    async loadTasks() {
      try {
        this.loading = true
        const response = await request({
          url: '/api/user/system-tasks/list',
          method: 'GET'
        })
        
        if (response.data && response.data.tasks) {
          // 过滤掉type为daily_signin的数据
          this.tasks = response.data.tasks.filter(task => task.type !== 'daily_signin')
          this.totalReward = this.tasks.reduce((total, task) => total + task.rewardAmount, 0).toFixed(1)
          
          // 为每个任务检查完成状态
          await this.checkAllTasksStatus()
        }
      } catch (error) {
        console.error('加载任务列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    // 检查所有任务的完成状态
    async checkAllTasksStatus() {
      for (let task of this.tasks) {
        await this.checkTaskStatus(task)
      }
    },

    // 检查单个任务的完成状态
    async checkTaskStatus(task) {
      try {
        const response = await request({
          url: `/api/user/system-tasks/${task.id}/completion-status`,
          method: 'GET'
        })
        
        if (response.data) {
          // 更新任务的完成状态
          task.isCompleted = response.data.isCompleted
          task.canComplete = response.data.canComplete
          
          // 如果任务已完成，进一步检查奖励领取状态
          if (task.isCompleted) {
            await this.checkRewardStatus(task)
          }
        }
      } catch (error) {
        console.error(`检查任务${task.id}状态失败`, error)
      }
    },

    // 检查奖励领取状态
    async checkRewardStatus(task) {
      try {
        const response = await request({
          url: `/api/user/system-tasks/${task.id}/reward-status`,
          method: 'GET'
        })
        
        if (response.data) {
          // 更新任务的奖励领取状态
          task.hasClaimedReward = response.data.hasClaimedReward
          task.lastClaimedAt = response.data.lastClaimedAt
          task.totalClaimedCount = response.data.totalClaimedCount
          task.todayClaimedCount = response.data.todayClaimedCount
        }
      } catch (error) {
        console.error(`检查任务${task.id}奖励状态失败`, error)
      }
    },

    // 获取按钮文本
    getButtonText(task) {
      if (!task.isCompleted) {
        return '去完成'
      } else if (task.hasClaimedReward) {
        return '已领取'
      } else {
        return '领取奖励'
      }
    },

    // 获取按钮样式类
    getButtonClass(task) {
      if (!task.isCompleted) {
        return 'pending'
      } else if (task.hasClaimedReward) {
        return 'claimed'
      } else {
        return 'claim-reward'
      }
    },

    // 处理任务操作
    async handleTaskAction(task) {
      if (task.hasClaimedReward) {
        // 已领取，显示提示
        uni.showToast({
          title: '奖励已领取',
          icon: 'success'
        })
      } else if (task.isCompleted) {
        // 领取奖励
        await this.claimReward(task)
      }
      // 移除去完成任务的逻辑
    },

    // 领取奖励
    async claimReward(task) {
      try {
        uni.showLoading({
          title: '领取中...'
        })
        
        const response = await request({
          url: `/api/user/system-tasks/${task.id}/claim-reward`,
          method: 'POST'
        })
        
        if (response.data && response.data.success) {
          uni.showToast({
            title: '奖励领取成功',
            icon: 'success'
          })
          
          // 重新检查任务状态和奖励状态
          await this.checkTaskStatus(task)
        }
      } catch (error) {
        console.error('领取奖励失败:', error)
        uni.showToast({
          title: '领取失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  position: relative;
}

.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-image: url('/static/daybackg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 0;
}

.content {
  padding: 20rpx;
  padding-top: calc(var(--status-bar-height, 44px) + 88rpx);
  position: relative;
  z-index: 1;
}

.newcomer-banner {
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.banner-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 20rpx;
}

.banner-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
  margin-left: 20rpx;
  color: #FB9700;
}

.banner-amount {
  font-size: 80rpx;
  font-weight: 1000;
  color: #FF4800;
  display: block;
  margin-left: 30rpx;
}
.banner-amount-sub {
  font-size: 42rpx;
  font-weight: bold;
  color: #FF6200;
  display: inline-block;
}

.task-section {
  margin-top: 60%;
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.task-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.task-number {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: #FE9E01;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
  font-size: 24rpx;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.task-amount {
  font-size: 24rpx;
  color: #E50000;
}



.task-desc {
  font-size: 24rpx;
  color: #666;
}

.task-reward {
  text-align: right;
}

.reward-btn {
  width: 100rpx;
  height: 40rpx;
  border-radius: 20rpx;
  opacity: 1;
  font-size: 24rpx;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.reward-btn.claim-reward {
  background-color: #4CAF50;
}

.reward-btn.pending {
  background-color: #ccc;
  cursor: not-allowed;
}

.reward-btn.claimed {
  background-color: #ccc;
}

.daily-reward-btn {
  margin-top: 30rpx;
  width: calc(100vw - 5.8125rem);
  margin: 0 auto;
  height: 80rpx;
  padding: 0 20rpx;
  background-color: #FFD833;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.daily-reward-btn-word {
  font-size: 32rpx;
  font-weight: bold;
  color: #F02B01;

}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #666;
  font-size: 28rpx;
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
