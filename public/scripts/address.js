//checkout addresss select
document.getElementById("set-address").addEventListener("click", () => {
    event.preventDefault();
    let address = document.forms["address-form"]["address"].value;

    if(!address) {
        alert("Please select an address.");
        return;
    }
    setAddress(parseInt(address));
});

//checkout add new address
document.getElementById("new-address").addEventListener("click", () => {
    event.preventDefault();
    const form = document.getElementById("set-new-add");
    const formData = new FormData(form);

    let data = {};
    formData.forEach((val, field) => data[field] = val);

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 201) {
                alert("Address added successfully");
                let addressId = JSON.parse(this.responseText).id;
                setAddress(addressId);
            }
            if(this.status == 400) {
                alert("Invalid address data");
            }
            if(this.status == 401) {
                alert("Not logged in");
            }
		}
    }
    req.open("POST", "/accounts/address");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(data));
});

//set checkout address
function setAddress(id) {
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204) {
                window.location.href = "/checkout/billing";
            }
            else alert("Error");
		}
    }
    req.open("POST", "/checkout/address");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify({address: id}));
}