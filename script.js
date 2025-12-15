// ==================== 全局配置与工具函数 ====================
// 本地存储的键名
const STORAGE_KEYS = {
    PRODUCTS: 'storeProducts',      // 商品数据
    CART: 'shoppingCart'            // 购物车数据
};

// 生成星级评分HTML
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// 获取分类中文名称
function getCategoryName(categoryKey) {
    const categoryMap = {
        'office': '办公必备',
        'design': '设计工具',
        'system': '系统工具',
        'utility': '效率工具'
    };
    return categoryMap[categoryKey] || '其他';
}

// 显示消息提示
function showMessage(text, type = 'info') {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    // 移除旧消息
    const oldMessages = container.querySelectorAll('.message-box');
    oldMessages.forEach(msg => msg.remove());

    // 创建新消息
    const messageEl = document.createElement('div');
    messageEl.className = `message-box ${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${text}</span>
    `;

    container.appendChild(messageEl);

    // 3.5秒后自动移除
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3500);
}

// ==================== 产品数据管理 ====================
// 从 localStorage 读取商品数据，如果为空则使用默认示例数据
let products = [];

// 加载产品数据的函数
function loadProducts() {
    try {
        const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            console.log(`📦 已从本地存储加载 ${products.length} 个商品`);
        } else {
            // 如果没有存储的数据，使用默认示例数据
            products = [
                {
                    id: 1,
                    name: "Office 2021 专业增强版",
                    category: "office",
                    price: 168.00,
                    description: "包含 Word, Excel, PPT 等全套组件，一次购买永久使用，支持重装。",
                    imageUrl: "https://img14.360buyimg.com/n1/s450x450_jfs/t1/172770/39/33162/110998/63da3f5aF6f3b1b5c/5b0900654ca73bc0.jpg",
                    badge: "永久买断",
                    rating: 4.9
                },
                {
                    id: 2,
                    name: "Adobe Photoshop 2024",
                    category: "design",
                    price: 88.00,
                    description: "全球最流行的图像处理软件，新增 AI 填充功能，设计师必备神器。",
                    imageUrl: "https://img12.360buyimg.com/n1/s450x450_jfs/t1/197572/3/30634/55741/639257adE1a5f8c52/bc05bca381f0665f.jpg",
                    badge: "AI加持",
                    rating: 5.0
                },
                {
                    id: 3,
                    name: "Windows 11 专业版激活码",
                    category: "system",
                    price: 35.00,
                    description: "支持官方在线更新，支持绑定微软账号，旧电脑升级首选。",
                    imageUrl: "https://img13.360buyimg.com/n1/s450x450_jfs/t1/125088/30/26236/64633/62193705Ea26c50b9/91ecb2471dfee852.jpg",
                    badge: "秒发货",
                    rating: 4.8
                },
                {
                    id: 4,
                    name: "IDM 下载加速器",
                    category: "utility",
                    price: 39.00,
                    description: "能够将下载速度提升5倍，支持断点续传，嗅探网页视频，终身授权。",
                    imageUrl: "https://img10.360buyimg.com/n1/s450x450_jfs/t1/140258/10/32020/10009/65418f3bF9c6b5e3a/1d5f8e5c4c1e5b5a.jpg",
                    badge: "终身授权",
                    rating: 4.9
                }
            ];
            
            // 将默认数据保存到 localStorage
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            console.log("📝 使用默认商品数据并已保存到本地存储");
        }
    } catch (error) {
        console.error('❌ 加载商品数据失败:', error);
        showMessage('加载商品数据时出错', 'error');
        products = [];
    }
}

// ==================== 购物车管理 ====================
let shoppingCart = [];
let currentFilter = 'all';

// 加载购物车数据
function loadCart() {
    try {
        const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
        shoppingCart = storedCart ? JSON.parse(storedCart) : [];
        console.log(`🛒 已加载购物车，共 ${shoppingCart.length} 种商品`);
    } catch (error) {
        console.error('❌ 加载购物车失败:', error);
        shoppingCart = [];
    }
}

// 保存购物车到本地存储
function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(shoppingCart));
    } catch (error) {
        console.error('❌ 保存购物车失败:', error);
    }
}

// ==================== 渲染函数 ====================
// 渲染产品列表
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    // 筛选产品
    const filteredProducts = currentFilter === 'all' 
        ? products 
        : products.filter(p => p.category === currentFilter);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="loading-text">该分类下暂无产品。请到后台管理添加商品。</p>';
        return;
    }

    // 生成产品卡片 HTML
    productsGrid.innerHTML = filteredProducts.map(product => {
        // 检查该商品是否已在购物车中
        const inCart = shoppingCart.some(item => item.id === product.id);
        const buttonText = inCart ? '<i class="fas fa-check"></i> 已添加' : '<i class="fas fa-cart-plus"></i> 加入购物车';
        const buttonClass = inCart ? 'added-to-cart' : '';
        
        return `
        <article class="product-card" data-category="${product.category}" data-id="${product.id}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300/667eea/ffffff?text=产品预览'">
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="product-price">¥${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        ${generateStarRating(product.rating)}
                        <span class="rating-text">${product.rating}</span>
                    </div>
                </div>
                <button class="add-to-cart-btn ${buttonClass}" onclick="addToCart(${product.id})" 
                        data-product-id="${product.id}" ${inCart ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        </article>
        `;
    }).join('');
}

// 渲染购物车
function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const totalPriceEl = document.getElementById('totalPrice');

    if (!cartItemsEl) return;

    // 更新购物车角标数量
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = totalItems;

    // 计算总价
    const totalPrice = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalPriceEl) totalPriceEl.textContent = totalPrice.toFixed(2);

    // 渲染购物车商品列表
    if (shoppingCart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-cart-msg">购物车是空的，快去挑选商品吧！</p>';
        return;
    }

    cartItemsEl.innerHTML = shoppingCart.map(item => {
        const product = products.find(p => p.id === item.id) || item;
        
        return `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-img">
                <img src="${product.imageUrl}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/100/667eea/ffffff?text=商品'">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${product.name}</h4>
                <div class="cart-item-price">¥${product.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})" title="移除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// ==================== 购物车操作函数 ====================
// 添加到购物车
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showMessage('商品不存在', 'error');
        return;
    }

    const existingItem = shoppingCart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
    renderProducts(); // 重新渲染产品列表以更新按钮状态
    showMessage(`"${product.name}" 已加入购物车！`, 'success');
}

// 更新商品数量
function updateQuantity(productId, change) {
    const item = shoppingCart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        // 如果数量为0或负数，从购物车移除
        shoppingCart = shoppingCart.filter(item => item.id !== productId);
        showMessage('商品已从购物车移除', 'info');
    } else if (change > 0) {
        showMessage('已增加数量', 'info');
    } else {
        showMessage('已减少数量', 'info');
    }

    saveCart();
    renderCart();
    renderProducts(); // 更新产品列表中的按钮状态
}

// 从购物车移除商品
function removeFromCart(productId) {
    const itemIndex = shoppingCart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    const itemName = shoppingCart[itemIndex].name;
    shoppingCart.splice(itemIndex, 1);
    
    saveCart();
    renderCart();
    renderProducts(); // 更新产品列表中的按钮状态
    showMessage(`"${itemName}" 已从购物车移除`, 'info');
}

// 清空购物车
function clearCart() {
    if (shoppingCart.length === 0) {
        showMessage('购物车已经是空的', 'info');
        return;
    }
    
    if (confirm('确定要清空购物车吗？')) {
        shoppingCart = [];
        saveCart();
        renderCart();
        renderProducts(); // 更新产品列表中的按钮状态
        showMessage('购物车已清空', 'info');
    }
}

// ==================== 事件处理与UI交互 ====================
// 初始化所有事件监听器
function attachEventListeners() {
    // 购物车侧边栏开关
    const cartToggle = document.getElementById('cartToggle');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const continueShopping = document.getElementById('continueShopping');
    const cartSidebar = document.getElementById('cartSidebar');

    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartSidebar() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartSidebar);
    if (continueShopping) continueShopping.addEventListener('click', closeCartSidebar);

    // 产品分类筛选
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新活动按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新当前筛选条件并重新渲染产品
            currentFilter = this.dataset.category;
            renderProducts();
        });
    });

    // 结算按钮（模拟）
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (shoppingCart.length === 0) {
                showMessage('购物车是空的，无法结算', 'error');
                return;
            }
            
            // 模拟结算流程
            const total = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderId = 'ORD' + Date.now().toString().slice(-8);
            const itemCount = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
            
            // 显示订单确认信息
            showMessage(`订单 ${orderId} 创建成功！共 ${itemCount} 件商品，总计：¥${total.toFixed(2)}`, 'success');
            
            // 在实际项目中，这里会跳转到真正的结算页面
            console.log('模拟订单数据:', {
                orderId,
                items: shoppingCart,
                total,
                timestamp: new Date().toISOString()
            });
            
            // 可选：清空购物车
            // shoppingCart = [];
            // saveCart();
            // renderCart();
            // renderProducts();
            
            // 关闭购物车侧边栏
            closeCartSidebar();
        });
    }
    
    // 监听商品数据变化（从后台管理页面修改时）
    window.addEventListener('storage', function(event) {
        if (event.key === STORAGE_KEYS.PRODUCTS) {
            console.log('检测到商品数据变化，重新加载...');
            loadProducts();
            renderProducts();
        }
    });
}

// ==================== 初始化函数 ====================
// 页面加载完成后初始化
function init() {
    console.log("🛍️ 数字商品商店初始化...");
    
    // 加载数据
    loadProducts();
    loadCart();
    
    // 渲染界面
    renderProducts();
    renderCart();
    
    // 绑定事件
    attachEventListeners();
    
    // 显示欢迎消息
    setTimeout(() => {
        showMessage('欢迎来到数字工具箱！', 'info');
    }, 500);
}

// ==================== 全局暴露函数（供HTML内联事件调用） ====================
// 将这些函数暴露给全局window对象，以便在HTML的onclick属性中调用
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;

// ==================== 启动应用 ====================
// 当DOM完全加载后执行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}