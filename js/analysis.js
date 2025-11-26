/**
 * Policy Analysis Page - Utah Legislative Tracker
 */

let languageData = {};
let fiscalData = {};
let billsData = {};

function getBillFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('bill');
}

async function init() {
    const billNumber = getBillFromURL();
    
    if (!billNumber) {
        showError("No bill specified");
        return;
    }
    
    try {
        const [langRes, fiscalRes, billsRes] = await Promise.all([
            fetch('data/bill_language.json'),
            fetch('data/fiscal_notes.json'),
            fetch('data/bills.json')
        ]);
        
        languageData = await langRes.json();
        fiscalData = await fiscalRes.json();
        const billsJson = await billsRes.json();
        billsData = {};
        billsJson.bills.forEach(b => billsData[b.bill_number] = b);
        
        renderBillHeader(billNumber);
        renderLanguageAnalysis(billNumber);
        renderFiscalAnalysis(billNumber);
        
    } catch (err) {
        console.error('Error loading data:', err);
        showError("Failed to load analysis data");
    }
}

function renderBillHeader(billNumber) {
    const bill = billsData[billNumber];
    
    document.getElementById('billNumber').textContent = billNumber;
    document.getElementById('billTitle').textContent = bill ? bill.title : 'Bill not found';
    document.getElementById('backToBill').href = `bill.html?bill=${billNumber}`;
    document.title = `${billNumber} Analysis | Utah Legislative Tracker`;
}

function renderFiscalAnalysis(billNumber) {
    const fiscal = fiscalData.notes?.[billNumber];
    const bill = billsData[billNumber];
    const container = document.getElementById('fiscalContent');
    
    if (!fiscal) {
        container.innerHTML = `
            <div class="text-center py-6 text-slate-500">
                <p class="text-3xl mb-2">📊</p>
                <p>No detailed fiscal note available.</p>
                ${bill?.fiscal_note_html ? `<a href="${bill.fiscal_note_html}" target="_blank" class="text-blue-600 hover:underline text-sm">View official fiscal note →</a>` : ''}
            </div>
        `;
        return;
    }
    
    // Impact badge color
    const impactColors = {
        'Minimal': 'bg-gray-100 text-gray-700',
        'Low': 'bg-green-100 text-green-700',
        'Medium': 'bg-yellow-100 text-yellow-700',
        'High': 'bg-orange-100 text-orange-700',
        'Very High': 'bg-red-100 text-red-700'
    };
    const impactClass = impactColors[fiscal.impact_level] || 'bg-gray-100 text-gray-700';
    
    let html = `
        <!-- Impact Badge -->
        <div class="flex items-center gap-3 mb-4">
            <span class="px-4 py-2 rounded-full font-bold ${impactClass}">
                ${fiscal.impact_level} Fiscal Impact
            </span>
            ${bill?.fiscal_note_html ? `<a href="${bill.fiscal_note_html}" target="_blank" class="text-blue-600 hover:underline text-sm">View full fiscal note →</a>` : ''}
        </div>
    `;
    
    // Expenditure/Revenue table
    if (Object.keys(fiscal.total_expenditures).length > 0 || Object.keys(fiscal.total_revenues).length > 0) {
        const years = fiscal.fiscal_years.slice(0, 3);
        
        html += `
            <div class="overflow-x-auto mb-4">
                <table class="w-full text-sm border-collapse">
                    <thead>
                        <tr class="bg-slate-100">
                            <th class="text-left p-2 border">Category</th>
                            ${years.map(y => `<th class="text-right p-2 border">FY${y}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Revenues row
        if (Object.keys(fiscal.total_revenues).length > 0) {
            html += `<tr class="bg-green-50">
                <td class="p-2 border font-medium text-green-700">Total Revenues</td>`;
            years.forEach(y => {
                const val = fiscal.total_revenues[`FY${y}`] || '$0';
                html += `<td class="p-2 border text-right text-green-700">${val}</td>`;
            });
            html += `</tr>`;
        }
        
        // Expenditures row
        if (Object.keys(fiscal.total_expenditures).length > 0) {
            html += `<tr class="bg-red-50">
                <td class="p-2 border font-medium text-red-700">Total Expenditures</td>`;
            years.forEach(y => {
                const val = fiscal.total_expenditures[`FY${y}`] || '$0';
                html += `<td class="p-2 border text-right text-red-700">${val}</td>`;
            });
            html += `</tr>`;
        }
        
        // Net impact row
        if (Object.keys(fiscal.net_impact).length > 0) {
            html += `<tr class="bg-slate-50 font-bold">
                <td class="p-2 border">Net Impact</td>`;
            years.forEach(y => {
                const val = fiscal.net_impact[`FY${y}`] || '-';
                const isNegative = val.includes('(') || val.includes('-');
                const colorClass = isNegative ? 'text-red-600' : 'text-green-600';
                html += `<td class="p-2 border text-right ${colorClass}">${val}</td>`;
            });
            html += `</tr>`;
        }
        
        html += `</tbody></table></div>`;
    }
    
    // Summary
    if (fiscal.summary) {
        html += `
            <div class="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-slate-700 mb-2">Summary</h4>
                <p class="text-sm text-slate-600">${fiscal.summary}</p>
            </div>
        `;
    }
    
    // Impact on different groups
    const impacts = [
        { label: '🏛️ Local Government', value: fiscal.local_government },
        { label: '👥 Individuals & Businesses', value: fiscal.individuals_businesses },
        { label: '📋 Regulatory Impact', value: fiscal.regulatory_impact }
    ].filter(i => i.value && i.value.length > 10);
    
    if (impacts.length > 0) {
        html += `<div class="space-y-2">`;
        impacts.forEach(impact => {
            html += `
                <div class="border-l-4 border-slate-300 pl-3 py-1">
                    <span class="font-medium text-slate-700">${impact.label}:</span>
                    <span class="text-sm text-slate-600 ml-1">${impact.value}</span>
                </div>
            `;
        });
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

function renderLanguageAnalysis(billNumber) {
    const analysis = languageData.analyses?.[billNumber];
    const container = document.getElementById('analysisContent');
    
    if (!analysis) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-500">
                <p class="text-4xl mb-3">📊</p>
                <p>Language analysis not available for this bill.</p>
            </div>
        `;
        return;
    }
    
    const totals = analysis.totals;
    const total = totals.mandatory + totals.prohibited + totals.discretionary;
    
    const mandatoryPct = total > 0 ? (totals.mandatory / total * 100).toFixed(0) : 0;
    const prohibitedPct = total > 0 ? (totals.prohibited / total * 100).toFixed(0) : 0;
    const discretionaryPct = total > 0 ? (totals.discretionary / total * 100).toFixed(0) : 0;
    
    let html = `
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="tooltip-container bg-green-50 border border-green-200 rounded-lg p-4 text-center cursor-help">
                <div class="tooltip">Government MUST do this. Required by law.</div>
                <div class="text-3xl font-bold text-green-600">${totals.mandatory}</div>
                <div class="text-sm text-green-700">Mandatory</div>
                <div class="text-xs text-slate-500">SHALL / MUST</div>
            </div>
            <div class="tooltip-container bg-red-50 border border-red-200 rounded-lg p-4 text-center cursor-help">
                <div class="tooltip">This action is FORBIDDEN by law.</div>
                <div class="text-3xl font-bold text-red-600">${totals.prohibited}</div>
                <div class="text-sm text-red-700">Prohibited</div>
                <div class="text-xs text-slate-500">SHALL NOT / MAY NOT</div>
            </div>
            <div class="tooltip-container bg-blue-50 border border-blue-200 rounded-lg p-4 text-center cursor-help">
                <div class="tooltip">Agency CAN do this, but doesn't have to.</div>
                <div class="text-3xl font-bold text-blue-600">${totals.discretionary}</div>
                <div class="text-sm text-blue-700">Discretionary</div>
                <div class="text-xs text-slate-500">MAY</div>
            </div>
        </div>
        
        <div class="mb-6">
            <div class="text-sm text-slate-600 mb-2">Language Distribution</div>
            <div class="flex rounded-lg overflow-hidden h-8">
                <div class="bg-green-500 flex items-center justify-center text-white text-xs font-bold" 
                     style="width: ${mandatoryPct}%">${mandatoryPct > 10 ? mandatoryPct + '%' : ''}</div>
                <div class="bg-red-500 flex items-center justify-center text-white text-xs font-bold" 
                     style="width: ${prohibitedPct}%">${prohibitedPct > 10 ? prohibitedPct + '%' : ''}</div>
                <div class="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" 
                     style="width: ${discretionaryPct}%">${discretionaryPct > 10 ? discretionaryPct + '%' : ''}</div>
            </div>
            <div class="flex justify-between text-xs text-slate-500 mt-1">
                <span>Mandatory (${mandatoryPct}%)</span>
                <span>Prohibited (${prohibitedPct}%)</span>
                <span>Discretionary (${discretionaryPct}%)</span>
            </div>
        </div>
    `;
    
    let interpretation = '';
    if (totals.mandatory > totals.discretionary * 2) {
        interpretation = `<strong>Highly prescriptive bill.</strong> Creates many mandatory requirements with limited agency discretion.`;
    } else if (totals.discretionary > totals.mandatory) {
        interpretation = `<strong>Discretionary framework.</strong> Gives agencies significant flexibility in implementation.`;
    } else {
        interpretation = `<strong>Balanced approach.</strong> Mixes mandatory requirements with some agency discretion.`;
    }
    
    html += `
        <div class="bg-slate-100 rounded-lg p-4 mb-6">
            <div class="text-sm text-slate-700">${interpretation}</div>
        </div>
        <div class="space-y-4">
    `;
    
    if (analysis.shall.sentences.length > 0) {
        html += renderSentenceSection('Mandatory Actions (SHALL)', analysis.shall.sentences, 'mandatory', 'shall');
    }
    if (analysis.shall_not.sentences.length > 0 || analysis.may_not.sentences.length > 0) {
        const prohibited = [...(analysis.shall_not.sentences || []), ...(analysis.may_not.sentences || [])];
        html += renderSentenceSection('Prohibited Actions', prohibited, 'prohibited', 'prohibited');
    }
    if (analysis.may.sentences.length > 0) {
        html += renderSentenceSection('Discretionary Actions (MAY)', analysis.may.sentences, 'discretionary', 'may');
    }
    
    html += `</div>`;
    container.innerHTML = html;
}

function renderSentenceSection(title, sentences, type, id) {
    if (!sentences || sentences.length === 0) return '';
    
    const colorClass = {
        'mandatory': 'text-green-700',
        'prohibited': 'text-red-700',
        'discretionary': 'text-blue-700'
    }[type];
    
    const visibleCount = 4;
    const hasMore = sentences.length > visibleCount;
    
    let html = `
        <div>
            <h4 class="font-semibold ${colorClass} mb-2">${title} (${sentences.length})</h4>
            <div class="space-y-2">
                ${sentences.slice(0, visibleCount).map(s => `
                    <div class="sentence-card ${type} text-sm text-slate-700 p-3 rounded">
                        "${s}${s.endsWith('...') ? '' : '...'}"
                    </div>
                `).join('')}
    `;
    
    if (hasMore) {
        html += `
                <div id="${id}-more" class="hidden space-y-2">
                    ${sentences.slice(visibleCount).map(s => `
                        <div class="sentence-card ${type} text-sm text-slate-700 p-3 rounded">
                            "${s}${s.endsWith('...') ? '' : '...'}"
                        </div>
                    `).join('')}
                </div>
                <button onclick="toggleMore('${id}')" id="${id}-btn" 
                        class="text-sm ${colorClass} hover:underline font-medium mt-2">
                    Show ${sentences.length - visibleCount} more ▼
                </button>
        `;
    }
    
    html += `</div></div>`;
    return html;
}

function toggleMore(id) {
    const moreDiv = document.getElementById(`${id}-more`);
    const btn = document.getElementById(`${id}-btn`);
    
    if (moreDiv.classList.contains('hidden')) {
        moreDiv.classList.remove('hidden');
        btn.textContent = 'Show less ▲';
    } else {
        moreDiv.classList.add('hidden');
        const count = moreDiv.querySelectorAll('.sentence-card').length;
        btn.textContent = `Show ${count} more ▼`;
    }
}

function showError(message) {
    document.getElementById('billNumber').textContent = 'Error';
    document.getElementById('billTitle').textContent = message;
}

document.addEventListener('DOMContentLoaded', init);
