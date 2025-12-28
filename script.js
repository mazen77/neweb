// Minimal interactions: theme toggle, active nav highlighting, contact form mailto
(function () {
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeBtn");
  const year = document.getElementById("year");
  const form = document.getElementById("contactForm");

  year.textContent = new Date().getFullYear();

  // Theme: default dark, persist to localStorage
  const stored = localStorage.getItem("theme");
  if (stored === "light") root.dataset.theme = "light";

  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "" : "light";
    if (next) root.dataset.theme = next;
    else delete root.dataset.theme;

    localStorage.setItem("theme", root.dataset.theme === "light" ? "light" : "dark");
  });

  // Active link on scroll
  const links = Array.from(document.querySelectorAll(".nav a"));
  const sections = links
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = () => {
    const y = window.scrollY + 110;
    let current = sections[0]?.id || "";
    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    for (const a of links) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
    }
  };
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  // Contact form: opens email client (no backend)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const subject = encodeURIComponent(`Project Inquiry — ${name || "Website"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}\n\n— Sent from your website`
    );

    window.location.href = `mailto:mazen.bassiso@gmail.com?subject=${subject}&body=${body}`;
  });

  // Data-driven sections (websites + media kit + brands + meeting)
  fetch("data.json")
    .then(r => r.json())
    .then((data) => {
      // Websites
      const websitesGrid = document.getElementById("websitesGrid");
      if (websitesGrid && Array.isArray(data.websites)) {
        websitesGrid.innerHTML = data.websites.map(w => `
          <a class="card card--link" href="${w.url}" target="_blank" rel="noreferrer">
            <div class="card__meta">
              <span class="tag">${w.category || "Website"}</span>
              <span class="muted siteCard__url">${(w.domain || "").replace(/^https?:\/\//,'')}</span>
            </div>
            <h3 class="siteCard__domain">${(w.domain || "").replace(/^https?:\/\//,'')}</h3>
            <p>${w.description || ""}</p>
            <span class="card__go">Open →</span>
          </a>
        `).join("");
      }

      // Media kit audience + stats + note
      const audienceCard = document.getElementById("audienceCard");
      const statsCard = document.getElementById("statsCard");
      const noteCard = document.getElementById("noteCard");
      const mk = data.mediaKit || {};
      if (audienceCard && mk.audience) {
        audienceCard.innerHTML = `
          <h3>Audience</h3>
          <p>${mk.audience.text || ""}</p>
        `;
      }
      if (statsCard && mk.audience?.stats) {
        statsCard.innerHTML = `
          <h3>Reach</h3>
          <div class="chips" aria-label="Audience stats">
            ${mk.audience.stats.map(s => `<span class="chip"><strong>${s.value}</strong> ${s.label}</span>`).join("")}
          </div>
        `;
      }
      if (noteCard && mk.audience?.note) {
        noteCard.innerHTML = `
          <h3>Easy updates</h3>
          <p class="muted">${mk.audience.note}</p>
        `;
      }

      // Packages
      const packagesGrid = document.getElementById("packagesGrid");
      if (packagesGrid && Array.isArray(mk.packages)) {
        packagesGrid.innerHTML = mk.packages.map(p => `
          <article class="card">
            <div class="pkg__top">
              <div>
                <div class="pkg__tier">${p.tier || ""}</div>
                <div class="pkg__price">From ${p.price_from || ""}</div>
                <div class="pkg__meta">
                  <span class="kv">Usage rights: ${p.usage_rights || ""}</span>
                  <span class="kv">${p.included || ""}</span>
                </div>
              </div>
              ${Array.isArray(p.flags) && p.flags.length ? `<span class="flag">${p.flags[0]}</span>` : ``}
            </div>
            <ul class="list">
              ${(p.bullets || []).map(b => `<li>${b}</li>`).join("")}
            </ul>
          </article>
        `).join("");
      }

      // Add-ons
      const addonsList = document.getElementById("addonsList");
      if (addonsList && Array.isArray(mk.addons)) {
        addonsList.innerHTML = mk.addons.map(a => `<li>${a}</li>`).join("");
      }

      // Brands
      const brandsGrid = document.getElementById("brandsGrid");
      if (brandsGrid && data.brands?.items) {
        brandsGrid.innerHTML = data.brands.items.map(b => `
          <div class="brandTile" title="${b.name}">
            <img src="assets/brands/${b.slug}.svg" alt="${b.name} logo tile" loading="lazy" />
          </div>
        `).join("");
      }

      // Meeting buttons
      const meetingActions = document.getElementById("meetingActions");
      if (meetingActions && data.bookMeeting?.links) {
        meetingActions.innerHTML = data.bookMeeting.links.map(l => {
          const has = !!(l.url && l.url.trim());
          return has
            ? `<a class="btn" href="${l.url}" target="_blank" rel="noreferrer">${l.label}</a>`
            : `<a class="btn btn--ghost" href="#" aria-disabled="true" title="Add the 15-min link in data.json">${l.label}</a>`;
        }).join("");
      }
    })
    .catch(() => {
      // If data.json fails, keep page functional (silent).
    });

})();
