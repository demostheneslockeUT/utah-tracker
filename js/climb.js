/**
 * CLIMB THE LADDER - Challenge Your Assumptions
 * Utah Legislative Tracker
 */

// State
let allPrompts = [];
let userProfile = null;
let currentFilter = 'all';
// Helper: Convert to title case
function toTitleCase(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

// Helper: Determine if prompt is fact or idea
function getPromptCategory(promptType) {
    const facts = ['statistic', 'economic', 'historical', 'comparison'];
    const ideas = ['question', 'scenario', 'perspective', 'practical'];
    
    if (facts.includes(promptType)) return { label: 'Fact', color: 'blue', icon: '📊' };
    if (ideas.includes(promptType)) return { label: 'Idea', color: 'purple', icon: '💭' };
    return { label: 'Prompt', color: 'gray', icon: '💬' };
}



// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadPrompts();
    loadUserProfile();
    renderAssessmentBanner();
    renderChallenge();
    renderTopicFilters();
    renderPrompts();
    renderProgress();
    setupEventListeners();
});

// Load prompts from JSON
async function loadPrompts() {
    try {
        const response = await fetch('data/prompts.json');
        const data = await response.json();
        allPrompts = data.prompts;
        console.log(`Loaded ${allPrompts.length} prompts`);
    } catch (error) {
        console.error('Failed to load prompts:', error);
        allPrompts = [];
    }
}

// Load user profile from localStorage
function loadUserProfile() {
    const stored = localStorage.getItem('climb_user_profile');
    if (stored) {
        userProfile = JSON.parse(stored);
    } else {
        userProfile = {
            prompts_viewed: [],
            prompts_reflected: [],
            assessment_scores: null,
            provocative_tolerance: 3,
            session_count: 0,
            last_visit: null
        };
    }
    
    // Increment session count
    userProfile.session_count++;
    userProfile.last_visit = new Date().toISOString();
    saveUserProfile();
}

// Save user profile
function saveUserProfile() {
    localStorage.setItem('climb_user_profile', JSON.stringify(userProfile));
}

// Check if user has taken assessment
function hasAssessmentScores() {
    // Check for rung assessment data
    const rungData = localStorage.getItem('rung_assessment_results');
    if (rungData) {
        userProfile.assessment_scores = JSON.parse(rungData);
        return true;
    }
    return false;
}

// Get user's weak topics (low rung scores)
function getWeakTopics() {
    if (!userProfile.assessment_scores) return [];
    
    const topicMapping = {
        'healthcare': ['Healthcare'],
        'education': ['Education'],
        'immigration': ['Immigration'],
        'guns': ['Gun Control'],
        'abortion': ['Abortion'],
        'housing': ['Housing'],
        'climate': ['Environment'],
        'taxes': ['Tax Policy']
    };
    
    const weakTopics = [];
    const scores = userProfile.assessment_scores;
    
    Object.entries(scores).forEach(([topic, score]) => {
        if (score <= 4 && topicMapping[topic]) {
            weakTopics.push(...topicMapping[topic]);
        }
    });
    
    return weakTopics;
}

// Render assessment connection banner
function renderAssessmentBanner() {
    const banner = document.getElementById('banner-content');
    
    if (hasAssessmentScores()) {
        const weakTopics = getWeakTopics();
        if (weakTopics.length > 0) {
            banner.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">🎯</span>
                    <div>
                        <p class="font-semibold text-navy">Personalized challenges ready!</p>
                        <p class="text-sm text-gray-600">Based on your assessment, we're targeting: ${weakTopics.join(', ')}</p>
                    </div>
                </div>
                <a href="tools/rung-assessment.html" class="text-sm text-navy underline">Retake assessment</a>
            `;
        } else {
            banner.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">⭐</span>
                    <p class="text-navy">Great scores! Explore all topics to stay sharp.</p>
                </div>
            `;
        }
    } else {
        banner.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-2xl">📋</span>
                <div>
                    <p class="font-semibold text-navy">Take the Rung Assessment first!</p>
                    <p class="text-sm text-gray-600">Get personalized challenges based on your tribal triggers.</p>
                </div>
            </div>
            <a href="tools/rung-assessment.html" class="bg-navy text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
                Take Assessment →
            </a>
        `;
    }
}

// Render the main challenge card
function renderChallenge() {
    const container = document.getElementById('challenge-container');
    const prompt = selectChallengePrompt();
    
    if (!prompt) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p>No new challenges available. You've seen them all!</p>
                <button onclick="resetChallenges()" class="mt-4 text-navy underline">Reset progress</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="fade-in">
            <div class="flex items-center gap-2 flex-wrap mb-4">
                <span class="px-3 py-1 bg-navy/10 text-navy rounded-full text-sm font-medium">${prompt.topic}</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">${toTitleCase(prompt.subtopic)}</span>
                <span class="px-3 py-1 bg-${getPromptCategory(prompt.prompt_type).color}-100 text-${getPromptCategory(prompt.prompt_type).color}-700 rounded-full text-sm font-medium">${getPromptCategory(prompt.prompt_type).icon} ${getPromptCategory(prompt.prompt_type).label}</span>
                ${renderProvocativeLevel(prompt.provocative_level)}
            </div>
            
            <p class="text-xl md:text-2xl text-gray-800 leading-relaxed mb-6">
                "${prompt.prompt_text}"
            </p>
            
            ${prompt.source_name !== 'Author' ? `
                <p class="text-sm text-gray-500 mb-6">
                    Source: ${prompt.source_name}
                    ${prompt.source_url ? `<a href="${prompt.source_url}" target="_blank" class="text-navy underline ml-1">↗</a>` : ''}
                </p>
            ` : ''}
            
            <div class="flex flex-wrap gap-3">
                <button onclick="markReflected(${prompt.id})" class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
                    <span>✓</span> I reflected on this
                </button>
                <button onclick="skipChallenge(${prompt.id})" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition">
                    Skip for now
                </button>
                <button onclick="showNextChallenge()" class="text-navy underline px-4 py-3">
                    Show different challenge
                </button>
            </div>
        </div>
    `;
}

// Select a challenge prompt (prioritize weak topics)
function selectChallengePrompt() {
    let available = allPrompts.filter(p => !userProfile.prompts_viewed.includes(p.id));
    
    if (available.length === 0) return null;
    
    // Calculate max provocative level based on progress
    const maxLevel = Math.min(
        userProfile.provocative_tolerance + Math.floor(userProfile.session_count / 5),
        8
    );
    
    available = available.filter(p => p.provocative_level <= maxLevel);
    
    if (available.length === 0) {
        // If all filtered out, allow higher levels
        available = allPrompts.filter(p => !userProfile.prompts_viewed.includes(p.id));
    }
    
    // Prioritize weak topics if assessment taken
    const weakTopics = getWeakTopics();
    if (weakTopics.length > 0) {
        const weakPrompts = available.filter(p => weakTopics.includes(p.topic));
        if (weakPrompts.length > 0) {
            available = weakPrompts;
        }
    }
    
    // Weighted random (prefer lower provocative levels)
    return weightedRandomPrompt(available);
}

// Weighted random selection
function weightedRandomPrompt(prompts) {
    if (prompts.length === 0) return null;
    
    const weights = prompts.map(p => 11 - p.provocative_level);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < prompts.length; i++) {
        random -= weights[i];
        if (random <= 0) return prompts[i];
    }
    
    return prompts[prompts.length - 1];
}

// Render provocative level indicator
function renderProvocativeLevel(level) {
    const color = level <= 3 ? 'green' : level <= 6 ? 'yellow' : 'red';
    const label = level <= 3 ? 'Gentle' : level <= 6 ? 'Moderate' : 'Challenging';
    
    return `
        <span class="flex items-center gap-1 text-sm text-gray-500">
            <span class="w-2 h-2 rounded-full bg-${color}-500"></span>
            ${label} (${level}/10)
        </span>
    `;
}

// Mark prompt as reflected
function markReflected(promptId) {
    if (!userProfile.prompts_viewed.includes(promptId)) {
        userProfile.prompts_viewed.push(promptId);
    }
    if (!userProfile.prompts_reflected.includes(promptId)) {
        userProfile.prompts_reflected.push(promptId);
        userProfile.provocative_tolerance = Math.min(userProfile.provocative_tolerance + 0.2, 10);
    }
    saveUserProfile();
    renderChallenge();
    renderPrompts();
    renderProgress();
}

// Skip challenge
function skipChallenge(promptId) {
    if (!userProfile.prompts_viewed.includes(promptId)) {
        userProfile.prompts_viewed.push(promptId);
    }
    saveUserProfile();
    renderChallenge();
    renderPrompts();
    renderProgress();
}

// Show next challenge without marking current
function showNextChallenge() {
    renderChallenge();
}

// Reset challenges
function resetChallenges() {
    userProfile.prompts_viewed = [];
    userProfile.prompts_reflected = [];
    saveUserProfile();
    renderChallenge();
    renderPrompts();
    renderProgress();
}

// Render topic filter pills
function renderTopicFilters() {
    const container = document.getElementById('topic-filters');
    const topics = [...new Set(allPrompts.map(p => p.topic))].sort();
    
    let html = `
        <button onclick="filterByTopic('all')" class="topic-pill px-4 py-2 rounded-full border border-navy text-navy font-medium ${currentFilter === 'all' ? 'active' : ''}">
            All Topics
        </button>
    `;
    
    topics.forEach(topic => {
        const count = allPrompts.filter(p => p.topic === topic).length;
        html += `
            <button onclick="filterByTopic('${topic}')" class="topic-pill px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium ${currentFilter === topic ? 'active' : ''}">
                ${topic} (${count})
            </button>
        `;
    });
    
    container.innerHTML = html;
}

// Filter prompts by topic
function filterByTopic(topic) {
    currentFilter = topic;
    renderTopicFilters();
    renderPrompts();
}

// Render prompts grid
function renderPrompts() {
    const container = document.getElementById('prompts-grid');
    const noPrompts = document.getElementById('no-prompts');
    const hideSeen = document.getElementById('hide-seen')?.checked || false;
    const sortBy = document.getElementById('sort-select')?.value || 'provocative-asc';
    
    let prompts = [...allPrompts];
    
    // Filter by topic
    if (currentFilter !== 'all') {
        prompts = prompts.filter(p => p.topic === currentFilter);
    }
    
    // Hide seen
    if (hideSeen) {
        prompts = prompts.filter(p => !userProfile.prompts_viewed.includes(p.id));
    }
    
    // Sort
    switch (sortBy) {
        case 'provocative-asc':
            prompts.sort((a, b) => a.provocative_level - b.provocative_level);
            break;
        case 'provocative-desc':
            prompts.sort((a, b) => b.provocative_level - a.provocative_level);
            break;
        case 'topic':
            prompts.sort((a, b) => a.topic.localeCompare(b.topic));
            break;
        case 'random':
            prompts.sort(() => Math.random() - 0.5);
            break;
    }
    
    if (prompts.length === 0) {
        container.innerHTML = '';
        noPrompts.classList.remove('hidden');
        return;
    }
    
    noPrompts.classList.add('hidden');
    
    container.innerHTML = prompts.map(prompt => `
        <div class="prompt-card bg-white rounded-xl shadow-md p-6 cursor-pointer ${userProfile.prompts_viewed.includes(prompt.id) ? 'opacity-60' : ''}"
             onclick="openPromptModal(${prompt.id})">
            <div class="flex items-center justify-between mb-3">
                <span class="px-3 py-1 bg-navy/10 text-navy rounded-full text-sm font-medium">${prompt.topic}</span>
                ${renderProvocativeLevel(prompt.provocative_level)}
            </div>
            <p class="text-gray-800 line-clamp-3 mb-3">"${prompt.prompt_text.substring(0, 150)}${prompt.prompt_text.length > 150 ? '...' : ''}"</p>
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">${prompt.prompt_type}</span>
                ${userProfile.prompts_reflected.includes(prompt.id) ? 
                    '<span class="text-green-600 font-medium">✓ Reflected</span>' : 
                    userProfile.prompts_viewed.includes(prompt.id) ? 
                    '<span class="text-gray-400">Viewed</span>' : 
                    '<span class="text-navy font-medium">New</span>'
                }
            </div>
        </div>
    `).join('');
}

// Open prompt modal
function openPromptModal(promptId) {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const modal = document.getElementById('prompt-modal');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2 flex-wrap">
                <span class="px-3 py-1 bg-navy/10 text-navy rounded-full text-sm font-medium">${prompt.topic}</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">${toTitleCase(prompt.subtopic)}</span>
                <span class="px-3 py-1 bg-${getPromptCategory(prompt.prompt_type).color}-100 text-${getPromptCategory(prompt.prompt_type).color}-700 rounded-full text-sm font-medium">${getPromptCategory(prompt.prompt_type).icon} ${getPromptCategory(prompt.prompt_type).label}</span>
            </div>
            <button onclick="closePromptModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        <div class="mb-6">
            ${renderProvocativeLevel(prompt.provocative_level)}
        </div>
        
        <p class="text-xl text-gray-800 leading-relaxed mb-6">
            "${prompt.prompt_text}"
        </p>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-600 mb-2"><strong>Type:</strong> ${prompt.prompt_type}</p>
            <p class="text-sm text-gray-600 mb-2"><strong>Challenges:</strong> ${prompt.stance_target} perspective</p>
            ${prompt.source_name !== 'Author' ? `
                <p class="text-sm text-gray-600">
                    <strong>Source:</strong> ${prompt.source_name}
                    ${prompt.source_url ? `<a href="${prompt.source_url}" target="_blank" class="text-navy underline ml-1">View source ↗</a>` : ''}
                </p>
            ` : '<p class="text-sm text-gray-600"><strong>Source:</strong> Original content</p>'}
        </div>
        
        <div class="flex flex-wrap gap-2 mb-6">
            ${prompt.tags.map(tag => `<span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#${tag}</span>`).join('')}
        </div>
        
        <div class="flex flex-wrap gap-3">
            <button onclick="markReflected(${prompt.id}); closePromptModal();" class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
                <span>✓</span> I reflected on this
            </button>
            <button onclick="closePromptModal()" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition">
                Close
            </button>
        </div>
    `;
    
    // Mark as viewed
    if (!userProfile.prompts_viewed.includes(promptId)) {
        userProfile.prompts_viewed.push(promptId);
        saveUserProfile();
        renderPrompts();
        renderProgress();
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Close prompt modal
function closePromptModal() {
    const modal = document.getElementById('prompt-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Render progress stats
function renderProgress() {
    const container = document.getElementById('progress-stats');
    
    const viewed = userProfile.prompts_viewed.length;
    const reflected = userProfile.prompts_reflected.length;
    const total = allPrompts.length;
    const tolerance = userProfile.provocative_tolerance.toFixed(1);
    
    container.innerHTML = `
        <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-3xl font-bold text-navy">${viewed}</p>
            <p class="text-sm text-gray-600">Prompts Viewed</p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-3xl font-bold text-green-600">${reflected}</p>
            <p class="text-sm text-gray-600">Reflected On</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-3xl font-bold text-gray-700">${total - viewed}</p>
            <p class="text-sm text-gray-600">Remaining</p>
        </div>
        <div class="text-center p-4 bg-gold/10 rounded-lg">
            <p class="text-3xl font-bold text-gold">${tolerance}</p>
            <p class="text-sm text-gray-600">Challenge Level</p>
        </div>
    `;
}

// Clear seen prompts
function clearSeenPrompts() {
    userProfile.prompts_viewed = [];
    saveUserProfile();
    renderPrompts();
    renderProgress();
}

// Setup event listeners
function setupEventListeners() {
    // Hide seen checkbox
    document.getElementById('hide-seen')?.addEventListener('change', renderPrompts);
    
    // Sort select
    document.getElementById('sort-select')?.addEventListener('change', renderPrompts);
    
    // Modal close on backdrop click
    document.getElementById('prompt-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'prompt-modal') {
            closePromptModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePromptModal();
        }
    });
}
