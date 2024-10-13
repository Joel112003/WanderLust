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



