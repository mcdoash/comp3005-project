
function addToCart(isbn, title, price) {
    let data = {isbn: isbn, title: title, price: price};

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204) {
                alert("Book added successfully");
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

function changeQuantity(isbn, input) {
    const val = parseInt(input.value);
    
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 204) {
            window.location.reload();
        }
    }
    req.open("PUT", "/cart/" + isbn);
    req.setRequestHeader("Content-Type", "application/json");

    if(!isNaN(val) && val > 0) { //don't send if invalid
        req.send(JSON.stringify({quantity: val}));
    }
}