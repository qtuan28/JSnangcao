// ============================================================
// products.js – Trang danh sách sản phẩm (products.html)
// Có tìm kiếm, lọc danh mục, sắp xếp
// ============================================================

// ===== CLASS PRODUCT =====
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
}

// ===== CLASS PRODUCTMANAGER (quản lý danh sách sản phẩm) =====
class ProductManager {
  constructor(products) {
    this.products = products;
  }

  // Tìm kiếm theo tên (static method)
  static findByName(products, keyword) {
    return products.filter(p =>
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Lọc theo danh mục
  filterByCategory(category) {
    if (!category) return this.products;
    return this.products.filter(p => p.category === category);
  }

  // Sắp xếp
  sortProducts(products, sortType) {
    const list = [...products]; // copy để không làm thay đổi mảng gốc
    if (sortType === 'price-asc') {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price-desc') {
      return list.sort((a, b) => b.price - a.price);
    } else if (sortType === 'name-asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }
}

// ===== BIẾN TOÀN CỤC =====
let allProducts = [];
let manager;

// ===== ĐỌC DỮ LIỆU TỪ db.json =====
async function loadData() {
  const response = await fetch('db.json');
  const data = await response.json();
  return data;
}

// ===== RENDER PRODUCTS =====
function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `<div class="no-result">😕 Không tìm thấy sản phẩm nào.</div>`;
    return;
  }

  products.forEach(data => {
    const product = new Product(data);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}"
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

// ===== THÊM VÀO GIỎ =====
function addProductToCart(productData) {
  cart.addToCart(productData);
  renderCart();
  showToast(`Đã thêm "${productData.name}" vào giỏ hàng!`);
}

// ===== LỌC SẢN PHẨM (gọi khi search / filter / sort thay đổi) =====
function applyFilter() {
  const keyword  = document.getElementById('searchBox').value;
  const category = document.getElementById('filterCategory').value;
  const sortType = document.getElementById('sortBy').value;

  // Bước 1: Lọc theo danh mục
  let result = manager.filterByCategory(category);

  // Bước 2: Tìm kiếm theo tên
  result = ProductManager.findByName(result, keyword);

  // Bước 3: Sắp xếp
  result = manager.sortProducts(result, sortType);

  // Render kết quả
  renderProducts(result);
}

// ===== RENDER DROPDOWN DANH MỤC =====
function renderCategoryOptions(categories) {
  const select = document.getElementById('filterCategory');
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.name;
    option.textContent = `${cat.icon} ${cat.name}`;
    select.appendChild(option);
  });
}

// ===== KHỞI CHẠY =====
async function init() {
  const data = await loadData();
  allProducts = data.products;
  manager = new ProductManager(allProducts);

  renderCategoryOptions(data.categories);
  renderProducts(allProducts);

  // Lắng nghe sự kiện filter
  document.getElementById('searchBox').addEventListener('input', applyFilter);
  document.getElementById('filterCategory').addEventListener('change', applyFilter);
  document.getElementById('sortBy').addEventListener('change', applyFilter);
}

init();
