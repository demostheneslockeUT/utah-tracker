/**
 * BILL SUMMARIES - AI-generated balanced analysis
 * Utah Legislative Tracker
 */

let billSummaries = {};

// Load summaries on page load
async function loadBillSummaries() {
    try {
        const response = await fetch('data/bill_summaries.json');
        const data = await response.json();
        billSummaries = data.summaries || {};
        console.log(`Loaded ${Object.keys(billSummaries).length} bill summaries`);
        return true;
    } catch (error) {
        console.error('Failed to load bill summaries:', error);
        return false;
    }
}

// Check if a bill has a summary
function hasSummary(billNumber) {
    return billSummaries.hasOwnProperty(billNumber);
}

// Get summary for a bill
function getSummary(billNumber) {
    return billSummaries[billNumber] || null;
}

// Render summary badge for bill card
function renderSummaryBadge(billNumber) {
    if (!hasSummary(billNumber)) return '';
    
    return `
        <button onclick="showSummaryModal('${billNumber}'); event.stopPropagation();" 
                class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition"
                title="View AI Summary">
            🤖 AI Summary
        </button>
    `;
}

// Show summary modal
function showSummaryModal(billNumber) {
    const summary = getSummary(billNumber);
    if (!summary) return;
    
    // Create modal if doesn't exist
    let modal = document.getElementById('summary-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'summary-modal';
        modal.className = 'fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4';
        modal.onclick = (e) => {
            if (e.target === modal) closeSummaryModal();
        };
        document.body.appendChild(modal);
    }
    
    const positions = summary.positions || {};
    const supportOrgs = Object.entries(positions).filter(([_, pos]) => pos === 'Support').map(([org]) => org);
    const opposeOrgs = Object.entries(positions).filter(([_, pos]) => pos === 'Oppose').map(([org]) => org);
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="p-6 md:p-8">
                <!-- Header -->
                <div class="flex items-start justify-between mb-6">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-2xl">🤖</span>
                            <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">AI Summary</span>
                            ${summary.controversy_score ? `<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">🔥 Controversial</span>` : ''}
                        </div>
                        <h2 class="text-xl font-bold text-navy">${billNumber}</h2>
                        <p class="text-gray-600">${summary.title || ''}</p>
                    </div>
                    <button onclick="closeSummaryModal()" class="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>
                
                <!-- Plain Summary -->
                <div class="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 class="font-semibold text-navy mb-2">📋 What This Bill Does</h3>
                    <p class="text-gray-700">${summary.plain_summary || 'No summary available.'}</p>
                </div>
                
                <!-- Who's Affected -->
                <div class="mb-6">
                    <h3 class="font-semibold text-navy mb-2">👥 Who's Affected</h3>
                    <p class="text-gray-700">${summary.who_affected || 'Not specified.'}</p>
                </div>
                
                <!-- Arguments Grid -->
                <div class="grid md:grid-cols-2 gap-4 mb-6">
                    <!-- For -->
                    <div class="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 class="font-semibold text-green-800 mb-2">✅ Argument For</h3>
                        <p class="text-green-900 text-sm mb-3">${summary.argument_for || 'Not available.'}</p>
                        ${supportOrgs.length > 0 ? `
                            <div class="border-t border-green-200 pt-2 mt-2">
                                <p class="text-xs text-green-700 font-medium">Organizations Supporting:</p>
                                <p class="text-xs text-green-600">${supportOrgs.join(', ')}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Against -->
                    <div class="bg-red-50 rounded-xl p-4 border border-red-200">
                        <h3 class="font-semibold text-red-800 mb-2">❌ Argument Against</h3>
                        <p class="text-red-900 text-sm mb-3">${summary.argument_against || 'Not available.'}</p>
                        ${opposeOrgs.length > 0 ? `
                            <div class="border-t border-red-200 pt-2 mt-2">
                                <p class="text-xs text-red-700 font-medium">Organizations Opposing:</p>
                                <p class="text-xs text-red-600">${opposeOrgs.join(', ')}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Key Question -->
                <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-6">
                    <h3 class="font-semibold text-yellow-800 mb-2">🤔 Key Question to Consider</h3>
                    <p class="text-yellow-900 italic">${summary.key_question || 'What do you think?'}</p>
                </div>
                
                <!-- Footer -->
                <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <p class="text-xs text-gray-500">
                        Generated by Claude AI • For informational purposes only
                    </p>
                    ${summary.url ? `
                        <a href="${summary.url}" target="_blank" 
                           class="inline-flex items-center gap-1 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition">
                            View Full Bill Text ↗
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Close on Escape
    document.addEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') closeSummaryModal();
}

function closeSummaryModal() {
    const modal = document.getElementById('summary-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    document.removeEventListener('keydown', handleEscapeKey);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadBillSummaries);
