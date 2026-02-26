/* ===============================
URL FILTERING FUNCTIONS
================================ */
function getFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get("category") || "all",
        filter: params.get("filter") || null,
    };
}

/* ===============================
Update URL & Trigger Display
=============================== */
function updateURL({ category = null, brand = null, badge = null }) {
    const params = new URLSearchParams(window.location.search);

    // CATEGORY
    if (category !== null) params.set("category", category);

    // BRAND
    if (brand !== null) {
        if (brand === "") params.delete("brand");
        else params.set("brand", slugify(brand)); // force URL to use - instead of +
    }

    // BADGE
    if (badge !== null) {
        if (badge === "") params.delete("badge");
        else params.set("badge", badge);
    }

    // Update URL without reloading
    const currentPath = window.location.pathname;
    history.pushState(null, "", currentPath + "?" + params.toString());

    displayProductsByURL();
}

/* ===============================
Display Products Based on URL
=============================== */
function displayProductsByURL() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "all";
    const brand = params.get("brand") ? slugify(params.get("brand")) : null;
    const badge = params.get("badge")?.toLowerCase();
    const start = parseInt(params.get("start")) || 0;  // offset
    const sz = parseInt(params.get("sz")) || PRODUCT_LIMIT; // batch size

    let filtered = products;

    // CATEGORY FILTER
    if (category !== "all") filtered = filtered.filter(p => slugify(p.category) === category);

    // BRAND FILTER
    if (brand) filtered = filtered.filter(p =>
        p.brand && slugify(p.brand) === brand
    );

    // BADGE FILTER
    if (badge) {
        filtered = filtered.filter(p => {
            const isAvailable = p.available === true || p.available === "TRUE" || p.available === "true";

            if (badge === "available") return isAvailable;
            if (badge === "out-of-stock") return !isAvailable;

            if (!p.badges) return false;
            const badgeList = p.badges.split(",").map(b => slugify(b.trim()));
            return badgeList.includes(badge);
        });
    }

    renderBrands(category);       // show brand checkboxes
    displayProducts(filtered, start, sz);  // pass start & sz
}


// Utility: convert string to slug
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")      // replace spaces with -
        .replace(/[^\w\-]+/g, "")  // remove all non-word chars
        .replace(/\-\-+/g, "-");   // replace multiple - with single -
}

// Handle browser back/forward
window.addEventListener("popstate", () => displayProductsByURL());

/* ===============================
FILTER CATEGORY BUTTONS
================================ */
function filterCategory(cat) {
    // Get the current path (without query params)
    const currentPath = window.location.pathname;

    // Build a clean URL with only the new category
    const newURL = currentPath + "?category=" + encodeURIComponent(cat.toLowerCase());

    // Replace the URL in the browser
    history.pushState(null, "", newURL);

    // Display products based on the new category
    displayProductsByURL(true);
}


/* ===============================
FILTER TAG BUTTONS
================================ */
function filterTag(tag) {
    updateURL({ badge: tag.toLowerCase() });
}
function clearFilters() {
    // Reset URL to default category 'all' with no filter
    history.pushState(null, "", "index.html?category=all");

    // Display all products
    displayProducts(products);

    // Optional: reset active button highlights if implemented
    // updateActiveButtons();
}