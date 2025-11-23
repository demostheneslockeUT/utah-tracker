/**
 * LEGISLATOR MATCH FINDER
 * Users answer how they'd vote on bills, then see which legislators match
 */

class LegislatorMatcher {
    constructor() {
        this.legislators = {};
        this.bills = {};
        this.userVotes = {};
    }
    
    async loadData() {
        // Load legislators
        const legResponse = await fetch('data/legislators.json');
        const legData = await legResponse.json();
        this.legislators = legData.legislators;
        
        // Load bills
        const billResponse = await fetch('data/bills.json');
        const billData = await billResponse.json();
        this.bills = billData.bills;
        
        console.log(`Loaded ${Object.keys(this.legislators).length} legislators`);
        console.log(`Loaded ${this.bills.length} bills`);
    }
    
    getQuizBills(count = 20) {
        /**
         * Get bills for quiz - prioritize:
         * 1. Controversial bills (orgs disagree)
         * 2. Bills with many org positions
         * 3. Bills that were actually voted on
         */
        
        const votedBills = this.bills.filter(bill => {
            // Has vote data
            const hasVotes = (bill.house_votes_for || 0) + (bill.house_votes_against || 0) > 0;
            
            // Has org positions
            const positionCount = Object.keys(bill).filter(k => 
                k.endsWith('_position') && bill[k]
            ).length;
            
            return hasVotes && positionCount >= 2;
        });
        
        // Score by controversy and org interest
        const scored = votedBills.map(bill => {
            const positions = Object.keys(bill)
                .filter(k => k.endsWith('_position') && bill[k])
                .map(k => bill[k]);
            
            const hasSupport = positions.includes('Support');
            const hasOppose = positions.includes('Oppose');
            const controversial = hasSupport && hasOppose ? 2 : 0;
            
            return {
                bill,
                score: controversial + positions.length
            };
        });
        
        // Sort and take top N
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, count).map(s => s.bill);
    }
    
    recordVote(billNumber, vote) {
        /**
         * Record user's vote: 'yea', 'nay', or 'skip'
         */
        this.userVotes[billNumber] = vote;
    }
    
    calculateMatches() {
        /**
         * Calculate alignment with each legislator
         * Returns sorted array of {name, matchPct, agreements, disagreements}
         */
        
        const results = [];
        
        for (const [name, legislator] of Object.entries(this.legislators)) {
            let agreements = 0;
            let disagreements = 0;
            let compared = 0;
            
            for (const [billNum, userVote] of Object.entries(this.userVotes)) {
                if (userVote === 'skip') continue;
                
                const legVotedYea = legislator.yea_votes.includes(billNum);
                const legVotedNay = legislator.nay_votes.includes(billNum);
                
                if (!legVotedYea && !legVotedNay) continue; // Legislator didn't vote
                
                compared++;
                
                if (userVote === 'yea' && legVotedYea) agreements++;
                else if (userVote === 'nay' && legVotedNay) agreements++;
                else disagreements++;
            }
            
            if (compared >= 5) { // Minimum 5 bills to compare
                const matchPct = (agreements / compared) * 100;
                
                results.push({
                    name,
                    matchPct: Math.round(matchPct),
                    agreements,
                    disagreements,
                    compared
                });
            }
        }
        
        // Sort by match percentage
        results.sort((a, b) => b.matchPct - a.matchPct);
        
        return results;
    }
    
    compareLegislators(name1, name2) {
        /**
         * Compare two legislators' voting records
         */
        
        const leg1 = this.legislators[name1];
        const leg2 = this.legislators[name2];
        
        if (!leg1 || !leg2) return null;
        
        let agreements = 0;
        let disagreements = 0;
        
        // Find bills both voted on
        const allBills = new Set([
            ...leg1.yea_votes,
            ...leg1.nay_votes,
            ...leg2.yea_votes,
            ...leg2.nay_votes
        ]);
        
        for (const bill of allBills) {
            const leg1Yea = leg1.yea_votes.includes(bill);
            const leg1Nay = leg1.nay_votes.includes(bill);
            const leg2Yea = leg2.yea_votes.includes(bill);
            const leg2Nay = leg2.nay_votes.includes(bill);
            
            // Both must have voted
            if ((leg1Yea || leg1Nay) && (leg2Yea || leg2Nay)) {
                if ((leg1Yea && leg2Yea) || (leg1Nay && leg2Nay)) {
                    agreements++;
                } else {
                    disagreements++;
                }
            }
        }
        
        const total = agreements + disagreements;
        const alignmentPct = total > 0 ? (agreements / total) * 100 : 0;
        
        return {
            leg1: name1,
            leg2: name2,
            agreements,
            disagreements,
            alignmentPct: Math.round(alignmentPct),
            billsCompared: total
        };
    }
}

// Export for use
if (typeof module !== 'undefined') module.exports = LegislatorMatcher;
