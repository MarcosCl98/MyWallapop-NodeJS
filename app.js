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

// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@mywallapop-shard-00-00-cjxyq.mongodb.net:27017,mywallapop-shard-00-01-cjxyq.mongodb.net:27017,mywallapop-shard-00-02-cjxyq.mongodb.net:27017/mywallapop?ssl=true&replicaSet=MyWallapop-shard-0&authSource=admin&retryWrites=true');
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

//ROUTERS
// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        res.redirect("/login");
    }
});

// routerAdministrador: Tienes que ser administrador para hacer ciertas cosas.
var routerAdminSession = express.Router();
routerAdminSession.use(function (req, res, next) {
    if (req.session.usuario === "admin@email.com") {
        next();
    } else {
        res.redirect("/forbidden");
    }
});
// routerAdministrador: Lo aplicamos.
app.use("/user*", routerAdminSession);

//Inicializado de repositorios
const usersRepository = require('./repositories/UserRepository');
usersRepository.init(app, mongo);

//Carpeta publica
app.use(express.static('public'));

//Rutas/controladores por lógica
require("./routes/rusers.js")(app, swig, usersRepository); // (app, param1, param2, etc.)
require("./routes/rforbidden.js")(app, swig); //Pagina que carga que esta prohibido el acceso.

// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo en http://localhost:8081");
})
