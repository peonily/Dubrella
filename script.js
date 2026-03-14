function getCurrentFile() {
  return (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
}

function getCurrentHash() {
  return window.location.hash.toLowerCase();
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name)?.toLowerCase() || "";
}

function isHomePage() {
  const file = getCurrentFile();
  return file === "" || file === "index.html";
}

function isProductPage() {
  return Boolean(
    document.querySelector('meta[name="page:type"][content="product"]') ||
      document.querySelector('meta[property="og:type"][content="product"]')
  );
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

function setupShopCatalog() {
  if (getCurrentFile() !== "shop.html") return;

  const sections = Array.from(document.querySelectorAll(".shop-section"));
  if (!sections.length) return;

  const pageSize = 5;
  const categoryLinks = Array.from(document.querySelectorAll("[data-shop-category-link]"));
  const mobileFilterQuery = window.matchMedia("(max-width: 767px)");
  let activeCategoryId = sections[0].id;

  const updateSectionVisibility = (categoryId) => {
    if (!mobileFilterQuery.matches) {
      sections.forEach((section) => {
        section.hidden = false;
      });
      return;
    }

    sections.forEach((section) => {
      section.hidden = section.id !== categoryId;
    });

    const activeSection = sections.find((section) => section.id === categoryId);
    if (activeSection) {
      activeSection.classList.add("is-visible");
    }
  };

  const setActiveCategory = (categoryId) => {
    const resolvedCategoryId = sections.find((section) => section.id === categoryId)
      ? categoryId
      : sections[0].id;
    activeCategoryId = resolvedCategoryId;
    sections.forEach((section) => {
      section.classList.toggle("is-active-category", section.id === resolvedCategoryId);
    });

    categoryLinks.forEach((link) => {
      const isActive = link.dataset.shopCategoryLink === resolvedCategoryId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    updateSectionVisibility(resolvedCategoryId);
  };

  sections.forEach((section) => {
    const cards = Array.from(section.querySelectorAll(".productCard"));
    const countNode = section.querySelector("[data-category-count]");
    const paginationNode = section.querySelector("[data-shop-pagination]");
    const navCountNode = document.querySelector(`[data-shop-category-link="${section.id}"] [data-shop-category-count]`);
    const totalProducts = cards.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
    let currentPage = 1;

    if (navCountNode) {
      navCountNode.textContent = String(totalProducts);
    }

    const updateCount = (startIndex, endIndex) => {
      if (!countNode) return;

      if (totalProducts === 0) {
        countNode.textContent = "No products in this category yet.";
        return;
      }

      if (totalPages === 1) {
        countNode.textContent = `${totalProducts} product${totalProducts === 1 ? "" : "s"} in this category.`;
        return;
      }

      countNode.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalProducts} products.`;
    };

    const renderPagination = () => {
      if (!paginationNode) return;

      paginationNode.innerHTML = "";

      if (totalProducts <= pageSize) {
        paginationNode.hidden = true;
        return;
      }

      paginationNode.hidden = false;

      const makeButton = (label, nextPage, options = {}) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "shopPagination__button";
        button.textContent = label;
        button.disabled = Boolean(options.disabled);
        if (options.active) {
          button.classList.add("is-active");
          button.setAttribute("aria-current", "page");
        }
        button.addEventListener("click", () => {
          currentPage = nextPage;
          render();
        });
        paginationNode.appendChild(button);
      };

      makeButton("Prev", currentPage - 1, { disabled: currentPage === 1 });

      for (let page = 1; page <= totalPages; page += 1) {
        makeButton(String(page), page, { active: page === currentPage });
      }

      makeButton("Next", currentPage + 1, { disabled: currentPage === totalPages });
    };

    const render = () => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalProducts);

      cards.forEach((card, index) => {
        card.hidden = index < startIndex || index >= endIndex;
      });

      updateCount(startIndex, endIndex);
      renderPagination();
    };

    render();
  });

  const scrollToCategory = (categoryId, behavior = "smooth") => {
    const targetSection = sections.find((section) => section.id === categoryId);
    if (!targetSection) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    targetSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : behavior,
      block: "start"
    });
  };

  const syncActiveCategoryFromLocation = () => {
    const requestedCategory = getQueryParam("category");
    const hashCategory = getCurrentHash().replace("#", "");
    const activeCategory = sections.find((section) => section.id === hashCategory)
      ? hashCategory
      : sections.find((section) => section.id === requestedCategory)
        ? requestedCategory
        : sections[0].id;

    setActiveCategory(activeCategory);

    if (hashCategory || requestedCategory) {
      requestAnimationFrame(() => {
        scrollToCategory(activeCategory);
      });
    }
  };

  categoryLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveCategory(link.dataset.shopCategoryLink || "");
    });
  });

  syncActiveCategoryFromLocation();
  window.addEventListener("hashchange", syncActiveCategoryFromLocation);
  mobileFilterQuery.addEventListener("change", () => {
    updateSectionVisibility(activeCategoryId);
  });
}

ensureShopLinks();
setupReveal();
setupYear();
setupMobileMenu();
setupBottomNav();
setupShopCatalog();
updatePrimaryActiveStates();
updateBottomNavActiveStates();
window.addEventListener("hashchange", () => {
  updatePrimaryActiveStates();
  updateBottomNavActiveStates();
});
