const fs = require('fs');
const path = require('path');
const https = require('https');

// 创建目录（如果不存在）
const newTexturesDir = path.join(__dirname, 'public', 'earth_new');
if (!fs.existsSync(newTexturesDir)) {
  fs.mkdirSync(newTexturesDir, { recursive: true });
}

// 法线贴图URL - 使用另一个来源
const normalMapUrl = 'https://svs.gsfc.nasa.gov/vis/a000000/a004500/a004528/bluemarble-2048.jpg';
const filePath = path.join(newTexturesDir, 'normal.jpg');

// 下载函数
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`成功下载: ${filePath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // 删除部分下载的文件
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(filePath, () => {}); // 删除部分下载的文件
      reject(err);
    });
  });
}

// 下载法线贴图
async function downloadNormalMap() {
  console.log('开始下载法线贴图...');
  
  try {
    await downloadFile(normalMapUrl, filePath);
    console.log('法线贴图下载完成！');
  } catch (error) {
    console.error(`下载法线贴图失败:`, error.message);
  }
}

// 执行下载
downloadNormalMap(); 