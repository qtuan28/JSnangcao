// ============================================================
// login.js – Trang đăng nhập & đăng ký (login.html)
// Hỗ trợ OOP User, kiểm tra validation, lưu tài khoản vào localStorage
// ============================================================

// ===== CLASS USER (OOP) =====
class User {
  constructor(data) {
    this.id    = data.id;
    this.name  = data.name;
    this.email = data.email;
    this.role  = data.role || 'user';
  }

  getInfo() {
    return `${this.name} (${this.email}) - ${this.role}`;
  }
}

// Class AdminUser kế thừa từ User (Kế thừa OOP)
class AdminUser extends User {
  constructor(data) {
    super(data);
    this.role = 'admin';
  }
}

// ===== VALIDATION HELPERS =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  return password && password.length >= 6;
}

function isValidName(name) {
  return name && name.trim().length >= 2;
}

// ===== HIỆN / ẨN LỖI =====
function showError(elementId, message = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.classList.add('show');
  } else {
    el.textContent = '';
    el.classList.remove('show');
  }
}

// ===== LẤY DANH SÁCH USERS TỪ LOCALSTORAGE / DB =====
async function getAllUsers() {
  const saved = localStorage.getItem('users');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  // Khởi tạo từ db.json hoặc LOCAL_DB nếu chưa có trong localStorage
  try {
    const res = await fetch('db.json');
    if (res.ok) {
      const data = await res.json();
      if (data.users && data.users.length > 0) {
        localStorage.setItem('users', JSON.stringify(data.users));
        return data.users;
      }
    }
  } catch (err) {
    console.warn('login.js fallback to LOCAL_DB', err);
  }

  const initial = (typeof LOCAL_DB !== 'undefined' && LOCAL_DB.users) ? LOCAL_DB.users : [
    { id: 1, name: "Admin SneakerZone", email: "admin@shoes.com", phone: "0909 123 456", password: "Admin@123", role: "admin" },
    { id: 2, name: "Nguyễn Văn A",      email: "user@shoes.com",  phone: "0912 345 678", password: "User@123",  role: "user" },
    { id: 3, name: "Trần Thị Bích",    email: "bichtran@gmail.com", phone: "0987 654 321", password: "User@123", role: "user" },
    { id: 4, name: "Lê Hoàng Long",    email: "longle@outlook.com", phone: "0933 888 999", password: "User@123", role: "user" },
    { id: 5, name: "Phạm Minh Đức",    email: "ducpham@gmail.com",  phone: "0966 777 555", password: "User@123", role: "user" }
  ];
  localStorage.setItem('users', JSON.stringify(initial));
  return initial;
}

// ===== CHUYỂN TAB ĐĂNG NHẬP / ĐĂNG KÝ =====
function switchAuthTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLoginBtn  = document.getElementById('tabLoginBtn');
  const tabRegBtn    = document.getElementById('tabRegisterBtn');
  const subtitle     = document.getElementById('authSubtitle');

  // Reset toàn bộ thông báo lỗi
  ['emailError', 'passwordError', 'loginError', 'regNameError', 'regEmailError', 'regPasswordError', 'regConfirmPasswordError', 'regError'].forEach(id => {
    showError(id);
  });

  if (tab === 'register') {
    loginForm.style.display    = 'none';
    registerForm.style.display = 'block';
    tabLoginBtn.classList.remove('active');
    tabRegBtn.classList.add('active');
    if (subtitle) subtitle.textContent = 'Đăng ký thành viên SneakerZone mới';
  } else {
    loginForm.style.display    = 'block';
    registerForm.style.display = 'none';
    tabRegBtn.classList.remove('active');
    tabLoginBtn.classList.add('active');
    if (subtitle) subtitle.textContent = 'Đăng nhập để tiếp tục mua sắm';
  }
}

// ===== XỬ LÝ SUBMIT ĐĂNG NHẬP =====
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  showError('emailError');
  showError('passwordError');
  showError('loginError');

  let hasError = false;
  if (!isValidEmail(email)) {
    showError('emailError', 'Email không hợp lệ! Vui lòng nhập đúng định dạng.');
    hasError = true;
  }

  if (!isValidPassword(password)) {
    showError('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự!');
    hasError = true;
  }

  if (hasError) return;

  const users = await getAllUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!foundUser) {
    showError('loginError', 'Email hoặc mật khẩu không chính xác!');
    return;
  }

  // Khởi tạo đối tượng OOP
  const userObj = foundUser.role === 'admin' ? new AdminUser(foundUser) : new User(foundUser);

  // Lưu thông tin phiên đăng nhập
  localStorage.setItem('currentUser', JSON.stringify({
    id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    role: userObj.role
  }));

  if (userObj.role === 'admin') {
    alert(`Chào mừng Quản trị viên ${userObj.name}! Đang chuyển hướng đến trang Admin...`);
    window.location.href = 'admin.html';
  } else {
    alert(`Đăng nhập thành công! Chào ${userObj.name}!`);
    window.location.href = 'index.html';
  }
});

// ===== XỬ LÝ SUBMIT ĐĂNG KÝ =====
document.getElementById('registerForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name            = document.getElementById('regName').value.trim();
  const email           = document.getElementById('regEmail').value.trim();
  const password        = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  showError('regNameError');
  showError('regEmailError');
  showError('regPasswordError');
  showError('regConfirmPasswordError');
  showError('regError');

  let hasError = false;

  // Validate họ tên
  if (!isValidName(name)) {
    showError('regNameError', 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)!');
    hasError = true;
  }

  // Validate email
  if (!isValidEmail(email)) {
    showError('regEmailError', 'Email không hợp lệ! Vui lòng kiểm tra lại.');
    hasError = true;
  }

  // Validate mật khẩu
  if (!isValidPassword(password)) {
    showError('regPasswordError', 'Mật khẩu phải có ít nhất 6 ký tự!');
    hasError = true;
  }

  // Validate xác nhận mật khẩu
  if (password !== confirmPassword) {
    showError('regConfirmPasswordError', 'Mật khẩu xác nhận không trùng khớp!');
    hasError = true;
  }

  if (hasError) return;

  // Kiểm tra email đã tồn tại hay chưa
  const allUsers = await getAllUsers();
  const emailExists = allUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

  if (emailExists) {
    showError('regEmailError', 'Email này đã được đăng ký tài khoản trước đó!');
    return;
  }

  // Tạo tài khoản mới
  const newId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id)) + 1 : 1;
  const newUser = {
    id: newId,
    name: name,
    email: email.toLowerCase(),
    phone: 'Chưa cập nhật',
    password: password,
    role: 'user'
  };

  // Lưu tài khoản mới vào danh sách users trong localStorage
  allUsers.push(newUser);
  localStorage.setItem('users', JSON.stringify(allUsers));

  // Tự động đăng nhập cho tài khoản vừa tạo
  const userObj = new User(newUser);
  localStorage.setItem('currentUser', JSON.stringify({
    id: userObj.id,
    name: userObj.name,
    email: userObj.email,
    role: userObj.role
  }));

  alert(`Đăng ký thành công! Chào mừng ${newUser.name} đã gia nhập SneakerZone!`);
  window.location.href = 'index.html';
});

// ===== KIỂM TRA THAM SỐ URL (Mở trực tiếp tab đăng ký nếu có ?tab=register) =====
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'register' || window.location.hash === '#register') {
    switchAuthTab('register');
  }
});
