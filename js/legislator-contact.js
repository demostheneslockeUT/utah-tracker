/**
 * LEGISLATOR CONTACT SYSTEM
 * Help users find and contact their legislators
 */

class LegislatorContactSystem {
    constructor() {
        this.legislators = null;
        this.userLegislators = this.loadUserLegislators();
    }
    
    async loadLegislators() {
        try {
            const response = await fetch('data/legislators.json');
            const data = await response.json();
            this.legislators = data.legislators;
            return true;
        } catch (error) {
            console.error('Error loading legislators:', error);
            return false;
        }
    }
    
    loadUserLegislators() {
        const saved = localStorage.getItem('user_legislators');
        return saved ? JSON.parse(saved) : null;
    }
    
    saveUserLegislators(legislators) {
        localStorage.setItem('user_legislators', JSON.stringify(legislators));
        this.userLegislators = legislators;
    }
    
    getLegislatorInfo(name) {
        if (!this.legislators || !this.legislators[name]) return null;
        return this.legislators[name];
    }
    
    findLegislatorsByZip(zip) {
        // This would need ZIP to district mapping
        // For now, return null - user must select from quiz
        return null;
    }
    
    getUserLegislators() {
        return this.userLegislators;
    }
    
    hasUserLegislators() {
        return this.userLegislators && this.userLegislators.length > 0;
    }
}

const contactSystem = new LegislatorContactSystem();
window.contactSystem = contactSystem;

// Show legislator contact modal
async function showLegislatorContact() {
    await contactSystem.loadLegislators();
    
    const modal = document.getElementById('legislator-contact-modal');
    if (!modal) {
        createLegislatorContactModal();
    }
    
    document.getElementById('legislator-contact-modal').classList.remove('hidden');
    
    // Populate with user's legislators if available
    if (contactSystem.hasUserLegislators()) {
        displayUserLegislators();
    } else {
        displayLegislatorFinder();
    }
}

function createLegislatorContactModal() {
    const modal = document.createElement('div');
    modal.id = 'legislator-contact-modal';
    modal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
        if (e.target === modal) closeLegislatorContact();
    };
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">📞 Contact Your Legislators</h2>
                    <button onclick="closeLegislatorContact()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                
                <div id="legislator-contact-content"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function displayUserLegislators() {
    const userLegs = contactSystem.getUserLegislators();
    const content = document.getElementById('legislator-contact-content');
    
    let html = '<div class="space-y-4">';
    
    userLegs.forEach(legName => {
        const info = contactSystem.getLegislatorInfo(legName);
        if (info) {
            html += renderLegislatorCard(legName, info);
        }
    });
    
    html += `
        <div class="border-t pt-4 mt-4">
            <button onclick="displayLegislatorFinder()" class="text-blue-600 hover:text-blue-800 font-semibold">
                Change My Legislators →
            </button>
        </div>
    </div>`;
    
    content.innerHTML = html;
}

function displayLegislatorFinder() {
    const content = document.getElementById('legislator-contact-content');
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-sm text-gray-700">
                    <strong>To find your legislators:</strong> Take the Legislator Quiz! 
                    As you vote on bills, we'll identify which legislators match your views.
                </p>
            </div>
            
            <div class="text-center">
                <a href="quiz.html" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
                    Take Legislator Quiz →
                </a>
            </div>
            
            <div class="border-t pt-4">
                <p class="text-sm text-gray-600 mb-3">Or manually select your legislators:</p>
                <select id="manual-leg-select" class="w-full p-2 border rounded" multiple size="5">
                    ${Object.keys(contactSystem.legislators || {}).sort().map(name => 
                        `<option value="${name}">${name}</option>`
                    ).join('')}
                </select>
                <button onclick="saveManualLegislators()" class="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Save My Legislators
                </button>
            </div>
        </div>
    `;
}

function renderLegislatorCard(name, info) {
    const party = info.party || 'Unknown';
    const partyColor = party === 'Republican' ? 'red' : party === 'Democratic' ? 'blue' : 'gray';
    
    return `
        <div class="border rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg">${name}</h3>
                    <p class="text-sm text-${partyColor}-600">${party}</p>
                </div>
                ${info.website ? `
                    <a href="${info.website}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        Website →
                    </a>
                ` : ''}
            </div>
            
            ${info.email ? `
                <div class="mb-2">
                    <span class="text-sm font-semibold">Email:</span>
                    <a href="mailto:${info.email}" class="text-blue-600 hover:text-blue-800 text-sm ml-2">
                        ${info.email}
                    </a>
                </div>
            ` : ''}
            
            ${info.phone ? `
                <div class="mb-2">
                    <span class="text-sm font-semibold">Phone:</span>
                    <span class="text-sm ml-2">${info.phone}</span>
                </div>
            ` : ''}
            
            <div class="mt-3 text-xs text-gray-600">
                <strong>Voting Record:</strong> ${info.yea_votes?.length || 0} Yea, ${info.nay_votes?.length || 0} Nay
            </div>
        </div>
    `;
}

function saveManualLegislators() {
    const select = document.getElementById('manual-leg-select');
    const selected = Array.from(select.selectedOptions).map(opt => opt.value);
    
    if (selected.length === 0) {
        alert('Please select at least one legislator');
        return;
    }
    
    contactSystem.saveUserLegislators(selected);
    displayUserLegislators();
}

function closeLegislatorContact() {
    document.getElementById('legislator-contact-modal').classList.add('hidden');
}

// Get floor sponsor contact link
function getFloorSponsorContact(sponsorName) {
    if (!sponsorName) return null;
    
    // sponsorName might be "Last, First" - we need to match to legislator
    // For now, return a generic link
    return {
        name: sponsorName,
        text: `Contact ${sponsorName.split(',')[0]}`,
        available: false // Will be true once we have full contact data
    };
}
