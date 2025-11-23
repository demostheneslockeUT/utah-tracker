/**
 * Sign-up page logic
 * - Loads organizations dynamically from bills.json
 * - Submits to Google Sheets (your data collection)
 * - Saves to localStorage (their personalized experience)
 */

const ISSUES = [
    'Education', 'Healthcare', 'Environment', 'Taxes', 'Housing',
    'Public Safety', 'Transportation', 'Civil Rights', 'Gun Rights',
    'Immigration', 'Labor/Workers', 'Business/Economy', 'Water',
    'Public Lands', 'Elections'
];

// Will be loaded from bills.json
let ORGANIZATIONS = [];

// Your Google Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrjEY8Ri2hrA3GkIMFvwNDVVV4sWvPkzZeRhGwarg0v3kIRTWhHtRI46IW_1WZKaVHKQ/exec';

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
            console.log(`✅ Loaded ${ORGANIZATIONS.length} organizations from bills.json`);
        } else {
            console.warn('No organizations found in bills.json, using fallback');
            useFallbackOrgs();
        }
    } catch (error) {
        console.error('Failed to load organizations:', error);
        useFallbackOrgs();
    }
    
    // Now populate the form
    populateOrgs();
}

// Fallback if bills.json fails to load
function useFallbackOrgs() {
    ORGANIZATIONS = [
        { name: 'HEAL Utah', emoji: '🌱', id: 'heal_utah' },
        { name: 'Libertas Institute', emoji: '🗽', id: 'libertas' },
        { name: 'Utah Education Association', emoji: '🎓', id: 'utah_education_association' },
        { name: 'ACLU of Utah', emoji: '⚖️', id: 'aclu_of_utah' },
        { name: 'Equality Utah', emoji: '🏳️‍🌈', id: 'equality_utah' }
    ];
}

// Populate issues checkboxes
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

// Populate organizations checkboxes
function populateOrgs() {
    const grid = document.getElementById('orgs-grid');
    if (!grid) return;
    
    if (ORGANIZATIONS.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 text-sm">Loading organizations...</p>';
        return;
    }
    
    grid.innerHTML = ORGANIZATIONS.map(org => `
        <label class="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="orgs" value="${org.id}" class="org-checkbox">
            <span class="text-sm">${org.emoji} ${org.name}</span>
        </label>
    `).join('');
}

// Handle form submission
function setupFormHandler() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.textContent = '⏳ Creating your dashboard...';
        
        const formData = new FormData(form);
        
        // Collect all data - match weekly digest field names
        const userData = {
            Name: formData.get('name'),
            Email: formData.get('email'),
            Zip: formData.get('zip'),
            Phone: formData.get('phone') || '',
            Political_View: formData.get('political_view') || 'Moderate',
            Issues: Array.from(document.querySelectorAll('.issue-checkbox:checked')).map(cb => cb.value).join(', '),
            Followed_Orgs: Array.from(document.querySelectorAll('.org-checkbox:checked')).map(cb => cb.value).join(', '),
            Email_Frequency: mapEmailFrequency(formData.get('email_frequency')),
            Signup_Date: new Date().toISOString(),
            Source: 'Website',
            User_ID: generateUserId()
        };
        
        // Validate orgs selected
        if (!userData.Followed_Orgs) {
            alert('Please select at least one organization to follow');
            btn.disabled = false;
            btn.textContent = '🚀 Create My Dashboard';
            return;
        }
        
        // Save to localStorage (their personalized experience)
        saveUserPreferences(userData);
        
        // Submit to Google Sheets (your data collection)
        try {
            await submitToGoogleSheets(userData);
            console.log('✅ Submitted to Google Sheets');
        } catch (err) {
            console.error('Google Sheets submission failed:', err);
        }
        
        // Redirect to personalized tracker
        window.location.href = 'index.html?welcome=true';
    });
}

// Map form values to weekly digest expected values
function mapEmailFrequency(value) {
    const map = {
        'weekly': 'Weekly Digest',
        'daily': 'Daily Updates',
        'realtime': 'Real-time Alerts',
        'none': 'None'
    };
    return map[value] || 'Weekly Digest';
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function saveUserPreferences(userData) {
    localStorage.setItem('utah_tracker_user', JSON.stringify(userData));
    localStorage.setItem('user_zip', userData.Zip);
    localStorage.setItem('followed_orgs', JSON.stringify(userData.Followed_Orgs.split(', ')));
    localStorage.setItem('user_issues', JSON.stringify(userData.Issues.split(', ')));
    console.log('✅ Saved user preferences to localStorage');
}

async function submitToGoogleSheets(userData) {
    if (!APPS_SCRIPT_URL) {
        console.log('No Apps Script URL configured');
        return;
    }
    
    console.log('Submitting to Google Sheets...');
    
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
