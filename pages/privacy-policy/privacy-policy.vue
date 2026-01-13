<template>
  <view class="container">
    <view class="content">
      <view class="policy-header">
        <text class="title">任务平台隐私政策</text>
        <text class="date">生效日期：2025年10月1日</text>
      </view>
      
      <view class="policy-content">
        <view class="section">
          <text class="section-title">1. 引言</text>
          <text class="section-text">任务平台（以下简称"我们"）非常重视用户的隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策的条款。</text>
        </view>
        
        <view class="section">
          <text class="section-title">2. 信息收集</text>
          <text class="section-text">2.1 账户信息：包括用户名、手机号码、邮箱地址等注册信息。</text>
          <text class="section-text">2.2 身份信息：为了确保平台安全，我们可能收集身份证明文件。</text>
          <text class="section-text">2.3 交易信息：包括任务记录、收支明细、银行卡信息等。</text>
          <text class="section-text">2.4 设备信息：包括设备型号、操作系统、IP地址等技术信息。</text>
          <text class="section-text">2.5 使用信息：包括访问时间、浏览记录、操作日志等。</text>
        </view>
        
        <view class="section">
          <text class="section-title">3. 信息使用</text>
          <text class="section-text">3.1 提供和改进服务：用于账户管理、任务匹配、支付结算等核心功能。</text>
          <text class="section-text">3.2 安全保障：用于身份验证、风险控制、反欺诈等安全措施。</text>
          <text class="section-text">3.3 客户服务：用于处理用户咨询、投诉和技术支持。</text>
          <text class="section-text">3.4 营销推广：在获得您同意的情况下，向您推送相关服务信息。</text>
        </view>
        
        <view class="section">
          <text class="section-title">4. 信息共享</text>
          <text class="section-text">4.1 我们不会向第三方出售、出租或交易您的个人信息。</text>
          <text class="section-text">4.2 在以下情况下，我们可能会共享您的信息：</text>
          <text class="section-text">- 获得您的明确同意</text>
          <text class="section-text">- 法律法规要求或政府部门要求</text>
          <text class="section-text">- 为保护平台和用户的合法权益</text>
          <text class="section-text">- 与合作伙伴共享必要信息以提供服务</text>
        </view>
        
        <view class="section">
          <text class="section-title">5. 信息存储</text>
          <text class="section-text">5.1 我们将在中华人民共和国境内存储您的个人信息。</text>
          <text class="section-text">5.2 我们采用行业标准的安全措施保护您的信息安全。</text>
          <text class="section-text">5.3 我们只会在必要期间内保留您的个人信息。</text>
        </view>
        
        <view class="section">
          <text class="section-title">6. 信息安全</text>
          <text class="section-text">6.1 我们采用加密技术、访问控制等多种安全措施。</text>
          <text class="section-text">6.2 我们定期进行安全评估和漏洞修复。</text>
          <text class="section-text">6.3 我们建立了数据泄露应急响应机制。</text>
        </view>
        
        <view class="section">
          <text class="section-title">7. 用户权利</text>
          <text class="section-text">7.1 访问权：您有权了解我们收集的关于您的个人信息。</text>
          <text class="section-text">7.2 更正权：您有权要求我们更正不准确的个人信息。</text>
          <text class="section-text">7.3 删除权：在特定情况下，您有权要求我们删除您的个人信息。</text>
          <text class="section-text">7.4 撤回同意：您有权撤回对个人信息处理的同意。</text>
        </view>
        
        <view class="section">
          <text class="section-title">8. Cookie和类似技术</text>
          <text class="section-text">8.1 我们使用Cookie等技术来改善用户体验。</text>
          <text class="section-text">8.2 您可以通过浏览器设置管理Cookie。</text>
          <text class="section-text">8.3 禁用Cookie可能影响部分功能的正常使用。</text>
        </view>
        
        <view class="section">
          <text class="section-title">9. 未成年人保护</text>
          <text class="section-text">9.1 我们不会主动收集未满18周岁未成年人的个人信息。</text>
          <text class="section-text">9.2 如发现收集了未成年人信息，我们将立即删除。</text>
          <text class="section-text">9.3 未成年人使用服务需获得监护人同意。</text>
        </view>
        
        <view class="section">
          <text class="section-title">10. 政策更新</text>
          <text class="section-text">我们可能会不时更新本隐私政策。重大变更将通过平台公告或其他方式通知您。继续使用服务即表示您同意更新后的政策。</text>
        </view>
        
        <view class="section">
          <text class="section-title">11. 联系我们</text>
          <text class="section-text">如您对本隐私政策有任何疑问或建议，请通过平台客服联系我们。我们将在合理时间内回复您的请求。</text>
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

.policy-header {
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

.policy-content {
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