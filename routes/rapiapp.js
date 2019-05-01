module.exports = function (app, bidsRepository, usersRepository) {

    app.get("/api/bid/notmybids", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        let decoded = app.get('jwt').verify(token, 'secreto');
        let userEmail = decoded.usuario;
        console.log(userEmail);
        //TODO: Ahora que aqui se busquen todas menos las del mail que se pasa.
        bidsRepository.getBids({}, function (bids) {
            if (bids == null) {
                res.status(500);
                res.json({
                    error: "Se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(bids));
            }
        });
    });
    app.post("/api/autenticar/", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.email,
            password: seguro
        }

        usersRepository.getUsers(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado: false
                })
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                })
            }

        });
    });
}