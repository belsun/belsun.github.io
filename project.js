const params = new URLSearchParams(window.location.search);
const projectParam = params.get("slug") || params.get("id") || "mindbridge";
const root = document.querySelector("#projectRoot");
const title = document.querySelector("#projectTitle");
const subtitle = document.querySelector("#projectSubtitle");
const domain = document.querySelector("#projectDomain");
const meta = document.querySelector("#projectMeta");
const content = document.querySelector("#projectContent");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function usableUrl(url = "") {
  return Boolean(url && !String(url).startsWith("TODO_ADD_"));
}

function projectSlug(project) {
  return project.slug || project.id || "";
}

function projectYear(project) {
  return project.year || project.period || "Now";
}

function projectTags(project) {
  if (Array.isArray(project.tags) && project.tags.length) return project.tags;
  if (Array.isArray(project.stack) && project.stack.length) return project.stack.slice(0, 5);
  return (project.domain || "Project").split("/").map((tag) => tag.trim()).filter(Boolean);
}

function projectOneLine(project) {
  return project.oneLine || project.oneLiner || project.subtitle || "Public case study coming soon.";
}

function youtubeEmbedUrl(url = "") {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : "";
}

function list(items = []) {
  if (!items.length) return "<p>Private research notes available upon request.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function tags(items = []) {
  return `<div class="stack-tags">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function mediaBlock(project) {
  const embedUrl = youtubeEmbedUrl(project.videoUrl || "");
  const gallery = Array.isArray(project.gallery) ? project.gallery.filter(usableUrl) : [];
  const thumbnail = usableUrl(project.thumbnail) ? project.thumbnail : "";
  const images = [...new Set([...(thumbnail ? [thumbnail] : []), ...gallery])].slice(0, 18);
  const galleryHtml = images.length
    ? `<section class="project-media project-gallery">${images.map((src, index) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)} visual ${index + 1}" loading="lazy" />`).join("")}</section>`
    : "";

  if (embedUrl && project.embedVideo !== false) {
    return `<div class="project-media-stack"><section class="project-media project-video"><iframe title="${escapeHtml(project.title)} video" src="${escapeHtml(embedUrl)}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></section>${galleryHtml}</div>`;
  }

  if (usableUrl(project.videoUrl)) {
    const poster = thumbnail || gallery[0] || "";
    const posterVisual = poster
      ? `<img src="${escapeHtml(poster)}" alt="${escapeHtml(project.title)} video poster" loading="lazy" />`
      : '<span class="project-tile-visual" aria-hidden="true"></span>';
    return `<div class="project-media-stack"><a class="project-media project-video-poster" href="${escapeHtml(project.videoUrl)}" target="_blank" rel="noopener">${posterVisual}<span class="video-play-badge">Watch on YouTube</span></a>${galleryHtml}</div>`;
  }

  if (images.length) {
    return galleryHtml;
  }

  return '<section class="project-media project-media-placeholder"><span>Media placeholder</span><p>Public visuals, demos, or diagrams can be added here when ready.</p></section>';
}

function linksBlock(project) {
  const baseLinks = [
    ["GitHub", project.githubUrl || project.links?.github],
    ["Video", project.videoUrl || project.links?.demo],
    ["Paper", project.paperUrl || project.links?.paper],
    ["Press", project.pressUrl || project.links?.press],
  ];
  const extraLinks = Array.isArray(project.links?.extra)
    ? project.links.extra
        .map((item) => [item.label || "Link", item.url || item.href || ""])
        .filter(([, href]) => usableUrl(href))
    : [];
  const links = [...baseLinks, ...extraLinks].filter(([, href]) => usableUrl(href));

  if (!links.length) {
    return '<div class="project-links"><span>Project materials available upon request</span></div>';
  }

  return `<div class="project-links">
    ${links
      .map(([label, href]) =>
        `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`,
      )
      .join("")}
  </div>`;
}

function render(project) {
  const tagList = projectTags(project);
  const sections = project.sections || {};
  const isPartial = project.visibility === "partial";
  root.dataset.project = projectSlug(project);

  document.title = `${project.title} — Wai Ka Sun`;
  title.textContent = project.title;
  subtitle.textContent = projectOneLine(project);
  domain.textContent = project.domain || tagList.join(" / ") || "Project";
  meta.innerHTML = [project.role, projectYear(project), project.status, isPartial ? "public-safe overview" : ""]
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");

  content.innerHTML = `
    ${mediaBlock(project)}
    <section><h2>Project Frame</h2><p>${escapeHtml(projectOneLine(project))}</p>${tags(tagList)}</section>
    <section><h2>Problem</h2><p>${escapeHtml(sections.problem || project.whyItMatters || "This project connects human intent, AI reasoning, and embodied or spatial systems.")}</p></section>
    <section><h2>My Role</h2><p>${escapeHtml(project.role || "Builder")}</p>${list(project.built)}</section>
    <section><h2>Method / Architecture</h2><p>${escapeHtml(sections.approach || "")}</p>${list(project.architecture)}</section>
    <section><h2>Technical Stack</h2>${tags(project.techStack || project.stack || [])}</section>
    <section><h2>What Worked</h2>${list(project.impact)}</section>
    <section><h2>What I Learned</h2><p>${escapeHtml(sections.learning || project.next || "Continue refining the research direction and public documentation.")}</p></section>
    <section><h2>Links</h2>${linksBlock(project)}</section>
    <section class="project-cta"><h2>Contact</h2><p>Interested in this direction?</p><a class="primary-link" href="mailto:sunwaikalithy@gmail.com?subject=${encodeURIComponent(`Project conversation: ${project.title}`)}">Start a conversation</a></section>
  `;
}

async function main() {
  try {
    const [projectsResponse, siteResponse] = await Promise.all([fetch("./content/projects.json"), fetch("./content/site.json")]);
    const projects = await projectsResponse.json();
    const site = await siteResponse.json();
    document.querySelectorAll("[data-cv-link]").forEach((link) => {
      link.href = `${site.cv.file}?v=${encodeURIComponent(site.cv.version)}`;
      link.textContent = link.textContent.trim() === "CV" ? "CV" : site.cv.label;
    });
    const project = projects.find((item) => projectSlug(item) === projectParam || item.id === projectParam) || projects[0];
    render(project);
  } catch (error) {
    root.innerHTML = '<section class="project-hero"><a class="back-link" href="./index.html#work-research">Back to Work / Research</a><h1>Project data could not load.</h1><p>Please check content/projects.json.</p></section>';
    console.error(error);
  }
}

main();
