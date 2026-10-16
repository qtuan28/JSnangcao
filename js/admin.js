// ============================================================
// admin.js – Trang quản trị (admin.html)
// CRUD sản phẩm & danh mục, dùng localStorage làm "database ảo"
// ============================================================

// ===== KIỂM TRA QUYỀN ADMIN =====
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
if (!currentUser || currentUser.role !== 'admin') {
  alert('Bạn không có quyền truy cập trang quản trị! Vui lòng đăng nhập với tài khoản Admin.');
  window.location.href = 'login.html';
  throw new Error('Chưa đăng nhập quyền Admin');
}

// Hiện tên admin
const adminWelcomeEl = document.getElementById('adminWelcome');
if (adminWelcomeEl && currentUser) {
  adminWelcomeEl.textContent = `Xin chào, ${currentUser.name}`;
}

// ===== CLASS USER / CUSTOMER (OOP - WEB2064) =====
class User {
  constructor(data) {
    this.id       = data.id;
    this.name     = data.name;
    this.email    = data.email;
    this.phone    = data.phone || 'Chưa cập nhật';
    this.password = data.password || '123456';
    this.role     = data.role || 'user';
  }

  getInfo() {
    return `${this.name} (${this.email}) - ${this.role}`;
  }
}

// ===== BIẾN TOÀN CỤC =====
let products   = [];  // danh sách sản phẩm
let categories = [];  // danh sách danh mục
let users      = [];  // danh sách tất cả tài khoản người dùng / khách hàng trong website

async function loadData() {
  let initialProducts = (typeof LOCAL_DB !== 'undefined' ? LOCAL_DB.products : []);
  let initialCategories = (typeof LOCAL_DB !== 'undefined' ? LOCAL_DB.categories : []);

  try {
    const response = await fetch('db.json');
    if (response.ok) {
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        initialProducts = data.products;
        initialCategories = data.categories;
      }
    }
  } catch (err) {
    console.warn('admin.js fetch error, using fallback', err);
  }

  const saved = localStorage.getItem('adminData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        products   = parsed.products;
        categories = (Array.isArray(parsed.categories) && parsed.categories.length > 0) ? parsed.categories : initialCategories;
      }
    } catch {}
  }


  if (products.length === 0) products = [...initialProducts];
  if (categories.length === 0) categories = [...initialCategories];

  // Tải danh sách tài khoản người dùng trong website từ localStorage
  const savedUsers = localStorage.getItem('users') || localStorage.getItem('adminCustomers');
  if (savedUsers) {
    try {
      const parsed = JSON.parse(savedUsers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        users = parsed.map(u => new User(u));
      }
    } catch (e) {
      console.warn('Lỗi đọc users:', e);
    }
  }

  if (users.length === 0) {
    const initialUsers = [
      { id: 1, name: "Admin SneakerZone", email: "admin@shoes.com", phone: "0909 123 456", password: "Admin@123", role: "admin" },
      { id: 2, name: "Nguyễn Văn A",      email: "user@shoes.com",  phone: "0912 345 678", password: "User@123",  role: "user" },
      { id: 3, name: "Trần Thị Bích",    email: "bichtran@gmail.com", phone: "0987 654 321", password: "User@123", role: "user" },
      { id: 4, name: "Lê Hoàng Long",    email: "longle@outlook.com", phone: "0933 888 999", password: "User@123", role: "user" },
      { id: 5, name: "Phạm Minh Đức",    email: "ducpham@gmail.com",  phone: "0966 777 555", password: "User@123", role: "user" }
    ];

    try {
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      registered.forEach(reg => {
        if (!initialUsers.some(u => u.email.toLowerCase() === reg.email.toLowerCase())) {
          initialUsers.push({
            id: reg.id || (initialUsers.length + 1),
            name: reg.name,
            email: reg.email,
            phone: reg.phone || 'Chưa cập nhật',
            password: reg.password,
            role: reg.role || 'user'
          });
        }
      });
    } catch {}

    users = initialUsers.map(u => new User(u));
  }

  saveData();  // lưu vào localStorage
}

// ===== LƯU DỮ LIỆU VÀO LOCALSTORAGE =====
function saveData() {
  localStorage.setItem('adminData', JSON.stringify({ products, categories }));
  localStorage.setItem('users', JSON.stringify(users));
}

// ===== FORMAT TIỀN =====
function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN') + '₫';
}

// ===== HIỆN TOAST (Tối đa 3 thông báo cùng lúc) =====
function dismissAdminToast(toast) {
  if (!toast || toast.classList.contains('toast-exit')) return;
  toast.classList.add('toast-exit');
  setTimeout(() => {
    toast.remove();
  }, 250);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const activeToasts = Array.from(container.querySelectorAll('.toast:not(.toast-exit)'));
  if (activeToasts.length >= 3) {
    const excess = activeToasts.length - 2;
    for (let i = 0; i < excess; i++) {
      dismissAdminToast(activeToasts[i]);
    }
  }

  const allToasts = container.querySelectorAll('.toast');
  if (allToasts.length > 5) {
    for (let i = 0; i < allToasts.length - 3; i++) {
      allToasts[i].remove();
    }
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = message;
  toast.title = 'Nhấn để đóng';
  toast.addEventListener('click', () => dismissAdminToast(toast));

  container.appendChild(toast);
  setTimeout(() => dismissAdminToast(toast), 3000);
}

// ============================================================
// ĐIỀU HƯỚNG TAB
// ============================================================
function showTab(tabName) {
  // Ẩn tất cả tab
  document.getElementById('tabDashboard').style.display  = 'none';
  document.getElementById('tabProducts').style.display   = 'none';
  document.getElementById('tabCategories').style.display = 'none';
  document.getElementById('tabCustomers').style.display  = 'none';

  // Cập nhật class active cho menu bên trái
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

  // Hiện tab được chọn
  const tabEl = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (tabEl) tabEl.style.display = 'block';

  const navEl = document.getElementById('nav' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (navEl) navEl.classList.add('active');
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  // Stats cards
  const statsGrid = document.getElementById('statsGrid');
  statsGrid.innerHTML = `
    <div class="stat-card" style="cursor:pointer;" onclick="showTab('products')">
      <div class="stat-icon">SP</div>
      <div class="stat-info">
        <div class="stat-value">${products.length}</div>
        <div class="stat-label">Tổng sản phẩm</div>
      </div>
    </div>
    <div class="stat-card" style="cursor:pointer;" onclick="showTab('categories')">
      <div class="stat-icon">DM</div>
      <div class="stat-info">
        <div class="stat-value">${categories.length}</div>
        <div class="stat-label">Danh mục</div>
      </div>
    </div>
    <div class="stat-card" style="cursor:pointer;" onclick="showTab('customers')">
      <div class="stat-icon">KH</div>
      <div class="stat-info">
        <div class="stat-value">${users.length}</div>
        <div class="stat-label">Tài khoản KH</div>
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
        <div class="stat-value stat-value-money" title="${formatPrice(products.reduce((s, p) => s + p.price * p.stock, 0))}">${formatPrice(products.reduce((s, p) => s + p.price * p.stock, 0))}</div>
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
  let image         = document.getElementById('productImage').value.trim();
  const description = document.getElementById('productDescription').value.trim();

  // Cho phép stock = 0 (hết hàng), chỉ từ chối khi giá <= 0 hoặc stock < 0 hoặc NaN
  if (!name || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
    showToast('Vui lòng điền đúng thông tin (giá > 0 và tồn kho >= 0)!', 'error');
    return;
  }

  if (!image) {
    image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
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
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  const count = products.filter(p => p.category === cat.name).length;
  if (count > 0) {
    if (!confirm(`Danh mục "${cat.name}" đang có ${count} sản phẩm. Bạn có chắc chắn muốn xóa danh mục này?`)) return;
  } else {
    if (!confirm(`Bạn chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;
  }
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
    if (index !== -1) {
      const oldName = categories[index].name;
      categories[index] = { ...categories[index], name, icon };
      // Đồng bộ tên danh mục mới cho các sản phẩm đang thuộc danh mục này
      products.forEach(p => {
        if (p.category === oldName) {
          p.category = name;
        }
      });
    }
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
// QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG (CÁC TÀI KHOẢN TRONG WEBSITE)
// ============================================================
function renderCustomersTable(list = users) {
  const tbody = document.getElementById('customersTable');
  const countLabel = document.getElementById('customerCountLabel');
  if (countLabel) countLabel.textContent = `Tổng: ${list.length} tài khoản`;
  if (!tbody) return;

  tbody.innerHTML = '';
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 28px; color: var(--gray-600);">Không tìm thấy tài khoản nào</td></tr>';
    return;
  }

  list.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#TK${String(u.id).padStart(3, '0')}</strong></td>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td>${u.phone || 'Chưa cập nhật'}</td>
      <td>
        <span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}">
          ${u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
        </span>
      </td>
      <td>
        <button class="btn-edit" onclick="editCustomer(${u.id})">Sửa</button>
        <button class="btn-delete" onclick="deleteCustomer(${u.id})" style="margin-left:6px">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Mở modal THÊM tài khoản người dùng mới
function openAddCustomerModal() {
  document.getElementById('customerModalTitle').textContent = 'Thêm tài khoản người dùng';
  document.getElementById('customerId').value       = '';
  document.getElementById('customerName').value     = '';
  document.getElementById('customerEmail').value    = '';
  document.getElementById('customerPhone').value    = '';
  document.getElementById('customerRole').value     = 'user';
  document.getElementById('customerPassword').value = '';
  document.getElementById('customerPassword').required = true;
  document.getElementById('customerPasswordLabel').textContent = 'Mật khẩu đăng nhập *';
  openModal('customerModal');
}

// Mở modal SỬA tài khoản người dùng
function editCustomer(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;

  document.getElementById('customerModalTitle').textContent = 'Sửa tài khoản người dùng';
  document.getElementById('customerId').value       = user.id;
  document.getElementById('customerName').value     = user.name;
  document.getElementById('customerEmail').value    = user.email;
  document.getElementById('customerPhone').value    = user.phone || '';
  document.getElementById('customerRole').value     = user.role || 'user';
  document.getElementById('customerPassword').value = user.password || '';
  document.getElementById('customerPassword').required = false;
  document.getElementById('customerPasswordLabel').textContent = 'Mật khẩu mới (để trống nếu giữ nguyên)';
  openModal('customerModal');
}

// Xóa tài khoản người dùng
function deleteCustomer(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;

  if (currentUser && user.id === currentUser.id) {
    showToast('Không thể xóa tài khoản Admin đang đăng nhập!', 'error');
    return;
  }

  if (!confirm(`Bạn chắc chắn muốn xóa tài khoản "${user.name}" (${user.email})?`)) return;

  users = users.filter(u => u.id !== id);
  saveData();
  renderCustomersTable();
  renderDashboard();
  showToast('Đã xóa tài khoản thành công!');
}

// XỬ LÝ SUBMIT FORM TÀI KHOẢN (Thêm / Sửa)
document.getElementById('customerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const id       = document.getElementById('customerId').value;
  const name     = document.getElementById('customerName').value.trim();
  const email    = document.getElementById('customerEmail').value.trim();
  const phone    = document.getElementById('customerPhone').value.trim();
  const role     = document.getElementById('customerRole').value;
  const password = document.getElementById('customerPassword').value.trim();

  if (!name || !email) {
    showToast('Vui lòng điền họ tên và email!', 'error');
    return;
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Email không đúng định dạng! Vui lòng kiểm tra lại.', 'error');
    return;
  }

  if (id) {
    // === SỬA TÀI KHOẢN ===
    const index = users.findIndex(u => u.id === Number(id));
    if (index !== -1) {
      // Kiểm tra trùng email với tài khoản khác
      const emailExists = users.some(u => u.id !== Number(id) && u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        showToast('Email này đã được dùng bởi tài khoản khác!', 'error');
        return;
      }
      users[index].name  = name;
      users[index].email = email;
      users[index].phone = phone;
      users[index].role  = role;
      if (password) users[index].password = password;
    }
    showToast('Cập nhật tài khoản thành công!');
  } else {
    // === THÊM TÀI KHOẢN MỚI ===
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      showToast('Email này đã tồn tại trong hệ thống!', 'error');
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = new User({
      id: newId,
      name,
      email,
      phone,
      role,
      password: password || '123456'
    });
    users.push(newUser);
    showToast('Thêm tài khoản thành công! Có thể dùng đăng nhập ngay.');
  }

  saveData();
  closeModal('customerModal');
  renderCustomersTable();
  renderDashboard();
});

// TÌM KIẾM TÀI KHOẢN trong bảng admin
document.getElementById('searchCustomers').addEventListener('input', function () {
  const keyword = this.value.toLowerCase().trim();
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(keyword) ||
    u.email.toLowerCase().includes(keyword) ||
    (u.phone && u.phone.includes(keyword))
  );
  renderCustomersTable(filtered);
});

// ============================================================
// ĐĂNG XUẤT ADMIN
// ============================================================
function logout() {
  localStorage.removeItem('currentUser');
  showToast('Đã đăng xuất thành công!');
  setTimeout(() => { window.location.href = 'login.html'; }, 500);
}

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
// GẮN CÁC HÀM TOÀN CỤC RA WINDOW CHO SỰ KIỆN HTML ONCLICK
// ============================================================
window.showTab               = showTab;
window.renderDashboard       = renderDashboard;
window.renderProductsTable   = renderProductsTable;
window.renderCategoriesTable = renderCategoriesTable;
window.renderCustomersTable  = renderCustomersTable;
window.openAddProductModal   = openAddProductModal;
window.editProduct           = editProduct;
window.deleteProduct         = deleteProduct;
window.openAddCategoryModal  = openAddCategoryModal;
window.editCategory          = editCategory;
window.deleteCategory        = deleteCategory;
window.openAddCustomerModal  = openAddCustomerModal;
window.editCustomer          = editCustomer;
window.deleteCustomer        = deleteCustomer;
window.openModal             = openModal;
window.closeModal            = closeModal;
window.logout                = logout;

// ============================================================
// GẮN SỰ KIỆN NÚT
// ============================================================
document.getElementById('btnAddProduct').addEventListener('click', openAddProductModal);
document.getElementById('btnAddCategory').addEventListener('click', openAddCategoryModal);
document.getElementById('btnAddCustomer').addEventListener('click', openAddCustomerModal);

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
  renderCustomersTable();
}

init();

