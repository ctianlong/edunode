const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
// const multer  = require('multer');

const app = express();
const router = express.Router();
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

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

function getCseUrl(_url){
    return _url.replace(/^\/api\//i, 'http://');
}

var proxy = process.env.HTTP_PROXY || '127.0.0.1:30101';
var proxy_host = proxy.substring(0, proxy.indexOf(':'));
var proxy_port = proxy.substring(proxy.indexOf(':') + 1);

router.all('/api/*', function(req, res, next){
    var opt = {
        host: proxy_host,
        port: proxy_port,
        method: req.method,    //这里是发送的方法
        path: getCseUrl(req.url),  //这里是访问的路径
        headers: getHeader(req.headers)
    };
    var req2 = http.request(opt, function (res2) {
        res.writeHead(res2.statusCode, res2.headers);
        res2.pipe(res);
        res2.on('end', function () {
            console.log("end");
        });
    });
    req2.on('error', function (e) {
        console.log("Got error: " + e.stack);
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
console.log('server is start on ' + 8083);