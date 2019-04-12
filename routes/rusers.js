module.exports = function (app, swig, usersRepository) {
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

    //Borrar lista usuarios
    app.post("/user/delete", function (req, res) {
        let listUserID = req.body.listUserID;
        listUserID = listUserID.split(',');
        let listUserObjectID = new Array();
        listUserID.forEach(function(element) {
            listUserObjectID.push(usersRepository.mongo.ObjectID(element));
        });

        if(listUserID.length > 0) { //Si se manda algun parametro actuar.
            usersRepository.deleteUser(listUserObjectID, function (users) {
                if (users == null) {
                    res.send("No hay ningun usuario.");
                } else {
                    res.redirect("/user/list");
                }
            })
        } else { //Si no se manda ningun parametro
            res.redirect("/user/list");
        }
    });

    //Registrarse get
    app.get("/signup", function (req, res) {
        var respuesta = swig.renderFile('views/users/signup.html', {});
        res.send(respuesta);
    });

    //Registrarse post
    app.post('/signup', function (req, res) {
        //Validaciones
        if(req.body.email.length <=0){
            console.log('nombre');
            res.redirect("/signup?mensaje=Error, campo email vacío")
        }
        else if(req.body.nombre.length <=0){
            console.log('nombre1');
            res.redirect("/signup?mensaje=Error, campo nombre vacío")
        }
        else if(req.body.apellido.length <=0){
            console.log('nombre2');
            res.redirect("/signup?mensaje=Error, campo apellido vacío")
        }
        else if(req.body.password.length <=0){
            res.redirect("/signup?mensaje=Error, campo contraseña vacío")
        }
        else if(req.body.password2.length <=0){
            res.redirect("/signup?mensaje=Error, campo contraseña vacío");
        }else {
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            var seguro2 = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password2).digest('hex');
            if(seguro != seguro2) {
                console.log('nombre3');
                res.redirect("/signup?mensaje=Error, las contraseñas no coinciden")
            }else {
                var usuario = {
                    email: req.body.email,
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    password: seguro
                }

                usersRepository.insertUser(usuario, function (id) {
                    if (id == null) {
                        res.redirect("/signup?mensaje=Error al registrar usuario, email ya existente")
                    } else {
                        req.session.usuario = usuario.email;
                        res.redirect("/?mensaje=Has iniciado sesión correctamente.");
                    }
                });
            }
        }
    });

    //Loguearse get
    app.get("/login", function (req, res) {
        var respuesta = swig.renderFile('views/users/login.html', {});
        res.send(respuesta);
    });

    //Loguearse post
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
}