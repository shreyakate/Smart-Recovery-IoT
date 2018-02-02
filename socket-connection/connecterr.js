var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;


app.get('/', function(req, res){
    console.log("app works");
});

io.on('connection', function(socket){
    socket.emit('notification', {message:"aditya"});
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});