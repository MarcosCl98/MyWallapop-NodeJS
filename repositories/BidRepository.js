module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    /**
     * Busqueda de bids.
     * @param criterio con el que hacemos las busquedas de las bids
     * @param funcionCallback
     */
    getBids: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                console.log(err);
                funcionCallback(null);
            } else {
                let collection = db.collection('bids');
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
     * Agregar una bid.
     * @param criterio con el que hacemos las busquedas de las bids
     * @param pg
     * @param funcionCallback
     */
    addBid: function (bid, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('bids');
                collection.insert(bid, function (err, result) {
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
     * Actualizamos una bid.
     * @param criterio
     * @param bid
     * @param funcionCallback
     */
    updateBid: function (criterio, bid, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('bids');
                collection.update(criterio, {$set: bid}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Borrar bids
     * @param criterio
     * @param funcionCallback
     */
    removeBidByEmail: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('bids');
                collection.remove({'userEmail': {'$in': criterio}}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    removeBid: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('bids');
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
    },
};