/**
 * Legislators Page - Utah Legislative Tracker
 */

let alignmentData = {};
let legislatorsList = [];
let allOrgs = new Set();

// Load data
async function init() {
    try {
        const response = await fetch('data/legislator_alignments.json');
        alignmentData = await response.json();
        
        // Build list and collect orgs
        for (const [legId, data] of Object.entries(alignmentData)) {
            if (data.name) {
                legislatorsList.push({ id: legId, ...data });
                for (const orgField of Object.keys(data.organizations || {})) {
                    allOrgs.add(orgField);
                }
            }
        }
        
        // Sort by name initially
        legislatorsList.sort((a, b) => a.name.localeCompare(b.name));
        
        // Populate org dropdown
        populateOrgDropdown();
        
        // Update stats
        updateStats();
        
        // Render
        renderLegislators();
        
        // Setup event listeners
        setupFilters();
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('legislatorGrid').innerHTML = 
            '<p class="text-red-500">Error loading legislator data.</p>';
    }
}

function populateOrgDropdown() {
    const select = document.getElementById('sortOrg');
    const orgsArray = [];
    
    // Get org names from first legislator with orgs
    for (const leg of legislatorsList) {
        if (leg.organizations && Object.keys(leg.organizations).length > 0) {
            for (const [field, orgData] of Object.entries(leg.organizations)) {
                orgsArray.push({ field, name: orgData.name, emoji: orgData.emoji });
            }
            break;
        }
    }
    
    // Sort by name
    orgsArray.sort((a, b) => a.name.localeCompare(b.name));
    
    for (const org of orgsArray) {
        const option = document.createElement('option');
        option.value = org.field;
        option.textContent = `${org.emoji} ${org.name}`;
        select.appendChild(option);
    }
}

function updateStats() {
    document.getElementById('totalLegislators').textContent = legislatorsList.length;
    document.getElementById('totalR').textContent = legislatorsList.filter(l => l.party === 'R').length;
    document.getElementById('totalD').textContent = legislatorsList.filter(l => l.party === 'D').length;
    document.getElementById('totalOrgs').textContent = allOrgs.size;
}

function setupFilters() {
    document.getElementById('chamberFilter').addEventListener('change', renderLegislators);
    document.getElementById('partyFilter').addEventListener('change', renderLegislators);
    document.getElementById('sortOrg').addEventListener('change', renderLegislators);
    document.getElementById('searchInput').addEventListener('input', renderLegislators);
}

function renderLegislators() {
    const chamber = document.getElementById('chamberFilter').value;
    const party = document.getElementById('partyFilter').value;
    const sortOrg = document.getElementById('sortOrg').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter
    let filtered = legislatorsList.filter(leg => {
        if (chamber && leg.chamber !== chamber) return false;
        if (party && leg.party !== party) return false;
        if (search && !leg.name.toLowerCase().includes(search)) return false;
        return true;
    });
    
    // Sort
    if (sortOrg) {
        filtered.sort((a, b) => {
            const aAlign = a.organizations?.[sortOrg]?.alignment ?? -1;
            const bAlign = b.organizations?.[sortOrg]?.alignment ?? -1;
            return bAlign - aAlign; // Descending
        });
    }
    
    // Render
    const grid = document.getElementById('legislatorGrid');
    grid.innerHTML = filtered.map(leg => createLegislatorCard(leg)).join('');
}

function createLegislatorCard(leg) {
    const partyColor = leg.party === 'R' ? 'red' : 'blue';
    const partyEmoji = leg.party === 'R' ? '🐘' : '🐴';
    
    // Top 3 alignments
    const topOrgs = Object.entries(leg.organizations || {})
        .filter(([_, org]) => org.total >= 3)
        .sort((a, b) => b[1].alignment - a[1].alignment)
        .slice(0, 3);
    
    // Bottom 3 alignments
    const bottomOrgs = Object.entries(leg.organizations || {})
        .filter(([_, org]) => org.total >= 3)
        .sort((a, b) => a[1].alignment - b[1].alignment)
        .slice(0, 3);
    
    return `
        <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-4"
             onclick="showLegislatorDetail('${leg.id}')">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h3 class="font-bold text-lg">${leg.name}</h3>
                    <p class="text-sm text-gray-500">
                        ${partyEmoji} ${leg.party === 'R' ? 'Republican' : 'Democrat'} · ${leg.chamber} District ${leg.district}
                    </p>
                </div>
                <div class="text-right text-sm text-gray-500">
                    <div>${leg.contested_votes} contested</div>
                    <div class="text-xs">${leg.total_votes} total votes</div>
                </div>
            </div>
            
            ${topOrgs.length > 0 ? `
            <div class="mb-2">
                <div class="text-xs text-gray-500 mb-1">Highest alignment:</div>
                ${topOrgs.map(([_, org]) => `
                    <div class="flex justify-between items-center text-sm">
                        <span>${org.emoji} ${org.name}</span>
                        <span class="font-semibold text-green-600">${org.alignment}%</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${bottomOrgs.length > 0 ? `
            <div>
                <div class="text-xs text-gray-500 mb-1">Lowest alignment:</div>
                ${bottomOrgs.map(([_, org]) => `
                    <div class="flex justify-between items-center text-sm">
                        <span>${org.emoji} ${org.name}</span>
                        <span class="font-semibold text-red-600">${org.alignment}%</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    `;
}

function showLegislatorDetail(legId) {
    const leg = alignmentData[legId];
    if (!leg) return;
    
    const partyEmoji = leg.party === 'R' ? '🐘' : '🐴';
    const partyName = leg.party === 'R' ? 'Republican' : 'Democrat';
    
    // Sort all orgs by alignment
    const allOrgsSorted = Object.entries(leg.organizations || {})
        .filter(([_, org]) => org.total >= 1)
        .sort((a, b) => b[1].alignment - a[1].alignment);
    
    const modal = document.getElementById('legislatorModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">${leg.name}</h2>
        <p class="text-gray-600 mb-4">
            ${partyEmoji} ${partyName} · ${leg.chamber} District ${leg.district}
        </p>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-100 rounded p-3 text-center">
                <div class="text-2xl font-bold">${leg.total_votes}</div>
                <div class="text-sm text-gray-500">Total Votes</div>
            </div>
            <div class="bg-blue-100 rounded p-3 text-center">
                <div class="text-2xl font-bold text-blue-600">${leg.contested_votes}</div>
                <div class="text-sm text-gray-500">Contested Votes</div>
            </div>
        </div>
        
        <h3 class="font-bold text-lg mb-3">Organization Alignments</h3>
        <p class="text-sm text-gray-500 mb-4">Based on contested votes only (20-80% split)</p>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
            ${allOrgsSorted.map(([field, org]) => {
                const pct = org.alignment;
                const barColor = pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                return `
                    <div class="flex items-center gap-3">
                        <div class="w-8 text-center">${org.emoji}</div>
                        <div class="flex-1">
                            <div class="flex justify-between text-sm mb-1">
                                <span>${org.name}</span>
                                <span class="font-semibold">${pct}% (${org.matches}/${org.total})</span>
                            </div>
                            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div class="${barColor} h-full rounded-full" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        ${allOrgsSorted.length === 0 ? '<p class="text-gray-500">No organization data available for contested votes.</p>' : ''}
    `;
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('legislatorModal').classList.add('hidden');
}

// Close modal on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Close modal on background click
document.getElementById('legislatorModal').addEventListener('click', (e) => {
    if (e.target.id === 'legislatorModal') closeModal();
});

// Initialize
init();
