/**
 * USER VOTING SYSTEM
 * Allow users to vote Support/Oppose/Neutral on bills
 * Stores in localStorage for comparison tool
 */

class UserVotingSystem {
    constructor() {
        this.votes = this.loadVotes();
    }
    
    loadVotes() {
        const saved = localStorage.getItem('user_bill_votes');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveVotes() {
        localStorage.setItem('user_bill_votes', JSON.stringify(this.votes));
    }
    
    setVote(billNumber, position) {
        this.votes[billNumber] = position;
        this.saveVotes();
    }
    
    getVote(billNumber) {
        return this.votes[billNumber] || null;
    }
    
    removeVote(billNumber) {
        delete this.votes[billNumber];
        this.saveVotes();
    }
    
    getAllVotes() {
        return this.votes;
    }
    
    getVoteCount() {
        return Object.keys(this.votes).length;
    }
    
    getStats() {
        const votes = Object.values(this.votes);
        return {
            total: votes.length,
            support: votes.filter(v => v === 'Support').length,
            oppose: votes.filter(v => v === 'Oppose').length,
            neutral: votes.filter(v => v === 'Neutral').length
        };
    }
}

// Create global instance
const votingSystem = new UserVotingSystem();

// Update vote count display
function updateVoteCountDisplay() {
    const count = votingSystem.getVoteCount();
    const display = document.getElementById('vote-count-display');
    if (display) {
        display.textContent = count;
        if (count > 0) {
            display.classList.remove('hidden');
        }
    }
}

// Toggle voting buttons for a bill
function toggleVotingButtons(billNumber) {
    const container = document.getElementById(`vote-buttons-${billNumber}`);
    const addBtn = document.getElementById(`vote-add-${billNumber}`);
    const selectedIndicator = document.getElementById(`vote-selected-${billNumber}`);
    
    if (container.classList.contains('hidden')) {
        // Show voting buttons
        container.classList.remove('hidden');
        addBtn.classList.add('hidden');
        selectedIndicator.classList.add('hidden');
    } else {
        // Hide voting buttons - show appropriate button based on vote status
        container.classList.add('hidden');
        const hasVote = votingSystem.getVote(billNumber);
        if (hasVote) {
            selectedIndicator.classList.remove('hidden');
            addBtn.classList.add('hidden');
        } else {
            addBtn.classList.remove('hidden');
            selectedIndicator.classList.add('hidden');
        }
    }
}

// Cast a vote
function castVote(billNumber, position) {
    votingSystem.setVote(billNumber, position);
    
    // Update UI
    const container = document.getElementById(`vote-buttons-${billNumber}`);
    const addBtn = document.getElementById(`vote-add-${billNumber}`);
    const selectedIndicator = document.getElementById(`vote-selected-${billNumber}`);
    
    // Hide buttons
    container.classList.add('hidden');
    
    // Show selected position
    addBtn.classList.add('hidden');
    selectedIndicator.classList.remove('hidden');
    selectedIndicator.innerHTML = getVoteIcon(position);
    selectedIndicator.onclick = () => toggleVotingButtons(billNumber);
    
    // Update count
    updateVoteCountDisplay();
}

function getVoteIcon(position) {
    if (position === 'Support') return '✅';
    if (position === 'Oppose') return '❌';
    if (position === 'Neutral') return '⚪';
    return '+';
}

// Check if bill has vote and return icon
function getVoteStatus(billNumber) {
    const vote = votingSystem.getVote(billNumber);
    return vote ? getVoteIcon(vote) : null;
}
