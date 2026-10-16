// ============================================================
// detail.js – Xem Chi Tiết Sản Phẩm (WEB2064 - JS Nâng Cao)
// Áp dụng: DOM, OOP (class Product), JSON (fetch), URLSearchParams, Giỏ hàng
// ============================================================

// 1. CLASS PRODUCT (OOP)
class Product {
  constructor(data) {
    this.id          = data.id;
    this.name        = data.name;
    this.category    = data.category;
    this.categoryId  = data.categoryId;
    this.price       = Number(data.price);
    this.stock       = data.stock;
    this.image       = data.image;
    this.description = data.description;
    this.sizes       = data.sizes || [38, 39, 40, 41, 42];
  }

  // Method trả về thông tin tóm tắt sản phẩm
  getInfo() {
    return `${this.name} - ${this.price.toLocaleString('vi-VN')}₫ (Còn: ${this.stock} đôi)`;
  }
}

// 2. BIẾN TOÀN CỤC QUẢN LÝ TRẠNG THÁI
let currentProduct = null;
let currentQuantity = 1;
let selectedSize = 40;

// Format giá tiền VND
function formatPrice(num) {
  return Number(num).toLocaleString('vi-VN') + '₫';
}

// 3. ĐỌC DỮ LIỆU TỪ db.json (hoặc LOCAL_DB dự phòng)
async function loadData() {
  const saved = localStorage.getItem('adminData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.products && parsed.products.length > 0) return parsed;
    } catch {}
  }

  try {
    const res = await fetch('db.json');
    if (!res.ok) throw new Error('Fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Dùng dữ liệu dự phòng LOCAL_DB:', err);
    if (typeof LOCAL_DB !== 'undefined') {
      return LOCAL_DB;
    }
    return { products: [], categories: [] };
  }
}

// 4. LẤY ID TỪ URL BẰNG URLSearchParams VÀ KHỞI TẠO TRANG
async function initProductDetail() {
  // Lấy id từ query string trên URL: ?id=1
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id')) || 1;

  // Tải danh sách sản phẩm
  const data = await loadData();
  const products = data.products || [];

  // Tìm sản phẩm khớp ID bằng phương thức find()
  const rawProduct = products.find(p => p.id === productId);

  if (!rawProduct) {
    document.getElementById('productDetailContainer').innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #0f172a;">Không tìm thấy sản phẩm!</h2>
        <p style="color: #64748b; margin-bottom: 24px;">Sản phẩm bạn đang tìm không tồn tại hoặc đã ngừng kinh doanh.</p>
        <a href="products.html" class="btn-primary" style="display:inline-block; padding: 12px 28px;">← Quay lại danh sách sản phẩm</a>
      </div>`;
    return;
  }

  // Khởi tạo đối tượng Product từ Class OOP
  currentProduct = new Product(rawProduct);
  selectedSize = currentProduct.sizes[0] || 40;

  // Cập nhật tiêu đề trang và Breadcrumb
  document.getElementById('pageTitle').textContent = `${currentProduct.name} – SneakerZone`;
  document.getElementById('breadcrumbCategory').textContent = currentProduct.category;
  document.getElementById('breadcrumbCategory').href = `products.html?category=${encodeURIComponent(currentProduct.category)}`;
  document.getElementById('breadcrumbName').textContent = currentProduct.name;

  // Render giao diện chi tiết sản phẩm
  renderDetailView(currentProduct);

  // Render sản phẩm cùng danh mục liên quan
  renderRelatedProducts(products, currentProduct);
}

// 5. HIỂN THỊ CHI TIẾT SẢN PHẨM RA DOM
function renderDetailView(product) {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  // Tạo danh sách nút chọn Size
  const sizesHtml = product.sizes.map(size => `
    <button class="detail-size-btn ${size === selectedSize ? 'active' : ''}" onclick="selectDetailSize(this, ${size})">
      ${size}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="product-detail-layout">
      <!-- Cột Trái: Ảnh sản phẩm lớn -->
      <div class="detail-gallery">
        <div class="detail-main-img-wrap">
          <img id="mainProductImg"
               src="${product.image}"
               alt="${product.name}"
               onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'" />
          <span class="detail-gallery-badge">${product.price > 4000000 ? 'Độc quyền' : 'Chính hãng 100%'}</span>
        </div>

        <!-- Thumbnail góc nhìn nhỏ -->
        <div class="detail-thumbs">
          <div class="detail-thumb active" onclick="changeMainImage('${product.image}', this)">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="detail-thumb" onclick="changeMainImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', this)">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" alt="Góc chụp 2" />
          </div>
          <div class="detail-thumb" onclick="changeMainImage('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80', this)">
            <img src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80" alt="Góc chụp 3" />
          </div>
        </div>
      </div>

      <!-- Cột Phải: Thông tin chi tiết & Đặt mua -->
      <div class="detail-info">
        <span class="detail-category">${product.category} · Giày thể thao chính hãng</span>
        <h1 class="detail-title">${product.name}</h1>

        <div class="detail-price-stock">
          <span class="detail-price">${formatPrice(product.price)}</span>
          <span class="detail-stock-badge">${product.stock > 0 ? `Còn hàng (${product.stock} đôi)` : 'Tạm hết hàng'}</span>
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
            <button class="detail-qty-btn" onclick="updateQty(-1)">−</button>
            <input type="text" id="qtyInput" class="detail-qty-input" value="1" readonly />
            <button class="detail-qty-btn" onclick="updateQty(1)">+</button>
          </div>
          <span style="font-size:0.9rem; color:#64748b;">Tối đa ${product.stock} đôi</span>
        </div>

        <!-- Nút Đặt Mua & Yêu Thích -->
        <div class="detail-actions">
          <button class="btn-add-detail" onclick="handleAddToCart()">
            + Thêm vào túi đồ
          </button>
          <button class="btn-buy-now" onclick="handleBuyNow()">
            Mua ngay
          </button>
          <button class="btn-wishlist-detail ${typeof wishlist !== 'undefined' && wishlist.has(product.id) ? 'active' : ''}" 
                  id="btnDetailWishlist" 
                  data-product-id="${product.id}"
                  onclick="handleToggleDetailWishlist()">
            ${typeof wishlist !== 'undefined' && wishlist.has(product.id) ? '♥ Đã thêm vào mục Yêu thích' : '♡ Thêm vào mục Yêu thích'}
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

// 6. CHỌN SIZE & THAY ĐỔI ẢNH & SỐ LƯỢNG
function selectDetailSize(btn, size) {
  selectedSize = size;
  document.querySelectorAll('.detail-size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function changeMainImage(url, thumbEl) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) mainImg.src = url;

  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}

function updateQty(delta) {
  if (!currentProduct) return;
  const newQty = currentQuantity + delta;
  if (newQty >= 1 && newQty <= currentProduct.stock) {
    currentQuantity = newQty;
    document.getElementById('qtyInput').value = currentQuantity;
  }
}

// 7. THÊM VÀO GIỎ HÀNG TỪ TRANG CHI TIẾT
function handleAddToCart() {
  if (!currentProduct) return;

  // Gọi phương thức addToCart của đối tượng cart với tham số số lượng (Default Parameter quantity)
  cart.addToCart(currentProduct, currentQuantity);

  // Cập nhật lại giao diện giỏ hàng
  renderCart();
  showToast(`Đã thêm ${currentQuantity} đôi "${currentProduct.name}" (Size ${selectedSize}) vào giỏ hàng!`);
}

// Mua ngay: Thêm vào giỏ và mở luôn sidebar giỏ hàng
function handleBuyNow() {
  handleAddToCart();
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
}

// Toggle Yêu thích từ trang chi tiết
function handleToggleDetailWishlist() {
  if (!currentProduct) return;
  const isAdded = wishlist.toggle(currentProduct);
  const btn = document.getElementById('btnDetailWishlist');
  if (btn) {
    if (isAdded) {
      btn.classList.add('active');
      btn.innerHTML = '♥ Đã thêm vào mục Yêu thích';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '♡ Thêm vào mục Yêu thích';
    }
  }
  updateWishlistBadge();
  syncWishlistButtons(currentProduct.id, isAdded);
  renderWishlist();

  if (isAdded) {
    showToast(`Đã thêm "${currentProduct.name}" vào mục Yêu thích!`);
  } else {
    showToast(`Đã xóa "${currentProduct.name}" khỏi mục Yêu thích`, 'error');
  }
}

// 8. RENDER SẢN PHẨM CÙNG DANH MỤC LIÊN QUAN
function renderRelatedProducts(allProducts, product) {
  const container = document.getElementById('relatedProductsContainer');
  const section   = document.getElementById('relatedSection');
  if (!container || !section) return;

  // Lọc các sản phẩm cùng category, loại trừ chính sản phẩm đang xem
  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (related.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  related.forEach(item => {
    const isFav = typeof wishlist !== 'undefined' && wishlist.has(item.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-wrap" onclick="location.href='detail.html?id=${item.id}'">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <span class="product-badge">${item.category}</span>
        <button class="product-wishlist ${isFav ? 'active' : ''}" 
                data-product-id="${item.id}"
                style="${isFav ? 'color:#e11d48;' : ''}"
                title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}" 
                onclick="event.stopPropagation(); toggleWishlistProduct(${JSON.stringify(item).replace(/"/g, '&quot;')}, this)">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="product-info">
        <div class="product-category">${item.category}</div>
        <h3 class="product-name" onclick="location.href='detail.html?id=${item.id}'" style="cursor:pointer">${item.name}</h3>
        <div class="product-footer">
          <div class="product-price">${formatPrice(item.price)}</div>
          <button class="btn-add-cart" onclick="event.stopPropagation(); quickAddRelated(${JSON.stringify(item).replace(/"/g, '&quot;')})">
            + Thêm
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (typeof syncAllWishlistButtons === 'function') {
    syncAllWishlistButtons();
  }
}

function quickAddRelated(productData) {
  cart.addToCart(productData);
  renderCart();
  showToast(`Đã thêm "${productData.name}" vào giỏ hàng!`);
}

// Gắn các hàm ra window để các nút onclick trong HTML có thể gọi
window.selectDetailSize           = selectDetailSize;
window.changeMainImage            = changeMainImage;
window.updateQty                  = updateQty;
window.handleAddToCart            = handleAddToCart;
window.handleBuyNow               = handleBuyNow;
window.handleToggleDetailWishlist = handleToggleDetailWishlist;
window.quickAddRelated            = quickAddRelated;
window.toggleWishlist             = toggleWishlistProduct;


// Tự động chạy khi tải xong trang
document.addEventListener('DOMContentLoaded', () => {
  initProductDetail();
});
