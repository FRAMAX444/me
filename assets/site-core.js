"use strict";

let SITE_CONFIG = {};
let ABOUT_DATA = {};
let PUBLICATIONS_DATA = [];
let PROJECTS_DATA = { settings: {}, sections: [], projects: [] };
let GITHUB_USERNAME = "";
let LIGHTBOX_IMAGES = [];
let LIGHTBOX_INDEX = 0;
let LIGHTBOX_TITLE = "Gallery";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value) {
  if (!isText(value)) return "";
  const url = value.trim();
  return /^(https?:|mailto:|tel:|#|data\/|assets\/)/i.test(url) ? url : "";
}

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Data loading warning:", error);
    return fallback;
  }
}

function setRoute() {
  const requested = window.location.hash.replace("#", "") || "home";
  const target = document.getElementById(`page-${requested}`) || document.getElementById("page-home");
  $$(".page").forEach((page) => page.classList.toggle("active", page === target));
  $$(".nav a").forEach((link) => link.classList.toggle("active", link.dataset.route === target.id.replace("page-", "")));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function removeOnImageError(img, fallback) {
  if (!img) return;
  img.addEventListener("error", () => {
    if (typeof fallback === "function") fallback(img);
    else img.remove();
  }, { once: true });
}

function renderHome() {
  const profile = SITE_CONFIG.profile || {};
  const images = SITE_CONFIG.images || {};
  const hero = $("#home-hero");
  const card = $("#home-profile-card");
  const imageWrap = $("#home-profile-image-wrap");
  const image = $("#home-profile-image");

  $("#home-name").textContent = profile.name || "Francesco Marrocco";
  $("#home-role").textContent = profile.role || "";
  $("#about-intro").textContent = profile.aboutIntro || "Experience, education, publications and selected information.";

  if (isText(images.homeBackground)) {
    hero.style.backgroundImage = `url("${images.homeBackground.replace(/"/g, "%22")}")`;
  } else {
    hero.classList.add("no-bg");
  }

  if (isText(images.profilePhoto)) {
    image.src = images.profilePhoto;
    image.alt = profile.name || "Profile photo";
    removeOnImageError(image, () => {
      imageWrap.remove();
      card.classList.add("no-photo");
    });
  } else {
    imageWrap.remove();
    card.classList.add("no-photo");
  }

  const quoteBox = $("#home-quote-box");
  if (isText(profile.homeQuote)) {
    $("#home-quote").textContent = `“${profile.homeQuote.trim()}”`;
  } else {
    quoteBox.remove();
  }

  const socials = Object.values(SITE_CONFIG.socials || {}).filter((item) => item?.href);
  const socialGrid = $("#home-social-grid");
  socialGrid.innerHTML = socials.map((item) => {
    const icon = isText(item.icon)
      ? `<span class="home-social-icon-wrap"><img class="home-social-icon" src="${escapeHtml(item.icon)}" alt="" data-social-icon></span>`
      : "";
    const background = isText(item.color) ? ` style="background:${escapeHtml(item.color)}"` : "";
    return `<a class="home-social-card" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer"${background}>${icon}<span class="home-social-text"><strong>${escapeHtml(item.label || "Link")}</strong><span>${escapeHtml(item.handle || item.href)}</span></span></a>`;
  }).join("");

  $$('[data-social-icon]', socialGrid).forEach((img) => removeOnImageError(img, (node) => node.closest(".home-social-icon-wrap")?.remove()));

  const scholarUrl = SITE_CONFIG.socials?.scholar?.href;
  const githubUrl = SITE_CONFIG.socials?.github?.href;
  if (scholarUrl) $("#scholar-button-publications").href = scholarUrl;
  if (githubUrl) $("#github-profile-button").href = githubUrl;
  renderPublicationExtraLinks();
}

function normalizeLink(item, fallbackLabel = "Open") {
  if (!item) return null;
  if (typeof item === "string") return { label: fallbackLabel, url: item, primary: false };
  const url = item.url || item.href || "";
  if (!url) return null;
  return {
    label: item.label || item.name || item.title || fallbackLabel,
    url,
    primary: Boolean(item.primary)
  };
}

function linkButtons(items, className = "inline-link") {
  return asArray(items)
    .map((item) => normalizeLink(item))
    .filter(Boolean)
    .map((item) => `<a class="${className}" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`)
    .join("");
}

function renderPublicationExtraLinks() {
  const source = SITE_CONFIG.publications?.links || SITE_CONFIG.publications?.extraLinks || SITE_CONFIG.publications?.relatedLinks || [];
  const container = $("#publication-extra-links");
  const links = asArray(source).map((item) => normalizeLink(item)).filter(Boolean);
  if (!links.length) {
    container.remove();
    return;
  }
  container.innerHTML = links.map((item) => `<a class="button ${item.primary ? "button-primary" : "button-outline"}" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`).join("");
}

function parsePeriodStart(period) {
  if (!isText(period)) return 0;
  const matches = period.match(/(19|20)\d{2}/g);
  return matches?.length ? Number(matches[0]) : 0;
}

function groupByOrganization(items) {
  const map = new Map();
  asArray(items).forEach((item) => {
    const organization = item.organization || item.institution || "Other";
    if (!map.has(organization)) map.set(organization, []);
    map.get(organization).push(item);
  });
  return [...map.entries()].map(([organization, entries]) => ({
    organization,
    location: entries.find((item) => isText(item.location))?.location || "",
    image: entries.find((item) => item.organizationImage || item.organizationLogo || item.logo || item.institutionImage)?.organizationImage ||
      entries.find((item) => item.organizationLogo)?.organizationLogo ||
      entries.find((item) => item.logo)?.logo ||
      entries.find((item) => item.institutionImage)?.institutionImage || "",
    entries: entries.sort((a, b) => parsePeriodStart(b.period) - parsePeriodStart(a.period))
  }));
}

function computeWeightedAverage(exams) {
  let total = 0;
  let credits = 0;
  asArray(exams).forEach((exam) => {
    if (typeof exam.grade === "number" && typeof exam.credits === "number") {
      total += Math.min(exam.grade, 30) * exam.credits;
      credits += exam.credits;
    }
  });
  return credits ? (total / credits).toFixed(2) : "";
}

function computeSkills(exams) {
  const totals = new Map();
  asArray(exams).forEach((exam) => {
    const credits = typeof exam.credits === "number" ? exam.credits : 1;
    const gradeWeight = typeof exam.grade === "number" ? Math.min(exam.grade, 30) / 30 : 1;
    Object.entries(exam.skills || {}).forEach(([skill, weight]) => {
      totals.set(skill, (totals.get(skill) || 0) + Number(weight || 0) * credits * gradeWeight);
    });
  });
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([skill]) => skill);
}

function renderGallery(images, title) {
  const valid = asArray(images).filter(isText);
  if (!valid.length) return "";
  return `<div class="detail-card"><h4>Gallery</h4><div class="gallery-grid">${valid.map((src, index) => `<button class="gallery-button" type="button" data-gallery-title="${escapeHtml(title)}" data-gallery-index="${index}" data-gallery-images="${escapeHtml(JSON.stringify(valid))}"><img src="${escapeHtml(src)}" alt="${escapeHtml(title)} ${index + 1}" loading="lazy"></button>`).join("")}</div></div>`;
}

function renderExams(exams) {
  const list = asArray(exams);
  if (!list.length) return "";
  return `<div class="detail-card"><h4>Exams</h4><div class="exam-list">${list.map((exam) => {
    const grade = exam.gradeLabel || (typeof exam.grade === "number" ? `${exam.grade}/30` : "");
    const repos = linkButtons(exam.repos || []);
    return `<article class="exam-item"><div class="exam-head"><h5 class="exam-name">${escapeHtml(exam.name || "")}</h5>${grade ? `<span class="chip grade-chip">${escapeHtml(grade)}</span>` : ""}</div>${repos ? `<div class="link-grid" style="margin-top:.7rem">${repos}</div>` : ""}</article>`;
  }).join("")}</div></div>`;
}

function renderHonors(honors) {
  const list = asArray(honors);
  if (!list.length) return "";
  return `<div class="detail-card"><h4>Honors & Awards</h4><div class="detail-stack">${list.map((item) => `<div><strong>${escapeHtml(item.title || "")}</strong>${item.date ? `<div class="meta">${escapeHtml(item.date)}</div>` : ""}${item.description ? `<p class="detail-text" style="margin-top:.35rem">${escapeHtml(item.description)}</p>` : ""}</div>`).join("")}</div></div>`;
}

function renderTimelineEntry(item, kind) {
  const average = kind === "education" ? computeWeightedAverage(item.exams) : "";
  const previewChips = [item.finalGrade, average ? `Average ${average}/30` : "", item.type, item.level].filter(isText);
  const skills = kind === "education" ? computeSkills(item.exams).slice(0, 12) : asArray(item.tags);
  const links = linkButtons(item.links || []);
  const thesis = linkButtons(item.thesis || []);
  const related = linkButtons(item.relatedProjects || []);
  const certificate = item.certificate?.url ? linkButtons([{ label: item.certificate.label || "View certificate", url: item.certificate.url }]) : "";
  const detailBlocks = [
    item.notes ? `<div class="detail-card"><h4>Details</h4><p class="detail-text">${escapeHtml(item.notes)}</p></div>` : "",
    links ? `<div class="detail-card"><h4>Links</h4><div class="link-grid">${links}</div></div>` : "",
    certificate ? `<div class="detail-card"><h4>Certificate</h4><div class="link-grid">${certificate}</div></div>` : "",
    thesis ? `<div class="detail-card"><h4>Thesis</h4><div class="link-grid">${thesis}</div></div>` : "",
    related ? `<div class="detail-card"><h4>Related projects</h4><div class="link-grid">${related}</div></div>` : "",
    renderHonors(item.honors),
    renderExams(item.exams),
    skills.length ? `<div class="detail-card"><h4>${kind === "education" ? "Acquired skills" : "Skills"}</h4><div class="chip-row">${skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div></div>` : "",
    renderGallery(item.images, item.title || item.organization || "Gallery")
  ].filter(Boolean).join("");

  return `<article class="timeline-item"><button class="feed-head" type="button" aria-expanded="false"><span><h3>${escapeHtml(item.title || item.organization || item.institution || "")}</h3><span class="meta">${escapeHtml(item.period || "")}</span>${previewChips.length ? `<span class="chip-row" style="margin-top:.55rem">${previewChips.map((chip) => `<span class="chip grade-chip">${escapeHtml(chip)}</span>`).join("")}</span>` : ""}${item.summary ? `<span class="feed-summary">${escapeHtml(item.summary)}</span>` : ""}</span><span class="feed-chevron" aria-hidden="true">⌄</span></button>${detailBlocks ? `<div class="feed-body"><div class="detail-stack">${detailBlocks}</div></div>` : ""}</article>`;
}

function renderTimeline(container, items, kind) {
  const groups = groupByOrganization(items);
  if (!groups.length) {
    container.innerHTML = `<div class="empty-state">Nessun contenuto disponibile.</div>`;
    return;
  }
  container.innerHTML = groups.map((group) => `<article class="timeline-group"><header class="timeline-org-head">${group.image ? `<img class="timeline-logo" src="${escapeHtml(group.image)}" alt="${escapeHtml(group.organization)}" loading="lazy">` : ""}<div><h3 class="timeline-org-title">${escapeHtml(group.organization)}</h3>${group.location ? `<div class="timeline-org-meta"><span>${escapeHtml(group.location)}</span></div>` : ""}</div></header><div class="timeline-items">${group.entries.map((item) => renderTimelineEntry(item, kind)).join("")}</div></article>`).join("");

  $$(".timeline-logo", container).forEach((img) => removeOnImageError(img));
  $$(".feed-head", container).forEach((button) => button.addEventListener("click", () => {
    const item = button.closest(".timeline-item");
    const open = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  }));
  installGalleryHandlers(container);
}

function renderAbout() {
  renderTimeline($("#experience-list"), ABOUT_DATA.experience || [], "experience");
  renderTimeline($("#education-list"), ABOUT_DATA.education || [], "education");

  const other = ABOUT_DATA.otherExperiences || [];
  $("#other-experiences-section").hidden = !other.length;
  if (other.length) renderTimeline($("#other-experiences-list"), other, "other");

  const languages = ABOUT_DATA.languageSkills || [];
  $("#language-skills-section").hidden = !languages.length;
  if (languages.length) renderTimeline($("#language-skills-list"), languages, "language");
}

function renderPublications() {
  const container = $("#publications-list");
  if (!PUBLICATIONS_DATA.length) {
    container.innerHTML = `<div class="empty-state">No publications available.</div>`;
    return;
  }
  container.innerHTML = PUBLICATIONS_DATA.map((publication, index) => {
    const links = [];
    if (publication.href || publication.url) links.push({ label: publication.hrefLabel || "Open publication", url: publication.href || publication.url, primary: true });
    links.push(...asArray(publication.links).map((item) => normalizeLink(item)).filter(Boolean));
    return `<article class="publication-card surface-card"><span class="eyebrow">${escapeHtml(publication.venue || "Publication")}${publication.year ? ` · ${escapeHtml(publication.year)}` : ""}</span><h2>${escapeHtml(publication.title || "")}</h2><div class="meta">${escapeHtml(asArray(publication.authors).join(", "))}</div>${publication.notes ? `<p class="abstract-preview clamped" id="abstract-${index}">${escapeHtml(publication.notes)}</p><button class="text-button" type="button" data-abstract-toggle="abstract-${index}" aria-expanded="false">Read full abstract</button>` : ""}${links.length ? `<div class="button-row">${links.map((link) => `<a class="button ${link.primary ? "button-primary" : "button-outline"}" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}</article>`;
  }).join("");

  $$('[data-abstract-toggle]', container).forEach((button) => button.addEventListener("click", () => {
    const abstract = document.getElementById(button.dataset.abstractToggle);
    const expanded = abstract.classList.toggle("clamped") === false;
    button.setAttribute("aria-expanded", String(expanded));
    button.textContent = expanded ? "Close abstract" : "Read full abstract";
  }));
}
