/**
 * API路由处理
 * 提供B站数据接口
 */

import express from 'express';
import { fetchUserInfo, fetchUserVideos } from './bilibili';

const router = express.Router();

// 获取B站UP主信息
router.get('/bilibili/user', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: '缺少用户UID参数'
      });
    }
    
    const result = await fetchUserInfo(uid);
    return res.json(result);
  } catch (error) {
    console.error('获取用户信息API错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取B站UP主视频列表
router.get('/bilibili/videos', async (req, res) => {
  try {
    const { uid, page = 1, pageSize = 20 } = req.query;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: '缺少用户UID参数'
      });
    }
    
    const result = await fetchUserVideos(uid, page, pageSize);
    return res.json(result);
  } catch (error) {
    console.error('获取视频列表API错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router; 