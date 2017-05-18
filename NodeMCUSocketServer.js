// Espruino server for NodeMCU led prototype
// Hartger Veeman
var SSID = "";
var wifiPass = "";
var status = {r:1,g:0,b:0};
var page = `
<html>
<body>
  <style>
    .statusindicator {
      -webkit-border-top-left-radius: 1px;
      -webkit-border-top-right-radius: 2px;
      -webkit-border-bottom-right-radius: 3px;
      -webkit-border-bottom-left-radius: 4px;
      -moz-border-radius-topleft: 1px;
      -moz-border-radius-topright: 2px;
      -moz-border-radius-bottomright: 3px;
      -moz-border-radius-bottomleft: 4px;
      border-top-left-radius: 1px;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 3px;
      border-bottom-left-radius: 4px;
      width:20px;
      height:20px;
    }
  </style>
  <script>var ws;
          ws = new WebSocket("ws://" + location.host + "/my_websocket", "protocolOne");
          ws.onmessage = function (event) {
            document.getElementById("status").innerHTML ="Status:"+event.data; 
            document.getElementById('r-status').style.backgroundColor = (JSON.parse(event.data).r == 1 ? "green" : "red");
            document.getElementById('g-status').style.backgroundColor = (JSON.parse(event.data).g == 1 ? "green" : "red");
            document.getElementById('b-status').style.backgroundColor = (JSON.parse(event.data).b == 1 ? "green" : "red");
          };
  </script>
  <h1>ESP2866 LED CONTROL</h1>
  <h2 id="status"> Status: ${ status } </h2>
  <div id='r'> R
    <button onclick= "ws.send(JSON.stringify({cmd:'on',led:'r'}))">ON</button>
    <button onclick= "ws.send(JSON.stringify({cmd:'off',led:'r'}))">OFF</button>
    <div class='statusindicator' id='r-status'></div>
  </div>
  <div id='g'> G
    <button onclick= "ws.send(JSON.stringify({cmd:'on',led:'g'}))">ON</button>
    <button onclick= "ws.send(JSON.stringify({cmd:'off',led:'g'}))">OFF</button>
    <div class='statusindicator' id='g-status'></div>
  </div>
  <div id='b'> B
    <button onclick= "ws.send(JSON.stringify({cmd:'on',led:'b'}))">ON</button>
    <button onclick= "ws.send(JSON.stringify({cmd:'off',led:'b'}))">OFF</button>
    <div class='statusindicator' id='b-status'></div>
  </div>
</body>
</html>`;
function onPageRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(page);
}
var server;
var wifi = require("Wifi");
wifi.connect(SSID, {password:wifiPass}, function(err){  
    var message;
    var port = 8080;
    server = require('ws').createServer(onPageRequest);
    server.clients = [];
    server.listen(port);
    server.on("websocket", function(ws) {
        server.clients.push(ws);
        ws.on('message',function(msg) {
          msg = JSON.parse(msg);
          message = msg;
          print("[WS] "+msg);
          if(msg.cmd=="on") {
            if(msg.led=='r'){
              digitalWrite(NodeMCU.D2,1);
            }
            if(msg.led=='g'){
              digitalWrite(NodeMCU.D1,1);
            }
            if(msg.led=='b'){
              digitalWrite(NodeMCU.D6,1);
            }
            status[msg.led] = 1;
          }
          if(msg.cmd=="off") {
            if(msg.led=='r'){
              digitalWrite(NodeMCU.D2,0);
            }
            if(msg.led=='g'){
              digitalWrite(NodeMCU.D1,0);
            }
            if(msg.led=='b'){
              digitalWrite(NodeMCU.D6,0);
            }
            status[msg.led] = 0;
          }
          server.broadcast(JSON.stringify(status)); 
        });
        server.broadcast(JSON.stringify(status)); 
    });
  console.log("Server listening on "+port);
  wifi.getIP();
  server.broadcast = function broadcast(data) {
    for(var i = 0;i < server.clients.length;i++) {
      var client = server.clients[i];
      if (client.connected === true) {
        client.send(data);
      }
    }
  };
});
wifi.setHostname("led-esp");
wifi.stopAP();
wifi.save();
