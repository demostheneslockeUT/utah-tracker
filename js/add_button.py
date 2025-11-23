with open('app.js', 'r') as f:
    content = f.read()

# Find the closing div of the card (before </div>)
# Add button before the final closing div

old_section = '''            ` : '<div class="text-gray-400 text-xs mt-3">No positions tracked</div>'}
        </div>
    `;'''

new_section = '''            ` : '<div class="text-gray-400 text-xs mt-3">No positions tracked</div>'}
            
            ${billTopicMap[bill.bill_number] ? `
                <button onclick="showOtherSide('${bill.bill_number}')" 
                        class="mt-4 w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded text-sm font-semibold border border-purple-200 transition-colors">
                    🤔 What does the other side say?
                </button>
            ` : ''}
        </div>
    `;'''

content = content.replace(old_section, new_section)

with open('app.js', 'w') as f:
    f.write(content)

print("✅ Added Other Side button")
