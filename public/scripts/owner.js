function removeBook() {
    event.preventDefault();
    let isbn = document.forms["remove-book"]["isbn"].value;

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204) {
                alert("Book removed successfully");
            }
            else {
                alert(JSON.parse(this.responseText).error);
            }
		}
    }
    req.open("DELETE", "/books/");
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({isbn: isbn}));
}

function restoreBook() {
    event.preventDefault();
    let isbn = document.forms["restore-book"]["isbn"].value;

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 204) {
                alert("Book restored successfully");
                window.location.href = "/books/" + isbn;
            }
            else {
                alert(JSON.parse(this.responseText).error);
            }
		}
    }
    req.open("PUT", "/books/");
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({isbn: isbn}));
}