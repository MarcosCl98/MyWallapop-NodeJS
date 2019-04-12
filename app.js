// Módulos
const express = require('express');
const app = express();

const mongo = require('mongodb');
const swig = require('swig');

//Encriptacion de passwords
const crypto = require('crypto');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Carpeta publica
app.use(express.static('public'));

// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@mywallapop-shard-00-00-cjxyq.mongodb.net:27017,mywallapop-shard-00-01-cjxyq.mongodb.net:27017,mywallapop-shard-00-02-cjxyq.mongodb.net:27017/test?ssl=true&replicaSet=MyWallapop-shard-0&authSource=admin&retryWrites=true');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//Uso de sesion
var expressSession = require('express-session');
app.use(expressSession({
        secret: 'abcdefg',
        resave: true,
        saveUninitialized: true
    })
);

//Inicializado de repositorios
const usersRepository = require('./repositories/UserRepository');
usersRepository.init(app, mongo);

//Rutas/controladores por lógica
require("./routes/rusers.js")(app, swig, usersRepository); // (app, param1, param2, etc.)
require("./routes/rtienda.js")(app, swig); // (app, param1, param2, etc.)

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : " + req.session.destino)
        res.redirect("/login");
    }
});

// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo en http://localhost:8081");
})
