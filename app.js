(function () {
  const data = window.SITE_DATA;
  if (!data || !data.series || !data.series.length) {
    document.getElementById("featured-title").textContent =
      "Lecture data could not be loaded. Please open this page over HTTP, or check videos.js.";
    return;
  }

  const seriesList = data.series;
  const mainSeries = seriesList.find((s) => s.role === "main") || seriesList[0];
  const latestMain = mainSeries.videos[mainSeries.videos.length - 1];

  const els = {
    kicker: document.getElementById("player-kicker"),
    nowTitle: document.getElementById("now-playing-title"),
    poster: document.getElementById("player-poster"),
    playBtn: document.getElementById("play-button"),
    frame: document.getElementById("player-frame"),
    embed: document.getElementById("player-embed"),
    hint: document.getElementById("player-hint"),
    badge: document.getElementById("player-badge"),
    series: document.getElementById("featured-series"),
    title: document.getElementById("featured-title"),
    sub: document.getElementById("featured-sub"),
    nav: document.getElementById("series-nav"),
    sections: document.getElementById("series-sections"),
    search: document.getElementById("episode-search"),
  };

  let current = { seriesId: null, videoId: null, isLatest: false };

  function isLatestMainVideo(series, video) {
    return series.id === mainSeries.id && latestMain && video.id === latestMain.id;
  }

  function embedUrl(videoId, autoplay) {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    if (autoplay) params.set("autoplay", "1");
    return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId) + "?" + params.toString();
  }

  function setPlayer(series, video, { autoplay } = { autoplay: false }) {
    const latest = isLatestMainVideo(series, video);
    current = { seriesId: series.id, videoId: video.id, isLatest: latest };

    els.kicker.textContent = latest ? "Latest weekly lecture" : "Now playing";
    els.nowTitle.textContent = series.title;
    els.series.textContent = series.title;
    els.title.textContent = video.title;
    const parts = [];
    if (video.durationLabel) parts.push(video.durationLabel);
    parts.push("Lecture " + video.position + " of " + series.videos.length);
    if (latest) parts.push("Newest in the weekly series");
    els.sub.textContent = parts.join(" · ");
    els.hint.textContent = latest
      ? series.title + " · latest weekly lecture"
      : series.title;
    els.badge.textContent = latest ? "Latest weekly lecture" : "Now playing";
    els.badge.classList.toggle("is-playing-other", !latest);
    els.poster.src = video.thumbnail;
    els.poster.alt = video.title;

    if (autoplay) {
      startEmbed(video.id);
    } else {
      stopEmbed();
    }

    document.querySelectorAll(".episode-card").forEach((card) => {
      const on = card.dataset.videoId === video.id && card.dataset.seriesId === series.id;
      card.classList.toggle("active", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function stopEmbed() {
    els.frame.classList.remove("is-playing");
    els.embed.hidden = true;
    els.embed.innerHTML = "";
  }

  function startEmbed(videoId) {
    els.embed.hidden = false;
    els.embed.innerHTML =
      '<iframe src="' +
      embedUrl(videoId, true) +
      '" title="YouTube lecture player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    els.frame.classList.add("is-playing");
  }

  function playFromCard(series, video) {
    setPlayer(series, video, { autoplay: true });
    document.getElementById("player-frame").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function shorten(text, n) {
    if (!text) return "";
    const one = text.replace(/\s+/g, " ").trim();
    if (one.length <= n) return one;
    return one.slice(0, n).replace(/\s+\S*$/, "") + "…";
  }

  function renderNav() {
    els.nav.innerHTML = "";
    seriesList.forEach((series) => {
      const a = document.createElement("a");
      a.href = "#" + series.id;
      a.dataset.seriesId = series.id;
      if (series.role === "main") a.classList.add("is-main");
      const navTitle = series.id === "positive-parenting" ? "Positive Parenting" : series.title;
      a.innerHTML =
        navTitle +
        ' <span class="count">(' +
        series.videos.length +
        ")</span>";
      els.nav.appendChild(a);
    });
  }

  function renderSections() {
    els.sections.innerHTML = "";
    seriesList.forEach((series) => {
      const section = document.createElement("section");
      section.className = "wrap series-section" + (series.role === "main" ? " main" : " secondary");
      section.id = series.id;
      section.setAttribute("aria-labelledby", series.id + "-title");

      const lede = shorten(series.description, 220);
      const head = document.createElement("div");
      head.className = "series-head";
      head.innerHTML =
        '<p class="section-kicker">' +
        (series.role === "main" ? "Main series · weekly lectures" : "More from Sukoon-e-Qalb") +
        "</p>" +
        '<div class="title-row">' +
        '<h2 class="section-title" id="' +
        series.id +
        '-title">' +
        series.title +
        "</h2>" +
        '<p class="series-count">' +
        series.videos.length +
        (series.videos.length === 1 ? " lecture" : " lectures") +
        "</p>" +
        "</div>" +
        (lede ? '<p class="lede">' + escapeHtml(lede) + "</p>" : "");

      const grid = document.createElement("div");
      grid.className = "episode-grid";
      grid.id = series.id + "-grid";

      const latestId = series.videos.length ? series.videos[series.videos.length - 1].id : null;

      series.videos.forEach((video) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "episode-card";
        card.dataset.seriesId = series.id;
        card.dataset.videoId = video.id;
        card.dataset.search = (video.title + " " + series.title).toLowerCase();
        card.setAttribute("aria-pressed", "false");

        const isLatest = series.role === "main" && video.id === latestId;
        card.innerHTML =
          '<div class="thumb">' +
          (isLatest ? '<span class="latest-tag">Latest</span>' : "") +
          '<span class="now-tag" hidden>Now playing</span>' +
          '<img src="' +
          video.thumbnail +
          '" alt="" loading="lazy" width="480" height="360">' +
          "</div>" +
          '<div class="card-body">' +
          "<h3>" +
          escapeHtml(video.title) +
          "</h3>" +
          '<p class="meta">Lecture ' +
          video.position +
          (video.durationLabel ? " · " + video.durationLabel : "") +
          "</p>" +
          "</div>";

        // Show now-tag via CSS when active: unhide with a class
        card.addEventListener("click", () => playFromCard(series, video));
        grid.appendChild(card);
      });

      const empty = document.createElement("p");
      empty.className = "no-results";
      empty.textContent = "No lectures in this series match that search.";

      section.appendChild(head);
      section.appendChild(grid);
      section.appendChild(empty);
      els.sections.appendChild(section);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Reveal the now-playing tag on the active card
  const styleFix = document.createElement("style");
  styleFix.textContent =
    ".episode-card .now-tag{display:none}" +
    ".episode-card.active .now-tag{display:block}" +
    ".episode-card.active .now-tag[hidden]{display:block}";
  document.head.appendChild(styleFix);

  els.playBtn.addEventListener("click", () => {
    if (current.videoId) startEmbed(current.videoId);
  });

  els.search.addEventListener("input", () => {
    const q = els.search.value.trim().toLowerCase();
    document.querySelectorAll(".series-section").forEach((section) => {
      let shown = 0;
      section.querySelectorAll(".episode-card").forEach((card) => {
        const match = !q || card.dataset.search.includes(q);
        card.style.display = match ? "" : "none";
        if (match) shown += 1;
      });
      const empty = section.querySelector(".no-results");
      empty.style.display = shown ? "none" : "block";
      section.classList.toggle("is-empty", !shown && !!q);
    });
  });

  // Highlight the current series tab while scrolling
  const tabObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        els.nav.querySelectorAll("a").forEach((a) => {
          a.classList.toggle("is-active", a.dataset.seriesId === id);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  renderNav();
  renderSections();
  document.querySelectorAll(".series-section").forEach((sec) => tabObserver.observe(sec));

  if (latestMain) {
    setPlayer(mainSeries, latestMain, { autoplay: false });
  }

  // Honor hash links after render
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView());
    }
  }
})();
