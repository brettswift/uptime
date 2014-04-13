/*
 * Monitor remote server uptime.
 */
 
var http = require('http');
var url  = require('url');
var revision = 1001;

function changeVersion(req){
	var arg2 = url.parse(req.url).pathname.substr(4);
  	var chanceToGetVersionChange = parseFloat(arg2) / 100;

  	if(Math.random() < chanceToGetVersionChange){
    	revision += 1;
    }
}

http.createServer(function(req, res) {
  var arg = url.parse(req.url).pathname.substr(1,2);
  var chanceToGetOkResponse = parseFloat(arg) / 100;

  changeVersion(req);

  if (!chanceToGetOkResponse || Math.random() > chanceToGetOkResponse) {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    setTimeout(function() { res.end('Bad Request')}, Math.random() * 1000 );
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
   	
   	
  	var body = "<service><status><build>1.0.1." + revision + "</build></status></service>";
   
    setTimeout(function() { res.end(body)}, Math.random() * 100 );
  }
}).listen(8888);
