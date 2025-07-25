// Authentication logic for login and registration

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const registerLink = document.getElementById('registerLink');
  const vendorToggle = document.getElementById('vendorToggle');
  const supplierToggle = document.getElementById('supplierToggle');
  
  // Check URL for role parameter
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  
  if (roleParam === 'vendor') {
    vendorToggle.click();
  } else if (roleParam === 'supplier') {
    supplierToggle.click();
  }
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.querySelector('.role-btn.active').textContent.toLowerCase();
      
      const users = JSON.parse(localStorage.getItem('vendorLinkUsers')) || [];
      const user = users.find(u => u.email === email && u.password === password && u.role === role);
      
      if (user) {
        // Store user in session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect to appropriate dashboard
        if (user.role === 'vendor') {
          window.location.href = 'vendor-dashboard.html';
        } else {
          window.location.href = 'supplier-dashboard.html';
        }
      } else {
        showAlert('Invalid email, password, or role', 'error');
      }
    });
  }
  
  // Handle role toggle
  if (vendorToggle && supplierToggle) {
    vendorToggle.addEventListener('click', function() {
      vendorToggle.classList.add('active');
      supplierToggle.classList.remove('active');
    });
    
    supplierToggle.addEventListener('click', function() {
      supplierToggle.classList.add('active');
      vendorToggle.classList.remove('active');
    });
  }
  
  // Handle register link
  if (registerLink) {
    registerLink.addEventListener('click', function(e) {
      e.preventDefault();
      showAlert('Registration feature will be implemented in the next version', 'info');
    });
  }
});