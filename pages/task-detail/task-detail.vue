<template>
  <view class="container">
    <view class="content">
      <!-- 任务基本信息卡片 -->
      <view class="task-info-card">
        <view class="task-header">
          <view class="task-basic">
            <text class="task-name">{{ taskInfo.title }}</text>
            <text class="task-price">¥{{ taskInfo.reward }}</text>
          </view>
          <view class="status-badge" :class="getStatusClass(taskInfo.status)">
            <text class="status-text">{{ taskInfo.statusDescription || getStatusText(taskInfo.status) }}</text>
          </view>
        </view>

        <view class="task-meta">
          <text class="task-time">截止时间：{{ taskInfo.deadline }}</text>
          <text class="task-participants">参与人数：{{ taskInfo.participantCount }}/{{ taskInfo.maxParticipants }}</text>
        </view>

        <view class="divider"></view>

        <view class="task-description">
          <text class="desc-title">任务内容：</text>
          <text class="desc-text">{{ taskInfo.description }}</text>
          <view v-if="taskInfo.requirements" class="requirements-section">
            <text class="desc-title">任务要求：</text>
            <text class="desc-text">{{ taskInfo.requirements }}</text>
          </view>
        </view>

        <!-- 任务图片展示 -->
        <view v-if="taskInfo.images && taskInfo.images.length > 0" class="task-images">
          <text class="desc-title">任务图片：</text>
          <view class="images-grid">
            <image 
              v-for="(image, index) in taskInfo.images" 
              :key="index" 
              :src="getImageUrl(image)" 
              mode="aspectFill"
              class="task-image" 
              @tap="previewImage(getImageUrl(image), taskInfo.images.map(img => getImageUrl(img)))" 
            />
          </view>
        </view>

        <!-- 管理员信息 -->
        <view v-if="adminInfo.username" class="admin-info">
          <text class="desc-title">发布者：</text>
          <text class="desc-text">系统管理员</text>
        </view>
      </view>

      <!-- 用户未参与时显示参与按钮 -->
      <view v-if="!isParticipated" class="action-section">
        <view class="section-card">
          <text class="section-title">任务说明</text>
          <text class="task-note">请仔细阅读任务要求，确保能够完成后再参与任务。</text>
        </view>
      </view>

      <!-- 用户已参与时显示提交详情 -->
      <view v-if="isParticipated && submissionDetail" class="submission-section">
        <view class="section-card">
          <text class="section-title">参与详情</text>
          <view class="submission-info">
            <text class="info-item">参与时间：{{ submissionDetail.participatedAt || '未记录' }}</text>
            <text class="info-item">提交时间：{{ submissionDetail.submitTime || '未提交' }}</text>
            <text class="info-item">审核时间：{{ submissionDetail.reviewTime || '未审核' }}</text>
            <text class="info-item">状态：{{ submissionDetail.statusDescription || '待处理' }}</text>
          </view>
          
          <!-- 提交内容 -->
          <view v-if="submissionDetail.submissionContent" class="submission-content">
            <text class="desc-title">提交内容：</text>
            <text class="desc-text">{{ submissionDetail.submissionContent }}</text>
          </view>
          
          <!-- 提交图片 -->
          <view v-if="submissionDetail.submissionImages" class="submission-images">
            <text class="desc-title">提交图片：</text>
            <view class="images-grid">
              <image 
                v-for="(image, index) in getSubmissionImages()" 
                :key="index" 
                :src="getImageUrl(image)" 
                mode="aspectFill"
                class="submitted-image" 
                @tap="previewImage(getImageUrl(image), getSubmissionImages().map(img => getImageUrl(img)))" 
              />
            </view>
          </view>
          
          <!-- 审核意见 -->
          <view v-if="submissionDetail.reviewComment" class="review-comment">
            <text class="desc-title">审核意见：</text>
            <text class="desc-text">{{ submissionDetail.reviewComment }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view v-if="!isParticipated" class="bottom-button">
      <view class="submit-btn" @tap="participateTask">
        <text class="btn-text">参与任务</text>
      </view>
    </view>
    
    <view v-else-if="isParticipated && (!submissionDetail || !submissionDetail.submitTime)" class="bottom-button">
      <view class="submit-btn" @tap="submitTask">
        <text class="btn-text">提交任务</text>
      </view>
    </view>
  </view>
</template>

<script>
import { request , BASE_URL} from '@/utils/request'


export default {
  data() {
    return {
      taskId: null,
      taskInfo: {
        id: null,
        title: '',
        description: '',
        reward: 0,
        status: '',
        statusDescription: '',
        deadline: '',
        requirements: '',
        images: [],
        maxParticipants: 0,
        participantCount: 0,
        adminId: null,
        createdAt: '',
        updatedAt: ''
      },
      adminInfo: {
        id: null,
        username: '',
        email: '',
        realName: '',
        avatar: ''
      },
      isParticipated: false,
      participantStatus: null,
      participatedAt: null,
      submitTime: null,
      reviewTime: null,
      reviewNote: null,
      submissionDetail: null,
      loading: false
    }
  },
  onLoad(options) {
    if (options.id) {
      this.taskId = options.id
      this.loadTaskDetail(options.id)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async loadTaskDetail(id) {
      try {
        this.loading = true
        
        // 获取任务详情
        const taskResponse = await request({
          url: `/user/tasks/${id}`,
          method: 'GET'
        })
        
        if (taskResponse.success) {
          const { taskInfo, adminInfo, isParticipated, participantStatus, participatedAt, submitTime, reviewTime, reviewNote } = taskResponse.data
          
          this.taskInfo = taskInfo
          this.adminInfo = adminInfo
          this.isParticipated = isParticipated
          this.participantStatus = participantStatus
          this.participatedAt = participatedAt
          this.submitTime = submitTime
          this.reviewTime = reviewTime
          this.reviewNote = reviewNote
          
          // 处理图片数组
          if (taskInfo.images) {
            try {
              this.taskInfo.images = JSON.parse(taskInfo.images)
            } catch (e) {
              this.taskInfo.images = []
            }
          }
          
          // 检查用户参与状态
          await this.checkParticipationStatus(id)
        }
      } catch (error) {
        console.error('加载任务详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async checkParticipationStatus(taskId) {
      try {
        const response = await request({
          url: `/user/tasks/${taskId}/participated`,
          method: 'GET'
        })
        
        if (response.success) {
          this.isParticipated = response.data
          
          // 如果用户已参与，获取提交详情
          if (response.data) {
            await this.getSubmissionDetail(taskId)
          }
        }
      } catch (error) {
        console.error('检查参与状态失败:', error)
      }
    },
    
    async getSubmissionDetail(taskId) {
      try {
        const response = await request({
          url: `/user/tasks/${taskId}/submission-detail`,
          method: 'GET'
        })
        
        if (response.success) {
          this.submissionDetail = response.data
        }
      } catch (error) {
        console.error('获取提交详情失败:', error)
      }
    },
    
    getImageUrl(imagePath) {
      if (!imagePath) return ''
      // 使用BASE_URL + /api/file/proxy/ + 图片路径的格式
      return `${BASE_URL}/api/file/proxy/${imagePath}`
    },
    getStatusClass(status) {
      const classMap = {
        'pending': 'status-pending',
        'reviewing': 'status-reviewing',
        'completed': 'status-completed',
        'rejected': 'status-rejected'
      }
      return classMap[status] || 'status-default'
    },
    getStatusText(status) {
      const textMap = {
        'PUBLISHED': '已发布',
        'DRAFT': '草稿',
        'CLOSED': '已关闭',
        'COMPLETED': '已完成'
      }
      return textMap[status] || status
    },
    getTimeLabel(status) {
      const labelMap = {
        'PUBLISHED': '发布时间',
        'DRAFT': '创建时间',
        'CLOSED': '关闭时间',
        'COMPLETED': '完成时间'
      }
      return labelMap[status] || '时间'
    },
    getSubmissionImages() {
      if (!this.submissionDetail?.submissionImages) return []
      try {
        return JSON.parse(this.submissionDetail.submissionImages)
      } catch (e) {
        return []
      }
    },
    async participateTask() {
      // 参与任务逻辑
      uni.showModal({
        title: '确认参与',
        content: '确定要参与这个任务吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '参与中...'
              })
              
              // 调用参与任务的API
              const response = await request({
                url: `/user/tasks/${this.taskId}/accept`,
                method: 'POST'
              })
              
              uni.hideLoading()
              
              if (response.code === 200 && response.data?.success) {
                uni.showToast({
                  title: '任务接取成功',
                  icon: 'success'
                })
                
                // 参与成功后跳转到提交任务页面
                setTimeout(() => {
                  uni.navigateTo({
                    url: `/pages/submit-task/submit-task?taskId=${this.taskId}`
                  })
                }, 1500)
              } else {
                uni.showToast({
                  title: response.message || '参与失败',
                  icon: 'error'
                })
              }
            } catch (error) {
              uni.hideLoading()
              console.error('参与任务失败:', error)
              uni.showToast({
                title: '参与失败，请重试',
                icon: 'error'
              })
            }
          }
        }
      })
    },
    submitTask() {
      uni.navigateTo({
        url: '/pages/submit-task/submit-task?taskId=' + (this.taskId || '')
      })
    },
    previewImage(current, urls) {
      uni.previewImage({
        current: current,
        urls: urls
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #FFDD00;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.nav-bar {
  background: #FFDD00;
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

/* 内容区域 */
.content {
  flex: 1;
  padding: 20rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 任务信息卡片 */
.task-info-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.task-basic {
  flex: 1;
}

.task-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.task-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B35;
  display: block;
}

/* 状态标签 */
.status-badge {
  background-color: #FFD700;
  color: #333;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.status-badge.completed {
  background-color: #4CAF50;
  color: white;
}

.status-badge.expired {
  background-color: #FF5722;
  color: white;
}

.divider {
  height: 2rpx;
  background-color: #e5e5e5;
  margin: 20rpx 0;
}

.section-divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 30rpx 0;
}

.progress-bar {
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #FFD700;
  transition: width 0.3s ease;
}

.status-rejected {
  background: #FF5900;
}

.status-rejected .status-text {
  color: white;
}

.status-pending {
  background: #008CFF;
}

.status-pending .status-text {
  color: white;
}

.status-reviewing {
  background: #FFBB00;
}

.status-reviewing .status-text {
  color: #333;
}

.status-completed {
  background: #2DC900;
}

.status-completed .status-text {
  color: white;
}

.task-meta {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.task-time,
.task-participants {
  font-size: 26rpx;
  color: #666;
}

.requirements-section {
  margin-top: 15rpx;
}

.task-images {
  margin-top: 20rpx;
}

.task-image {
  width: 100%;
  height: 300rpx;
  border-radius: 15rpx;
  margin-bottom: 15rpx;
}

.admin-info {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f0f0;
}

.action-section,
.submission-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.task-note {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.submission-info {
  margin-bottom: 20rpx;
}

.info-item {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 8rpx;
}

.submission-content,
.submission-images,
.review-comment {
  margin-top: 20rpx;
}

.divider {
  height: 2rpx;
  background: #f0f0f0;
  margin: 20rpx 0;
}

.task-description {}

.desc-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 10rpx;
}

.desc-note {
  font-size: 24rpx;
  color: #666;
}

/* 区域卡片 */
.section-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

/* 操作步骤 */
.step-list {
  margin-bottom: 20rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15rpx;
}

.step-number {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  margin-right: 10rpx;
  min-width: 30rpx;
}

.step-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

/* 示例图片 */
.example-image {
  margin: 20rpx 0;
}

.demo-image {
  width: 100%;
  height: 400rpx;
  border-radius: 15rpx;
}

/* 注意事项 */
.notice-section {
  margin-top: 30rpx;
}

.notice-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.notice-list {}

.notice-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 8rpx;
}

/* 任务规则 */
.rules-list {}

.rule-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 8rpx;
}

/* 提交记录 */
.images-grid {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.submitted-image {
  width: 100%;
  height: 400rpx;
  border-radius: 15rpx;
}

/* 审核结果 */
.review-result {}

.result-text {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.reason-text {
  font-size: 26rpx;
  color: #FF5900;
  font-weight: bold;
  display: block;
  margin-bottom: 15rpx;
}

.reject-details {
  margin-bottom: 15rpx;
}

.detail-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 8rpx;
}

.contact-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.status-info {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

/* 底部按钮 */
.bottom-button {
  padding: 30rpx;
  background: #FFDD00;
}

.submit-btn {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 25rpx;
  padding: 25rpx;
  text-align: center;
  box-shadow: 0 4rpx 15rpx rgba(255, 215, 0, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 215, 0, 0.4);
}

.btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.steps-section,
.submit-records-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
