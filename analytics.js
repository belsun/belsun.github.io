(() => {
  const defaults = {
    enabled: false,
    endpoint: "",
    debug: false,
    respectDoNotTrack: true,
    sampleRate: 1,
  };
  const config = { ...defaults, ...(window.SITE_ANALYTICS || {}) };

  if (!config.enabled || !config.endpoint) return;
  if (config.respectDoNotTrack && (navigator.doNotTrack === "1" || window.doNotTrack === "1")) return;
  if (Math.random() > Number(config.sampleRate || 1)) return;

  const startedAt = performance.now();
  const pageId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const sessionId = getOrCreateStorageId("shero_session_id", sessionStorage);
  const visitorId = getOrCreateStorageId("shero_visitor_id", localStorage);
  const seenImpressions = new Set();
  let dwellSent = false;

  function getOrCreateStorageId(key, storage) {
    try {
      const existing = storage.getItem(key);
      if (existing) return existing;
      const value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      storage.setItem(key, value);
      return value;
    } catch {
      return "";
    }
  }

  function basePayload(event, properties = {}) {
    return {
      event,
      properties,
      pageId,
      sessionId,
      visitorId,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title,
      referrer: document.referrer,
      language: document.documentElement.lang || navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: new Date().toISOString(),
    };
  }

  function track(event, properties = {}, immediate = false) {
    const payload = JSON.stringify(basePayload(event, properties));

    if (config.debug) {
      console.info("[site analytics]", event, properties);
    }

    if (immediate && navigator.sendBeacon) {
      const sent = navigator.sendBeacon(config.endpoint, new Blob([payload], { type: "application/json" }));
      if (sent) return;
    }

    fetch(config.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: immediate,
    }).catch(() => {});
  }

  function elementLabel(element) {
    return (element.getAttribute("aria-label") || element.textContent || element.id || element.className || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function sendDwellEvent() {
    if (dwellSent) return;
    dwellSent = true;
    track("page_dwell", {
      durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
      scrollDepth: Math.round((window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100),
    }, true);
  }

  window.sheroAnalytics = { track };

  track("page_view", {
    prototype: new URLSearchParams(window.location.search).get("prototype") || "",
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button, [data-slug]");
    if (!target) return;

    track("interaction", {
      tag: target.tagName.toLowerCase(),
      label: elementLabel(target),
      href: target.href || "",
      slug: target.dataset.slug || "",
      prototype: target.dataset.prototype || "",
    });
  }, { capture: true });

  document.addEventListener("change", (event) => {
    const target = event.target.closest("select, input, textarea");
    if (!target) return;

    track("control_change", {
      id: target.id || "",
      name: target.name || "",
      value: target.value || "",
      label: elementLabel(target.closest("label") || target),
    });
  }, { capture: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const tile = entry.target;
        const slug = tile.dataset.slug || "";
        if (!entry.isIntersecting || !slug || seenImpressions.has(slug)) return;

        seenImpressions.add(slug);
        track("project_impression", {
          slug,
          title: tile.dataset.title || elementLabel(tile),
          prototype: tile.dataset.prototype || "",
        });
      });
    }, { threshold: 0.55 });

    window.addEventListener("load", () => {
      document.querySelectorAll(".project-tile[data-slug]").forEach((tile) => observer.observe(tile));
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendDwellEvent();
  });
  window.addEventListener("pagehide", sendDwellEvent);
})();
