/**
 * My Representatives Modal
 * Allows users to find and select their legislators
 */

let zipMappings = null;
let allLegislators = null;

async function loadMyRepsData() {
    if (!zipMappings) {
        try {
            const res = await fetch('data/zip-to-legislators.json');
            const data = await res.json();
            zipMappings = data.zip_mappings;
        } catch (e) {
            console.error('Failed to load zip mappings:', e);
            zipMappings = {};
        }
    }
    
    if (!allLegislators) {
        try {
            const res = await fetch('data/legislators.json');
            const data = await res.json();
            allLegislators = data.legislators;
        } catch (e) {
            console.error('Failed to load legislators:', e);
            allLegislators = {};
        }
    }
}

function getSavedReps() {
    const saved = localStorage.getItem('user_legislators');
    return saved ? JSON.parse(saved) : [];
}

function saveReps(reps) {
    localStorage.setItem('user_legislators', JSON.stringify(reps));
    if (window.contactSystem) {
        window.contactSystem.userLegislators = reps;
    }
}

function getLegislatorInfo(name) {
    if (!allLegislators) return null;
    
    // Try exact match first
    if (allLegislators[name]) return allLegislators[name];
    
    // Try partial match
    const key = Object.keys(allLegislators).find(k => 
        k.includes(name.replace('Sen. ', '').replace('Rep. ', '')) ||
        name.includes(k.split(',')[0])
    );
    return key ? allLegislators[key] : null;
}

async function showMyRepsModal() {
    await loadMyRepsData();
    
    const savedReps = getSavedReps();
    
    // Remove existing modal
    const existing = document.getElementById('my-reps-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'my-reps-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-blue-900">👤 My Representatives</h2>
                <button onclick="document.getElementById('my-reps-modal').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <!-- Current Selection -->
            <div id="current-reps-section" class="mb-6">
                <h3 class="font-semibold text-gray-700 mb-2">Currently Selected:</h3>
                <div id="current-reps-list">
                    ${savedReps.length > 0 
                        ? savedReps.map(name => renderRepCard(name)).join('')
                        : '<p class="text-gray-500 italic">No representatives selected yet</p>'
                    }
                </div>
                ${savedReps.length > 0 ? `
                    <button onclick="clearMyReps()" class="mt-2 text-red-600 hover:text-red-800 text-sm">
                        🗑️ Clear Selection
                    </button>
                ` : ''}
            </div>
            
            <!-- ZIP Code Lookup -->
            <div class="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="font-semibold text-blue-900 mb-2">🔍 Find by ZIP Code</h3>
                <div class="flex gap-2">
                    <input type="text" 
                           id="zip-input" 
                           placeholder="Enter Utah ZIP code" 
                           maxlength="5"
                           class="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           onkeypress="if(event.key==='Enter') lookupByZip()">
                    <button onclick="lookupByZip()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
                        Find
                    </button>
                </div>
                <div id="zip-results" class="mt-3"></div>
                <p class="text-xs text-gray-500 mt-2">
                    Note: ZIP codes may span multiple districts. 
                    <a href="https://le.utah.gov/GIS/findDistrict.jsp" target="_blank" class="text-blue-600 hover:underline">
                        Use official lookup for exact match →
                    </a>
                </p>
            </div>
            
            <!-- Manual Selection -->
            <div class="mb-4">
                <h3 class="font-semibold text-gray-700 mb-2">📋 Or Select Manually</h3>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-sm text-gray-600">Senate:</label>
                        <select id="manual-senate" class="w-full p-2 border rounded text-sm">
                            <option value="">-- Select Senator --</option>
                            ${Object.entries(allLegislators || {})
                                .filter(([_, info]) => info.chamber === 'Senate')
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([name, info]) => `<option value="${name}">${name} (${info.party})</option>`)
                                .join('')}
                        </select>
                    </div>
                    <div>
                        <label class="text-sm text-gray-600">House:</label>
                        <select id="manual-house" class="w-full p-2 border rounded text-sm">
                            <option value="">-- Select Representative --</option>
                            ${Object.entries(allLegislators || {})
                                .filter(([_, info]) => info.chamber === 'House')
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([name, info]) => `<option value="${name}">${name} (${info.party})</option>`)
                                .join('')}
                        </select>
                    </div>
                </div>
                <button onclick="saveManualSelection()" 
                        class="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold">
                    ✅ Save Selection
                </button>
            </div>
            
            <!-- Info -->
            <div class="text-xs text-gray-500 border-t pt-3">
                Your selection is saved locally in your browser and used to auto-fill the "Contact Legislator" feature.
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function renderRepCard(name) {
    const info = getLegislatorInfo(name);
    const party = info?.party || '?';
    const partyColor = party === 'R' ? 'red' : party === 'D' ? 'blue' : 'gray';
    const chamber = info?.chamber || '';
    const district = info?.district || '';
    const image = info?.image || '';
    
    return `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
            ${image ? `<img src="${image}" alt="${name}" class="w-12 h-12 rounded-full object-cover">` : 
                      `<div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">👤</div>`}
            <div class="flex-1">
                <div class="font-semibold">${name}</div>
                <div class="text-sm text-${partyColor}-600">${party === 'R' ? '🐘 Republican' : party === 'D' ? '🐴 Democrat' : party} • ${chamber} District ${district}</div>
            </div>
            ${info?.email ? `<a href="mailto:${info.email}" class="text-blue-600 hover:text-blue-800">📧</a>` : ''}
        </div>
    `;
}

function lookupByZip() {
    const zip = document.getElementById('zip-input').value.trim();
    const resultsDiv = document.getElementById('zip-results');
    
    if (!/^\d{5}$/.test(zip)) {
        resultsDiv.innerHTML = '<p class="text-red-600">Please enter a valid 5-digit ZIP code</p>';
        return;
    }
    
    const reps = zipMappings[zip];
    
    if (!reps || reps.length === 0) {
        resultsDiv.innerHTML = `
            <p class="text-yellow-700">ZIP code ${zip} not found in our database.</p>
            <p class="text-sm text-gray-600 mt-1">
                Try the <a href="https://le.utah.gov/GIS/findDistrict.jsp" target="_blank" class="text-blue-600 hover:underline">official Utah lookup tool</a>
            </p>
        `;
        return;
    }
    
    resultsDiv.innerHTML = `
        <div class="bg-green-50 p-3 rounded">
            <p class="text-green-800 font-semibold mb-2">Found ${reps.length} representative(s) for ${zip}:</p>
            ${reps.map(name => `<div class="text-sm mb-1">• ${name}</div>`).join('')}
            <button onclick="saveZipReps('${zip}')" 
                    class="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold">
                ✅ Select These Representatives
            </button>
        </div>
    `;
}

function saveZipReps(zip) {
    const reps = zipMappings[zip];
    if (reps) {
        saveReps(reps);
        refreshCurrentReps();
        document.getElementById('zip-results').innerHTML = 
            '<p class="text-green-600 font-semibold">✅ Representatives saved!</p>';
    }
}

function saveManualSelection() {
    const senate = document.getElementById('manual-senate').value;
    const house = document.getElementById('manual-house').value;
    
    const reps = [];
    if (senate) reps.push(senate);
    if (house) reps.push(house);
    
    if (reps.length === 0) {
        alert('Please select at least one representative');
        return;
    }
    
    saveReps(reps);
    refreshCurrentReps();
    
    // Reset dropdowns
    document.getElementById('manual-senate').value = '';
    document.getElementById('manual-house').value = '';
    
    alert('✅ Representatives saved!');
}

function clearMyReps() {
    if (confirm('Clear your saved representatives?')) {
        saveReps([]);
        refreshCurrentReps();
    }
}

function refreshCurrentReps() {
    const savedReps = getSavedReps();
    const listDiv = document.getElementById('current-reps-list');
    const sectionDiv = document.getElementById('current-reps-section');
    
    if (savedReps.length > 0) {
        listDiv.innerHTML = savedReps.map(name => renderRepCard(name)).join('');
        // Add clear button if not present
        if (!sectionDiv.querySelector('button')) {
            const btn = document.createElement('button');
            btn.onclick = clearMyReps;
            btn.className = 'mt-2 text-red-600 hover:text-red-800 text-sm';
            btn.innerHTML = '🗑️ Clear Selection';
            sectionDiv.appendChild(btn);
        }
    } else {
        listDiv.innerHTML = '<p class="text-gray-500 italic">No representatives selected yet</p>';
        const btn = sectionDiv.querySelector('button');
        if (btn) btn.remove();
    }
}

// Make function globally available
window.showMyRepsModal = showMyRepsModal;
window.lookupByZip = lookupByZip;
window.saveZipReps = saveZipReps;
window.saveManualSelection = saveManualSelection;
window.clearMyReps = clearMyReps;

console.log('✅ My Reps Modal loaded');
