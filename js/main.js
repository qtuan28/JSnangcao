// ============================================================
// main.js – Trang chủ (index.html)
// Phong cách Nike: Dùng async/await + fetch (fallback LOCAL_DB)
// ============================================================

// ===== CLASS PRODUCT (OOP) =====
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

  // Trả về thông tin sản phẩm dạng chuỗi
  getInfo() {
    return `${this.name} - ${formatPrice(this.price)}`;
  }
}

// ===== ĐỌC DỮ LIỆU TỪ db.json (fallback LOCAL_DB nếu fetch lỗi) =====
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
    if (!response.ok) throw new Error('fetch failed');
    return await response.json();
  } catch (err) {
    console.warn('Dùng dữ liệu fallback LOCAL_DB', err);
    if (typeof LOCAL_DB !== 'undefined') {
      return LOCAL_DB;
    }
    return { products: [], categories: [] };
  }
}

// ===== RENDER CATEGORIES =====
function renderCategories(categories) {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  container.innerHTML = '';

  // Nút "Tất cả"
  const allCard = document.createElement('div');
  allCard.className = 'category-pill active';
  allCard.id = 'cat-all';
  allCard.innerHTML = `<span class="category-name">Tất cả sản phẩm</span>`;
  allCard.addEventListener('click', () => filterByCategory(''));
  container.appendChild(allCard);

  // Render từng danh mục
  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-pill';
    card.id = `cat-${cat.id}`;
    card.innerHTML = `<span class="category-name">${cat.name}</span>`;
    card.addEventListener('click', () => filterByCategory(cat.name));
    container.appendChild(card);
  });
}

// ===== RENDER PRODUCTS =====
function renderProducts(products, containerId = 'featuredProductsContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--gray-400);">
        <p style="font-size: 1.1rem; font-weight: 600;">Không có sản phẩm nào trong danh mục này.</p>
        <button class="btn-primary" style="margin-top: 16px;" onclick="filterByCategory('')">Xem tất cả</button>
      </div>`;
    return;
  }

  products.forEach(data => {
    const product = new Product(data);

    // Build size chips html
    const sizesHtml = (product.sizes || []).slice(0, 6).map(s =>
      `<span class="size-chip" onclick="selectCardSize(event, ${s})">${s}</span>`
    ).join('');

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
        <button class="product-wishlist" title="Yêu thích" onclick="toggleWishlist(this, event)">♡</button>
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

// ===== THÊM VÀO GIỎ HÀNG =====
function addProductToCart(productData) {
  cart.addToCart(productData);
  renderCart();
  showToast(`Đã thêm "${productData.name}" vào giỏ hàng!`);
}

// ===== WISHLIST =====
function toggleWishlist(btn, e) {
  e.stopPropagation();
  if (btn.textContent === '♡') {
    btn.textContent = '♥';
    btn.style.color = '#e11d48';
    showToast('Đã thêm vào mục Yêu thích!');
  } else {
    btn.textContent = '♡';
    btn.style.color = '';
    showToast('Đã xóa khỏi mục Yêu thích', 'error');
  }
}

function selectCardSize(e, size) {
  e.stopPropagation();
  showToast(`Đã chọn size ${size}`);
}

// ===== LỌC THEO DANH MỤC =====
let allProducts = [];

function filterByCategory(categoryName) {
  // Bỏ active ở tất cả các pill
  document.querySelectorAll('.category-pill').forEach(c => c.classList.remove('active'));

  if (categoryName === '') {
    document.getElementById('cat-all')?.classList.add('active');
    renderProducts(allProducts, 'featuredProductsContainer');
  } else {
    const filtered = allProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    renderProducts(filtered, 'featuredProductsContainer');
    document.querySelectorAll('.category-pill').forEach(c => {
      if (c.querySelector('.category-name')?.textContent.toLowerCase() === categoryName.toLowerCase()) {
        c.classList.add('active');
      }
    });
  }
}

// ===== HEADER SEARCH HANDLING =====
function setupHeaderSearch() {
  const searchInput = document.getElementById('headerSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `products.html?q=${encodeURIComponent(q)}`;
      }
    }
  });
}

// ===== KHỞI CHẠY =====
async function init() {
  const data = await loadData();
  allProducts = data.products || [];

  renderCategories(data.categories || []);
  renderProducts(allProducts, 'featuredProductsContainer');
  setupHeaderSearch();
}

init();
