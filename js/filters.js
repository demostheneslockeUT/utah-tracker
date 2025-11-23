/**
 * Complete filter system for Utah Bill Tracker
 */

// Filter state
let currentFilter = 'all';

// Set main filter (All, Controversial, Agreement, My Votes)
function setFilter(filterType) {
    // Clear org selections when "All Bills" is clicked
    if (filterType === 'all' && typeof selectedOrgs !== 'undefined') {
        selectedOrgs.clear();
        // Reset all org button styles dynamically
        document.querySelectorAll('[id^="org-"]').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('border-gray-300', 'hover:bg-gray-100');
        });
        console.log('Cleared org filters');
    }

    currentFilter = filterType;
    
    // Update button styles
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        activeBtn.classList.add('bg-blue-600', 'text-white');
    }
    
    applyAllFilters();
}

// Get all org positions from a bill
function getPositionValues(bill) {
    const positions = [];
    for (const [key, value] of Object.entries(bill)) {
        if (key.endsWith('_position') && value && value !== '' && value !== 'N/A') {
            positions.push(value);
        }
    }
    return positions;
}

// Main filter function
function applyAllFilters() {
    if (!window.allBills || !Array.isArray(window.allBills)) {
        console.log('Bills not loaded yet');
        return;
    }
    
    let filtered = [...window.allBills];
    console.log(`Starting with ${filtered.length} bills`);
    
    // 1. Apply search filter
    const searchTerm = document.getElementById('search-input')?.value?.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(bill => 
            bill.bill_number?.toLowerCase().includes(searchTerm) ||
            bill.bill_number?.toLowerCase().replace(/0+/, '').includes(searchTerm) ||
            bill.title?.toLowerCase().includes(searchTerm) ||
            bill.sponsor?.toLowerCase().includes(searchTerm)
        );
        console.log(`After search: ${filtered.length} bills`);
    }
    
    // 2. Apply main filter (controversial, agreement, my-votes)
    if (currentFilter === 'controversial') {
        filtered = filtered.filter(bill => {
            const positions = getPositionValues(bill);
            const hasSupport = positions.includes('Support');
            const hasOppose = positions.includes('Oppose');
            return hasSupport && hasOppose;
        });
        console.log(`After controversial filter: ${filtered.length} bills`);
    } else if (currentFilter === 'agreement') {
        filtered = filtered.filter(bill => {
            const positions = getPositionValues(bill);
            const nonWatching = positions.filter(p => p !== 'Watching' && p !== 'Studying');
            return nonWatching.length >= 2 && new Set(nonWatching).size === 1;
        });
        console.log(`After agreement filter: ${filtered.length} bills`);
    } else if (currentFilter === 'my-votes') {
        const myVotes = JSON.parse(localStorage.getItem('user_bill_votes') || '{}');
        const votedBills = Object.keys(myVotes);
        console.log('My votes:', votedBills);
        filtered = filtered.filter(bill => {
            const formatted = bill.bill_number.replace(/([A-Z]+)0+/, "$1");
            return myVotes[formatted] || myVotes[bill.bill_number];
        });
        console.log(`After my-votes filter: ${filtered.length} bills`);
    }
    
    // 3. Apply organization filters (uses selectedOrgs Set from app.js)
    if (typeof selectedOrgs !== "undefined" && selectedOrgs.size > 0) {
        filtered = filtered.filter(bill => {
            return Array.from(selectedOrgs).some(orgId => {
                const positionField = `${orgId}_position`;
                return bill[positionField] && bill[positionField] !== "" && bill[positionField] !== "N/A";
            });
        });
        console.log(`After org filter: ${filtered.length} bills`);
    }
    
    // 4. Apply status filters
    const checkedStatuses = document.querySelectorAll('.status-filter:checked');
    if (checkedStatuses.length > 0) {
        const statuses = Array.from(checkedStatuses).map(cb => cb.value);
        filtered = filtered.filter(bill => {
            const billStatus = bill.status || '';
            return statuses.some(s => billStatus.includes(s));
        });
        console.log(`After status filter: ${filtered.length} bills`);
    }
    
    // 5. Apply topic filters
    const checkedTopics = document.querySelectorAll('.topic-filter:checked');
    if (checkedTopics.length > 0) {
        const selectedTopics = Array.from(checkedTopics).map(cb => cb.value);
        console.log('Selected topics:', selectedTopics);
        filtered = filtered.filter(bill => {
            const billTopics = bill.topics || [];
            return selectedTopics.some(topic => billTopics.includes(topic));
        });
        console.log(`After topic filter: ${filtered.length} bills`);
    }
    
    // Display results
    if (typeof displayBills === 'function') {
        displayBills(filtered);
    }
    
    // Update count
    const countEl = document.getElementById('bills-count');
    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} of ${window.allBills.length} bills`;
    }
}

// Tab switching for filter sidebar
function showFilterTab(tabName) {
    // Hide all filter panels
    ['orgs', 'status', 'topic'].forEach(tab => {
        const panel = document.getElementById(`filter-${tab}`);
        if (panel) panel.classList.add('hidden');
    });
    
    // Show selected panel
    const selectedPanel = document.getElementById(`filter-${tabName}`);
    if (selectedPanel) selectedPanel.classList.remove('hidden');
    
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

// Connect search input
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyAllFilters();
        });
    }
    
    // Set default filter tab to show
    showFilterTab('orgs');
});

// Make functions globally available
window.setFilter = setFilter;
window.applyAllFilters = applyAllFilters;
window.applyFilters = applyAllFilters;
window.showFilterTab = showFilterTab;
window.currentFilter = currentFilter;

console.log('✅ Filter system loaded');
