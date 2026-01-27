<template>
  <view class="container">
     <view class="nav-bar">
      <view class="status-bar"></view>
      <view class="nav-content">
        <view class="nav-left" @tap="goBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">提交任务</text>
      </view>
    </view>
    <view class="content">
    <view class="task-card" v-if="taskInfo">
      <view class="task-header">
        <text class="task-name">{{ taskInfo.title }}</text>
        <text class="task-reward">¥{{ taskInfo.reward }}</text>
      </view>
      <view class="task-tags">
        <text class="tag tag-fast" v-if="taskInfo.fastReview">快速审核</text>
        <text class="tag tag-new" v-if="taskInfo.newUserOnly">新人专享</text>
      </view>
      <view class="task-stats">
        <view class="stat-item">
          <text class="stat-value">{{ taskInfo.avgTime || '5分钟' }}</text>
          <text class="stat-label">人均用时</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ taskInfo.avgReviewTime || '30+分钟' }}</text>
          <text class="stat-label">平均审核</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ taskInfo.participantCount }}单</text>
          <text class="stat-label">已完成数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ taskInfo.timeLimit || '1小时' }}</text>
          <text class="stat-label">做单限制</text>
        </view>
      </view>
    </view>
    <view class="divider"></view>
    <view class="upload-container">
      <view class="upload-box" @click="chooseImage">
        <view v-if="uploadedImages.length === 0" class="upload-placeholder">
          <text class="upload-plus">+</text>
          <text class="upload-text">点击上传截图（最多3张）</text>
        </view>
        <view v-else class="uploaded-images">
          <view class="image-item" v-for="(image, index) in uploadedImages" :key="index">
            <image :src="image.url" class="uploaded-img" mode="aspectFill" @click.stop="previewImage(index)" />
            <view class="delete-icon" @click.stop="deleteImage(index)">×</view>
          </view>
          <view v-if="uploadedImages.length < 3" class="add-more" @click.stop="chooseImage">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>
    </view>
    
  <view class="shuoming">补充说明<text class="required">（选填）</text></view>
    <!-- 提交内容输入框 -->
    <view class="input-container">
      <textarea 
        class="textarea-field" 
        placeholder="请输入任务完成说明..." 
        placeholder-style="color: #999" 
        v-model="submitContent"
        maxlength="500"
      />
      <text class="char-count">{{ submitContent.length }}/500</text>
    </view>
    
    <!-- 提交按钮 -->
    <view class="submit-container">
      <button class="submit-button" @click="submitTask" :disabled="!canSubmit">
        {{ loading ? '提交中...' : '提交审核' }}
      </button>
    </view>
    </view>
  </view>
</template>

<script>
import { request } from '@/utils/request'

const BASE_URL = 'http://localhost:8080'

export default {
  data() {
    return {
      taskId: null,
      taskInfo: null,
      uploadedImages: [],
      submitContent: '',
      loading: false
    }
  },
  computed: {
    canSubmit() {
      return this.submitContent.trim() && !this.loading
    }
  },
  onLoad(options) {
    if (options.taskId) {
      this.taskId = options.taskId
      this.loadTaskDetail()
    }
  },
  methods: {
    async loadTaskDetail() {
      try {
        uni.showLoading({
          title: '加载中...'
        })
        
        const response = await request({
          url: `/user/tasks/${this.taskId}`,
          method: 'GET'
        })
        
        uni.hideLoading()
        
        if (response.code === 200 && response.data?.taskInfo) {
          this.taskInfo = response.data.taskInfo
        } else {
          uni.showToast({
            title: '获取任务详情失败',
            icon: 'error'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('获取任务详情失败:', error)
        uni.showToast({
          title: '获取任务详情失败',
          icon: 'error'
        })
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    chooseImage() {
      if (this.uploadedImages.length >= 3) {
        uni.showToast({
          title: '最多只能上传3张图片',
          icon: 'none'
        })
        return
      }
      
      uni.chooseImage({
        count: 3 - this.uploadedImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 上传选中的图片
          this.uploadImages(res.tempFilePaths)
        }
      })
    },
    
    async uploadImages(tempFilePaths) {
      for (let i = 0; i < tempFilePaths.length; i++) {
        const filePath = tempFilePaths[i]
        try {
          uni.showLoading({
            title: `上传中 ${i + 1}/${tempFilePaths.length}`
          })
          
          const uploadResult = await this.uploadSingleImage(filePath)
          if (uploadResult) {
            this.uploadedImages.push({
              url: filePath, // 本地预览路径
              relativePath: uploadResult.relativePath // 服务器路径
            })
          }
        } catch (error) {
          console.error('上传图片失败:', error)
          uni.showToast({
            title: '图片上传失败',
            icon: 'error'
          })
        }
      }
      uni.hideLoading()
    },
    
    uploadSingleImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `${BASE_URL}/api/file/upload?category=common`,
          filePath: filePath,
          name: 'file',
          header: {
            'Authorization': uni.getStorageSync('token') || ''
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data)
              if (data.code === 200 && data.data) {
                resolve(data.data)
              } else {
                reject(new Error(data.message || '上传失败'))
              }
            } catch (e) {
              reject(new Error('解析响应失败'))
            }
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    },
    
    previewImage(index) {
      const urls = this.uploadedImages.map(img => img.url)
      uni.previewImage({
        urls: urls,
        current: urls[index]
      })
    },
    
    deleteImage(index) {
      this.uploadedImages.splice(index, 1)
    },
    
    async submitTask() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请填写任务完成说明',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        uni.showLoading({
          title: '提交中...'
        })
        
        // 准备提交数据
        const submitData = {
          submitContent: this.submitContent.trim(),
          submissionImages: this.uploadedImages.map(img => img.relativePath)
        }
        
        const response = await request({
          url: `/user/tasks/${this.taskId}/submit`,
          method: 'POST',
          data: submitData
        })
        
        uni.hideLoading()
        this.loading = false
        
        if (response.code === 200 && response.data?.success) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          })
          
          // 跳转到提交成功页面
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/submit-success/submit-success'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '提交失败',
            icon: 'error'
          })
        }
      } catch (error) {
        uni.hideLoading()
        this.loading = false
        console.error('提交任务失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'error'
        })
      }
    }
  }
}
</script>

<style scoped>
.container {
  /* background: linear-gradient(to bottom, #FFD700 0%, #FFD700 280rpx, #ffffff 280rpx); */
  background: linear-gradient(180deg, #FFDD00 -2%, #FFFFFF 50%);
  overflow: hidden;
}

/* 自定义导航栏 */
.header {
  /* background: #FFD700; */
  padding-top: var(--status-bar-height, 44px);
}

/* .nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  position: relative;
} */

.nav-left {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 60rpx;
}

.back-icon {
  font-size: 48rpx;
  color: #333;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.dots-icon {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.record-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #333;
}

.content {
  background: white;
  margin: 30rpx;
  border-radius: 20rpx;
}

/* 任务卡片 */
.task-card {
  margin: 30rpx;
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  /* box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1); */
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.task-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
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


.task-reward {
  font-size: 60rpx;
  font-weight: bold;
  color: #FF6B35;
}

.task-tags {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.tag {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
}

.tag-fast {
  background: #e8f4fd;
  color: #1890ff;
}

.tag-new {
  background: #fff2e8;
  color: #fa8c16;
}

.task-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  flex: 1;
}
.stat-divider {
  width: 1px;
  height: 80rpx;
  background: #d9d9d9;
}

.stat-value {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999;
}
.divider {
  height: 2rpx;
  background-color: #e5e5e5;
  margin: 20rpx 20rpx 20rpx 20rpx;
}

.upload-container {
  margin: 0 30rpx 30rpx 30rpx;
}

.upload-box {
  /* background: white; */
  background: rgba(216, 216, 216, 0.2);
  border-radius: 16rpx;
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  /* border: 4rpx dashed #d9d9d9; */
}

.upload-placeholder {
  text-align: center;
  padding: 60rpx;
}

.upload-plus {
  display: block;
  font-size: 120rpx;
  color: #d9d9d9;
  margin-bottom: 20rpx;
  font-weight: 300;
}

.upload-text {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 20rpx;
  width: 100%;
  justify-content: flex-start;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.uploaded-img {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.delete-icon {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.add-more {
  width: 160rpx;
  height: 160rpx;
  border: 4rpx dashed #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 60rpx;
  color: #d9d9d9;
  font-weight: 300;
}

/* 输入框 */
.input-container {
  margin: 0 30rpx 30rpx 30rpx;
  position: relative;
}
.shuoming {
  margin-left: 30rpx;
  font-size: 38rpx;
  font-weight: bold;
  color: #3D3D3D;
  margin-bottom: 20rpx;
}
.required {
  /* color: #FF4D4F; */
  font-size: 28rpx;
}

.input-field {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  font-size: 28rpx;
  border: none;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.textarea-field {
  /* background: white; */
  background: rgba(216, 216, 216, 0.2);
  border-radius: 16rpx;
  padding: 30rpx;
  font-size: 28rpx;
  border: none;
  /* box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05); */
  min-height: 200rpx;
  width: 100%;
  box-sizing: border-box;
}

.char-count {
  position: absolute;
  bottom: 15rpx;
  right: 20rpx;
  font-size: 24rpx;
  color: #999;
}

/* 提交按钮 */
.submit-container {
  margin: 60rpx 30rpx 30rpx 30rpx;
}

.submit-button {
  background: #FFDB46;
  color: #333;
  border: none;
  height: 50px;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin: 0 40rpx;
}

.submit-button:disabled {
  background: #ccc;
  color: #999;
}
</style>
