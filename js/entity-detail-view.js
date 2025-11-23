/**
 * ENTITY DETAIL VIEW
 * Shows rich profile when entity is selected
 */

function showEntityDetail(entityType, entityId, targetElement) {
    const profile = getEntityProfile(entityType, entityId);
    
    if (!profile) {
        targetElement.innerHTML = '<p class="text-gray-600">No profile available</p>';
        return;
    }
    
    let html = '';
    
    if (entityType === 'organization') {
        html = renderOrgProfile(profile);
    } else if (entityType === 'legislator') {
        html = renderLegislatorProfile(profile);
    } else if (entityType === 'ideology') {
        html = renderIdeologyProfile(profile);
    } else if (entityType === 'user') {
        html = renderUserProfile(profile);
    }
    
    targetElement.innerHTML = html;
}

function renderOrgProfile(org) {
    return `
        <div class="bg-white rounded-lg border p-4 space-y-3">
            <div class="flex items-start justify-between">
                <div>
                    <div class="text-2xl">${org.emoji}</div>
                    <h3 class="font-bold text-lg">${org.fullName}</h3>
                    <p class="text-sm text-gray-600">${org.tagline}</p>
                </div>
                <a href="${org.website}" target="_blank" class="text-blue-600 text-sm">
                    Website →
                </a>
            </div>
            
            <div class="border-t pt-3">
                <div class="text-xs font-semibold text-gray-500 mb-2">CORE PRINCIPLES</div>
                <ul class="text-sm space-y-1">
                    ${org.corePrinciples.map(p => `<li>• ${p}</li>`).join('')}
                </ul>
            </div>
            
            <div class="border-t pt-3">
                <div class="text-xs font-semibold text-gray-500 mb-2">VOTING RECORD</div>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <div class="text-2xl font-bold text-gray-700">${org.stats.totalBillsTracked}</div>
                        <div class="text-xs text-gray-600">Bills Tracked</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-green-600">${org.stats.supportRate}%</div>
                        <div class="text-xs text-gray-600">Support Rate</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-red-600">${org.stats.opposeRate}%</div>
                        <div class="text-xs text-gray-600">Oppose Rate</div>
                    </div>
                </div>
            </div>
            
            <div class="bg-blue-50 p-3 rounded text-xs">
                <strong>Key Issues:</strong> ${org.keyIssues.join(', ')}
            </div>
        </div>
    `;
}

function renderIdeologyProfile(ideology) {
    return `
        <div class="bg-white rounded-lg border p-4 space-y-3">
            <div>
                <div class="text-2xl mb-1">${ideology.emoji}</div>
                <h3 class="font-bold text-lg">${ideology.name}</h3>
                <p class="text-sm text-gray-600">${ideology.description}</p>
            </div>
            
            <div class="border-t pt-3">
                <div class="text-xs font-semibold text-gray-500 mb-2">CORE PRINCIPLES</div>
                <ul class="text-sm space-y-1">
                    ${ideology.corePrinciples.slice(0, 4).map(p => `<li>• ${p}</li>`).join('')}
                </ul>
            </div>
            
            <div class="border-t pt-3">
                <div class="text-xs font-semibold text-gray-500 mb-2">KEY POLICY POSITIONS</div>
                <div class="space-y-2 text-sm">
                    ${Object.entries(ideology.keyPolicies).slice(0, 3).map(([area, position]) => `
                        <div>
                            <strong class="capitalize">${area}:</strong> ${position}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${ideology.alignedOrgs.length > 0 ? `
                <div class="bg-purple-50 p-3 rounded text-xs">
                    <strong>Similar to:</strong> ${ideology.alignedOrgs.join(', ')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderLegislatorProfile(leg) {
    return `
        <div class="bg-white rounded-lg border p-4 space-y-3">
            <div>
                <h3 class="font-bold text-lg">${leg.name}</h3>
                <p class="text-sm text-gray-600">${leg.party} • ${leg.district}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
                <div class="text-center">
                    <div class="text-2xl font-bold text-gray-700">${leg.votingRecord.totalVotes}</div>
                    <div class="text-xs text-gray-600">Total Votes</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${leg.votingRecord.yeaRate}%</div>
                    <div class="text-xs text-gray-600">Yea Rate</div>
                </div>
            </div>
            
            <div class="bg-blue-50 p-3 rounded text-xs">
                <strong>Note:</strong> Full policy analysis coming soon
            </div>
        </div>
    `;
}

function renderUserProfile(user) {
    return `
        <div class="bg-white rounded-lg border p-4 space-y-3">
            <div>
                <h3 class="font-bold text-lg">Your Quiz Results</h3>
                <p class="text-sm text-gray-600">Based on ${user.totalVotes} votes</p>
            </div>
            
            <div class="grid grid-cols-2 gap-3 text-center">
                <div>
                    <div class="text-2xl font-bold text-green-600">${user.supportRate}%</div>
                    <div class="text-xs text-gray-600">Support Rate</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-red-600">${user.opposeRate}%</div>
                    <div class="text-xs text-gray-600">Oppose Rate</div>
                </div>
            </div>
            
            <div class="bg-purple-50 p-3 rounded text-xs">
                ${user.analysis.summary}
            </div>
        </div>
    `;
}

function getEntityProfile(entityType, entityId) {
    if (entityType === 'organization') {
        return ENTITY_PROFILES.organizations[entityId];
    } else if (entityType === 'ideology') {
        return ENTITY_PROFILES.ideologies[entityId];
    } else if (entityType === 'legislator') {
        return ENTITY_PROFILES.legislators[entityId];
    } else if (entityType === 'user') {
        return ENTITY_PROFILES.userProfile;
    }
    return null;
}
