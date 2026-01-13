<template>
  <view class="container">
    <view class="content">
      <view class="avatar-section">
        <text class="section-title">更换头像</text>
        <view class="avatar-upload" @click="uploadAvatar">
          <image class="avatar" :src="getAvatarUrl(userInfo.avatar)" />
          <view class="upload-overlay">
            <text class="upload-text">点击更换</text>
          </view>
        </view>
      </view>
      <view class="form-section">
        <view class="form-group">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="userInfo.nickname" placeholder="请输入昵称" maxlength="20" />
        </view>
        <button class="save-btn" @click="saveInfo">点击保存</button>
      </view>
    </view>
  </view>
</template>

<script>
import { get, post, BASE_URL } from '@/utils/request.js'

export default {
  data() {
    return {
      userInfo: {
        nickname: '',
        avatar: ''
      }
    }
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      try {
        const response = await get('/api/user/info')
        if (response.code === 200) {
          this.userInfo = {
            nickname: response.data.nickname || '',
            avatar: response.data.avatar || ''
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    },
    getAvatarUrl(avatar) {
      if (!avatar) return '/static/boy.png'  // 使用boy.png作为默认头像
      return `${BASE_URL}/api/file/proxy/${avatar}`
    },
    goBack() {
      uni.navigateBack()
    },
    uploadAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadAvatarFile(tempFilePath)
        }
      })
    },
    
    async uploadAvatarFile(filePath) {
      try {
        uni.showLoading({
          title: '上传中...'
        })
        
        const uploadResult = await this.uploadSingleFile(filePath)
        if (uploadResult && uploadResult.relativePath) {
          // 更新头像路径
          this.userInfo.avatar = uploadResult.relativePath
          
          // 自动保存头像
          await this.updateAvatarInfo()
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        uni.showToast({
          title: '上传头像失败',
          icon: 'error'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    uploadSingleFile(filePath) {
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
    
    async updateAvatarInfo() {
      try {
        const params = {
          nickname: this.userInfo.nickname,
          avatar: this.userInfo.avatar
        }

        const response = await post('/api/user/update-info', params)
        
        if (response.code === 200) {
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.message || '头像更新失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新头像失败:', error)
        uni.showToast({
          title: '头像更新失败',
          icon: 'none'
        })
      }
    },
    async saveInfo() {
      if (!this.userInfo.nickname.trim()) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }

      try {
        const params = {
          nickname: this.userInfo.nickname,
          avatar: this.userInfo.avatar
        }

        const response = await post('/api/user/update-info', params)
        
        if (response.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存用户信息失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}



.content {
  padding: 30rpx;
}

.avatar-section {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.avatar-upload {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #f0f0f0;
}

.upload-overlay {
  color: #DD9B00;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.form-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
}

.form-group {
  margin-bottom: 40rpx;
  position: relative;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 15rpx;
}

.form-input {
  padding: 25rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 15rpx;
  font-size: 28rpx;
  background: #f8f8f8;
}

.form-input:disabled {
  background: #f0f0f0;
  color: #999;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background-color: #FFB300;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 60rpx;
}

.save-btn:disabled {
  background-color: #f0f0f0;
  color: #999;
}
</style>