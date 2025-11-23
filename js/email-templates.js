/**
 * EMAIL TEMPLATE GENERATOR
 * Generate personalized emails to legislators based on user's vote
 */

function generateEmailTemplate(bill, userPosition, legislatorName) {
    const subject = `${userPosition === 'Support' ? 'Support' : 'Opposition to'} ${bill.bill_number}: ${bill.title}`;
    
    let body = `Dear ${legislatorName},\n\n`;
    
    if (userPosition === 'Support') {
        body += `I am writing to express my strong support for ${bill.bill_number}, "${bill.title}".\n\n`;
        body += `I believe this legislation is important because:\n\n`;
        body += `[Please add your reasons here - why do you support this bill?]\n\n`;
        body += `I urge you to vote YES on ${bill.bill_number}.\n\n`;
    } else if (userPosition === 'Oppose') {
        body += `I am writing to express my concerns about ${bill.bill_number}, "${bill.title}".\n\n`;
        body += `I have reservations about this legislation because:\n\n`;
        body += `[Please add your concerns here - why do you oppose this bill?]\n\n`;
        body += `I urge you to vote NO on ${bill.bill_number}.\n\n`;
    } else {
        body += `I am writing regarding ${bill.bill_number}, "${bill.title}".\n\n`;
        body += `I wanted to share my thoughts on this legislation:\n\n`;
        body += `[Please add your thoughts here]\n\n`;
    }
    
    body += `As your constituent, I hope you will consider my perspective on this important issue.\n\n`;
    body += `Thank you for your service to our community.\n\n`;
    body += `Sincerely,\n`;
    body += `[Your Name]\n`;
    body += `[Your Address]\n`;
    body += `[Your City, ZIP]`;
    
    return { subject, body };
}

function openEmailToLegislator(bill, legislatorEmail, legislatorName, userPosition) {
    if (!legislatorEmail) {
        alert('Email not available for this legislator. Please visit their website to contact them.');
        return;
    }
    
    const template = generateEmailTemplate(bill, userPosition, legislatorName);
    const mailtoLink = `mailto:${legislatorEmail}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
    
    window.open(mailtoLink, '_blank');
}

function showEmailPreview(bill, legislatorName, userPosition) {
    const template = generateEmailTemplate(bill, userPosition, legislatorName);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">📧 Email Template</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-1">Subject:</label>
                    <div class="p-3 bg-gray-50 rounded border text-sm">${template.subject}</div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-1">Message:</label>
                    <textarea class="w-full p-3 border rounded text-sm font-mono" rows="15">${template.body}</textarea>
                </div>
                
                <div class="bg-yellow-50 p-3 rounded mb-4 text-sm">
                    <strong>💡 Tip:</strong> Personalize this template with your own reasons and story. 
                    Personal messages are more effective than generic ones!
                </div>
                
                <div class="flex gap-3">
                    <button onclick="copyTemplate('${template.subject}', '${template.body}')" 
                            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        📋 Copy to Clipboard
                    </button>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyTemplate(subject, body) {
    const text = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('Template copied to clipboard! Paste it into your email client.');
    });
}
