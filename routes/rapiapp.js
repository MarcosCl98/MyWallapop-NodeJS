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
     * Enviar un mensaje, dos metodos disponibles en funcion de los paremetros que se pasen.
     * Si queremos crear una nueva conversacion deberemos de pasar lo siguiente:
     *      - idBid : id de la oferta a la cual queremos ofertar
     *      - message: mensaje el cual queremos mandar
     * Si queremos mandar un mensaje a una conversacion existente deberemos pasar lo siguiente:
     *      - idConversation: id de la conversacion a la cual queremos mandar el mensaje
     *      - message: contenido del mensaje que queremos enviar
     * El autor se obtendra a traves del header.
     */
    app.post("/api/bid/sendmessage", function (req, res) {
        //Parametros.
        let token = req.headers['token'] || req.body.token || req.query.token;
        let bidId = req.body.bidId; //ID a pasar a traves de un formulario.
        let message = req.body.message; //Mensaje que se pasa a traves de un formulario.
        let conversationId = req.body.conversationId; //Id de la conversacion, no tiene por que tener si es nueva.

        //Chequeamos que los dos atributos obligatorios no estan vacios.
        if (bidId == undefined && conversationId == undefined) {
            res.status(200);
            res.json({
                error: "Tienes que pasar uno de los dos atributos, o bidId o conversationId."
            });
        }
        if (message == undefined) {
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
            if (conversationId == undefined) {
                bidsRepository.getBids({_id: bidsRepository.mongo.ObjectID(bidId)}, function (bid) {
                    if (bid == null || bid.length == 0) { //Si no se paso la oferta es que no existe
                        res.status(200);
                        res.json({
                            error: "Esa bid sobre la que quieres enviar el mensaje no existe."
                        });
                    } else { //Como existe el producto vamos a revisar.
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
                                                res.status(201); //Mensjae enviado correctamente.
                                                res.json({
                                                    error: "Conversacion creada y nuevo mensaje enviado."
                                                });
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
                    }
                });
            } else { //Se nos pasa id por lo que existe
                conversationRepository.getConversations(
                    {_id: conversationRepository.mongo.ObjectID(conversationId)},
                    function (conversations) {
                        if (conversations == null || conversations.length == 0) { //Esa conversacion no existe
                            res.status(500); //Error de servidor
                            res.json({
                                error: "Esa conversacion a la que quieres enviar un mensaje no existe."
                            });
                        } else {
                            let conversation = conversations[0]; //Guardamos la conversacion
                            //Ahora vamos a chequear si la covnersacion son propietarios
                            if (conversation.bidOwner == loginUserEmail ||
                                conversation.bidInterested == loginUserEmail) {
                                conversation.messages.push([
                                    loginUserEmail, //usuario que manda el mensaje
                                    new Date(), //fecha de envio
                                    message, //Contenido
                                    false //No ha sido leido por defecto
                                ]);
                                conversationRepository.updateConversation(
                                    {_id: conversationRepository.mongo.ObjectID(conversationId)},
                                    conversation,
                                    function (conversation) {
                                        if (conversation == null) {
                                            res.status(500); //Error de servidor
                                            res.json({
                                                error: "Ha ocurrido un servidor al intentar enviar el mensaje."
                                            });
                                        } else {
                                            res.status(201); //Mensjae enviado correctamente.
                                            res.json({
                                                error: "Nuevo mensaje enviado."
                                            });
                                        }
                                    });
                            } else { //Esa conversacion no es tuya
                                res.status(500); //Error de servidor
                                res.json({
                                    error: "Esa conversacion a la que intentas mandar un mensaje no es tuya."
                                });
                            }
                        }
                    });
            }
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