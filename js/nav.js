/**
 * Shared Navigation Component
 * Update this file to change nav on ALL pages
 */

const NAV_CONFIG = {
    siteName: "🏛️ ezleut.com",
    links: [
        { href: "index.html", label: "Tracker", emoji: "📊" },
        { href: "legislators.html", label: "Legislators", emoji: "👔" },
        { href: "compare.html", label: "Compare", emoji: "⚖️" },
    ],
    cta: { href: "signup.html", label: "✨ Sign Up" }
};

function renderNav() {
    const nav = document.createElement('nav');
    nav.className = 'bg-white shadow-sm sticky top-0 z-50';
    nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-3">
            <div class="flex justify-between items-center">
                <a href="index.html" class="text-xl font-bold text-blue-600">${NAV_CONFIG.siteName}</a>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex gap-6 items-center">
                    ${NAV_CONFIG.links.map(link => 
                        `<a href="${link.href}" class="text-gray-700 hover:text-blue-600 font-medium">${link.label}</a>`
                    ).join('')}
                    <a href="${NAV_CONFIG.cta.href}" class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded">${NAV_CONFIG.cta.label}</a>
                </div>
                
                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden p-2 text-gray-700 hover:text-blue-600" onclick="toggleMobileMenu()">
                    <svg id="menu-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4 border-t border-gray-200">
                <div class="flex flex-col gap-3 pt-4">
                    ${NAV_CONFIG.links.map(link => 
                        `<a href="${link.href}" class="text-gray-700 hover:text-blue-600 font-medium py-2">${link.emoji} ${link.label}</a>`
                    ).join('')}
                    <a href="${NAV_CONFIG.cta.href}" class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-3 rounded text-center mt-2">${NAV_CONFIG.cta.label} Free</a>
                </div>
            </div>
        </div>
    `;
    
    // Insert at start of body
    document.body.insertBefore(nav, document.body.firstChild);
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    menu.classList.toggle('hidden');
    menuIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');
}

// Auto-render when script loads
document.addEventListener('DOMContentLoaded', renderNav);
