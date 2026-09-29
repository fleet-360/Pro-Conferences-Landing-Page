(function () {
  "use strict";

  var C = window.SITE_CONTENT;
  if (!C) {
    console.error("SITE_CONTENT is missing — make sure js/content.js is loaded before js/main.js");
    return;
  }

  var ICONS = {
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    email:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    web:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
  };

  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function setText(id, text) {
    var node = $(id);
    if (node) node.textContent = text || "";
  }

  function setImage(id, src, alt) {
    var node = $(id);
    if (!node) return;
    if (!src) {
      node.hidden = true;
      return;
    }
    node.src = src;
    node.alt = alt || "";
  }

  /* ---------- Render ---------- */

  function renderMeta() {
    document.title = C.meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", C.meta.description);
  }

  function renderHero() {
    setImage("deco-top-right", C.decorations.topRight);
    setImage("deco-top-left", C.decorations.topLeft);
    setImage("hero-logo", C.hero.logo.src, C.hero.logo.alt);
    setText("hero-title", C.hero.title);
    setText("hero-subtitle", C.hero.subtitle);

    var list = $("details");
    C.details.forEach(function (d) {
      var li = el("li", "details__item");
      var img = el("img", "details__icon");
      img.src = d.icon;
      img.alt = "";
      var text = el("p", "details__text");
      text.appendChild(el("span", "details__label", d.label + " "));
      text.appendChild(document.createTextNode(d.value));
      li.appendChild(img);
      li.appendChild(text);
      list.appendChild(li);
    });
  }

  function renderAgenda() {
    setText("agenda-title", C.agenda.title);
    var list = $("agenda-list");
    C.agenda.items.forEach(function (item) {
      var li = el("li", "agenda__item");
      var banner = el("div", "agenda__banner");
      banner.style.backgroundImage = 'url("' + item.image + '")';
      var body = el("div", "agenda__body");
      body.appendChild(el("h3", "agenda__title", item.title));
      body.appendChild(el("p", "agenda__text", item.text));
      li.appendChild(banner);
      li.appendChild(body);
      list.appendChild(li);
    });
  }

  function renderSpeakers() {
    var wrap = $("speakers");
    C.speakers.forEach(function (s) {
      var row = el("article", "speaker speaker--image-" + (s.imageSide === "left" ? "left" : "right"));

      var fig = el("figure", "speaker__photo");
      var img = el("img");
      img.src = s.image;
      img.alt = s.name;
      img.loading = "lazy";
      fig.appendChild(img);

      var info = el("div", "speaker__info");
      info.appendChild(el("h2", "speaker__name", s.name));
      if (s.role) info.appendChild(el("p", "speaker__role", s.role));
      if (s.talkTitle) info.appendChild(el("h3", "speaker__talk", s.talkTitle));
      (s.paragraphs || []).forEach(function (p) {
        info.appendChild(el("p", "speaker__text", p));
      });

      row.appendChild(fig);
      row.appendChild(info);
      wrap.appendChild(row);
    });
  }

  function renderRsvp() {
    var R = C.rsvp;
    setText("rsvp-section-title", R.sectionTitle);
    setText("rsvp-title", R.title);
    setText("rsvp-subtitle", R.subtitle);
    setText("rsvp-date", R.dateLabel);
    setText("rsvp-time", R.timeLabel);
    setText("btn-yes", R.attendingYes);
    setText("btn-no", R.attendingNo);
    $("field-name").placeholder = R.fields.name;
    $("field-company").placeholder = R.fields.company;
    $("field-phone").placeholder = R.fields.phone;
    setText("consent-text", R.consent);
    setText("btn-submit", R.submit);
  }

  function renderContact() {
    setText("contact-title", C.contact.title);
    setText("contact-subtitle", C.contact.subtitle);
    var list = $("contact-list");
    C.contact.items.forEach(function (c) {
      var li = el("li");
      var a = el("a", "contact__item");
      a.href = c.href;
      if (/^https?:/.test(c.href)) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      var icon = el("span", "contact__icon");
      icon.innerHTML = ICONS[c.icon] || "";
      a.appendChild(icon);
      a.appendChild(el("strong", "contact__label", c.label));
      var value = el("span", "contact__value", c.value);
      value.dir = "ltr";
      a.appendChild(value);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* ---------- RSVP form ---------- */

  function initForm() {
    var R = C.rsvp;
    var form = $("rsvp-form");
    var msg = $("form-message");
    var submitBtn = $("btn-submit");
    var toggles = form.querySelectorAll(".toggle__btn");
    var attending = "yes";

    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        attending = btn.getAttribute("data-attending");
        toggles.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-checked", active ? "true" : "false");
        });
      });
    });

    function showMessage(text, type) {
      msg.textContent = text;
      msg.className = "form-message" + (type ? " form-message--" + type : "");
    }

    function markInvalid(input, invalid) {
      input.classList.toggle("is-invalid", invalid);
      input.setAttribute("aria-invalid", invalid ? "true" : "false");
    }

    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("is-invalid")) markInvalid(e.target, false);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = $("field-name");
      var phone = $("field-phone");
      var phoneDigits = phone.value.replace(/\D/g, "");

      var nameOk = name.value.trim().length >= 2;
      var phoneOk = phoneDigits.length >= 9 && phoneDigits.length <= 12;
      markInvalid(name, !nameOk);
      markInvalid(phone, !phoneOk);

      if (!nameOk) {
        showMessage(R.messages.nameRequired, "error");
        name.focus();
        return;
      }
      if (!phoneOk) {
        showMessage(R.messages.phoneInvalid, "error");
        phone.focus();
        return;
      }

      var data = {
        attending: attending === "yes",
        name: name.value.trim(),
        company: $("field-company").value.trim(),
        phone: phone.value.trim(),
        consent: $("field-consent").checked,
        submittedAt: new Date().toISOString()
      };

      function onSuccess() {
        showMessage(data.attending ? R.messages.successYes : R.messages.successNo, "success");
        form.reset();
        toggles[0].click();
      }

      if (!R.endpoint) {
        onSuccess();
        return;
      }

      submitBtn.disabled = true;
      fetch(R.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          onSuccess();
        })
        .catch(function (err) {
          console.error(err);
          showMessage(R.messages.error, "error");
        })
        .then(function () {
          submitBtn.disabled = false;
        });
    });
  }

  renderMeta();
  renderHero();
  renderAgenda();
  renderSpeakers();
  renderRsvp();
  renderContact();
  initForm();
})();
