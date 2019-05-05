module.exports = function (app, swig, bidsRepository,gestorBD) {
    //Redireccione a home.
    app.get('/', function (req, res) {
        res.redirect('/home');
    });


    app.get('/reset', function (req, res) {
        bidsRepository.getBids({isSpecial : 'on'}, function (bids) {
            let respuesta = swig.renderFile('views/index.html',
                {
                    bids: bids,
                    session: req.session
                });
            res.send(respuesta);
        })

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