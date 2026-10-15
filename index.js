// ============================================================
// LAB 4 / ASM - JAVASCRIPT NÂNG CAO (WEB2064)
// ============================================================
import { Product } from "./product.js";

// Khởi tạo mảng sản phẩm & giỏ hàng
let shoes = [];
let cart = [];
let total = 0;

// 1. ĐỌC DỮ LIỆU JSON (loadShoes)
// Dùng async/await kết hợp fetch("db.json") và forEach đẩy new Product vào shoes
async function loadShoes() {
  try {
    const res = await fetch("db.json");
    const data = await res.json();
    const productList = Array.isArray(data) ? data : (data.products || []);
    productList.forEach(item => {
      shoes.push(new Product(item.name, item.price));
    });
  } catch (err) {
    console.warn("fetch db.json fallback:", err);
    // Dữ liệu dự phòng nếu mở trực tiếp bằng giao thức file://
    const fallbackData = [
      { name: "Nike Air Max 270", price: 2850000 },
      { name: "Adidas Ultraboost 22", price: 3200000 },
      { name: "Puma RS-X3", price: 1950000 },
      { name: "Converse Chuck 70", price: 1650000 },
      { name: "Nike React Infinity", price: 3100000 }
    ];
    fallbackData.forEach(item => shoes.push(new Product(item.name, item.price)));
  }
  renderShoes();
}

// 2. HIỂN THỊ BẰNG DOM (renderShoes)
// Lấy thẻ <ul> bằng getElementById, xóa trắng nội dung cũ bằng innerHTML = ""
// Dùng shoes.forEach((s, index) => ...) kết hợp createElement("li") và appendChild
function renderShoes() {
  const shoeList = document.getElementById("shoeList");
  shoeList.innerHTML = "";

  shoes.forEach((s, index) => {
    const li = document.createElement("li");

    // Thông tin sản phẩm từ method getInfo()
    const infoSpan = document.createElement("span");
    infoSpan.className = "shoe-info";
    infoSpan.textContent = s.getInfo();

    // Nút Mua
    const btnBuy = document.createElement("button");
    btnBuy.className = "btn-action btn-buy";
    btnBuy.textContent = "Mua";
    btnBuy.onclick = () => addToCart(s.name, s.price);

    // Nút Sửa
    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-action btn-edit";
    btnEdit.textContent = "Sửa";
    btnEdit.onclick = () => editShoe(index);

    // Nút Xóa
    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-action btn-delete";
    btnDelete.textContent = "Xóa";
    btnDelete.onclick = () => deleteShoe(index);

    // Nhóm nút thao tác
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "shoe-actions";
    actionsDiv.appendChild(btnBuy);
    actionsDiv.appendChild(btnEdit);
    actionsDiv.appendChild(btnDelete);

    li.appendChild(infoSpan);
    li.appendChild(actionsDiv);
    shoeList.appendChild(li);
  });
}

// 3. GIỎ HÀNG 5 DÒNG (addToCart)
// Dùng let cart = [], let total = 0; cart.push({name, price}); total += price;
// Dùng forEach in danh sách giỏ hàng ra màn hình
function addToCart(name, price) {
  cart.push({ name, price });
  total += price;

  const cartList = document.getElementById("cartList");
  cartList.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.price.toLocaleString("vi-VN")}₫`;
    cartList.appendChild(li);
  });
  document.getElementById("totalPrice").textContent = `${total.toLocaleString("vi-VN")}₫`;
}

// 4. THÊM, SỬA, XÓA TRỰC TIẾP QUA VỊ TRÍ INDEX
// Thêm: Lấy giá trị từ 2 input, đẩy vào mảng bằng shoes.push(new Product(name, price)) rồi gọi renderShoes()
function addShoe() {
  const nameInput = document.getElementById("shoeName");
  const priceInput = document.getElementById("shoePrice");
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (name && price > 0) {
    shoes.push(new Product(name, price));
    renderShoes();
    nameInput.value = "";
    priceInput.value = "";
  } else {
    alert("Vui lòng nhập tên và giá giày hợp lệ!");
  }
}

// Sửa: Dùng prompt() nhập tên và giá mới, gán đè shoes[index] = new Product(newName, newPrice) rồi gọi renderShoes()
function editShoe(index) {
  const newName = prompt("Nhập tên mới:", shoes[index].name);
  const newPrice = prompt("Nhập giá mới:", shoes[index].price);
  if (newName !== null && newPrice !== null && newName !== "") {
    shoes[index] = new Product(newName, newPrice);
    renderShoes();
  }
}

// Xóa: Cắt bỏ phần tử bằng shoes.splice(index, 1) rồi gọi renderShoes()
function deleteShoe(index) {
  shoes.splice(index, 1);
  renderShoes();
}

// Gắn các hàm ra window để nút onclick trong HTML có thể gọi
window.addShoe = addShoe;
window.editShoe = editShoe;
window.deleteShoe = deleteShoe;
window.addToCart = addToCart;

// Tải dữ liệu ban đầu
loadShoes();
