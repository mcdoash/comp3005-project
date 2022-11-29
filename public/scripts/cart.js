
function addToCart(isbn, title, price) {
    let data = {isbn: isbn, title: title, price: price};

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204){
                alert("Book added successfully");
            }
		}
    }
    req.open("POST", "/cart");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(data));
}