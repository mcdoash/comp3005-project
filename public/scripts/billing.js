let addressId;
let data = {};

function addressSelect(id) {
    const addressInputs = document.getElementsByClassName("address");
    if(id == "new") {
        Array.from(addressInputs).forEach((input) => input.setAttribute("required", ""));
        addressId = null;
        document.getElementById("new-address-sect").style.display = "block";
    }
    else {
        Array.from(addressInputs).forEach((input) => input.removeAttribute("required"));
        addressId = id;
        document.getElementById("new-address-sect").style.display = "none";
    }
}

//checkout card select
document.getElementById("set-card").addEventListener("submit", () => {
    event.preventDefault();
    let card = document.forms["billing-form"]["card"].value;

    if(!card) {
        alert("Please select a card.");
        return;
    }
    setCard(parseInt(card));
});

//checkout add new address
document.getElementById("new-card-form").addEventListener("submit", () => {
    event.preventDefault();
    console.log("hmm" + addressId);


    const form = document.getElementById("new-card-form");
    const formData = new FormData(form);
    formData.forEach((val, field) => data[field] = val);
    
    let expiryDate = data.expiry + "-01";
    data.expiry = new Date(expiryDate);

    if(isNaN(Date.parse(data.expiry))) { 
        alert("Invalid expiry date.");
        return;
    }

    //check not expired
    const now = new Date();
    const monthNow = now.getMonth() + 1;
    const yearNow = now.getFullYear();
    const expiryMonth = data.expiry.getMonth();
    const expiryYear = data.expiry.getFullYear();

    if(expiryYear < yearNow || (expiryYear == yearNow && expiryMonth < monthNow)) {
        alert("Invalid expiry date.");
        return;
    }

    //check if need to add address first
    if(addressId == null) {
        addNewAddress();
    }
    else sendNewCard();
});

function sendNewCard() {
    const cardData = {
        card_num: data.card_num,
        name: data.name,
        expiry: data.expiry,
        cvv: data.cvv,
        address: addressId
    }

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 201) {
                alert("Card added successfully");
                let cardId = JSON.parse(this.responseText).id;
                setCard(cardId);
            }
            if(this.status == 400) {
                alert("Invalid card data");
            }
            if(this.status == 401) {
                alert("Not logged in");
            }
            if(this.status == 500) {
                alert("Error creating card");
            }
		}
    }
    req.open("POST", "/accounts/cards");
	req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Accept", "application/json");
	req.send(JSON.stringify(cardData));
}

function addNewAddress() {
    const form = document.getElementById("new-card-form");
    const formData = new FormData(form);
    let data = {
        fname: formData.get("fname"),
        lname: formData.get("lname"),
        street: formData.get("street"),
        city: formData.get("city"),
        province: formData.get("province"),
        postal_code: formData.get("postal_code"),
        country: formData.get("country"),
        phone_num: formData.get("phone_num")
    };

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 201) {
                alert("Address added successfully");
                addressId = JSON.parse(this.responseText).id;
                sendNewCard();
            }
            if(this.status == 400) {
                alert("Invalid address data");
            }
            if(this.status == 401) {
                alert("Not logged in");
            }
            if(this.status == 500) {
                alert("Error creating address");
            }
		}
    }
    req.open("POST", "/accounts/address");
	req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Accept", "application/json");
	req.send(JSON.stringify(data));
}

//set checkout address
function setCard(id) {
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204) {
                window.location.href = "/checkout/confirm";
            }
            else alert("Error");
		}
    }
    req.open("POST", "/checkout/billing");
	req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Accept", "application/json");
	req.send(JSON.stringify({card: id}));
}