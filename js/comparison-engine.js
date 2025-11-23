/**
 * COMPARISON ENGINE
 * Compare any two entities: org vs org, org vs legislator, user vs legislator, etc.
 */

class ComparisonEngine {
    constructor(bills, legislators, organizations) {
        this.bills = bills;
        this.legislators = legislators;
        this.organizations = organizations;
        this.userPositions = {}; // From quiz
        
        // Ideology templates (based on typical positions)
        this.ideologies = {
            'progressive': this.buildProgressiveTemplate(),
            'conservative': this.buildConservativeTemplate(),
            'libertarian': this.buildLibertarianTemplate(),
            'moderate': this.buildModerateTemplate()
        };
    }
    
    buildProgressiveTemplate() {
        // Align with: HEAL Utah, Better Utah, Planned Parenthood, ACLU
        const positions = {};
        this.bills.forEach(bill => {
            // If progressive orgs agree, that's the progressive position
            const progOrgs = [
                bill.heal_utah_position,
                bill.alliance_for_a_better_utah_position,
                bill.planned_parenthood_action_utah_position
            ].filter(p => p && p !== 'Watching');
            
            if (progOrgs.length >= 2) {
                // Majority position among progressive orgs
                const support = progOrgs.filter(p => p === 'Support').length;
                const oppose = progOrgs.filter(p => p === 'Oppose').length;
                if (support > oppose) positions[bill.bill_number] = 'Support';
                else if (oppose > support) positions[bill.bill_number] = 'Oppose';
            }
        });
        return positions;
    }
    
    buildConservativeTemplate() {
        // Align with: Libertas Institute
        const positions = {};
        this.bills.forEach(bill => {
            if (bill.libertas_institute_position && 
                bill.libertas_institute_position !== 'Watching') {
                positions[bill.bill_number] = bill.libertas_institute_position;
            }
        });
        return positions;
    }
    
    buildLibertarianTemplate() {
        // Same as conservative but weighted toward personal freedom
        return this.buildConservativeTemplate();
    }
    
    buildModerateTemplate() {
        // Middle ground - only strong consensus positions
        const positions = {};
        this.bills.forEach(bill => {
            const allPositions = this.getAllOrgPositions(bill);
            const nonWatching = allPositions.filter(p => p !== 'Watching');
            
            // If 70%+ agree, that's the moderate position
            if (nonWatching.length >= 3) {
                const support = nonWatching.filter(p => p === 'Support').length;
                const oppose = nonWatching.filter(p => p === 'Oppose').length;
                const total = support + oppose;
                
                if (support / total >= 0.7) positions[bill.bill_number] = 'Support';
                else if (oppose / total >= 0.7) positions[bill.bill_number] = 'Oppose';
            }
        });
        return positions;
    }
    
    getAllOrgPositions(bill) {
        return [
            bill.heal_utah_position,
            bill.libertas_institute_position,
            bill.utah_education_association_position,
            bill.planned_parenthood_action_utah_position,
            bill.utah_pta_position,
            bill.utah_league_of_cities_and_towns_position,
            bill.alliance_for_a_better_utah_position
        ].filter(p => p);
    }
    
    getEntityPositions(entityType, entityId) {
        /**
         * Get positions for any entity type
         * Returns: { bill_number: position, ... }
         */
        
        switch(entityType) {
            case 'organization':
                return this.getOrgPositions(entityId);
            
            case 'legislator':
                return this.getLegislatorPositions(entityId);
            
            case 'ideology':
                return this.ideologies[entityId] || {};
            
            case 'user':
                return this.userPositions;
            
            default:
                return {};
        }
    }
    
    getOrgPositions(orgFieldName) {
        console.log("getOrgPositions called with:", orgFieldName);
        console.log("Bills array length:", this.bills?.length);
        const positions = {};
        this.bills.forEach(bill => {
            const position = bill[`${orgFieldName}_position`];
            if (position && position !== 'Watching') {
                positions[bill.bill_number] = position;
            }
        });
        console.log("Found positions:", Object.keys(positions).length);
        return positions;
    }
    
    getLegislatorPositions(legislatorName) {
        const leg = this.legislators[legislatorName];
        if (!leg) return {};
        
        const positions = {};
        leg.yea_votes.forEach(bill => positions[bill] = 'Support');
        leg.nay_votes.forEach(bill => positions[bill] = 'Oppose');
        return positions;
    }
    
    compare(entity1Type, entity1Id, entity2Type, entity2Id) {
        /**
         * Main comparison function
         * Returns detailed comparison object
         */
        
        const positions1 = this.getEntityPositions(entity1Type, entity1Id);
        const positions2 = this.getEntityPositions(entity2Type, entity2Id);
        
        // Find common bills
        const commonBills = Object.keys(positions1).filter(bill => 
            positions2.hasOwnProperty(bill)
        );
        
        if (commonBills.length === 0) {
            return {
                compared: 0,
                alignment: 0,
                agreements: [],
                disagreements: [],
                entity1Only: Object.keys(positions1).length,
                entity2Only: Object.keys(positions2).length
            };
        }
        
        // Calculate agreements and disagreements
        const agreements = [];
        const disagreements = [];
        
        commonBills.forEach(billNum => {
            const pos1 = positions1[billNum];
            const pos2 = positions2[billNum];
            const bill = this.bills.find(b => b.bill_number === billNum);
            
            if (pos1 === pos2) {
                agreements.push({
                    bill: billNum,
                    title: bill?.title || '',
                    position: pos1,
                    url: bill?.url || ''
                });
            } else {
                disagreements.push({
                    bill: billNum,
                    title: bill?.title || '',
                    entity1Position: pos1,
                    entity2Position: pos2,
                    url: bill?.url || ''
                });
            }
        });
        
        const alignmentPct = (agreements.length / commonBills.length) * 100;
        
        return {
            compared: commonBills.length,
            alignment: Math.round(alignmentPct),
            agreements: agreements,
            disagreements: disagreements,
            entity1Only: Object.keys(positions1).length - commonBills.length,
            entity2Only: Object.keys(positions2).length - commonBills.length,
            topAgreements: agreements.slice(0, 10),
            topDisagreements: disagreements.slice(0, 10)
        };
    }
    
    setUserPositions(positions) {
        /**
         * Load user positions from quiz
         */
        this.userPositions = positions;
    }
}

// Export
if (typeof module !== 'undefined') module.exports = ComparisonEngine;
