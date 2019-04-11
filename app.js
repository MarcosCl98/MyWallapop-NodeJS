// Módulos
var express = require('express');
var app = express();

var swig = require('swig');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Carpeta publica
app.use(express.static('public'));

// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@mywallapop-shard-00-00-cjxyq.mongodb.net:27017,mywallapop-shard-00-01-cjxyq.mongodb.net:27017,mywallapop-shard-00-02-cjxyq.mongodb.net:27017/test?ssl=true&replicaSet=MyWallapop-shard-0&authSource=admin&retryWrites=true');

//Rutas/controladores por lógica
//require("./routes/rusuarios.js")(app); // (app, param1, param2, etc.)


// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo en http://localhost:8081");
})