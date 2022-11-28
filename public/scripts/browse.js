
//pagination buttons
function changePage(num) {
    let sParams = new URLSearchParams(window.location.search); //get current
    sParams.set("page", num);
    window.location.href = "/books?" + sParams.toString();
}