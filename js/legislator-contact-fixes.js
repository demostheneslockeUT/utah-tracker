// Override the renderLegislatorCard function to handle missing data
function renderLegislatorCard(name, info) {
    const party = info.party || 'Unknown';
    const partyColor = party === 'Republican' || party === 'R' ? 'red' : 
                       party === 'Democratic' || party === 'D' ? 'blue' : 'gray';
    
    const email = info.email || '';
    const phone = info.phone || '';
    const website = info.website || '';
    
    return `
        <div class="border rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg">${name}</h3>
                    <p class="text-sm text-${partyColor}-600">${party}</p>
                    ${info.district ? `<p class="text-xs text-gray-600">District ${info.district}</p>` : ''}
                </div>
                ${website ? `
                    <a href="${website}" target="_blank" 
                       class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        Website →
                    </a>
                ` : ''}
            </div>
            
            ${email ? `
                <div class="mb-2">
                    <span class="text-sm font-semibold">Email:</span>
                    <a href="mailto:${email}" class="text-blue-600 hover:text-blue-800 text-sm ml-2">
                        ${email}
                    </a>
                </div>
            ` : '<div class="mb-2 text-sm text-gray-500">No email available</div>'}
            
            ${phone ? `
                <div class="mb-2">
                    <span class="text-sm font-semibold">Phone:</span>
                    <span class="text-sm ml-2">${phone}</span>
                </div>
            ` : ''}
            
            <div class="mt-3 text-xs text-gray-600">
                <strong>Voting Record:</strong> ${info.yea_votes?.length || 0} Yea, ${info.nay_votes?.length || 0} Nay
            </div>
        </div>
    `;
}

// contactLegislatorAboutBill is defined in simple-contact.js
