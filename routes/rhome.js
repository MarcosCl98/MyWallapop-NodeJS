module.exports = function (app, swig, bidsRepository) {
    //Redireccione a home.
    app.get('/', function (req, res) {
        res.redirect('/home');
    });

    //Pagina de inicio
    app.get("/home", function (req, res) {
        bidsRepository.getBids({isSpecial : 'on'}, function (bids) {
            let respuesta = swig.renderFile('views/index.html',
                {
                    bids: bids,
                    session: req.session
                });
            res.send(respuesta);
        })
    });
}