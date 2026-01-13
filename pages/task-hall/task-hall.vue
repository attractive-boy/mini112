<template>
  <view class="container">
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input class="search-input" placeholder="请输入任务关键词" v-model="searchKeyword" @input="onSearchInput" />
      </view>
    </view>

    <!-- 任务分类标签栏 -->
    <view class="section-head">
      <text class="section-title">热门标签</text>
      <scroll-view class="tags-scroll" scroll-x="true" show-scrollbar="false">
        <view class="tags">
          <text 
            class="tag" 
            :class="{ active: selectedTag === tag }"
            v-for="tag in taskTags" 
            :key="tag"
            @tap="onTagClick(tag)"
          >{{ tag }}</text>
        </view>
      </scroll-view>
      
      <!-- 点击式筛选组件 -->
      <view class="filter-section">
        <view class="filter-item" 
              :class="{ active: filterParams.sortBy === 'default' }"
              @click="onFilterClick('default')">
          <text class="filter-text">重置筛选</text>
          <text class="filter-arrow" v-if="filterParams.sortBy === 'default'">
            {{ filterParams.sortOrder === 'desc' ? '↓' : '↑' }}
          </text>
        </view>
        
        <view class="filter-item" 
              :class="{ active: filterParams.sortBy === 'created_at' }"
              @click="onFilterClick('created_at')">
          <text class="filter-text">发布时间</text>
          <text class="filter-arrow" v-if="filterParams.sortBy === 'created_at'">
            {{ filterParams.sortOrder === 'desc' ? '↓' : '↑' }}
          </text>
        </view>
        
        <view class="filter-item" 
              :class="{ active: filterParams.sortBy === 'reward' }"
              @click="onFilterClick('reward')">
          <text class="filter-text">奖励金额</text>
          <text class="filter-arrow" v-if="filterParams.sortBy === 'reward'">
            {{ filterParams.sortOrder === 'desc' ? '↓' : '↑' }}
          </text>
        </view>
        
        <view class="filter-item" 
              :class="{ active: filterParams.sortBy === 'participant_count' }"
              @click="onFilterClick('participant_count')">
          <text class="filter-text">参与人数</text>
          <text class="filter-arrow" v-if="filterParams.sortBy === 'participant_count'">
            {{ filterParams.sortOrder === 'desc' ? '↓' : '↑' }}
          </text>
        </view>
      </view>
    </view>

    <!-- 任务列表 -->
    <view class="task-section">
      <text class="section-title">任务推荐</text>
      <text class="section-subtitle">小程序体验，轻松赚赏金</text>
      
      <!-- 加载状态 -->
      <view class="loading" v-if="loading">
        <text>加载中..</text>
      </view>
      
      <!-- 任务网格 -->
      <view class="task-grid" v-else>
        <view class="task-card" v-for="task in tasks" :key="task.id" @click="goToTaskDetail(task)">
          <!-- 任务图片 -->
          <view class="task-image-container" v-if="task.taskImage">
            <image class="task-image" :src="task.taskImage" mode="aspectFill" />
          </view>
          
          <view class="task-content">
            <view class="task-header">
              <image class="task-avatar" :src="task.avatar" />
              <view class="task-meta">
                <text class="task-title">{{ task.title }}</text>
                <text class="task-type">{{ task.type }} | {{ task.platform }}</text>
              </view>
              <text v-if="task.isNew" class="new-badge">新</text>
            </view>
            
            <view class="task-stats">
              <view class="stat-row">
                <text class="stat-label">已赚</text>
                <text class="stat-label">平均用时</text>
                <text class="stat-label">平均审核</text>
              </view>
              <view class="stat-row">
                <text class="stat-number">{{ task.participants }}人</text>
                <text class="stat-number">{{ task.avgTime }}</text>
                <text class="stat-number">{{ task.timeLimit }}</text>
              </view>
            </view>
            
            <view class="task-footer">
              <text class="reward-amount">{{ task.reward }}元</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && tasks.length === 0">
        <text>暂无任务</text>
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
      loading: false,
      searchKeyword: "",
      selectedTag: "全部",
      taskTags: ["全部", "小程序体验", "APP下载", "关注任务", "其他"],
      tasks: [],
      filterParams: {
        page: 1,
        size: 10,
        title: "",
        status: "",
        minReward: "",
        maxReward: "",
        sortBy: "default",
        sortOrder: "desc"
      },
      
      // 排序选项
      sortOptions: [
        { label: "综合排序", value: "default" },
        { label: "发布时间", value: "created_at" },
        { label: "奖励金额", value: "reward" },
        { label: "参与人数", value: "current_participants" },
        { label: "截止时间", value: "deadline" }
      ],
      
      // 排序方向选项
      sortOrderOptions: [
        { value: "desc", label: "降序" },
        { value: "asc", label: "升序" }
      ],
      

    };
  },
  
  onLoad() {
        this.loadTasks()
      },
  
  methods: {
    // 加载任务列表
    async loadTasks(params = {}) {
      try {
        this.loading = true
        
        // 构建请求参数
        const requestParams = {
          page: this.filterParams.page,
          size: this.filterParams.size,
          sortBy: this.filterParams.sortBy,
          sortOrder: this.filterParams.sortOrder,
          ...params
        }
        
        // 添加可选参数
        if (this.filterParams.title) requestParams.title = this.filterParams.title
        if (this.filterParams.status) requestParams.status = this.filterParams.status
        if (this.filterParams.minReward) requestParams.minReward = this.filterParams.minReward
        if (this.filterParams.maxReward) requestParams.maxReward = this.filterParams.maxReward
        
        const response = await request({
          url: '/user/tasks',
          method: 'GET',
          data: requestParams
        })
        
        if (response.data && response.data.records) {
          this.tasks = response.data.records.map(task => ({
            id: task.id,
            title: task.title,
            summary: task.summary,
            reward: task.reward,
            deadline: task.deadline,
            maxParticipants: task.maxParticipants,
            participantCount: task.participantCount,
            adminUsername: task.adminUsername,
            images: task.images,
            isParticipated: task.isParticipated,
            createdAt: task.createdAt,
            // 适配TaskCard组件需要的字段
            type: "任务体验",
            platform: "小程序",
            participants: task.participantCount,
            avgTime: "2分钟",
            timeLimit: "12分钟",
            avatar: this.getRandomAvatar(task.id),
            taskImage: this.getRandomTaskImage(task.id),
            isNew: false
          }))
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
    
    // 标签点击事件（与首页逻辑一致）
    onTagClick(tag) {
      this.selectedTag = tag
      if (tag === '全部') {
        this.loadTasks()
      } else {
        this.loadTasks({ title: tag })
      }
    },
    
    // 搜索输入处理
    onSearchInput() {
      // 防抖处理
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.filterParams.title = this.searchKeyword
        this.filterParams.page = 1
        this.loadTasks()
      }, 500)
    },
    
    // 搜索任务
    searchTasks() {
      this.filterParams.title = this.searchKeyword
      this.filterParams.page = 1
      this.loadTasks()
    },
    
    // 根据任务ID获取随机头像
    getRandomAvatar(taskId) {
      const avatars = ['/static/boy.png', '/static/girl.png']
      // 使用任务ID作为种子，确保同一任务始终显示相同头像
      const index = taskId % avatars.length
      return avatars[index]
    },
    
    // 根据任务ID获取随机任务图片
    getRandomTaskImage(taskId) {
      const taskImages = [
        '/static/task1.jpg',
        '/static/task2.jpg', 
        '/static/task3.jpg',
        '/static/task4.jpg',
        '/static/task5.jpg'
      ]
      // 使用任务ID作为种子，确保同一任务始终显示相同图片
      const index = taskId % taskImages.length
      return taskImages[index]
    },
    
    // 跳转任务详情
    goToTaskDetail(task) {
      uni.navigateTo({ url: `/pages/task-detail/task-detail?id=${task.id}` });
    },
    
    // 点击式筛选
    onFilterClick(sortType) {
      if (this.filterParams.sortBy === sortType) {
        // 如果点击的是当前激活的筛选项，切换排序方向
        this.filterParams.sortOrder = this.filterParams.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        // 如果点击的是新的筛选项，设置为该筛选项并默认降序
        this.filterParams.sortBy = sortType
        this.filterParams.sortOrder = 'desc'
      }
      this.loadTasks()
    }
  },
};
</script>

<style scoped>
page {
  --bg-page: #f5f5f5;
  --text-main: #333333;
  --text-sub: #666666;
  --brand-accent: #FFCE00;
  --brand-bg: #fff8e1;
  --radius-lg: 16rpx;
  --radius-md: 12rpx;
  --radius-sm: 8rpx;
}

.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-section {
  padding: 20rpx 30rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 30rpx;
  color: #666666;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 26rpx;
  color: #333333;
}

.filter-icon {
  font-size: 20rpx;
}

/* 标签筛选器样式（与首页一致） */
.section-head {
  margin: 0 30rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.tags-scroll {
  margin-top: 12rpx;
  white-space: nowrap;
}

.tags {
  display: inline-flex;
  gap: 12rpx;
  padding-right: 20rpx;
}

.tag {
  background: #fffbe6;
  color: #FF6B35;
  border-radius: 12rpx;
  padding: 6rpx 14rpx;
  font-size: 22rpx;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tag.active {
  background: #FF6B35;
  color: #fff;
}

.task-section {
  padding: 20rpx 30rpx 80rpx;
}

.task-section .section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 6rpx;
}

.section-subtitle {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 20rpx;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #666666;
  font-size: 28rpx;
}

.task-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-bottom: 40rpx;
}

.task-card {
  width: calc(50% - 15rpx);
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
  transition: transform 0.2s ease;
}

.task-card:active {
  transform: scale(0.98);
}

.task-image-container {
  width: 100%;
  overflow: hidden;
}

.task-image {
  width: 100%;
  height: 100%;
}

.task-content {
  padding: 20rpx;
}

.task-header {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.task-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-meta {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-type {
  font-size: 20rpx;
  color: #666666;
}

.new-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #FFCE00;
  color: #333;
  font-size: 18rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
}

.task-stats {
  margin-bottom: 20rpx;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 20rpx;
  color: #666666;
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 22rpx;
  color: #333333;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.task-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.reward-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFCE00;
}

.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
  color: #666666;
  font-size: 28rpx;
}

/* 点击式筛选组件样式 */
.filter-section {
  display: flex;
  margin-top: 20rpx;
  gap: 8rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  border-radius: 12rpx;
  background: #fffbe6;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  position: relative;
  min-height: 40rpx;
}

.filter-item:active {
  transform: scale(0.98);
}

.filter-item.active {
  background: #FF6B35;
  color: #fff;
  border-color: #FF6B35;
}

.filter-text {
  font-size: 22rpx;
  font-weight: 500;
  color: #FF6B35;
  transition: color 0.3s ease;
}

.filter-item.active .filter-text {
  color: #fff;
}

.filter-arrow {
  font-size: 18rpx;
  margin-left: 4rpx;
  font-weight: bold;
  color: #fff;
  animation: bounce 0.3s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2rpx);
  }
}

.task-badge {
  background-color: #FFD700;
  color: #333;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.task-badge.hot {
  background-color: #FF5722;
  color: white;
}

.task-badge.new {
  background-color: #4CAF50;
  color: white;
}

.divider-line {
  height: 2rpx;
  background-color: #e5e5e5;
  margin: 20rpx 0;
}

.category-line {
  height: 4rpx;
  background-color: #FFCE00;
  border-radius: 2rpx;
  margin-bottom: 20rpx;
}
</style>

