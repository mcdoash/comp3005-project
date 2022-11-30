
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


//checkout addresss
document.getElementById("set-address").addEventListener("click", () => {
    event.preventDefault();
    console.log("ok");
    let address = document.forms["address-form"]["address"].value;
    console.log(address);

    if(!address) {
        alert("Please select an address.");
        return;
    }

    if(address == "new") {
        //show new address form
    }
});

document.getElementById("new-address").addEventListener("click", () => {
    event.preventDefault();
    const form = document.getElementById("set-new-add");
    const formData = new FormData(form);

    let data = {};
    formData.forEach((val, field) => data[field] = val);

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204){
                alert("Address added successfully");
                //redirect?
            }
            if(this.status == 400){
                alert("Invalid address data");
            }
            if(this.status == 401){
                alert("Not logged in");
            }
		}
    }
    req.open("POST", "/accounts/address");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(data));
});