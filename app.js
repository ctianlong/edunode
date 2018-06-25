/**
 * 使用express搭配http，使用pipe
 */
const express = require('express');
const http = require('http');
const app = express();
const router = express.Router();

var proxy_host = process.env.HTTP_PROXY_HOST || '127.0.0.1';
var proxy_port = process.env.HTTP_PROXY_PORT || '30101';
var express_port = process.env.EXPRESS_PORT || 8083;

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
function getCseUrl(_url) {
    return _url.replace(/^\/api\//i, 'http://');
}

var counter = 0;
router.all('/api/*', function (req, res, next) {
    // 解决跨域
    if (/OPTIONS/i.test(req.method)) {
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH', 'Access-Control-Max-Age': 1728000 });
        res.end();
        return;
    }

    counter++;
    var num = counter;
    var opt = {
        host: proxy_host,
        port: proxy_port,
        method: req.method,
        path: getCseUrl(req.url),
        headers: getHeader(req.headers)
    };
    log('#%d\t%s %s %s %s', num, opt.method, opt.host, opt.port, opt.path);
    var req2 = http.request(opt, function (res2) {
        headers = res2.headers;
        // 解决跨域
        headers['Access-Control-Allow-Origin'] = '*';
        res.writeHead(res2.statusCode, headers);
        res2.pipe(res);
        res2.on('end', function () {
            log('#%d\tEND', num);
        });
    });
    req2.on('error', function (e) {
        log('#%d\tERROR: %s', num, e.stack);
        res.writeHead("502");
        res.end();
    });
    if (/POST|PUT|DELETE|PATCH/i.test(req.method)) {
        req.pipe(req2);
    } else {
        req2.end();
    }
});

// api接口
app.use(router);
// 静态资源
app.use(express.static(__dirname + '/dist'));
// 所有虚拟路由转向vue页面
app.use(function (req, res) {
    res.sendFile(__dirname + "/dist/index.html");
});
// 启动端口监听
app.listen(express_port);
log('proxy server listen on ' + express_port);