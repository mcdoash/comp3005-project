//close autofill
let canClose = true;
const sects = document.getElementsByClassName("autofill");
Array.from(sects).forEach((sect) => sect.addEventListener("mouseleave", () => {
    canClose = true;
}));
Array.from(sects).forEach((sect) => sect.addEventListener("mouseover", () => {
    canClose = false; //don't close if currently selecting an option
}));


//publisher autofill
document.getElementById("publisher").addEventListener("input", pubAutofill);
document.getElementById("publisher").addEventListener("focus", function() {
    if(this.value == "") pubAutofill();
});
document.addEventListener("focusout", closeOpts);

//get names that match current publisher input
function pubAutofill() {
    let text = this.value;
    if(!text) text = "";

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState == 4) {
            if(this.status == 200) {
                const list = JSON.parse(this.responseText).results;
                if(!list && window.location.pathname == "/owner") {
                    alert("Publisher does not exist. Please type an existing publisher or add a new one.");
                }
                else showPubNames(list);
            }
        }
	}
	req.open("GET", "/publishers?name=" + text);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Accept", "application/json");
	req.send();
}

function showPubNames(names) {
    const list = document.getElementById("pub-names");
    list.innerHTML = ""; //clear

    if(names != null) {
        names.forEach(name => {
            name = name.replace("'", "&#39;"); //escape '
            let newName = document.createElement("div"); 
            newName.innerText = name;
            newName.setAttribute("onClick", 'setPubName("' + name + '")');
            list.append(newName);
        });
    }
}

//set textbox to selected name
function setPubName(name) {
    document.getElementById("publisher").value = name; 
    document.getElementById("pub-names").innerHTML = ""; //clear
}



//author autofill
document.getElementById("authors").addEventListener("input", authorAutofill);
document.getElementById("authors").addEventListener("focus", authorAutofill);
document.getElementById("authors").addEventListener("focusout", closeOpts);

//get names that match current author input
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
    req.setRequestHeader("Accept", "application/json");
	req.send();
}

function showAuthNames(names) {
    const list = document.getElementById("auth-names");
    list.innerHTML = ""; //clear

    if(names != null) {
        names.forEach(name => {
            let newName = document.createElement("div"); 
            newName.innerText = name;
            newName.setAttribute("onClick", 'setAuthName("' + name + '")');
            list.append(newName);
        });
    }
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
document.getElementById("genres").addEventListener("focus", genreAutofill);
document.getElementById("genres").addEventListener("focusout", closeOpts);

function genreAutofill() {
    //get last item
    let values = this.value.split(", ");
    let text = values[values.length-1];

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState == 4) {
            if(this.status == 200) {
                const list = JSON.parse(this.responseText).results;
                showGenreNames(list);
            }
        }
	}
	req.open("GET", "/genres?name=" + text);
	req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Accept", "application/json");
	req.send();
}

function showGenreNames(names) {
    const list = document.getElementById("genre-names");
    list.innerHTML = ""; //clear

    if(names != null) {
        names.forEach(name => {
            let newName = document.createElement("div"); 
            newName.innerText = name;
            newName.setAttribute("onClick", 'setGenreName("' + name + '")');
            newName.className = "opt";
            list.append(newName);
        });
    }
}

//set textbox to selected name
function setGenreName(name) {
    let values = document.getElementById("genres").value; 
    values = values.split(", "); 
    values = values.slice(0, -1); //remove last
    values.push(name);
    values = values.join(", ");

    document.getElementById("genres").value = values;
    document.getElementById("genre-names").innerHTML = ""; //clear
}


//clear all name lists
function closeOpts() {
    if(canClose) {
        document.getElementById("pub-names").innerHTML = "";
        document.getElementById("auth-names").innerHTML = "";
        document.getElementById("genre-names").innerHTML = "";
    }
}