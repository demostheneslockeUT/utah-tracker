/**
 * Dynamic Header and Footer Components
 * Ensures consistency across all pages
 */

function getBasePath() {
    // Detect if we're in a subdirectory
    const path = window.location.pathname;
    if (path.includes('/quiz/') || path.includes('/blog/') || path.includes('/tools/')) {
        return '../';
    }
    return '';
}

function renderHeader() {
    const base = getBasePath();
    
    return `
    <nav class="bg-blue-900 shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-3">
            <div class="flex justify-between items-center">
                <a href="${base}index.html" class="text-xl font-bold text-yellow-400">🏛️ ezleut.com</a>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex gap-6 items-center">
                    <a href="${base}index.html" class="text-yellow-400 hover:text-white font-medium">Tracker</a>
                    <a href="${base}blog/which-rung.html" class="text-yellow-400 hover:text-white font-medium">Blog</a>
                    <a href="${base}legislators.html" class="text-yellow-400 hover:text-white font-medium">Legislators</a>
                    <a href="${base}compare.html" class="text-yellow-400 hover:text-white font-medium">Compare</a>
                    <a href="${base}signup.html" class="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-4 py-2 rounded">✨ Sign Up</a>
                </div>
                
                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden p-2 text-yellow-400 hover:text-white" onclick="toggleMobileMenu()">
                    <svg id="menu-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
            </div>
            
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4 border-t border-blue-700">
                <div class="flex flex-col gap-3 pt-4">
                    <a href="${base}index.html" class="text-yellow-400 hover:text-white font-medium py-2">📊 Tracker</a>
                    <a href="${base}blog/which-rung.html" class="text-yellow-400 hover:text-white font-medium py-2">📝 Blog</a>
                    <a href="${base}legislators.html" class="text-yellow-400 hover:text-white font-medium py-2">👔 Legislators</a>
                    <a href="${base}compare.html" class="text-yellow-400 hover:text-white font-medium py-2">⚖️ Compare</a>
                    <a href="${base}signup.html" class="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-4 py-3 rounded text-center mt-2">✨ Sign Up</a>
                </div>
            </div>
        </div>
    </nav>
    `;
}

function renderFooter() {
    return `
    <footer class="bg-blue-900 text-yellow-400 py-8 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="mb-2 font-semibold">Utah Legislative Bill Tracker</p>
            <p class="text-sm text-yellow-200">Helping Utah citizens understand what their legislature is doing</p>
            <p class="text-xs text-yellow-300 mt-4">Data updated from pipeline runs • Not affiliated with Utah Legislature</p>
            <p class="text-xs text-yellow-300 mt-2">
                <a href="mailto:demostheneslockeUT@proton.me" class="hover:text-white underline">Contact</a>
            </p>
        </div>
    </footer>
    `;
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Render header
    const headerEl = document.getElementById('site-header');
    if (headerEl) {
        headerEl.innerHTML = renderHeader();
    }
    
    // Render footer
    const footerEl = document.getElementById('site-footer');
    if (footerEl) {
        footerEl.innerHTML = renderFooter();
    }
});

// Make toggleMobileMenu available globally
window.toggleMobileMenu = toggleMobileMenu;
