<template>
  <view class="container">
    <!-- 顶部标签栏 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentType === 1 }"
        @click="switchTab(1)"
      >
        <text>推广攻略</text>
        <view class="line" v-if="currentType === 1"></view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentType === 2 }"
        @click="switchTab(2)"
      >
        <text>推广案例</text>
        <view class="line" v-if="currentType === 2"></view>
      </view>
    </view>
    
    <!-- 列表内容 -->
    <view class="list-container">
      <view 
        class="article-item" 
        v-for="(item, index) in list" 
        :key="index"
        @click="goToDetail(item.id)"
      >
        <view class="article-info">
          <text class="article-title">{{ item.title }}</text>
          <text class="article-time">{{ item.createdAt }}</text>
        </view>
        <image 
          v-if="item.coverImage" 
          :src="getImageUrl(item.coverImage)" 
          class="article-cover" 
          mode="aspectFill"
        ></image>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="list.length === 0 && !loading">
        <text>暂无相关内容</text>
      </view>
    </view>
  </view>
</template>

<script>
import { get, BASE_URL } from '@/utils/request.js'

export default {
  data() {
    return {
      currentType: 1, // 1: 攻略, 2: 案例
      list: [],
      loading: false
    }
  },
  onLoad(options) {
    if (options.type) {
      this.currentType = parseInt(options.type)
    }
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const res = await get('/api/article/list', { type: this.currentType })
        if (res.code === 200) {
          this.list = res.data || []
        }
      } catch (error) {
        console.error('加载列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    switchTab(type) {
      if (this.currentType === type) return
      this.currentType = type
      this.loadList()
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/article-detail/article-detail?id=${id}`
      })
    },
    getImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) return url
      return `${BASE_URL}/api/file/proxy/${url}`
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.tabs {
  display: flex;
  background-color: #fff;
  height: 88rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #333;
  font-weight: bold;
}

.line {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 4rpx;
  background-color: #FFD700;
  border-radius: 2rpx;
}

.list-container {
  padding-top: 108rpx; /* tabs height + margin */
  padding-left: 20rpx;
  padding-right: 20rpx;
  padding-bottom: 20rpx;
}

.article-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
}

.article-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-right: 20rpx;
}

.article-title {
  font-size: 30rpx;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.article-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}

.article-cover {
  width: 200rpx;
  height: 140rpx;
  border-radius: 8rpx;
  background-color: #eee;
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}
</style>
