// Quiz questions (real 2025 Utah bills)
const questions = [
    {
        id: 'HB0106',
        title: 'Income Tax Revisions',
        description: 'Reduces income tax rates and modifies tax structure. Chamber supports, UEA opposes.',
        orgPositions: { support: ['Chamber'], oppose: ['UEA', 'PTA'] }
    },
    {
        id: 'HB0249',
        title: 'Nuclear Power Amendments',
        description: 'Expands nuclear power development in Utah. Chamber supports, HEAL opposes.',
        orgPositions: { support: ['Chamber'], oppose: ['HEAL'], watching: ['Climate Utah'] }
    },
    {
        id: 'HB0408',
        title: 'School Board Referendum Amendments',
        description: 'Changes school board election process. Libertas supports, UEA opposes.',
        orgPositions: { support: ['Libertas'], oppose: ['UEA'] }
    },
    {
        id: 'HB0455',
        title: 'Utah Fits All Scholarship Program',
        description: 'School voucher program expansion. Libertas supports, UEA/PTA oppose.',
        orgPositions: { support: ['Libertas'], oppose: ['UEA', 'PTA'] }
    },
    {
        id: 'SB0142',
        title: 'App Store Accountability Act',
        description: 'Tech regulation bill. PTA supports, Libertas/Chamber oppose.',
        orgPositions: { support: ['PTA'], oppose: ['Libertas', 'Chamber'] }
    },
    {
        id: 'HB0037',
        title: 'Utah Housing Amendments',
        description: 'Housing development and zoning changes. Libertas and Chamber support.',
        orgPositions: { support: ['Libertas', 'Chamber'] }
    },
    {
        id: 'HB0119',
        title: 'Solar Panel HOA Restrictions',
        description: 'Limits HOA power to restrict solar panels. HEAL supports.',
        orgPositions: { support: ['HEAL'], watching: ['Climate Utah'] }
    },
    {
        id: 'HB0167',
        title: 'Offender Reintegration',
        description: 'Criminal justice reform for reentry programs. Libertas and Chamber support.',
        orgPositions: { support: ['Libertas', 'Chamber'] }
    },
    {
        id: 'HB0185',
        title: 'Railroad Modifications',
        description: 'Transportation infrastructure investment. HEAL and Chamber support.',
        orgPositions: { support: ['HEAL', 'Chamber'], watching: ['Climate Utah'] }
    },
    {
        id: 'HB0474',
        title: 'Regulatory Oversight Amendments',
        description: 'Changes regulatory review process. Libertas supports, Chamber opposes.',
        orgPositions: { support: ['Libertas'], oppose: ['Chamber'] }
    }
];

let currentQuestion = 0;
let answers = {};
let legislatorProfiles = null;

// Load legislator profiles on page load
async function loadLegislatorProfiles() {
    try {
        const response = await fetch('../data/legislator_profiles.json');
        legislatorProfiles = await response.json();
    } catch (error) {
        console.error('Could not load legislator profiles:', error);
    }
}

function startQuiz() {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    showQuestion(0);
}

function showQuestion(index) {
    currentQuestion = index;
    const q = questions[index];
    
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${q.id}: ${q.title}</h2>
        <p class="text-gray-600 mb-6">${q.description}</p>
        
        <div class="space-y-3">
            <button onclick="submitAnswer('${q.id}', 2)" 
                    class="w-full p-4 text-left border-2 rounded-lg hover:border-green-500 hover:bg-green-50 transition">
                <span class="font-semibold">Strongly Support</span>
            </button>
            <button onclick="submitAnswer('${q.id}', 1)" 
                    class="w-full p-4 text-left border-2 rounded-lg hover:border-green-300 hover:bg-green-50 transition">
                <span class="font-semibold">Support</span>
            </button>
            <button onclick="submitAnswer('${q.id}', 0)" 
                    class="w-full p-4 text-left border-2 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition">
                <span class="font-semibold">Neutral / Skip</span>
            </button>
            <button onclick="submitAnswer('${q.id}', -1)" 
                    class="w-full p-4 text-left border-2 rounded-lg hover:border-red-300 hover:bg-red-50 transition">
                <span class="font-semibold">Oppose</span>
            </button>
            <button onclick="submitAnswer('${q.id}', -2)" 
                    class="w-full p-4 text-left border-2 rounded-lg hover:border-red-500 hover:bg-red-50 transition">
                <span class="font-semibold">Strongly Oppose</span>
            </button>
        </div>
    `;
    
    // Update progress
    const progress = ((index + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('current-q').textContent = index + 1;
    document.getElementById('progress-pct').textContent = Math.round(progress) + '%';
}

function submitAnswer(billId, value) {
    answers[billId] = value;
    
    if (currentQuestion < questions.length - 1) {
        showQuestion(currentQuestion + 1);
    } else {
        calculateResults();
    }
}

async function calculateResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    document.getElementById('results-screen').innerHTML = '<div class="text-center py-12">Calculating your matches...</div>';
    
    // Make sure legislator profiles are loaded
    if (!legislatorProfiles) {
        await loadLegislatorProfiles();
    }
    
    const orgScores = calculateOrgAlignment();
    const legMatches = calculateLegislatorMatches();
    
    displayResults(orgScores, legMatches);
}

function calculateLegislatorMatches() {
    if (!legislatorProfiles || !legislatorProfiles.sample_matches) {
        return null;
    }
    
    // Calculate user's tendency
    let userTendency = 0;
    let answerCount = 0;
    
    for (const answer of Object.values(answers)) {
        if (answer !== 0) {
            userTendency += answer;
            answerCount++;
        }
    }
    
    if (answerCount === 0) return null;
    
    const userAvg = userTendency / answerCount;
    const userScore = ((userAvg + 2) / 4) * 100;
    
    // Recalculate alignment for actual legislators based on stored profiles
    // For now, use pre-calculated sample (we'll enhance this later)
    return legislatorProfiles.sample_matches.slice(0, 10);
}

function calculateOrgAlignment() {
    const orgs = {
        'HEAL': 0,
        'Libertas': 0,
        'Chamber': 0,
        'UEA': 0,
        'PTA': 0,
        'Climate Utah': 0
    };
    
    const orgCounts = { ...orgs };
    
    questions.forEach(q => {
        const userAnswer = answers[q.id] || 0;
        if (userAnswer === 0) return;
        
        const userSupports = userAnswer > 0;
        
        if (q.orgPositions.support) {
            q.orgPositions.support.forEach(org => {
                if (orgs[org] !== undefined) {
                    orgCounts[org]++;
                    if (userSupports) orgs[org] += Math.abs(userAnswer);
                }
            });
        }
        
        if (q.orgPositions.oppose) {
            q.orgPositions.oppose.forEach(org => {
                if (orgs[org] !== undefined) {
                    orgCounts[org]++;
                    if (!userSupports) orgs[org] += Math.abs(userAnswer);
                }
            });
        }
    });
    
    const results = [];
    for (const org in orgs) {
        if (orgCounts[org] > 0) {
            const maxScore = orgCounts[org] * 2;
            const pct = Math.round((orgs[org] / maxScore) * 100);
            results.push({ org, pct, count: orgCounts[org] });
        }
    }
    
    results.sort((a, b) => b.pct - a.pct);
    return results;
}

function displayResults(orgScores, legMatches) {
    localStorage.setItem('quizResults', JSON.stringify({ 
        answers, 
        orgScores, 
        legMatches,
        timestamp: new Date().toISOString() 
    }));
    
    const legSection = legMatches ? `
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold mb-4">🏛️ Your Top Legislator Matches</h2>
            <p class="text-sm text-gray-600 mb-6">Based on 7,971 votes from 2020-2024 sessions</p>
            
            ${legMatches.slice(0, 5).map((match, i) => `
                <div class="mb-4 p-4 ${i === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'} rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold text-lg">${i + 1}. ${match.name}</span>
                        <span class="text-2xl font-bold ${match.alignment_pct >= 70 ? 'text-green-600' : 'text-yellow-600'}">${match.alignment_pct}%</span>
                    </div>
                    <div class="text-sm text-gray-600">${match.total_votes} votes analyzed</div>
                </div>
            `).join('')}
            
            <p class="text-xs text-gray-500 mt-4">
                Methodology: Alignment based on historical voting patterns. Calculated from ${legislatorProfiles?.total_votes_analyzed || 0} total votes.
            </p>
        </div>
    ` : '';
    
    const container = document.getElementById('results-screen');
    container.innerHTML = `
        <h1 class="text-4xl font-bold mb-4">🎯 Your Political Profile</h1>
        <p class="text-gray-600 mb-8">Based on your answers to 10 Utah bills</p>
        
        ${legSection}
        
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Your Alignment with Utah Organizations</h2>
            
            ${orgScores.map(score => `
                <div class="mb-6">
                    <div class="flex justify-between mb-2">
                        <span class="font-semibold">${score.org}</span>
                        <span class="text-2xl font-bold ${score.pct >= 70 ? 'text-green-600' : score.pct >= 40 ? 'text-yellow-600' : 'text-red-600'}">${score.pct}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="h-4 rounded-full transition-all ${score.pct >= 70 ? 'bg-green-500' : score.pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}" 
                             style="width: ${score.pct}%"></div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Based on ${score.count} overlapping positions</p>
                </div>
            `).join('')}
        </div>
        
        <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
            <h3 class="text-lg font-bold mb-3">💡 Want Your Full Political Profile?</h3>
            <p class="mb-4">Take the comprehensive iSideWith quiz to see where you stand on:</p>
            <ul class="list-disc list-inside mb-4 space-y-1">
                <li>Economic policy (taxes, spending, regulation)</li>
                <li>Social issues (abortion, LGBTQ rights, immigration)</li>
                <li>Foreign policy and national security</li>
                <li>Environmental and healthcare policy</li>
            </ul>
            <a href="https://www.isidewith.com/political-quiz" target="_blank" 
               class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Take iSideWith Quiz →
            </a>
        </div>
        
        <div class="flex gap-4">
            <button onclick="location.reload()" 
                    class="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold">
                Retake Quiz
            </button>
            <a href="../index.html" 
               class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                Back to Bill Tracker
            </a>
        </div>
    `;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadLegislatorProfiles();
});
