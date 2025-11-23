/**
 * Show author position in bill cards
 */

// Add this to your existing app.js or include separately

function renderBillCard(bill) {
    const card = document.createElement('div');
    card.className = 'bill-card bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition';
    
    // Bill number and title
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold mb-2';
    title.textContent = `${bill.bill_number}: ${bill.title}`;
    card.appendChild(title);
    
    // Author position (if exists)
    if (bill.author_position && bill.author_position.trim()) {
        const authorDiv = document.createElement('div');
        authorDiv.className = 'mb-3 p-3 rounded-lg border-2 border-yellow-400 bg-yellow-50';
        
        const authorLabel = document.createElement('div');
        authorLabel.className = 'text-xs font-bold text-yellow-800 mb-1';
        authorLabel.textContent = '✍️ AUTHOR\'S POSITION';
        
        const authorPosition = document.createElement('div');
        authorPosition.className = 'font-bold text-yellow-900';
        
        // Color code the position
        const pos = bill.author_position.toLowerCase();
        if (pos.includes('support')) {
            authorPosition.className = 'font-bold text-green-700';
            authorPosition.textContent = '✅ ' + bill.author_position;
        } else if (pos.includes('oppose')) {
            authorPosition.className = 'font-bold text-red-700';
            authorPosition.textContent = '❌ ' + bill.author_position;
        } else if (pos.includes('watch')) {
            authorPosition.className = 'font-bold text-blue-700';
            authorPosition.textContent = '👀 ' + bill.author_position;
        } else {
            authorPosition.textContent = bill.author_position;
        }
        
        authorDiv.appendChild(authorLabel);
        authorDiv.appendChild(authorPosition);
        card.appendChild(authorDiv);
    }
    
    // Organization positions
    const orgsDiv = document.createElement('div');
    orgsDiv.className = 'flex flex-wrap gap-2 mb-2';
    
    const orgFields = [
        'heal_utah_position',
        'libertas_institute_position',
        'utah_education_association_position',
        'planned_parenthood_action_utah_position',
        'utah_pta_position',
        'utah_league_of_cities_and_towns_position',
        'alliance_for_a_better_utah_position'
    ];
    
    orgFields.forEach(field => {
        if (bill[field]) {
            const badge = document.createElement('span');
            const orgName = field.replace('_position', '').replace(/_/g, ' ');
            
            let bgColor = 'bg-gray-200 text-gray-700';
            if (bill[field] === 'Support') bgColor = 'bg-green-100 text-green-800';
            else if (bill[field] === 'Oppose') bgColor = 'bg-red-100 text-red-800';
            else if (bill[field] === 'Watching') bgColor = 'bg-blue-100 text-blue-800';
            
            badge.className = `px-2 py-1 rounded text-xs ${bgColor}`;
            badge.textContent = `${orgName}: ${bill[field]}`;
            orgsDiv.appendChild(badge);
        }
    });
    
    card.appendChild(orgsDiv);
    
    // Status
    const status = document.createElement('div');
    status.className = 'text-sm text-gray-600 mt-2';
    status.textContent = `Status: ${bill.status || 'Unknown'}`;
    card.appendChild(status);
    
    return card;
}
