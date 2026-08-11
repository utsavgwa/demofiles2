/*
 * Waitlist capture for /go/onboard and /go/signin.
 *
 * There is no backend, so "capture" means the visitor's own browser: an entry is written to
 * localStorage, read back on the next visit, and shown in a confirmation panel they can edit,
 * copy, or delete. Everything the panel displays came from the person reading it.
 *
 * Progressive enhancement: without this file the form is inert and says so in a <noscript>.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'boz.waitlist.v1';
  var QUEUE_FLOOR = 1200; // the queue "starts" here so a first entry does not read as #1
  var QUEUE_SPREAD = 900;

  /* ---------------------------------------------------------------- storage */

  // Safari in private mode throws on setItem, and storage can be disabled outright.
  // Every access is guarded so a storage failure degrades to "not saved" rather than a crash.
  var store = {
    read: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null;
      }
    },
    write: function (entry) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
        return true;
      } catch (err) {
        return false;
      }
    },
    clear: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        /* nothing we can do, and nothing the visitor needs to know */
      }
    },
  };

  /* -------------------------------------------------------------- utilities */

  // FNV-1a. Small, stable, and dependency-free: the same email always yields the same
  // reference and queue position, so a returning visitor sees the number they saw before.
  function hash(value) {
    var h = 0x811c9dc5;
    for (var i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }

  function referenceFrom(seed) {
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 — these get read aloud
    var code = '';
    var n = seed;
    for (var i = 0; i < 4; i++) {
      code += alphabet.charAt(n % alphabet.length);
      n = Math.floor(n / alphabet.length);
    }
    return 'BOZ-' + code;
  }

  function positionFrom(seed) {
    return QUEUE_FLOOR + (seed % QUEUE_SPREAD);
  }

  function formatNumber(n) {
    return n.toLocaleString('en-GB');
  }

  function formatDateTime(iso) {
    var date = new Date(iso);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  // Deliberately permissive: shape-checking only. Anything stricter rejects valid addresses.
  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  /* ------------------------------------------------------------- validation */

  function setFieldError(input, message) {
    var errorNode = document.getElementById(input.id + '-error');
    if (errorNode) errorNode.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    input.closest('.field').classList.toggle('has-error', Boolean(message));
  }

  var RULES = {
    email: function (value) {
      if (!value) return 'Enter the email we should write to.';
      if (!isEmail(value)) return 'That does not look like an email address.';
      return '';
    },
    child: function (value) {
      if (!value) return 'Enter your child&rsquo;s first name.'.replace('&rsquo;', '’');
      if (value.length > 40) return 'First name only, please.';
      return '';
    },
  };

  /** Validates every field that has a rule. Returns true when the form is clean. */
  function validate(form) {
    var firstInvalid = null;
    Object.keys(RULES).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      var message = RULES[name](input.value.trim());
      setFieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /* ------------------------------------------------------------------ views */

  function panelOf(root) {
    return {
      form: root.querySelector('[data-view="form"]'),
      result: root.querySelector('[data-view="result"]'),
      status: root.querySelector('[data-status]'),
    };
  }

  function fill(root, slot, value) {
    var node = root.querySelector('[data-slot="' + slot + '"]');
    if (node) node.textContent = value;
  }

  function announce(views, message) {
    if (views.status) views.status.textContent = message;
  }

  /**
   * @param {boolean} showResult which view to display
   * @param {boolean} moveFocus true after a submit, false on first paint of a saved entry —
   *   stealing focus on page load would disorient someone who just wanted to read the page.
   */
  function showView(views, showResult, moveFocus) {
    views.form.hidden = showResult;
    views.result.hidden = !showResult;
    if (showResult && moveFocus) views.result.focus();
  }

  /* -------------------------------------------------------------- onboarding */

  function initWaitlist(root) {
    var form = root.querySelector('[data-waitlist-form]');
    var views = panelOf(root);

    function render(entry, moveFocus) {
      fill(root, 'reference', entry.reference);
      fill(root, 'position', '#' + formatNumber(entry.position));
      fill(root, 'email', entry.email);
      fill(root, 'child', entry.child);
      fill(root, 'year', entry.year);
      fill(root, 'book', entry.book);
      fill(root, 'submitted', formatDateTime(entry.createdAt));

      var lede = root.querySelector('.result-lede');
      if (lede) {
        lede.textContent =
          'Thank you — ' + entry.child + '’s place is saved. We will write to ' + entry.email +
          ' when ' + entry.year.toLowerCase() + ' opens.';
      }
      showView(views, true, moveFocus);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validate(form)) {
        announce(views, 'Check the highlighted fields and try again.');
        return;
      }

      var email = form.elements.email.value.trim();
      var seed = hash(email.toLowerCase());
      var entry = {
        email: email,
        child: form.elements.child.value.trim(),
        year: form.elements.year.value,
        book: form.elements.book.value,
        reference: referenceFrom(seed),
        position: positionFrom(seed),
        createdAt: new Date().toISOString(),
      };

      var saved = store.write(entry);
      render(entry, true);
      announce(
        views,
        saved
          ? 'You are on the waitlist at position ' + formatNumber(entry.position) + '. Reference ' + entry.reference + '.'
          : 'You are on the waitlist, but this browser blocked local storage, so the entry will not survive a reload.'
      );
    });

    root.addEventListener('click', function (event) {
      var action = event.target.closest('[data-action]');
      if (!action) return;

      if (action.dataset.action === 'edit') {
        var entry = store.read();
        if (entry) {
          form.elements.email.value = entry.email;
          form.elements.child.value = entry.child;
          form.elements.year.value = entry.year;
          form.elements.book.value = entry.book;
        }
        showView(views, false, false);
        form.elements.email.focus();
        announce(views, 'Editing your details. Submit again to update your entry.');
      }

      if (action.dataset.action === 'copy') {
        var reference = root.querySelector('[data-slot="reference"]').textContent;
        var done = function () {
          announce(views, 'Reference ' + reference + ' copied to your clipboard.');
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText(reference).then(done, function () {
            announce(views, 'Copying was blocked. Your reference is ' + reference + '.');
          });
        } else {
          announce(views, 'Your reference is ' + reference + '.');
        }
      }

      if (action.dataset.action === 'remove') {
        if (!window.confirm('Remove your waitlist entry from this browser? This cannot be undone.')) return;
        store.clear();
        form.reset();
        showView(views, false, false);
        form.elements.email.focus();
        announce(views, 'Your entry has been removed from this browser.');
      }
    });

    var existing = store.read();
    if (existing && existing.email) render(existing, false);
  }

  /* ----------------------------------------------------------------- signin */

  function initSignin(root) {
    var form = root.querySelector('[data-signin-form]');
    var views = panelOf(root);
    var resendTimer = null;

    function render(email, moveFocus) {
      var lede = root.querySelector('.result-lede');
      if (lede) lede.textContent = 'We sent a one-time sign-in link to ' + email + '. It expires in 15 minutes.';

      var aside = root.querySelector('[data-slot="waitlist"]');
      var entry = store.read();
      if (aside && entry && entry.email.toLowerCase() === email.toLowerCase()) {
        aside.hidden = false;
        aside.textContent =
          'We also found your waitlist entry ' + entry.reference + ' at position #' + formatNumber(entry.position) + '.';
      } else if (aside) {
        aside.hidden = true;
      }
      showView(views, true, moveFocus);
    }

    function startResendCooldown(trigger) {
      var seconds = 30;
      trigger.disabled = true;
      var label = trigger.textContent;
      trigger.textContent = 'Resend in ' + seconds + 's';
      clearInterval(resendTimer);
      resendTimer = setInterval(function () {
        seconds -= 1;
        if (seconds <= 0) {
          clearInterval(resendTimer);
          trigger.disabled = false;
          trigger.textContent = label;
          return;
        }
        trigger.textContent = 'Resend in ' + seconds + 's';
      }, 1000);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.elements['signin-email'];
      var message = RULES.email(input.value.trim());
      setFieldError(input, message);
      if (message) {
        input.focus();
        announce(views, message);
        return;
      }
      render(input.value.trim(), true);
      announce(views, 'Sign-in link sent. Check your inbox.');
    });

    root.addEventListener('click', function (event) {
      var action = event.target.closest('[data-action]');
      if (!action) return;

      if (action.dataset.action === 'resend') {
        startResendCooldown(action);
        announce(views, 'We sent another link. Demonstration build, so no email actually leaves.');
      }

      if (action.dataset.action === 'edit') {
        showView(views, false, false);
        form.elements['signin-email'].focus();
        announce(views, 'Enter a different email address.');
      }
    });
  }

  /* ------------------------------------------------------------------- boot */

  var waitlistRoot = document.querySelector('[data-waitlist]');
  if (waitlistRoot) initWaitlist(waitlistRoot);

  var signinRoot = document.querySelector('[data-signin]');
  if (signinRoot) initSignin(signinRoot);
})();
