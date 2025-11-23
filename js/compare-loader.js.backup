/**
 * COMPARE PAGE DATA LOADER
 * Loads compare_data.json and initializes the comparison engine
 */

let compareData = null;

async function loadCompareData() {
    try {
        const response = await fetch('data/compare_data.json');
        compareData = await response.json();
        
        console.log('✅ Compare data loaded:');
        console.log(`   - ${Object.keys(compareData.organizations).length} organizations`);
        console.log(`   - ${Object.keys(compareData.legislators).length} legislators`);
        console.log(`   - ${compareData.totalVotesAnalyzed.toLocaleString()} votes analyzed`);
        
        // Populate dropdowns
        populateOrgDropdown();
        populateLegislatorDropdown();
        
        return compareData;
    } catch (error) {
        console.error('Error loading compare data:', error);
    }
}

function populateOrgDropdown() {
    const orgs = compareData.organizations;
    
    // Sort by bills tracked (descending)
    const sortedOrgs = Object.values(orgs).sort((a, b) => b.totalBillsTracked - a.totalBillsTracked);
    
    // Build options HTML
    let optionsHTML = '<option value="">-- Select Organization --</option>';
    sortedOrgs.forEach(org => {
        optionsHTML += `<option value="${org.id}">${org.emoji} ${org.name} (${org.totalBillsTracked} bills)</option>`;
    });
    
    // Insert into any org dropdowns
    document.querySelectorAll('.org-select').forEach(select => {
        select.innerHTML = optionsHTML;
    });
    
    console.log(`   Populated org dropdowns with ${sortedOrgs.length} orgs`);
}

function populateLegislatorDropdown() {
    const legs = compareData.legislators;
    
    // Sort by name
    const sortedLegs = Object.values(legs).sort((a, b) => a.name.localeCompare(b.name));
    
    // Group by chamber
    const senate = sortedLegs.filter(l => l.chamber === 'Senate');
    const house = sortedLegs.filter(l => l.chamber === 'House');
    const other = sortedLegs.filter(l => l.chamber !== 'Senate' && l.chamber !== 'House');
    
    let optionsHTML = '<option value="">-- Select Legislator --</option>';
    
    if (senate.length > 0) {
        optionsHTML += '<optgroup label="🏛️ Senate">';
        senate.forEach(leg => {
            const party = leg.party === 'R' ? '🔴' : leg.party === 'D' ? '🔵' : '⚪';
            optionsHTML += `<option value="${leg.name}">${party} ${leg.name} (${leg.totalVotes} votes)</option>`;
        });
        optionsHTML += '</optgroup>';
    }
    
    if (house.length > 0) {
        optionsHTML += '<optgroup label="🏠 House">';
        house.forEach(leg => {
            const party = leg.party === 'R' ? '🔴' : leg.party === 'D' ? '🔵' : '⚪';
            optionsHTML += `<option value="${leg.name}">${party} ${leg.name} (${leg.totalVotes} votes)</option>`;
        });
        optionsHTML += '</optgroup>';
    }
    
    // Insert into any legislator dropdowns
    document.querySelectorAll('.legislator-select').forEach(select => {
        select.innerHTML = optionsHTML;
    });
    
    console.log(`   Populated legislator dropdowns with ${sortedLegs.length} legislators`);
}

function getOrgStats(orgId) {
    return compareData?.organizations[orgId] || null;
}

function getLegislatorData(legName) {
    return compareData?.legislators[legName] || null;
}

function getLegislatorAlignment(legName, orgId) {
    const leg = getLegislatorData(legName);
    if (!leg || !leg.alignments) return null;
    
    // Find alignment by org name (alignments use display names)
    const org = getOrgStats(orgId);
    if (!org) return null;
    
    return leg.alignments[org.name] || null;
}

function howDidTheyVote(legName, billNumber) {
    const leg = getLegislatorData(legName);
    if (!leg) return null;
    
    if (leg.yea_votes.includes(billNumber)) return 'Yea';
    if (leg.nay_votes.includes(billNumber)) return 'Nay';
    return 'No vote recorded';
}

// Display functions
function displayOrgProfile(orgId) {
    const org = getOrgStats(orgId);
    if (!org) return '';
    
    return `
        <div class="bg-white rounded-lg p-4 shadow">
            <h3 class="text-xl font-bold">${org.emoji} ${org.name}</h3>
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
                <div class="bg-green-100 p-2 rounded">
                    <div class="text-2xl font-bold text-green-700">${org.supportCount}</div>
                    <div class="text-xs text-green-600">Support</div>
                </div>
                <div class="bg-red-100 p-2 rounded">
                    <div class="text-2xl font-bold text-red-700">${org.opposeCount}</div>
                    <div class="text-xs text-red-600">Oppose</div>
                </div>
                <div class="bg-blue-100 p-2 rounded">
                    <div class="text-2xl font-bold text-blue-700">${org.watchingCount}</div>
                    <div class="text-xs text-blue-600">Watching</div>
                </div>
            </div>
            <div class="mt-3 text-sm text-gray-600">
                Top topics: ${org.topTopics.join(', ')}
            </div>
        </div>
    `;
}

function displayLegislatorProfile(legName) {
    const leg = getLegislatorData(legName);
    if (!leg) return '';
    
    const party = leg.party === 'R' ? '🔴 Republican' : leg.party === 'D' ? '🔵 Democrat' : '⚪ Unknown';
    
    // Build alignment bars
    let alignmentHTML = '';
    if (leg.alignments) {
        const sortedAlignments = Object.entries(leg.alignments)
            .sort((a, b) => b[1].pct - a[1].pct);
        
        alignmentHTML = sortedAlignments.map(([orgName, data]) => `
            <div class="flex items-center gap-2 text-sm">
                <span class="w-24 truncate">${data.emoji} ${orgName}</span>
                <div class="flex-1 bg-gray-200 rounded-full h-4">
                    <div class="h-4 rounded-full ${data.pct >= 70 ? 'bg-green-500' : data.pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}" 
                         style="width: ${data.pct}%"></div>
                </div>
                <span class="w-16 text-right font-semibold">${data.pct}%</span>
            </div>
        `).join('');
    }
    
    return `
        <div class="bg-white rounded-lg p-4 shadow">
            <h3 class="text-xl font-bold">${leg.name}</h3>
            <div class="text-sm text-gray-600 mb-3">
                ${party} • ${leg.chamber} District ${leg.district} • ${leg.totalVotes} votes
            </div>
            <div class="space-y-2">
                <h4 class="font-semibold text-sm">Alignment with Organizations:</h4>
                ${alignmentHTML || '<p class="text-gray-400">No alignment data</p>'}
            </div>
        </div>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadCompareData);

// Make functions globally available
window.compareData = compareData;
window.getOrgStats = getOrgStats;
window.getLegislatorData = getLegislatorData;
window.getLegislatorAlignment = getLegislatorAlignment;
window.howDidTheyVote = howDidTheyVote;
window.displayOrgProfile = displayOrgProfile;
window.displayLegislatorProfile = displayLegislatorProfile;

console.log('✅ Compare loader ready');
