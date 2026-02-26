/* ===============================
Build a category -> Set of brands map
=============================== */
function buildCategoryMap(products) {
    const map = {};
    products.forEach(product => {
        const category = product.category?.toLowerCase();
        const brand = product.brand?.toLowerCase();

        if (!category) return;

        if (!map[category]) map[category] = new Set();
        if (brand) map[category].add(brand);
    });
    return map;
}

/* ===============================
Render Categories Dynamically
=============================== */
function renderCategories() {
    const container = document.getElementById("category-list");
    container.innerHTML = "";

    const categoryMap = buildCategoryMap(products);

    // --- ALL ---
    const allItem = document.createElement("li");
    allItem.className = "list-group-item";
    allItem.textContent = "All";
    allItem.onclick = () => updateURL({ category: "all" }); // reset brand/badge
    container.appendChild(allItem);

    // --- Other Categories ---
Object.keys(categoryMap).forEach(category => {
    const li = document.createElement("li");
    li.className = "list-group-item";

    // Display name: capitalize and remove dashes/underscores
    li.textContent = category
        .replace(/[-_]/g, " ")                 // replace - or _ with space
        .replace(/\b\w/g, c => c.toUpperCase()); // capitalize first letter of each word

    // Click event uses slugified version for URL
    li.onclick = () => updateURL({ category: category }); // slugified internally

    container.appendChild(li);
});
}

/* ===============================
Render Brand Filters for a Category
=============================== */
function renderBrands(category) {
    const container = document.getElementById("brand-filter");
    container.innerHTML = "";

    if (!category || category === "all") return;

    const categoryMap = buildCategoryMap(products);
    const brands = categoryMap[category];
    if (!brands || brands.size === 0) return;

    brands.forEach(brand => {
        const wrapper = document.createElement("div");
        wrapper.className = "form-check";

        const slug = slugify(brand); // <-- slug for id

        const input = document.createElement("input");
        input.type = "checkbox";
        input.className = "form-check-input";
        input.id = `brand-${slug}`;
        input.value = brand;

        // Check the checkbox if it matches URL
        const params = new URLSearchParams(window.location.search);
        const currentBrand = params.get("brand");
        if (currentBrand && currentBrand === slug) {
            input.checked = true;
        }

        input.addEventListener("change", () => {
            if (input.checked) {
                updateURL({ category, brand, badge: "" });
            } else {
                updateURL({ category, brand: "", badge: "" });
            }
        });

        const label = document.createElement("label");
        label.className = "form-check-label";
        label.htmlFor = input.id;
        label.textContent = brand.charAt(0).toUpperCase() + brand.slice(1);

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
}