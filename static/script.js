// Flaga do sprawdzania, czy przewijanie jest w toku
let isScrolling = false;

// Funkcja płynnego przewijania
function smoothScrollTo(element, duration) {
  if (isScrolling) return; // Jeśli przewijanie jest już w toku, nie uruchamiamy kolejnego

  isScrolling = true; // Ustawiamy flagę, że przewijanie jest w toku

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
      isScrolling = false; // Po zakończeniu animacji, resetujemy flagę
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
        smoothScrollTo(entry.target, 1200); // Wolniejsze przewijanie (1.5 sekundy)
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
        fadeObserver.unobserve(entry.target); // tylko raz
      }
    });
  },
  {
    threshold: 0.01, // już od 1px widoczności
  }
);

fadeSections.forEach((section) => {
  fadeObserver.observe(section);
});

// 3. BUTTON CLICK SWIPE DO SEKCJI
function scrollToSection(sectionId) {
  if (isScrolling) return; // Jeśli przewijanie jest już w toku, nie uruchamiamy kolejnego
  const targetSection = document.getElementById(sectionId); // Znajdujemy sekcję o danym ID
  if (targetSection) {
    smoothScrollTo(targetSection, 1200); // Wywołujemy funkcję do płynnego przewijania z określoną długością trwania (1200 ms)
  }
}

// 4. BUTTON CLICK SCROLL TO TOP
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
scrollToTopBtn.addEventListener("click", function () {
  if (isScrolling) return; // Jeśli przewijanie jest już w toku, nie uruchamiamy kolejnego
  smoothScrollTo(document.body, 1200); // Przewijamy do góry strony
});
