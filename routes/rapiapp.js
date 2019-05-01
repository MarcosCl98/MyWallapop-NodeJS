module.exports = function (app, bidsRepository, usersRepository, conversationRepository) {
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
     * Cuando se nos pasa un conversationId la converascion ya existe, si no se pasa no existe.
     * Necesita que lleve el token en el header.
     * Se debera de enviar por un formulario:
     *      - bidId : id de la oferta por la cual se quiere chatear.
     *      - message : mensaje el cual se quiere mandar.
     *      - conversationId : id de conversacion, si no se pasa damos por hecho que la hay que crear.
     * El autor se obtendra a traves del header.
     */
    app.post("/api/bid/sendmessage", function (req, res) {
        //Parametros.
        let token = req.headers['token'] || req.body.token || req.query.token;
        let bidId = req.body.bidId; //ID a pasar a traves de un formulario.
        let message = req.body.message; //Mensaje que se pasa a traves de un formulario.
        let conversationId = req.body.conversationId; //Id de la conversacion, no tiene por que tener si es nueva.

        //TODO: Borrar estas lineas, eso solo debug
        console.log("Debug:");
        console.log(bidId);
        console.log(message);

        //Chequeamos que los dos atributos obligatorios no estan vacios.
        if(bidId == undefined) {
            res.status(200);
            res.json({
                error: "Se tiene que pasar un atributo bidId."
            });
        }
        else if(message == undefined) {
            res.status(200);
            res.json({
                error: "Se tiene que pasar un atributo message."
            });
        } else {
            //Obtenemos el email del usuario que quiere enviar el mensaje
            let decoded = app.get('jwt').verify(token, 'secreto');
            let loginUserEmail = decoded.usuario; //Aqui obtenemos el usuario a traves de usar jwt

            //Revisar que se mande un mensaje a su propia oferta, si es asi enviar error
            //En principio aunque la oferta ya este vendida se podra enviar mensajes tambien.
            bidsRepository.getBids({_id: bidsRepository.mongo.ObjectID(bidId)}, function (bid) {
                if (bid == null || bid.length == 0) { //Si no se paso la oferta es que no existe
                    res.status(200);
                    res.json({
                        error: "Esa bid sobre la que quieres enviar el mensaje no existe."
                    });
                } else { //Como existe el producto vamos a revisar.
                    if (conversationId == undefined) { //Si no se pasa id de conversacion es nueva y deberemos de crearla.
                        if (bid[0].userEmail == loginUserEmail) { //No se puede enviar un mensaje de creacion mismo.
                            res.status(400); //Como se prohibe enviamos codigo 401 que es de Forbbiden
                            res.json({
                                error: "No te puedes abrir una conversacion nueva sobre un producto tuyo."
                            });
                        } else {
                            //Revisamos con esta funcion, si existe la conversacion, con ese producto y participantes.
                            conversationRepository.getConversations(
                                {$and: [{"bidId": bidId}, {"bidInterested": loginUserEmail}]},
                                function (conversations) {
                                    if (conversations == null || conversations.length == 0) {
                                        //No existe por tanto hay que crear la covnersacion con el nuevo mensaje.
                                        let newConversation = {
                                            bidId: bidId,
                                            bidOwner: bid[0].userEmail,
                                            bidInterested: loginUserEmail,
                                            messages: [
                                                [
                                                    loginUserEmail, //usuario que manda el mensaje
                                                    new Date(), //fecha de envio
                                                    message, //Contenido
                                                    false //No ha sido leido por defecto
                                                ]
                                            ]
                                        }
                                        conversationRepository.addConversation(newConversation, function (conversation) {
                                            if (conversation == null) { //No se ha agregado la conversacion
                                                res.status(500); //Error de servidor
                                                res.json({
                                                    error: "Esa bid sobre la que quieres enviar el mensaje no existe."
                                                });
                                            } else {
                                                res.status(200);
                                                res.json(JSON.stringify({
                                                    mensaje: "Mensaje enviado correctamente",
                                                    "conversation": conversation
                                                }));
                                            }
                                        })
                                    } else { //La conversacion ya existe, damos error ya que nos deberian de haber pasado id.
                                        res.status(400); //Como se prohibe enviamos codigo 401 que es de Forbbiden
                                        res.json({
                                            error: "Ya existe una conversacion entre vosotros por este producto," +
                                                " pasa id de la conversacion para poder mandar un mensaje nuevo."
                                        });
                                    }
                                });
                        }
                    } else { //Se nos pasa id por lo que existe
                        //Primero si existe la conversacion, si no existe deberemos devolver error de que nos pasa un id.
                        //Verificamos que los usuarios pertenecen a la covnersacion o son los propietariuos de la oferta.
                    }
                }
            });
            //Chequeamos si la conversacion ya existe, si no existe creamos una nueva

            //Chequeamos si la conversacion ya existe, si es asi añadimos el mensaje a la nueva

            //Devolver si se pudo enviar el nuevo mensaje o no
        }
    });

    /**
     * Metodo post para autetificar.
     * Hay que mandar un formulario con:
     *      email: email del usuario
     *      password: password de la cuenta
     * Este te devolvera un token necesario para acceder a todos los demas metodos.
     */
    app.post("/api/autenticar/", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
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