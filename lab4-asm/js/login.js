// ============================================================
// login.js – Trang đăng nhập (login.html)
// Dùng fetch + async/await đọc db.json để kiểm tra tài khoản
// ============================================================

// ===== CLASS USER (OOP) =====
class User {
  constructor(data) {
    this._email = data.email;   // pseudo-private
    this.name   = data.name;
    this.role   = data.role;
    this.id     = data.id;
  }

  getEmail() {
    return this._email;
  }
}

// Class AdminUser kế thừa User
class AdminUser extends User {
  constructor(data) {
    super(data);
  }

  // Quyền admin
  getRole() {
    return 'admin';
  }
}

// ===== KIỂM TRA ĐỊNH DẠNG EMAIL (Regex) =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== KIỂM TRA MẬT KHẨU =====
function isValidPassword(password) {
  return password.length >= 6;
}

// ===== HIỆN / ẨN LỖI =====
function showError(elementId, message = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.classList.add('show');
  } else {
    el.classList.remove('show');
  }
}

// ===== ĐỌC DỮ LIỆU USERS TỪ db.json =====
async function getUsers() {
  const response = await fetch('db.json');
  const data = await response.json();
  return data.users;
}

// ===== XỬ LÝ SUBMIT FORM =====
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Reset lỗi cũ
  showError('emailError');
  showError('passwordError');
  showError('loginError');

  // Validate email
  let hasError = false;
  if (!isValidEmail(email)) {
    showError('emailError', 'Email không hợp lệ! Vui lòng nhập đúng định dạng.');
    hasError = true;
  }

  // Validate password
  if (!isValidPassword(password)) {
    showError('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự!');
    hasError = true;
  }

  if (hasError) return;

  // Đọc danh sách users từ db.json
  const users = await getUsers();

  // Tìm user khớp email + password
  const foundUser = users.find(u => u.email === email && u.password === password);

  if (!foundUser) {
    showError('loginError', 'Email hoặc mật khẩu không đúng!');
    return;
  }

  // Tạo object user theo role
  let userObj;
  if (foundUser.role === 'admin') {
    userObj = new AdminUser(foundUser);
  } else {
    userObj = new User(foundUser);
  }

  // Lưu user vào localStorage
  localStorage.setItem('currentUser', JSON.stringify(foundUser));

  // Chuyển hướng theo role
  if (foundUser.role === 'admin') {
    alert(`Chào mừng Admin ${foundUser.name}! Đang chuyển đến trang quản trị...`);
    window.location.href = 'admin.html';
  } else {
    alert(`Đăng nhập thành công! Chào ${foundUser.name}!`);
    window.location.href = 'index.html';
  }
});
