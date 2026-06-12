// Hobnob site interactions

// Scroll-reveal animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

document.querySelectorAll(
  ".feature-card, .step, .privacy-inner, .download-card"
).forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});

// Fetch GitHub releases
(async () => {
  const list = document.getElementById("releases-list");
  if (!list) return;

  try {
    const res = await fetch(
      "https://api.github.com/repos/emberscribe/hobnob/releases?per_page=1"
    );
    if (!res.ok) throw new Error("Failed to fetch releases");

    const releases = await res.json();
    if (!releases.length) {
      list.innerHTML = '<div class="releases-loading">No releases yet.</div>';
      return;
    }

    list.innerHTML = releases
      .map((r) => {
        const date = new Date(r.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        let body = r.body || "";
        body = body.replace(/^\*\*\s*Full Changelog\s*\*\*:.*$/gim, "");
        body = marked.parse(body);

        const assets = (r.assets || [])
          .map(
            (a) =>
              `<a href="${a.browser_download_url}" class="release-asset">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 10.81V1.75h1.5v9.06l2.97-2.97 1.06 1.06L8 13.94 3.22 9.16l1.06-1.06 2.97 2.97Z"/></svg>
                ${a.name}
              </a>`
          )
          .join("");

        return `
          <div class="release-item">
            <div class="release-header">
              <span class="release-tag">${r.tag_name}</span>
              <span class="release-date">${date}</span>
            </div>
            <div class="release-body">${body}</div>
            ${assets}
          </div>
        `;
      })
      .join("");
  } catch {
    list.innerHTML =
      '<div class="release-error">Could not load releases. Please try again later.</div>';
  }
})();

// Fetch latest release and wire up download buttons
(async () => {
  const macBtn = document.getElementById("dl-mac");
  const linuxContainer = document.getElementById("dl-linux-buttons");
  if (!macBtn && !linuxContainer) return;

  try {
    const res = await fetch(
      "https://api.github.com/repos/emberscribe/hobnob/releases/latest"
    );
    if (!res.ok) throw new Error("Failed to fetch latest release");

    const release = await res.json();
    const assets = release.assets || [];

    const macAsset = assets.find(
      (a) =>
        /mac|darwin|arm64/i.test(a.name) &&
        /\.(zip|dmg)$/i.test(a.name)
    );

    if (macBtn && macAsset) {
      macBtn.href = macAsset.browser_download_url;
      const macFile = document.getElementById("dl-mac-file");
      if (macFile) macFile.textContent = macAsset.name;
    }

    if (linuxContainer && assets.length) {
      const appImage = assets.find((a) => /\.AppImage$/i.test(a.name));
      const deb = assets.find((a) => /\.deb$/i.test(a.name));
      const pacman = assets.find((a) => /\.pacman$/i.test(a.name));

      const formatLabel = (name) => {
        if (/\.AppImage$/i.test(name)) return "AppImage";
        if (/\.deb$/i.test(name)) return "Debian / Ubuntu";
        if (/\.pacman$/i.test(name)) return "Arch Linux";
        return name;
      };

      const buttons = [appImage, deb, pacman]
        .filter(Boolean)
        .map(
          (a) =>
            `<a href="${a.browser_download_url}" class="dl-format-btn">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 10.81V1.75h1.5v9.06l2.97-2.97 1.06 1.06L8 13.94 3.22 9.16l1.06-1.06 2.97 2.97Z"/></svg>
              <span class="dl-format-label">${formatLabel(a.name)}</span>
              <span class="dl-format-name">${a.name}</span>
            </a>`
        )
        .join("");

      if (buttons) {
        linuxContainer.innerHTML = buttons;
      }
    }
  } catch {
    // Keep fallback links
  }
})();
