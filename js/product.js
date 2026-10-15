// ============================================================
// LAB 4 / ASM - OOP & MODULE (product.js)
// Duy nhất 1 class Product có constructor(name, price, quantity = 10)
// Áp dụng tham số mặc định quantity = 10 và hàm getInfo()
// ============================================================

export class Product {
  constructor(name, price, quantity = 10) {
    this.name = name;
    this.price = Number(price);
    this.quantity = quantity;
  }

  getInfo() {
    return `${this.name} - ${this.price.toLocaleString("vi-VN")}₫ (SL: ${this.quantity})`;
  }
}
