document.addEventListener("DOMContentLoaded", () => {
  document.body.setAttribute("data-hero", "dice");
});

function buildNav(active) {
  return `
    <nav class="nav">
      <div class="nav-inner">
        <a href="index.html" class="brand">
          <span class="brand-mark"></span>
          <span class="brand-name">ryan cooper</span>
          <span class="brand-domain">/ ryancooper.co.uk</span>
        </a>
        <div class="nav-links">
          <a href="index.html" class="${active === 'home' ? 'active' : ''}">Home</a>
          <a href="about.html" class="${active === 'about' ? 'active' : ''}">About</a>
          <a href="projects.html" class="${active === 'projects' ? 'active' : ''}">Projects</a>
          <a href="hobbies.html" class="${active === 'hobbies' ? 'active' : ''}">Hobbies</a>
          <a href="contact.html" class="${active === 'contact' ? 'active' : ''}">Contact</a>
        </div>
      </div>
    </nav>
  `;
}

function buildFooter() {
  const year = new Date().getFullYear();
  return `
    <footer>
      <div class="footer-inner">
        <div>© ${year} Ryan Cooper · Cambridgeshire, UK</div>
        <div>Built with too much tea and questionable dice rolls.</div>
      </div>
    </footer>
  `;
}

function mountLayout(active) {
  const navSlot = document.getElementById("nav-slot");
  const footerSlot = document.getElementById("footer-slot");
  if (navSlot) navSlot.outerHTML = buildNav(active);
  if (footerSlot) footerSlot.outerHTML = buildFooter();
}
