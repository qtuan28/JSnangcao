// ============================================================
// Cart.js – Class Cart quản lý giỏ hàng
// Lưu trong localStorage để không mất khi reload trang
// ============================================================

class Cart {
  constructor() {
    // Lấy giỏ hàng từ localStorage, nếu chưa có thì khởi tạo mảng rỗng
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
  }

  // Lưu giỏ hàng vào localStorage
  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  // Thêm sản phẩm vào giỏ hàng (áp dụng tham số mặc định quantity = 1, size = 41)
  addToCart(product, quantity = 1, size = null) {
    const qty = Number(quantity) || 1;
    const selectedSize = size || product.selectedSize || (product.sizes && product.sizes[0]) || 41;
    const existing = this.items.find(item => item.id === product.id && (item.selectedSize === selectedSize || !item.selectedSize));

    if (existing) {
      existing.quantity += qty;
      if (!existing.selectedSize) existing.selectedSize = selectedSize;
    } else {
      this.items.push({ ...product, quantity: qty, selectedSize });
    }

    this.save();
  }

  // Xóa sản phẩm khỏi giỏ hàng
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  }

  // Tăng số lượng
  increase(productId) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity += 1;
      this.save();
    }
  }

  // Giảm số lượng (nếu = 0 thì xóa luôn)
  decrease(productId) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.save();
      }
    }
  }

  // Tính tổng tiền
  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  // Đếm tổng số sản phẩm (dùng cho badge)
  getCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Xóa toàn bộ giỏ hàng
  clear() {
    this.items = [];
    this.save();
  }
}

// ============================================================
// Helper: Format tiền VND
// ============================================================
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// ============================================================
// Helper: Hiện Toast thông báo
// ============================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = message;
  container.appendChild(toast);

  // Tự xóa sau 3 giây
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================================
// Wishlist.js – Class Wishlist quản lý danh sách yêu thích (OOP - WEB2064)
// Lưu trong localStorage ('wishlist') để không mất khi reload trang
// ============================================================
class Wishlist {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('wishlist')) || [];
  }

  save() {
    localStorage.setItem('wishlist', JSON.stringify(this.items));
  }

  has(productId) {
    const id = Number(productId);
    return this.items.some(item => Number(item.id) === id);
  }

  toggle(product) {
    if (!product || !product.id) return false;
    const pId = Number(product.id);
    const index = this.items.findIndex(item => Number(item.id) === pId);

    if (index > -1) {
      this.items.splice(index, 1);
      this.save();
      return false; // Đã bỏ thích
    } else {
      this.items.push({
        id: pId,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image,
        category: product.category || 'Giày Sneaker',
        stock: product.stock || 10
      });
      this.save();
      return true; // Đã thêm yêu thích
    }
  }

  remove(productId) {
    const pId = Number(productId);
    this.items = this.items.filter(item => Number(item.id) !== pId);
    this.save();
  }

  getCount() {
    return this.items.length;
  }

  clear() {
    this.items = [];
    this.save();
  }
}

// ============================================================
// Tạo instance Cart & Wishlist dùng chung cho toàn app
// ============================================================
const cart = new Cart();
const wishlist = new Wishlist();

window.cart = cart;
window.wishlist = wishlist;


// ============================================================
// Render Cart Sidebar – dùng chung cho mọi trang
// ============================================================
function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const footer = document.getElementById('cartFooter');
  const badge = document.getElementById('cartBadge');
  const totalEl = document.getElementById('cartTotal');

  if (!container) return;

  // Cập nhật badge
  if (badge) badge.textContent = cart.getCount();

  // Nếu giỏ rỗng
  if (cart.items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Giỏ hàng trống</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  // Render từng item trong giỏ
  let html = '';
  cart.items.forEach(item => {
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70x70/1E1E32/6C63FF?text=Shoe'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, 'decrease')">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 'increase')">+</button>
          <button class="btn-remove-cart" onclick="removeFromCart(${item.id})">X</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;

  // Cập nhật tổng tiền và hiện footer
  if (totalEl) totalEl.textContent = formatPrice(cart.getTotal());
  if (footer) footer.style.display = 'block';
}

// Thay đổi số lượng
function changeQty(id, action) {
  if (action === 'increase') cart.increase(id);
  else cart.decrease(id);
  renderCart();
  if (typeof renderCartPageItems === 'function') {
    renderCartPageItems();
  }
}

// Xóa sản phẩm khỏi giỏ
function removeFromCart(id) {
  cart.removeItem(id);
  renderCart();
  if (typeof renderCartPageItems === 'function') {
    renderCartPageItems();
  }
  showToast('Đã xóa khỏi giỏ hàng', 'error');
}

// ============================================================
// Mở / Đóng Cart Sidebar
// ============================================================
function setupCartUI() {
  const btnOpen  = document.getElementById('btnOpenCart');
  const btnClose = document.getElementById('btnCloseCart');
  const overlay  = document.getElementById('cartOverlay');
  const sidebar  = document.getElementById('cartSidebar');

  if (!btnOpen) return;

  btnOpen.addEventListener('click', () => {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    renderCart();
  });

  btnClose.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ============================================================
// Wishlist Functions – Giao diện & Tương tác danh sách yêu thích
// ============================================================

// Cập nhật số lượng trên badge yêu thích
function updateWishlistBadge() {
  if (typeof wishlist === 'undefined') return;
  const count = wishlist.getCount();
  const badges = document.querySelectorAll('#wishlistBadge, .wishlist-badge');
  badges.forEach(b => {
    b.textContent = count;
  });
  const headerCount = document.getElementById('wishlistCountHeader');
  if (headerCount) headerCount.textContent = count;
}

// Render danh sách sản phẩm yêu thích ra Wishlist Sidebar
function renderWishlist() {
  if (typeof wishlist === 'undefined') return;
  updateWishlistBadge();
  const container = document.getElementById('wishlistItemsContainer');
  const footer = document.getElementById('wishlistFooter');

  if (!container) return;

  if (wishlist.items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p style="font-size: 2.5rem; margin-bottom: 8px; color: var(--gray-300);">♡</p>
        <p style="font-size: 1.05rem; color: var(--gray-800); font-weight:700; margin-bottom: 6px;">Mục yêu thích đang trống</p>
        <p style="font-size: 0.85rem; color: var(--gray-500); margin-bottom: 18px;">Hãy bấm biểu tượng trái tim ở các đôi giày bạn yêu thích để lưu lại.</p>
        <a href="products.html" class="btn-nike-solid" style="padding: 10px 22px; font-size: 0.85rem; text-decoration:none; display:inline-flex;">Khám phá sản phẩm ngay</a>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  let html = '';
  wishlist.items.forEach(item => {
    html += `
      <div class="cart-item wishlist-item" id="wishlist-item-${item.id}">
        <img src="${item.image}" alt="${item.name}" 
             onclick="location.href='detail.html?id=${item.id}'" 
             style="cursor:pointer"
             onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'" />
        <div class="cart-item-info">
          <div class="cart-item-name" onclick="location.href='detail.html?id=${item.id}'" style="cursor:pointer" title="Xem chi tiết">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div style="font-size:0.75rem; color:var(--gray-500); margin-top:2px;">${item.category || 'Giày Sneaker'}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
          <button class="btn-primary" style="padding:6px 14px; font-size:0.75rem; border-radius:var(--radius-pill); white-space:nowrap;" onclick="wishlistMoveToCart(${item.id})">
            + Thêm giỏ
          </button>
          <button class="btn-remove-cart" title="Xóa khỏi yêu thích" onclick="removeFromWishlist(${item.id})">
            ✕ Xóa
          </button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  if (footer) footer.style.display = 'block';
}

// Xóa sản phẩm khỏi danh sách yêu thích
function removeFromWishlist(productId) {
  if (typeof wishlist === 'undefined') return;
  const pId = Number(productId);
  const item = wishlist.items.find(i => Number(i.id) === pId);
  const itemName = item ? item.name : 'Sản phẩm';
  wishlist.remove(pId);
  renderWishlist();
  syncWishlistButtons(pId, false);
  showToast(`Đã xóa "${itemName}" khỏi mục Yêu thích`, 'error');
}

// Chuyển / thêm sản phẩm từ mục yêu thích sang giỏ hàng
function wishlistMoveToCart(productId) {
  if (typeof wishlist === 'undefined') return;
  const pId = Number(productId);
  const item = wishlist.items.find(i => Number(i.id) === pId);
  if (!item) return;
  cart.addToCart(item);
  renderCart();
  showToast(`Đã thêm "${item.name}" vào giỏ hàng!`);
}

// Xóa toàn bộ danh sách yêu thích
function clearAllWishlist() {
  if (typeof wishlist === 'undefined' || wishlist.items.length === 0) return;
  wishlist.clear();
  renderWishlist();
  syncAllWishlistButtons();
  showToast('Đã xóa tất cả sản phẩm khỏi mục Yêu thích', 'error');
}

// Thêm tất cả sản phẩm yêu thích vào giỏ hàng
function addAllWishlistToCart() {
  if (typeof wishlist === 'undefined' || wishlist.items.length === 0) return;
  wishlist.items.forEach(item => {
    cart.addToCart(item);
  });
  renderCart();
  showToast(`Đã thêm tất cả ${wishlist.items.length} sản phẩm yêu thích vào giỏ hàng!`);
}

// Đồng bộ trạng thái các nút trái tim theo productId trên toàn trang
function syncWishlistButtons(productId, isWishlisted) {
  const pId = Number(productId);
  const buttons = document.querySelectorAll(`[data-product-id="${pId}"]`);
  buttons.forEach(btn => {
    if (btn.id === 'btnDetailWishlist') {
      if (isWishlisted) {
        btn.classList.add('active');
        btn.innerHTML = '♥ Đã thêm vào mục Yêu thích';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '♡ Thêm vào mục Yêu thích';
      }
    } else {
      if (isWishlisted) {
        btn.classList.add('active');
        btn.textContent = '♥';
        btn.style.color = '#e11d48';
        btn.setAttribute('title', 'Bỏ yêu thích');
      } else {
        btn.classList.remove('active');
        btn.textContent = '♡';
        btn.style.color = '';
        btn.setAttribute('title', 'Thêm vào yêu thích');
      }
    }
  });
  updateWishlistBadge();
}

// Quét toàn bộ nút trên trang để gán đúng icon ♥ hoặc ♡ dựa trên dữ liệu đã lưu
function syncAllWishlistButtons() {
  if (typeof wishlist === 'undefined') return;
  document.querySelectorAll('.product-wishlist[data-product-id]').forEach(btn => {
    const id = Number(btn.getAttribute('data-product-id'));
    const isFav = wishlist.has(id);
    if (isFav) {
      btn.classList.add('active');
      btn.textContent = '♥';
      btn.style.color = '#e11d48';
      btn.setAttribute('title', 'Bỏ yêu thích');
    } else {
      btn.classList.remove('active');
      btn.textContent = '♡';
      btn.style.color = '';
      btn.setAttribute('title', 'Thêm vào yêu thích');
    }
  });

  const detailBtn = document.getElementById('btnDetailWishlist');
  if (detailBtn && detailBtn.getAttribute('data-product-id')) {
    const id = Number(detailBtn.getAttribute('data-product-id'));
    const isFav = wishlist.has(id);
    if (isFav) {
      detailBtn.classList.add('active');
      detailBtn.innerHTML = '♥ Đã thêm vào mục Yêu thích';
    } else {
      detailBtn.classList.remove('active');
      detailBtn.innerHTML = '♡ Thêm vào mục Yêu thích';
    }
  }

  updateWishlistBadge();
}

// Hàm toggle chung khi click nút yêu thích trên sản phẩm
function toggleWishlistProduct(product, btnEl) {
  if (!product || !product.id) return;
  if (typeof wishlist === 'undefined') return;
  const isAdded = wishlist.toggle(product);
  syncWishlistButtons(product.id, isAdded);
  renderWishlist();

  if (isAdded) {
    showToast(`Đã thêm "${product.name}" vào mục Yêu thích!`);
  } else {
    showToast(`Đã xóa "${product.name}" khỏi mục Yêu thích`, 'error');
  }
}

// Tự động kiểm tra và chèn cấu trúc DOM Wishlist Sidebar nếu trang chưa có
function ensureWishlistDOM() {
  if (!document.getElementById('wishlistSidebar')) {
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay wishlist-overlay';
    overlay.id = 'wishlistOverlay';

    const sidebar = document.createElement('aside');
    sidebar.className = 'cart-sidebar wishlist-sidebar';
    sidebar.id = 'wishlistSidebar';
    sidebar.innerHTML = `
      <div class="cart-header">
        <h3>Mục yêu thích (<span id="wishlistCountHeader">0</span>)</h3>
        <button class="btn-close-cart" id="btnCloseWishlist" title="Đóng">✕</button>
      </div>
      <div class="cart-items" id="wishlistItemsContainer"></div>
      <div class="cart-footer" id="wishlistFooter" style="display:none;">
        <button class="btn-primary" id="btnAddAllWishlistToCart" style="width:100%; justify-content:center; padding:14px; margin-bottom:10px;">
          + Thêm tất cả vào giỏ hàng
        </button>
        <button class="btn-clear-wishlist" id="btnClearWishlist" style="width:100%; padding:10px; background:transparent; border:1px solid var(--gray-200); border-radius:var(--radius-pill); font-weight:700; color:var(--gray-600); cursor:pointer;">
          Xóa tất cả yêu thích
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);
  }
}

function openWishlist() {
  closeCart();
  ensureWishlistDOM();
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = document.getElementById('wishlistOverlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    renderWishlist();
  }
}

function closeWishlist() {
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = document.getElementById('wishlistOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// Thiết lập sự kiện UI cho Wishlist
function setupWishlistUI() {
  ensureWishlistDOM();

  // Bắt sự kiện click vào nút Wishlist trên Header
  const btnOpen = document.getElementById('btnOpenWishlist');
  if (btnOpen) {
    btnOpen.removeAttribute('onclick');
    btnOpen.addEventListener('click', (e) => {
      e.preventDefault();
      openWishlist();
    });
  }

  // Nút đóng và overlay
  const btnClose = document.getElementById('btnCloseWishlist');
  const overlay = document.getElementById('wishlistOverlay');
  if (btnClose) btnClose.addEventListener('click', closeWishlist);
  if (overlay) overlay.addEventListener('click', closeWishlist);

  // Nút thêm tất cả vào giỏ
  const btnAddAll = document.getElementById('btnAddAllWishlistToCart');
  if (btnAddAll) {
    btnAddAll.addEventListener('click', addAllWishlistToCart);
  }

  // Nút xóa tất cả
  const btnClearAll = document.getElementById('btnClearWishlist');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', clearAllWishlist);
  }
}

// Gắn toàn bộ hàm cần dùng ra window để gọi từ bất kỳ đâu
window.renderWishlist = renderWishlist;
window.updateWishlistBadge = updateWishlistBadge;
window.openWishlist = openWishlist;
window.closeWishlist = closeWishlist;
window.removeFromWishlist = removeFromWishlist;
window.wishlistMoveToCart = wishlistMoveToCart;
window.clearAllWishlist = clearAllWishlist;
window.addAllWishlistToCart = addAllWishlistToCart;
window.syncWishlistButtons = syncWishlistButtons;
window.syncAllWishlistButtons = syncAllWishlistButtons;
window.toggleWishlistProduct = toggleWishlistProduct;


// Nút "Thanh toán ngay" trong Cart Sidebar → sang trang giỏ hàng
function setupCheckout() {
  const btn = document.getElementById('btnCheckout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (cart.items.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }
    closeCart();
    window.location.href = 'cart.html';
  });
}

// ============================================================
// Hiển thị thông tin user đã đăng nhập trên Header
// ============================================================
function renderHeaderUser() {
  const area = document.getElementById('headerUserArea');
  if (!area) return;

  const userJson = localStorage.getItem('currentUser');
  if (!userJson) {
    area.innerHTML = `<a href="login.html" class="btn-nike-login">Đăng nhập</a>`;
    return;
  }

  const user = JSON.parse(userJson);
  const initial = (user.name || 'U').charAt(0).toUpperCase();
  const isAdmin = user.role === 'admin';

  area.innerHTML = `
    <div class="user-header-group">
      ${isAdmin ? `
        <a href="admin.html" class="btn-admin-badge" title="Vào trang quản trị">
          <span>Quản trị</span>
        </a>
      ` : ''}

      <div class="user-profile-pill" style="cursor:default;">
        <div class="user-avatar-circle">${initial}</div>
        <span class="user-name-text">${user.name}</span>
      </div>

      <button class="btn-header-logout" onclick="logout()" title="Đăng xuất">
        Đăng xuất
      </button>
    </div>
  `;
}

function logout() {
  localStorage.removeItem('currentUser');
  showToast('Đã đăng xuất thành công!');
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}

// Khởi tạo chung khi trang load
document.addEventListener('DOMContentLoaded', () => {
  setupCartUI();
  setupWishlistUI();
  setupCheckout();
  renderHeaderUser();
  renderCart();      // cập nhật badge giỏ hàng ngay lúc load
  renderWishlist();  // cập nhật badge yêu thích ngay lúc load
  syncAllWishlistButtons();
});

