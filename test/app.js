// script.js

document.addEventListener("DOMContentLoaded", (event) => {
  // Get the pop-up element
  var popup = document.getElementById("popup");

  // Get the button that opens the pop-up
  var btn = document.getElementById("openPopup");

  // Get the <span> element that closes the pop-up
  var span = document.getElementById("closePopup");

  // When the user clicks the button, open the pop-up
  btn.onclick = function () {
    popup.style.display = "block";
  };

  // When the user clicks on <span> (x), close the pop-up
  span.onclick = function () {
    popup.style.display = "none";
  };

  // When the user clicks anywhere outside of the pop-up, close it
  window.onclick = function (event) {
    if (event.target == popup) {
      popup.style.display = "none";
    }
  };
});
