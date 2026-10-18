// Kapa's Kafe — shared, dependency-free discovery catalogue.
// All entries point to EXISTING on-site experiences; nothing is sold here.
// New records need a real ISO addedAt date when they are published.
(() => {
  "use strict";

  const entries = Object.freeze([
    { id: "beginning", title: "Where every cup begins", category: "origin", kind: "3D chapter", description: "Meet the single bean that sets the entire journey in motion.", href: "chapter-1", number: "01", addedAt: "2026-10-19", sequence: 1, keywords: "bean highlands papua new guinea png opening", tone: "origin" },
    { id: "our-origin", title: "Before the first sip", category: "origin", kind: "Our story", description: "The Highlands, the people and the importance of an honest origin.", href: "origin", number: "02", addedAt: "2026-10-19", sequence: 2, keywords: "farmers highlands sourcing story papua new guinea", tone: "origin" },
    { id: "suspended", title: "Suspended in warmth", category: "ritual", kind: "3D chapter", description: "Follow the transformation from coffee beans to aromatic grounds.", href: "chapter-2", number: "03", addedAt: "2026-10-19", sequence: 3, keywords: "grinder dust beans suspended roast particles", tone: "ritual" },
    { id: "foundation", title: "The foundation", category: "ritual", kind: "3D chapter", description: "Watch the grounds fall, gather and form the start of a ritual.", href: "chapter-3", number: "04", addedAt: "2026-10-19", sequence: 4, keywords: "coffee grounds vessel texture pour", tone: "ritual" },
    { id: "two-streams", title: "Two streams, exacting", category: "ritual", kind: "3D chapter", description: "An intimate look at slow espresso extraction and golden crema.", href: "chapter-4", number: "05", addedAt: "2026-10-19", sequence: 5, keywords: "espresso cup extraction crema latte", tone: "ritual" },
    { id: "the-route", title: "The journey mapped", category: "journey", kind: "Interactive map", description: "Trace an illustrative route from the PNG Highlands to your city.", href: "route", number: "06", addedAt: "2026-10-19", sequence: 6, keywords: "papua new guinea shipping geography destination map", tone: "journey" },
    { id: "from-png", title: "From PNG to you", category: "journey", kind: "3D chapter", description: "The last chapter: a quiet cup and a connection across oceans.", href: "chapter-5", number: "07", addedAt: "2026-10-19", sequence: 7, keywords: "final cup latte art city map", tone: "journey" },
    { id: "highland", title: "The Highland Edition", category: "collection", kind: "Packaging concept", description: "Explore a rotating coffee-bag concept ahead of the first release.", href: "collection", number: "08", addedAt: "2026-10-19", sequence: 8, keywords: "bag product packaging beans preview coming soon", tone: "collection" },
    { id: "first-pour", title: "The first pour", category: "collection", kind: "Early access", description: "Be among the first to hear when the collection is announced.", href: "first-pour", number: "09", addedAt: "2026-10-19", sequence: 9, keywords: "early access email updates waitlist", tone: "collection" }
  ]);
  const categories = ["all", "origin", "ritual", "journey", "collection"];
  const names = { all: "All", origin: "Origin", ritual: "Ritual", journey: "Journey", collection: "Collection" };
  const sortNames = { newest: "Newest to oldest", oldest: "Oldest to newest", az: "Title: A to Z", za: "Title: Z to A" };
  const lower = value => value.toLocaleLowerCase("en-AU");
  const params = new URLSearchParams(window.location.search);

  function make(type, className, label) {
    const el = document.createElement(type);
    if (className) el.className = className;
    if (label !== undefined) el.textContent = label;
    return el;
  }
  function card(entry, isExplorePage) {
    const a = make("a", "catalog-card");
    a.href = isExplorePage ? "./index.html#" + entry.href : "#" + entry.href;
    a.dataset.tone = entry.tone;
    a.setAttribute("aria-label", "Explore: " + entry.title);
    const art = make("div", "catalog-card-art");
    art.setAttribute("aria-hidden", "true");
    art.append(make("span", "catalog-art-halo"));
    art.append(make("span", "catalog-art-symbol", "✳"));
    art.append(make("span", "catalog-art-number", entry.number));
    const info = make("div", "catalog-card-copy");
    const overline = make("div", "catalog-card-meta");
    overline.append(make("span", "", names[entry.category]));
    overline.append(make("span", "", entry.kind));
    info.append(overline, make("h3", "", entry.title), make("p", "", entry.description));
    const footer = make("span", "catalog-card-link", "EXPLORE THE STORY ↗");
    info.append(footer);
    a.append(art, info);
    return a;
  }

  function init(root) {
    const pageSize = Math.max(1, Math.min(24, parseInt(root.dataset.pageSize || "6", 10) || 6));
    const isExplorePage = root.dataset.explorePage === "true";
    const state = {
      category: categories.includes(params.get("category")) ? params.get("category") : "all",
      sort: Object.hasOwn(sortNames, params.get("sort")) ? params.get("sort") : "newest",
      search: (params.get("search") || "").slice(0, 120),
      visible: pageSize
    };

    const controls = make("div", "catalog-controls");
    const filter = make("fieldset", "catalog-filters");
    filter.append(make("legend", "visually-hidden", "Filter experiences by category"));
    const pills = new Map();
    categories.forEach(category => {
      const button = make("button", "catalog-filter", names[category]);
      button.type = "button";
      button.dataset.category = category;
      button.addEventListener("click", () => {
        state.category = category;
        state.visible = pageSize;
        update();
      });
      pills.set(category, button);
      filter.append(button);
    });
    const tools = make("div", "catalog-tools");
    const searchLabel = make("label", "visually-hidden", "Search experiences");
    const search = make("input", "catalog-search");
    search.type = "search"; search.placeholder = "Search the story…";
    search.autocomplete = "off"; search.maxLength = 120; search.value = state.search;
    const searchId = "catalog-search-" + (isExplorePage ? "explore" : "home");
    search.id = searchId; searchLabel.htmlFor = searchId;
    search.addEventListener("input", () => {
      state.search = search.value;
      state.visible = pageSize;
      update();
    });
    const sortLabel = make("label", "visually-hidden", "Sort experiences");
    const select = make("select", "catalog-sort");
    const sortId = "catalog-sort-" + (isExplorePage ? "explore" : "home");
    select.id = sortId; sortLabel.htmlFor = sortId;
    Object.entries(sortNames).forEach(([value, text]) => {
      const option = make("option", "", text);
      option.value = value;
      select.append(option);
    });
    select.value = state.sort;
    select.addEventListener("change", () => {
      state.sort = select.value;
      state.visible = pageSize;
      update();
    });
    const searchWrap = make("div", "catalog-search-wrap");
    searchWrap.append(searchLabel, search);
    const sortWrap = make("div", "catalog-sort-wrap");
    sortWrap.append(sortLabel, select);
    tools.append(searchWrap, sortWrap);
    controls.append(filter, tools);
    const resultRow = make("div", "catalog-result-row");
    const resultCount = make("span", "catalog-result-count");
    resultCount.setAttribute("role", "status"); resultCount.setAttribute("aria-live", "polite"); resultCount.setAttribute("aria-atomic", "true");
    const reset = make("button", "catalog-reset", "Clear filters ↗");
    reset.type = "button";
    reset.addEventListener("click", () => {
      state.category = "all"; state.sort = "newest"; state.search = ""; state.visible = pageSize;
      search.value = ""; select.value = "newest";
      update(); search.focus();
    });
    resultRow.append(resultCount, reset);
    const grid = make("div", "catalog-grid");
    const empty = make("div", "catalog-empty");
    empty.append(make("h3", "", "Nothing in the cup yet."), make("p", "", "Try another search or choose a different category."));
    const loadWrap = make("div", "catalog-load-wrap");
    const loadMore = make("button", "catalog-load-more", "SHOW MORE STORIES ↓");
    loadMore.type = "button";
    loadMore.addEventListener("click", () => { state.visible += pageSize; update(false); });
    loadWrap.append(loadMore);
    root.replaceChildren(controls, resultRow, grid, empty, loadWrap);

    function update(syncUrl = true) {
      pills.forEach((button, category) => {
        const active = category === state.category;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      const query = lower(state.search.trim());
      const sorted = entries.filter(entry => {
        if (state.category !== "all" && entry.category !== state.category) return false;
        return !query || lower([entry.title, entry.description, entry.kind, entry.keywords, names[entry.category]].join(" ")).includes(query);
      }).sort((a, b) => {
        if(state.sort === "az") return a.title.localeCompare(b.title, "en-AU");
        if(state.sort === "za") return b.title.localeCompare(a.title, "en-AU");
        const dateCompare = a.addedAt.localeCompare(b.addedAt);
        const order = dateCompare || (a.sequence - b.sequence);
        return state.sort === "oldest" ? order : -order;
      });
      const display = sorted.slice(0, state.visible);
      const fragment = document.createDocumentFragment();
      display.forEach(entry => fragment.append(card(entry, isExplorePage)));
      grid.replaceChildren(fragment);
      resultCount.textContent = sorted.length + " " + (sorted.length === 1 ? "experience" : "experiences") + " · " + sortNames[state.sort];
      reset.hidden = state.category === "all" && state.sort === "newest" && !query;
      empty.hidden = sorted.length > 0;
      loadWrap.hidden = display.length >= sorted.length;
      if (syncUrl) {
        const url = new URL(window.location.href);
        if(state.category === "all") url.searchParams.delete("category");
        else url.searchParams.set("category", state.category);
        if(state.sort === "newest") url.searchParams.delete("sort");
        else url.searchParams.set("sort", state.sort);
        if(!state.search.trim()) url.searchParams.delete("search");
        else url.searchParams.set("search", state.search.trim());
        try { window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash); } catch (_) { /* Browsing still works without history writes. */ }
      }
    }
    update(false);
  }

  document.querySelectorAll("[data-kapa-catalog]").forEach(init);
})();
