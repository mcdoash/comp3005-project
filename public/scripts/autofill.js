//publisher autofill
document.getElementById("publisher").addEventListener("input", pubAutofill);

//get names that match current publisher input
function pubAutofill() {
    let text = this.value;

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState == 4) {
            if(this.status == 200) {
                const list = JSON.parse(this.responseText).results;
                if(!list) {
                    alert("Publisher does not exist. Please type an existing publisher or add a new one.");
                }
                else showPubNames(list);
            }
        }
	}
	req.open("GET", "/publishers?name=" + text);
	req.setRequestHeader("Content-Type", "application/json");
	req.send();
}

function showPubNames(names) {
    const list = document.getElementById("pub-names");
    list.innerHTML = ""; //clear

    names.forEach(name => {
        let newName = document.createElement("div"); 
        newName.innerText = name;
        newName.setAttribute("onClick", "setPubName('" + name + "')");
        list.append(newName);
    });
}

//set textbox to selected name
function setPubName(name) {
    document.getElementById("publisher").value = name; 
    document.getElementById("pub-names").innerHTML = ""; //clear
}



//author autofill
document.getElementById("authors").addEventListener("input", authorAutofill);

//get names that match current publisher input
function authorAutofill() {
    //get last item
    let values = this.value.split(", ");
    let text = values[values.length-1];

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState == 4) {
            if(this.status == 200) {
                const list = JSON.parse(this.responseText).results;
                showAuthNames(list);
            }
        }
	}
	req.open("GET", "/authors?name=" + text);
	req.setRequestHeader("Content-Type", "application/json");
	req.send();
}

function showAuthNames(names) {
    const list = document.getElementById("auth-names");
    list.innerHTML = ""; //clear

    names.forEach(name => {
        let newName = document.createElement("div"); 
        newName.innerText = name;
        newName.setAttribute("onClick", "setAuthName('" + name + "')");
        list.append(newName);
    });
}

//set textbox to selected name
function setAuthName(name) {
    let values = document.getElementById("authors").value; 
    values = values.split(", "); 
    values = values.slice(0, -1); //remove last
    values.push(name);
    values = values.join(", ");

    document.getElementById("authors").value = values;
    document.getElementById("auth-names").innerHTML = ""; //clear
}



//genre autofill
document.getElementById("genres").addEventListener("input", genreAutofill);
function genreAutofill() {

}