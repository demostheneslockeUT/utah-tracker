/**
 * Sign-up page logic
 * - Loads organizations dynamically from bills.json
 * - Submits to Google Sheets via Apps Script
 * - Saves to localStorage for personalized experience
 */

const ISSUES = [
    'Education', 'Healthcare', 'Environment', 'Taxes', 'Housing',
    'Public Safety', 'Transportation', 'Civil Rights', 'Gun Rights',
    'Immigration', 'Labor/Workers', 'Business/Economy', 'Water',
    'Public Lands', 'Elections'
];

let ORGANIZATIONS = [];

// Your Google Apps Script URL - handles form submissions
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyp0Qyv8W72mP80YG8tzutT3Xwz1Wj1flqCubvu-2ZhWqDXoMA9T-yiuZ4jzOU-lhMs2g/exec';

// Load organizations from bills.json
async function loadOrganizations() {
    try {
        const response = await fetch('data/bills.json');
        const data = await response.json();
        
        if (data.organizations && data.organizations.length > 0) {
            ORGANIZATIONS = data.organizations.map(org => ({
                name: org.name,
                emoji: org.emoji,
                id: org.field_name
            }));
            console.log(`✅ Loaded ${ORGANIZATIONS.length} organizations`);
        } else {
            useFallbackOrgs();
        }
    } catch (error) {
        console.error('Failed to load organizations:', error);
        useFallbackOrgs();
    }
    populateOrgs();
}

function useFallbackOrgs() {
    ORGANIZATIONS = [
        { name: 'HEAL Utah', emoji: '🌱', id: 'heal_utah' },
        { name: 'Libertas Institute', emoji: '🗽', id: 'libertas' },
        { name: 'Utah Education Association', emoji: '🎓', id: 'utah_education_association' },
        { name: 'ACLU of Utah', emoji: '⚖️', id: 'aclu_of_utah' },
        { name: 'Equality Utah', emoji: '🏳️‍🌈', id: 'equality_utah' },
        { name: 'Salt Lake Chamber', emoji: '🏢', id: 'salt_lake_chamber' }
    ];
}

function populateIssues() {
    const grid = document.getElementById('issues-grid');
    if (!grid) return;
    
    grid.innerHTML = ISSUES.map(issue => `
        <label class="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="issues" value="${issue}" class="issue-checkbox">
            <span class="text-sm">${issue}</span>
        </label>
    `).join('');

    // Limit to 5 selections
    grid.addEventListener('change', (e) => {
        const checked = grid.querySelectorAll('input:checked');
        if (checked.length > 5) {
            e.target.checked = false;
            alert('Please select up to 5 issues');
        }
    });
}

function populateOrgs() {
    const grid = document.getElementById('orgs-grid');
    if (!grid) return;
    
    if (ORGANIZATIONS.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 text-sm">Loading...</p>';
        return;
    }
    
    grid.innerHTML = ORGANIZATIONS.map(org => `
        <label class="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="orgs" value="${org.id}" class="org-checkbox">
            <span class="text-sm">${org.emoji} ${org.name}</span>
        </label>
    `).join('');
}

function setupFormHandler() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.textContent = '⏳ Signing you up...';
        
        const formData = new FormData(form);
        
        // Collect data - field names match Google Sheet columns
        const userData = {
            // Required
            Name: formData.get('name'),
            Email: formData.get('email'),
            ZIP: formData.get('zip'),
            Followed_Orgs: Array.from(document.querySelectorAll('.org-checkbox:checked'))
                .map(cb => cb.value).join(', '),
            Email_Frequency: mapEmailFrequency(formData.get('email_frequency')),
            
            // Optional
            Phone: formData.get('phone') || '',
            User_Type: formData.get('user_type') || '',
            Political_Views: formData.get('political_view') || 'Moderate',
            Top_Issues: Array.from(document.querySelectorAll('.issue-checkbox:checked'))
                .map(cb => cb.value).join(', '),
            
            // Auto-generated
            Timestamp: new Date().toISOString(),
            User_ID: generateUserId(),
            Source: 'Website'
        };
        
        // Validate required fields
        if (!userData.Followed_Orgs) {
            alert('Please select at least one organization to follow');
            btn.disabled = false;
            btn.textContent = '🚀 Sign Me Up';
            return;
        }
        
        // Save to localStorage first (instant personalization)
        saveUserPreferences(userData);
        
        // Submit to Google Sheets
        try {
            await submitToGoogleSheets(userData);
            console.log('✅ Submitted to Google Sheets');
            
            // Show success message
            form.classList.add('hidden');
            document.getElementById('success-message').classList.remove('hidden');
            
        } catch (err) {
            console.error('Submission error:', err);
            // Still show success since localStorage saved
            form.classList.add('hidden');
            document.getElementById('success-message').classList.remove('hidden');
        }
    });
}

function mapEmailFrequency(value) {
    const map = {
        'weekly': 'Weekly Digest',
        'daily': 'Daily Updates',
        'none': 'None'
    };
    return map[value] || 'Weekly Digest';
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function saveUserPreferences(userData) {
    // Main user object
    localStorage.setItem('utah_tracker_user', JSON.stringify(userData));
    
    // Quick-access items for other pages
    localStorage.setItem('user_zip', userData.ZIP);
    localStorage.setItem('user_name', userData.Name);
    localStorage.setItem('user_email', userData.Email);
    localStorage.setItem('followed_orgs', JSON.stringify(userData.Followed_Orgs.split(', ')));
    
    if (userData.Top_Issues) {
        localStorage.setItem('user_issues', JSON.stringify(userData.Top_Issues.split(', ')));
    }
    
    console.log('✅ Saved to localStorage');
}

async function submitToGoogleSheets(userData) {
    if (!APPS_SCRIPT_URL) {
        console.log('No Apps Script URL configured');
        return;
    }
    
    console.log('Submitting to Google Sheets...', userData);
    
    // Using no-cors mode since Apps Script doesn't support CORS
    // The response won't be readable but data will be saved
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    
    return response;
}

// Initialize
populateIssues();
loadOrganizations();
setupFormHandler();
