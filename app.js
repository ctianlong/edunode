const express = require('express');
const http = require('http');
const app = express();
const router = express.Router();

function getCseUrl(_url){
    _url = _url.replace(/^\/api\//, '');
    return 'http://' + _url;
}

router.all('/api/*', function(req, res, next){
    var proxy = process.env.HTTP_PROXY || '127.0.0.1:30101';
    var proxy_host = proxy.substring(0, proxy.indexOf(':'));
    var proxy_port = proxy.substring(proxy.indexOf(':') + 1);;
    var opt = {
        host: proxy_host,
        port: proxy_port,
        method: req.method,    //这里是发送的方法
        path: getCseUrl(req.url),  //这里是访问的路径
        headers: req.headers,
        timeout: 2000,
    };
    var result = '';
    var request = http.request(opt, function (response) {
        console.log(3);
        response.on('data', function (d) {
            result += d;
        }).on('end', function () {
            console.log(5);
            res.writeHead(response.statusCode, response.headers);
            res.write(result);
            res.end();
        });
    }).on('error', function (e) {
        console.log(4);
        console.log("Got error: " + e.message);
    });
    console.log(req.body);
    var bb = {
        "name": "my",
        "enabled": 0,
        "pageNum": 1,
        "pageSize": 2,
        "orderColumn": "name",
        "orderDir": "asc"
    }
    console.log(JSON.stringify(bb));
    request.write(JSON.stringify(bb));
    // if(req.body){
    //     console.log(req.body);
    //     console.log(1);
    //     request.write(JSON.stringify(req.body));
    //     console.log(2);
    // }
    request.end();
    console.log(6);
});
app.use(router);
app.listen(8083);
console.log('server is start on ' + 8083);