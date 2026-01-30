// Data management utilities for FoodBridge

class FoodBridgeData {
    constructor() {
        this.initStorage();
    }
    
    initStorage() {
        // Initialize all data stores if they don't exist
        const stores = ['users', 'food', 'requests', 'feedback', 'volunteer_offers'];
        
        stores.forEach(store => {
            const key = `foodbridge_${store}`;
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    }
    
    // User management
    getAllUsers() {
        return JSON.parse(localStorage.getItem('foodbridge_users')) || [];
    }
    
    saveUser(user) {
        const users = this.getAllUsers();
        users.push(user);
        localStorage.setItem('foodbridge_users', JSON.stringify(users));
        return user;
    }
    
    findUserByPhone(phone) {
        const users = this.getAllUsers();
        return users.find(user => user.phone === phone);
    }
    
    // Food management
    getAllFood() {
        return JSON.parse(localStorage.getItem('foodbridge_food')) || [];
    }
    
    getAvailableFood(maxDistance = 20, userLocation = null) {
        const allFood = this.getAllFood();
        return allFood.filter(food => {
            // Filter by availability
            if (food.status !== 'available') return false;
            
            // Filter by distance if user location provided
            if (userLocation && food.distance) {
                const distance = parseFloat(food.distance);
                return !isNaN(distance) && distance <= maxDistance;
            }
            
            return true;
        });
    }
    
    updateFoodStatus(foodId, status) {
        const allFood = this.getAllFood();
        const index = allFood.findIndex(f => f.id === foodId);
        
        if (index !== -1) {
            allFood[index].status = status;
            localStorage.setItem('foodbridge_food', JSON.stringify(allFood));
            return true;
        }
        
        return false;
    }
    
    // Request management
    getAllRequests() {
        return JSON.parse(localStorage.getItem('foodbridge_requests')) || [];
    }
    
    getNGORequests(ngoId) {
        const requests = this.getAllRequests();
        return requests.filter(req => req.ngoId === ngoId);
    }
    
    saveRequest(request) {
        const requests = this.getAllRequests();
        requests.push(request);
        localStorage.setItem('foodbridge_requests', JSON.stringify(requests));
        return request;
    }
    
    updateRequestStatus(requestId, status, updates = {}) {
        const requests = this.getAllRequests();
        const index = requests.findIndex(req => req.id === requestId);
        
        if (index !== -1) {
            requests[index].status = status;
            Object.assign(requests[index], updates);
            localStorage.setItem('foodbridge_requests', JSON.stringify(requests));
            return true;
        }
        
        return false;
    }
    
    // Feedback management
    getAllFeedback() {
        return JSON.parse(localStorage.getItem('foodbridge_feedback')) || [];
    }
    
    saveFeedback(feedback) {
        const allFeedback = this.getAllFeedback();
        allFeedback.push(feedback);
        localStorage.setItem('foodbridge_feedback', JSON.stringify(allFeedback));
        return feedback;
    }
    
    getNGOFeedback(ngoId) {
        const feedback = this.getAllFeedback();
        return feedback.filter(fb => fb.ngoId === ngoId);
    }
    
    // Volunteer offers
    saveVolunteerOffer(offer) {
        const offers = JSON.parse(localStorage.getItem('foodbridge_volunteer_offers')) || [];
        offers.push(offer);
        localStorage.setItem('foodbridge_volunteer_offers', JSON.stringify(offers));
        return offer;
    }
    
    // Statistics
    getNGOStatistics(ngoId) {
        const requests = this.getNGORequests(ngoId);
        const feedback = this.getNGOFeedback(ngoId);
        
        const completed = requests.filter(req => req.status === 'completed').length;
        const emergency = requests.filter(req => req.emergency).length;
        
        let totalPeopleServed = 0;
        let totalRating = 0;
        
        feedback.forEach(fb => {
            totalPeopleServed += fb.peopleServed || 0;
            totalRating += parseInt(fb.rating) || 0;
        });
        
        const avgRating = feedback.length > 0 ? (totalRating / feedback.length).toFixed(1) : 0;
        
        return {
            totalRequests: requests.length,
            completedRequests: completed,
            emergencyRequests: emergency,
            totalPeopleServed: totalPeopleServed,
            averageRating: avgRating,
            estimatedFoodSaved: completed * 25 // kg
        };
    }
}

// Initialize data manager
const foodBridgeData = new FoodBridgeData();