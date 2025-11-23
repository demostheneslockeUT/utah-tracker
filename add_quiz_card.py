with open('index.html', 'r') as f:
    content = f.read()

quiz_card = '''
        <!-- Quiz Card -->
        <div class="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-lg p-8 mb-6 text-white">
            <h2 class="text-3xl font-bold mb-3">🗳️ Which Utah Legislators Vote Like You?</h2>
            <p class="text-lg mb-6 opacity-90">Answer 10 quick questions on real Utah bills to see your political matches</p>
            <div class="flex gap-4 items-center">
                <a href="quiz/index.html" class="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 shadow-lg">
                    Take the Quiz →
                </a>
                <span class="text-sm opacity-75">⏱️ Takes 3 minutes</span>
            </div>
        </div>
'''

# Find where to insert (after the filter buttons div closes)
insert_point = content.find('</div>\n\n                <!-- Bills Grid -->')
if insert_point > 0:
    content = content[:insert_point] + '</div>\n' + quiz_card + '\n                <!-- Bills Grid -->' + content[insert_point+len('</div>\n\n                <!-- Bills Grid -->'):]
    
    with open('index.html', 'w') as f:
        f.write(content)
    print("✅ Added quiz card to homepage")
else:
    print("❌ Couldn't find insertion point")
