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
      closeContentModal();
      closePhotoLightbox();
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

  const contentModal = document.querySelector('[data-content-modal]');
  let contentModalLastFocus = null;
  let storySlideIndex = 0;

  function parseContentImages(trigger) {
    const holder = trigger.querySelector('[data-content-images]');
    if (holder) {
      try {
        const parsed = JSON.parse(holder.textContent || '[]');
        if (Array.isArray(parsed)) {
          return parsed.map(function (src) { return String(src || '').trim(); }).filter(Boolean);
        }
      } catch (err) {
        // fall through to single image
      }
    }
    const single = trigger.getAttribute('data-content-image') || '';
    return single ? [single] : [];
  }

  function showStorySlide(index) {
    if (!contentModal) return;
    const slider = contentModal.querySelector('[data-story-slider]');
    const slides = contentModal.querySelectorAll('[data-story-slider-track] .story-slider__slide');
    const dots = contentModal.querySelectorAll('[data-story-slider-dots] button');
    if (!slides.length) return;
    storySlideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === storySlideIndex);
    });
    dots.forEach(function (dot, i) {
      const active = i === storySlideIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (slider) slider.classList.toggle('is-single', slides.length < 2);
  }

  function renderStorySlider(urls, title) {
    if (!contentModal) return;
    const wrap = contentModal.querySelector('[data-content-modal-media]');
    const slider = contentModal.querySelector('[data-story-slider]');
    const track = contentModal.querySelector('[data-story-slider-track]');
    const dotsWrap = contentModal.querySelector('[data-story-slider-dots]');
    if (!wrap || !track) return;

    track.innerHTML = '';
    if (dotsWrap) dotsWrap.innerHTML = '';

    if (!urls.length) {
      wrap.hidden = true;
      if (slider) slider.classList.add('is-single');
      return;
    }

    wrap.hidden = false;
    urls.forEach(function (src, i) {
      const slide = document.createElement('div');
      slide.className = 'story-slider__slide' + (i === 0 ? ' is-active' : '');
      const img = document.createElement('img');
      img.src = src;
      img.alt = title || '';
      slide.appendChild(img);
      track.appendChild(slide);

      if (dotsWrap && urls.length > 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Photo ' + (i + 1));
        if (i === 0) dot.setAttribute('aria-current', 'true');
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', function () {
          showStorySlide(i);
        });
        dotsWrap.appendChild(dot);
      }
    });

    storySlideIndex = 0;
    if (slider) slider.classList.toggle('is-single', urls.length < 2);
  }

  function closeContentModal() {
    if (!contentModal || contentModal.hidden) return;
    contentModal.hidden = true;
    document.body.classList.remove('story-modal-open');
    if (contentModalLastFocus && typeof contentModalLastFocus.focus === 'function') {
      contentModalLastFocus.focus();
    }
    contentModalLastFocus = null;
  }

  function openContentModal(trigger) {
    if (!contentModal || !trigger) return;

    const badge = contentModal.querySelector('[data-content-modal-badge]');
    const title = contentModal.querySelector('[data-content-modal-title]');
    const text = contentModal.querySelector('[data-content-modal-text]');
    const meta = contentModal.querySelector('[data-content-modal-meta]');
    const closeBtn = contentModal.querySelector('.story-modal__close');
    const fullEl = trigger.querySelector('[data-content-full]');

    const type = trigger.getAttribute('data-content-type') || 'blog';
    const contentTitle = trigger.getAttribute('data-content-title') || '';
    const contentMeta = trigger.getAttribute('data-content-meta') || '';
    const contentBadge = trigger.getAttribute('data-content-badge') || (type === 'media' ? 'Media' : 'Blog');
    const fullText = fullEl ? fullEl.textContent : '';

    if (badge) badge.textContent = contentBadge;
    if (title) title.textContent = contentTitle;
    if (text) text.textContent = fullText;
    if (meta) meta.textContent = contentMeta;

    renderStorySlider(parseContentImages(trigger), contentTitle);

    contentModal.classList.toggle('story-modal--media', type === 'media');
    contentModalLastFocus = trigger;
    contentModal.hidden = false;
    document.body.classList.add('story-modal-open');
    if (closeBtn) closeBtn.focus();
  }

  document.querySelectorAll('[data-content-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openContentModal(trigger);
    });
  });

  if (contentModal) {
    contentModal.querySelectorAll('[data-content-close]').forEach(function (el) {
      el.addEventListener('click', closeContentModal);
    });
    const prevBtn = contentModal.querySelector('[data-story-slider-prev]');
    const nextBtn = contentModal.querySelector('[data-story-slider-next]');
    if (prevBtn) {
      prevBtn.addEventListener('click', function (event) {
        event.preventDefault();
        showStorySlide(storySlideIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (event) {
        event.preventDefault();
        showStorySlide(storySlideIndex + 1);
      });
    }
    document.addEventListener('keydown', function (event) {
      if (contentModal.hidden) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showStorySlide(storySlideIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
  }

  const photoLightbox = document.querySelector('[data-photo-lightbox]');
  let photoLightboxLastFocus = null;
  let photoSlideIndex = 0;

  function closePhotoLightbox() {
    if (!photoLightbox || photoLightbox.hidden) return;
    photoLightbox.hidden = true;
    document.body.classList.remove('story-modal-open');
    if (photoLightboxLastFocus && typeof photoLightboxLastFocus.focus === 'function') {
      photoLightboxLastFocus.focus();
    }
    photoLightboxLastFocus = null;
  }

  function showPhotoSlide(index) {
    if (!photoLightbox) return;
    const slider = photoLightbox.querySelector('[data-photo-slider]');
    const slides = photoLightbox.querySelectorAll('[data-photo-slider-track] .story-slider__slide');
    const dots = photoLightbox.querySelectorAll('[data-photo-slider-dots] button');
    if (!slides.length) return;
    photoSlideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === photoSlideIndex);
    });
    dots.forEach(function (dot, i) {
      const active = i === photoSlideIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (slider) slider.classList.toggle('is-single', slides.length < 2);
  }

  function openPhotoLightbox(urls, title, startIndex, trigger) {
    if (!photoLightbox || !urls.length) return;
    const track = photoLightbox.querySelector('[data-photo-slider-track]');
    const dotsWrap = photoLightbox.querySelector('[data-photo-slider-dots]');
    const titleEl = photoLightbox.querySelector('[data-photo-lightbox-title]');
    const bodyEl = photoLightbox.querySelector('[data-photo-lightbox-body]');
    const closeBtn = photoLightbox.querySelector('.story-modal__close');
    if (!track) return;

    track.innerHTML = '';
    if (dotsWrap) dotsWrap.innerHTML = '';

    urls.forEach(function (src, i) {
      const slide = document.createElement('div');
      slide.className = 'story-slider__slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = title || '';
      slide.appendChild(img);
      track.appendChild(slide);

      if (dotsWrap && urls.length > 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Photo ' + (i + 1));
        dot.addEventListener('click', function () {
          showPhotoSlide(i);
        });
        dotsWrap.appendChild(dot);
      }
    });

    if (titleEl) titleEl.textContent = title || '';
    if (bodyEl) bodyEl.classList.toggle('is-empty', !title);

    photoLightboxLastFocus = trigger || null;
    photoLightbox.hidden = false;
    document.body.classList.add('story-modal-open');
    showPhotoSlide(startIndex || 0);
    if (closeBtn) closeBtn.focus();
  }

  document.addEventListener('click', function (event) {
    const btn = event.target.closest('[data-photo-open]');
    if (!btn) return;
    const set = btn.closest('[data-photo-set]');
    if (!set) return;
    event.preventDefault();
    const buttons = Array.prototype.slice.call(set.querySelectorAll('[data-photo-open]'));
    const urls = buttons.map(function (el) {
      const img = el.querySelector('img');
      return (img && img.getAttribute('src')) || '';
    }).filter(Boolean);
    const start = Math.max(0, buttons.indexOf(btn));
    const title = set.getAttribute('data-photo-set-title') || '';
    openPhotoLightbox(urls, title, start, btn);
  });

  if (photoLightbox) {
    photoLightbox.querySelectorAll('[data-photo-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closePhotoLightbox);
    });
    const prevBtn = photoLightbox.querySelector('[data-photo-slider-prev]');
    const nextBtn = photoLightbox.querySelector('[data-photo-slider-next]');
    if (prevBtn) {
      prevBtn.addEventListener('click', function (event) {
        event.preventDefault();
        showPhotoSlide(photoSlideIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (event) {
        event.preventDefault();
        showPhotoSlide(photoSlideIndex + 1);
      });
    }
    document.addEventListener('keydown', function (event) {
      if (photoLightbox.hidden) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhotoSlide(photoSlideIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
  }

  function setupPartnersMarquee(root) {
    const viewport = root.querySelector('.partners-marquee__viewport');
    const track = root.querySelector('[data-partners-track]');
    const sourceSet = root.querySelector('[data-partners-set]');
    if (!viewport || !track || !sourceSet) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rebuild = function () {
      // Keep only the source set, then clone until the strip always fills the view.
      while (track.children.length > 1) {
        track.removeChild(track.lastElementChild);
      }

      if (reduceMotion) {
        root.classList.add('is-static');
        return;
      }

      const setWidth = sourceSet.getBoundingClientRect().width;
      if (!setWidth) return;

      const viewportWidth = viewport.clientWidth;
      // Enough copies that two full loops are always on screen while scrolling.
      const needed = Math.max(2, Math.ceil((viewportWidth * 2) / setWidth) + 1);
      for (let i = 1; i < needed; i += 1) {
        const clone = sourceSet.cloneNode(true);
        clone.removeAttribute('data-partners-set');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      }

      track.style.setProperty('--partners-shift', setWidth + 'px');
      track.style.setProperty('--partners-duration', Math.max(18, Math.round(setWidth / 28)) + 's');
      root.classList.add('is-ready');
      track.style.animation = 'none';
      void track.offsetWidth;
      track.style.removeProperty('animation');
    };

    const start = function () {
      rebuild();
    };

    const images = Array.prototype.slice.call(sourceSet.querySelectorAll('img'));
    if (!images.length) {
      start();
    } else {
      let pending = images.length;
      const done = function () {
        pending -= 1;
        if (pending <= 0) start();
      };
      images.forEach(function (img) {
        if (img.complete) done();
        else {
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }
      });
    }

    let resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 150);
    });
  }

  document.querySelectorAll('[data-partners-marquee]').forEach(setupPartnersMarquee);
})();
