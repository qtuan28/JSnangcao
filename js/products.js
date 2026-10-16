// ============================================================
// products.js – Trang danh sách sản phẩm (products.html)
// Phong cách Nike: Tìm kiếm, Lọc thương hiệu, Lọc khoảng giá, Lọc Size, Sắp xếp
// ============================================================

// ===== CLASS PRODUCT =====
class Product {
  constructor(data) {
    this.id          = data.id;
    this.name        = data.name;
    this.category    = data.category;
    this.categoryId  = data.categoryId;
    this.price       = data.price;
    this.stock       = data.stock;
    this.image       = data.image;
    this.description = data.description;
    this.sizes       = data.sizes || [38, 39, 40, 41, 42];
  }
}

// ===== CLASS PRODUCTMANAGER =====
class ProductManager {
  constructor(products) {
    this.products = products;
  }

  // Lọc tổng hợp
  filterProducts({ keyword = '', category = '', priceRange = '', size = null, sortType = '' }) {
    let list = [...this.products];

    // 1. Tìm theo từ khóa
    if (keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw));
    }

    // 2. Lọc theo danh mục / thương hiệu
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // 3. Lọc theo khoảng giá
    if (priceRange === 'under-2m') {
      list = list.filter(p => p.price < 2000000);
    } else if (priceRange === '2m-3m') {
      list = list.filter(p => p.price >= 2000000 && p.price <= 3000000);
    } else if (priceRange === 'over-3m') {
      list = list.filter(p => p.price > 3000000);
    }

    // 4. Lọc theo size
    if (size) {
      const numSize = Number(size);
      list = list.filter(p => (p.sizes || []).includes(numSize));
    }

    // 5. Sắp xếp
    if (sortType === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortType === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }
}

// ===== BIẾN TOÀN CỤC =====
let allProducts = [];
let manager;
let activeFilters = {
  keyword: '',
  category: '',
  priceRange: '',
  size: null,
  sortType: 'newest'
};

// ===== ĐỌC DỮ LIỆU TỪ db.json (với fallback LOCAL_DB) =====
async function loadData() {
  const saved = localStorage.getItem('adminData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.products && parsed.products.length >= 28) {
        return parsed;
      }
    } catch {}
  }

  try {
    const response = await fetch('db.json');
    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
  } catch (err) {
    console.warn('Dùng dữ liệu fallback LOCAL_DB', err);
    if (typeof LOCAL_DB !== 'undefined') {
      return LOCAL_DB;
    }
    return { products: [], categories: [] };
  }
}

// ===== RENDER PRODUCTS =====
function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  const countEl   = document.getElementById('productCount');
  if (countEl) countEl.textContent = products.length;

  if (!container) return;
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `
      <div class="no-result">
        <h3>Không tìm thấy sản phẩm phù hợp</h3>
        <p style="color:var(--gray-400); margin: 8px 0 20px;">Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
        <button class="btn-primary" onclick="resetAllFilters()">Đặt lại bộ lọc</button>
      </div>`;
    return;
  }

  products.forEach(data => {
    const product = new Product(data);
    const sizesHtml = (product.sizes || []).slice(0, 6).map(s =>
      `<span class="size-chip" onclick="selectCardSize(event, ${s})">${s}</span>`
    ).join('');

    const badgeText = product.price > 4000000 ? 'Độc quyền' : (product.id <= 2 ? 'Mới ra mắt' : 'Bán chạy');

    const isFav = typeof wishlist !== 'undefined' && wishlist.has(product.id);

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-wrap" onclick="location.href='detail.html?id=${product.id}'" style="cursor:pointer" title="Bấm xem chi tiết">
        <img src="${product.image}"
             alt="${product.name}"
             loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'" />
        <span class="product-badge">${badgeText}</span>
        <button class="product-wishlist ${isFav ? 'active' : ''}" 
                data-product-id="${product.id}" 
                title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}" 
                style="${isFav ? 'color:#e11d48;' : ''}" 
                onclick="event.stopPropagation(); toggleWishlistProduct(${JSON.stringify(data).replace(/"/g, '&quot;')}, this)">
          ${isFav ? '♥' : '♡'}
        </button>
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

  if (typeof syncAllWishlistButtons === 'function') {
    syncAllWishlistButtons();
  }
}

// ===== THÊM VÀO GIỎ =====
function addProductToCart(productData) {
  cart.addToCart(productData);
  renderCart();
  showToast(`Đã thêm "${productData.name}" vào giỏ hàng!`);
}

// ===== WISHLIST TOGGLE =====
function toggleWishlist(productOrBtn, maybeBtnOrEvent) {
  if (productOrBtn && productOrBtn.id) {
    toggleWishlistProduct(productOrBtn, maybeBtnOrEvent);
  } else if (productOrBtn instanceof HTMLElement || (productOrBtn && productOrBtn.tagName)) {
    const btn = productOrBtn;
    const e = maybeBtnOrEvent;
    if (e && e.stopPropagation) e.stopPropagation();
    const pid = btn.getAttribute('data-product-id');
    if (pid && typeof manager !== 'undefined' && manager.products) {
      const prod = manager.products.find(p => Number(p.id) === Number(pid));
      if (prod) {
        toggleWishlistProduct(prod, btn);
        return;
      }
    }
    if (btn.textContent.trim() === '♡') {
      btn.textContent = '♥';
      btn.style.color = '#e11d48';
      showToast('Đã thêm vào mục Yêu thích!');
    } else {
      btn.textContent = '♡';
      btn.style.color = '';
      showToast('Đã xóa khỏi mục Yêu thích', 'error');
    }
  }
}
window.toggleWishlist = toggleWishlist;


function selectCardSize(e, size) {
  e.stopPropagation();
  showToast(`Đã chọn size ${size}`);
}

// ===== ÁP DỤNG BỘ LỌC =====
function applyFilter() {
  const result = manager.filterProducts(activeFilters);
  renderProducts(result);
}

// ===== RESET BỘ LỌC =====
function resetAllFilters() {
  activeFilters = {
    keyword: '',
    category: '',
    priceRange: '',
    size: null,
    sortType: 'newest'
  };

  const searchBox = document.getElementById('searchBox');
  if (searchBox) searchBox.value = '';

  const headerSearch = document.getElementById('headerSearchInput');
  if (headerSearch) headerSearch.value = '';

  const sortSelect = document.getElementById('sortBy');
  if (sortSelect) sortSelect.value = 'newest';

  // Reset category pills
  document.querySelectorAll('.filter-pill-cat').forEach(p => p.classList.remove('active'));
  document.getElementById('cat-filter-all')?.classList.add('active');

  // Reset price radios
  document.querySelectorAll('.filter-price-option').forEach(r => r.classList.remove('active'));
  document.getElementById('price-all')?.classList.add('active');

  // Reset size chips
  document.querySelectorAll('.filter-size-btn').forEach(b => b.classList.remove('active'));

  applyFilter();
}

// ===== RENDER CATEGORY PILLS Ở SIDEBAR =====
function renderCategoryPills(categories) {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  container.innerHTML = `
    <button class="filter-pill filter-pill-cat active" id="cat-filter-all" data-cat="">
      Tất cả thương hiệu
    </button>
  `;

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill filter-pill-cat';
    btn.dataset.cat = cat.name;
    btn.textContent = cat.name;
    container.appendChild(btn);
  });

  // Event listener
  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-pill-cat');
    if (!btn) return;

    document.querySelectorAll('.filter-pill-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilters.category = btn.dataset.cat || '';
    applyFilter();
  });
}

// ===== SETUP SIDEBAR FILTER EVENTS =====
function setupFilterEvents() {
  const searchBox = document.getElementById('searchBox');
  const headerSearch = document.getElementById('headerSearchInput');

  // Search input trong sidebar
  if (searchBox) {
    searchBox.addEventListener('input', e => {
      activeFilters.keyword = e.target.value;
      if (headerSearch) headerSearch.value = e.target.value;
      applyFilter();
    });
  }

  // Search input trên header menu
  if (headerSearch) {
    headerSearch.addEventListener('input', e => {
      activeFilters.keyword = e.target.value;
      if (searchBox) searchBox.value = e.target.value;
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

  // Sort dropdown
  const sortSelect = document.getElementById('sortBy');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      activeFilters.sortType = e.target.value;
      applyFilter();
    });
  }

  // Price ranges
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

  // Size filters
  const sizeContainer = document.getElementById('sizeFilters');
  if (sizeContainer) {
    sizeContainer.addEventListener('click', e => {
      const btn = e.target.closest('.filter-size-btn');
      if (!btn) return;

      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        activeFilters.size = null;
      } else {
        document.querySelectorAll('.filter-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilters.size = btn.dataset.size;
      }
      applyFilter();
    });
  }

  // Toggle filter sidebar
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

  // Reset button
  const resetBtn = document.getElementById('btnResetFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }
}

// ===== KHỞI CHẠY =====
async function init() {
  const data = await loadData();
  allProducts = data.products || [];
  manager = new ProductManager(allProducts);

  renderCategoryPills(data.categories || []);
  setupFilterEvents();
  renderProducts(allProducts);

  // Check URL query params (ví dụ ?brand=Nike hoặc ?q=air)
  const urlParams = new URLSearchParams(window.location.search);
  const brandParam = urlParams.get('brand');
  const qParam = urlParams.get('q');

  if (qParam) {
    activeFilters.keyword = qParam;
    const searchBox = document.getElementById('searchBox');
    const headerSearch = document.getElementById('headerSearchInput');
    if (searchBox) searchBox.value = qParam;
    if (headerSearch) headerSearch.value = qParam;
    applyFilter();
  }

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

init();
