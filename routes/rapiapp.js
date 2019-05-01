module.exports = function (app, bidsRepository, usersRepository) {
    /**
     * Devuelve las ofertas de todos los usuarios menos
     * de si mismo.
     * Necesita que lleve el token en el header.
     */
    app.get("/api/bid/notmybids", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        let decoded = app.get('jwt').verify(token, 'secreto');
        let loginUserEmail = decoded.usuario;
        bidsRepository.getBids({userEmail: {$ne: loginUserEmail}}, function (bids) {
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


    /**
     * Enviar un mensaje.
     * Necesita que lleve el token en el header.
     * Se debera de enviar por un formulario:
     *      - bidId : id de la oferta por la cual se quiere chatear.
     *      - message : mensaje el cual se quiere mandar.
     * El autor se obtendra a traves del header.
     */
    app.post("/api/bid/notmybids", function (req, res) {
        //Parametros.
        let token = req.headers['token'] || req.body.token || req.query.token;
        let bidId = req.body.bidId; //ID a pasar a traves de un formulario.
        let message = req.body.message; //Mensaje que se pasa a traves de un formularil.

        //Obtenemos el email del usuario que quiere enviar el mensaje
        let decoded = app.get('jwt').verify(token, 'secreto');
        let loginUserEmail = decoded.usuario; //Aqui obtenemos el usuario a traves de usar jwt

        //Revisar que se mande un mensaje a su propia oferta, si es asi enviar error

        //Chequeamos si la conversacion ya existe, si no existe creamos una nueva

        //Chequeamos si la conversacion ya existe, si es asi añadimos el mensaje a la nueva

        //Devolver si se pudo enviar el nuevo mensaje o no

        bidsRepository.getBids({userEmail: {$ne: loginUserEmail}}, function (bids) {
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

    /**
     * Metodo post para autetificar.
     * Hay que mandar un formulario con:
     *      email: email del usuario
     *      password: password de la cuenta
     * Este te devolvera un token necesario para acceder a todos los demas metodos.
     */
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