const Bid = require('../model/Bid');

module.exports = function (app, swig, bidsRepository) {
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
        } else {
            let bid = new Bid(req.body.title, req.body.description, req.body.price, req.session.usuario, req.body.specialBid);
            bidsRepository.addBid(bid, function (id) {
                console.log(id);
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
}