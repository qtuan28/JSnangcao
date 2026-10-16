// ============================================================
// main.js – TRANG CHỦ (index.html)
// Môn học: WEB2064 - JavaScript Nâng Cao
// Kiến thức áp dụng:
// 1. OOP (Class Product): Mô hình hóa thông tin sản phẩm và phương thức getInfo()
// 2. Async/Await & Fetch API: Đọc db.json với cơ chế fallback LOCAL_DB
// 3. Render danh mục động (Categories): Lọc sản phẩm nổi bật theo danh mục
// 4. Tìm kiếm từ Header: Bắt sự kiện bàn phím (Enter) chuyển hướng sang trang products.html
// 5. Quản lý trạng thái: Thêm sản phẩm vào giỏ hàng dùng instance cart từ Cart.js
// ============================================================

// ============================================================
// 1. CLASS PRODUCT (OOP - Mô hình hóa sản phẩm)
// ============================================================
class Product {
  /**
   * Khởi tạo đối tượng Product từ dữ liệu thô
   * @param {Object} data - Dữ liệu sản phẩm từ db.json
   */
  constructor(data) {
    this.id          = data.id;                                       // Mã sản phẩm
    this.name        = data.name;                                     // Tên giày
    this.category    = data.category;                                 // Thương hiệu (Nike, Adidas,...)
    this.categoryId  = data.categoryId;                               // ID danh mục
    this.price       = Number(data.price);                            // Giá bán
    this.stock       = Number(data.stock);                            // Số lượng tồn kho
    this.image       = data.image;                                    // Link ảnh
    this.description = data.description;                              // Mô tả ngắn
    this.sizes       = data.sizes || [38, 39, 40, 41, 42];            // Size giày
  }

  /**
   * Phương thức trả về chuỗi thông tin tóm tắt sản phẩm (yêu cầu OOP - WEB2064)
   */
  getInfo() {
    return `${this.name} - ${formatPrice(this.price)}`;
  }
}

// ============================================================
// 2. ĐỌC DỮ LIỆU TỪ db.json (Kết hợp fallback LOCAL_DB)
// ============================================================
async function loadData() {
  // 1. Đọc dữ liệu do Admin lưu trong localStorage nếu có
  const saved = localStorage.getItem('adminData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Lỗi parse adminData:', e);
    }
  }

  // 2. Thử fetch từ file db.json trên máy chủ
  try {
    const response = await fetch('db.json');
    if (!response.ok) throw new Error('fetch failed');
    return await response.json();
  } catch (err) {
    // 3. Dữ liệu dự phòng LOCAL_DB từ data.js nếu mở trực tiếp bằng file://
    console.warn('Dùng dữ liệu fallback LOCAL_DB từ data.js:', err);
    if (typeof LOCAL_DB !== 'undefined') {
      return LOCAL_DB;
    }
    return { products: [], categories: [] };
  }
}

// ============================================================
// 3. RENDER DANH MỤC THƯƠNG HIỆU (Category Pills) TRÊN TRANG CHỦ
// ============================================================
function renderCategories(categories) {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  container.innerHTML = '';

  // Nút "Tất cả sản phẩm" đầu tiên
  const allCard = document.createElement('div');
  allCard.className = 'category-pill active';
  allCard.id = 'cat-all';
  allCard.innerHTML = `<span class="category-name">Tất cả sản phẩm</span>`;
  allCard.addEventListener('click', () => filterByCategory(''));
  container.appendChild(allCard);

  // Render từng danh mục thương hiệu
  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-pill';
    card.id = `cat-${cat.id}`;
    card.innerHTML = `<span class="category-name">${cat.name}</span>`;
    card.addEventListener('click', () => filterByCategory(cat.name));
    container.appendChild(card);
  });
}

// ============================================================
// 4. RENDER SẢN PHẨM NỔI BẬT RA MÀN HÌNH TRANG CHỦ
// ============================================================
function renderProducts(products, containerId = 'featuredProductsContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Trường hợp danh mục không có sản phẩm nào
  if (products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--gray-400);">
        <p style="font-size: 1.1rem; font-weight: 600;">Không có sản phẩm nào trong danh mục này.</p>
        <button class="btn-primary" style="margin-top: 16px;" onclick="filterByCategory('')">Xem tất cả</button>
      </div>`;
    return;
  }

  // Duyệt qua danh sách để tạo card HTML
  products.forEach(data => {
    const product = new Product(data);

    // Danh sách size hiển thị khi hover
    const sizesHtml = (product.sizes || []).slice(0, 6).map(s =>
      `<span class="size-chip" onclick="selectCardSize(event, ${s})">${s}</span>`
    ).join('');

    // Nhãn nổi bật
    const badgeText = product.price > 4000000 ? 'Độc quyền' : (product.id <= 2 ? 'Mới ra mắt' : 'Bán chạy');

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-wrap" onclick="location.href='detail.html?id=${product.id}'" style="cursor:pointer" title="Bấm xem chi tiết">
        <img src="${product.image}"
             alt="${product.name}"
             loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'" />
        <span class="product-badge">${badgeText}</span>
        ${sizesHtml ? `
        <div class="product-sizes">
          <span class="size-label">Size:</span>
          ${sizesHtml}
        </div>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${product.category} · Giày thể thao</div>
        <h3 class="product-name" onclick="location.href='detail.html?id=${product.id}'" style="cursor:pointer" title="Bấm xem chi tiết">${product.name}</h3>
        <div class="product-desc">${product.description}</div>
        <div class="product-footer">
          <div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-stock">Còn ${product.stock} đôi</div>
          </div>
          <button class="btn-add-cart" onclick="event.stopPropagation(); addProductToCart(${JSON.stringify(data).replace(/"/g, '&quot;')})">
            + Thêm vào giỏ
          </button>
        </div>
      </div>`;

    container.appendChild(card);
  });
}

// ============================================================
// 5. THAO TÁC THÊM GIỎ HÀNG & CHỌN SIZE TRÊN CARD
// ============================================================
function addProductToCart(productData) {
  cart.addToCart(productData); // Gọi method của class Cart trong Cart.js
  renderCart();                // Cập nhật drawer giỏ hàng
  showToast(`Đã thêm "${productData.name}" vào giỏ hàng!`);
}

function selectCardSize(e, size) {
  e.stopPropagation(); // Không cho nổi bọt để tránh click nhảy sang detail.html
  showToast(`Đã chọn size ${size}`);
}

// ============================================================
// 6. LỌC SẢN PHẨM THEO DANH MỤC TRÊN TRANG CHỦ
// ============================================================
let allProducts = [];

function filterByCategory(categoryName) {
  // Bỏ class active ở tất cả các tab danh mục
  document.querySelectorAll('.category-pill').forEach(c => c.classList.remove('active'));

  if (categoryName === '') {
    // Nếu chọn "Tất cả"
    document.getElementById('cat-all')?.classList.add('active');
    renderProducts(allProducts, 'featuredProductsContainer');
  } else {
    // Nếu chọn một thương hiệu cụ thể (Nike, Adidas,...)
    const filtered = allProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    renderProducts(filtered, 'featuredProductsContainer');
    document.querySelectorAll('.category-pill').forEach(c => {
      if (c.querySelector('.category-name')?.textContent.toLowerCase() === categoryName.toLowerCase()) {
        c.classList.add('active');
      }
    });
  }
}

// ============================================================
// 7. Ô TÌM KIẾM TRÊN HEADER TRANG CHỦ
// ============================================================
function setupHeaderSearch() {
  const searchInput = document.getElementById('headerSearchInput');
  if (!searchInput) return;

  // Khi nhấn Enter -> Chuyển hướng sang trang products.html kèm tham số ?q=...
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `products.html?q=${encodeURIComponent(q)}`;
      }
    }
  });
}

// ============================================================
// 8. KHỞI CHẠY TRANG CHỦ (Init Flow)
// ============================================================
async function init() {
  const data = await loadData();
  allProducts = data.products || [];

  renderCategories(data.categories || []);
  renderProducts(allProducts, 'featuredProductsContainer');
  setupHeaderSearch();
}

// Chạy hàm khởi tạo
init();
