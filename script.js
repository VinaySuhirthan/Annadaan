// FoodBridge System - Main JavaScript

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize data storage
    initDataStorage();
    
    // Setup login/register tabs
    setupTabs();
    
    // Setup form submissions
    setupForms();
}

function initDataStorage() {
    // Initialize users if not exists
    if (!localStorage.getItem('foodbridge_users')) {
        localStorage.setItem('foodbridge_users', JSON.stringify([]));
    }
    
    // Initialize food items if not exists
    if (!localStorage.getItem('foodbridge_food')) {
        initSampleFoodData();
    }
    
    // Initialize requests if not exists
    if (!localStorage.getItem('foodbridge_requests')) {
        localStorage.setItem('foodbridge_requests', JSON.stringify([]));
    }
}

function initSampleFoodData() {
    const sampleFood = [
        {
            id: 'F001',
            restaurant: 'Green Valley Restaurant',
            foodType: 'Vegetarian Meals',
            quantity: '50 plates',
            availableUntil: 'Today, 8:00 PM',
            location: 'Downtown, City Center',
            coordinates: { lat: 12.9716, lng: 77.5946 },
            distance: '1.2 km',
            status: 'available',
            description: 'Fresh vegetarian meals including rice, dal, vegetables, and chapati',
            category: 'vegetarian',
            serves: 50
        },
        {
            id: 'F002',
            restaurant: 'Royal Palace Hotel',
            foodType: 'Mixed Buffet',
            quantity: '80 plates',
            availableUntil: 'Today, 9:30 PM',
            location: 'East Side, Suburb Area',
            coordinates: { lat: 12.9816, lng: 77.6046 },
            distance: '3.5 km',
            status: 'available',
            description: 'Hotel buffet leftovers - variety of dishes',
            category: 'non-vegetarian',
            serves: 80
        },
        {
            id: 'F003',
            restaurant: 'Bakery Delight',
            foodType: 'Bread & Pastries',
            quantity: '100 pieces',
            availableUntil: 'Today, 7:00 PM',
            location: 'West End, Commercial Area',
            coordinates: { lat: 12.9616, lng: 77.5846 },
            distance: '5.1 km',
            status: 'available',
            description: 'Fresh bread, buns, and pastries from today\'s batch',
            category: 'bakery',
            serves: 50
        },
        {
            id: 'F004',
            restaurant: 'Ocean View Restaurant',
            foodType: 'Seafood & Rice',
            quantity: '40 plates',
            availableUntil: 'Tomorrow, 12:00 PM',
            location: 'Harbor Front',
            coordinates: { lat: 12.9916, lng: 77.6246 },
            distance: '8.7 km',
            status: 'available',
            description: 'Seafood platters with rice and sides',
            category: 'non-vegetarian',
            serves: 40
        },
        {
            id: 'F005',
            restaurant: 'Pizza Palace',
            foodType: 'Pizzas',
            quantity: '30 boxes',
            availableUntil: 'Today, 10:00 PM',
            location: 'North Park, Residential Area',
            coordinates: { lat: 12.9516, lng: 77.5746 },
            distance: '12.3 km',
            status: 'available',
            description: 'Large pizzas - various toppings',
            category: 'non-vegetarian',
            serves: 60
        },
        {
            id: 'F006',
            restaurant: 'Healthy Bites Cafe',
            foodType: 'Salads & Wraps',
            quantity: '35 packs',
            availableUntil: 'Today, 6:30 PM',
            location: 'Central Business District',
            coordinates: { lat: 12.9710, lng: 77.6000 },
            distance: '2.1 km',
            status: 'available',
            description: 'Fresh salads and healthy wraps',
            category: 'vegetarian',
            serves: 35
        },
        {
            id: 'F007',
            restaurant: 'Tandoori Nights',
            foodType: 'Indian Cuisine',
            quantity: '60 plates',
            availableUntil: 'Today, 9:00 PM',
            location: 'Little India Area',
            coordinates: { lat: 12.9660, lng: 77.5800 },
            distance: '4.8 km',
            status: 'available',
            description: 'North Indian dishes with naan and rice',
            category: 'vegetarian',
            serves: 60
        },
        {
            id: 'F008',
            restaurant: 'Burger Junction',
            foodType: 'Burgers & Fries',
            quantity: '45 meals',
            availableUntil: 'Today, 11:00 PM',
            location: 'Food Court, Mall Road',
            coordinates: { lat: 12.9760, lng: 77.5900 },
            distance: '6.2 km',
            status: 'available',
            description: 'Burgers, fries, and soft drinks',
            category: 'non-vegetarian',
            serves: 45
        },
        {
            id: 'F009',
            restaurant: 'Sweet Corner',
            foodType: 'Desserts',
            quantity: '70 pieces',
            availableUntil: 'Tomorrow, 10:00 AM',
            location: 'Market Street',
            coordinates: { lat: 12.9650, lng: 77.5950 },
            distance: '3.9 km',
            status: 'available',
            description: 'Cakes, pastries, and sweets',
            category: 'bakery',
            serves: 35
        },
        {
            id: 'F010',
            restaurant: 'Chinese Dragon',
            foodType: 'Chinese Food',
            quantity: '55 plates',
            availableUntil: 'Today, 8:30 PM',
            location: 'Chinatown',
            coordinates: { lat: 12.9860, lng: 77.6100 },
            distance: '15.3 km',
            status: 'available',
            description: 'Noodles, fried rice, and Manchurian',
            category: 'non-vegetarian',
            serves: 55
        }
    ];
    
    localStorage.setItem('foodbridge_food', JSON.stringify(sampleFood));
}

function setupTabs() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerType = document.getElementById('register-type');
    const volunteerFields = document.getElementById('volunteer-fields');
    const ngoFields = document.getElementById('ngo-fields');

    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }

    if (registerType) {
        registerType.addEventListener('change', function() {
            const type = this.value;
            volunteerFields.style.display = type === 'volunteer' ? 'block' : 'none';
            ngoFields.style.display = type === 'ngo' ? 'block' : 'none';
        });
    }
}

function setupForms() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('login-phone').value.trim();
            const userType = document.getElementById('user-type').value;
            
            if (!validatePhone(phone)) {
                showAlert('Please enter a valid 10-digit phone number', 'error');
                return;
            }
            
            if (!userType) {
                showAlert('Please select user type', 'error');
                return;
            }
            
            const user = authenticateUser(phone, userType);
            
            if (user) {
                setCurrentUser(user);
                showAlert('Login successful!', 'success');
                
                setTimeout(() => {
                    if (user.type === 'ngo') {
                        window.location.href = 'ngo-dashboard.html';
                    } else {
                        window.location.href = 'volunteer-dashboard.html';
                    }
                }, 1000);
            } else {
                showAlert('User not found. Please register first.', 'error');
            }
        });
    }
    
    // Registration Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const type = document.getElementById('register-type').value;
            
            if (type === 'volunteer') {
                registerVolunteer();
            } else if (type === 'ngo') {
                registerNGO();
            } else {
                showAlert('Please select registration type', 'error');
            }
        });
    }
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
}

function authenticateUser(phone, type) {
    const users = JSON.parse(localStorage.getItem('foodbridge_users'));
    return users.find(user => user.phone === phone && user.type === type);
}

function registerVolunteer() {
    const name = document.getElementById('vol-name').value.trim();
    const address = document.getElementById('vol-address').value.trim();
    const phone = document.getElementById('vol-phone').value.trim();
    const location = document.getElementById('vol-location').value.trim();
    
    // Validation
    if (!name || !address || !phone || !location) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showAlert('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Check if user already exists
    const existingUser = authenticateUser(phone, 'volunteer');
    if (existingUser) {
        showAlert('Volunteer with this phone already exists', 'error');
        return;
    }
    
    // Create volunteer object
    const volunteer = {
        id: 'V' + Date.now(),
        type: 'volunteer',
        name: name,
        address: address,
        phone: phone,
        location: location,
        registeredAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Save user
    saveUser(volunteer);
    
    showAlert('Volunteer registration successful!', 'success');
    
    setTimeout(() => {
        setCurrentUser(volunteer);
        window.location.href = 'volunteer-dashboard.html';
    }, 1500);
}

function registerNGO() {
    const name = document.getElementById('ngo-name').value.trim();
    const orgId = document.getElementById('ngo-id').value.trim();
    const head = document.getElementById('ngo-head').value.trim();
    const address = document.getElementById('ngo-address').value.trim();
    const phone = document.getElementById('ngo-phone').value.trim();
    const location = document.getElementById('ngo-location').value.trim();
    
    // Validation
    if (!name || !orgId || !head || !address || !phone || !location) {
        showAlert('Please fill all fields', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showAlert('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Check if NGO already exists
    const existingUser = authenticateUser(phone, 'ngo');
    if (existingUser) {
        showAlert('NGO with this phone already exists', 'error');
        return;
    }
    
    // Create NGO object
    const ngo = {
        id: 'N' + Date.now(),
        type: 'ngo',
        name: name,
        orgId: orgId,
        head: head,
        address: address,
        phone: phone,
        location: location,
        registeredAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Save user
    saveUser(ngo);
    
    showAlert('NGO registration successful!', 'success');
    
    setTimeout(() => {
        setCurrentUser(ngo);
        window.location.href = 'ngo-dashboard.html';
    }, 1500);
}

function saveUser(user) {
    const users = JSON.parse(localStorage.getItem('foodbridge_users'));
    users.push(user);
    localStorage.setItem('foodbridge_users', JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function logout() {
    localStorage.removeItem('currentUser');
    showAlert('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#D1FAE5' : type === 'error' ? '#FEE2E2' : '#DBEAFE'};
        color: ${type === 'success' ? '#065F46' : type === 'error' ? '#991B1B' : '#1E40AF'};
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    `;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    alertDiv.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Calculate distance between coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Filter food within 20km radius
function filterFoodByDistance(foodItems, userLocation, maxDistance = 20) {
    if (!userLocation) return foodItems;
    
    // For demo, we'll use the distance property
    // In real app, you would calculate actual distance using coordinates
    return foodItems.filter(food => {
        const distance = parseFloat(food.distance);
        return !isNaN(distance) && distance <= maxDistance;
    });
}

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Check if user is logged in
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// Load user info on dashboard
function loadUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userType = document.getElementById('user-type');
    const userLocation = document.getElementById('user-location');
    
    if (userAvatar) {
        userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
    
    if (userName) {
        userName.textContent = user.name;
    }
    
    if (userType) {
        userType.textContent = user.type === 'ngo' ? 'NGO' : 'Volunteer';
    }
    
    if (userLocation) {
        userLocation.textContent = user.location || 'Location not set';
    }
}