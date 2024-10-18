// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

document.querySelectorAll(".rating input").forEach((input) => {
  input.addEventListener("change", (e) => {
    const ratingValue = e.target.value;
    const result = document.getElementById("rating-result");
    result.textContent = `Your rating: ${ratingValue} Star${
      ratingValue > 1 ? "s" : ""
    }`;
    result.style.color = "black"; // Change color on rating
  });
});


// Toggle tax info display
let taxSwitch = document.getElementById("flexSwitchCheckDefault");
taxSwitch.addEventListener("click", () => {
  let taxInfo = document.getElementsByClassName("tax-info");
  for (let info of taxInfo) {
    info.style.display = info.style.display !== "inline" ? "inline" : "none";
  }
});

// JavaScript code for adding event listeners to the category filters
document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent link default behavior
    const selectedCategory = filter.getAttribute("data-category");
    filterListings(selectedCategory);
  });
});

// Function to filter listings based on the selected category
function filterListings(category) {
  const listings = document.querySelectorAll(".listing-item");
  listings.forEach((listing) => {
    if (
      category === "All" ||
      listing.getAttribute("data-category") === category
    ) {
      listing.style.display = "block"; // Show matching listings
    } else {
      listing.style.display = "none"; // Hide non-matching listings
    }
  });
}
