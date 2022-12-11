//pagination buttons
function changePage(num) {
    let sParams = new URLSearchParams(window.location.search); //get current
    sParams.set("page", num);
    window.location.href = "/books?" + sParams.toString();
}

//get an order by number
function findOrder() {
    event.preventDefault();
    const num = document.forms["order"]["number"].value;
    window.location.href = "/orders/" + num;
}