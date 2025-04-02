import React from 'react';
import './EducationPosts.css';

const EducationPosts = () => {
  const posts = [
    {
      id: 1,
      title: '太阳系的奇妙之旅：探索我们的宇宙邻居',
      author: '张天文',
      date: '2024-03-20',
      imageUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      summary: '带你深入了解太阳系中的八大行星、矮行星和小天体，揭示它们的独特特征和科学价值。',
      tags: ['天文学', '太阳系', '行星科学'],
      fullContent: `
        太阳系是我们的宇宙家园，由太阳及其周围的天体组成。让我们一起来了解这个神奇的天文系统：

        1. 太阳：我们的恒星
        - 直径约139万公里，相当于地球的109倍
        - 表面温度约5500℃
        - 通过核聚变提供能量，维持太阳系的运转

        2. 八大行星的特点
        - 水星：最靠近太阳，温差极大
        - 金星：温室效应最强的行星
        - 地球：唯一已知存在生命的行星
        - 火星：可能曾经存在液态水
        - 木星：太阳系最大的行星
        - 土星：以美丽的光环著称
        - 天王星：自转轴几乎平行于轨道面
        - 海王星：有强大的大气风暴系统
      `
    },
    {
      id: 2,
      title: '微重力环境下的科学实验：揭示物理规律的新视角',
      author: '李物理',
      date: '2024-03-18',
      imageUrl: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      summary: '探索在国际空间站上进行的各种科学实验，了解微重力环境如何帮助我们更好地理解物理定律。',
      tags: ['微重力', '空间站', '物理实验'],
      fullContent: `
        在太空中的微重力环境下，许多物理现象会呈现出与地球上完全不同的特性：

        1. 流体力学实验
        - 表面张力成为主导力
        - 液体呈现球形
        - 对流现象减弱

        2. 燃烧实验
        - 火焰呈球形
        - 燃烧过程更纯净
        - 便于研究燃烧机理

        3. 材料科学实验
        - 晶体生长更完美
        - 合金混合更均匀
        - 新材料研发的理想环境
      `
    },
    {
      id: 3,
      title: '探索火星：红色星球上的生命可能性',
      author: '王探索',
      date: '2024-03-15',
      imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      summary: '详细解读火星探测的最新发现，探讨这颗红色星球上是否存在或曾经存在生命的可能性。',
      tags: ['火星', '天体生物学', '行星探测'],
      fullContent: `
        火星一直是人类探索的重要目标，特别是关于生命可能性的研究：

        1. 火星环境特征
        - 大气以二氧化碳为主
        - 存在季节性变化
        - 发现液态水的证据

        2. 生命探测任务
        - 好奇号探测器的发现
        - 毅力号采集样本
        - 未来载人探测计划

        3. 潜在生命迹象
        - 甲烷的周期性释放
        - 有机分子的发现
        - 古代湖泊的证据
      `
    }
  ];

  return (
    <div className="education-posts-container">
      {posts.map(post => (
        <article key={post.id} className="education-post">
          <div className="post-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
          <div className="post-content">
            <h2 className="post-title">{post.title}</h2>
            <div className="post-meta">
              <span className="post-author">{post.author}</span>
              <span className="post-date">{post.date}</span>
            </div>
            <p className="post-summary">{post.summary}</p>
            <div className="post-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <div className="post-full-content">
              {post.fullContent}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default EducationPosts; 