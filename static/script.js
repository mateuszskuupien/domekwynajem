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
