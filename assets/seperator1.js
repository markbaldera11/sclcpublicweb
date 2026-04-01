function loadComponent(selector, file) {
  const target = document.querySelector(selector);
  if (!target) return;

  fetch(file)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${file}`);
      }
      return response.text();
    })
    .then((html) => {
      target.innerHTML = html;
    })
    .catch((error) => {
      console.error(error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("#nav-placeholder", "../nav.html");
  loadComponent("#footer-placeholder", "../footer.html");
});