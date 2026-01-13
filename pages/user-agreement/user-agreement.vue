<template>
  <view class="container">
    <view class="content">
      <view class="agreement-header">
        <text class="title">任务平台用户协议</text>
        <text class="date">生效日期：2025年10月1日</text>
      </view>
      
      <view class="agreement-content">
        <view class="section">
          <text class="section-title">1. 协议的接受</text>
          <text class="section-text">欢迎使用任务平台！本用户协议（以下简称"协议"）是您与任务平台之间关于使用本平台服务的法律协议。通过注册、登录或使用本平台的任何服务，您表示已阅读、理解并同意受本协议的约束。</text>
        </view>
        
        <view class="section">
          <text class="section-title">2. 服务描述</text>
          <text class="section-text">任务平台是一个提供任务发布、接受和完成服务的在线平台。用户可以在平台上发布任务、接受任务、完成任务并获得相应报酬。</text>
        </view>
        
        <view class="section">
          <text class="section-title">3. 用户注册与账户</text>
          <text class="section-text">3.1 用户注册时必须提供真实、准确、完整的个人信息。</text>
          <text class="section-text">3.2 用户有责任维护账户信息的安全性和保密性。</text>
          <text class="section-text">3.3 用户不得将账户转让给他人使用。</text>
        </view>
        
        <view class="section">
          <text class="section-title">4. 用户行为规范</text>
          <text class="section-text">4.1 用户应遵守国家法律法规，不得利用平台从事违法活动。</text>
          <text class="section-text">4.2 用户不得发布虚假、误导性或欺诈性信息。</text>
          <text class="section-text">4.3 用户应诚信完成任务，不得恶意刷单或作弊。</text>
        </view>
        
        <view class="section">
          <text class="section-title">5. 平台权利与义务</text>
          <text class="section-text">5.1 平台有权对用户行为进行监督和管理。</text>
          <text class="section-text">5.2 平台有权暂停或终止违规用户的服务。</text>
          <text class="section-text">5.3 平台将保护用户的合法权益和个人信息安全。</text>
        </view>
        
        <view class="section">
          <text class="section-title">6. 费用与结算</text>
          <text class="section-text">6.1 平台可能收取一定的服务费用。</text>
          <text class="section-text">6.2 任务报酬将按照平台规则进行结算。</text>
          <text class="section-text">6.3 用户应按时完成任务以获得相应报酬。</text>
        </view>
        
        <view class="section">
          <text class="section-title">7. 知识产权</text>
          <text class="section-text">7.1 平台的所有内容和技术均受知识产权法保护。</text>
          <text class="section-text">7.2 用户在平台上发布的内容应确保不侵犯他人知识产权。</text>
        </view>
        
        <view class="section">
          <text class="section-title">8. 免责声明</text>
          <text class="section-text">8.1 平台不对用户间的交易纠纷承担责任。</text>
          <text class="section-text">8.2 平台不保证服务的绝对稳定性和可用性。</text>
          <text class="section-text">8.3 用户使用平台服务的风险由用户自行承担。</text>
        </view>
        
        <view class="section">
          <text class="section-title">9. 协议修改</text>
          <text class="section-text">平台有权根据业务发展需要修改本协议。修改后的协议将在平台上公布，用户继续使用服务即视为同意修改后的协议。</text>
        </view>
        
        <view class="section">
          <text class="section-title">10. 联系我们</text>
          <text class="section-text">如您对本协议有任何疑问，请通过平台客服联系我们。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style scoped>
.container {
  background: #f5f5f5;
  min-height: 100vh;
}

.content {
  padding: 20rpx 30rpx;
}

.agreement-header {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 30rpx 0;
  background: #fff;
  border-radius: 16rpx;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.date {
  font-size: 24rpx;
  color: var(--text-sub);
}

.agreement-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.section-text {
  display: block;
  font-size: 26rpx;
  color: var(--text-main);
  line-height: 1.6;
  margin-bottom: 12rpx;
}

.section-text:last-child {
  margin-bottom: 0;
}
.section-divider {
  height: 2rpx;
  background-color: #e5e5e5;
  margin: 30rpx 0;
}

.highlight-badge {
  background-color: #FFD700;
  color: #333;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.important-badge {
  background-color: #FF6B35;
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.divider-line {
  height: 1rpx;
  background-color: #ddd;
  margin: 20rpx 0;
}
</style>