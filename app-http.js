/**
 * 简单的HTTP代理服务器
 */
var http = require('http');

// 记录日志
var log = function () {
  var now = new Date().toISOString();
  arguments[0] = '[' + now + '] ' + arguments[0];
  console.log.apply(console, arguments);
};

// 获取请求的headers，去掉host和connection
var getHeader = function (_headers) {
  var ret = {};
  for (var i in _headers) {
    if (!/host|connection/i.test(i)) {
      ret[i] = _headers[i];
    }
  }
  return ret;
};

// 获取请求的路径
function getCseUrl(_url){
    // if (_url.substr(0, 7).toLowerCase() === 'http://') {
    //     var i = _url.indexOf('/', 7);
    //     if (i !== -1) {
    //         _url = _url.substr(i);
    //     }
    // }
    return _url.replace(/^\/api\//i, 'http://');
}

var proxy = process.env.HTTP_PROXY || '127.0.0.1:30101';
var proxy_host = proxy.substring(0, proxy.indexOf(':'));
var proxy_port = proxy.substring(proxy.indexOf(':') + 1);

// 代理请求
var counter = 0;
var onProxy = function (req, res) {
  counter++;
  var num = counter;
  var opt = {
    host: proxy_host,
    port: proxy_port,
    path:     getCseUrl(req.url),
    method:   req.method,
    headers:  getHeader(req.headers)
  };
  log('#%d\t%s %s %s %s', num, opt.method, opt.host, opt.port, opt.path);
  var req2 = http.request(opt, function (res2) {
    res.writeHead(res2.statusCode, res2.headers);
    res2.pipe(res);
    res2.on('end', function () {
      log('#%d\tEND', num);
    });
  });
  req2.on('error', function (e) {
    log('#%d\tERROR: %s', num, e.stack);
    res.writeHead("500");
    res.end();
  });
  if (/POST|PUT|DELETE|PATCH/i.test(req.method)) {
    req.pipe(req2);
  } else {
    req2.end();
  }
};

// 启动http服务器
var server = http.createServer(onProxy);
server.listen(8083);
log('proxy server listen on http://127.0.0.1:8083');