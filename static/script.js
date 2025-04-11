// Flaga sprawdzająca, czy przewijanie jest w toku
let isScrolling = false;

// 1. Funkcja płynnego scrolla między sekcjami
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section");
  const options = {
    root: null,
    threshold: 0.05, // 5% sekcji musi być widoczne
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isScrolling) {
        // Sprawdzamy, czy przewijanie nie jest w toku
        const targetSection = entry.target;
        setTimeout(() => {
          smoothScrollTo(targetSection, 1200); // Wolniejsze przewijanie (1.2 sekundy)
        }, 50); // Małe opóźnienie przed przewinięciem
      }
    });
  }, options);

  sections.forEach((section) => {
    observer.observe(section);
  });
});

// 2. Fade-in z czerni dla każdej sekcji poza main
const fadeSections = document.querySelectorAll(".reveal");

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target); // Tylko raz
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

// 3. Funkcja przewijania do sekcji z przycisku
function scrollToSection(sectionId) {
  const targetSection = document.getElementById(sectionId);
  if (targetSection && !isScrolling) {
    smoothScrollTo(targetSection, 1200); // Wolniejsze przewijanie (1.2 sekundy)
  }
}

// Funkcja do płynnego przewijania do wybranego elementu
function smoothScrollTo(element, duration) {
  if (isScrolling) return; // Jeśli przewijanie już trwa, nie wykonuj niczego

  isScrolling = true; // Ustawiamy flagę na true, że przewijanie trwa

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
      isScrolling = false; // Po zakończeniu przewijania ustawiamy flagę na false
    }
  }

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animationScroll);
}

// Funkcja przewijania na samą górę
// Funkcja przewijania na samą górę
document.getElementById('scrollToTopBtn').addEventListener('click', function () {
  smoothScrollTo(document.body, 1200); // Przewijanie na samą górę
});
window.addEventListener("scroll", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  // Sprawdzamy, czy użytkownik przewinął stronę w dół
  if (window.scrollY > 100) {
    scrollToTopBtn.style.display = "block"; // Pokazuje przycisk
  } else {
    scrollToTopBtn.style.display = "none"; // Ukrywa przycisk, gdy użytkownik jest na górze
  }
});

document
  .getElementById("contact-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Zapobiega domyślnemu wysłaniu formularza

    // Pobieramy wartości pól formularza
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const errorPopup = document.getElementById("error-popup");
    const errorMessage = document.getElementById("error-message");
    const captchaContainer = document.getElementById("captcha-container");

    // Regex do walidacji e-maila
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Funkcja, która pokazuje popup
    function showErrorPopup(message) {
      errorMessage.textContent = message;
      errorPopup.classList.remove("hide"); // Usuń klasę hide
      errorPopup.classList.add("show"); // Dodaj klasę show (wślizguje się z boku)
    }

    // Funkcja, która ukrywa popup
    function hideErrorPopup() {
      errorPopup.classList.remove("show"); // Usuwamy klasę show
      errorPopup.classList.add("hide"); // Dodajemy klasę hide (zniknięcie)
    }

    // Sprawdzamy, czy wszystkie pola zostały wypełnione
    if (!name || !email || !message) {
      showErrorPopup("Proszę wypełnić wszystkie pola!"); // Pokazuje popup z błędem
      setTimeout(() => hideErrorPopup(), 3000); // Ukrywa popup po 3 sekundach
      return; // Zatrzymuje dalsze działanie funkcji
    }

    // Sprawdzamy poprawność e-maila za pomocą regex
    if (!emailRegex.test(email)) {
      showErrorPopup("Proszę podać poprawny adres e-mail!"); // Pokazuje popup z błędem
      setTimeout(() => hideErrorPopup(), 3000); // Ukrywa popup po 3 sekundach
      return; // Zatrzymuje dalsze działanie funkcji
    }

    // Pokaż reCAPTCHA dopiero po kliknięciu przycisku "Wyślij"
    captchaContainer.style.display = "block"; // Pokazuje reCAPTCHA
    setTimeout(() => captchaContainer.classList.add("show"), 10); // Płynne wyświetlanie

    // Zatrzymujemy dalszą część funkcji, dopóki użytkownik nie zaznaczy checkboxa
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      showErrorPopup("Proszę przejść CAPTCHA!"); // Jeśli nie przeszło reCAPTCHA
      setTimeout(() => hideErrorPopup(), 3000);
      return;
    }

    // Wysyłamy zapytanie do API Hunter.io w celu weryfikacji, czy e-mail jest poprawny
    const response = await fetch("/verify_email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    const result = await response.json();

    if (!result.valid) {
      showErrorPopup(result.message);
      setTimeout(() => hideErrorPopup(), 3000);
      return; // Zatrzymuje dalsze działanie funkcji
    }

    // Jeśli wszystko jest OK, ukrywamy komunikat o błędzie
    hideErrorPopup(); // Ukrywa popup w przypadku sukcesu

    // Jeśli wszystko jest OK, wyświetlamy powiadomienie o sukcesie
    Swal.fire({
      title: "Wiadomość wysłana!",
      text: "Dziękujemy za kontakt, odpowiemy jak najszybciej.",
      icon: "success",
      confirmButtonText: "OK",
    });

    // Resetuje formularz i reCAPTCHA
    const formData = new FormData(event.target); // Pobiera dane formularza
    event.target.reset(); // Resetuje formularz
    grecaptcha.reset(); // Resetuje reCAPTCHA
    captchaContainer.classList.remove("show");
    captchaContainer.style.display = "none";
    // Wyślij formularz asynchronicznie do serwera
    const formResponse = await fetch("/", {
      method: "POST",
      body: formData,
    });

    // Obsługuje odpowiedź
    if (formResponse.status !== 204) {
      Swal.fire("Ups!", "Coś poszło nie tak...", "error");
    }
  });

