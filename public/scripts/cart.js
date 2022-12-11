//add a book to the cart
function addToCart(isbn, title, price) {
    let data = {isbn: isbn, title: title, price: price};

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204) {
                alert("Book added successfully");
            }
            else if(this.status == 400) {
                alert(JSON.parse(this.responseText).error);
            }
            else {
                alert("Error adding book");
            }
		}
    }
    req.open("POST", "/cart");
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Accept", "application/json");
	req.send(JSON.stringify(data));
}

//remove a book from the cart
function removeFromCart(isbn) {
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 204) {
            window.location.reload();
        }
    }
    req.open("DELETE", "/cart/" + isbn);
	req.setRequestHeader("Content-Type", "application/json");
	req.send();
}

//change the quanitity of a pre-existing cart item
function changeQuantity(isbn, input) {
    const val = parseInt(input.value);
    
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState == 4) { 
            if(this.status == 204) {
                window.location.reload();
            }
            else if(this.status == 400) {
                alert(JSON.parse(this.responseText).error);
                input.value = JSON.parse(this.responseText).max;
                window.location.reload();
            }
        }
    }
    req.open("PUT", "/cart/" + isbn);
    req.setRequestHeader("Content-Type", "application/json");

    if(!isNaN(val) && val > 0) { //don't send if invalid
        req.send(JSON.stringify({quantity: val}));
    }
}