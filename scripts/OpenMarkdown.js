var spawn = require('child_process').exec;
// Hexo 3 用户复制这段
hexo.on('new', function(data){
  exec('start  "/Program Files/Story/nw.exe" ' + data.path);
});

