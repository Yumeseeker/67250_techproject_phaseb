/* MonoMuse — script.js (Increment 4) */

/* Footer year — runs on every page */
function addYear() {
    var el = document.getElementById('copyYear');
    if (el) {
        el.textContent = '\u00A9 ' + new Date().getFullYear() + ' MonoMuse. All rights reserved.';
    }
}

/* Time-based greeting — home page only */
function greeting(h) {
    var el = document.getElementById('greeting');
    if (!el) return;

    var msg;
    if (h < 5 || h >= 20) {
        msg = 'Good evening \u2014 welcome to MonoMuse Tea Museum.';
    } else if (h < 12) {
        msg = 'Good morning \u2014 welcome to MonoMuse Tea Museum.';
    } else if (h < 18) {
        msg = 'Good afternoon \u2014 welcome to MonoMuse Tea Museum.';
    } else {
        msg = 'Good evening \u2014 welcome to MonoMuse Tea Museum.';
    }
    el.textContent = msg;
}

/* Active nav highlight */
function ActiveNav() {
    var navLinks = document.querySelectorAll('nav a');
    if (!navLinks.length) return;

    var currentFile = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(function(link) {
        link.classList.remove('active');
        var hrefFile = link.getAttribute('href').split('/').pop();
        if (currentFile === hrefFile ||
            (currentFile === '' && hrefFile === 'index.html')) {
            link.classList.add('active');
        }
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

        var price    = PRICES[type.value] !== undefined ? PRICES[type.value] : 18;
        var total    = (price * qtyVal).toFixed(2);
        var typeLabel = type.options[type.selectedIndex].text;

        // Pass order data to the confirmation page via sessionStorage
        sessionStorage.setItem('monomuse_order', JSON.stringify({
            date:  date.value,
            type:  typeLabel,
            qty:   qtyVal,
            total: total
        }));

        window.location.href = 'checkout.html?confirmed=1';
    });
}

/* Checkout page — handles both the normal form submit and arriving from tickets page */
function initCheckoutSubmit() {
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    if (currentFile !== 'checkout.html') return;

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

            var checkoutForm = el('checkout-form');
            var confirmation = el('confirmation-section');
            if (checkoutForm) checkoutForm.style.display = 'none';
            if (confirmation) {
                confirmation.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        return;
    }

    // Normal checkout form flow
    var checkoutForm = document.getElementById('checkout-form');
    var confirmation = document.getElementById('confirmation-section');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', function(event) {
        event.preventDefault();

        var visitDate  = document.getElementById('visit-date');
        var ticketType = document.getElementById('ticket-type');
        var quantity   = document.getElementById('quantity');

        var typeLabels = { general: 'General Admission', student: 'Student', member: 'Member' };
        var prices     = { general: 18, student: 10, member: 0 };

        var selectedType = ticketType ? ticketType.value : '';
        var qty   = parseInt(quantity ? quantity.value : 0, 10) || 0;
        var total = (prices[selectedType] || 0) * qty;

        var el = function(id) { return document.getElementById(id); };
        if (el('confirm-date') && visitDate) el('confirm-date').textContent = visitDate.value || '—';
        if (el('confirm-type')) el('confirm-type').textContent = typeLabels[selectedType] || '—';
        if (el('confirm-qty'))  el('confirm-qty').textContent  = qty > 0 ? String(qty) : '—';
        if (el('confirm-total')) el('confirm-total').textContent = '$' + total.toFixed(2);

        checkoutForm.style.display = 'none';
        if (confirmation) {
            confirmation.style.display = 'block';
            confirmation.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/* Init — runs after DOM is ready */
document.addEventListener('DOMContentLoaded', function() {
    addYear();
    ActiveNav();
    initBuyNow();
    initTicketPurchaseForm();
    initCheckoutSubmit();

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
