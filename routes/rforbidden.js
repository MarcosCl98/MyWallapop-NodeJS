module.exports = function (app, swig) {
    //Pagina de prohibido.
    app.get("/forbidden", function (req, res) {
        var respuesta = swig.renderFile('views/forbidden.html');
        res.send(respuesta);
    });
}