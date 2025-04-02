const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { JWT_SECRET, PORT } = require('./config');
const sequelize = require('./db');
const User = require('./models/User');
const Work = require('./models/Work');
const Project = require('./models/Project');
const Like = require('./models/Like');
const Comment = require('./models/Comment');

const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],  // 允许前端应用访问
  credentials: true,  // 允许发送凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 修改静态文件访问配置
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 修改数据库同步代码
sequelize.sync({ alter: true }) // 使用 alter 而不是 force
  .then(async () => {
    try {
      // 检查是否需要初始化数据
      const projectCount = await Project.count();
      const userCount = await User.count();

      if (userCount === 0) {
        // 创建默认管理员账户
        await User.create({
          username: 'qydycg',
          password: await bcrypt.hash('1020', 10),
          isAdmin: true
        });

        // 创建其他测试用户
        await User.create({
          username: 'younger',
          password: await bcrypt.hash('ILoveSun', 10)
        });
      }

      if (projectCount === 0) {
        // 添加示例项目数据
        const defaultProjects = [
          {
            title: '太空站模拟器',
            description: '一个交互式太空站模拟器，可以体验失重环境下的生活和工作。',
            imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            authorId: 1, // 管理员ID
            tags: ['VR', '太空', '模拟'],
            detailedDescription: '这个太空站模拟器是一个沉浸式VR体验项目...',
            equipment: '推荐设备：Oculus Quest 2或更高版本的VR头显',
            requirements: '系统要求：Windows 10, i7处理器, 16GB内存, RTX 2070或更高显卡',
            collaborators: ['王小明（环境设计）', '李华（物理引擎）', '张三（UI设计）'],
            likes: 24
          },
          // ... 其他示例项目
        ];

        await Project.bulkCreate(defaultProjects);
      }

      console.log('数据库已同步并初始化');
    } catch (error) {
      console.error('数据库初始化错误:', error);
    }
  })
  .catch(err => console.error('数据库同步失败:', err));

// 验证Token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '令牌无效或已过期' });
    }
    req.user = user;
    next();
  });
};

// 注册路由
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    await User.create({
      username,
      password: hashedPassword,
      email
    });

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 登录路由
app.post('/api/login', async (req, res) => {
  try {
    console.log('收到登录请求:', req.body);
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`用户 ${username} 不存在`);
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`用户 ${username} 密码验证失败`);
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    console.log(`用户 ${username} 登录成功`);

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 设置响应
    res.json({
      success: true,
      message: '登录成功',
      token,
      username: user.username,
      isAdmin: !!user.isAdmin
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
});

// 上传作品路由
app.post('/api/works/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: '未提供文件' });
    }

    // 判断是否为图片文件
    const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.originalname);
    
    // 创建作品记录
    const work = await Work.create({
      title,
      description,
      filePath: file.path,
      imageUrl: isImage ? `/uploads/${file.filename}` : null,
      userId: req.user.id
    });

    res.status(201).json({
      message: '作品上传成功',
      work: {
        id: work.id,
        title: work.title,
        description: work.description,
        imageUrl: work.imageUrl
      }
    });
  } catch (error) {
    console.error('上传作品错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有作品路由
app.get('/api/works', async (req, res) => {
  try {
    const works = await Work.findAll({
      include: [
        {
          model: User,
          attributes: ['username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedWorks = works.map(work => ({
      id: work.id,
      title: work.title,
      description: work.description,
      imageUrl: work.imageUrl,
      author: work.User.username,
      createdAt: work.createdAt
    }));

    res.json(formattedWorks);
  } catch (error) {
    console.error('获取作品错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 点赞项目
app.post('/api/projects/:projectId/like', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // 检查项目是否存在
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查是否已经点赞
    const existingLike = await Like.findOne({
      where: { UserId: userId, ProjectId: projectId }
    });

    if (existingLike) {
      return res.status(400).json({ message: '已经点赞过了' });
    }

    // 创建点赞记录
    await Like.create({
      UserId: userId,
      ProjectId: projectId
    });

    // 更新项目点赞数
    await project.increment('likes');

    res.json({ message: '点赞成功' });
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 取消点赞
app.delete('/api/projects/:projectId/like', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // 检查项目是否存在
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 删除点赞记录
    const deleted = await Like.destroy({
      where: { UserId: userId, ProjectId: projectId }
    });

    if (deleted) {
      // 更新项目点赞数
      await project.decrement('likes');
    }

    res.json({ message: '取消点赞成功' });
  } catch (error) {
    console.error('取消点赞错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 修改添加评论路由
app.post('/api/projects/:projectId/comments', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 检查项目是否存在
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 创建评论
    const comment = await Comment.create({
      content,
      UserId: userId,
      ProjectId: projectId
    });

    // 获取评论者信息
    const user = await User.findByPk(userId);

    res.status(201).json({
      message: '评论成功',
      comment: {
        id: comment.id,
        content: comment.content,
        user: user.username,
        date: comment.createdAt
      }
    });
  } catch (error) {
    console.error('评论错误:', error);
    res.status(500).json({ message: '评论失败', error: error.message });
  }
});

// 上传项目路由
app.post('/api/projects', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      tags
    } = req.body;
    
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: '未提供文件' });
    }

    // 确保 tags 是有效的 JSON 数组
    let parsedTags = [];
    try {
      parsedTags = tags ? JSON.parse(tags) : [];
      if (!Array.isArray(parsedTags)) {
        parsedTags = [];
      }
    } catch (e) {
      console.error('解析标签错误:', e);
    }

    const imageUrl = `http://localhost:${PORT}/uploads/${file.filename}`;

    const project = await Project.create({
      title,
      description,
      imageUrl: imageUrl,
      tags: parsedTags, // 使用处理后的标签数组
      detailedDescription: description,
      equipment: '未指定',
      requirements: '未指定',
      collaborators: [],
      authorId: req.user.id
    });

    const author = await User.findByPk(req.user.id);

    res.status(201).json({
      message: '项目上传成功',
      project: {
        ...project.toJSON(),
        author: author ? author.username : 'unknown',
        tags: parsedTags // 确保返回的也是数组
      }
    });
  } catch (error) {
    console.error('上传项目详细错误:', error);
    res.status(500).json({ 
      message: '上传失败',
      error: error.message 
    });
  }
});

// 修改获取项目列表的路由，包含评论
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          attributes: ['username']
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['username']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 获取当前用户的点赞记录
    const userId = req.user?.id;
    let userLikes = [];
    if (userId) {
      userLikes = await Like.findAll({
        where: { UserId: userId },
        attributes: ['ProjectId']
      });
    }
    const likedProjectIds = userLikes.map(like => like.ProjectId);

    const formattedProjects = projects.map(project => {
      const projectData = project.toJSON();
      return {
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        imageUrl: projectData.imageUrl,
        tags: Array.isArray(projectData.tags) ? projectData.tags : [],
        author: projectData.User ? projectData.User.username : 'unknown',
        date: projectData.createdAt,
        likes: projectData.likes || 0,
        liked: likedProjectIds.includes(projectData.id),
        comments: projectData.Comments.map(comment => ({
          id: comment.id,
          text: comment.content,
          user: comment.User.username,
          date: comment.createdAt
        })) || [],
        detailedDescription: projectData.detailedDescription || '',
        equipment: projectData.equipment || '未指定',
        requirements: projectData.requirements || '未指定',
        collaborators: Array.isArray(projectData.collaborators) ? projectData.collaborators : []
      };
    });

    res.json(formattedProjects);
  } catch (error) {
    console.error('获取项目错误:', error);
    res.status(500).json({ message: '获取项目列表失败', error: error.message });
  }
});

// 删除项目路由
app.delete('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查权限（只有作者和管理员可以删除）
    if (project.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: '没有权限删除此项目' });
    }

    // 删除项目相关的文件
    if (project.imageUrl) {
      const filename = project.imageUrl.split('/').pop();
      const filePath = path.join(__dirname, 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 删除项目记录
    await project.destroy();

    res.json({ message: '项目删除成功' });
  } catch (error) {
    console.error('删除项目错误:', error);
    res.status(500).json({ message: '删除失败', error: error.message });
  }
});

// 删除评论路由
app.delete('/api/projects/:projectId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const comment = await Comment.findOne({
      where: { 
        id: commentId,
        ProjectId: projectId
      }
    });

    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 检查权限（只有评论作者和管理员可以删除）
    if (comment.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: '没有权限删除此评论' });
    }

    // 删除评论
    await comment.destroy();

    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ message: '删除失败', error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 