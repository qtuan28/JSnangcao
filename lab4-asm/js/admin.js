// ============================================================
// admin.js – Trang quản trị (admin.html)
// CRUD sản phẩm & danh mục, dùng localStorage làm "database ảo"
// ============================================================

// ===== KIỂM TRA QUYỀN ADMIN =====
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'admin') {
  alert('Ban khong co quyen truy cap trang nay!');
  window.location.href = 'login.html';
}

// Hiện tên admin
document.getElementById('adminWelcome').textContent = `Xin chào, ${currentUser.name}`;

// ===== BIẾN TOÀN CỤC =====
let products   = [];  // danh sách sản phẩm
let categories = [];  // danh sách danh mục

// ===== ĐỌC DỮ LIỆU BAN ĐẦU TỪ db.json =====
// Nếu đã có trong localStorage thì dùng localStorage (vì user có thể đã CRUD)
async function loadData() {
  const saved = localStorage.getItem('adminData');
  if (saved) {
    const parsed = JSON.parse(saved);
    products   = parsed.products;
    categories = parsed.categories;
  } else {
    const response = await fetch('db.json');
    const data = await response.json();
    products   = data.products;
    categories = data.categories;
    saveData();  // lưu vào localStorage lần đầu
  }
}

// ===== LƯU DỮ LIỆU VÀO LOCALSTORAGE =====
function saveData() {
  localStorage.setItem('adminData', JSON.stringify({ products, categories }));
}

// ===== FORMAT TIỀN =====
function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN') + '₫';
}

// ===== HIỆN TOAST =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// ĐIỀU HƯỚNG TAB
// ============================================================
function showTab(tabName) {
  // Ẩn tất cả tab
  document.getElementById('tabDashboard').style.display = 'none';
  document.getElementById('tabProducts').style.display  = 'none';
  document.getElementById('tabCategories').style.display = 'none';

  // Hiện tab được chọn
  document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).style.display = 'block';
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  // Stats cards
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">SP</div>
      <div class="stat-info">
        <div class="stat-value">${products.length}</div>
        <div class="stat-label">Tổng sản phẩm</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">DM</div>
      <div class="stat-info">
        <div class="stat-value">${categories.length}</div>
        <div class="stat-label">Danh mục</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">KHO</div>
      <div class="stat-info">
        <div class="stat-value">${products.reduce((s, p) => s + p.stock, 0)}</div>
        <div class="stat-label">Tổng tồn kho</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">VND</div>
      <div class="stat-info">
        <div class="stat-value">${formatPrice(products.reduce((s, p) => s + p.price * p.stock, 0))}</div>
        <div class="stat-label">Giá trị tồn kho</div>
      </div>
    </div>`;

  // Bảng sản phẩm tóm tắt (hiện 5 sản phẩm đầu)
  const tbody = document.getElementById('dashboardProductsTable');
  tbody.innerHTML = '';
  products.slice(0, 5).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img class="td-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/50/1E1E32/6C63FF?text=Shoe'" /></td>
      <td>${p.name}</td>
      <td><span class="badge badge-primary">${p.category}</span></td>
      <td>${formatPrice(p.price)}</td>
      <td>
        <span class="badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}">
          ${p.stock} đôi
        </span>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ============================================================
// QUẢN LÝ SẢN PHẨM
// ============================================================
function renderProductsTable(list = products) {
  const tbody = document.getElementById('productsTable');
  tbody.innerHTML = '';

  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img class="td-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/50/1E1E32/6C63FF?text=Shoe'" /></td>
      <td>${p.name}</td>
      <td><span class="badge badge-primary">${p.category}</span></td>
      <td>${formatPrice(p.price)}</td>
      <td>
        <span class="badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}">
          ${p.stock} đôi
        </span>
      </td>
      <td>
        <button class="btn-edit" onclick="editProduct(${p.id})">Sửa</button>
        <button class="btn-delete" onclick="deleteProduct(${p.id})" style="margin-left:6px">Xóa</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// Điền options danh mục vào dropdown trong modal sản phẩm
function renderCategoryOptions() {
  const select = document.getElementById('productCategory');
  select.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

// Mở modal THÊM sản phẩm
function openAddProductModal() {
  document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm';
  document.getElementById('productId').value    = '';
  document.getElementById('productName').value  = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productImage').value = '';
  document.getElementById('productDescription').value = '';
  renderCategoryOptions();
  openModal('productModal');
}

// Mở modal SỬA sản phẩm
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById('productModalTitle').textContent = 'Sửa sản phẩm';
  document.getElementById('productId').value    = product.id;
  document.getElementById('productName').value  = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productImage').value = product.image;
  document.getElementById('productDescription').value = product.description;
  renderCategoryOptions();
  document.getElementById('productCategory').value = product.category;
  openModal('productModal');
}

// XÓA sản phẩm
function deleteProduct(id) {
  if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
  products = products.filter(p => p.id !== id);
  saveData();
  renderProductsTable();
  renderDashboard();
  showToast('Đã xóa sản phẩm!', 'error');
}

// XỬ LÝ SUBMIT FORM SẢN PHẨM (Thêm / Sửa)
document.getElementById('productForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const id          = document.getElementById('productId').value;
  const name        = document.getElementById('productName').value.trim();
  const category    = document.getElementById('productCategory').value;
  const price       = Number(document.getElementById('productPrice').value);
  const stock       = Number(document.getElementById('productStock').value);
  const image       = document.getElementById('productImage').value.trim();
  const description = document.getElementById('productDescription').value.trim();

  if (!name || !price || !stock) {
    showToast('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }

  if (id) {
    // === SỬA ===
    const index = products.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      products[index] = { ...products[index], name, category, price, stock, image, description };
    }
    showToast('Cập nhật sản phẩm thành công!');
  } else {
    // === THÊM MỚI ===
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const catObj = categories.find(c => c.name === category);
    products.push({
      id: newId, name, category,
      categoryId: catObj ? catObj.id : 1,
      price, stock, image,
      description,
      sizes: [38, 39, 40, 41, 42]
    });
    showToast('Thêm sản phẩm thành công!');
  }

  saveData();
  closeModal('productModal');
  renderProductsTable();
  renderDashboard();
});

// TÌM KIẾM SẢN PHẨM trong bảng admin
document.getElementById('searchProducts').addEventListener('input', function () {
  const keyword = this.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
  renderProductsTable(filtered);
});

// ============================================================
// QUẢN LÝ DANH MỤC
// ============================================================
function renderCategoriesTable() {
  const tbody = document.getElementById('categoriesTable');
  tbody.innerHTML = '';
  categories.forEach(cat => {
    // Đếm số sản phẩm thuộc danh mục này
    const count = products.filter(p => p.category === cat.name).length;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cat.name}</td>
      <td><span class="badge badge-primary">${count} sản phẩm</span></td>
      <td>
        <button class="btn-edit" onclick="editCategory(${cat.id})">Sửa</button>
        <button class="btn-delete" onclick="deleteCategory(${cat.id})" style="margin-left:6px">Xóa</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// Mở modal THÊM danh mục
function openAddCategoryModal() {
  document.getElementById('categoryModalTitle').textContent = 'Thêm danh mục';
  document.getElementById('categoryId').value   = '';
  document.getElementById('categoryName').value = '';
  document.getElementById('categoryIcon').value = '';
  openModal('categoryModal');
}

// Mở modal SỬA danh mục
function editCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  document.getElementById('categoryModalTitle').textContent = 'Sửa danh mục';
  document.getElementById('categoryId').value   = cat.id;
  document.getElementById('categoryName').value = cat.name;
  document.getElementById('categoryIcon').value = cat.icon;
  openModal('categoryModal');
}

// XÓA danh mục
function deleteCategory(id) {
  if (!confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;
  categories = categories.filter(c => c.id !== id);
  saveData();
  renderCategoriesTable();
  renderDashboard();
  showToast('Đã xóa danh mục!', 'error');
}

// XỬ LÝ SUBMIT FORM DANH MỤC
document.getElementById('categoryForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const id   = document.getElementById('categoryId').value;
  const name = document.getElementById('categoryName').value.trim();
  const icon = document.getElementById('categoryIcon').value.trim() || '';

  if (!name) {
    showToast('Vui lòng nhập tên danh mục!', 'error');
    return;
  }

  if (id) {
    // === SỬA ===
    const index = categories.findIndex(c => c.id === Number(id));
    if (index !== -1) categories[index] = { ...categories[index], name, icon };
    showToast('Cập nhật danh mục thành công!');
  } else {
    // === THÊM MỚI ===
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    categories.push({ id: newId, name, icon });
    showToast('Thêm danh mục thành công!');
  }

  saveData();
  closeModal('categoryModal');
  renderCategoriesTable();
  renderDashboard();
});

// ============================================================
// HELPER MỞ / ĐÓNG MODAL
// ============================================================
function openModal(modalId) {
  document.getElementById(modalId).classList.add('open');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

// ============================================================
// GẮN SỰ KIỆN NÚT
// ============================================================
document.getElementById('btnAddProduct').addEventListener('click', openAddProductModal);
document.getElementById('btnAddCategory').addEventListener('click', openAddCategoryModal);

// Click ngoài modal để đóng
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function (e) {
    if (e.target === this) {
      this.classList.remove('open');
    }
  });
});

// ============================================================
// KHỞI CHẠY
// ============================================================
async function init() {
  await loadData();
  renderDashboard();
  renderProductsTable();
  renderCategoriesTable();
}

init();
