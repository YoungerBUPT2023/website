import React from 'react';
import { Link } from 'react-router-dom';
import './PolicyPage.css';

function PrivacyPolicy() {
  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>隐私政策</h1>
        <p className="policy-date">最后更新: 2025年3月</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. 引言</h2>
          <p>欢迎使用我们的 AI 驱动太空科学网站（"本网站"）。本隐私政策解释了我们如何收集、使用、存储和保护您的个人信息。使用本网站，即表示您同意本隐私政策的条款。</p>
        </section>

        <section className="policy-section">
          <h2>2. 我们收集的信息</h2>
          <p>我们可能收集以下信息：</p>
          <ul>
            <li><strong>账户信息：</strong>如您的姓名、电子邮件地址、用户名等。</li>
            <li><strong>上传作品：</strong>您在网站上上传的太空科学相关作品。</li>
            <li><strong>AI 分析数据：</strong>AI 对您作品的分析结果。</li>
            <li><strong>技术数据：</strong>包括 IP 地址、设备信息、浏览行为等。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. 我们如何使用信息</h2>
          <p>我们收集的信息将用于：</p>
          <ul>
            <li>提供和优化 AI 分析服务。</li>
            <li>维护和改进网站功能。</li>
            <li>保护用户安全，防止欺诈行为。</li>
            <li>进行数据分析和研究，以改进 AI 能力。</li>
            <li>向用户提供更新或相关通知（如适用）。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. 信息共享与披露</h2>
          <p>我们不会出售或出租您的个人信息。以下情况下可能共享信息：</p>
          <ul>
            <li><strong>法律要求：</strong>在法律法规要求下，我们可能披露您的信息。</li>
            <li><strong>合作伙伴：</strong>为提供某些功能，我们可能与受信任的第三方合作，如云存储或支付处理服务。</li>
            <li><strong>匿名数据：</strong>我们可能共享去标识化的数据，用于研究或改进 AI 技术。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. 数据安全</h2>
          <p>我们采取合理的安全措施来保护您的数据，包括加密、访问控制和安全存储。然而，互联网数据传输无法保证绝对安全，请妥善保管您的账号信息。</p>
        </section>

        <section className="policy-section">
          <h2>6. 用户权利</h2>
          <p>您可以：</p>
          <ul>
            <li>访问、更正或删除您的个人数据。</li>
            <li>选择退出营销信息。</li>
            <li>请求删除您的账户。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Cookie 与追踪技术</h2>
          <p>我们使用 Cookie 以提升用户体验，您可以在浏览器设置中管理 Cookie 偏好。</p>
        </section>

        <section className="policy-section">
          <h2>8. 政策变更</h2>
          <p>我们可能更新本政策，变更后会通过网站公告或电子邮件通知用户。</p>
        </section>

        <section className="policy-section">
          <h2>9. 联系方式</h2>
          <p>如有任何隐私问题，请联系我们：<a href="mailto:TangZiyi2023@bupt.edu.cn">TangZiyi2023@bupt.edu.cn</a></p>
        </section>
      </div>

      <div className="policy-footer">
        <Link to="/" className="back-button">返回首页</Link>
      </div>
    </div>
  );
}

export default PrivacyPolicy; 