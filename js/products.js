// ============================================================
// products.js – TRANG DANH SÁCH SẢN PHẨM (products.html)
// Môn học: WEB2064 - JavaScript Nâng Cao
// Kiến thức áp dụng:
// 1. OOP (Class Product & Class ProductManager)
// 2. Async/Await & Fetch API đọc dữ liệu JSON
// 3. Phương thức xử lý mảng (Array Methods): filter, map, sort, forEach, slice
// 4. Xử lý DOM & Event Listener (input, click, change, keydown)
// 5. URLSearchParams phân tích tham số trên thanh địa chỉ URL (?brand=..., ?q=...)
// ============================================================

// ============================================================
// 1. CLASS PRODUCT (Mô hình hóa dữ liệu sản phẩm theo OOP)
// ============================================================
class Product {
  /**
   * Khởi tạo đối tượng Product từ dữ liệu thô (Object)
   * @param {Object} data - Dữ liệu từng sản phẩm từ db.json
   */
  constructor(data) {
    this.id          = data.id;                                   // Mã định danh duy nhất (ID)
    this.name        = data.name;                                 // Tên giày thể thao
    this.category    = data.category;                             // Tên thương hiệu/danh mục (Nike, Adidas,...)
    this.categoryId  = data.categoryId;                           // ID danh mục
    this.price       = Number(data.price);                        // Đơn giá bán (ép kiểu sang số)
    this.stock       = Number(data.stock);                        // Số lượng còn trong kho
    this.image       = data.image;                                // Link ảnh sản phẩm
    this.description = data.description;                          // Mô tả ngắn sản phẩm
    this.sizes       = data.sizes || [38, 39, 40, 41, 42];        // Mảng các size giày (nếu không có thì gán mặc định)
  }
}

// ============================================================
// 2. CLASS PRODUCTMANAGER (Quản lý và xử lý dữ liệu theo OOP)
// Đóng gói toàn bộ thuật toán tìm kiếm, lọc đa tiêu chí và sắp xếp
// ============================================================
class ProductManager {
  /**
   * @param {Array} products - Danh sách tất cả sản phẩm ban đầu
   */
  constructor(products) {
    this.products = products;
  }

  /**
   * Lọc và sắp xếp sản phẩm dựa theo bộ lọc đa điều kiện
   * @param {Object} filterOptions - Các tiêu chí lọc hiện tại
   * @returns {Array} Mảng sản phẩm sau khi đã lọc và sắp xếp
   */
  filterProducts({ keyword = '', category = '', priceRange = '', size = null, sortType = '' }) {
    // Dùng toán tử Spread ([...]) tạo bản sao mảng để không làm thay đổi mảng gốc ban đầu
    let list = [...this.products];

    // --- BƯỚC 1: Tìm kiếm theo từ khóa (Keyword) ---
    // So sánh không phân biệt hoa thường (toLowerCase) trên cả tên và danh mục
    if (keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(kw) || 
        p.category.toLowerCase().includes(kw)
      );
    }

    // --- BƯỚC 2: Lọc theo thương hiệu / Danh mục (Category) ---
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // --- BƯỚC 3: Lọc theo khoảng giá (Price Range) ---
    if (priceRange === 'under-2m') {
      list = list.filter(p => p.price < 2000000);                      // Dưới 2 triệu
    } else if (priceRange === '2m-3m') {
      list = list.filter(p => p.price >= 2000000 && p.price <= 3000000); // Từ 2 - 3 triệu
    } else if (priceRange === 'over-3m') {
      list = list.filter(p => p.price > 3000000);                      // Trên 3 triệu
    }

    // --- BƯỚC 4: Lọc theo kích cỡ giày (Size) ---
    if (size) {
      const numSize = Number(size);
      list = list.filter(p => (p.sizes || []).includes(numSize));
    }

    // --- BƯỚC 5: Sắp xếp (Sorting) ---
    if (sortType === 'price-asc') {
      // Giá tăng dần: lấy giá A trừ giá B
      list.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price-desc') {
      // Giá giảm dần: lấy giá B trừ giá A
      list.sort((a, b) => b.price - a.price);
    } else if (sortType === 'name-asc') {
      // Tên từ A đến Z: dùng hàm so sánh chuỗi tiếng Việt localeCompare
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'newest') {
      // Mới nhất: ưu tiên ID lớn hơn xếp lên trước
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }
}

// ============================================================
// 3. BIẾN TOÀN CỤC LƯU TRỮ TRẠNG THÁI (Global State)
// ============================================================
let allProducts = [];      // Chứa danh sách đầy đủ tất cả sản phẩm
let manager;              // Instance của class ProductManager
let activeFilters = {     // Đối tượng theo dõi các tiêu chí lọc đang được chọn
  keyword: '',            // Từ khóa tìm kiếm
  category: '',           // Thương hiệu được chọn ('' = Tất cả)
  priceRange: '',         // Mức giá ('under-2m', '2m-3m', 'over-3m')
  size: null,             // Size được chọn (38, 39,...)
  sortType: 'newest'      // Cách sắp xếp mặc định (mới nhất)
};

// ============================================================
// 4. ĐỌC DỮ LIỆU TỪ db.json (Kết hợp fallback LOCAL_DB)
// ============================================================
async function loadData() {
  // Ưu tiên 1: Đọc dữ liệu do Quản trị viên cập nhật trong localStorage ('adminData')
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

  // Ưu tiên 2: Dùng fetch API đọc trực tiếp từ file db.json trên server
  try {
    const response = await fetch('db.json');
    if (!response.ok) throw new Error('Không thể fetch db.json');
    return await response.json();
  } catch (err) {
    // Ưu tiên 3: Nếu mở trang bằng giao thức file:// (không có web server) thì lấy LOCAL_DB từ data.js
    console.warn('Dùng dữ liệu dự phòng LOCAL_DB từ data.js:', err);
    if (typeof LOCAL_DB !== 'undefined') {
      return LOCAL_DB;
    }
    return { products: [], categories: [] };
  }
}

// ============================================================
// 5. HIỂN THỊ DANH SÁCH SẢN PHẨM RA MÀN HÌNH (Render DOM)
// ============================================================
function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  const countEl   = document.getElementById('productCount');

  // Cập nhật số lượng sản phẩm hiển thị trên thanh thống kê
  if (countEl) countEl.textContent = products.length;
  if (!container) return;

  // Xóa sạch nội dung cũ trong container trước khi render mới
  container.innerHTML = '';

  // Trường hợp bộ lọc không tìm thấy sản phẩm nào phù hợp
  if (products.length === 0) {
    container.innerHTML = `
      <div class="no-result">
        <h3>Không tìm thấy sản phẩm phù hợp</h3>
        <p style="color:var(--gray-400); margin: 8px 0 20px;">Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
        <button class="btn-primary" onclick="resetAllFilters()">Đặt lại bộ lọc</button>
      </div>`;
    return;
  }

  // Duyệt qua từng sản phẩm để tạo phần tử HTML bằng createElement
  products.forEach(data => {
    const product = new Product(data);

    // Tạo danh sách các nút size nhỏ hiển thị trượt lên khi hover vào thẻ
    const sizesHtml = (product.sizes || []).slice(0, 6).map(s =>
      `<span class="size-chip" onclick="selectCardSize(event, ${s})">${s}</span>`
    ).join('');

    // Đặt nhãn (badge) cho sản phẩm dựa theo điều kiện giá hoặc ID
    const badgeText = product.price > 4000000 ? 'Độc quyền' : (product.id <= 2 ? 'Mới ra mắt' : 'Bán chạy');

    // Tạo thẻ div cha bao quanh card sản phẩm
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
// 6. THAO TÁC THÊM VÀO GIỎ HÀNG VÀ CHỌN SIZE
// ============================================================
// Thêm nhanh sản phẩm vào giỏ hàng từ nút trên thẻ
function addProductToCart(productData) {
  cart.addToCart(productData); // Gọi method của class Cart trong Cart.js
  renderCart();                // Cập nhật lại giao diện giỏ hàng và badge
  showToast(`Đã thêm "${productData.name}" vào giỏ hàng!`);
}

// Chọn size trực tiếp trên thẻ sản phẩm
function selectCardSize(e, size) {
  e.stopPropagation(); // Ngăn sự kiện nổi bọt (không bị chuyển sang trang chi tiết khi bấm size)
  showToast(`Đã chọn size ${size}`);
}

// ============================================================
// 7. ÁP DỤNG & ĐẶT LẠI BỘ LỌC (Filter Handlers)
// ============================================================
// Lấy danh sách đã lọc qua manager và vẽ lại màn hình
function applyFilter() {
  const result = manager.filterProducts(activeFilters);
  renderProducts(result);
}

// Đặt lại toàn bộ bộ lọc về trạng thái ban đầu
function resetAllFilters() {
  activeFilters = {
    keyword: '',
    category: '',
    priceRange: '',
    size: null,
    sortType: 'newest'
  };

  // Reset các ô nhập tìm kiếm
  const searchBox = document.getElementById('searchBox');
  if (searchBox) searchBox.value = '';

  const headerSearch = document.getElementById('headerSearchInput');
  if (headerSearch) headerSearch.value = '';

  // Reset dropdown sắp xếp về mặc định
  const sortSelect = document.getElementById('sortBy');
  if (sortSelect) sortSelect.value = 'newest';

  // Đặt lại active cho nút thương hiệu "Tất cả"
  document.querySelectorAll('.filter-pill-cat').forEach(p => p.classList.remove('active'));
  document.getElementById('cat-filter-all')?.classList.add('active');

  // Đặt lại active cho nút giá "Tất cả mức giá"
  document.querySelectorAll('.filter-price-option').forEach(r => r.classList.remove('active'));
  document.getElementById('price-all')?.classList.add('active');

  // Bỏ active ở các nút size
  document.querySelectorAll('.filter-size-btn').forEach(b => b.classList.remove('active'));

  applyFilter();
}

// ============================================================
// 8. RENDER CÁC NÚT THƯƠNG HIỆU Ở SIDEBAR BỘ LỌC
// ============================================================
function renderCategoryPills(categories) {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  // Tạo nút "Tất cả thương hiệu" đầu tiên
  container.innerHTML = `
    <button class="filter-pill filter-pill-cat active" id="cat-filter-all" data-cat="">
      Tất cả thương hiệu
    </button>
  `;

  // Duyệt danh mục tạo từng nút bấm
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill filter-pill-cat';
    btn.dataset.cat = cat.name;
    btn.textContent = cat.name;
    container.appendChild(btn);
  });

  // Ủy quyền sự kiện (Event Delegation) khi bấm vào nút danh mục
  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-pill-cat');
    if (!btn) return;

    document.querySelectorAll('.filter-pill-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilters.category = btn.dataset.cat || '';
    applyFilter();
  });
}

// ============================================================
// 9. THIẾT LẬP CÁC SỰ KIỆN TƯƠNG TÁC (Event Listeners)
// ============================================================
function setupFilterEvents() {
  const searchBox = document.getElementById('searchBox');
  const headerSearch = document.getElementById('headerSearchInput');

  // Sự kiện gõ từ khóa ở ô tìm kiếm trong Sidebar
  if (searchBox) {
    searchBox.addEventListener('input', e => {
      activeFilters.keyword = e.target.value;
      if (headerSearch) headerSearch.value = e.target.value; // Đồng bộ 2 ô tìm kiếm
      applyFilter();
    });
  }

  // Sự kiện gõ từ khóa trên Header thanh điều hướng
  if (headerSearch) {
    headerSearch.addEventListener('input', e => {
      activeFilters.keyword = e.target.value;
      if (searchBox) searchBox.value = e.target.value;       // Đồng bộ 2 ô tìm kiếm
      applyFilter();
    });
    headerSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        activeFilters.keyword = headerSearch.value;
        if (searchBox) searchBox.value = headerSearch.value;
        applyFilter();
      }
    });
  }

  // Sự kiện đổi kiểu sắp xếp từ dropdown select
  const sortSelect = document.getElementById('sortBy');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      activeFilters.sortType = e.target.value;
      applyFilter();
    });
  }

  // Sự kiện chọn khoảng giá
  const priceContainer = document.getElementById('priceFilters');
  if (priceContainer) {
    priceContainer.addEventListener('click', e => {
      const btn = e.target.closest('.filter-price-option');
      if (!btn) return;
      document.querySelectorAll('.filter-price-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.priceRange = btn.dataset.range || '';
      applyFilter();
    });
  }

  // Sự kiện chọn kích cỡ giày (bấm lần nữa để bỏ chọn)
  const sizeContainer = document.getElementById('sizeFilters');
  if (sizeContainer) {
    sizeContainer.addEventListener('click', e => {
      const btn = e.target.closest('.filter-size-btn');
      if (!btn) return;

      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        activeFilters.size = null; // Hủy lọc size
      } else {
        document.querySelectorAll('.filter-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilters.size = btn.dataset.size;
      }
      applyFilter();
    });
  }

  // Ẩn / Hiện thanh Sidebar bộ lọc
  const toggleBtn = document.getElementById('btnToggleFilter');
  const sidebar = document.getElementById('filterSidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      toggleBtn.classList.toggle('active');
      const isCollapsed = sidebar.classList.contains('collapsed');
      toggleBtn.textContent = isCollapsed ? 'Hiện bộ lọc' : 'Ẩn bộ lọc';
    });
  }

  // Nút đặt lại tất cả bộ lọc
  const resetBtn = document.getElementById('btnResetFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }
}

// ============================================================
// 10. HÀM KHỞI CHẠY CHÍNH (Init Flow)
// ============================================================
async function init() {
  // 1. Tải dữ liệu bất đồng bộ
  const data = await loadData();
  allProducts = data.products || [];

  // 2. Khởi tạo đối tượng quản lý ProductManager
  manager = new ProductManager(allProducts);

  // 3. Render giao diện bộ lọc danh mục và gắn sự kiện
  renderCategoryPills(data.categories || []);
  setupFilterEvents();

  // 4. Render danh sách sản phẩm ban đầu ra trang
  renderProducts(allProducts);

  // 5. Đọc tham số trên URL (?brand=Nike hoặc ?q=air) nếu người dùng điều hướng từ trang khác sang
  const urlParams = new URLSearchParams(window.location.search);
  const brandParam = urlParams.get('brand');
  const qParam = urlParams.get('q');

  // Nếu có từ khóa tìm kiếm trên URL (?q=...)
  if (qParam) {
    activeFilters.keyword = qParam;
    const searchBox = document.getElementById('searchBox');
    const headerSearch = document.getElementById('headerSearchInput');
    if (searchBox) searchBox.value = qParam;
    if (headerSearch) headerSearch.value = qParam;
    applyFilter();
  }

  // Nếu có tham số thương hiệu trên URL (?brand=...)
  if (brandParam) {
    activeFilters.category = brandParam;
    const catBtn = document.querySelector(`[data-cat="${brandParam}"]`);
    if (catBtn) {
      document.querySelectorAll('.filter-pill-cat').forEach(b => b.classList.remove('active'));
      catBtn.classList.add('active');
    }
    applyFilter();
  }
}

// Chạy hàm khởi tạo
init();
