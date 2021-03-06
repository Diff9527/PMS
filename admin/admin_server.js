/**
 * 主站连接服务端
 */
var path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    app = express(),
    server = require('http').createServer(app),
    config = require('../config').config;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multer({dest: './upload'}));

app.use('/html', express.static(path.join(__dirname, '/web/html')));
app.use('/sdk', express.static(path.join(__dirname, '/web/sdk')));
app.use('/Ext', express.static(path.join(__dirname, '/web/sdk/ext/build/examples')));
app.use('/js', express.static(path.join(__dirname, '/web/js')));
app.use('/css', express.static(path.join(__dirname, '/web/css')));

app.all(['/'], function (req, res) {
    res.sendFile(__dirname + '/web/html/index.html');
});

app.all(['/browser'], function (req, res) {
    res.sendFile(__dirname + '/web/html/browser.html');
});

app.all(['/help'], function (req, res) {
    res.send('返回帮助信息');
});

app.use(function (req, res, next) {
    try {
        var url = req._parsedUrl.pathname,
            action = require('.' + url);
        app.all(url, action.handler);
        next();
    } catch (e) {
        res.status(404).send('404, 无法找到请求的页面！~~');
        //console.log(e);
    }
});


var start = function () {
    server.listen(config.adminPort, function (err) {
        if (err) throw err;
        console.log('adminServer is listening on', config.adminPort);
    });
};

exports.start = start;
