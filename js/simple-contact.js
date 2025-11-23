/**
 * Simplified contact system that actually works
 */

// Override the problematic function with a working version
window.contactLegislatorAboutBill = async function(billNumber, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Step 1: Check if user voted
    const userVote = votingSystem.getVote(billNumber);
    if (!userVote) {
        alert('📝 Please vote on this bill first!\n\nClick the orange + button to select Support, Oppose, or Neutral.');
        return;
    }
    
    // Step 2: Check if user has legislators
    if (!contactSystem.hasUserLegislators()) {
        const goToQuiz = confirm('🗳️ To contact your legislator, we need to know who represents you.\n\nWould you like to:\n• Take the Legislator Quiz to find matches\n• Or manually select your representatives?');
        if (goToQuiz) {
            window.location.href = 'quiz.html';
        } else {
            showLegislatorContact();
        }
        return;
    }
    
    // Step 3: Get bill info - try multiple sources
    let bill = null;
    
    if (window.allBills && Array.isArray(window.allBills)) {
        bill = window.allBills.find(b => b.bill_number === billNumber);
    }
    
    // Fallback: create minimal bill object
    if (!bill) {
        bill = {
            bill_number: billNumber,
            title: 'Utah Legislative Bill ' + billNumber,
            status: 'Unknown'
        };
    }
    
    // Load legislators if needed
    if (!contactSystem.legislators) {
        await contactSystem.loadLegislators();
    }
    
    const userLegislators = contactSystem.getUserLegislators();
    const firstLegName = userLegislators[0];
    const legInfo = contactSystem.getLegislatorInfo(firstLegName);
    
    // Step 4: Generate and send email
    const template = generateEmailTemplate(bill, userVote, firstLegName);
    
    if (legInfo && legInfo.email) {
        // Has email - open mailto
        const mailto = `mailto:${legInfo.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
        window.location.href = mailto;
    } else {
        // No email - show preview
        showEmailPreviewModal(template, firstLegName, legInfo);
    }
};

function showEmailPreviewModal(template, legName, legInfo) {
    // Remove existing modal if any
    const existing = document.getElementById('email-preview-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'email-preview-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    const websiteLink = legInfo?.website || 'https://le.utah.gov';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <h2 class="text-2xl font-bold mb-4">📧 Email Template for ${legName}</h2>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <p class="text-sm"><strong>Note:</strong> Email address not available for this legislator.</p>
                <p class="text-sm mt-2">
                    <a href="${websiteLink}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">
                        Visit their website →
                    </a>
                </p>
            </div>
            
            <div class="mb-4">
                <label class="block font-semibold mb-2">Subject:</label>
                <div class="p-3 bg-gray-100 rounded">${template.subject}</div>
            </div>
            
            <div class="mb-4">
                <label class="block font-semibold mb-2">Message:</label>
                <textarea id="email-body-text" class="w-full p-3 border rounded font-mono text-sm" rows="12">${template.body}</textarea>
            </div>
            
            <div class="flex gap-3">
                <button onclick="copyEmailTemplate()" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    📋 Copy Template
                </button>
                <button onclick="document.getElementById('email-preview-modal').remove()" 
                        class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyEmailTemplate() {
    const body = document.getElementById('email-body-text').value;
    navigator.clipboard.writeText(body).then(() => {
        alert('✅ Template copied to clipboard!');
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('Failed to copy. Please select and copy manually.');
    });
}

// Debug function
window.debugLegislators = async function() {
    if (!contactSystem.legislators) {
        await contactSystem.loadLegislators();
    }
    
    console.log('Total legislators:', Object.keys(contactSystem.legislators).length);
    console.log('Sample (first 5):');
    Object.entries(contactSystem.legislators).slice(0, 5).forEach(([name, info]) => {
        console.log(`  ${name}:`, {
            email: info.email || 'NONE',
            phone: info.phone || 'NONE',
            party: info.party || 'NONE',
            chamber: info.chamber || 'NONE'
        });
    });
    
    // Check for "Escamilla"
    const escamilla = Object.entries(contactSystem.legislators).find(([name]) => 
        name.toLowerCase().includes('escamilla')
    );
    if (escamilla) {
        console.log('\nEscamilla data:', escamilla);
    }
    
    // Check window.allBills
    console.log('\nwindow.allBills:', window.allBills ? `${window.allBills.length} bills` : 'NOT SET');
};

console.log('💡 Call debugLegislators() in console to see legislator data');

// Debug: check bill data structure
window.debugBill = function(billNumber) {
    if (!window.allBills) {
        console.log('window.allBills not set');
        return;
    }
    const bill = window.allBills.find(b => b.bill_number === billNumber);
    if (bill) {
        console.log('Bill found:', bill);
        console.log('Title:', bill.title);
    } else {
        console.log('Bill not found');
        console.log('Sample bill:', window.allBills[0]);
    }
};
