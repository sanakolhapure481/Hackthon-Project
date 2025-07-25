// Utility functions used across the application

// Initialize dummy data if not exists
function initializeDummyData() {
  if (!localStorage.getItem('vendorLinkUsers')) {
    const users = [
      {
        id: 'v1',
        name: 'Rajesh Kumar',
        email: 'vendor@example.com',
        password: 'vendor123',
        role: 'vendor',
        businessName: 'Rajesh Chaat Corner',
        location: {
          address: '123 Street, Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        contactNumber: '9876543210'
      },
      {
        id: 's1',
        name: 'Supplier Pvt Ltd',
        email: 'supplier@example.com',
        password: 'supplier123',
        role: 'supplier',
        businessName: 'Fresh Farm Supplies',
        location: {
          address: '456 Market Road, Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002'
        },
        contactNumber: '9876543211'
      }
    ];
    localStorage.setItem('vendorLinkUsers', JSON.stringify(users));
  }

  if (!localStorage.getItem('vendorLinkProducts')) {
    const products = [
      {
        id: 'p1',
        name: 'Potatoes',
        price: 25,
        unit: 'kg',
        category: 'vegetables',
        stock: 100,
        supplierId: 's1',
        description: 'Fresh farm potatoes'
      },
      {
        id: 'p2',
        name: 'Rice',
        price: 45,
        unit: 'kg',
        category: 'grains',
        stock: 200,
        supplierId: 's1',
        description: 'Premium quality rice'
      },
      {
        id: 'p3',
        name: 'Chana Dal',
        price: 80,
        unit: 'kg',
        category: 'grains',
        stock: 50,
        supplierId: 's1',
        description: 'High protein chana dal'
      },
      {
        id: 'p4',
        name: 'Mustard Oil',
        price: 120,
        unit: 'liter',
        category: 'oils',
        stock: 30,
        supplierId: 's1',
        description: 'Pure mustard oil'
      }
    ];
    localStorage.setItem('vendorLinkProducts', JSON.stringify(products));
  }

  if (!localStorage.getItem('vendorLinkOrders')) {
    localStorage.setItem('vendorLinkOrders', JSON.stringify([]));
  }
}

// Get current user from session
function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem('currentUser'));
}

// Format price with currency symbol
function formatPrice(price) {
  return `₹${price.toFixed(2)}`;
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeDummyData();
});