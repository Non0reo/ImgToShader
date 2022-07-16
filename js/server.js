var http = require('http');
var fs = require('fs');
http.createServer(function (req, res) {
    console.log("I'm here");
    fs.readFile('assets/default/position_color.fsh', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
}).listen(8080);