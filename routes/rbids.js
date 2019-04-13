module.exports = function (app, swig, bidsRepository) {
    //Añadir una nueva oferta
    app.get("/bid/add", function (req, res) {
        var respuesta = swig.renderFile('views/bids/add.html');
        res.send(respuesta);
    });
}