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

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 创建上传文件的目录
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

// 提供静态文件访问
app.use('/uploads', express.static(uploadsDir));

// 数据库同步
sequelize.sync()
  .then(() => console.log('数据库已同步'))
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
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码不正确' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      username: user.username
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 