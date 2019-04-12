module.exports = function (app, swig, usersRepository,) {
    //Lista de usuarios
    app.get("/user/list", function (req, res) {
        usersRepository.getUsers({}, function (users) {
            if (users == null) {
                res.send("No hay ningun usuario.");
            } else {
                var respuesta = swig.renderFile('views/users/list.html',
                    {
                        users: users
                    });
                res.send(respuesta);
            }
        })
    });

    app.get("/signup", function (req, res) {
        var respuesta = swig.renderFile('views/users/signup.html', {});
        res.send(respuesta);
    });

    app.get("/login", function (req, res) {
        var respuesta = swig.renderFile('views/users/login.html', {});
        res.send(respuesta);
    });

    app.post("/login", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.username,
            password: seguro
        }
        usersRepository.getUsers(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/login" + "?mensaje=Email o password incorrecto" + "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/");
            }
        });
    });

    app.post('/signup', function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var usuario = {
            email: req.body.email,
            password: seguro
        }
        usersRepository.insertUser(usuario, function (id) {
            if (id == null) {
                res.redirect("/signup?mensaje=Error al registrar usuario")
            } else {
                res.send('Usuario Insertado ' + id);
            }
        });
    })
}