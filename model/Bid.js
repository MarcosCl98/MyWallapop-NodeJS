module.exports =
    function Bid(title, description, price, userEmail) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.userEmail = userEmail;
        this.date = new Date();
    };