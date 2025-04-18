// ===============================================
// INICJALIZACJA I USTAWIENIA POCZĄTKOWE
// ===============================================

// Flaga sprawdzająca, czy przewijanie jest w toku
let isScrolling = false;

// Przewinięcie na samą górę po załadowaniu
// window.scrollTo(0, 0);

// // ===============================================
// // 1. OBSERWACJA SEKCJI I AUTOMATYCZNE PRZEWIJANIE
// // ===============================================

// document.addEventListener("DOMContentLoaded", function () {
//   const sections = document.querySelectorAll("section");
//   const options = {
//     root: null,
//     threshold: 0.05, // 5% sekcji musi być widoczne
//   };

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting && !isScrolling) {
//         const targetSection = entry.target;
//         setTimeout(() => {
//           smoothScrollTo(targetSection, 1200); // Płynne przewijanie do sekcji
//         }, 50);
//       }
//     });
//   }, options);

//   sections.forEach((section) => {
//     observer.observe(section);
//   });
// });

// ===============================================
// 2. EFEKT FADE-IN (POKAZYWANIE SEKCJI Z ANIMACJĄ)
// ===============================================

const fadeSections = document.querySelectorAll(".reveal");

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target); // Efekt tylko raz
      }
    });
  },
  {
    threshold: 0.01, // Już od 1px widoczności
  }
);

fadeSections.forEach((section) => {
  fadeObserver.observe(section);
});

// ===============================================
// 3. PŁYNNE PRZEWIJANIE DO KONKRETNEJ SEKCJI
// ===============================================

function scrollToSection(sectionId) {
  const targetSection = document.getElementById(sectionId);
  if (targetSection && !isScrolling) {
    smoothScrollTo(targetSection, 1200);
  }
}

// Funkcja do płynnego przewijania do wybranego elementu
function smoothScrollTo(element, duration) {
  if (isScrolling) return;

  isScrolling = true;
  const targetPosition = element.offsetTop;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animationScroll(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const scrollAmount = easeInOutQuad(
      timeElapsed,
      startPosition,
      distance,
      duration
    );
    window.scrollTo(0, scrollAmount);

    if (timeElapsed < duration) {
      requestAnimationFrame(animationScroll);
    } else {
      isScrolling = false;
    }
  }

  // Funkcja easing – łagodniejsze przewijanie
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animationScroll);
}

// ===============================================
// 4. PRZYCISK "SCROLL TO TOP" (PRZEWIJANIE NA GÓRĘ)
// ===============================================

document
  .getElementById("scrollToTopBtn")
  .addEventListener("click", function () {
    smoothScrollTo(document.body, 1200);
  });

window.addEventListener("scroll", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  scrollToTopBtn.style.display = window.scrollY > 100 ? "block" : "none";
});

// ===============================================
// 5. OBSŁUGA FORMULARZA KONTAKTOWEGO + WALIDACJA
// ===============================================

document
  .getElementById("contact-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Zapobiega domyślnemu wysłaniu formularza

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const errorPopup = document.getElementById("error-popup");
    const errorMessage = document.getElementById("error-message");
    const captchaContainer = document.getElementById("captcha-container");

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Funkcja pokazująca błąd
    function showErrorPopup(message) {
      errorMessage.textContent = message;
      errorPopup.classList.remove("hide");
      errorPopup.classList.add("show");
    }

    // Funkcja ukrywająca błąd
    function hideErrorPopup() {
      errorPopup.classList.remove("show");
      errorPopup.classList.add("hide");
    }

    // Walidacja pól formularza
    if (!name || !email || !message) {
      showErrorPopup("Proszę wypełnić wszystkie pola!");
      setTimeout(() => hideErrorPopup(), 3000);
      return;
    }

    if (!emailRegex.test(email)) {
      showErrorPopup("Proszę podać poprawny adres e-mail!");
      setTimeout(() => hideErrorPopup(), 3000);
      return;
    }

    // Pokaż reCAPTCHA
    captchaContainer.style.display = "block";
    setTimeout(() => captchaContainer.classList.add("show"), 10);

    // Sprawdzenie reCAPTCHA
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      showErrorPopup("Proszę przejść CAPTCHA!");
      setTimeout(() => hideErrorPopup(), 3000);
      return;
    }

    // Weryfikacja e-maila przez API
    const response = await fetch("/verify_email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });

    const result = await response.json();

    if (!result.valid) {
      showErrorPopup(result.message);
      setTimeout(() => hideErrorPopup(), 3000);
      return;
    }

    // Sukces – komunikat
    hideErrorPopup();
    Swal.fire({
      title: "Wiadomość wysłana!",
      text: "Dziękujemy za kontakt, odpowiemy jak najszybciej.",
      icon: "success",
      confirmButtonText: "OK",
    });

    // Reset formularza i reCAPTCHA
    const formData = new FormData(event.target);
    event.target.reset();
    grecaptcha.reset();
    captchaContainer.classList.remove("show");
    captchaContainer.style.display = "none";

    // Wysłanie formularza do serwera
    const formResponse = await fetch("/", {
      method: "POST",
      body: formData,
    });

    if (formResponse.status !== 204) {
      Swal.fire("Ups!", "Coś poszło nie tak...", "error");
    }
  });
