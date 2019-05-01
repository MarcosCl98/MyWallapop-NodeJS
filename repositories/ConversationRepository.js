module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    /**
     * Agregar una conversacion nueva.
     * @param criterio con el que hacemos las busquedas de las bids
     * @param pg
     * @param funcionCallback
     */
    addConversation: function (conversation, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversations');
                collection.insert(conversation, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Busqueda de conversations.
     * @param criterio
     * @param funcionCallback
     */
    getConversations: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                console.log(err);
                funcionCallback(null);
            } else {
                let collection = db.collection('conversations');
                collection.find(criterio).toArray(function (err, bids) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(bids);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Borrado de conversation.
     * @param criterio con el que hacemos la busqueda
     * @param funcionCallback
     */
    removeConversation: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                console.log(err);
                funcionCallback(null);
            } else {
                let collection = db.collection('conversations');
                collection.remove(criterio, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }
};