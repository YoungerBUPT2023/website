const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

var nms = new NodeMediaServer(config)
nms.run();

console.log('RTMP 服务器已启动');
console.log('RTMP 地址: rtmp://localhost:1935/live');
console.log('推流密钥: stream');
console.log('完整推流地址: rtmp://localhost:1935/live/stream'); 