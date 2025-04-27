const fs = require('fs');
const path = require('path');

// 扫描图片目录
const imageDir = path.join(__dirname, '../public/kepu');
const outputFile = path.join(__dirname, '../src/data/availableImages.js');

// 读取目录中的所有文件
fs.readdir(imageDir, (err, files) => {
  if (err) {
    console.error('读取目录失败:', err);
    return;
  }
  
  // 过滤出图片文件
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });
  
  // 生成图片路径数组
  const imagePaths = imageFiles.map(file => `/kepu/${file}`);
  
  // 创建JavaScript文件内容
  const fileContent = `// 自动生成的图片列表 - ${new Date().toISOString()}
export const availableImages = ${JSON.stringify(imagePaths, null, 2)};
`;
  
  // 写入文件
  fs.writeFile(outputFile, fileContent, err => {
    if (err) {
      console.error('写入文件失败:', err);
      return;
    }
    console.log(`成功生成图片列表，共 ${imagePaths.length} 张图片`);
    console.log(`文件保存在: ${outputFile}`);
  });
}); 