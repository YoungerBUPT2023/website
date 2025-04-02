/**
 * 哔哩哔哩API接口
 * 提供获取UP主信息和视频列表功能
 */

import axios from 'axios';

// B站API基础URL
const BILIBILI_API_BASE = 'https://api.bilibili.com';

// 获取UP主信息
export async function fetchUserInfo(uid) {
  try {
    // 使用B站官方API获取用户信息
    const response = await axios.get(`${BILIBILI_API_BASE}/x/space/acc/info`, {
      params: {
        mid: uid,
        jsonp: 'jsonp'
      },
      headers: {
        'Referer': 'https://space.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.data && response.data.code === 0) {
      // 返回标准化的用户数据
      return {
        success: true,
        data: {
          uid: response.data.data.mid,
          name: response.data.data.name,
          face: response.data.data.face,
          sign: response.data.data.sign,
          level: response.data.data.level,
          follower: response.data.data.follower
        }
      };
    } else {
      console.error('获取UP主信息失败:', response.data);
      return {
        success: false,
        message: response.data?.message || '获取UP主信息失败'
      };
    }
  } catch (error) {
    console.error('获取UP主信息出错:', error);
    return {
      success: false,
      message: error.message || '网络请求失败'
    };
  }
}

// 获取UP主视频列表
export async function fetchUserVideos(uid, page = 1, pageSize = 30) {
  try {
    // 使用B站官方API获取视频列表
    const response = await axios.get(`${BILIBILI_API_BASE}/x/space/arc/search`, {
      params: {
        mid: uid,
        ps: pageSize,
        pn: page,
        order: 'pubdate',
        jsonp: 'jsonp'
      },
      headers: {
        'Referer': `https://space.bilibili.com/${uid}/video`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.data && response.data.code === 0) {
      const videoList = response.data.data.list?.vlist || [];
      
      // 返回标准化的视频数据
      return {
        success: true,
        data: {
          list: videoList.map(video => ({
            bvid: video.bvid,
            aid: video.aid,
            title: video.title,
            desc: video.description,
            pic: video.pic,
            duration: video.length,
            created: video.created,
            play: video.play,
            author: video.author
          })),
          page: {
            current: page,
            size: pageSize,
            total: response.data.data.page?.count || 0
          }
        }
      };
    } else {
      console.error('获取视频列表失败:', response.data);
      return {
        success: false,
        message: response.data?.message || '获取视频列表失败'
      };
    }
  } catch (error) {
    console.error('获取视频列表出错:', error);
    return {
      success: false,
      message: error.message || '网络请求失败'
    };
  }
} 