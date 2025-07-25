// Vendor dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = getCurrentUser();
  const productsList = document.getElementById('productsList');
  const ordersList = document.getElementById('ordersList');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const orderModal = document.getElementById('orderModal');
  const orderForm = document.getElementById('orderForm');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Set vendor name
  if (document.getElementById('vendorName')) {
    document.getElementById('vendorName').textContent = currentUser.name;
  }
  
  // Load products
  function loadProducts(searchTerm = '', category = 'all') {
    const products = JSON.parse(localStorage.getItem('vendorLinkProducts')) || [];
    const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });
    
    productsList.innerHTML = '';
    
    if (filteredProducts.length === 0) {
      productsList.innerHTML = '<p class="text-center py-8">No products found</p>';
      return;
    }
    
    filteredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="product-image">${product.name.charAt(0)}</div>
        <div class="product-details">
          <h3>${product.name}</h3>
          <div class="product-meta">
            <span>${product.category}</span>
            <span>Supplier: ${getSupplierName(product.supplierId)}</span>
          </div>
          <div class="product-price">${formatPrice(product.price)}/${product.unit}</div>
          <p class="text-sm text-gray-600">${product.description}</p>
          <div class="product-actions">
            <button class="btn btn-primary btn-sm place-order" data-id="${product.id}">Place Order</button>
          </div>
        </div>
      `;
      productsList.appendChild(productCard);
    });
    
    // Add event listeners to order buttons
    document.querySelectorAll('.place-order').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        openOrderModal(productId);
      });
    });
  }
  
  // Load orders
  function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('vendorLinkOrders')) || [];
    const vendorOrders = orders.filter(order => order.vendorId === currentUser.id);
    
    ordersList.innerHTML = '';
    
    if (vendorOrders.length === 0) {
      ordersList.innerHTML = '<p class="text-center py-8">No orders yet</p>';
      return;
    }
    
    vendorOrders.forEach(order => {
      const product = getProductById(order.productId);
      const supplier = getSupplierById(order.supplierId);
      
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item';
      orderItem.innerHTML = `
        <div class="order-info">
          <h4>${product.name}</h4>
          <div class="order-meta">
            <span>${formatPrice(order.totalPrice)}</span>
            <span>Qty: ${order.quantity} ${product.unit}</span>
            <span class="order-status status-${order.status}">${order.status}</span>
          </div>
        </div>
        <div class="order-actions">
          ${order.status === 'delivered' ? `
            <button class="btn btn-outline btn-sm rate-order" data-id="${order.id}">Rate</button>
          ` : ''}
        </div>
      `;
      ordersList.appendChild(orderItem);
    });
  }
  
  // Get supplier name by ID
  function getSupplierName(supplierId) {
    const users = JSON.parse(localStorage.getItem('vendorLinkUsers')) || [];
    const supplier = users.find(user => user.id === supplierId);
    return supplier ? supplier.businessName : 'Unknown Supplier';
  }
  
  // Get product by ID
  function getProductById(productId) {
    const products = JSON.parse(localStorage.getItem('vendorLinkProducts')) || [];
    return products.find(product => product.id === productId) || {};
  }
  
  // Get supplier by ID
  function getSupplierById(supplierId) {
    const users = JSON.parse(localStorage.getItem('vendorLinkUsers')) || [];
    return users.find(user => user.id === supplierId) || {};
  }
  
  // Open order modal
  function openOrderModal(productId) {
    const product = getProductById(productId);
    document.getElementById('productId').value = productId;
    document.getElementById('unitDisplay').textContent = product.unit;
    document.getElementById('quantity').value = 1;
    document.getElementById('quantity').max = product.stock;
    document.getElementById('deliveryAddress').value = currentUser.location.address;
    updateTotalPrice();
    orderModal.classList.add('active');
  }
  
  // Update total price in order modal
  function updateTotalPrice() {
    const productId = document.getElementById('productId').value;
    const quantity = document.getElementById('quantity').value;
    const product = getProductById(productId);
    const total = product.price * quantity;
    document.getElementById('totalPrice').textContent = formatPrice(total);
  }
  
  // Close modal
  function closeModal() {
    orderModal.classList.remove('active');
  }
  
  // Handle tab switching
  document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function() {
      const tab = this.getAttribute('data-tab');
      
      // Update active tab
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      document.getElementById(`${tab}Tab`).classList.add('active');
      
      // Update dashboard title
      document.getElementById('dashboardTitle').textContent = 
        tab === 'products' ? 'Browse Products' : 'My Orders';
      
      // Load appropriate data
      if (tab === 'products') {
        loadProducts();
      } else {
        loadOrders();
      }
    });
  });
  
  // Search and filter events
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      loadProducts(this.value, categoryFilter.value);
    });
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      loadProducts(searchInput.value, this.value);
    });
  }
  
  // Quantity change in order modal
  if (document.getElementById('quantity')) {
    document.getElementById('quantity').addEventListener('input', updateTotalPrice);
  }
  
  // Order form submission
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const productId = document.getElementById('productId').value;
      const quantity = parseInt(document.getElementById('quantity').value);
      const deliveryAddress = document.getElementById('deliveryAddress').value;
      const product = getProductById(productId);
      
      // Create new order
      const newOrder = {
        id: `o${Date.now()}`,
        productId,
        vendorId: currentUser.id,
        supplierId: product.supplierId,
        quantity,
        totalPrice: product.price * quantity,
        status: 'pending',
        deliveryAddress,
        createdAt: new Date().toISOString()
      };
      
      // Save order
      const orders = JSON.parse(localStorage.getItem('vendorLinkOrders')) || [];
      orders.push(newOrder);
      localStorage.setItem('vendorLinkOrders', JSON.stringify(orders));
      
      // Update product stock
      const products = JSON.parse(localStorage.getItem('vendorLinkProducts')) || [];
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        products[productIndex].stock -= quantity;
        localStorage.setItem('vendorLinkProducts', JSON.stringify(products));
      }
      
      showAlert('Order placed successfully!');
      closeModal();
      loadProducts();
    });
  }
  
  // Close modal when clicking X
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  
  // Close modal when clicking outside
  orderModal.addEventListener('click', function(e) {
    if (e.target === orderModal) {
      closeModal();
    }
  });
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
  }
  
  // Load initial data
  loadProducts();
});
