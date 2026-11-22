// FoodBridge System - Main JavaScript

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
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
        registerType.addEventListener('change', function () {
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
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const identifier = document.getElementById('login-phone').value.trim();
            const userType = document.getElementById('user-type').value;
            const pwdInput = document.getElementById('login-pwd');
            const password = pwdInput ? pwdInput.value.trim() : '';

            if (!identifier || !userType) {
                showAlert('Please fill all fields', 'error');
                return;
            }

            // Check if Supabase is available
            if (!window.sb) {
                showAlert('Database connection not available. Please check your internet connection.', 'error');
                return;
            }

            const tableName = userType === 'ngo' ? 'ngo_table' : 'volunteer_table';

            // Scenario A: Email & Password provided
            if (password && identifier.includes('@')) {
                try {
                    const { data: authData, error: authErr } = await window.sb.auth.signInWithPassword({
                        email: identifier,
                        password: password
                    });

                    if (authErr) {
                        showAlert('Login failed: ' + authErr.message, 'error');
                        return;
                    }

                    // Look up profile by email or auth_id
                    const { data: profile } = await window.sb.from(tableName)
                        .select('*')
                        .or(`email.eq.${identifier},auth_id.eq.${authData.user.id}`)
                        .single();

                    const userSession = profile || {
                        id: authData.user.id,
                        name: authData.user.user_metadata?.full_name || identifier.split('@')[0],
                        email: identifier,
                        type: userType,
                        phone: authData.user.user_metadata?.phone || ''
                    };

                    setCurrentUser(userSession);
                    showAlert('Login successful!', 'success');
                    const dashboard = userType === 'ngo'
                        ? appPath('volunteer/ngo-dashboard.html')
                        : appPath('volunteer/volunteer-dashboard.html');
                    setTimeout(() => { window.location.href = dashboard; }, 800);
                    return;
                } catch (err) {
                    console.error('Email login exception:', err);
                    showAlert('Login error: ' + err.message, 'error');
                    return;
                }
            }

            // Scenario B: Phone Number Authentication
            if (!validatePhone(identifier)) {
                showAlert('Please enter a valid 10-digit phone number or email address', 'error');
                return;
            }

            try {
                console.log(`Authenticating ${userType} from Supabase ${tableName}...`);

                const { data, error } = await window.sb.from(tableName)
                    .select('*')
                    .eq('phone', identifier)
                    .eq('type', userType)
                    .single();

                if (error) {
                    console.error('Supabase login error:', error);

                    if (error.code === 'PGRST116') {
                        showAlert('No account found with this phone number. Please register first.', 'error');
                    } else {
                        showAlert('Login failed: ' + error.message, 'error');
                    }
                    return;
                }

                if (!data) {
                    showAlert('No account found with this phone number. Please register first.', 'error');
                    return;
                }

                console.log('✅ User authenticated from Supabase:', data);
                setCurrentUser(data);

                const dashboard = userType === 'ngo'
                    ? appPath('volunteer/ngo-dashboard.html')
                    : appPath('volunteer/volunteer-dashboard.html');

                showAlert('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = dashboard;
                }, 800);

            } catch (err) {
                console.error('Login failed:', err);
                showAlert('Login failed: ' + err.message, 'error');
            }
        });
    }

    // Registration Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
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

async function registerVolunteer() {
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

    // Check if volunteer already exists in Supabase
    if (window.sb) {
        try {
            const { data: existing } = await window.sb.from('volunteer_table')
                .select('phone')
                .eq('phone', phone)
                .single();

            if (existing) {
                showAlert('Volunteer with this phone already exists', 'error');
                return;
            }
        } catch (err) {
            // If error.code is 'PGRST116' (no rows found), it's not an error, just means user doesn't exist.
            // For other errors, log them but allow registration to proceed if it's not a conflict.
            if (err.code !== 'PGRST116') {
                console.error('Supabase check for existing volunteer error:', err);
            }
        }
    }

    // Create volunteer object
    const email = document.getElementById('reg-email') ? document.getElementById('reg-email').value.trim() : '';
    const password = document.getElementById('reg-password') ? document.getElementById('reg-password').value.trim() : '';

    let authUserId = null;
    if (email && password && window.sb && window.sb.auth) {
        try {
            const { data: authData, error: authErr } = await window.sb.auth.signUp({
                email,
                password,
                options: { data: { full_name: name, phone } }
            });
            if (!authErr && authData && authData.user) {
                authUserId = authData.user.id;
            }
        } catch (e) {
            console.warn('Supabase Auth sign up note:', e);
        }
    }

    const volunteer = {
        id: 'V' + Date.now(),
        type: 'volunteer',
        name: name,
        address: address,
        phone: phone,
        location: location,
        email: email || null,
        auth_id: authUserId || null,
        registered_at: new Date().toISOString(),
        status: 'active'
    };

    console.log('Registering volunteer to Supabase:', volunteer);

    // Save to Supabase ONLY
    if (!window.sb) {
        showAlert('Database connection not available. Please check your internet connection.', 'error');
        return;
    }

    try {
        const { data, error } = await window.sb.from('volunteer_table').insert([volunteer]).select();

        if (error) {
            console.error('❌ Supabase volunteer insert error:', error);

            let errorMsg = 'Registration failed: ' + error.message;
            if (error.code === '42P01') {
                errorMsg = 'Database table not found. Please contact administrator.';
            } else if (error.code === '23505') { // Unique constraint violation
                errorMsg = 'A volunteer with this phone number already exists.';
            } else if (error.hint) {
                errorMsg += '\n\n' + error.hint;
            }

            showAlert(errorMsg, 'error');
            return;
        }

        console.log('✅ Volunteer saved to Supabase successfully:', data);

        // Set current user from Supabase data
        setCurrentUser(data[0]);

        showAlert('Volunteer registration successful!', 'success');

        setTimeout(() => {
            window.location.href = appPath('volunteer/volunteer-dashboard.html');
        }, 1500);

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        showAlert('Registration failed: ' + err.message, 'error');
    }
}


async function registerNGO() {
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

    // Check if NGO already exists in Supabase
    if (window.sb) {
        try {
            const { data: existing } = await window.sb.from('ngo_table')
                .select('phone')
                .eq('phone', phone)
                .single();

            if (existing) {
                showAlert('NGO with this phone already exists', 'error');
                return;
            }
        } catch (err) {
            // If error.code is 'PGRST116' (no rows found), it's not an error, just means user doesn't exist.
            // For other errors, log them but allow registration to proceed if it's not a conflict.
            if (err.code !== 'PGRST116') {
                console.error('Supabase check for existing NGO error:', err);
                // Optionally, you could show an alert here if you want to block registration on any DB error
                // showAlert('Error checking for existing NGO. Please try again.', 'error');
                // return;
            }
        }
    }


    // Create NGO object
    const ngoEmail = document.getElementById('reg-email') ? document.getElementById('reg-email').value.trim() : '';
    const ngoPassword = document.getElementById('reg-password') ? document.getElementById('reg-password').value.trim() : '';

    let ngoAuthId = null;
    if (ngoEmail && ngoPassword && window.sb && window.sb.auth) {
        try {
            const { data: authData, error: authErr } = await window.sb.auth.signUp({
                email: ngoEmail,
                password: ngoPassword,
                options: { data: { full_name: name, phone } }
            });
            if (!authErr && authData && authData.user) {
                ngoAuthId = authData.user.id;
            }
        } catch (e) {
            console.warn('Supabase Auth NGO sign up note:', e);
        }
    }

    const ngo = {
        id: 'N' + Date.now(),
        type: 'ngo',
        name: name,
        org_id: orgId,
        head: head,
        address: address,
        phone: phone,
        location: location,
        email: ngoEmail || null,
        auth_id: ngoAuthId || null,
        registered_at: new Date().toISOString(),
        status: 'active'
    };

    console.log('Registering NGO to Supabase:', ngo);

    // Save to Supabase ONLY
    if (!window.sb) {
        showAlert('Database connection not available. Please check your internet connection.', 'error');
        return;
    }

    try {
        const { data, error } = await window.sb.from('ngo_table').insert([ngo]).select();

        if (error) {
            console.error('❌ Supabase NGO insert error:', error);

            let errorMsg = 'Registration failed: ' + error.message;
            if (error.code === '42P01') {
                errorMsg = 'Database table not found. Please contact administrator.';
            } else if (error.code === '23505') { // Unique constraint violation
                errorMsg = 'An NGO with this phone number already exists.';
            } else if (error.hint) {
                errorMsg += '\n\n' + error.hint;
            }

            showAlert(errorMsg, 'error');
            return;
        }

        console.log('✅ NGO saved to Supabase successfully:', data);

        // Set current user from Supabase data
        setCurrentUser(data[0]);

        showAlert('NGO registration successful!', 'success');

        setTimeout(() => {
            window.location.href = appPath('volunteer/ngo-dashboard.html');
        }, 1500);

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        showAlert('Registration failed: ' + err.message, 'error');
    }
}

function saveUser(user) {
    const users = JSON.parse(localStorage.getItem('foodbridge_users'));
    users.push(user);
    localStorage.setItem('foodbridge_users', JSON.stringify(users));
}

function setCurrentUser(user) {
    if (window.AnnadaanAuth) {
        window.AnnadaanAuth.startSession(user, user.type || 'volunteer');
    } else {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('annadaan_session_start', Date.now().toString());
    }
}

function getCurrentUser() {
    if (window.AnnadaanAuth && window.AnnadaanAuth.isSessionExpired()) {
        const user = localStorage.getItem('currentUser');
        if (user) {
            window.AnnadaanAuth.signOut(true, "Your session has expired. Please sign in again.");
            return null;
        }
    }
    return JSON.parse(localStorage.getItem('currentUser'));
}

function appPath(path) {
    const currentPath = window.location.pathname.replace(/\\/g, '/');
    const isInsideRoleFolder = /\/(donor|volunteer)\//.test(currentPath);
    return isInsideRoleFolder ? `../${path}` : path;
}

async function logout() {
    const confirmed = typeof showConfirm !== 'undefined' 
        ? await showConfirm('Are you sure you want to logout?') 
        : confirm('Are you sure you want to logout?');
    if (confirmed) {
        if (window.AnnadaanAuth) {
            await window.AnnadaanAuth.signOut(false, "You have been safely signed out.");
        } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('donor');
            localStorage.removeItem('annadaan_session_start');
            window.location.href = appPath('index.html');
        }
    }
}

function showAlert(message, type = 'info') {
    return new Promise((resolve) => {
        // Remove existing modals
        const existingModals = document.querySelectorAll('.custom-modal-overlay');
        existingModals.forEach(modal => modal.remove());

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        // Icon selection
        const iconClass = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        const iconColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
        const btnColor = type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : '#2563EB';

        overlay.innerHTML = `
            <div class="custom-modal-card">
                <div class="modal-icon" style="color: ${iconColor}">
                    <i class="fas fa-${iconClass}"></i>
                </div>
                <p class="modal-message">${message}</p>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-primary" id="modal-ok-btn">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const okBtn = overlay.querySelector('#modal-ok-btn');
        okBtn.style.backgroundColor = btnColor;

        okBtn.onclick = () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 200);
        };

        // Auto focus
        okBtn.focus();

        injectModalStyles();
    });
}

function showConfirm(message) {
    return new Promise((resolve) => {
        const existingModals = document.querySelectorAll('.custom-modal-overlay');
        existingModals.forEach(modal => modal.remove());

        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        overlay.innerHTML = `
            <div class="custom-modal-card">
                <div class="modal-icon" style="color: #F59E0B">
                    <i class="fas fa-question-circle"></i>
                </div>
                <p class="modal-message">${message}</p>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-secondary" id="modal-cancel-btn">No</button>
                    <button class="modal-btn modal-btn-primary" id="modal-confirm-btn">Yes</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const confirmBtn = overlay.querySelector('#modal-confirm-btn');
        const cancelBtn = overlay.querySelector('#modal-cancel-btn');

        confirmBtn.onclick = () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                resolve(true);
            }, 200);
        };

        cancelBtn.onclick = () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                resolve(false);
            }, 200);
        };

        // Auto focus confirm
        confirmBtn.focus();

        injectModalStyles();
    });
}

function showPrompt(message, placeholder = '') {
    return new Promise((resolve) => {
        const existingModals = document.querySelectorAll('.custom-modal-overlay');
        existingModals.forEach(modal => modal.remove());

        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        overlay.innerHTML = `
            <div class="custom-modal-card">
                <div class="modal-icon" style="color: #3B82F6">
                    <i class="fas fa-keyboard"></i>
                </div>
                <p class="modal-message">${message}</p>
                <input type="text" class="modal-input" placeholder="${placeholder}" id="modal-input-field">
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-secondary" id="modal-cancel-btn">Cancel</button>
                    <button class="modal-btn modal-btn-primary" id="modal-submit-btn">Submit</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const input = overlay.querySelector('#modal-input-field');
        const submitBtn = overlay.querySelector('#modal-submit-btn');
        const cancelBtn = overlay.querySelector('#modal-cancel-btn');

        const submit = () => {
            const value = input.value;
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                resolve(value);
            }, 200);
        };

        const cancel = () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                resolve(null);
            }, 200);
        };

        submitBtn.onclick = submit;
        cancelBtn.onclick = cancel;

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') cancel();
        });

        input.focus();

        injectModalStyles();
    });
}

function injectModalStyles() {
    if (document.getElementById('custom-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'custom-modal-styles';
    style.textContent = `
        .custom-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.2s ease-out;
        }

        .custom-modal-overlay.fade-out {
            animation: fadeOut 0.2s ease-in forwards;
        }

        .custom-modal-card {
            background: white;
            padding: 30px 40px;
            border-radius: 20px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            text-align: center;
            max-width: 90%;
            width: 400px;
            transform: scale(0.9);
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .modal-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        .modal-message {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 25px;
            line-height: 1.5;
            font-weight: 500;
        }

        .modal-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            margin-bottom: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.2s;
        }

        .modal-input:focus {
            border-color: #3B82F6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .modal-btn {
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            border: none;
            flex: 1;
        }

        .modal-btn-primary {
            background: #1f2937;
            color: white;
        }

        .modal-btn-secondary {
            background: #F3F4F6;
            color: #4B5563;
        }

        .modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @keyframes popIn {
            to { transform: scale(1); }
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
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
        window.location.href = appPath('index.html');
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
