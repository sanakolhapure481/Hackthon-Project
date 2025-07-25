// Supplier dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = getCurrentUser();
  const productsList = document.getElementById('productsList');
  const ordersList = document.getElementById('ordersList');
  const addProductBtn = document.getElementById('addProductBtn');
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Set supplier name
  if (document.getElementById('supplierName')) {
    document.getElementById('supplierName').textContent = currentUser.businessName;
  }
  
  // Load products
  function loadProducts() {
    const products = JSON.parse(localStorage.getItem('vendorLinkProducts')) || [];
    const supplierProducts = products.filter(product => product.supplierId === currentUser.id);
    
    productsList.innerHTML = '';
    
    if (supplierProducts.length === 0) {
      productsList.innerHTML = '<p class="text-center py-8">No products added yet</p>';
      return;
    }
    
    supplierProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="product-image">${product.name.charAt(0)}</div>
        <div class="product-details">
          <h3>${product.name}</h3>
          <div class="product-meta">
            <span>${product.category}</span>
            <span>Stock: ${product.stock} ${product.unit}</span>
          </div>
          <div class="product-price">${formatPrice(product.price)}/${product.unit}</div>
          <p class="text-sm text-gray-600">${product.description || 'No description'}</p>
          <div class="product-actions">
            <button class="btn btn-outline btn-sm edit-product" data-id="${product.id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-product" data-id="${product.id}">Delete</button>
          </div>
        </div>
      `;
      productsList.appendChild(productCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-product').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        openProductModal(productId);
      });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        deleteProduct(productId);
      });
    });
  }
  
  // Load orders
  function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('vendorLinkOrders')) || [];
    const supplierOrders = orders.filter(order => order.supplierId === currentUser.id);
    
    ordersList.innerHTML = '';
    
    if (supplierOrders.length === 0) {
      ordersList.innerHTML = '<p class="text-center py-8">No orders yet</p>';
      return;
    }
    
    supplierOrders.forEach(order => {
      const product = getProductById(order.productId);
      const vendor = getUserById(order.vendorId);
      
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item';
      orderItem.innerHTML = `
        <div class="order-info">
          <h4>${product.name}</h4>
          <div class="order-meta">
            <span>${vendor.businessName}</span>
            <span>${formatPrice(order.totalPrice)}</span>
            <span>Qty: ${order.quantity} ${product.unit}</span>
            <span class="order-status status-${order.status}">${order.status}</span>
          </div>
          <p class="text-sm mt-1">${order.deliveryAddress}</p>
        </div>
        <div class="order-actions">
          ${order.status === 'pending' ? `
            <button class="btn btn-primary btn-sm accept-order" data-id="${order.id}">Accept</button>
            <button class="btn btn-danger btn-sm reject-order" data-id="${order.id}">Reject</button>
          ` : ''}
          ${order.status === 'accepted' ? `
            <button class="btn btn-secondary btn-sm deliver-order" data-id="${order.id}">Mark as Delivered</button>
          ` : ''}
        </div>
      `;
      ordersList.appendChild(orderItem);
    });
    
    // Add event listeners to order action buttons
    document.querySelectorAll('.accept-order').forEach(button => {
      button.addEventListener('click', function() {
        updateOrderStatus(this.getAttribute('data-id'), 'accepted');
      });
    });
    
    document.querySelectorAll('.reject-order').forEach(button => {
      button.addEventListener('click', function() {
        updateOrderStatus(this.getAttribute('data-id'), 'rejected');
      });
    });
    
    document.querySelectorAll('.deliver-order').forEach(button => {
      button.addEventListener('click', function() {
        updateOrderStatus(this.getAttribute('data-id'), 'delivered');
      });
    });
  }
  
  // Get product by ID
  function getProductById(productId) {
    const products = JSON.parse(localStorage.getItem('vendorLinkProducts')) || [];
    return products.find(product => product.id === productId) || {};
  }
  
  // Get user by ID
  function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('vendorLinkUsers')) || [];
    return users.find(user => user.id === userId) || {};
  }
  
  // Open product modal for editing or adding
  function openProductModal(productId = null) {
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
      // Edit mode
      modalTitle.textContent = 'Edit Product';
      const product = getProductById(productId);
      
      document.getElementById('editProductId').value = productId;
      document.getElementById('productName').value = product.name;
      document.getElementById('productCategory').value = product.category;
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productUnit').value = product.unit;
      document.getElementById('productStock').value = product.stock;
      document.getElementById('productDescription').value = product.description || '';
    } else {
      // Add mode
      modalTitle.textContent = 'Add New Product';
      form.reset();
      document.getElementById('editProductId').value = '';
    }
    
    productModal.classList.add('active');
  }
  
  // Close modal
  function closeModal() {
    productModal.classList.remove('active');
  }
  
  // Save product
  function saveProduct(productData) {
    const products = JSON.parse(localStorage.getItem('vendorLinkProducts')) || [];
    
    if (productData.id) {
      // Update existing product
      const index = products.findIndex(p => p.id === productData.id);
      if (index !== -1) {
        products[index] = { ...products[index], ...productData };
      }
    } else {
      // Add new product
      productData.id = `p${Date.now()}`;
      productData.supplierId = currentUser.id;
      products.push(productData);
    }
    
    localStorage.setItem('vendorLinkProducts', JSON.stringify(products));
    loadProducts();
    showAlert(`Product ${productData.id ? 'updated' : 'added'} successfully!`);
  }
  
  // Delete product
  function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      const products = JSON.parse(localStorage.getItem('vendorLinkProducts')) || [];
      const updatedProducts = products.filter(product => product.id !== productId);
      localStorage.setItem('vendorLinkProducts', JSON.stringify(updatedProducts));
      loadProducts();
      showAlert('Product deleted successfully!');
    }
  }
  
  // Update order status
  function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('vendorLinkOrders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      localStorage.setItem('vendorLinkOrders', JSON.stringify(orders));
      loadOrders();
      showAlert(`Order ${status} successfully!`);
    }
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
        tab === 'products' ? 'My Products' : 'Orders';
      
      // Load appropriate data
      if (tab === 'products') {
        loadProducts();
      } else {
        loadOrders();
      }
    });
  });
  
  // Add product button
  if (addProductBtn) {
    addProductBtn.addEventListener('click', function() {
      openProductModal();
    });
  }
  
  // Product form submission
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const productData = {
        id: document.getElementById('editProductId').value,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        unit: document.getElementById('productUnit').value,
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value
      };
      
      saveProduct(productData);
      closeModal();
    });
  }
  
  // Close modal when clicking X
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  
  // Close modal when clicking outside
  productModal.addEventListener('click', function(e) {
    if (e.target === productModal) {
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