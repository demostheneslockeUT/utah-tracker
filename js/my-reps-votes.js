/**
 * MY REPS VOTING DISPLAY
 * Shows how user's legislators voted on each bill
 */

class MyRepsVotes {
    constructor() {
        this.legislators = null;
        this.userSenator = null;
        this.userRep = null;
        this.loaded = false;
    }

    async init() {
        try {
            // Load legislator vote data
            const response = await fetch('data/compare_data.json');
            const data = await response.json();
            this.legislators = data.legislators;
            
            // Get user's legislators from localStorage
            this.loadUserLegislators();
            
            this.loaded = true;
            console.log('✅ My Reps Votes loaded');
            console.log(`   Senator: ${this.userSenator || 'Not set'}`);
            console.log(`   Rep: ${this.userRep || 'Not set'}`);
            
            return true;
        } catch (error) {
            console.error('Error loading My Reps data:', error);
            return false;
        }
    }

    loadUserLegislators() {
        // Try to get from ZIP mapping first
        const userZip = localStorage.getItem('user_zip');
        if (userZip) {
            this.loadFromZip(userZip);
        }
        
        // Allow manual override
        const manualSenator = localStorage.getItem('my_senator');
        const manualRep = localStorage.getItem('my_rep');
        if (manualSenator) this.userSenator = manualSenator;
        if (manualRep) this.userRep = manualRep;
    }

    async loadFromZip(zip) {
        try {
            const response = await fetch('data/zip-to-legislators.json');
            const data = await response.json();
            const legislators = data.zip_mappings[zip];
            
            if (legislators && legislators.length >= 2) {
                // Match ZIP names to our data format
                this.userSenator = this.matchLegislatorName(legislators[0]);
                this.userRep = this.matchLegislatorName(legislators[1]);
            }
        } catch (error) {
            console.error('Error loading ZIP mapping:', error);
        }
    }

    matchLegislatorName(zipName) {
        // Convert "Sen. Luz Escamilla" or "Rep. Sandra Hollins" to our format
        if (!zipName || !this.legislators) return null;
        
        // Extract last name
        const parts = zipName.replace('Sen. ', '').replace('Rep. ', '').split(' ');
        const lastName = parts[parts.length - 1];
        
        // Find in our legislators
        for (const [name, data] of Object.entries(this.legislators)) {
            if (name.includes(lastName)) {
                return name;
            }
        }
        return null;
    }

    getVote(legName, billNumber) {
        if (!legName || !this.legislators || !this.legislators[legName]) {
            return null;
        }
        
        const leg = this.legislators[legName];
        if (leg.yea_votes && leg.yea_votes.includes(billNumber)) {
            return 'Yea';
        }
        if (leg.nay_votes && leg.nay_votes.includes(billNumber)) {
            return 'Nay';
        }
        return null; // No vote recorded
    }

    // Get HTML for bill card bubbles
    getBubblesHTML(billNumber) {
        if (!this.loaded) return '';
        
        let html = '';
        
        // Senator bubble (if they have a vote)
        if (this.userSenator) {
            const senVote = this.getVote(this.userSenator, billNumber);
            if (senVote) {
                const colorClass = senVote === 'Yea' 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-red-100 text-red-800 border-red-300';
                const voteIcon = senVote === 'Yea' ? '👍' : '👎';
                html += `<span class="inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${colorClass}" title="${this.userSenator}: ${senVote}">🏛️ My Senator ${voteIcon}</span> `;
            }
        }
        
        // Rep bubble (if they have a vote)
        if (this.userRep) {
            const repVote = this.getVote(this.userRep, billNumber);
            if (repVote) {
                const colorClass = repVote === 'Yea' 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-red-100 text-red-800 border-red-300';
                const voteIcon = repVote === 'Yea' ? '👍' : '👎';
                html += `<span class="inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${colorClass}" title="${this.userRep}: ${repVote}">👤 My Rep ${voteIcon}</span> `;
            }
        }
        
        return html;
    }

    // Set legislators manually (for settings page)
    setMyLegislators(senator, rep) {
        if (senator) {
            this.userSenator = senator;
            localStorage.setItem('my_senator', senator);
        }
        if (rep) {
            this.userRep = rep;
            localStorage.setItem('my_rep', rep);
        }
        console.log('✅ Updated My Legislators:', this.userSenator, this.userRep);
    }

    // Check if user has legislators set
    hasLegislators() {
        return this.userSenator || this.userRep;
    }
}

// Global instance
const myRepsVotes = new MyRepsVotes();

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    myRepsVotes.init();
});

// Make globally available
window.myRepsVotes = myRepsVotes;
