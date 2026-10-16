// ============================================================
// Cart.js – QUẢN LÝ GIỎ HÀNG & TIỆN ÍCH DÙNG CHUNG TOÀN APP
// Môn học: WEB2064 - JavaScript Nâng Cao
// Kiến thức áp dụng:
// 1. OOP (Class Cart với các phương thức thêm, bớt, xóa, tính tổng)
// 2. LocalStorage: Lưu trữ giỏ hàng và phiên người dùng lâu dài
// 3. Array Methods nâng cao: find, filter, reduce, forEach
// 4. DOM Manipulation: Render drawer giỏ hàng, cập nhật badge số lượng
// 5. Toast Notifications: Thông báo người dùng mượt mà, giới hạn số lượng
// ============================================================

// ============================================================
// 1. CLASS CART (Mô hình hóa giỏ hàng theo hướng đối tượng OOP)
// ============================================================
class Cart {
  constructor() {
    // Đọc giỏ hàng đã lưu từ localStorage ('cart')
    // Nếu chưa có (null), khởi tạo mảng rỗng []
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
  }

  /**
   * Lưu mảng items hiện tại vào localStorage
   * Cần chuyển đối tượng JavaScript sang chuỗi JSON bằng JSON.stringify()
   */
  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {Object} product - Đối tượng thông tin sản phẩm
   * @param {number} quantity - Số lượng cần thêm (mặc định = 1)
   * @param {number|null} size - Kích cỡ giày đã chọn
   */
  addToCart(product, quantity = 1, size = null) {
    const qty = Number(quantity) || 1;
    // Lấy size đã chọn, nếu không có thì lấy size đầu tiên của sản phẩm hoặc mặc định 41
    const selectedSize = size || product.selectedSize || (product.sizes && product.sizes[0]) || 41;

    // Kiểm tra xem sản phẩm cùng ID và cùng Size đã có trong giỏ hàng chưa
    const existing = this.items.find(item => 
      item.id === product.id && (item.selectedSize === selectedSize || !item.selectedSize)
    );

    if (existing) {
      // Nếu đã có: chỉ cộng dồn số lượng
      existing.quantity += qty;
      if (!existing.selectedSize) existing.selectedSize = selectedSize;
    } else {
      // Nếu chưa có: sao chép thông tin sản phẩm và gán thêm quantity, selectedSize
      this.items.push({ ...product, quantity: qty, selectedSize });
    }

    // Lưu lại thay đổi vào localStorage
    this.save();
  }

  /**
   * Xóa một sản phẩm khỏi giỏ theo productId
   * Dùng hàm filter giữ lại các sản phẩm có ID khác với ID cần xóa
   */
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  }

  /**
   * Tăng số lượng sản phẩm lên 1
   */
  increase(productId) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity += 1;
      this.save();
    }
  }

  /**
   * Giảm số lượng sản phẩm đi 1
   * Nếu số lượng giảm về 0 thì tự động xóa sản phẩm khỏi giỏ
   */
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

  /**
   * Tính tổng thành tiền của toàn bộ giỏ hàng
   * Dùng reduce: duyệt qua từng phần tử và tích lũy: total + (đơn giá * số lượng)
   */
  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Đếm tổng số lượng sản phẩm (dùng để hiển thị badge số lượng ở icon giỏ hàng)
   * Ví dụ: 2 đôi Nike + 1 đôi Adidas = 3 sản phẩm
   */
  getCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Xóa trắng toàn bộ giỏ hàng (sau khi đặt hàng thành công)
   */
  clear() {
    this.items = [];
    this.save();
  }
}

// ============================================================
// 2. HELPER: ĐỊNH DẠNG TIỀN TỆ VIỆT NAM (VND)
// ============================================================
/**
 * Chuyển số nguyên thành chuỗi tiền tệ VNĐ có dấu phân cách hàng nghìn
 * Ví dụ: 2500000 -> "2.500.000₫"
 */
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// ============================================================
// 3. HỆ THỐNG THÔNG BÁO TOAST (Tối đa 3 thông báo cùng lúc)
// ============================================================
/**
 * Đóng thông báo với hiệu ứng trượt mượt mà ra ngoài
 */
function dismissToast(toast) {
  if (!toast || toast.classList.contains('toast-exit')) return;
  toast.classList.add('toast-exit');
  // Chờ animation hoàn tất 250ms rồi gỡ hẳn khỏi cây DOM
  setTimeout(() => {
    toast.remove();
  }, 250);
}

/**
 * Hiển thị một thông báo Toast nổi góc dưới bên trái
 * @param {string} message - Nội dung cần thông báo
 * @param {string} type - Loại thông báo: 'success' (màu đen) hoặc 'error' (màu đỏ)
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  // GIỚI HẠN TỐI ĐA 3 THÔNG BÁO CÙNG LÚC:
  // Lấy các thông báo đang hiển thị (chưa trong trạng thái đóng)
  const activeToasts = Array.from(container.querySelectorAll('.toast:not(.toast-exit)'));
  if (activeToasts.length >= 3) {
    // Nếu đã có từ 3 cái trở lên: xóa bớt thông báo cũ nhất để khi thêm cái mới thì tổng luôn <= 3
    const excess = activeToasts.length - 2;
    for (let i = 0; i < excess; i++) {
      dismissToast(activeToasts[i]);
    }
  }

  // Dọn dẹp DOM phòng trường hợp người dùng click spam liên tục
  const allToasts = container.querySelectorAll('.toast');
  if (allToasts.length > 5) {
    for (let i = 0; i < allToasts.length - 3; i++) {
      allToasts[i].remove();
    }
  }

  // Tạo phần tử div đại diện cho Toast
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = message;
  toast.title = 'Nhấn để đóng';
  // Cho phép người dùng click trực tiếp vào thông báo để tắt ngay lập tức
  toast.addEventListener('click', () => dismissToast(toast));

  // Gắn thông báo vào container
  container.appendChild(toast);

  // Tự động biến mất sau 3 giây
  setTimeout(() => {
    dismissToast(toast);
  }, 3000);
}

// ============================================================
// 4. KHỞI TẠO ĐỐI TƯỢNG CART DÙNG CHUNG TOÀN BỘ ỨNG DỤNG
// ============================================================
const cart = new Cart();
window.cart = cart; // Gắn ra window để các trang khác có thể truy cập trực tiếp

// ============================================================
// 5. RENDER CART SIDEBAR (Giao diện giỏ hàng trượt từ phải sang)
// ============================================================
function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const footer    = document.getElementById('cartFooter');
  const badge     = document.getElementById('cartBadge');
  const totalEl   = document.getElementById('cartTotal');

  if (!container) return;

  // Cập nhật số lượng hiển thị trên Badge icon giỏ hàng ở thanh Header
  if (badge) badge.textContent = cart.getCount();

  // Trường hợp giỏ hàng chưa có sản phẩm nào
  if (cart.items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Giỏ hàng trống</p>
      </div>`;
    if (footer) footer.style.display = 'none'; // Ẩn phần tổng tiền & nút thanh toán
    return;
  }

  // Duyệt qua từng món trong giỏ hàng để render HTML
  let html = '';
  cart.items.forEach(item => {
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, 'decrease')">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 'increase')">+</button>
          <button class="btn-remove-cart" onclick="removeFromCart(${item.id})" title="Xóa">X</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;

  // Cập nhật tổng tiền vào thanh footer và hiển thị footer
  if (totalEl) totalEl.textContent = formatPrice(cart.getTotal());
  if (footer) footer.style.display = 'block';
}

/**
 * Điều khiển tăng / giảm số lượng từ nút bấm trong giỏ hàng
 * @param {number} id - Mã sản phẩm
 * @param {string} action - 'increase' hoặc 'decrease'
 */
function changeQty(id, action) {
  if (action === 'increase') cart.increase(id);
  else cart.decrease(id);
  renderCart();

  // Nếu đang ở trang xem chi tiết giỏ hàng (cart.html) thì đồng bộ luôn bảng sản phẩm
  if (typeof renderCartPageItems === 'function') {
    renderCartPageItems();
  }
}

/**
 * Xóa hẳn một sản phẩm khỏi giỏ hàng
 * @param {number} id - Mã sản phẩm cần xóa
 */
function removeFromCart(id) {
  cart.removeItem(id);
  renderCart();
  if (typeof renderCartPageItems === 'function') {
    renderCartPageItems();
  }
  showToast('Đã xóa khỏi giỏ hàng', 'error');
}

// ============================================================
// 6. THIẾT LẬP MỞ / ĐÓNG SIDEBAR GIỎ HÀNG
// ============================================================
function setupCartUI() {
  const btnOpen  = document.getElementById('btnOpenCart');
  const btnClose = document.getElementById('btnCloseCart');
  const overlay  = document.getElementById('cartOverlay');
  const sidebar  = document.getElementById('cartSidebar');

  if (!btnOpen) return;

  // Khi click vào icon giỏ hàng trên Header -> Mở sidebar và overlay
  btnOpen.addEventListener('click', () => {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    renderCart();
  });

  // Khi click vào nút đóng [X] hoặc click ra vùng tối ngoài overlay -> Đóng sidebar
  if (btnClose) btnClose.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ============================================================
// 7. XỬ LÝ NÚT THANH TOÁN NGAY TRONG DRAWER GIỎ HÀNG
// ============================================================
function setupCheckout() {
  const btn = document.getElementById('btnCheckout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (cart.items.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }
    closeCart();
    window.location.href = 'cart.html'; // Chuyển sang trang xem lại toàn bộ giỏ hàng
  });
}

// ============================================================
// 8. HIỂN THỊ TRẠNG THÁI TÀI KHOẢN TRÊN THANH HEADER
// ============================================================
function renderHeaderUser() {
  const area = document.getElementById('headerUserArea');
  if (!area) return;

  // Đọc thông tin phiên đăng nhập lưu trong localStorage
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) {
    // Nếu chưa đăng nhập: hiển thị nút "Đăng nhập"
    area.innerHTML = `<a href="login.html" class="btn-nike-login">Đăng nhập</a>`;
    return;
  }

  const user = JSON.parse(userJson);
  const initial = (user.name || 'U').charAt(0).toUpperCase(); // Ký tự đầu của tên làm Avatar
  const isAdmin = user.role === 'admin';

  // Nếu đã đăng nhập: hiển thị Avatar tròn, Tên người dùng và nút Đăng xuất
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

// Xử lý đăng xuất tài khoản
function logout() {
  localStorage.removeItem('currentUser'); // Xóa phiên đăng nhập
  showToast('Đã đăng xuất thành công!');
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}

// ============================================================
// 9. KHỞI TẠO TỰ ĐỘNG KHI TẢI XONG TRANG (DOMContentLoaded)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setupCartUI();       // Gắn sự kiện đóng mở giỏ hàng
  setupCheckout();     // Gắn sự kiện nút thanh toán
  renderHeaderUser();  // Hiển thị tên/avatar người dùng trên header
  renderCart();        // Cập nhật số lượng badge giỏ hàng ngay khi tải trang
});
