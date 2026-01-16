<template>
  <view class="container">
    <view class="content">
      <!-- 状态筛选 -->
      <view class="filter-tabs">
        <view class="tab-item" v-for="(tab, index) in tabs" :key="index" :class="{ active: currentTab === index }"
          @tap="switchTab(index)">
          <text class="tab-text">{{ tab.name }}</text>
          <view class="tab-indicator" v-if="currentTab === index"></view>
        </view>
      </view>

      <!-- 任务列表 -->
      <view class="task-list">
        <view class="task-item" v-for="(task, index) in taskList" :key="task.taskId" @tap="goToTaskDetail(task)">
          <view class="task-main">
            <image class="task-icon" src="/static/boy.png" />
            <view class="task-content">
              <view class="task-header">
                <text class="task-name">{{ task.taskTitle }}</text>
                <text class="task-amount">+¥{{ task.taskReward }}</text>
              </view>
              <text class="task-desc">{{ task.statusDescription }}</text>
              <text class="task-time">{{ formatTime(task.participatedAt) }}</text>
            </view>
          </view>

          <!-- 状态按钮 -->
          <view class="task-actions" @tap.stop="">
            <view class="task-status-badge" :class="getStatusClass(task.participantStatus)" @tap="handleTaskAction(task)">
              <text class="status-text">{{ getStatusText(task.participantStatus) }}</text>
            </view>
            <view v-if="task.participantStatus === 'ACCEPTED'" class="action-button go-complete" @tap="goToComplete(task)">
              <text class="action-text">去完成</text>
            </view>
            <view v-if="task.participantStatus === 'PENDING' || task.participantStatus === 'APPROVED' || task.participantStatus === 'REJECTED'" class="action-button view-detail"
              @tap="viewDetails(task)">
              <text class="action-text">查看详情</text>
            </view>
          </view>
        </view>

        <!-- 暂无记录 -->
        <view v-if="taskList.length === 0 && !loading" class="empty-state">
          <text class="empty-text">暂无记录</text>
          <view class="go-hall-button" @tap="goHall">
            <text class="hall-text">去任务大厅</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more" @tap="loadMore">
          <text class="load-more-text">{{ loading ? '加载中...' : '加载更多' }}</text>
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
      currentTab: 0,
      tabs: [
        { name: '全部', key: '' },
        { name: '待完成', key: 'ACCEPTED' },
        { name: '审核中', key: 'PENDING' },
        { name: '已通过', key: 'APPROVED' },
        { name: '未通过', key: 'REJECTED' }
      ],
      taskList: [],
      loading: false,
      page: 1,
      size: 10,
      total: 0,
      hasMore: true
    }
  },
  onLoad() {
    this.loadTaskRecords()
  },
  onShow() {
    this.refreshData()
  },
  methods: {
    async loadTaskRecords(isRefresh = false) {
      if (this.loading) return
      
      try {
        this.loading = true
        
        if (isRefresh) {
          this.page = 1
          this.taskList = []
          this.hasMore = true
        }
        
        const params = {
          page: this.page,
          size: this.size
        }
        
        // 添加状态筛选参数
        const currentTabKey = this.tabs[this.currentTab].key
        if (currentTabKey) {
          params.participantStatus = currentTabKey
        }
        
        const response = await get('/user/tasks/participated', params)
        
        if (response.code === 200 && response.data) {
          const { records, total, current, pages } = response.data
          
          if (isRefresh) {
            this.taskList = records || []
          } else {
            this.taskList = [...this.taskList, ...(records || [])]
          }
          
          this.total = total || 0
          this.page = current || 1
          this.hasMore = this.page < pages
        }
      } catch (error) {
        console.error('获取任务记录失败:', error)
        uni.showToast({
          title: '获取任务记录失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    
    refreshData() {
      this.loadTaskRecords(true)
    },
    
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.page += 1
        this.loadTaskRecords()
      }
    },
    
    switchTab(index) {
      this.currentTab = index
      this.refreshData()
    },
    
    formatTime(timeStr) {
      if (!timeStr) return ''
      return timeStr.replace(/:\d{2}$/, '') // 移除秒数，只显示到分钟
    },
    
    goHall() {
      uni.switchTab({ url: "/pages/task-hall/task-hall" })
    },
    
    goToTaskDetail(task) {
      uni.navigateTo({
        url: `/pages/task-detail/task-detail?id=${task.taskId}`
      })
    },
    
    handleTaskAction(task) {
      this.goToTaskDetail(task)
    },
    
    getStatusClass(status) {
      const statusMap = {
        'ACCEPTED': 'status-pending',
        'PENDING': 'status-reviewing', 
        'APPROVED': 'status-completed',
        'REJECTED': 'status-rejected'
      }
      return statusMap[status] || 'status-default'
    },
    
    getStatusText(status) {
      const textMap = {
        'ACCEPTED': '待完成',
        'PENDING': '审核中',
        'APPROVED': '已通过', 
        'REJECTED': '未通过'
      }
      return textMap[status] || '未知'
    },
    
    goToComplete(task) {
      uni.navigateTo({
        url: `/pages/submit-task/submit-task?id=${task.taskId}`
      })
    },
    
    viewDetails(task) {
      uni.navigateTo({
        url: `/pages/task-detail/task-detail?id=${task.taskId}`
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8f8f8;
}

.nav-bar {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
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
  background: #666;
}

.more-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon {
  font-size: 24rpx;
  color: #666;
}

.content {
  padding: 0;
}

.filter-tabs {
  display: flex;
  background: #FFDD00;
  padding: 0;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  position: relative;
  text-align: center;
  padding: 24rpx 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab-item:hover .tab-text {
  color: rgba(51, 51, 51, 0.9);
}

.tab-text {
  font-size: 28rpx;
  color: rgba(51, 51, 51, 0.7);
  font-weight: 500;
  transition: all 0.3s ease;
  display: block;
}

.tab-item.active .tab-text {
  color: #333;
  font-weight: 600;
  transform: scale(1.05);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: #333;
  border-radius: 3rpx;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
    transform: translateX(-50%) scaleX(0);
  }

  to {
    width: 40rpx;
    opacity: 1;
    transform: translateX(-50%) scaleX(1);
  }
}

.task-list {
  padding: 20rpx;
}

.task-item {
  background: white;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.12);
}

.task-main {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.task-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.task-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.task-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: #FF3030;
}

.task-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: block;
  margin-bottom: 8rpx;
}

.task-time {
  font-size: 24rpx;
  color: #999;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 16rpx;
  align-items: center;
}

.task-status-badge {
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.status-badge.completed {
  background-color: #67C23A;
  color: white;
}

.status-badge.pending {
  background-color: #E6A23C;
  color: white;
}

.status-badge.failed {
  background-color: #F56C6C;
  color: white;
}

.divider-line {
  height: 2rpx;
  background-color: #e5e5e5;
  margin: 20rpx 0;
}

.section-divider {
  height: 1rpx;
  background-color: #ddd;
  margin: 30rpx 0;
}

.status-pending {
  background: #007AFF;
}

.status-pending .status-text {
  color: white;
}

.status-reviewing {
  background: #FFD700;
}

.status-reviewing .status-text {
  color: #333;
}

.status-completed {
  background: #34C759;
}

.status-completed .status-text {
  color: white;
}

.status-rejected {
  background: #FF3B30;
}

.status-rejected .status-text {
  color: white;
}

.action-button {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-text {
  font-size: 24rpx;
  font-weight: 500;
  display: block;
}

.go-complete {
  background: #FFD700;
}

.go-complete .action-text {
  color: #333;
}

.view-detail {
  background: #f5f5f5;
  border: 1rpx solid #e0e0e0;
}

.view-detail .action-text {
  color: #666;
}

.action-button:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.task-status-badge:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 40rpx;
  display: block;
}

.go-hall-button {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 25rpx;
  padding: 20rpx 40rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-block;
  box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.3);
}

.hall-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.go-hall-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 215, 0, 0.4);
}

.load-more {
  text-align: center;
  padding: 40rpx;
  cursor: pointer;
}

.load-more-text {
  font-size: 28rpx;
  color: #666;
}
</style>