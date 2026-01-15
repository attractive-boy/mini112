<template>
  <view class="container">
    <scroll-view class="scroll" scroll-y>
      <view class="hero-section">
        <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" :circular="true" v-if="banners.length > 0">
          <swiper-item v-for="(banner, index) in banners" :key="banner.id">
            <image class="banner-image" :src="banner.imageUrl" mode="aspectFill" @tap="onBannerClick(banner)"></image>
          </swiper-item>
        </swiper>
        <image v-else class="hero-banner" src="/static/banner.svg" mode="widthFix"></image>

        <view class="feature-card">
          <view class="quick-grid">
            <view
              class="quick-item"
              v-for="(item, index) in shortcuts"
              :key="item.path"
              @tap="goTo(item.path)"
            >
              <image class="quick-icon-img" :src="item.icon" mode="aspectFit"></image>
              <text class="quick-label">{{ item.label }}</text>
            </view>
          </view>

          <view class="news-section" v-if="notices.length > 0">
            <view class="news-card">
              <view class="news-header">
                <view class="news-title-container">
                  <text class="news-title">公告</text>
                </view>
                <!-- <view class="news-divider"></view> -->
                <swiper class="news-swiper" :vertical="true" :autoplay="true" :interval="3000" :duration="500" :circular="true">
                  <swiper-item v-for="notice in notices" :key="notice.id" @tap="toNotice(notice)">
                    <text class="news-content">{{ notice.title }}</text>
                  </swiper-item>
                </swiper>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <!-- <text class="section-title">热门任务</text> -->
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
        </view>
        <view class="task-list">
          <view
            class="task-card"
            v-for="(task, index) in tasks"
            :key="task.id"
            @tap="goTask(task)"
          >
            <image class="task-avatar" :src="getRandomAvatar(task.id)" mode="aspectFill" />
            <view class="task-info">
              <text class="task-title">{{ task.title }}</text>
              <text class="task-desc">{{ task.summary }}</text>
              <view class="task-meta">
                <text class="meta-info"><text style="color:#EC3E0E">{{ task.participantCount }}</text>人已参与</text>
                <text class="meta-info">截至{{ task.deadline }}</text>
              </view>
            </view>
           
             <view class="reward-container">
               <text class="task-icon"></text>
               <text class="task-reward">{{ task.reward }}</text>
             </view>
            
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { get, BASE_URL } from '@/utils/request.js'

export default {
  components: {},
  data() {
    return {
      banners: [], // 轮播图数据
      notices: [], // 公告数据
      selectedTag: '热门推荐', // 当前选中的标签
      shortcuts: [
        {
          label: "新人福利",
          path: "pages/newcomer-rewards/newcomer-rewards",
          type: "new",
          icon: "/static/1.png"
        },
        { 
          label: "任务大厅", 
          path: "pages/task-hall/task-hall", 
          type: "task",
          icon: "/static/2.png"
        },
        {
          label: "推广奖励",
          path: "pages/invitation/invitation",
          type: "promo",
          icon: "/static/3.png"
        },
        {
          label: "每日福利",
          path: "pages/daily-rewards/daily-rewards",
          type: "daily",
          icon: "/static/4.png"
        },
      ],
      taskTags: ["热门推荐", "小程序体验", "抖音相关", "账号互助", "认证绑卡"],
      tasks: []
    };
  },
  async onLoad() {
    await this.loadBanners()
    await this.loadNotices()
    await this.loadTasks()
  },
  methods: {
    // 加载轮播图数据
    async loadBanners() {
      try {
        const response = await get('/api/banner/list')
        if (response && response.code === 200) {
          this.banners = (response.data || []).map(banner => ({
            ...banner,
            imageUrl: this.getImageUrl(banner.imageUrl)
          }))
        }
      } catch (error) {
        console.error('加载轮播图失败:', error)
      }
    },
    // 处理图片URL
    getImageUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) return url
      return `${BASE_URL}/api/file/proxy/${url}`
    },
    onBannerClick(banner) {
      if (banner.linkUrl) {
        if (banner.linkUrl.startsWith('http')) {
           // 外部链接可以使用 web-view，这里暂不处理
           console.log('External link:', banner.linkUrl);
           return;
        }
        uni.navigateTo({ url: banner.linkUrl }).catch(() => {
            uni.switchTab({ url: banner.linkUrl });
        });
      }
    },
    // 加载公告数据
    async loadNotices() {
      try {
        const response = await get('/api/announcement/latest', { limit: 3 })
        if (response && response.code === 200) {
          this.notices = response.data || []
        }
      } catch (error) {
        console.error('加载公告失败:', error)
      }
    },
    // 加载任务列表
    async loadTasks(params = {}) {
      try {
        const defaultParams = {
          page: 1,
          size: 10,
          sortBy: 'created_at',
          sortOrder: 'desc',
          ...params
        }
        const response = await get('/user/tasks', defaultParams)
        if (response && response.code === 200) {
          this.tasks = response.data?.records || []
        }
      } catch (error) {
        console.error('加载任务失败:', error)
      }
    },
    // 标签点击事件
    onTagClick(tag) {
      this.selectedTag = tag
      if (tag === '热门推荐') {
        this.loadTasks()
      } else {
        this.loadTasks({ title: tag })
      }
    },
    goTo(path) {
      const tabPages = new Set([
        "/pages/task-hall/task-hall",
        "/pages/cooperation/cooperation",
        "/pages/profile/profile",
        "/pages/home/home",
      ]);
      const url = path.startsWith("/") ? path : "/" + path;
      if (tabPages.has(url)) {
        uni.switchTab({ url });
      } else {
        uni.navigateTo({ url });
      }
    },
    toNotice(notice) {
      const url = notice ? `/pages/system-notice/system-notice?id=${notice.id}` : "/pages/system-notice/system-notice"
      uni.navigateTo({ url });
    },
    goTask(task) {
      uni.navigateTo({
        url: `/pages/task-detail/task-detail?id=${task.id || ""}`,
      });
    },
    // 根据任务ID获取随机头像
    getRandomAvatar(taskId) {
      const avatars = ['/static/boy.png', '/static/girl.png']
      // 使用任务ID作为种子，确保同一任务始终显示相同头像
      const index = taskId % avatars.length
      return avatars[index]
    },
  },
};
</script>

<style scoped>
/* 定义CSS变量 */
page {
  --bg-page: #fff;
  --text-main: #333333;
  --text-sub: #666666;
  --brand-accent: #FF6B35;
  --brand-bg: #fffbe6;
  --radius-lg: 16rpx;
  --radius-md: 12rpx;
}

.container {
  min-height: 100vh;
  background: #fff;
}

.scroll {
  height: 100vh;
}

.hero-section {
  /* margin: 20rpx 30rpx 0; */
}

.hero-banner {
  width: 100%;
  border-radius: 16rpx;
  z-index: 1;
}

.banner-swiper {
  width: 100%;
  height: 400rpx;
  /* border-radius: 16rpx; */
  overflow: hidden;
  z-index: 1;
}

.banner-image {
  width: 100%;
  height: 100%;
  /* border-radius: 16rpx; */
}
.reward-container{
  display: flex;
  align-items: center;
}
.task-icon {
  display: block;
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
  background-image: url('/static/coin.png');
  background-size: 100% 100%;
}

.feature-card {
  position: relative;
  top: 50px;
  z-index: 2;
  margin: -250rpx 50rpx 30rpx; /* 减少负边距 */
  background: #fff;
  border-radius: 32rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 20rpx 36rpx rgba(255, 170, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 将Grid布局改为Flex布局 */
.quick-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.quick-item {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  /* box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06); */
}

.quick-icon-img {
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto 12rpx;
  display: block;
  transform: scale(2); /* 内容放大20%，宽高不变 */
}

.quick-label {
  font-size: 24rpx;
  color: #3D3D3D;
  display: block;
}

.news-section {
  margin:  0;
}

.news-card {
  /* background: #fff; */
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  /* 水平居中 */
  /* align-items: center; */
  /* box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06); */
  background-color: rgba(255, 164, 0, 0.2);
  height: 20rpx;
}

.news-header {
  display: flex;
  position: relative;
  top: -10rpx;
  align-items: center;
  gap: 20rpx;
}

.news-title-container {
  display: flex;
  align-items: baseline;
  gap: 0rpx;
  flex-shrink: 0;
}

.news-title {
  font-size: 25rpx;
  font-weight: 700;
  color: #fff;
  background: #FF6B35;
  /* padding: 4rpx 16rpx; */
  transform: skewX(-12deg);
  display: inline-block;
  border-radius: 8rpx;
}

.news-subtitle {
  font-size: 24rpx;
  font-weight: 500;
  color: #666666;
}

.news-divider {
  width: 2rpx;
  height: 32rpx;
  background: #FF6B35;
  flex-shrink: 0;
}

.news-swiper {
  flex: 1;
  height: 40rpx;
}

.news-content {
  font-size: 24rpx;
  color: #3D3D3D;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 40rpx; /* 替换position: relative; top: -3px; */
}

.section {
  margin: 90rpx 10rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
}

.section-head {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.tags-scroll {
  margin-top: 12rpx;
  white-space: nowrap;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.tags-scroll::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.tags {
  display: inline-flex;
  gap: 12rpx;
  padding-right: 20rpx;
}

.tag {
  background: none;
  color: rgba(61,61,61,0.8);
  border-radius: 12rpx;
  padding: 0 14rpx 0; /* 去掉底部 padding，文字贴底 */
  font-size: 30rpx;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.3s ease;
  line-height: 1; /* 行高设为 1，确保文字紧贴底部 */
}

.tag.active {
  background: none;
  color: #3D3D3D;
  font-size: 38rpx;
  font-weight: bold;
  /* 橙色虚线：位于文字下方 2rpx，长度 40rpx，居中 */
  position: relative;
}
.tag.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 150rpx;
  height: 15rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #FFD239 0%, #FF7B33 100%);
  box-shadow: 0 8rpx 16rpx 0 #FDD63E;
  filter: blur(10rpx);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.task-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.task-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.task-desc {
  font-size: 24rpx;
  color: #3D3D3D;
  line-height: 1.4;
  background-color: #F1F1F1;
  width: fit-content;
  padding: 2rpx 6rpx;
  border-radius: 8rpx;
}

.task-meta {
  display: flex;
  gap: 16rpx;
}

.meta-info {
  font-size: 22rpx;
  color: #666666;
}

.task-reward {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B35;
}

.hot-badge {
  background-color: #FF5722;
  color: white;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  font-size: 18rpx;
  font-weight: bold;
}

.new-badge {
  background-color: #4CAF50;
  color: white;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  font-size: 18rpx;
  font-weight: bold;
}

.divider-line {
  height: 2rpx;
  background-color: #e5e5e5;
  margin: 20rpx 0;
}

.section-divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 30rpx 0;
}

.progress-indicator {
  height: 6rpx;
  background-color: #f0f0f0;
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #FFD700;
  transition: width 0.3s ease;
}
</style>

