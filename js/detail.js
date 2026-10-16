// ============================================================
// detail.js – XEM CHI TIẾT SẢN PHẨM (detail.html)
// Môn học: WEB2064 - JavaScript Nâng Cao
// Kiến thức áp dụng:
// 1. URLSearchParams: Đọc tham số `?id=...` trên thanh địa chỉ trình duyệt
// 2. OOP (Class Product): Mô hình hóa thông tin sản phẩm và phương thức getInfo()
// 3. Async/Await & Fetch: Đọc dữ liệu db.json kết hợp dự phòng localStorage / LOCAL_DB
// 4. DOM Manipulation: Thay đổi ảnh chính theo thumbnail, tăng giảm số lượng, chọn size
// 5. Cart Integration: Gọi class Cart để thêm sản phẩm kèm số lượng và size vào giỏ
// ============================================================

// ============================================================
// 1. CLASS PRODUCT (OOP - Mô hình hóa sản phẩm)
// ============================================================
class Product {
  /**
   * Khởi tạo đối tượng Product chi tiết
   * @param {Object} data - Dữ liệu thô từ db.json
   */
  constructor(data) {
    this.id          = data.id;                                                      // ID sản phẩm
    this.name        = data.name;                                                    // Tên sản phẩm
    this.category    = data.category || 'Giày Sneaker';                              // Thương hiệu (Nike, Adidas,...)
    this.categoryId  = data.categoryId || 1;                                         // ID danh mục
    this.price       = Number(data.price) || 0;                                      // Đơn giá bán
    this.stock       = data.stock !== undefined ? Number(data.stock) : 10;           // Số lượng tồn kho
    this.image       = data.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'; // Link ảnh
    this.description = data.description || 'Sản phẩm giày thể thao SneakerZone chính hãng, thiết kế hiện đại, êm ái tối đa.';
    this.sizes       = Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : [38, 39, 40, 41, 42]; // Danh sách size
  }

  /**
   * Phương thức trả về chuỗi thông tin tóm tắt sản phẩm (yêu cầu OOP - WEB2064)
   */
  getInfo() {
    return `${this.name} - ${this.price.toLocaleString('vi-VN')}₫ (Còn: ${this.stock} đôi)`;
  }
}

// ============================================================
// 2. BIẾN TOÀN CỤC QUẢN LÝ TRẠNG THÁI TRANG CHI TIẾT
// ============================================================
let currentProduct = null;  // Lưu instance Product của sản phẩm đang xem
let currentQuantity = 1;     // Số lượng khách chọn mua (mặc định = 1)
let selectedSize = 40;       // Kích cỡ giày khách đang chọn (mặc định = 40)

/**
 * Định dạng số thành chuỗi tiền tệ VND
 */
function formatPrice(num) {
  return Number(num).toLocaleString('vi-VN') + '₫';
}

// ============================================================
// 3. ĐỌC DỮ LIỆU TỪ db.json (Với cơ chế Fallback an toàn)
// ============================================================
async function loadData() {
  // 1. Ưu tiên kiểm tra dữ liệu do Admin đã lưu trong localStorage ('adminData')
  const saved = localStorage.getItem('adminData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Lỗi parse adminData:', e);
    }
  }

  // 2. Thử fetch từ db.json nếu đang chạy qua máy chủ (Live Server, HTTP/HTTPS)
  if (typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
    try {
      const res = await fetch('db.json');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.products) && json.products.length > 0) {
          return json;
        }
      }
    } catch (err) {
      console.warn('Không thể fetch db.json:', err);
    }
  }

  // 3. Dữ liệu dự phòng LOCAL_DB từ data.js nếu mở trực tiếp bằng file://
  if (typeof LOCAL_DB !== 'undefined' && LOCAL_DB.products) {
    return LOCAL_DB;
  }
  return { products: [], categories: [] };
}

// ============================================================
// 4. ĐỌC THAM SỐ URL & TẢI CHI TIẾT SẢN PHẨM
// ============================================================
async function initProductDetail() {
  const container = document.getElementById('productDetailContainer');
  try {
    // URLSearchParams: Lấy tham số `?id=...` trên thanh địa chỉ
    // Ví dụ: http://127.0.0.1:5500/detail.html?id=3 -> urlParams.get('id') trả về "3"
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const targetId = idParam ? parseInt(idParam) : null;

    // Tải toàn bộ danh sách sản phẩm
    const data = await loadData();
    const products = (data && Array.isArray(data.products)) ? data.products : [];

    // Nếu không có sản phẩm nào trong hệ thống
    if (products.length === 0) {
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 80px 20px;">
            <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #0f172a;">Chưa có dữ liệu sản phẩm!</h2>
            <p style="color: #64748b; margin-bottom: 24px;">Hệ thống đang chuẩn bị cập nhật sản phẩm mới.</p>
            <a href="products.html" class="btn-primary" style="display:inline-block; padding: 12px 28px;">← Quay lại danh sách sản phẩm</a>
          </div>`;
      }
      return;
    }

    // Tìm sản phẩm trong mảng khớp với targetId
    let rawProduct = null;
    if (targetId !== null && !isNaN(targetId)) {
      rawProduct = products.find(p => Number(p.id) === Number(targetId));
    }

    // Nếu không truyền tham số ?id= thì lấy sản phẩm đầu tiên làm mặc định
    if (!rawProduct) {
      if (!idParam) {
        rawProduct = products[0];
      } else {
        // Nếu truyền ID nhưng không tồn tại trong CSDL
        if (container) {
          container.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
              <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #0f172a;">Không tìm thấy sản phẩm!</h2>
              <p style="color: #64748b; margin-bottom: 24px;">Sản phẩm mã #${idParam} không tồn tại hoặc đã ngừng kinh doanh.</p>
              <a href="products.html" class="btn-primary" style="display:inline-block; padding: 12px 28px;">← Quay lại danh sách sản phẩm</a>
            </div>`;
        }
        return;
      }
    }

    // Khởi tạo đối tượng Product từ Class OOP
    currentProduct = new Product(rawProduct);
    currentQuantity = 1;
    selectedSize = (currentProduct.sizes && currentProduct.sizes.length > 0) ? currentProduct.sizes[0] : 40;

    // Cập nhật thẻ <title> của trình duyệt và Breadcrumb điều hướng
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = `${currentProduct.name} – SneakerZone`;
    document.title = `${currentProduct.name} – SneakerZone`;

    const breadcrumbCat = document.getElementById('breadcrumbCategory');
    if (breadcrumbCat) {
      breadcrumbCat.textContent = currentProduct.category || 'Giày Sneaker';
      breadcrumbCat.href = `products.html?brand=${encodeURIComponent(currentProduct.category || '')}`;
    }

    const breadcrumbName = document.getElementById('breadcrumbName');
    if (breadcrumbName) {
      breadcrumbName.textContent = currentProduct.name;
    }

    // Render thông tin chi tiết ra giao diện
    renderDetailView(currentProduct);

    // Render 4 sản phẩm cùng danh mục liên quan ở phía dưới
    try {
      renderRelatedProducts(products, currentProduct);
    } catch (relErr) {
      console.warn('Lỗi hiển thị sản phẩm liên quan:', relErr);
    }

  } catch (err) {
    console.error('Lỗi render trang chi tiết sản phẩm:', err);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px;">
          <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #ef4444;">Đã có lỗi xảy ra!</h2>
          <p style="color: #64748b; margin-bottom: 24px;">Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.</p>
          <a href="products.html" class="btn-primary" style="display:inline-block; padding: 12px 28px;">← Xem tất cả sản phẩm</a>
        </div>`;
    }
  }
}

// ============================================================
// 5. HIỂN THỊ CHI TIẾT SẢN PHẨM RA DOM (Render Detail View)
// ============================================================
function renderDetailView(product) {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  const isOutOfStock = product.stock <= 0;

  // Tạo HTML danh sách nút chọn Size giày
  const sizesHtml = product.sizes.map(size => `
    <button type="button" class="detail-size-btn ${size === selectedSize ? 'active' : ''}" onclick="selectDetailSize(this, ${size})">
      ${size}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="product-detail-layout">
      <!-- Cột Trái: Ảnh sản phẩm lớn & Thumbnail -->
      <div class="detail-gallery">
        <div class="detail-main-img-wrap">
          <img id="mainProductImg"
               src="${product.image}"
               alt="${product.name}"
               onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'" />
          <span class="detail-gallery-badge">${product.price > 4000000 ? 'Độc quyền' : 'Chính hãng 100%'}</span>
        </div>

        <!-- Thumbnail các góc chụp khác nhau -->
        <div class="detail-thumbs">
          <div class="detail-thumb active" onclick="changeMainImage('${product.image}', this)">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'" />
          </div>
          <div class="detail-thumb" onclick="changeMainImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', this)">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" alt="Góc chụp 2" />
          </div>
          <div class="detail-thumb" onclick="changeMainImage('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80', this)">
            <img src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80" alt="Góc chụp 3" />
          </div>
        </div>
      </div>

      <!-- Cột Phải: Thông tin chi tiết, Chọn size, Số lượng & Đặt mua -->
      <div class="detail-info">
        <span class="detail-category">${product.category} · Giày thể thao chính hãng</span>
        <h1 class="detail-title">${product.name}</h1>

        <div class="detail-price-stock">
          <span class="detail-price">${formatPrice(product.price)}</span>
          <span class="detail-stock-badge ${isOutOfStock ? 'out-of-stock' : ''}">
            ${!isOutOfStock ? `Còn hàng (${product.stock} đôi)` : 'Tạm hết hàng'}
          </span>
        </div>

        <div class="detail-desc">
          <p>${product.description}</p>
        </div>

        <!-- Chọn Size -->
        <div class="detail-section-label">
          <span>Chọn kích cỡ (EU):</span>
          <span class="size-guide-link" onclick="showToast('Bảng quy đổi: Size 40 ~ 25cm bàn chân')">Hướng dẫn chọn size</span>
        </div>
        <div class="detail-sizes" id="sizesContainer">
          ${sizesHtml}
        </div>

        <!-- Chọn Số Lượng -->
        <div class="detail-section-label">
          <span>Số lượng:</span>
        </div>
        <div class="detail-qty-wrap">
          <div class="detail-qty-control">
            <button type="button" class="detail-qty-btn" onclick="updateQty(-1)" ${isOutOfStock ? 'disabled' : ''}>−</button>
            <input type="text" id="qtyInput" class="detail-qty-input" value="${isOutOfStock ? 0 : 1}" readonly />
            <button type="button" class="detail-qty-btn" onclick="updateQty(1)" ${isOutOfStock ? 'disabled' : ''}>+</button>
          </div>
          <span style="font-size:0.9rem; color:#64748b;">
            ${isOutOfStock ? 'Sản phẩm tạm thời hết hàng' : `Tối đa ${product.stock} đôi`}
          </span>
        </div>

        <!-- Nút Đặt Mua -->
        <div class="detail-actions">
          <button type="button" class="btn-add-detail" onclick="handleAddToCart()" ${isOutOfStock ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            + Thêm vào túi đồ
          </button>
          <button type="button" class="btn-buy-now" onclick="handleBuyNow()" ${isOutOfStock ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            Mua ngay
          </button>
        </div>

        <!-- Cam kết dịch vụ -->
        <div class="detail-perks">
          <div class="detail-perk-item">
            <span class="perk-bullet">•</span>
            <div><strong>Miễn phí giao hàng:</strong> Đơn hàng từ 1.000.000₫ toàn quốc</div>
          </div>
          <div class="detail-perk-item">
            <span class="perk-bullet">•</span>
            <div><strong>Đổi trả dễ dàng:</strong> Miễn phí đổi size trong 30 ngày</div>
          </div>
          <div class="detail-perk-item">
            <span class="perk-bullet">•</span>
            <div><strong>Cam kết chính hãng:</strong> Đền gấp 10 lần nếu phát hiện hàng giả</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 6. CÁC HÀM XỬ LÝ CHỌN SIZE, ĐỔI ẢNH, SỐ LƯỢNG
// ============================================================
// Đổi size đang chọn
function selectDetailSize(btn, size) {
  selectedSize = Number(size);
  document.querySelectorAll('.detail-size-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// Click thumbnail nhỏ -> đổi ảnh to phía trên
function changeMainImage(url, thumbEl) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) mainImg.src = url;

  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

// Tăng hoặc giảm số lượng mua theo bước delta (+1 hoặc -1)
function updateQty(delta) {
  if (!currentProduct || currentProduct.stock <= 0) return;
  const newQty = currentQuantity + delta;
  // Không cho chọn nhỏ hơn 1 và không vượt quá tồn kho
  if (newQty >= 1 && newQty <= currentProduct.stock) {
    currentQuantity = newQty;
    const input = document.getElementById('qtyInput');
    if (input) input.value = currentQuantity;
  }
}

// ============================================================
// 7. THAO TÁC THÊM VÀO GIỎ & MUA NGAY
// ============================================================
// Thêm vào giỏ hàng
function handleAddToCart() {
  if (!currentProduct) return;
  if (currentProduct.stock <= 0) {
    showToast('Sản phẩm này hiện đang tạm hết hàng!', 'error');
    return;
  }

  // Gọi hàm addToCart trong Cart.js kèm số lượng và size
  cart.addToCart(currentProduct, currentQuantity, selectedSize);

  // Render lại giỏ hàng và hiện thông báo Toast
  renderCart();
  showToast(`Đã thêm ${currentQuantity} đôi "${currentProduct.name}" (Size ${selectedSize}) vào giỏ hàng!`);
}

// Mua ngay: Thêm vào giỏ và tự động bật mở drawer giỏ hàng luôn
function handleBuyNow() {
  if (!currentProduct || currentProduct.stock <= 0) {
    showToast('Sản phẩm này hiện đang tạm hết hàng!', 'error');
    return;
  }
  handleAddToCart();
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
}

// ============================================================
// 8. RENDER 4 SẢN PHẨM CÙNG DANH MỤC LIÊN QUAN
// ============================================================
function renderRelatedProducts(allProducts, product) {
  const container = document.getElementById('relatedProductsContainer');
  const section   = document.getElementById('relatedSection');
  if (!container || !section) return;

  // Lọc các sản phẩm cùng thương hiệu, loại trừ sản phẩm hiện tại
  let related = allProducts.filter(p => 
    p.category === product.category && Number(p.id) !== Number(product.id)
  );

  // Nếu cùng danh mục có ít hơn 4 mẫu, lấy thêm các sản phẩm khác để đủ 4 mẫu
  if (related.length < 4) {
    const others = allProducts.filter(p => 
      Number(p.id) !== Number(product.id) && !related.some(r => Number(r.id) === Number(p.id))
    );
    related = related.concat(others);
  }

  // Cắt lấy đúng 4 sản phẩm
  related = related.slice(0, 4);

  if (related.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  
  let html = '';
  related.forEach(item => {
    html += `
      <div class="product-card">
        <div class="product-image-wrap" onclick="location.href='detail.html?id=${item.id}'">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'" />
          <span class="product-badge">${item.category}</span>
        </div>
        <div class="product-info">
          <div class="product-category">${item.category}</div>
          <h3 class="product-name" onclick="location.href='detail.html?id=${item.id}'" style="cursor:pointer">${item.name}</h3>
          <div class="product-footer">
            <div class="product-price">${formatPrice(item.price)}</div>
            <button type="button" class="btn-add-cart" onclick="event.stopPropagation(); quickAddRelated(${JSON.stringify(item).replace(/"/g, '&quot;')})">
              + Thêm
            </button>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// Thêm nhanh sản phẩm liên quan vào giỏ
function quickAddRelated(productData) {
  cart.addToCart(productData);
  renderCart();
  showToast(`Đã thêm "${productData.name}" vào giỏ hàng!`);
}

// Gắn các hàm ra window để các thuộc tính onclick trong HTML có thể gọi được
window.selectDetailSize  = selectDetailSize;
window.changeMainImage   = changeMainImage;
window.updateQty         = updateQty;
window.handleAddToCart   = handleAddToCart;
window.handleBuyNow      = handleBuyNow;
window.quickAddRelated   = quickAddRelated;
window.getCurrentProduct = () => currentProduct;

// ============================================================
// 9. THIẾT LẬP Ô TÌM KIẾM TRÊN HEADER
// ============================================================
function setupDetailHeaderSearch() {
  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) window.location.href = `products.html?q=${encodeURIComponent(q)}`;
      }
    });
  }
}

// ============================================================
// 10. TỰ ĐỘNG CHẠY KHI TẢI XONG TRANG
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setupDetailHeaderSearch();
  initProductDetail();
});
