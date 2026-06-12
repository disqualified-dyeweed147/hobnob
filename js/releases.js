// Hobnob releases page

// Mobile nav toggle
const toggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      toggle.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });
}

// Fetch releases

(async () => {
  const container = document.getElementById("releases-full");
  if (!container) return;

  try {
    const res = await fetch(
      "https://api.github.com/repos/emberscribe/hobnob/releases?per_page=100"
    );
    if (!res.ok) throw new Error("Failed to fetch releases");

    const releases = await res.json();
    if (!releases.length) {
      container.innerHTML = '<div class="releases-loading">No releases yet.</div>';
      return;
    }

    container.innerHTML = releases
      .map((r) => {
        const date = new Date(r.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        let body = r.body || "";
        body = body.replace(/^\*\*\s*Full Changelog\s*\*\*:.*$/gim, "");
        body = marked.parse(body);

        const prerelease = r.prerelease
          ? '<span class="release-badge">pre-release</span>'
          : "";

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
              ${prerelease}
            </div>
            <div class="release-body">${body}</div>
            ${assets}
          </div>
        `;
      })
      .join("");
  } catch {
    container.innerHTML =
      '<div class="release-error">Could not load releases. Please try again later.</div>';
  }
})();
