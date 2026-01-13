<template>
  <view class="container">
    <view class="header">
      <text class="title">{{ article.title }}</text>
      <view class="meta">
        <text class="date">{{ article.createdAt }}</text>
        <text class="type" v-if="article.type === 1">推广攻略</text>
        <text class="type" v-else-if="article.type === 2">推广案例</text>
      </view>
    </view>
    
    <view class="content">
      <rich-text :nodes="processedContent"></rich-text>
    </view>
  </view>
</template>

<script>
import { get, BASE_URL } from '@/utils/request.js'

export default {
  data() {
    return {
      id: null,
      article: {},
      processedContent: ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.loadArticle()
    }
  },
  methods: {
    async loadArticle() {
      try {
        const res = await get(`/api/article/detail/${this.id}`)
        if (res.code === 200) {
          this.article = res.data
          this.processContent(res.data.content)
        }
      } catch (error) {
        console.error('加载文章详情失败:', error)
      }
    },
    processContent(content) {
      if (!content) {
        this.processedContent = ''
        return
      }
      
      // 处理图片URL
      // 1. 替换相对路径
      // 2. 确保 style max-width: 100%
      
      let newContent = content.replace(/<img[^>]*>/gi, (match) => {
        // 处理 src
        let newMatch = match.replace(/src="([^"]*)"/i, (srcMatch, src) => {
          if (!src.startsWith('http') && !src.startsWith('data:')) {
            // 如果是相对路径，添加前缀
            // 注意：如果 admin 存的是 /api/file/proxy/... 还是 article/...
            // 假设 admin 存的是绝对路径，这里不需要动。
            // 但如果 admin 存的是相对路径，需要添加 BASE_URL + '/api/file/proxy/'
            // 我们之前的逻辑是 admin 存绝对路径。
            // 但为了保险，如果发现不带 http，且不是 data:image，就认为是相对路径
             return `src="${BASE_URL}/api/file/proxy/${src}"`
          }
          return srcMatch
        })
        
        // 添加 style="max-width:100%" 以防止图片溢出
        if (!newMatch.includes('style=')) {
          newMatch = newMatch.replace('<img', '<img style="max-width:100%;height:auto;"')
        } else {
          newMatch = newMatch.replace(/style="([^"]*)"/i, (styleMatch, style) => {
            return `style="${style};max-width:100%;height:auto;"`
          })
        }
        return newMatch
      })
      
      this.processedContent = newContent
    }
  }
}
</script>

<style scoped>
.container {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;
}

.header {
  margin-bottom: 40rpx;
  border-bottom: 1px solid #eee;
  padding-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  display: block;
  margin-bottom: 20rpx;
}

.meta {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.date {
  margin-right: 20rpx;
}

.type {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.content {
  font-size: 30rpx;
  line-height: 1.8;
  color: #333;
}
</style>
