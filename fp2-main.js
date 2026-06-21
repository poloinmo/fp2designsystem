/**
 * FP2 — Main JavaScript Module
 * Facundo Polo Broker Inmobiliario
 * Funciones compartidas para todas las páginas Blogger.
 */

/* ========================================================
   fp2Relocate — DOM Relocation para Blogger
   Mueve el nodo principal fuera de la estructura de Blogger
   ======================================================== */
function fp2Relocate(selector, marginTop) {
  var page = document.querySelector(selector);
  if (!page) return;

  var el = page.parentElement;
  while (el && el !== document.body) {
    el.style.setProperty('display', 'none', 'important');
    el = el.parentElement;
  }

  document.body.insertBefore(page, document.body.firstChild);
  page.style.setProperty('width', '100%', 'important');
  page.style.setProperty('margin-top', marginTop || '0px', 'important');
}

/* ========================================================
   fp2HideBlogger — Oculta elementos residuales de Blogger
   ======================================================== */
function fp2HideBlogger() {
  var selectors = [
    'h1.entry-title', 'nav#breadcrumb', '.post-header',
    '.post-meta', '.entry-labels', '.breadcrumbs', '.post-footer'
  ];
  selectors.forEach(function(s) {
    document.querySelectorAll(s).forEach(function(el) {
      el.style.setProperty('display', 'none', 'important');
    });
  });
}

/* ========================================================
   fp2InitAOS — Inicializar AOS (Animate On Scroll)
   ======================================================== */
function fp2InitAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }
}

/* ========================================================
   fp2InitLenis — Inicializar Lenis Smooth Scroll
   ======================================================== */
function fp2InitLenis() {
  if (typeof Lenis === 'undefined') return null;

  var lenis = new Lenis({
    duration: 1.2,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

/* ========================================================
   fp2InitFaq — FAQ Accordion (usando Bootstrap Icons)
   ======================================================== */
function fp2InitFaq() {
  var faqSection = document.getElementById('faq');
  if (!faqSection) return;

  faqSection.querySelectorAll('.fp2-faq-btn, button[onclick*="toggleFaq"]').forEach(function(btn) {
    // Remove inline onclick if present
    if (btn.getAttribute('onclick')) {
      btn.removeAttribute('onclick');
    }

    btn.addEventListener('click', function() {
      var content = this.nextElementSibling;
      var icon = this.querySelector('.fp2-faq-icon, .bi-chevron-down');
      var isOpen = content && !content.classList.contains('hidden');

      // Close all
      faqSection.querySelectorAll('.fp2-faq-content, .px-6.pb-5').forEach(function(el) {
        el.classList.add('hidden');
      });
      faqSection.querySelectorAll('.fp2-faq-icon, .bi-chevron-down').forEach(function(el) {
        el.classList.remove('fp2-rotate-180', 'open');
      });

      // Open clicked (if was closed)
      if (!isOpen && content) {
        content.classList.remove('hidden');
        if (icon) {
          icon.classList.add('fp2-rotate-180', 'open');
        }
      }
    });
  });
}

/* ========================================================
   fp2InitForm — Formulario genérico Formspree
   Parámetros:
     formId   — ID del <form>
     fields   — Array de objetos { key, id } para los campos
     subject  — Asunto del email
   ======================================================== */
function fp2InitForm(formId, fields, subject) {
  var form = document.getElementById(formId);
  if (!form) return;

  var btn = form.querySelector('button[type="submit"]');
  var okEl = document.getElementById(formId.replace('form', 'ok').replace('-form', '-ok')) || document.getElementById('lx-ok');
  var errEl = document.getElementById(formId.replace('form', 'err').replace('-form', '-err')) || document.getElementById('lx-err');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (okEl) okEl.classList.add('hidden');
    if (errEl) errEl.classList.add('hidden');

    // Validate email
    var emailField = form.querySelector('input[type="email"]');
    if (emailField && !emailField.value.trim()) {
      emailField.focus();
      return;
    }

    // Build payload
    var payload = { _subject: subject };
    fields.forEach(function(f) {
      var el = document.getElementById(f.id);
      if (el) payload[f.key] = el.value;
    });

    // Loading state
    var origHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = '<i class="bi bi-arrow-clockwise animate-spin"></i> Enviando...';
      btn.disabled = true;
    }

    fetch('https://formspree.io/f/xykbnjgo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(r) {
      if (r.ok || r.next) {
        if (btn) btn.style.display = 'none';
        if (okEl) okEl.classList.remove('hidden');
        form.reset();
      } else {
        throw new Error();
      }
    })
    .catch(function() {
      if (btn) {
        btn.innerHTML = origHTML;
        btn.disabled = false;
      }
      if (errEl) errEl.classList.remove('hidden');
    });
  });
}

/* ========================================================
   fp2InitSlider — Slider de imágenes (Prop-v2)
   ======================================================== */
function fp2InitSlider() {
  var slides = document.querySelectorAll('.fp2-slide');
  if (!slides.length) return;

  var idx = 0;
  var total = slides.length;
  var counter = document.getElementById('fp2-slider-counter');
  var dots = document.querySelectorAll('.fp2-slider-dot');

  function updateCounter() {
    if (counter) counter.textContent = (idx + 1) + ' / ' + total;
  }

  function updateDots() {
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  function goTo(n) {
    slides[idx].classList.remove('active');
    idx = (n + total) % total;
    slides[idx].classList.add('active');
    updateCounter();
    updateDots();
  }

  window.fp2SliderPrev = function() { goTo(idx - 1); };
  window.fp2SliderNext = function() { goTo(idx + 1); };
  window.fp2SliderGo = function(n) { goTo(n); };

  // Touch/swipe support
  var slider = document.querySelector('.fp2-slider');
  if (slider) {
    var touchStartX = 0;
    slider.addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener('touchend', function(e) {
      var diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? window.fp2SliderPrev() : window.fp2SliderNext();
      }
    }, { passive: true });
  }

  updateCounter();
  updateDots();
}

/* ========================================================
   fp2InitTabs — Tabs de multimedia (Prop-v2)
   ======================================================== */
function fp2InitTabs() {
  var tabs = document.querySelectorAll('.fp2-tab[data-tab]');
  if (!tabs.length) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = this.getAttribute('data-tab');

      // Deactivate all
      tabs.forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.fp2-tab-content').forEach(function(c) { c.classList.remove('visible'); });

      // Activate clicked
      this.classList.add('active');
      var content = document.getElementById(target);
      if (content) content.classList.add('visible');
    });
  });
}

/* ========================================================
   fp2InitAccordion — Accordion de bloques (Prop-v2)
   ======================================================== */
function fp2InitAccordion() {
  var headers = document.querySelectorAll('.fp2-accordion-header');
  if (!headers.length) return;

  headers.forEach(function(header) {
    header.addEventListener('click', function() {
      var item = this.closest('.fp2-accordion-item');
      if (!item) return;

      // Toggle current
      var wasOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.fp2-accordion-item').forEach(function(el) {
        el.classList.remove('open');
      });

      // Open if was closed
      if (!wasOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* ========================================================
   fp2InitCalculator — Calculadora de tasación (T-v2)
   ======================================================== */
function fp2InitCalculator() {
  var form = document.getElementById('valuationForm');
  if (!form) return;

  var rangeM2 = document.getElementById('calc-m2');
  var inputM2 = document.getElementById('val-m2-input');
  var rangeAmb = document.getElementById('calc-amb');
  var valAmb = document.getElementById('val-amb');
  var resultVal = document.getElementById('result-value');
  var resultLoading = document.getElementById('result-loading');
  var ctaAfter = document.getElementById('cta-after-result');

  var M2_MAP = [20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,210,220,230,240,250,260,270,280,290,300,320,340,360,380,400,420,440,460,480,500,520,540,560,580,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250];

  var BARRIO_USD = {
    'Alberto Olmedo': 1100, 'Centro': 1300, 'Del Abasto': 900,
    'Echesortu': 1050, 'España y Hospitales': 1000,
    'Jorge Cura': 1250, 'Lourdes': 1400, 'Luis Agote': 1100,
    'Parque': 1150
  };

  function getM2() {
    if (!rangeM2) return 70;
    var sliderIndex = parseInt(rangeM2.value);
    return M2_MAP[Math.min(sliderIndex, M2_MAP.length - 1)];
  }

  function syncM2Display() {
    if (inputM2) inputM2.value = getM2();
  }

  if (rangeM2) {
    rangeM2.addEventListener('input', syncM2Display);
    syncM2Display();
  }

  if (inputM2) {
    inputM2.addEventListener('input', function() {
      var val = parseInt(this.value) || 20;
      val = Math.max(20, Math.min(val, 1250));
      var closest = 0;
      var minDiff = Infinity;
      M2_MAP.forEach(function(m, i) {
        if (Math.abs(m - val) < minDiff) { minDiff = Math.abs(m - val); closest = i; }
      });
      if (rangeM2) rangeM2.value = closest;
    });
  }

  window.changeM2 = function(delta) {
    if (!rangeM2) return;
    var cur = parseInt(rangeM2.value);
    rangeM2.value = Math.max(0, Math.min(cur + delta, M2_MAP.length - 1));
    syncM2Display();
  };

  if (rangeAmb) {
    rangeAmb.addEventListener('input', function() {
      if (valAmb) valAmb.textContent = this.value;
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var barrio = document.getElementById('calc-barrio');
    if (!barrio || !barrio.value) { barrio.focus(); return; }

    if (resultLoading) { resultLoading.classList.remove('hidden'); resultLoading.style.display = 'flex'; }

    setTimeout(function() {
      var base = BARRIO_USD[barrio.value] || 1100;
      var m2 = getM2();
      var amb = rangeAmb ? parseInt(rangeAmb.value) : 3;
      var ambFactor = 1 + ((amb - 3) * 0.015);
      var lowFactor = 0.9, highFactor = 1.1;
      var totalLow = Math.round(base * m2 * ambFactor * lowFactor);
      var totalHigh = Math.round(base * m2 * ambFactor * highFactor);

      function fmt(n) { return 'USD ' + n.toLocaleString('es-AR'); }

      if (resultVal) resultVal.innerHTML = fmt(totalLow) + '<br/><span class="text-lg fp2-text-on-surface-variant font-medium">a</span><br/>' + fmt(totalHigh);
      if (resultLoading) { resultLoading.classList.add('hidden'); resultLoading.style.display = 'none'; }
      if (ctaAfter) ctaAfter.style.display = 'inline-flex';
    }, 1500);
  });
}

/* ========================================================
   fp2InitShare — Botones de compartir (Prop-v2)
   ======================================================== */
function fp2InitShare() {
  window.fp2Share = function(network) {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    var urls = {
      whatsapp: 'https://wa.me/?text=' + title + '%20' + url,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
      twitter: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
      email: 'mailto:?subject=' + title + '&body=' + url
    };
    if (urls[network]) window.open(urls[network], '_blank');
  };

  window.fp2CopyLink = function() {
    navigator.clipboard.writeText(window.location.href).then(function() {
      var el = document.querySelector('.fp2-copy-feedback');
      if (el) { el.textContent = '¡Copiado!'; setTimeout(function() { el.textContent = 'Copiar'; }, 2000); }
    });
  };
}

/* ========================================================
   fp2InitFavorite — Botón favorito (Prop-v2)
   ======================================================== */
function fp2InitFavorite() {
  var btnFav = document.getElementById('btnFavorito');
  if (btnFav) {
    btnFav.addEventListener('click', function() {
      this.classList.toggle('active');
      var icon = this.querySelector('.bi');
      if (icon) {
        icon.classList.toggle('bi-heart');
        icon.classList.toggle('bi-heart-fill');
      }
    });
  }
}

/* ========================================================
   fp2InitRelatedProperties — Propiedades similares (Prop)
   Carga propiedades desde la API de Blogger
   ======================================================== */
function fp2InitRelatedProperties(labelName) {
  var container = document.getElementById('fp2-related-container');
  if (!container || !labelName) return;

  var blogId = '4578058498799abortearly';
  // Note: This uses the Blogger feeds API - real implementation
  var feedUrl = '/feeds/posts/summary/-/' + encodeURIComponent(labelName) + '?alt=json&max-results=8';

  fetch(feedUrl)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.feed || !data.feed.entry) return;
      var entries = data.feed.entry;
      var currentUrl = window.location.href;

      var html = '';
      entries.forEach(function(entry) {
        var link = '';
        entry.link.forEach(function(l) { if (l.rel === 'alternate') link = l.href; });
        if (link === currentUrl) return;

        var title = entry.title.$t || '';
        var thumb = '';
        if (entry.media$thumbnail) thumb = entry.media$thumbnail.url.replace('/s72-c/', '/s400/');
        var summary = (entry.summary ? entry.summary.$t : '').substring(0, 120);

        html += '<a class="fp2-prop-card" href="' + link + '">';
        html += '<div class="fp2-prop-img" style="background-image:url(\'' + thumb + '\')"></div>';
        html += '<div class="fp2-prop-body">';
        html += '<p class="fp2-prop-address">' + title + '</p>';
        if (summary) html += '<p class="fp2-prop-desc">' + summary + '...</p>';
        html += '<span class="fp2-prop-more">Ver propiedad →</span>';
        html += '</div></a>';
      });

      container.innerHTML = html;
    })
    .catch(function() {
      container.innerHTML = '<p class="text-center fp2-text-gray-500 p-8">No se pudieron cargar propiedades similares.</p>';
    });
}

/* ========================================================
   fp2InitCommon — Inicialización común para todas las páginas
   Llama a: HideBlogger + AOS + Lenis + FAQ
   ======================================================== */
function fp2InitCommon() {
  fp2HideBlogger();
  fp2InitAOS();
  fp2InitLenis();
  fp2InitFaq();
}

/* ========================================================
   toggleFaq — Compatibilidad con onclick inline existente
   ======================================================== */
function toggleFaq(button) {
  var content = button.nextElementSibling;
  var icon = button.querySelector('.bi-chevron-down, .fp2-faq-icon');
  var isOpen = content && !content.classList.contains('hidden');

  var faqSection = document.getElementById('faq');
  if (faqSection) {
    faqSection.querySelectorAll('.px-6.pb-5, .fp2-faq-content').forEach(function(el) { el.classList.add('hidden'); });
    faqSection.querySelectorAll('.bi-chevron-down, .fp2-faq-icon').forEach(function(el) { el.classList.remove('fp2-rotate-180'); });
  }

  if (!isOpen && content) {
    content.classList.remove('hidden');
    if (icon) icon.classList.add('fp2-rotate-180');
  }
}
