function getCurrentFile() {
  return (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
}

function getCurrentHash() {
  return window.location.hash.toLowerCase();
}

function isHomePage() {
  const file = getCurrentFile();
  return file === "" || file === "index.html";
}

function isProductPage() {
  return Boolean(document.querySelector('meta[property="og:type"][content="product"]'));
}

function ensureShopLinks() {
  document.querySelectorAll(".menu").forEach((menu) => {
    if (menu.querySelector('a[href="shop.html"]')) return;

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "shop.html";
    link.textContent = "Shop";
    item.appendChild(link);

    const blogItem = Array.from(menu.querySelectorAll("li")).find((entry) => {
      const anchor = entry.querySelector("a");
      return anchor && (anchor.getAttribute("href") || "").toLowerCase().includes("blog.html");
    });

    if (blogItem) {
      menu.insertBefore(item, blogItem);
    } else {
      menu.appendChild(item);
    }
  });

  document.querySelectorAll(".footer-links").forEach((group) => {
    if (group.querySelector('a[href="shop.html"]')) return;

    const link = document.createElement("a");
    link.href = "shop.html";
    link.textContent = "Shop";

    const blogLink = Array.from(group.querySelectorAll("a")).find((entry) =>
      ((entry.getAttribute("href") || "").toLowerCase().includes("blog.html"))
    );

    if (blogLink) {
      group.insertBefore(link, blogLink);
    } else {
      group.appendChild(link);
    }
  });
}

function setupReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observerInstance.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 55, 220)}ms`;
    observer.observe(item);
  });
}

function setupYear() {
  const yearNode = document.querySelector("[data-year]");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

function updatePrimaryActiveStates() {
  const links = document.querySelectorAll(".menu a");
  if (!links.length) return;

  const currentFile = getCurrentFile();
  const currentHash = getCurrentHash();
  const isBlogPage = currentFile === "blog.html" || currentFile.startsWith("blog-");
  const isAboutPage = currentFile === "about.html";
  const isShopPage = currentFile === "shop.html" || isProductPage();

  links.forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    let isActive = false;

    if (href === "shop.html") {
      isActive = isShopPage;
    } else if (href.includes("blog.html")) {
      isActive = isBlogPage;
    } else if (href.includes("about.html")) {
      isActive = isAboutPage;
    } else if (href.includes("#categories")) {
      isActive = isHomePage() && currentHash === "#categories";
    } else if (href.includes("#home")) {
      isActive = isHomePage() && (currentHash === "" || currentHash === "#home" || currentHash === "#lookbook");
    }

    if (isActive) {
      link.setAttribute("aria-current", "page");
      link.classList.add("active");
    } else {
      link.removeAttribute("aria-current");
      link.classList.remove("active");
    }
  });
}

function setupMobileMenu() {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = header?.querySelector(".nav");
  const menu = nav?.querySelector(".menu");
  if (!body || !header || !nav || !menu) return;

  body.classList.add("nav-enhanced");

  let toggle = nav.querySelector(".menu-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "menu-toggle";
    toggle.setAttribute("aria-label", "Toggle navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span class="menu-toggle-bar"></span><span class="menu-toggle-bar"></span><span class="menu-toggle-bar"></span>';
    nav.insertBefore(toggle, menu);
  }

  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const nextOpen = !header.classList.contains("is-open");
    header.classList.toggle("is-open", nextOpen);
    toggle.setAttribute("aria-expanded", String(nextOpen));
    body.classList.toggle("menu-open", nextOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("is-open")) return;
    if (!header.contains(event.target)) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeMenu();
  });
}

function setupBottomNav() {
  if (document.querySelector(".mobile-bottom-nav")) return;

  const nav = document.createElement("nav");
  nav.className = "mobile-bottom-nav";
  nav.setAttribute("aria-label", "Quick navigation");

  const links = [
    { label: "Home", href: "index.html#home" },
    { label: "Shop", href: "shop.html" },
    { label: "Categories", href: "index.html#categories" },
    { label: "Blog", href: "blog.html" }
  ];

  links.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    link.dataset.bottomNav = item.label.toLowerCase();
    nav.appendChild(link);
  });

  document.body.appendChild(nav);
}

function updateBottomNavActiveStates() {
  const links = document.querySelectorAll(".mobile-bottom-nav a");
  if (!links.length) return;

  const currentFile = getCurrentFile();
  const currentHash = getCurrentHash();
  const isShopPage = currentFile === "shop.html" || isProductPage();

  links.forEach((link) => {
    const key = link.dataset.bottomNav;
    let isActive = false;

    if (key === "shop") {
      isActive = isShopPage;
    } else if (key === "blog") {
      isActive = currentFile === "blog.html" || currentFile.startsWith("blog-");
    } else if (key === "categories") {
      isActive = isHomePage() && currentHash === "#categories";
    } else if (key === "home") {
      isActive = isHomePage() && (currentHash === "" || currentHash === "#home" || currentHash === "#lookbook");
    }

    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

ensureShopLinks();
setupReveal();
setupYear();
setupMobileMenu();
setupBottomNav();
updatePrimaryActiveStates();
updateBottomNavActiveStates();
window.addEventListener("hashchange", () => {
  updatePrimaryActiveStates();
  updateBottomNavActiveStates();
});
