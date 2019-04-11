module.exports = function (app, swig, usersRepository) {
    //Lista de usuarios
    app.get("/user/list", function (req, res) {
        usersRepository.getUsers({}, function (users) {
            if (users == null) {
                res.send("No hay ningun usuario.");
            } else {
                var respuesta = swig.renderFile('views/users/list.html',
                    {
                        users: users
                    });
                res.send(respuesta);
            }
        })
    });
}