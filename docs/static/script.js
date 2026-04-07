/* MonoMuse — Main Script
   External libraries:
   - jQuery 3.7.1 — MIT License — https://jquery.com (loaded in index.html only)
   - Leaflet 1.9.4 — BSD 2-Clause License — https://leafletjs.com (loaded in explore.html only)
   - Map tiles: OpenStreetMap contributors — ODbL License — https://www.openstreetmap.org/copyright */

/* Footer year — runs on every page */
function addYear() {
  const el = document.getElementById('copyYear');
  if (el) {
    el.textContent = '\u00A9 ' + new Date().getFullYear() + ' MonoMuse. All rights reserved.';
  }
}

/* Time-based greeting — home page only */
function greeting(h) {
  const el = document.getElementById('greeting');
  if (!el) return;

  let msg;
  if (h < 5 || h >= 20) {
    msg = 'Good evening — welcome to MonoMuse Tea Museum.';
  } else if (h < 12) {
    msg = 'Good morning — welcome to MonoMuse Tea Museum.';
  } else if (h < 18) {
    msg = 'Good afternoon — welcome to MonoMuse Tea Museum.';
  } else {
    msg = 'Good evening — welcome to MonoMuse Tea Museum.';
  }
  el.textContent = msg;
}

/* Active nav highlight — matches current URL */
function ActiveNav() {
  const navLinks = document.querySelectorAll('nav a');
  if (!navLinks.length) return;

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(function(link) {
    link.classList.remove('active');
    const hrefFile = link.getAttribute('href').split('/').pop();
    if (currentFile === hrefFile ||
        (currentFile === '' && hrefFile === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* Hamburger menu toggle — mobile only */
function initHamburger() {
  const btn = document.getElementById('hamburger-btn');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', function() {
    const isOpen = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close the menu when a nav link is tapped
  links.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Gallery / slideshow — exhibitions and home */
function initGallery() {
  const container = document.getElementById('gallery');
  if (!container) return;

  const slides = container.querySelectorAll('.slide');
  if (!slides.length) return;

  let current = 0;

  function showSlide(n) {
    slides[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    const indicator = document.getElementById('slideIndicator');
    if (indicator) {
      indicator.textContent = (current + 1) + ' / ' + slides.length;
    }
  }

  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  if (prevBtn) prevBtn.addEventListener('click', function() { showSlide(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { showSlide(current + 1); });

  // Arrow key support when gallery is focused
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') showSlide(current - 1);
    if (e.key === 'ArrowRight') showSlide(current + 1);
  });

  // Auto-advance every 5 seconds
  setInterval(function() { showSlide(current + 1); }, 5000);
}

/* Leaflet map — explore page only */
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  // MonoMuse Tea Museum — Cultural District, Pittsburgh PA
  var museumLat = 40.4462;
  var museumLng = -79.9990;

  var map = L.map('map').setView([museumLat, museumLng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([museumLat, museumLng])
    .addTo(map)
    .bindPopup('<strong>MonoMuse Tea Museum</strong><br>142 Meridian Street<br>Pittsburgh, PA 15222')
    .openPopup();
}

/* Checkout page — full validation, auto-total, and confirmation */
function initCheckout() {
  var form = document.getElementById('checkout-form');
  if (!form) return;

  // If we were redirected here from the tickets purchase form, show confirmation right away
  var params = new URLSearchParams(window.location.search);
  if (params.get('confirmed') === '1') {
    var raw = sessionStorage.getItem('monomuse_order');
    if (raw) {
      var order = JSON.parse(raw);
      sessionStorage.removeItem('monomuse_order');

      var el = function(id) { return document.getElementById(id); };
      if (el('confirm-date'))  el('confirm-date').textContent  = order.date;
      if (el('confirm-type'))  el('confirm-type').textContent  = order.type;
      if (el('confirm-qty'))   el('confirm-qty').textContent   = order.qty;
      if (el('confirm-total')) el('confirm-total').textContent = '$' + order.total;

      form.style.display = 'none';
      var conf = document.getElementById('confirmation-section');
      if (conf) conf.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  // All tickets $18 per rubric spec; auto-total updates on type or quantity change
  var PRICE_PER_TICKET = 18;

  var ticketType = document.getElementById('ticket-type');
  var quantity   = document.getElementById('quantity');
  var totalAmt   = document.getElementById('total-amount');

  function updateTotal() {
    var qty = parseInt(quantity ? quantity.value : 0) || 0;
    if (totalAmt) {
      totalAmt.textContent = '$' + (qty * PRICE_PER_TICKET).toFixed(2);
    }
  }

  if (quantity)   quantity.addEventListener('input', updateTotal);
  if (ticketType) ticketType.addEventListener('change', updateTotal);

  function showError(inputId, msgId, show) {
    var input = document.getElementById(inputId);
    var msg   = document.getElementById(msgId);
    if (!input || !msg) return;
    if (show) {
      input.classList.add('error');
      msg.classList.add('visible');
    } else {
      input.classList.remove('error');
      msg.classList.remove('visible');
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var valid = true;

    var visitDate = document.getElementById('visit-date');
    if (!visitDate || !visitDate.value) {
      showError('visit-date', 'err-visit-date', true);
      valid = false;
    } else {
      showError('visit-date', 'err-visit-date', false);
    }

    var tType = document.getElementById('ticket-type');
    if (!tType || !tType.value) {
      showError('ticket-type', 'err-ticket-type', true);
      valid = false;
    } else {
      showError('ticket-type', 'err-ticket-type', false);
    }

    var qty = document.getElementById('quantity');
    var qtyVal = parseInt(qty ? qty.value : 0);
    if (!qty || !qty.value || qtyVal < 1 || qtyVal > 10) {
      showError('quantity', 'err-quantity', true);
      valid = false;
    } else {
      showError('quantity', 'err-quantity', false);
    }

    var emailEl = document.getElementById('email');
    if (!emailEl || !emailEl.value || !validateEmail(emailEl.value)) {
      showError('email', 'err-email', true);
      valid = false;
    } else {
      showError('email', 'err-email', false);
    }

    // Zip is optional — only validate if something was entered
    var zipEl = document.getElementById('zip');
    if (zipEl && zipEl.value) {
      if (!/^\d{5}$/.test(zipEl.value)) {
        showError('zip', 'err-zip', true);
        valid = false;
      } else {
        showError('zip', 'err-zip', false);
      }
    } else if (zipEl) {
      showError('zip', 'err-zip', false);
    }

    if (!valid) return;

    var finalQty   = parseInt(qty.value) || 0;
    var finalTotal = (finalQty * PRICE_PER_TICKET).toFixed(2);
    var finalType  = tType.options[tType.selectedIndex].text;
    var finalDate  = visitDate.value;

    var el = function(id) { return document.getElementById(id); };
    if (el('confirm-total')) el('confirm-total').textContent = '$' + finalTotal;
    if (el('confirm-date'))  el('confirm-date').textContent  = finalDate;
    if (el('confirm-type'))  el('confirm-type').textContent  = finalType;
    if (el('confirm-qty'))   el('confirm-qty').textContent   = finalQty;

    form.style.display = 'none';
    var conf = document.getElementById('confirmation-section');
    if (conf) conf.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Buy-now reveal + row Buy Now buttons on the tickets page */
function initBuyNow() {
  var btn    = document.getElementById('buy-now-btn');
  var reveal = document.getElementById('purchase-reveal');
  if (!btn || !reveal) return;

  // Main "Buy Tickets Online" button shows the form
  btn.addEventListener('click', function() {
    reveal.style.display = 'block';
    reveal.scrollIntoView({ behavior: 'smooth' });
    btn.style.display = 'none';
  });

  // Per-row Buy Now buttons pre-fill the date and reveal the form
  document.querySelectorAll('.btn-row-buy').forEach(function(rowBtn) {
    rowBtn.addEventListener('click', function() {
      var date = rowBtn.getAttribute('data-date');
      var dateSelect = document.getElementById('purchase-date');
      if (dateSelect && date) dateSelect.value = date;
      reveal.style.display = 'block';
      reveal.scrollIntoView({ behavior: 'smooth' });
      btn.style.display = 'none';
    });
  });
}

/* Ticket purchase form on the tickets page — validates then redirects to confirmation */
function initTicketPurchaseForm() {
  var form = document.getElementById('ticket-purchase-form');
  if (!form) return;

  var PRICES = { general: 18, student: 10, member: 0 };

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var name = document.getElementById('purchase-name');
    var email = document.getElementById('purchase-email');
    var type  = document.getElementById('purchase-type');
    var qty   = document.getElementById('purchase-quantity');
    var date  = document.getElementById('purchase-date');

    if (!name.value.trim() || !email.value.trim() || !type.value || !qty.value || !date.value) {
      alert('Please fill in all required fields.');
      return;
    }

    var qtyVal = parseInt(qty.value, 10);
    if (qtyVal < 1 || qtyVal > 10) {
      alert('Quantity must be between 1 and 10.');
      return;
    }

    var price     = PRICES[type.value] !== undefined ? PRICES[type.value] : 18;
    var total     = (price * qtyVal).toFixed(2);
    var typeLabel = type.options[type.selectedIndex].text;

    sessionStorage.setItem('monomuse_order', JSON.stringify({
      date:  date.value,
      type:  typeLabel,
      qty:   qtyVal,
      total: total
    }));

    alert('Redirecting to payment system.');
    window.location.href = 'checkout.html?confirmed=1';
  });
}

/* Init — runs after DOM is ready */
document.addEventListener('DOMContentLoaded', function() {
  addYear();
  ActiveNav();
  initHamburger();
  initGallery();
  initCheckout();
  initBuyNow();
  initTicketPurchaseForm();
  initMap();

  var now  = new Date();
  var hour = now.getHours();
  greeting(hour);

  // jQuery Read More / Read Less (home page only)
  if (typeof $ !== 'undefined') {
    if ($('#readMore').length) {
      $('#readMore').click(function() {
        $('#longIntro').show();
        $('#readLess').show();
        $('#readMore').hide();
      });

      $('#readLess').click(function() {
        $('#longIntro').hide();
        $('#readLess').hide();
        $('#readMore').show();
      });
    }
  }
});
