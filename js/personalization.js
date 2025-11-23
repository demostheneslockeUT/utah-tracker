/**
 * Personalization - reads localStorage and customizes the experience
 */

const personalization = {
    user: null,
    
    init() {
        // Load user data
        const userData = localStorage.getItem('utah_tracker_user');
        if (userData) {
            this.user = JSON.parse(userData);
            this.applyPersonalization();
        }
        
        // Check for welcome redirect
        if (window.location.search.includes('welcome=true')) {
            this.showWelcomeMessage();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    },
    
    applyPersonalization() {
        if (!this.user) return;
        
        console.log('👤 Personalizing for:', this.user.name);
        
        // Auto-check their followed organizations in the filter
        if (this.user.organizations && this.user.organizations.length > 0) {
            setTimeout(() => {
                this.user.organizations.forEach(orgId => {
                    const checkbox = document.querySelector(`input[data-org-id="${orgId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                // Trigger filter update
                if (typeof filterByOrganization === 'function') {
                    filterByOrganization();
                }
            }, 500);
        }
        
        // Set their legislators based on ZIP
        if (this.user.zip && typeof contactSystem !== 'undefined') {
            // This will be handled by the contact system
            localStorage.setItem('user_zip', this.user.zip);
        }
    },
    
    showWelcomeMessage() {
        const name = this.user?.name || 'there';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-8 max-w-md text-center">
                <div class="text-5xl mb-4">🎉</div>
                <h2 class="text-2xl font-bold mb-2">Welcome, ${name}!</h2>
                <p class="text-gray-600 mb-4">Your personalized dashboard is ready.</p>
                
                <div class="bg-blue-50 rounded-lg p-4 mb-6 text-left text-sm">
                    <p class="font-semibold mb-2">What's personalized for you:</p>
                    <ul class="space-y-1">
                        <li>✓ Bills filtered to your followed organizations</li>
                        <li>✓ Your legislators auto-identified</li>
                        <li>✓ Your votes saved locally</li>
                    </ul>
                </div>
                
                <button onclick="this.closest('.fixed').remove()" 
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                    Start Exploring 🚀
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    isLoggedIn() {
        return !!this.user;
    },
    
    getUser() {
        return this.user;
    },
    
    logout() {
        localStorage.removeItem('utah_tracker_user');
        localStorage.removeItem('user_zip');
        localStorage.removeItem('followed_orgs');
        localStorage.removeItem('user_issues');
        this.user = null;
        window.location.reload();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    personalization.init();
});

// Show sign-up prompt for first-time visitors
function checkFirstTimeVisitor() {
    const hasVisited = localStorage.getItem('utah_tracker_visited');
    const hasUser = localStorage.getItem('utah_tracker_user');
    
    if (!hasVisited && !hasUser) {
        // First time visitor - show prompt after 10 seconds
        setTimeout(showSignUpPrompt, 10000);
        localStorage.setItem('utah_tracker_visited', 'true');
    }
}

function showSignUpPrompt() {
    // Don't show if already signed up
    if (localStorage.getItem('utah_tracker_user')) return;
    
    const banner = document.createElement('div');
    banner.id = 'signup-banner';
    banner.className = 'fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 z-50 shadow-lg';
    banner.innerHTML = `
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div>
                <strong>🎯 Get personalized bill tracking!</strong>
                <span class="ml-2 opacity-90">Filter by your issues & orgs, find your legislators</span>
            </div>
            <div class="flex gap-3">
                <a href="signup.html" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded">
                    Sign Up Free
                </a>
                <button onclick="document.getElementById('signup-banner').remove(); localStorage.setItem('signup_dismissed', 'true')" 
                        class="text-white/80 hover:text-white px-2">
                    ✕
                </button>
            </div>
        </div>
    `;
    
    // Don't show if dismissed
    if (!localStorage.getItem('signup_dismissed')) {
        document.body.appendChild(banner);
    }
}

// Run check
checkFirstTimeVisitor();
