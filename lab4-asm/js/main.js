// ============================================================
// main.js – Trang chủ (index.html)
// Dùng async/await + fetch để đọc db.json
// ============================================================

// ===== CLASS PRODUCT (OOP) =====
class Product {
  constructor(data) {
    this.id          = data.id;
    this.name        = data.name;
    this.category    = data.category;
    this.price       = data.price;
    this.stock       = data.stock;
    this.image       = data.image;
    this.description = data.description;
  }

  // Trả về thông tin sản phẩm dạng chuỗi
  getInfo() {
    return `${this.name} - ${formatPrice(this.price)}`;
  }
}

// ===== ĐỌC DỮ LIỆU TỪ db.json =====
async function loadData() {
  const response = await fetch('db.json');
  const data = await response.json();
  return data;
}

// ===== RENDER CATEGORIES =====
function renderCategories(categories) {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  container.innerHTML = '';

  // Thêm nút "Tất cả"
  const allCard = document.createElement('div');
  allCard.className = 'category-card active';
  allCard.id = 'cat-all';
  allCard.innerHTML = `<div class="category-name">Tất cả</div>`;
  allCard.addEventListener('click', () => filterByCategory(''));
  container.appendChild(allCard);

  // Render từng danh mục
  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.id = `cat-${cat.id}`;
    card.innerHTML = `
      <div class="category-name">${cat.name}</div>`;
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
    container.innerHTML = `<p style="color:var(--text-muted); text-align:center; grid-column:1/-1; padding:40px;">Không có sản phẩm nào.</p>`;
    return;
  }

  products.forEach(data => {
    const product = new Product(data);

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}"
             alt="${product.name}"
             onerror="this.src='https://via.placeholder.com/400x220/1E1E32/6C63FF?text=Shoe'" />
        <span class="product-badge">${product.category}</span>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.description}</div>
        <div class="product-footer">
          <div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-stock">Còn ${product.stock} đôi</div>
          </div>
          <button class="btn-add-cart" onclick="addProductToCart(${JSON.stringify(data).replace(/"/g, '&quot;')})">
            Thêm
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

// ===== LỌC THEO DANH MỤC =====
let allProducts = [];

function filterByCategory(categoryName) {
  // Bỏ active ở tất cả các card
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));

  // Thêm active vào card được chọn
  if (categoryName === '') {
    document.getElementById('cat-all')?.classList.add('active');
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category === categoryName);
    renderProducts(filtered);
    // Tìm category card tương ứng để active
    document.querySelectorAll('.category-card').forEach(c => {
      if (c.querySelector('.category-name')?.textContent === categoryName) {
        c.classList.add('active');
      }
    });
  }
}

// ===== KHỞI CHẠY =====
async function init() {
  const data = await loadData();
  allProducts = data.products;

  // Chỉ render 4 sản phẩm đầu làm "nổi bật"
  renderCategories(data.categories);
  renderProducts(allProducts.slice(0, 4), 'featuredProductsContainer');
}

init();
