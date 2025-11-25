

// Mobile filter toggle
function toggleFilters() {
    const content = document.getElementById("filter-content");
    const arrow = document.getElementById("filter-arrow");
    
    if (content.classList.contains("hidden")) {
        content.classList.remove("hidden");
        arrow.classList.remove("rotate-180");
    } else {
        content.classList.add("hidden");
        arrow.classList.add("rotate-180");
    }
}

// Format bill number: HB0022 → HB22
function formatBillNumber(billNum) {
    if (!billNum) return '';
    // Remove leading zeros after the letters
    return billNum.replace(/([A-Z]+)0+/, '$1');
}

// Generate author position box HTML
function getAuthorPositionBox(position) {
    if (!position) return "";
    
    const icon = position === "Support" ? "✅" : position === "Oppose" ? "❌" : "⚪";
    const bgClass = "bg-purple-500 text-white";
    
    return `
        <div class="group relative">
            <div class="w-10 h-10 rounded-lg shadow-lg flex items-center justify-center text-lg font-bold border-2 border-purple-600 ${bgClass}">
                ${icon}
            </div>
            <div class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Author: ${position}
            </div>
        </div>
    `;
}


// State
let allBills = [];
let selectedOrgs = new Set();
let organizations = [];

// Build org lookup map from organizations array (loaded from bills.json)
function buildOrgMap() {
    const map = {};
    for (const org of organizations) {
        map[org.field_name] = {
            emoji: org.emoji,
            name: org.name
        };
    }
    return map;
}

// Get all org field names
function getOrgFieldNames() {
    return organizations.map(org => org.field_name);
}

// Load data
document.addEventListener('DOMContentLoaded', () => {
    loadBills();
    setupEventListeners();
});

async function loadBills() {
    try {
        const response = await fetch('data/bills.json');
        const data = await response.json();
        
        allBills = data.bills;
        window.allBills = allBills;  // Make globally accessible
        organizations = data.organizations || [];
        
        console.log(`Loaded ${allBills.length} bills`);
        console.log(`Organizations:`, organizations);
        
        updateStats(data.stats);
        buildOrgFilters();
        displayBills(allBills);
        
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Error loading bills:', error);
        document.getElementById('loading').innerHTML = 
            '<div class="text-red-600">Error loading bills. Please refresh.</div>';
    }
}

function updateStats(stats) {
    document.getElementById('stat-total').textContent = stats.total_bills || 0;
    document.getElementById('stat-positions').textContent = stats.bills_with_positions || 0;
    document.getElementById('stat-controversial').textContent = stats.controversial || 0;
    document.getElementById('stat-agreement').textContent = stats.high_agreement || 0;
}

function displayBills(bills) {
    const container = document.getElementById('bills-container');
    
    if (bills.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-600 py-12">No bills found matching filters</div>';
        return;
    }
    
    container.innerHTML = bills.map(bill => createBillCard(bill)).join('');
}

function getPositions(bill) {
    // Dynamically find all position fields in this bill
    const positions = [];
    
    // Org display names (emoji + short name)
    const orgDisplay = buildOrgMap();
    
    // Find all position fields dynamically
    for (const [key, value] of Object.entries(bill)) {
        if (key.endsWith('_position') && key !== 'author_position' && value && value !== '' && value !== 'N/A') {
            const orgKey = key.replace('_position', '');
            const display = orgDisplay[orgKey] || { emoji: '📋', name: orgKey };
            positions.push({
                org: orgKey,
                emoji: display.emoji,
                name: display.name,
                position: value
            });
        }
    }
    
    // Sort: Oppose first, then Support, then Watching
    const order = { 'Oppose': 0, 'Support': 1, 'Watching': 2, 'Studying': 3 };
    positions.sort((a, b) => (order[a.position] ?? 99) - (order[b.position] ?? 99));
    
    return positions;
}

function renderPositionBubbles(positions, billNumber) {
    if (!positions || positions.length === 0) {
        return '<span class="text-gray-400 text-sm">No org positions</span>';
    }
    
    // Separate by type
    const oppose = positions.filter(p => p.position === 'Oppose');
    const support = positions.filter(p => p.position === 'Support');
    const watching = positions.filter(p => p.position === 'Watching' || p.position === 'Studying');
    
    // Show oppose and support always
    const mainPositions = [...oppose, ...support];
    const hasWatching = watching.length > 0;
    const totalMain = mainPositions.length;
    
    let html = '<div class="flex flex-wrap gap-1">';
    
    // Render main positions (oppose + support)
    mainPositions.forEach(pos => {
        const colorClass = pos.position === 'Oppose' 
            ? 'bg-red-100 text-red-700 border-red-300' 
            : 'bg-green-100 text-green-700 border-green-300';
        html += `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${colorClass}">
            ${pos.emoji} ${pos.name}
        </span>`;
    });
    
    // Show watching only if 5 or fewer total, otherwise collapse
    if (hasWatching) {
        if (totalMain + watching.length <= 5) {
            // Show all watching
            watching.forEach(pos => {
                html += `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-blue-100 text-blue-700 border-blue-300">
                    ${pos.emoji} ${pos.name}
                </span>`;
            });
        } else {
            // Collapse watching into expandable
            html += `<button onclick="toggleWatching('${billNumber}')" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200">
                +${watching.length} watching
            </button>`;
            html += `<div id="watching-${billNumber}" class="hidden flex flex-wrap gap-1 mt-1 w-full">`;
            watching.forEach(pos => {
                html += `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-blue-100 text-blue-700 border-blue-300">
                    ${pos.emoji} ${pos.name}
                </span>`;
            });
            html += `</div>`;
        }
    }
    
    html += '</div>';
    return html;
}

function toggleWatching(billNumber) {
    const el = document.getElementById('watching-' + billNumber);
    if (el) {
        el.classList.toggle('hidden');
    }
}

// Make toggleWatching global
window.toggleWatching = toggleWatching;

function createBillCard(bill) {
    const positions = getPositions(bill);
    const positionBubbles = renderPositionBubbles(positions, bill.bill_number);
    const statusColor = getStatusColor(bill.status);
    
    let positionsHTML = "";
    if (positions.length > 0) {
        positionsHTML += positionBubbles;
    }
    
    if (!positionsHTML) {
        positionsHTML = '<div class="text-gray-400 text-xs mt-3">No positions tracked</div>';
    }
    
    return `
        <div class="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 p-6 border-l-4 ${statusColor} relative">
            <div class="flex justify-between items-center mb-3">
                <a href="bill.html?bill=${bill.bill_number}" class="text-xl font-bold text-blue-600 hover:text-blue-800">
                    ${formatBillNumber(bill.bill_number)}
                </a>
                <span class="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 bg-gray-100 rounded z-10">${bill.status || 'Filed'}</span>
            </div>
            
            <p class="text-gray-700 mb-4 line-clamp-2 text-sm">${bill.title || ''}</p>
            
            ${positionsHTML}
            
            <!-- Contact Legislator About Bill -->
            <div class="mt-3 pt-3 border-t">
                <button 
                    onclick="contactLegislatorAboutBill('${formatBillNumber(bill.bill_number)}', event)" 
                    class="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center gap-2"
                    id="contact-btn-${formatBillNumber(bill.bill_number)}">
                    📧 Contact my legislator about this bill
                </button>
                <div class="text-xs text-gray-500 mt-1">
                    ${bill.floor_sponsor ? `Floor Sponsor: ${bill.floor_sponsor.split(',')[0]}` : ''}
                </div>
            </div>
            
            <!-- Position Boxes - Top Right -->
            <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
                <!-- Author Position Box (Purple) -->
                ${getAuthorPositionBox(bill.author_position)}
                
                <!-- User Vote Box (Orange) -->
                <div class="group relative">
                    <!-- Add Vote Button -->
                    <button 
                        id="vote-add-${formatBillNumber(bill.bill_number)}"
                        onclick="toggleVotingButtons('${formatBillNumber(bill.bill_number)}')"
                        class="w-10 h-10 rounded-lg shadow-lg flex items-center justify-center text-lg font-bold border-2 border-orange-500 bg-orange-400 text-white hover:bg-orange-500 transition ${getVoteStatus(bill.bill_number) ? 'hidden' : ''}">
                        +
                    </button>
                    
                    <!-- Selected Vote Indicator -->
                    <button
                        id="vote-selected-${formatBillNumber(bill.bill_number)}"
                        onclick="toggleVotingButtons('${formatBillNumber(bill.bill_number)}')"
                        class="w-10 h-10 rounded-lg shadow-lg flex items-center justify-center text-lg font-bold border-2 border-orange-500 bg-orange-400 text-white hover:bg-orange-500 transition ${getVoteStatus(bill.bill_number) ? '' : 'hidden'}">
                        ${getVoteStatus(bill.bill_number) || '+'}
                    </button>
                    
                    <!-- Tooltip for User Vote -->
                    <div class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Your Vote
                    </div>
                    
                    <!-- Voting Buttons Dropdown -->
                    <div id="vote-buttons-${formatBillNumber(bill.bill_number)}" class="hidden absolute top-0 right-0 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-xl border-2 border-orange-400 z-30">
                        <button 
                            onclick="castVote('${formatBillNumber(bill.bill_number)}', 'Support'); event.stopPropagation();"
                            class="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg transition whitespace-nowrap">
                            ✅ Support
                        </button>
                        <button 
                            onclick="castVote('${formatBillNumber(bill.bill_number)}', 'Oppose'); event.stopPropagation();"
                            class="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition whitespace-nowrap">
                            ❌ Oppose
                        </button>
                        <button 
                            onclick="castVote('${formatBillNumber(bill.bill_number)}', 'Neutral'); event.stopPropagation();"
                            class="bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded-lg transition whitespace-nowrap">
                            ⚪ Neutral
                        </button>
                        <button 
                            onclick="toggleVotingButtons('${formatBillNumber(bill.bill_number)}'); event.stopPropagation();"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-lg transition">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

        </div>
    `;
}

function getStatusColor(status) {
    if (!status) return 'border-gray-300';
    if (status.includes('Passed') || status.includes('Signed')) return 'border-green-500';
    if (status.includes('Failed') || status.includes('Vetoed')) return 'border-red-500';
    if (status.includes('Committee')) return 'border-yellow-500';
    return 'border-blue-500';
}

function buildOrgFilters() {
    const container = document.getElementById('org-filters');
    if (!container) return;
    
    const orgMap = buildOrgMap();
    
    let html = '<div class="flex flex-wrap gap-2">';
    for (const [key, org] of Object.entries(orgMap)) {
        html += `
            <button 
                onclick="toggleOrgFilter('${key}')" 
                id="org-${key}"
                class="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm">
                ${org.emoji} ${org.name}
            </button>
        `;
    }
    html += '</div>';
    
    container.innerHTML = html;
}

function toggleOrgFilter(orgKey) {
    const btn = document.getElementById(`org-${orgKey}`);
    
    if (selectedOrgs.has(orgKey)) {
        selectedOrgs.delete(orgKey);
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('border-gray-300', 'hover:bg-gray-100');
    } else {
        selectedOrgs.add(orgKey);
        btn.classList.add('bg-blue-500', 'text-white');
        btn.classList.remove('border-gray-300', 'hover:bg-gray-100');
    }
    
    applyFilters();
}

function applyFilters() {
    let filtered = allBills;
    
    // Filter by organizations
    if (selectedOrgs.size > 0) {
        filtered = filtered.filter(bill => {
            return Array.from(selectedOrgs).some(org => {
                const position = bill[`${org}_position`];
                return position && position.trim();
            });
        });
    }
    
    // Filter by type (all/controversial/agreement)
    if (currentFilter === 'controversial') {
        filtered = filtered.filter(bill => {
            const positions = getPositionValues(bill);
            const hasSupport = positions.includes('Support');
            const hasOppose = positions.includes('Oppose');
            return hasSupport && hasOppose;
        });
    } else if (currentFilter === 'agreement') {
        filtered = filtered.filter(bill => {
            const positions = getPositionValues(bill);
            const nonWatching = positions.filter(p => p !== 'Watching');
            return nonWatching.length >= 2 && new Set(nonWatching).size === 1;
        });
    }
    
    displayBills(filtered);
}

function getPositionValues(bill) {
    const positions = [];
    const orgKeys = getOrgFieldNames();
    
    for (const key of orgKeys) {
        const pos = bill[`${key}_position`];
        if (pos && pos.trim()) positions.push(pos);
    }
    
    return positions;
}

function setFilter(filterType) {
    currentFilter = filterType;
    
    // Clear org selections when "All Bills" is clicked
    if (filterType === 'all') {
        console.log('Clearing org selections, was:', selectedOrgs.size);
        selectedOrgs.clear();
        console.log('After clear:', selectedOrgs.size);
        // Reset all org button styles
        document.querySelectorAll('[id^="org-"]').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('border-gray-300', 'hover:bg-gray-100');
        });
    }
    
    // Update button styles
    document.querySelectorAll('[data-filter]').forEach(btn => {
        if (btn.dataset.filter === filterType) {
            btn.classList.add('bg-blue-600', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-700');
        } else {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700');
        }
    });
    
    applyFilters();
}

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Setup filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        applyFilters();
        return;
    }
    
    let filtered = allBills.filter(bill => {
        return bill.bill_number.toLowerCase().includes(query) ||
               bill.title.toLowerCase().includes(query);
    });
    
    // Apply current filters on top of search
    if (selectedOrgs.size > 0) {
        filtered = filtered.filter(bill => {
            return Array.from(selectedOrgs).some(org => {
                const position = bill[`${org}_position`];
                return position && position.trim();
            });
        });
    }
    
    if (currentFilter === 'controversial') {
        filtered = filtered.filter(bill => {
            const positions = getPositionValues(bill);
            const hasSupport = positions.includes('Support');
            const hasOppose = positions.includes('Oppose');
            return hasSupport && hasOppose;
        });
    } else if (currentFilter === 'agreement') {
        filtered = filtered.filter(bill => {
            const positions = getPositionValues(bill);
            const nonWatching = positions.filter(p => p !== 'Watching');
            return nonWatching.length >= 2 && new Set(nonWatching).size === 1;
        });
    }
    
    displayBills(filtered);
}

// contactLegislatorAboutBill is in simple-contact.js

// Tab switching for filter sidebar
function showFilterTab(tabName) {
    // Hide all filter panels
    document.getElementById('filter-orgs')?.classList.add('hidden');
    document.getElementById('filter-status')?.classList.add('hidden');
    document.getElementById('filter-topic')?.classList.add('hidden');
    
    // Show selected panel
    document.getElementById(`filter-${tabName}`)?.classList.remove('hidden');
    
    // Update tab styles
    ['orgs', 'status', 'topic'].forEach(tab => {
        const tabBtn = document.getElementById(`tab-${tab}`);
        if (tabBtn) {
            if (tab === tabName) {
                tabBtn.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
                tabBtn.classList.remove('text-gray-500');
            } else {
                tabBtn.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
                tabBtn.classList.add('text-gray-500');
            }
        }
    });
}

// Make filter functions globally available
window.setFilter = setFilter;
window.applyFilters = applyFilters;
window.showFilterTab = showFilterTab;

// Connect search bar
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            if (!window.allBills) return;
            
            let filtered = window.allBills;
            if (term) {
                filtered = window.allBills.filter(bill => 
                    bill.bill_number?.toLowerCase().includes(term) ||
                    bill.bill_number?.toLowerCase().replace(/0+/, '').includes(term) ||
                    bill.title?.toLowerCase().includes(term) ||
                    bill.sponsor?.toLowerCase().includes(term)
                );
            }
            displayBills(filtered);
        });
    }
});
