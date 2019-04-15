const Bid = require('../model/Bid');

module.exports = function (app, swig, bidsRepository, userRepository) {
    //Añadir una nueva oferta
    app.get("/bid/add", function (req, res) {
        let respuesta = swig.renderFile('views/bids/add.html');
        res.send(respuesta);
    });

    //Añadir una nueva oferta post
    app.post("/bid/add", function (req, res) {
        if (typeof (req.body.title) == undefined || typeof (req.body.description) == undefined || typeof (req.body.price) == undefined ||
            req.body.title.length <= 0 || req.body.description.length <= 0 || req.body.price.length <= 0) {
            res.redirect("/bid/add?mensaje=Los campos no pueden estar vacios." +
                "&tipoMensaje=alert-danger");
        } else if (req.body.title.length < 6 || req.body.title.length > 20) {
            res.redirect("/bid/add?mensaje=El titulo solo puede tener un tamaño entre 6 y 20." +
                "&tipoMensaje=alert-danger");
        } else if (req.body.description.length < 6 || req.body.description.length > 200) {
            res.redirect("/bid/add?mensaje=La descripcion solo puede tener un tamaño entre 6 y 200." +
                "&tipoMensaje=alert-danger");
        } else if (req.body.price < 0.01 || req.body.price > 10000) {
            res.redirect("/bid/add?mensaje=El precio tiene que estar entre 0.01 y 10000 euros." +
                "&tipoMensaje=alert-danger");
        } else if (req.body.isSpecial == 'on') { //Si esta destacada habra que ver si tiene dinero suficiente.
            userRepository.getUsers({email: req.session.usuario}, function (users) {
                let user = users[0];
                if (user.money == null || user.money < 20.0) {
                    res.redirect("/bid/add?mensaje=No tienes 20€ o mas para poder destacar la oferta." +
                        "&tipoMensaje=alert-danger");
                } else {
                    user.money -= 20;
                    userRepository.updateUser({email: req.session.usuario}, user, function (result1) {
                        if (result1 == null) {
                            res.redirect("/bid/add?mensaje=Ocurrio un error al restar dinero y no se completo la transaccion." +
                                "&tipoMensaje=alert-danger");
                        } else {
                            let bid = new Bid(req.body.title, req.body.description, req.body.price, req.session.usuario, req.body.isSpecial);
                            bidsRepository.addBid(bid, function (id) {
                                if (id == null) {
                                    res.redirect("/bid/add?mensaje=Error al intentar agregar una oferta." +
                                        "&tipoMensaje=alert-danger");
                                } else {

                                    res.redirect("/bid/mybids?mensaje=Oferta registrada correctamente." +
                                        "&tipoMensaje=alert-success");
                                }
                            });
                        }
                    });
                }
            });
        } else {
            let bid = new Bid(req.body.title, req.body.description, req.body.price, req.session.usuario, req.body.isSpecial);
            bidsRepository.addBid(bid, function (id) {
                if (id == null) {
                    res.redirect("/bid/add?mensaje=Error al intentar agregar una oferta." +
                        "&tipoMensaje=alert-danger");
                } else {

                    res.redirect("/bid/mybids?mensaje=Oferta registrada correctamente." +
                        "&tipoMensaje=alert-success");
                }
            });
        }
    });

    //Listado de ofertas propias.
    app.get("/bid/mybids", function (req, res) {
        bidsRepository.getBids({userEmail : req.session.usuario}, function (bids) {
            let respuesta = swig.renderFile('views/bids/mybids.html',
                {
                    bids: bids,
                    session: req.session
                });
            res.send(respuesta);
        })
    });


    //Listado de mis ofertas compradas
    app.get("/bid/mybuyedbids", function (req, res) {
        bidsRepository.getBids({buyerEmail : req.session.usuario}, function (bids) {
            let respuesta = swig.renderFile('views/bids/mybuyedbids.html',
                {
                    bids: bids,
                    session: req.session
                });
            res.send(respuesta);
        })
    });

    app.post("/bid/mybids/oustanding/", function (req, res) {
        //chequear si tiene dinero
        userRepository.getUsers({email: req.session.usuario}, function (users) {
            let user = users[0];
            if(user.money == null || user.money < 20.0) {
                res.redirect("/bid/mybids?mensaje=No tienes 20€ o mas para poder destacar la oferta." +
                    "&tipoMensaje=alert-danger");
            } else {
                bidsRepository.getBids({_id : bidsRepository.mongo.ObjectID(req.body.id)}, function (bids) {
                    let bid = bids[0];
                    if (bid.buyerEmail != null) {
                        res.redirect("/bid/mybids?mensaje=Esa oferta no se puede destacar por que ya fue vendida." +
                            "&tipoMensaje=alert-danger");
                    } else if (bid.isSpecial == 'on') {
                        res.redirect("/bid/mybids?mensaje=Esa oferta ya esta destacada." +
                            "&tipoMensaje=alert-danger");
                    } else {
                        //restar dinero y destacar oferta
                        user.money -= 20;
                        userRepository.updateUser({email: req.session.usuario}, user,function (result1) {
                            if(result1 == null) {
                                res.redirect("/bid/mybids?mensaje=Ocurrio un error al restar dinero y no se completo la transaccion." +
                                    "&tipoMensaje=alert-danger");
                            } else {
                                bid.isSpecial = 'on';
                                bidsRepository.updateBid({_id: bidsRepository.mongo.ObjectID(req.body.id)}, bid, function (result2) {
                                    if(result2 == null) {
                                        res.redirect("/bid/mybids?mensaje=Ocurrio un error al actualizar la oferta y no se completo la transaccion." +
                                            "&tipoMensaje=alert-danger");
                                    } else {
                                        res.redirect("/bid/mybids?mensaje=Oferta descada correctamente." +
                                            "&tipoMensaje=alert-success");
                                    }
                                })
                            }
                        });
                    }
                });
            }
        });
    })


}