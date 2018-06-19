const express = require('express');
const http = require('http');
const app = express();
const router = express.Router();

function getCseUrl(_url){
    _url = _url.replace(/^\/api\//, '');
    return 'http://' + _url;
}

router.all('/api/*', function(req, res, next){
    var proxy = process.env.HTTP_PROXY || '127.0.0.1:3001';
    var proxy_host = proxy.substring(0, proxy.indexOf(':'));
    var proxy_port = proxy.substring(proxy.indexOf(':') + 1);;
    var opt = {
        host: proxy_host,
        port: "30101",
        method: req.method,    //这里是发送的方法
        path: getCseUrl(req.url),  //这里是访问的路径
        headers: req.headers,
        timeout: 2000,
    };

    var result = '';
    var request = http.request(opt, function (response) {
        console.log("Got response: " + response.statusCode);
        console.log(response.headers);
        response.on('data', function (d) {
            result += d;
        }).on('end', function () {
            console.log(result);
            res.writeHead(response.statusCode, response.headers);
            res.write(result);
            res.end();
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
    if(req.body){
        request.write(req.body);
    }
    request.end();
});
app.use(router);
app.listen(8083);
console.log('server is start on ' + 8083);