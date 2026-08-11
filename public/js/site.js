(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const dropdowns = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));

  function closeDropdown(dropdown) {
    dropdown.classList.remove('is-open');
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.hidden = true;
  }

  function openDropdown(dropdown) {
    dropdown.classList.add('is-open');
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (menu) {
      menu.hidden = false;
      // Keep expanded About links visible inside the scrollable mobile menu
      if (nav && nav.classList.contains('is-open') && typeof menu.scrollIntoView === 'function') {
        window.requestAnimationFrame(function () {
          menu.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
      }
    }
  }

  function closeAllDropdowns(except) {
    dropdowns.forEach(function (dropdown) {
      if (dropdown !== except) closeDropdown(dropdown);
    });
  }

  function closeMobileNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    closeAllDropdowns();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeAllDropdowns();
    });
  }

  dropdowns.forEach(function (dropdown) {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    if (!trigger || !menu) return;

    // Start closed
    closeDropdown(dropdown);

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains('is-open');
      closeAllDropdowns(dropdown);
      if (willOpen) openDropdown(dropdown);
      else closeDropdown(dropdown);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDropdown(dropdown);
        closeMobileNav();
      });
    });
  });

  if (nav) {
    nav.querySelectorAll(':scope > a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
      });
    });
  }

  document.addEventListener('click', function (event) {
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.contains(event.target)) closeDropdown(dropdown);
    });
    if (nav && toggle && nav.classList.contains('is-open')) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        closeMobileNav();
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllDropdowns();
      closeMobileNav();
    }
  });

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    const track = slider.querySelector('[data-slider-track]');
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    if (!track) return;

    const scrollByCard = function (direction) {
      const card = track.querySelector('.campaign-slide');
      const amount = card ? card.getBoundingClientRect().width + 16 : 320;
      track.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    if (prev) prev.addEventListener('click', function () { scrollByCard(-1); });
    if (next) next.addEventListener('click', function () { scrollByCard(1); });
  });
})();
