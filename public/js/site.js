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
      closeStoryModal();
    }
  });

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    const track = slider.querySelector('[data-slider-track]');
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    if (!track) return;

    const slides = track.querySelectorAll('.slider__slide');
    if (!slides.length) return;

    const gap = 16;
    let timer = null;
    let paused = false;

    const cardStep = function () {
      const card = track.querySelector('.slider__slide');
      return card ? card.getBoundingClientRect().width + gap : 320;
    };

    const atEnd = function () {
      return track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    };

    const scrollByCard = function (direction) {
      if (direction > 0 && atEnd()) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      if (direction < 0 && track.scrollLeft <= 8) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
        return;
      }
      track.scrollBy({ left: direction * cardStep(), behavior: 'smooth' });
    };

    const stopAuto = function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const startAuto = function () {
      stopAuto();
      if (paused || slides.length < 2) return;
      timer = setInterval(function () {
        scrollByCard(1);
      }, 4500);
    };

    const pause = function () {
      paused = true;
      stopAuto();
    };

    const resume = function () {
      paused = false;
      startAuto();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        scrollByCard(-1);
        startAuto();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        scrollByCard(1);
        startAuto();
      });
    }

    slider.addEventListener('mouseenter', pause);
    slider.addEventListener('mouseleave', resume);
    slider.addEventListener('focusin', pause);
    slider.addEventListener('focusout', function (event) {
      if (!slider.contains(event.relatedTarget)) resume();
    });
    track.addEventListener('pointerdown', pause);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto();
      else if (!paused) startAuto();
    });

    startAuto();
  });

  const storyModal = document.querySelector('[data-story-modal]');
  let storyModalLastFocus = null;

  function closeStoryModal() {
    if (!storyModal || storyModal.hidden) return;
    storyModal.hidden = true;
    document.body.classList.remove('story-modal-open');
    if (storyModalLastFocus && typeof storyModalLastFocus.focus === 'function') {
      storyModalLastFocus.focus();
    }
    storyModalLastFocus = null;
  }

  function openStoryModal(trigger) {
    if (!storyModal || !trigger) return;

    const image = storyModal.querySelector('[data-story-modal-image]');
    const title = storyModal.querySelector('[data-story-modal-title]');
    const quote = storyModal.querySelector('[data-story-modal-quote]');
    const meta = storyModal.querySelector('[data-story-modal-meta]');
    const closeBtn = storyModal.querySelector('.story-modal__close');

    const name = trigger.getAttribute('data-story-name') || '';
    const role = trigger.getAttribute('data-story-role') || '';
    const storyTitle = trigger.getAttribute('data-story-title') || '';
    const storyQuote = trigger.getAttribute('data-story-quote') || '';
    const storyImage = trigger.getAttribute('data-story-image') || '';

    if (image) {
      image.src = storyImage;
      image.alt = name ? (name + (role ? ', ' + role : '')) : storyTitle;
    }
    if (title) title.textContent = storyTitle;
    if (quote) quote.textContent = storyQuote;
    if (meta) {
      meta.innerHTML = '';
      if (name) {
        const strong = document.createElement('strong');
        strong.textContent = name;
        meta.appendChild(strong);
        if (role) meta.appendChild(document.createTextNode(' — ' + role));
      }
    }

    storyModalLastFocus = trigger;
    storyModal.hidden = false;
    document.body.classList.add('story-modal-open');
    if (closeBtn) closeBtn.focus();
  }

  document.querySelectorAll('[data-story-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openStoryModal(trigger);
    });
  });

  if (storyModal) {
    storyModal.querySelectorAll('[data-story-close]').forEach(function (el) {
      el.addEventListener('click', closeStoryModal);
    });
  }
})();
