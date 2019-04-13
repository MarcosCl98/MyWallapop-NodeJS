const Bid = require('../model/Bid');

module.exports = function (app, swig, bidsRepository) {
    //Añadir una nueva oferta
    app.get("/bid/add", function (req, res) {
        let respuesta = swig.renderFile('views/bids/add.html');
        res.send(respuesta);
    });

    //Añadir una nueva oferta post
    app.post("/bid/add", function (req, res) {
        //TODO HACER CHECK
        //Mirar si los parametros son validos.
        let bid = new Bid(req.body.title, req.body.description, req.body.price, req.session.usuario);
        console.log(bid);
        bidsRepository.addBid(bid, function (id) {
            console.log(id);
            if (id == null) {
                res.redirect("/bid/add?mensaje=Error al intentar agregar una oferta." +
                    "&tipoMensaje=alert-danger ");
            } else {
                res.redirect("/bid/mybids?mensaje=Oferta registrada correctamente.");
            }
        });
    });
}