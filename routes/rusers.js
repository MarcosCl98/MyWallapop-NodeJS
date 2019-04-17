module.exports = function (app, swig, usersRepository, bidsRepository) {
    //Lista de usuarios
    app.get("/user/list", function (req, res) {
        usersRepository.getUsers({}, function (users) {
            if (users == null) {
                res.send("No hay ningun usuario.");
            } else {
                let respuesta = swig.renderFile('views/users/list.html',
                    {
                        users: users,
                        session: req.session,
                    });
                res.send(respuesta);
            }
        })
    });

    //Borrar lista usuarios
    app.post("/user/delete", function (req, res) {
        let listUserID = req.body.listUserID;
        listUserID = listUserID.split(',');
        let listUserObjectID = new Array();
        listUserID.forEach(function (element) {
            listUserObjectID.push(usersRepository.mongo.ObjectID(element));
        });

        if (listUserID.length > 0) { //Si se manda algun parametro actuar.
            usersRepository.deleteUser(listUserObjectID, function (users) {
                if (users == null) {
                    res.send("No hay ningun usuario.");
                } else {
                    //TODO: borrar bids de las cuales es creador
                    usersRepository.getUsers(listUserObjectID, function (usersInList) {
                        let listUserEmail = new Array();
                        listUserEmail.forEach(function (element) {
                            listUserEmail.push(element.email);
                        });
                        bidsRepository.removeBidByUserEmail(usersInList, function (resultRemove) {
                            if (resultRemove == null) {
                                res.redirect("/user/list");
                            }
                        });
                    });
                    //TODO: borrar conversaciones en las que participa
                    res.redirect("/user/list");
                }
            }, req.session.usuario)
        } else { //Si no se manda ningun parametro
            res.redirect("/user/list");
        }
    });

    //Registrarse get
    app.get("/signup", function (req, res) {
        var respuesta = swig.renderFile('views/users/signup.html', {
            session: req.session
        });
        res.send(respuesta);
    });

    //Registrarse post
    app.post('/signup', function (req, res) {
        //Validaciones
        if (req.body.email.length <= 0) {
            console.log('nombre');
            res.redirect("/signup?mensaje=Error, campo email vacío."+
                "&tipoMensaje=alert-danger")
        } else if (req.body.nombre.length <= 0) {
            console.log('nombre1');
            res.redirect("/signup?mensaje=Error, campo nombre vacío."+
                "&tipoMensaje=alert-danger")
        } else if (req.body.apellido.length <= 0) {
            console.log('nombre2');
            res.redirect("/signup?mensaje=Error, campo apellido vacío."+
                "&tipoMensaje=alert-danger")
        } else if (req.body.password.length <= 0) {
            res.redirect("/signup?mensaje=Error, campo contraseña vacío."+
                "&tipoMensaje=alert-danger")
        } else if (req.body.password2.length <= 0) {
            res.redirect("/signup?mensaje=Error, campo contraseña vacío."+
                "&tipoMensaje=alert-danger");
        } else {
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            var seguro2 = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password2).digest('hex');
            if (seguro != seguro2) {
                console.log('nombre3');
                res.redirect("/signup?mensaje=Error, las contraseñas no coinciden." +
                    "&tipoMensaje=alert-danger");
            } else {
                var usuario = {
                    email: req.body.email,
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    password: seguro,
                    money: 100.00
                }

                usersRepository.insertUser(usuario, function (id) {
                    if (id == null) {
                        res.redirect("/signup?mensaje=Error al registrar usuario, email ya existente." +
                            "&tipoMensaje=alert-danger");
                    } else {
                        req.session.usuario = usuario.email;
                        req.session.money = usuario.money;
                        res.redirect("/home?mensaje=Has iniciado sesión correctamente." +
                            "&tipoMensaje=alert-success");

                    }
                });
            }
        }
    });

    app.get('/logout', function (req, res) {
        req.session.usuario = null;
        req.session.money = null;
        res.redirect("/login?mensaje=Has cerrado sesión correctamente." +
            "&tipoMensaje=alert-success");
    })

    //Loguearse get
    app.get("/login", function (req, res) {
        var respuesta = swig.renderFile('views/users/login.html', {
            session: req.session
        });
        res.send(respuesta);
    });

    //Loguearse post
    app.post("/login", function (req, res) {
        if (req.body.username.length <= 0) {
            console.log('nombre');
            res.redirect("/login?mensaje=Error, campo email vacío." +
                "&tipoMensaje=alert-danger")
        }else if (req.body.password.length <= 0) {
            res.redirect("/login?mensaje=Error, campo contraseña vacío."+
                "&tipoMensaje=alert-danger")
        }else{
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            var criterio = {
                email: req.body.username,
                password: seguro
            }
            usersRepository.getUsers(criterio, function (usuarios) {
                if (usuarios == null || usuarios.length == 0) {
                    req.session.usuario = null;
                    res.redirect("/login" + "?mensaje=Email o password incorrecto." + "&tipoMensaje=alert-danger");
                } else {
                    req.session.money = usuarios[0].money;
                    req.session.usuario = usuarios[0].email;
                    res.redirect("/");
                }
            });
        }


    });
}