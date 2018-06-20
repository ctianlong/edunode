/**
 * 使用express搭配http，使用pipe
 */
const express = require('express');
const http = require('http');
const app = express();
const router = express.Router();

// 记录日志
var log = function () {
    var now = new Date().toLocaleString();
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

// 转换URL
function getCseUrl(_url){
    return _url.replace(/^\/api\//i, 'http://');
}

var proxy_host = process.env.HTTP_PROXY_HOST || '127.0.0.1';
var proxy_port = process.env.HTTP_PROXY_PORT || '30101';

router.all('/api/*', function(req, res, next){
    var opt = {
        host: proxy_host,
        port: proxy_port,
        method: req.method,
        path: getCseUrl(req.url),
        headers: getHeader(req.headers)
    };
    var req2 = http.request(opt, function (res2) {
        res.writeHead(res2.statusCode, res2.headers);
        res2.pipe(res);
    });
    req2.on('error', function (e) {
        log('ERROR: %s', e.stack);
        res.writeHead("500");
        res.end();
    });
    if (/POST|PUT|DELETE|PATCH/i.test(req.method)) {
        req.pipe(req2);
    } else {
        req2.end();
    }
});

app.use(router);
app.listen(8083);
log('proxy server listen on 8083');