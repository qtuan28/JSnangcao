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

  // Thêm sản phẩm vào giỏ hàng
  addToCart(product) {
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existing = this.items.find(item => item.id === product.id);

    if (existing) {
      // Nếu có rồi thì tăng số lượng
      existing.quantity += 1;
    } else {
      // Nếu chưa có thì thêm mới với quantity = 1
      this.items.push({ ...product, quantity: 1 });
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
// Helper: Hiện Toast thông báo (Tối đa 3 thông báo cùng lúc)
// ============================================================
function dismissToast(toast) {
  if (!toast || toast.classList.contains('toast-exit')) return;
  toast.classList.add('toast-exit');
  setTimeout(() => {
    toast.remove();
  }, 250);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const activeToasts = Array.from(container.querySelectorAll('.toast:not(.toast-exit)'));
  if (activeToasts.length >= 3) {
    const excess = activeToasts.length - 2;
    for (let i = 0; i < excess; i++) {
      dismissToast(activeToasts[i]);
    }
  }

  const allToasts = container.querySelectorAll('.toast');
  if (allToasts.length > 5) {
    for (let i = 0; i < allToasts.length - 3; i++) {
      allToasts[i].remove();
    }
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = message;
  toast.title = 'Nhấn để đóng';
  toast.addEventListener('click', () => dismissToast(toast));

  container.appendChild(toast);

  setTimeout(() => {
    dismissToast(toast);
  }, 3000);
}

// ============================================================
// Tạo instance Cart dùng chung cho toàn app
// ============================================================
const cart = new Cart();

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
}

// Xóa sản phẩm khỏi giỏ
function removeFromCart(id) {
  cart.removeItem(id);
  renderCart();
  showToast('Đã xóa khỏi giỏ hàng', 'error');
}

// ============================================================
// Mở / Đóng Cart Sidebar
// ============================================================
function setupCartUI() {
  const btnOpen = document.getElementById('btnOpenCart');
  const btnClose = document.getElementById('btnCloseCart');
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');

  if (!btnOpen || !sidebar) return;

  btnOpen.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    renderCart();
  });

  btnClose.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

// Nút Thanh toán
function setupCheckout() {
  const btn = document.getElementById('btnCheckout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (cart.items.length === 0) return;
    showToast(`Đặt hàng thành công! Tổng: ${formatPrice(cart.getTotal())}`);
    cart.clear();
    renderCart();
    closeCart();
  });
}

// ============================================================
// Hiển thị thông tin user đã đăng nhập trên Header
// ============================================================
function renderHeaderUser() {
  const area = document.getElementById('headerUserArea');
  if (!area) return;

  const userJson = localStorage.getItem('currentUser');
  if (!userJson) return;

  const user = JSON.parse(userJson);
  let html = `
    <div class="user-info">
      <div class="avatar">U</div>
      <span>${user.name}</span>
    </div>
    <button class="btn-logout" onclick="logout()">Đăng xuất</button>`;

  if (user.role === 'admin') {
    html = `
      <div class="user-info">
        <div class="avatar">A</div>
        <span>${user.name}</span>
      </div>
      <a href="admin.html" class="btn-login" style="margin-left:4px;">Admin</a>
      <button class="btn-logout" onclick="logout()">Đăng xuất</button>`;
  }

  area.innerHTML = html;
}

function logout() {
  localStorage.removeItem('currentUser');
  showToast('Đã đăng xuất!');
  setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// Khởi tạo chung khi trang load
document.addEventListener('DOMContentLoaded', () => {
  setupCartUI();
  setupCheckout();
  renderHeaderUser();
  renderCart(); // cập nhật badge ngay lúc load
});
