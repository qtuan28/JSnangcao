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
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

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

