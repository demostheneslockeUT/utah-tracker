/**
 * Bill Detail Page - Utah Legislative Tracker
 */

let currentBill = null;
let billsData = {};
let legislatorsData = {};
let votesData = {};
let summariesData = {};

// Get bill number from URL
function getBillFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('bill');
}

// Get user's vote from localStorage
function getUserVote(billNumber) {
    try {
        const votes = JSON.parse(localStorage.getItem('user_bill_votes') || '{}');
        // Try full format (HB0022) and short format (HB22)
        const shortFormat = billNumber.replace(/([A-Z]+)0+/, '$1');
        return votes[billNumber] || votes[shortFormat] || null;
    } catch {
        return null;
    }
}

// Initialize
async function init() {
    const billNumber = getBillFromURL();
    
    if (!billNumber) {
        showError();
        return;
    }
    
    try {
        const [billsRes, legsRes] = await Promise.all([
            fetch('data/bills.json'),
            fetch('data/legislators.json')
        ]);
        
        const billsJson = await billsRes.json();
        billsData = {};
        billsJson.bills.forEach(b => billsData[b.bill_number] = b);
        
        const legsJson = await legsRes.json();
        legislatorsData = legsJson.legislators;
        
        try {
            const votesRes = await fetch(`data/votes/${billNumber}.json`);
            if (votesRes.ok) {
                votesData = await votesRes.json();
            }
        } catch (e) {
            console.log('No vote data for this bill');
        }
        
        try {
            const sumRes = await fetch('data/bill_summaries.json');
            if (sumRes.ok) {
                const sumData = await sumRes.json(); summariesData = sumData.summaries || {};
            }
        } catch (e) {
            console.log('No summaries available');
        }
        
        currentBill = billsData[billNumber];
        
        if (!currentBill) {
            showError();
            return;
        }
        
        renderBill();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError();
    }
}

function showError() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
}

function getPositionBox(position, label, size = 'normal') {
    if (!position) return '';
    
    let icon;
    if (position === 'Support' || position === 'support') {
        icon = '✅';
    } else if (position === 'Oppose' || position === 'oppose') {
        icon = '❌';
    } else {
        icon = '⚪';
    }
    
    const isAuthor = label === 'author';
    const bgColor = isAuthor ? 'bg-purple-500' : 'bg-orange-400';
    const borderColor = isAuthor ? 'border-purple-600' : 'border-orange-500';
    const sizeClass = size === 'large' ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-xl';
    const tooltipText = isAuthor ? `Author: ${position}` : `Your Vote: ${position}`;
    
    return `
        <div class="relative group">
            <div class="${bgColor} ${borderColor} text-white border-2 ${sizeClass} rounded-lg shadow-lg flex items-center justify-center font-bold cursor-help">
                ${icon}
            </div>
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                ${tooltipText}
            </div>
        </div>
    `;
}

function getUserVoteBox(currentVote, billNumber) {
    const hasVote = currentVote !== null;
    
    if (hasVote) {
        const icon = currentVote === "Support" || currentVote === "support" ? "✅" : 
                     currentVote === "Oppose" || currentVote === "oppose" ? "❌" : "⚪";
        return `
            <div class="relative group">
                <button onclick="toggleDetailVoting()" class="bg-orange-400 border-orange-500 text-white border-2 w-12 h-12 text-2xl rounded-lg shadow-lg flex items-center justify-center font-bold hover:bg-orange-500 transition">
                    ${icon}
                </button>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Your Vote: ${currentVote}
                </div>
                <div id="detailVotingDropdown" class="hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded-lg shadow-xl border-2 border-orange-400 z-30">
                    <button onclick="castDetailVote('Support')" class="block w-full bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg mb-2">✅ Support</button>
                    <button onclick="castDetailVote('Oppose')" class="block w-full bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg mb-2">❌ Oppose</button>
                    <button onclick="castDetailVote('Neutral')" class="block w-full bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded-lg mb-2">⚪ Neutral</button>
                    <button onclick="toggleDetailVoting()" class="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-lg">Cancel</button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="relative group">
                <button onclick="toggleDetailVoting()" class="bg-orange-400 border-orange-500 text-white border-2 w-12 h-12 text-2xl rounded-lg shadow-lg flex items-center justify-center font-bold hover:bg-orange-500 transition">
                    +
                </button>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Add Your Vote
                </div>
                <div id="detailVotingDropdown" class="hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded-lg shadow-xl border-2 border-orange-400 z-30">
                    <button onclick="castDetailVote('Support')" class="block w-full bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg mb-2">✅ Support</button>
                    <button onclick="castDetailVote('Oppose')" class="block w-full bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg mb-2">❌ Oppose</button>
                    <button onclick="castDetailVote('Neutral')" class="block w-full bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded-lg mb-2">⚪ Neutral</button>
                    <button onclick="toggleDetailVoting()" class="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-lg">Cancel</button>
                </div>
            </div>
        `;
    }
}

function toggleDetailVoting() {
    const dropdown = document.getElementById("detailVotingDropdown");
    if (dropdown) dropdown.classList.toggle("hidden");
}

function castDetailVote(position) {
    const billNumber = currentBill.bill_number.replace(/([A-Z]+)0+/, "$1");
    try {
        const votes = JSON.parse(localStorage.getItem("user_bill_votes") || "{}");
        votes[billNumber] = position;
        localStorage.setItem("user_bill_votes", JSON.stringify(votes));
        
        // Re-render position boxes
        const authorPos = currentBill.author_position;
        let positionBoxesHtml = "";
        if (authorPos) {
            positionBoxesHtml += getPositionBox(authorPos, "author", "large");
        }
        positionBoxesHtml += getUserVoteBox(position, billNumber);
        document.getElementById("positionBoxes").innerHTML = positionBoxesHtml;
        
        // Update share button
        updateShareButton();
    } catch (e) {
        console.error("Error saving vote:", e);
    }
}

function renderBill() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('billContent').classList.remove('hidden');
    
    // Basic info
    document.getElementById('billNumber').textContent = currentBill.bill_number;
    document.getElementById('billTitle').textContent = currentBill.title;
    document.title = `${currentBill.bill_number} - Utah Legislative Tracker`;
    
    // Status
    const statusEl = document.getElementById('billStatus');
    const status = currentBill.status || 'Unknown';
    statusEl.textContent = status;
    statusEl.className = 'px-3 py-1 rounded-full text-sm font-semibold ' + getStatusColor(status);
    
    // Sponsor
    document.getElementById('billSponsor').textContent = `👤 ${currentBill.sponsor || 'Unknown sponsor'}`;
    
    // Official link
    document.getElementById('officialLink').href = `https://le.utah.gov/~2025/bills/static/${currentBill.bill_number}.html`;
    
    // Position boxes (author + user)
    const authorPos = currentBill.author_position;
    const userPos = getUserVote(currentBill.bill_number);
    
    let positionBoxesHtml = '';
    if (authorPos) {
        positionBoxesHtml += getPositionBox(authorPos, 'author', 'large');
    }
    // Always show user vote box (with voting UI)
    positionBoxesHtml += getUserVoteBox(userPos, currentBill.bill_number);
    document.getElementById('positionBoxes').innerHTML = positionBoxesHtml;
    
    // AI Summary
    renderSummary();
    
    // Organization positions
    renderOrgPositions();
    
    // Votes
    renderVotes();
    
    // Watchlist button state
    updateWatchlistButton();
    
    // Update share button text
    updateShareButton();
}

function getStatusColor(status) {
    const s = status.toLowerCase();
    if (s.includes('signed') || s.includes('passed') || s.includes('enrolled')) {
        return 'bg-green-100 text-green-800';
    } else if (s.includes('failed') || s.includes('vetoed')) {
        return 'bg-red-100 text-red-800';
    } else if (s.includes('committee')) {
        return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
}

function renderSummary() {
    const summary = summariesData[currentBill.bill_number];
    
    if (summary && summary.plain_summary) {
        // We have an AI-generated summary
        document.getElementById('summaryText').textContent = summary.plain_summary;
        
        // Who's affected
        const affectedEl = document.getElementById('affectedText');
        if (affectedEl && summary.who_affected) {
            affectedEl.textContent = summary.who_affected;
            document.getElementById('whoAffected').classList.remove('hidden');
        }
        
        // Arguments
        const argForEl = document.getElementById('argumentFor');
        const argAgainstEl = document.getElementById('argumentAgainst');
        if (argForEl && summary.argument_for) {
            argForEl.textContent = summary.argument_for;
        }
        if (argAgainstEl && summary.argument_against) {
            argAgainstEl.textContent = summary.argument_against;
        }
        if (summary.argument_for || summary.argument_against) {
            document.getElementById('argumentsGrid').classList.remove('hidden');
        }
        
        // Key question
        const keyQEl = document.getElementById('keyQuestion');
        if (keyQEl && summary.key_question) {
            keyQEl.textContent = summary.key_question;
            document.getElementById('keyQuestionSection').classList.remove('hidden');
        }
        
        // Full bill link
        const fullBillLink = document.getElementById('fullBillLink');
        if (fullBillLink && currentBill.url) {
            fullBillLink.href = currentBill.url;
        }
        
        document.getElementById('aiSummary').classList.remove('hidden');
        document.getElementById('noSummary').classList.add('hidden');
    } else {
        // No AI summary - show fallback
        document.getElementById('fallbackSummary').textContent = 
            currentBill.general_provisions || `This bill addresses: ${currentBill.title}`;
        document.getElementById('aiSummary').classList.add('hidden');
        document.getElementById('noSummary').classList.remove('hidden');
    }
}

function renderOrgPositions() {
    const container = document.getElementById('orgPositions');
    const positions = [];
    
    for (const [key, value] of Object.entries(currentBill)) {
        if (key.endsWith('_position') && value && key !== 'author_position') {
            positions.push({
                field: key,
                position: value,
                name: formatOrgName(key),
                emoji: getOrgEmoji(key)
            });
        }
    }
    
    if (positions.length === 0) {
        container.classList.add('hidden');
        document.getElementById('noPositions').classList.remove('hidden');
        return;
    }
    
    const order = { 'Support': 0, 'Oppose': 1, 'Watching': 2 };
    positions.sort((a, b) => (order[a.position] ?? 3) - (order[b.position] ?? 3));
    
    container.innerHTML = positions.map(pos => {
        const colors = {
            'Support': 'bg-green-100 border-green-400 text-green-800',
            'Oppose': 'bg-red-100 border-red-400 text-red-800',
            'Watching': 'bg-blue-100 border-blue-400 text-blue-800'
        };
        const colorClass = colors[pos.position] || 'bg-gray-100 border-gray-400 text-gray-800';
        
        return `
            <div class="border-2 rounded-lg p-4 ${colorClass}">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">${pos.emoji}</span>
                    <span class="font-semibold">${pos.name}</span>
                </div>
                <div class="text-lg font-bold">${pos.position}</div>
            </div>
        `;
    }).join('');
}

function formatOrgName(field) {
    return field
        .replace('_position', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function getOrgEmoji(field) {
    const emojis = {
        'heal_utah_position': '🌱',
        'libertas_position': '🗽',
        'utah_education_association_position': '🎓',
        'utah_pta_position': '👨‍👩‍👧',
        'utah_league_of_cities_and_towns_position': '🏛️',
        'alliance_for_a_better_utah_position': '📊',
        'aclu_of_utah_position': '⚖️',
        'disability_law_center_position': '♿',
        'chamber_west_position': '🏢',
        'salt_lake_chamber_position': '🏢',
        'utah_farm_bureau_position': '🚜',
        'friends_of_great_salt_lake_position': '💧',
        'breathe_utah_position': '💨',
        'voices_for_utah_children_position': '👶',
        'trans_legislation_tracker_position': '🏳️‍⚧️',
        'sierra_club_utah_position': '🏔️',
        'utah_audubon_council_position': '🦆',
        'climate_utah_position': '🌡️',
        'red_acre_center_position': '🌾',
        'utah_public_employees_association_position': '👔',
        'rural_water_association_of_utah_position': '💧',
        'utah_bankers_association_position': '🏦'
    };
    return emojis[field] || '📋';
}

function renderVotes() {
    const container = document.getElementById('voteBreakdown');
    const legislatorVotesContainer = document.getElementById('voteDetails');
    
    if (!votesData || Object.keys(votesData).length === 0) {
        container.classList.add('hidden');
        document.getElementById('noVotes').classList.remove('hidden');
        return;
    }
    
    const houseVotes = [];
    const senateVotes = [];
    
    for (const [voteId, vote] of Object.entries(votesData)) {
        if (vote.house === 'H') {
            houseVotes.push(vote);
        } else if (vote.house === 'S') {
            senateVotes.push(vote);
        }
    }
    
    let html = '';
    let detailHtml = '';
    
    if (houseVotes.length > 0) {
        const finalVote = houseVotes.find(v => v.is_final) || houseVotes[houseVotes.length - 1];
        html += renderVoteBar('House', finalVote);
        detailHtml += renderVoterLists('House', finalVote);
    }
    
    if (senateVotes.length > 0) {
        const finalVote = senateVotes.find(v => v.is_final) || senateVotes[senateVotes.length - 1];
        html += renderVoteBar('Senate', finalVote);
        detailHtml += renderVoterLists('Senate', finalVote);
    }
    
    container.innerHTML = html;
    
    if (detailHtml) {
        legislatorVotesContainer.innerHTML = detailHtml;
        document.getElementById('legislatorVotes').classList.remove('hidden');
    }
}

function renderVoteBar(chamber, vote) {
    const yeas = vote.yeas_count || 0;
    const nays = vote.nays_count || 0;
    const total = yeas + nays;
    
    if (total === 0) return '';
    
    const yeaPct = Math.round((yeas / total) * 100);
    const nayPct = 100 - yeaPct;
    const passed = yeas > nays;
    
    return `
        <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
                <span class="font-semibold">${chamber}</span>
                <span class="${passed ? 'text-green-600' : 'text-red-600'} font-bold">
                    ${passed ? '✅ Passed' : '❌ Failed'} ${yeas}-${nays}
                </span>
            </div>
            <div class="h-8 flex rounded-lg overflow-hidden">
                <div class="bg-green-500 flex items-center justify-center text-white font-semibold" 
                     style="width: ${yeaPct}%">
                    ${yeaPct > 10 ? `${yeas} Yea` : ''}
                </div>
                <div class="bg-red-500 flex items-center justify-center text-white font-semibold" 
                     style="width: ${nayPct}%">
                    ${nayPct > 10 ? `${nays} Nay` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderVoterLists(chamber, vote) {
    const yeas = vote.yeas || [];
    const nays = vote.nays || [];
    
    if (yeas.length === 0 && nays.length === 0) return '';
    
    return `
        <div>
            <h4 class="font-bold text-lg mb-3">${chamber}</h4>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h5 class="text-green-700 font-semibold mb-2">✅ Yea (${yeas.length})</h5>
                    <div class="text-sm space-y-1 max-h-60 overflow-y-auto">
                        ${yeas.map(name => `<div class="text-gray-700">${name}</div>`).join('')}
                    </div>
                </div>
                <div>
                    <h5 class="text-red-700 font-semibold mb-2">❌ Nay (${nays.length})</h5>
                    <div class="text-sm space-y-1 max-h-60 overflow-y-auto">
                        ${nays.map(name => `<div class="text-gray-700">${name}</div>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Watchlist functions
function getWatchlist() {
    try {
        return JSON.parse(localStorage.getItem('utahTrackerWatchlist') || '[]');
    } catch {
        return [];
    }
}

function saveWatchlist(list) {
    localStorage.setItem('utahTrackerWatchlist', JSON.stringify(list));
}

function toggleWatchlist() {
    const watchlist = getWatchlist();
    const billNum = currentBill.bill_number;
    const index = watchlist.indexOf(billNum);
    
    if (index > -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(billNum);
    }
    
    saveWatchlist(watchlist);
    updateWatchlistButton();
}

function updateWatchlistButton() {
    const btn = document.getElementById('watchlistBtn');
    const watchlist = getWatchlist();
    const isWatched = watchlist.includes(currentBill.bill_number);
    
    if (isWatched) {
        btn.innerHTML = '⭐ On Watchlist';
        btn.className = 'bg-yellow-500 text-white px-4 py-2 rounded';
    } else {
        btn.innerHTML = '☆ Add to Watchlist';
        btn.className = 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-4 py-2 rounded';
    }
}

// Share functions
function getShareMessage() {
    const userPos = getUserVote(currentBill.bill_number);
    const billNum = currentBill.bill_number;
    const title = currentBill.title;
    
    if (userPos === 'support') {
        return `I support ${billNum}: "${title}" - Let's make it pass together! 🗳️`;
    } else if (userPos === 'oppose') {
        return `I oppose ${billNum}: "${title}" - Let's stop this together! 🛑`;
    } else {
        return `Check out ${billNum}: "${title}" - What do you think? 🤔`;
    }
}

function updateShareButton() {
    const userPos = getUserVote(currentBill.bill_number);
    const btn = document.getElementById('shareBtn');
    
    if (userPos === 'support') {
        btn.innerHTML = '🔗 Share (I Support!)';
        btn.className = 'bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold';
    } else if (userPos === 'oppose') {
        btn.innerHTML = '🔗 Share (I Oppose!)';
        btn.className = 'bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold';
    } else {
        btn.innerHTML = '🔗 Share';
        btn.className = 'bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold';
    }
}

function shareBill() {
    const url = window.location.href;
    const text = getShareMessage();
    
    if (navigator.share) {
        navigator.share({ title: currentBill.bill_number, text, url });
    } else {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
}

function copyLink() {
    const text = getShareMessage() + '\n' + window.location.href;
    navigator.clipboard.writeText(text);
    
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    setTimeout(() => btn.innerHTML = originalText, 2000);
}

// Initialize
init();
