import React from 'react';
import { Link } from 'react-router-dom';
import './PolicyPage.css';

function ServiceAgreement() {
  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>服务协议</h1>
        <p className="policy-date">最后更新: 2025年3月</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. 引言</h2>
          <p>本协议规定了您与本网站之间的权利与义务。使用本网站即表示您接受本协议。</p>
        </section>

        <section className="policy-section">
          <h2>2. 账户注册与使用</h2>
          <ul>
            <li>用户需提供真实、准确的注册信息。</li>
            <li>用户需妥善保管账户，避免共享或泄露。</li>
            <li>任何账户活动均由用户本人负责。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. 服务使用规则</h2>
          <ul>
            <li>用户不得上传违法、不当或侵犯他人权益的内容。</li>
            <li>用户不得利用 AI 进行恶意行为或操纵分析结果。</li>
            <li>本网站保留对违规账户进行限制或终止的权利。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. 知识产权</h2>
          <ul>
            <li>用户上传的作品归用户所有，但用户授予本网站有限的许可，以便执行 AI 分析等服务。</li>
            <li>AI 生成的分析数据归网站所有，但用户可自由使用自己的分析结果。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. 责任限制</h2>
          <ul>
            <li>本网站不对 AI 结果的准确性或适用性作出保证。</li>
            <li>用户需自行判断分析结果的适用性，网站不承担因使用结果造成的损失。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. 账户终止</h2>
          <ul>
            <li>用户可随时注销账户。</li>
            <li>如用户违反本协议，我们可暂停或终止服务。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. 争议解决</h2>
          <ul>
            <li>本协议适用中国法律。</li>
            <li>争议应通过友好协商解决，协商不成的，提交北京市有管辖权的人民法院解决。</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>8. 变更与修订</h2>
          <p>我们可随时更新本协议，用户在变更后继续使用即视为接受新条款。</p>
        </section>

        <section className="policy-section">
          <h2>9. 联系方式</h2>
          <p>如有疑问，请联系我们：<a href="mailto:TangZiyi2023@bupt.edu.cn">TangZiyi2023@bupt.edu.cn</a></p>
        </section>
      </div>

      <div className="policy-footer">
        <Link to="/" className="back-button">返回首页</Link>
      </div>
    </div>
  );
}

export default ServiceAgreement; 