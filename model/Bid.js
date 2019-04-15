module.exports =
    function Bid(title, description, price, userEmail, isSpecial) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.userEmail = userEmail;
        this.isSpecial = isSpecial;
        this.date = new Date();
    };