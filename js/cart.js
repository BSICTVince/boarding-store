// cart.js
document.addEventListener("DOMContentLoaded", () => {

    // let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // --- CREATE CART ICON ---
    const cartIcon = document.createElement("div");
    cartIcon.id = "cart-icon";
    cartIcon.innerHTML = `
       <button class="btn btn-primary position-fixed bottom-0 end-0 translate-middle-y" 
    style="z-index: 1050;">
    🛒 <span id="cart-count">0</span>
</button>
    `;
    document.body.appendChild(cartIcon);

    // --- CREATE CART SIDEBAR ---
    const cartSidebar = document.createElement("div");
    cartSidebar.id = "cart-sidebar";
    cartSidebar.innerHTML = `
    
        <div class="cart-overlay"></div>
        <div class="cart-content shadow-lg">
            <div class="cart-header d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 class="m-0">My Cart (<span id="cart-count-header">${cart.reduce((a, b) => a + b.qty, 0)}</span>)</h5>
                <button id="cart-close" class="btn btn-sm btn-secondary">&times;</button>
            </div>
            <div class="cart-items p-3"></div>
            <div class="cart-footer p-3 border-top">
                <p class="mb-2">Subtotal: ₱<span id="cart-subtotal">0.00</span></p>
                <div class="d-flex gap-2">
                    <button id="go-cart" class="btn btn-primary w-50">Go to My Cart</button>
                    <button id="continue-shopping" class="btn btn-secondary w-50">Continue Shopping</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(cartSidebar);

    // --- CSS STYLES ---
    const style = document.createElement("style");
    style.innerHTML = `
    #cart-sidebar {
        position: fixed; top:0; right:-100%; width:360px; height:100%; background:#fff; z-index:1100; transition:right 0.3s ease; display:flex; flex-direction:column;
    }
    #cart-sidebar.show { right:0; }
    .cart-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:none; z-index:300; }
    .cart-overlay.show { display:block; }
    .cart-content { display:flex; flex-direction:column; height:100%; z-index:999; background:#ffffff;}
    .cart-items { flex:1; overflow-y:auto; }
    .cart-items .cart-item { display:flex; gap:0.5rem; margin-bottom:1rem; border-bottom:1px solid #ddd; padding-bottom:0.5rem; }
    .cart-items .cart-item img { width:50px; height:50px; object-fit:cover; border-radius:4px; }
    .cart-items .cart-item-info { flex:1; display:flex; flex-direction:column; justify-content:space-between; }
    .cart-items .cart-item-info .qty-controls { display:flex; align-items:center; gap:0.5rem; margin-top:5px; }
    .cart-items .cart-item-info .qty-controls button { width:24px; height:24px; padding:0; font-weight:bold; }
    .cart-items .cart-item-info .remove-item { color:red; font-size:12px; cursor:pointer; margin-top:4px; }
    `;
    document.head.appendChild(style);

    // --- FUNCTIONS ---

    // Update cart count in icon and header
function updateCartCount() {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const cartCountIcon = document.getElementById("cart-count");
    if (cartCountIcon) cartCountIcon.textContent = totalQty;
}

    // Render cart items in sidebar
    function renderCart() {
        const container = document.querySelector(".cart-items");
        container.innerHTML = "";

        let subtotal = 0;

        cart.forEach((item, index) => {
            const finalPrice = item.discount ? item.price - item.discount : item.price;
            subtotal += finalPrice * item.qty;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <img src="${item.image_url}" alt="${item.product_name}">
                <div class="cart-item-info">
                    <strong>${item.product_name}</strong>
                    <small>₱${finalPrice.toFixed(2)}</small>
                    <div class="qty-controls">
                        <button class="btn-decrease">-</button>
                        <span class="qty">${item.qty}</span>
                        <button class="btn-increase">+</button>
                    </div>
                    <div class="remove-item">Remove</div>
                </div>
            `;
            container.appendChild(div);

            // Quantity buttons
            div.querySelector(".btn-increase").addEventListener("click", () => {
                item.qty += 1;
                saveCart();
                renderCart();
            });
            div.querySelector(".btn-decrease").addEventListener("click", () => {
                if (item.qty > 1) item.qty -= 1;
                else removeItem(index);
                saveCart();
                renderCart();
            });

            // Remove item
            div.querySelector(".remove-item").addEventListener("click", () => {
                removeItem(index);
                renderCart();
            });
        });

        document.getElementById("cart-subtotal").textContent = subtotal.toFixed(2);
        updateCartCount();
    }


    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Remove item
    function removeItem(index) {
        cart.splice(index, 1);
        saveCart();
    }

    // --- EVENT LISTENERS ---

    // Open cart
    cartIcon.querySelector("button").addEventListener("click", () => {
        cartSidebar.classList.add("show");
        document.querySelector(".cart-overlay").classList.add("show");
        renderCart();
    });

    // Close cart button
    document.getElementById("cart-close").addEventListener("click", () => {
        cartSidebar.classList.remove("show");
        document.querySelector(".cart-overlay").classList.remove("show");
    });

    // Click overlay to close
    document.querySelector(".cart-overlay").addEventListener("click", () => {
        cartSidebar.classList.remove("show");
        document.querySelector(".cart-overlay").classList.remove("show");
    });

    // Go to My Cart
    document.getElementById("go-cart").addEventListener("click", () => {
        window.location.href = "cart.html"; // change to your cart page
    });

    // Continue Shopping
    document.getElementById("continue-shopping").addEventListener("click", () => {
        cartSidebar.classList.remove("show");
        document.querySelector(".cart-overlay").classList.remove("show");
    });

    // Initial render
    renderCart();
    updateCartCount();
});

// global function to update cart counts
window.updateCartCount = function () {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);

    const cartCountIcon = document.getElementById("cart-count");
    if (cartCountIcon) cartCountIcon.textContent = totalQty;

    const cartCountHeader = document.getElementById("cart-count-header");
    if (cartCountHeader) cartCountHeader.textContent = totalQty;
};