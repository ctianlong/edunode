const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
// const multer  = require('multer');

const app = express();
const router = express.Router();
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

// 获取请求的headers，去掉host和connection
var getHeader = function (req) {
    var ret = {};
    for (var i in req.headers) {
        // 请求体转换过程中可能出现长度不一致，故把content-length也去掉
        if (!/host|connection|content-length/i.test(i)) {
        ret[i] = req.headers[i];
        }
    }
    return ret;
};

function getCseUrl(_url){
    _url = _url.replace(/^\/api\//, '');
    return 'http://' + _url;
}

router.all('/api/*', jsonParser, function(req, res, next){
    var proxy = process.env.HTTP_PROXY || '127.0.0.1:30101';
    var proxy_host = proxy.substring(0, proxy.indexOf(':'));
    var proxy_port = proxy.substring(proxy.indexOf(':') + 1);;
    var opt = {
        host: proxy_host,
        port: proxy_port,
        method: req.method,    //这里是发送的方法
        path: getCseUrl(req.url),  //这里是访问的路径
        headers: getHeader(req)
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
        console.log("Got error: " + e.message);
        res.end(e.stack);
    });
    request.write(JSON.stringify(req.body));
    request.end();
});
app.use(router);
app.listen(8083);
console.log('server is start on ' + 8083);