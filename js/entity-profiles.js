/**
 * ENTITY PROFILES
 * Rich context for organizations, legislators, ideologies, and users
 */

const ENTITY_PROFILES = {
    
    // ORGANIZATIONS - Will be populated by research
    organizations: {
        'heal_utah': {
            fullName: 'HEAL Utah',
            emoji: '🌱',
            tagline: 'Healthy Environment, Active Living',
            founded: 2005,
            ideology: 'Progressive/Environmental',
            website: 'https://www.healutah.org',
            
            // To be filled by deep research
            corePrinciples: [
                'Environmental protection and public health',
                'Air quality improvement',
                'Sustainable transportation',
                'Climate action'
            ],
            
            keyIssues: ['Air Quality', 'Climate', 'Public Health', 'Transportation'],
            
            // Stats from our data
            stats: {
                totalBillsTracked: 0, // Will calculate
                supportRate: 0,
                opposeRate: 0,
                topIssues: []
            },
            
            // Will add: legislator scorecards, voting patterns, success rate
            legislatorScores: {}
        },
        
        'libertas_institute': {
            fullName: 'Libertas Institute',
            emoji: '🗽',
            tagline: 'Defending liberty in the Beehive State',
            founded: 2011,
            ideology: 'Libertarian/Free Market',
            website: 'https://libertas.institute',
            
            corePrinciples: [
                'Individual liberty and personal freedom',
                'Free markets and private property',
                'Limited government',
                'Criminal justice reform'
            ],
            
            keyIssues: ['Criminal Justice', 'Economic Freedom', 'Property Rights', 'Education Choice'],
            
            stats: {
                totalBillsTracked: 0,
                supportRate: 0,
                opposeRate: 0,
                topIssues: []
            },
            
            legislatorScores: {}
        },
        
        // ... other orgs will be filled in
    },
    
    // IDEOLOGIES - Template positions
    ideologies: {
        'progressive': {
            name: 'Progressive',
            emoji: '🌊',
            description: 'Social and economic equality, environmental protection, expanded social programs',
            
            // Deep policy principles (to be researched)
            corePrinciples: [
                'Economic equality through progressive taxation',
                'Universal healthcare access',
                'Environmental protection and climate action',
                'Workers rights and union support',
                'Social justice and civil rights',
                'Public education investment'
            ],
            
            keyPolicies: {
                healthcare: 'Support universal healthcare, Medicaid expansion',
                education: 'Increased public education funding, oppose vouchers',
                environment: 'Strong climate action, renewable energy transition',
                labor: 'Support unions, higher minimum wage',
                taxes: 'Progressive taxation, wealth redistribution'
            },
            
            alignedOrgs: ['HEAL Utah', 'Better Utah', 'Planned Parenthood', 'ACLU']
        },
        
        'conservative': {
            name: 'Conservative',
            emoji: '🦅',
            description: 'Limited government, free markets, traditional values, fiscal responsibility',
            
            corePrinciples: [
                'Limited government intervention',
                'Free market capitalism',
                'Individual responsibility',
                'Traditional family values',
                'Strong national defense',
                'Fiscal conservatism'
            ],
            
            keyPolicies: {
                healthcare: 'Market-based solutions, oppose ACA expansion',
                education: 'School choice, local control, oppose federal mandates',
                environment: 'Balance environmental protection with economic growth',
                labor: 'Right-to-work, oppose mandatory unionization',
                taxes: 'Lower taxes, limited government spending'
            },
            
            alignedOrgs: ['Libertas Institute']
        },
        
        'libertarian': {
            name: 'Libertarian',
            emoji: '🗽',
            description: 'Maximum personal freedom, minimal government, individual liberty',
            
            corePrinciples: [
                'Individual sovereignty and personal freedom',
                'Non-aggression principle',
                'Free market without government interference',
                'Personal responsibility',
                'Limited to no government intervention',
                'Civil liberties for all'
            ],
            
            keyPolicies: {
                healthcare: 'Free market healthcare, no mandates',
                education: 'School choice, privatization, end Dept of Education',
                environment: 'Property rights-based solutions, oppose regulations',
                labor: 'Voluntary association, no minimum wage',
                taxes: 'Minimal taxation, smaller government'
            },
            
            alignedOrgs: ['Libertas Institute']
        },
        
        'moderate': {
            name: 'Moderate/Centrist',
            emoji: '⚖️',
            description: 'Pragmatic solutions, balance competing interests, evidence-based policy',
            
            corePrinciples: [
                'Pragmatic problem-solving over ideology',
                'Evidence-based policy',
                'Fiscal responsibility with social investment',
                'Balance individual rights with common good',
                'Bipartisan cooperation',
                'Incremental reform'
            ],
            
            keyPolicies: {
                healthcare: 'Mixed public-private system, targeted reforms',
                education: 'Support public education with some choice options',
                environment: 'Market incentives plus targeted regulation',
                labor: 'Balance worker rights with business needs',
                taxes: 'Balanced budget, targeted tax cuts/increases'
            },
            
            alignedOrgs: []
        }
    },
    
    // LEGISLATOR PROFILES - Will be populated from vote data
    legislators: {},
    
    // USER PROFILE - Generated from quiz
    userProfile: null
};

// Calculate organization stats from bill data
function calculateOrgStats(bills, orgFieldName) {
    const positions = bills.filter(b => b[`${orgFieldName}_position`]);
    const support = positions.filter(b => b[`${orgFieldName}_position`] === 'Support').length;
    const oppose = positions.filter(b => b[`${orgFieldName}_position`] === 'Oppose').length;
    
    return {
        totalBillsTracked: positions.length,
        supportRate: positions.length ? Math.round((support / positions.length) * 100) : 0,
        opposeRate: positions.length ? Math.round((oppose / positions.length) * 100) : 0,
        watchRate: positions.length ? Math.round(((positions.length - support - oppose) / positions.length) * 100) : 0
    };
}

// Generate legislator profile from vote data
function generateLegislatorProfile(legislatorName, voteData) {
    return {
        name: legislatorName,
        party: voteData.party || 'Unknown',
        district: voteData.district || 'Unknown',
        
        votingRecord: {
            totalVotes: voteData.yea_votes.length + voteData.nay_votes.length,
            yeaVotes: voteData.yea_votes.length,
            nayVotes: voteData.nay_votes.length,
            yeaRate: Math.round((voteData.yea_votes.length / (voteData.yea_votes.length + voteData.nay_votes.length)) * 100)
        },
        
        // Will add: top issues, alignment with orgs, policy principles
        topIssues: [],
        orgAlignments: {},
        
        // Placeholder for deep research
        policyPrinciples: [],
        keyVotes: []
    };
}

// Generate user profile from quiz results
function generateUserProfile(quizVotes) {
    const votes = Object.values(quizVotes);
    const support = votes.filter(v => v === 'Support').length;
    const oppose = votes.filter(v => v === 'Oppose').length;
    
    return {
        name: 'You',
        totalVotes: votes.length,
        supportRate: Math.round((support / votes.length) * 100),
        opposeRate: Math.round((oppose / votes.length) * 100),
        
        // Calculate alignment with each ideology
        ideologyAlignment: {
            progressive: 0, // To be calculated
            conservative: 0,
            libertarian: 0,
            moderate: 0
        },
        
        // Top matching legislators
        topMatches: [],
        
        // Analysis of voting patterns
        analysis: generateUserAnalysis(quizVotes)
    };
}

function generateUserAnalysis(quizVotes) {
    // Analyze user's voting patterns
    // This will compare against known org positions to determine leanings
    return {
        summary: 'Based on your votes, you lean...',
        topAgreements: [],
        topDisagreements: [],
        suggestedOrgs: []
    };
}

// Export for use in other modules
if (typeof module !== 'undefined') module.exports = ENTITY_PROFILES;
