module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },resetearBD: function () {

    this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
        if (err) {
            console.log('err');
        } else {

            var collection = db.collection('users');
            collection.deleteMany({}, function (err, result) {

            });
            console.log('delete');
            collection = db.collection('conversations');
            collection.deleteMany({}, function (err, result) {

            });
            collection = db.collection('bids');
            collection.deleteMany({}, function (err, result) {
            });

            let bidPedro1 = ({
                _id : '5cceba955c059141a0d72b9b',
                title: "Oferta 1 Pedro",
                description: "Oferta de pedro",
                price: "40",
                userEmail: "pedro@gmail.com",
                isSpecial: "on",
                date
                    :"2019-05-01T23:02:47.342+00:00",
            });

            collection = db.collection('bids');
            collection.insert(bidPedro1, function (err, result) {

            });

            let bidPedro2 = ({
                _id : "5ccebaa75c059141a0d72b9c",
                title: "Oferta 2 Pedro",
                description: "Oferta de pedro",
                price: "110",
                userEmail: "pedro@gmail.com",
                isSpecial: null,
                date
                    :"2019-05-01T23:02:47.342+00:00",
            });


            collection = db.collection('bids');
            collection.insert(bidPedro2, function (err, result) {

            });



            let bidPedro3 = ({
                _id : "5ccebab65c059141a0d72b9d",
                title: "Oferta 3 Pedro",
                description: "Oferta de pedro",
                price: "60",
                userEmail: "pedro@gmail.com",
                isSpecial: null,
                date
                    :"2019-05-01T23:02:47.342+00:00",
            });

            collection = db.collection('bids');
            collection.insert(bidPedro3, function (err, result) {

            });

            let bidLaura1 = ({
                _id : "5ccebaee5c059141a0d72b9f",
                title: "Oferta 1 Laura",
                description: "Oferta de laura",
                price: "50",
                userEmail: "laura@gmail.com",
                isSpecial: null,
                date
                    :"2019-05-01T23:02:47.342+00:00",
            });

            collection = db.collection('bids');
            collection.insert(bidLaura1, function (err, result) {

            });

            let bidLaura2 = ({
                _id : "5ccebafd5c059141a0d72ba0",
                title: "Oferta 2 Laura",
                description: "Oferta de laura",
                price: "70",
                userEmail: "laura@gmail.com",
                isSpecial: "on",
                date
                    :"2019-05-01T23:02:47.342+00:00",
            });

            collection = db.collection('bids');
            collection.insert(bidLaura2, function (err, result) {

            });

            let bidMartin1 = ({
                _id : "5ccebb235c059141a0d72ba2",
                title: "Oferta 1 Martin",
                description: "Oferta de Martin",
                price: "20",
                userEmail: "martin@gmail.com",
                isSpecial: "on",
                date
                    :"2019-05-01T23:02:47.342+00:00",
            });

            collection = db.collection('bids');
            collection.insert(bidMartin1, function (err, result) {

            });

            let bidMartin2 = ({
                _id : "5ccebb365c059141a0d72ba3",
                title: "Oferta 2 Martin",
                description: "Oferta de Martin",
                price: "80",
                userEmail: "martin@gmail.com",
                isSpecial: null,
                date
                    :"2019-05-01T23:02:47.342+00:00",
            });

            collection = db.collection('bids');
            collection.insert(bidMartin2, function (err, result) {

            });

            let conversationMartinLaura = ({
                _id : "5ccebb645c059141a0d72ba4",
                bidId :"5ccebafd5c059141a0d72ba0",
                bidOwner :"laura@gmail.com",
                bidInterested:"martin@gmail.com",
                messages:[
                    [ "martin@gmail.com","2019-05-05T10:32:37.267+00:00","Hola Laura",false]
                ]
            });


            collection = db.collection('conversations');
            collection.insert(conversationMartinLaura,function (err, result) {

            });
            let conversationMartinPedro = ({
                _id : '5ccebbc5040ba037541a3dfc',
                bidId :"5ccebb365c059141a0d72ba3",
                bidOwner :"martin@gmail.com",
                bidInterested:"pedro@gmail.com",
                messages:[
                    [ "pedro@gmail.com","2019-05-05T10:32:37.267+00:00","Martin estoy interesado",false]
                ]
            });

            collection = db.collection('conversations');
            collection.insert(conversationMartinPedro,function (err, result) {

            });


            let conversationPedroMartin = ({
                _id : "5ccebdf9f1d52659ec0024f7",
                bidId :"5cceba955c059141a0d72b9b",
                bidOwner :"pedro@gmail.com",
                bidInterested:"martin@gmail.com",
                messages:[
                    [ "martin@gmail.com","2019-05-05T10:32:37.267+00:00","Pedritoo",false]
                ]
            });

            collection = db.collection('conversations');
            collection.insert(conversationPedroMartin,function (err, result) {

            });

            let pedro = ({
                _id : "5cceba7a5c059141a0d72b9a",
                email
                    :"pedro@gmail.com",
                nombre
                    :"Pedro",
                apellido
                    :"Gonzalez",
                password
                    :"3cadb7fcc5c2c9370de3f8ca7c5ea37110cb7a6d791a241c262ffe72e109a7eb",
                money
                    :80
            });
            collection = db.collection('users');
            collection.insert(pedro,function (err, result) {

            });

            let laura = ({
                _id : "5ccebad65c059141a0d72b9e",
                email
                    :"laura@gmail.com",
                nombre
                    :"Laura",
                apellido
                    :"Lopez",
                password
                    :"3cadb7fcc5c2c9370de3f8ca7c5ea37110cb7a6d791a241c262ffe72e109a7eb",
                money
                    :80
            });

            collection = db.collection('users');
            collection.insert(laura,function (err, result) {

            });

            let martin = ({
                _id : "5ccebb105c059141a0d72ba1",
                email
                    :"martin@gmail.com",
                nombre
                    :"Martin",
                apellido
                    :"Prieto",
                password
                    :"3cadb7fcc5c2c9370de3f8ca7c5ea37110cb7a6d791a241c262ffe72e109a7eb",
                money
                    :80
            });

            collection = db.collection('users');
            collection.insert(martin,function (err, result) {

            });

            let admin = ({
                email
                    :"admin@email.com",
                nombre
                    :"admin",
                apellido
                    :"admin",
                password
                    :"ebd5359e500475700c6cc3dd4af89cfd0569aa31724a1bf10ed1e3019dcfdb11",
                money
                    :0
            });
            console.log('insert');
            collection = db.collection('users');
            collection.insert(admin,function (err, result) {
                db.close();
            });



        }
    });

    }
};