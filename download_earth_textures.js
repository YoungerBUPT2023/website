const fs = require('fs');
const path = require('path');
const https = require('https');

// 创建目录（如果不存在）
const newTexturesDir = path.join(__dirname, 'public', 'earth_new');
if (!fs.existsSync(newTexturesDir)) {
  fs.mkdirSync(newTexturesDir, { recursive: true });
}

// 要下载的纹理图片URL
const textures = [
  {
    name: 'color.jpg',
    url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74218/world.200412.3x5400x2700.jpg'
  },
  {
    name: 'night.jpg',
    url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg'
  },
  {
    name: 'clouds.jpg',
    url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud.E2001001.2100.1km.jpg'
  },
  {
    name: 'normal.jpg',
    url: 'https://svs.gsfc.nasa.gov/vis/a000000/a004500/a004528/bluemarble-2048.jpg'
  }
];

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

// 下载所有纹理
async function downloadAllTextures() {
  console.log('开始下载地球纹理图片...');
  
  for (const texture of textures) {
    const filePath = path.join(newTexturesDir, texture.name);
    console.log(`正在下载 ${texture.name}...`);
    
    try {
      await downloadFile(texture.url, filePath);
    } catch (error) {
      console.error(`下载 ${texture.name} 失败:`, error.message);
    }
  }
  
  console.log('所有纹理下载完成！');
}

// 执行下载
downloadAllTextures(); 