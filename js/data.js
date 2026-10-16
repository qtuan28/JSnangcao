// ============================================================
// data.js – Dữ liệu inline (fallback khi không có json-server)
// ============================================================
var LOCAL_DB = {
  categories: [
    { id: 1, name: "Nike",        icon: "" },
    { id: 2, name: "Adidas",      icon: "" },
    { id: 3, name: "Puma",        icon: "" },
    { id: 4, name: "Converse",    icon: "" },
    { id: 5, name: "New Balance", icon: "" }
  ],
  products: [
    {
      id: 1, name: "Nike Air Max 270", category: "Nike", categoryId: 1,
      price: 2850000, stock: 15,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&auto=format&fit=crop",
      description: "Giày chạy bộ cao cấp với đế Air Max êm ái, thiết kế thể thao hiện đại.",
      sizes: [38, 39, 40, 41, 42, 43]
    },
    {
      id: 2, name: "Adidas Ultraboost 22", category: "Adidas", categoryId: 2,
      price: 3200000, stock: 10,
      image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80&auto=format&fit=crop",
      description: "Giày chạy bộ với công nghệ Boost mang lại năng lượng tối đa.",
      sizes: [39, 40, 41, 42, 43, 44]
    },
    {
      id: 3, name: "Puma RS-X3 Puzzle", category: "Puma", categoryId: 3,
      price: 1950000, stock: 20,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80&auto=format&fit=crop",
      description: "Giày sneaker retro với thiết kế chunky độc đáo, phối màu nổi bật.",
      sizes: [38, 39, 40, 41, 42]
    },
    {
      id: 4, name: "Converse Chuck 70 High Top", category: "Converse", categoryId: 4,
      price: 1650000, stock: 25,
      image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=600&q=80&auto=format&fit=crop",
      description: "Giày canvas cổ điển, biểu tượng thời trang đường phố mọi thời đại.",
      sizes: [36, 37, 38, 39, 40, 41, 42]
    },
    {
      id: 5, name: "Nike React Infinity Run", category: "Nike", categoryId: 1,
      price: 3100000, stock: 8,
      image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80&auto=format&fit=crop",
      description: "Giày chạy bộ được thiết kế để giảm thiểu chấn thương, hỗ trợ tối đa.",
      sizes: [40, 41, 42, 43, 44]
    },
    {
      id: 6, name: "New Balance 574 Core", category: "New Balance", categoryId: 5,
      price: 2200000, stock: 12,
      image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80&auto=format&fit=crop",
      description: "Giày sneaker cổ điển với đế ENCAP độc quyền, thoải mái cả ngày dài.",
      sizes: [38, 39, 40, 41, 42, 43]
    },
    {
      id: 7, name: "Adidas Stan Smith Classic", category: "Adidas", categoryId: 2,
      price: 1800000, stock: 30,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80&auto=format&fit=crop",
      description: "Giày tennis cổ điển, thiết kế tối giản thanh lịch phù hợp mọi phong cách.",
      sizes: [37, 38, 39, 40, 41, 42, 43]
    },
    {
      id: 8, name: "Nike Jordan 1 Retro High", category: "Nike", categoryId: 1,
      price: 4500000, stock: 5,
      image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80&auto=format&fit=crop",
      description: "Huyền thoại bóng rổ Air Jordan 1, biểu tượng sneaker toàn cầu.",
      sizes: [40, 41, 42, 43, 44, 45]
    },
    {
      id: 9, name: "Nike Air Force 1 '07", category: "Nike", categoryId: 1,
      price: 2650000, stock: 18,
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80&auto=format&fit=crop",
      description: "Huyền thoại streetwear toàn cầu với phối màu trắng thanh lịch, da cao cấp bền bỉ.",
      sizes: [38, 39, 40, 41, 42, 43, 44]
    },
    {
      id: 10, name: "Nike ZoomX Vaporfly NEXT%", category: "Nike", categoryId: 1,
      price: 5200000, stock: 6,
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80&auto=format&fit=crop",
      description: "Giày marathon phá kỷ lục với đệm bọt ZoomX đàn hồi và đĩa đệm sợi carbon.",
      sizes: [40, 41, 42, 43, 44]
    },
    {
      id: 11, name: "Nike Dunk Low Retro Panda", category: "Nike", categoryId: 1,
      price: 3400000, stock: 9,
      image: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80&auto=format&fit=crop",
      description: "Bản phối màu đen trắng kinh điển gây sốt giới trẻ, cực dễ phối đồ hàng ngày.",
      sizes: [39, 40, 41, 42, 43]
    },
    {
      id: 12, name: "Nike Air Max Plus TN", category: "Nike", categoryId: 1,
      price: 3800000, stock: 11,
      image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=80&auto=format&fit=crop",
      description: "Hệ thống đệm Tuned Air độc quyền kết hợp những đường vân sóng đại dương nổi bật.",
      sizes: [39, 40, 41, 42, 43, 44]
    },
    {
      id: 13, name: "Adidas NMD R1 V2", category: "Adidas", categoryId: 2,
      price: 2900000, stock: 14,
      image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&q=80&auto=format&fit=crop",
      description: "Sneaker phong cách thành thị hiện đại kết hợp đế đệm Boost êm ái linh hoạt.",
      sizes: [38, 39, 40, 41, 42, 43]
    },
    {
      id: 14, name: "Adidas Superstar Core Black", category: "Adidas", categoryId: 2,
      price: 2100000, stock: 22,
      image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&q=80&auto=format&fit=crop",
      description: "Mũi sò huyền thoại không thể nhầm lẫn, biểu tượng hiphop và thời trang đường phố.",
      sizes: [37, 38, 39, 40, 41, 42, 43]
    },
    {
      id: 15, name: "Adidas Forum Low 84", category: "Adidas", categoryId: 2,
      price: 2500000, stock: 16,
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80&auto=format&fit=crop",
      description: "Mẫu giày bóng rổ cổ điển những năm 80 được tái sinh với chất liệu da cao cấp tinh tế.",
      sizes: [39, 40, 41, 42, 43, 44]
    },
    {
      id: 16, name: "Adidas Adizero Boston 11", category: "Adidas", categoryId: 2,
      price: 3150000, stock: 10,
      image: "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=600&q=80&auto=format&fit=crop",
      description: "Giày huấn luyện chạy đường dài tốc độ cao với các thanh Energyrods bằng sợi thủy tinh.",
      sizes: [40, 41, 42, 43, 44]
    },
    {
      id: 17, name: "Puma Suede Classic XXI", category: "Puma", categoryId: 3,
      price: 1750000, stock: 19,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80&auto=format&fit=crop",
      description: "Biểu tượng văn hóa đường phố với chất liệu da lộn mềm mại và dải formstrip đặc trưng.",
      sizes: [38, 39, 40, 41, 42, 43]
    },
    {
      id: 18, name: "Puma Future Rider Play On", category: "Puma", categoryId: 3,
      price: 1850000, stock: 15,
      image: "https://images.unsplash.com/photo-1588117260148-b47818741c74?w=600&q=80&auto=format&fit=crop",
      description: "Phong cách retro thập niên 80 phối màu năng động, đế ngoài hạt đinh chống trượt.",
      sizes: [38, 39, 40, 41, 42]
    },
    {
      id: 19, name: "Puma Slipstream Heritage", category: "Puma", categoryId: 3,
      price: 2250000, stock: 13,
      image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&q=80&auto=format&fit=crop",
      description: "Dòng giày bóng rổ di sản kết hợp kiểu dáng cổ điển và công nghệ đệm êm hiện đại.",
      sizes: [39, 40, 41, 42, 43]
    },
    {
      id: 20, name: "Puma Velocity Nitro 2", category: "Puma", categoryId: 3,
      price: 2400000, stock: 11,
      image: "https://images.unsplash.com/photo-1570464197285-9949814674a7?w=600&q=80&auto=format&fit=crop",
      description: "Công nghệ đệm bọt Nitro siêu nhẹ phản hồi nhanh, tối ưu cho chạy bộ hằng ngày.",
      sizes: [39, 40, 41, 42, 43, 44]
    },
    {
      id: 21, name: "Converse Chuck Taylor All Star Red", category: "Converse", categoryId: 4,
      price: 1450000, stock: 26,
      image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&q=80&auto=format&fit=crop",
      description: "Phiên bản vải canvas đỏ nổi bật kinh điển, dễ dàng phối đồ với mọi phong cách trẻ trung.",
      sizes: [36, 37, 38, 39, 40, 41, 42]
    },
    {
      id: 22, name: "Converse Run Star Hike Lugged", category: "Converse", categoryId: 4,
      price: 2450000, stock: 17,
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80&auto=format&fit=crop",
      description: "Thiết kế đế răng cưa cá tính táo bạo nâng tầm phong cách thời trang phá cách đỉnh cao.",
      sizes: [36, 37, 38, 39, 40, 41]
    },
    {
      id: 23, name: "Converse One Star Pro Suede", category: "Converse", categoryId: 4,
      price: 1850000, stock: 14,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80&auto=format&fit=crop",
      description: "Ngôi sao đơn bản sắc độc đáo, chất da lộn bền bỉ dành cho dân trượt ván và streetwear.",
      sizes: [38, 39, 40, 41, 42, 43]
    },
    {
      id: 24, name: "New Balance 550 White Grey", category: "New Balance", categoryId: 5,
      price: 3200000, stock: 12,
      image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&q=80&auto=format&fit=crop",
      description: "Cơn sốt sneaker cổ thấp phong cách retro court, da thật êm ái sang trọng.",
      sizes: [39, 40, 41, 42, 43, 44]
    },
    {
      id: 25, name: "New Balance 2002R Protection", category: "New Balance", categoryId: 5,
      price: 3950000, stock: 8,
      image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&q=80&auto=format&fit=crop",
      description: "Thiết kế viền rách phá cách đặc trưng của dòng Protection Pack với bộ đệm N-ergy cao cấp.",
      sizes: [40, 41, 42, 43, 44]
    },
    {
      id: 26, name: "New Balance 990v5 Classic Grey", category: "New Balance", categoryId: 5,
      price: 4850000, stock: 7,
      image: "https://images.unsplash.com/photo-1580906853203-f493cea9ff28?w=600&q=80&auto=format&fit=crop",
      description: "Đỉnh cao sneaker xám biểu tượng của New Balance với độ hoàn thiện thủ công tỉ mỉ.",
      sizes: [40, 41, 42, 43, 44, 45]
    },
    {
      id: 27, name: "New Balance 327 Vintage Runner", category: "New Balance", categoryId: 5,
      price: 2350000, stock: 16,
      image: "https://images.unsplash.com/photo-1603787081207-362bcef7c144?w=600&q=80&auto=format&fit=crop",
      description: "Lấy cảm hứng từ giày chạy thập niên 70 với logo N phóng to ấn tượng và đế gai đinh đặc sắc.",
      sizes: [38, 39, 40, 41, 42, 43]
    },
    {
      id: 28, name: "Nike Air Zoom Pegasus 40", category: "Nike", categoryId: 1,
      price: 3250000, stock: 20,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80&auto=format&fit=crop",
      description: "Đôi cánh cho đôi chân bạn, chiến mã chạy bộ cự ly dài bền bỉ hàng đầu thế giới.",
      sizes: [38, 39, 40, 41, 42, 43, 44]
    }
  ],
  users: [
    { id: 1, name: "Admin",        email: "admin@shoes.com", password: "Admin@123", role: "admin" },
    { id: 2, name: "Nguyen Van A", email: "user@shoes.com",  password: "User@123",  role: "user"  }
  ]
};

if (typeof window !== 'undefined') {
  window.LOCAL_DB = LOCAL_DB;
}
