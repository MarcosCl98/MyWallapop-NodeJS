// Módulos
const express = require('express');
const app = express();

//Ponemos a funcionar el logger
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';
app.set('logger', logger);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

const jwt = require('jsonwebtoken');
app.set('jwt', jwt);

const mongo = require('mongodb');
const swig = require('swig');

const favicon = require('serve-favicon'); //Para el favicon

//Encriptacion de passwords
const crypto = require('crypto');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
// routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function (req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    var token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {// verificar el token
        jwt.verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 240) {
                res.status(403); // Forbidden
                res.json({
                    acceso: false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso: false,
            mensaje: 'No hay Token'
        });
        app.get('logger').debug("Peticion cancelada por que no habia token.");
    }
});
// Aplicar routerUsuarioToken
app.use('/api/conversation', routerUsuarioToken);
app.use('/api/bid', routerUsuarioToken);

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        app.get('logger').debug("Peiticon cancelada por que no se habia logueado el usuario.");
        res.redirect("/login");
    }
});
app.use("/user*", routerUsuarioSession);
app.use("/bid*", routerUsuarioSession);

// routerAdministrador: Tienes que ser administrador para hacer ciertas cosas.
var routerAdminSession = express.Router();
routerAdminSession.use(function (req, res, next) {
    if (req.session.usuario === "admin@email.com") {
        next();
    } else {
        app.get('logger').debug("Usuario intento acceder a zona administrativa: " + req.session.usuario);
        res.redirect("/forbidden");
    }
});
// routerAdministrador: Lo aplicamos.
app.use("/user*", routerAdminSession);

routerUsuarioAutor
var routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function (req, res, next) {
    var path = require('path');
    var id = path.basename(req.originalUrl);
    bidsRepository.getBids({"_id": mongo.ObjectID(id)}, function (bids) {
        if (bids[0].userEmail == req.session.usuario) {
            next();
        } else {
            app.get('logger').debug("Usuario intento borrar ofertas que no eran suyas: " + req.session.usuario);
            res.redirect("/");
        }
    })
});
//Aplicar routerUsuarioAutor
app.use("/bid/mybids/delete", routerUsuarioAutor);

//Inicializado de repositorios
const usersRepository = require('./repositories/UserRepository');
usersRepository.init(app, mongo);
const bidsRepository = require('./repositories/BidRepository');
bidsRepository.init(app, mongo);
const conversationRepository = require('./repositories/ConversationRepository');
conversationRepository.init(app, mongo);
const gestorBD = require('./repositories/gestorBD');
gestorBD.init(app, mongo);

//Carpeta publica
app.use(express.static('public'));

//Rutas/controladores por lógica
require("./routes/rhome.js")(app, swig, bidsRepository,gestorBD);
require("./routes/rusers.js")(app, swig, usersRepository, bidsRepository, conversationRepository); // Router usuarios
require("./routes/rbids.js")(app, swig, bidsRepository, usersRepository); // Router bids
require("./routes/rforbidden.js")(app, swig); //Pagina que carga que esta prohibido el acceso.
require("./routes/rapiapp.js")(app, bidsRepository, usersRepository, conversationRepository); //Pagina que carga que esta prohibido el acceso.

//Poner el favicon
app.use(favicon(__dirname + '/public/img/favicon.ico'));
// lanzar el servidor
app.listen(app.get('port'), function () {
    console.log("Servidor activo en http://localhost:8081");
})