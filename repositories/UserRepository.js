module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    /**
     * Busca usuarios usando un criterio.
     * @param criterio con el que hacemos las busquedas de las usuarios
     * @param funcionCallback
     */
    getUsers: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                console.log(err);
                funcionCallback(null);
            } else {
                let collection = db.collection('users');
                collection.find(criterio).toArray(function (err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
    /**
     * Inserta un nuevo usuario a la BBDD.
     * @param usuario
     * @param funcionCallback
     */
    insertUser: function (usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var criterio = {
                    email: usuario.email
                }
                console.log(criterio);
                let collection = db.collection('users');
                collection.find(criterio).toArray(function (err, usuarios) {
                    if (usuarios.length == 0) {
                        collection.insert(usuario, function (err, result) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(result.ops[0]._id);
                            }
                            db.close();
                        });
                    } else {
                        funcionCallback(null);
                    }

                });
            }
        });
    },
    /**
     * Borramos usuarios por criterio ID.
     * @param criterio con el que hacemos el borrado de los usuarios
     * @param funcionCallback
     */
    deleteUser: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('users');
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
    /**
     * Actualizamos un usuario.
     * @param criterio
     * @param user
     * @param funcionCallback
     */
    updateUser: function (criterio, user, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('users');
                collection.update(criterio, {$set: user}, function (err, result) {
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