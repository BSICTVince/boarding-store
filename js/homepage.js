const API_URL =
    "https://script.google.com/macros/s/AKfycbzojLcjhR3AqqZNtRgMZdzyP5IIQvwzxeX5p0yXTuI_TTfe4E7T7AVTsQ4p8QT-fmElmw/exec";

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const container = document.getElementById("product-list");

/* ===============================
SHOW SKELETON PLACEHOLDERS
================================ */
function showPlaceholders(count = 8) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const col = document.createElement("div");
        col.className = "col-6 col-md-3 mb-3";
        col.innerHTML = `
            <div class="card shadow-sm h-100">
                <div class="skeleton"></div>
            </div>
        `;
        container.appendChild(col);
    }
}

showPlaceholders();

/* ===============================
FETCH PRODUCTS
================================ */
fetch(API_URL + "?type=products")
    .then((res) => res.json())
    .then((data) => {
        products = data;
        renderCategories();
        displayProductsByURL(); // use URL filters on load
        console.log(data);
    })
    .catch((err) => {
        console.error(err);
        container.innerHTML = "<p class='text-center text-danger'>Failed to load products</p>";
    });

/* ===============================
DISCOUNT FUNCTION
================================ */
function calculateDiscount(price, discount) {
    if (!discount) return price;
    if (discount.includes("%")) {
        return price - (price * parseFloat(discount)) / 100;
    }
    return price - parseFloat(discount);
}

/* ===============================
DISPLAY PRODUCTS
================================ */
let displayedCount = 0; // track how many products are currently displayed
const PRODUCT_LIMIT = 12; // products per batch

function displayProducts(list, start = 0, sz = PRODUCT_LIMIT) {

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = "<p class='text-center'>No products found</p>";
        return;
    }

    let displayedCount = 0;

    // COUNT
    const countDiv = document.createElement("div");
    countDiv.className = "text-left my-2";
    container.appendChild(countDiv);

    // PRODUCTS WRAPPER
    const productsWrapper = document.createElement("div");
    productsWrapper.className = "row";
    container.appendChild(productsWrapper);

    // VIEW MORE BUTTON
    const viewMoreBtn = document.createElement("button");
    viewMoreBtn.textContent = "View More";
    viewMoreBtn.className = "btn btn-primary w-25 m-auto mt-3";
    viewMoreBtn.style.display = "none";
    container.appendChild(viewMoreBtn);

    /* ========= RENDER FUNCTION ========= */
    function renderUntil(limit) {

        productsWrapper.innerHTML = "";

        const itemsToShow = list.slice(0, limit);

        itemsToShow.forEach(product => {

            let isAvailable =
                product.available === true ||
                product.available === "TRUE" ||
                product.available === "true";

            let finalPrice = calculateDiscount(
                parseFloat(product.price),
                product.discount
            );

            const col = document.createElement("div");
            col.className = "produt_tile col-6 col-md-3 mb-3";

            // <-- ADD PID ATTRIBUTE HERE -->
            col.setAttribute("pid", product.id);

            let badgesContainer = "";

            if (product.badges || product.available !== undefined) {

                const productBadges = product.badges
                    ? product.badges
                        .split(",")
                        .map(tag =>
                            `<div class="position-relative stock-badge badge-product">${tag.trim()}</div>`
                        ).join("")
                    : "";

                const availabilityBadge = `
                    <div class="position-relative stock-badge ${isAvailable ? "badge-available" : "badge-out"} mt-1">
                        ${isAvailable ? "AVAILABLE" : "OUT OF STOCK"}
                    </div>
                `;

                badgesContainer = `
                    <div class="position-absolute top-1 start-1 d-flex flex-column align-items-start badge-wrapper">
                        ${productBadges}${availabilityBadge}
                    </div>
                `;
            }

            col.innerHTML = `
                <div class="card product-card shadow-sm h-100 position-relative ${isAvailable ? "" : "out-stock"}">
                    ${badgesContainer}
                    <img src="${product.image_url}" class="card-img-top" loading="lazy">
                    <div class="card-body text-center">
                        <h6>${product.product_name}</h6>
                        <p class="mb-1">
                            ${product.discount ? `<small class="text-muted text-decoration-line-through">₱${product.price}</small>` : ""}
                            <strong class="text-danger">₱${finalPrice.toFixed(2)}</strong>
                        </p>
                        <button class="btn btn-sm w-100 ${isAvailable ? "btn-success" : "btn-secondary"}" ${isAvailable ? "" : "disabled"} pid="${product.productID}">
                            ${isAvailable ? "Add to Cart" : "Out of Stock"}
                        </button>
                    </div>
                </div>
            `;

            productsWrapper.appendChild(col);

            setTimeout(() => {
                col.querySelector(".product-card").classList.add("show");
            }, 50);

            if (isAvailable) {
                col.querySelector("button")
                    .addEventListener("click", () => addToCart(product));
            }
        });

        displayedCount = itemsToShow.length;

        countDiv.textContent =
            `Showing ${displayedCount} of ${list.length} products`;

        viewMoreBtn.style.display =
            displayedCount < list.length ? "block" : "none";

        /* ===== UPDATE URL (IMPORTANT PART) ===== */
        const params = new URLSearchParams(window.location.search);
        params.set("start", 0);
        params.set("sz", displayedCount);

        history.replaceState(
            null,
            "",
            window.location.pathname + "?" + params.toString()
        );
    }

    // INITIAL LOAD
    renderUntil(sz);

    // VIEW MORE CLICK
    viewMoreBtn.addEventListener("click", () => {

        const newLimit = displayedCount + PRODUCT_LIMIT;

        renderUntil(newLimit);

        window.scrollTo({
            top: container.offsetTop + container.offsetHeight,
            behavior: "smooth"
        });
    });
}



/* ===============================
ADD TO CART
================================ */
function addToCart(product) {

    let exists = cart.find((p) => p.id === product.id);
    if (exists) exists.qty += 1;
    else cart.push({ ...product, qty: 1 });

    localStorage.setItem("cart", JSON.stringify(cart));

    if (typeof renderCart === "function") renderCart();         // update sidebar items
    if (typeof showCartSidebar === "function") showCartSidebar(); // show sidebar
    if (typeof updateCartCount === "function") updateCartCount(); // update icon count

    // Optional popup notification
    const notification = document.createElement("div");
    notification.textContent = `${product.product_name} added to cart!`;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: #fff;
        padding: 10px 15px;
        border-radius: 4px;
        z-index: 1200;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}