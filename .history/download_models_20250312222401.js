const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建models目录
const modelsDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// 使用一些简单的几何体作为替代
// 这些是简单的JSON格式的几何体，可以被Three.js加载
const createSimpleModel = (name) => {
  const model = {
    metadata: {
      version: 4.5,
      type: 'Object',
      generator: 'Object3D.toJSON'
    },
    geometries: [
      {
        uuid: 'sphere-geo',
        type: 'SphereGeometry',
        radius: 1,
        widthSegments: 32,
        heightSegments: 16
      }
    ],
    materials: [
      {
        uuid: 'default-material',
        type: 'MeshStandardMaterial',
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.5,
        emissive: 0xaaaaaa
      }
    ],
    object: {
      uuid: name,
      type: 'Mesh',
      name: name,
      geometry: 'sphere-geo',
      material: 'default-material',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
  };

  fs.writeFileSync(path.join(modelsDir, `${name}.json`), JSON.stringify(model, null, 2));
  console.log(`Created ${name}.json`);
};

// 创建简单的模型
createSimpleModel('lab_equipment');
createSimpleModel('vr_headset');
createSimpleModel('trophy');
createSimpleModel('computer');

console.log('All models created successfully!'); 