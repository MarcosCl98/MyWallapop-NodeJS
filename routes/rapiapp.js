module.exports = function (app, bidsRepository, usersRepository, conversationRepository) {

    /**
     * Metodo post para autetificar.
     * Hay que mandar un formulario con:
     *      email: email del usuario
     *      password: password de la cuenta
     * Este te devolvera un token necesario para acceder a todos los demas metodos.
     */
    app.post("/api/autenticar", function (req, res) {
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
                res.send(bids);
            }
        });
    });

    /**
     * Devuelve las conversaciones de un usuario
     * de si mismo.
     * Necesita que lleve el token en el header.
     */
    app.get("/api/conversation", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        let decoded = app.get('jwt').verify(token, 'secreto');
        let loginUserEmail = decoded.usuario;
        conversationRepository.getConversations({
            $or: [{bidOwner: loginUserEmail},
                {bidInterested: loginUserEmail}]
        }, function (conversations) {
            if (conversations == null) {
                res.status(500);
                res.json({
                    error: "Se ha producido un error"
                })
            } else {
                res.status(200);
                let iteration = 0;
                conversations.forEach(function (conversation) {
                    bidsRepository.getBids({_id: bidsRepository.mongo.ObjectID(conversation.bidId)}, function (bids) {
                        conversation.bidTitle = bids[0].title;
                        let noReadMessages = 0;
                        for(let message in conversation.messages) {
                            if(message[0] != loginUserEmail && message[3] == false) {
                                noReadMessages++;
                            }
                        }
                        conversation.noReadMessages = noReadMessages;
                        iteration++;
                        if (conversations.length == iteration) {
                            res.send(conversations);
                        }
                    });
                })
            }
        });
    });

    /**
     * Devuelve una conversacion en concreto.
     * de si mismo.
     * Necesita que lleve el token en el header.
     */
    app.get("/api/conversation/:id", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        let decoded = app.get('jwt').verify(token, 'secreto');
        let loginUserEmail = decoded.usuario;
        let idConversation = req.params.id;
        conversationRepository.getConversations({
            $and: [{_id: conversationRepository.mongo.ObjectID(idConversation)},
                {$or: [{bidOwner: loginUserEmail}, {bidInterested: loginUserEmail}]}]
        }, function (conversations) {
            if (conversations == null) {
                res.status(500);
                res.json({
                    error: "Se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(conversations[0].messages);
            }
        });
    });

    /**
     * Marcar como leidos mensajes de una covnersacion.
     * Se marcaran como leidos los mensajes enviados por la otra persona la cual no es la que esta logueada.
     * Se debe pasar como parametro body lo siguiente:
     *      - conversationId : Id de la conversacion
     * El autentificador de usuario se pasara en el header.
     */
    app.post("/api/conversation/:id/read", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        let conversationId = req.params.id; //Id de la conversacion, no tiene por que tener si es nueva.

        //Chequeamos que se pasa el id de conversacion
        if (conversationId == undefined) {
            res.status(200);
            res.json({
                error: "Tienes que pasar un conversationId como parametro en el body."
            });
        } else if (conversationId.length != 24) {
            res.status(200); //El tamaño del id de conversacion debe de ser 24.
            res.json({
                error: "El tamaño del id de conversacion debe de ser 24."
            })
        } else {
            //Obtenemos el email del usuario que quiere enviar el mensaje
            let decoded = app.get('jwt').verify(token, 'secreto');
            let loginUserEmail = decoded.usuario; //Aqui obtenemos el usuario a traves de usar jwt

            conversationRepository.getConversations(
                {_id: conversationRepository.mongo.ObjectID(conversationId)},
                function (conversations) {
                    if (conversations == null || conversations.length == 0) { //Esa conversacion no existe
                        res.status(500); //Error de servidor
                        res.json({
                            error: "Esa conversacion no existe."
                        });
                    } else if (conversations[0].bidOwner == loginUserEmail ||
                        conversations[0].bidInterested == loginUserEmail) { //Es el dueño
                        let updatedConversation = conversations[0]; //Conversacion
                        //Actualizamos los mensajes
                        updatedConversation.messages.forEach(function (message) {
                            if (message[0] != loginUserEmail) { //Si no fue enviado por el
                                message[3] = true; //Lo marcamos como leido
                            }
                        });
                        conversationRepository.updateConversation(
                            {_id: conversationRepository.mongo.ObjectID(conversationId)},
                            updatedConversation,
                            function (conversation) {
                                if (conversation == null) {
                                    res.status(500); //Error de servidor
                                    res.json({
                                        error: "Ocurrio un error al actualizar la conversacion."
                                    });
                                } else {
                                    //Devolvemos los mensajes actualizados
                                    res.status(200);
                                    res.json(conversations[0].messages);
                                }
                            });
                    } else {
                        res.status(200);
                        res.json({
                            error: "No eres participante de esa conversacion."
                        });
                    }
                });
        }
    });

    /**
     * Enviar un mensaje, dos metodos disponibles en funcion de los paremetros que se pasen.
     * Si queremos crear una nueva conversacion deberemos de pasar lo siguiente:
     *      - idBid : id de la oferta a la cual queremos ofertar se pasa por arriba
     *      - message: mensaje el cual queremos mandar
     * Si queremos mandar un mensaje a una conversacion existente deberemos pasar lo siguiente:
     *      - idConversation: id de la conversacion a la cual queremos mandar el mensaje
     *      - message: contenido del mensaje que queremos enviar
     * El autor se obtendra a traves del header.
     */
    app.post("/api/conversation/:id*?", function (req, res) {
        //Parametros.
        let token = req.headers['token'] || req.body.token || req.query.token;
        let bidId = req.body.bidId; //ID a pasar a traves de un formulario.
        let message = req.body.message; //Mensaje que se pasa a traves de un formulario.
        let conversationId = req.params.id; //Id de la conversacion, no tiene por que tener si es nueva.

        //Chequeamos que los dos atributos obligatorios no estan vacios.
        if (bidId == undefined && conversationId == undefined) {
            res.status(200);
            res.json({
                error: "Tienes que pasar uno de los dos atributos, o bidId o conversationId."
            });
        } else if (message == undefined) {
            res.status(200);
            res.json({
                error: "Se tiene que pasar un atributo message."
            });
        } else if (conversationId != undefined && conversationId.length != 24) {
            res.status(200);
            res.json({
                error: "El id de conversacion debe de ser de un tamaño de 24 caracteres."
            })
        } else if (bidId != undefined && bidId.length != 24) {
            res.status(200);
            res.json({
                error: "El id de la bid debe de ser de un tamaño de 24 caracteres."
            })
        } else if (message.length == 0) {
            res.status(200);
            res.json({
                error: "No se puede enviar un mensaje vacio."
            })
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
                                                    message: "Conversacion creada y nuevo mensaje enviado."
                                                });
                                            }
                                        })
                                    } else { //La conversacion existe, mandamos el mensaje sobre la misma.
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
                                                {_id: conversationRepository.mongo.ObjectID(conversations[0]._id)},
                                                conversation,
                                                function (conversationReturn) {
                                                    if (conversationReturn == null) {
                                                        res.status(500); //Error de servidor
                                                        res.json({
                                                            error: "Ha ocurrido un servidor al intentar enviar el mensaje."
                                                        });
                                                    } else {
                                                        res.status(201); //Mensjae enviado correctamente.
                                                        res.json({
                                                            message: "Nuevo mensaje enviado. (la conversacion ya existia)"
                                                        });
                                                    }
                                                });
                                        }
                                    }
                                });
                        }
                    }
                });
            } else { //Se nos pasa id, pero no de la bid, por lo que damos por hecho que ya existe.
                if (conversationId.length != 24) {
                    res.status(200); //El tamaño del id de conversacion debe de ser 24.
                    res.json({
                        error: "El tamaño del id de conversacion debe de ser 24."
                    })
                } else {
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
        }
    });

    /**
     * Mostrar una conversacion.
     * Se debe pasar como parametro body lo siguiente:
     *      - conversationId : Id de la conversacion
     * El autentificador de usuario se pasara en el header.
     */
    app.get("/api/conversation/:id", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        let conversationId = req.params.id; //Id de la conversacion, no tiene por que tener si es nueva.

        //Chequeamos que se pasa el id de conversacion
        if (conversationId == undefined) {
            res.status(200);
            res.json({
                error: "Tienes que pasar un conversationId como parametro en el body."
            });
        } else if (conversationId.length != 24) {
            res.status(200); //El tamaño del id de conversacion debe de ser 24.
            res.json({
                error: "El tamaño del id de conversacion debe de ser 24."
            })
        } else {
            //Obtenemos el email del usuario que quiere enviar el mensaje
            let decoded = app.get('jwt').verify(token, 'secreto');
            let loginUserEmail = decoded.usuario; //Aqui obtenemos el usuario a traves de usar jwt

            conversationRepository.getConversations(
                {_id: conversationRepository.mongo.ObjectID(conversationId)},
                function (conversations) {
                    if (conversations == null || conversations.length == 0) { //Esa conversacion no existe
                        res.status(500); //Error de servidor
                        res.json({
                            error: "Esa conversacion no existe."
                        });
                    } else if (conversations[0].bidOwner == loginUserEmail ||
                        conversations[0].bidInterested == loginUserEmail) {
                        //Es el dueño, devolver solo los mensajes
                        res.status(200);
                        res.json(conversations[0].messages);
                    } else {
                        res.status(200);
                        res.json({
                            error: "No eres participante de esa conversacion."
                        });
                    }
                });
        }
    });

    /**
     * Borrar una conversacion.
     * Se debe pasar como parametro body lo siguiente:
     *      - conversationId : Id de la conversacion
     * El autentificador de usuario se pasara en el header.
     */
    app.delete("/api/conversation/:id", function (req, res) {
        let token = req.headers['token'] || req.body.token || req.query.token;
        let conversationId = req.params.id; //Id de la conversacion, no tiene por que tener si es nueva.

        //Chequeamos que se pasa el id de conversacion
        if (conversationId == undefined) {
            res.status(200);
            res.json({
                error: "Tienes que pasar un conversationId como parametro en el body."
            });
        } else if (conversationId.length != 24) {
            res.status(200); //El tamaño del id de conversacion debe de ser 24.
            res.json({
                error: "El tamaño del id de conversacion debe de ser 24."
            })
        } else {
            //Obtenemos el email del usuario que quiere enviar el mensaje
            let decoded = app.get('jwt').verify(token, 'secreto');
            let loginUserEmail = decoded.usuario; //Aqui obtenemos el usuario a traves de usar jwt

            conversationRepository.getConversations(
                {_id: conversationRepository.mongo.ObjectID(conversationId)},
                function (conversations) {
                    if (conversations == null || conversations.length == 0) { //Esa conversacion no existe
                        res.status(500); //Error de servidor
                        res.json({
                            error: "Esa conversacion no existe."
                        });
                    } else if (conversations[0].bidOwner == loginUserEmail ||
                        conversations[0].bidInterested == loginUserEmail) {
                        //Es participante, por tanto hay que borrar la conversacion
                        conversationRepository.removeConversation({_id: conversationRepository.mongo.ObjectID(conversationId)},
                            function (conversation) {
                                if (conversation == null) {
                                    res.status(500);
                                    res.json({
                                        mensaje: "Ha ocurrido un error al intentar borrar la conversacion."
                                    });
                                } else {
                                    res.status(200);
                                    res.json({
                                        mensaje: "Conversacion borrada correctamente."
                                    });
                                }
                            });
                    } else {
                        res.status(200);
                        res.json({
                            error: "No eres participante de esa conversacion."
                        });
                    }
                });
        }
    });
}