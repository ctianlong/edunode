/**
 * 使用express搭配http，没用pipe，需要自己区分body类型
 */
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
        // 请求体转换过程中可能出现长度不一致，故把content-length也去掉
        if (!/host|connection|content-length/i.test(i)) {
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

router.all('/api/*', jsonParser, function(req, res, next){
    var opt = {
        host: proxy_host,
        port: proxy_port,
        method: req.method,    //这里是发送的方法
        path: getCseUrl(req.url),  //这里是访问的路径
        headers: getHeader(req.headers)
    };
    var result = '';
    var request = http.request(opt, function (response) {
        response.on('data', function (d) {
            result += d;
        }).on('end', function () {
            res.writeHead(response.statusCode, response.headers);
            res.write(result);
            res.end();
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.stack);
        res.writeHead("500");
        res.end();
    });
    request.write(JSON.stringify(req.body));
    request.end();
});

app.use(router);
app.listen(8083);
console.log('server is start on ' + 8083);