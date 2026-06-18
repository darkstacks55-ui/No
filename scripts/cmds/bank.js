const cooldowns = new Map();

module.exports = {
    config: {
        name: "bank",
        version: "2.5.0",
        author: "AI Collaborator",
        countDown: 5,
        role: 0, // 0 = Tous les utilisateurs, 1 = Admin du groupe, 2 = Admin du bot
        description: "SystÃ¨me bancaire et Ã©conomique ultra-complet (Banque, Bourse, Immobilier, Crimes, Business)",
        category: "Ã‰conomie",
        guide: {
            en: "{p}{n} [register/balance/deposit/withdraw/transfer/daily/work/loan/repay/rob/invest/business/property/shop/achievements/history/vault]",
            fr: "{p}{n} [register/balance/deposit/withdraw/transfer/daily/work/loan/repay/rob/invest/business/property/shop/achievements/history/vault]"
        }
    },

    onStart: async function ({ api, event, args, usersData }) {
        const { threadID, messageID, senderID } = event;
        const subCommand = args[0]?.toLowerCase();

        // 1. Initialisation et rÃ©cupÃ©ration des donnÃ©es du joueur
        let userData = await usersData.get(senderID);
        if (!userData) {
            return api.sendMessage("âŒ Impossible de charger vos donnÃ©es utilisateur.", threadID, messageID);
        }

        // Structure Ã©conomique personnalisÃ©e intÃ©grÃ©e dans usersData
        if (!userData.bankSystem) {
            userData.bankSystem = {
                cash: 500,
                bank: 0,
                vault: 0,
                vaultInsurance: false,
                creditScore: 600,
                loan: 0,
                lastDaily: 0,
                lastWork: 0,
                lastRob: 0,
                history: [],
                investments: { stocks: 0, crypto: 0, bonds: 0 },
                business: { owned: false, name: "", level: 0, lastCollect: 0 },
                properties: [],
                inventory: { vehicles: [], luxury: [] },
                achievements: { workCount: 0, successfulRobs: 0 },
                reputation: 100
            };
            await usersData.set(senderID, userData);
        }

        const eco = userData.bankSystem;

        // Fonction utilitaire pour ajouter l'historique
        const addHistory = (type, amount, details) => {
            if (!eco.history) eco.history = [];
            eco.history.unshift({
                date: new Date().toISOString().split('T')[0],
                type,
                amount,
                details
            });
            if (eco.history.length > 10) eco.history.pop(); // Garder les 10 derniers
        };

        // 2. Gestion des sous-commandes
        switch (subCommand) {
            
            case "register": {
                return api.sendMessage("âœ… Votre compte bancaire et votre dossier financier sont dÃ©jÃ  opÃ©rationnels !", threadID, messageID);
            }

            case "balance":
            case "bal": {
                const totalText = `ðŸ¦ [ DOSSIER FINANCIER - U${senderID} ] ðŸ¦\n` +
                    `ðŸ’µ Cash : ${eco.cash} $\n` +
                    `ðŸ›ï¸ Banque : ${eco.bank} $\n` +
                    `ðŸ”’ Coffre-fort : ${eco.vault} $ ${eco.vaultInsurance ? "(AssurÃ© ðŸ›¡ï¸)" : "(Non assurÃ© âš ï¸)"}\n` +
                    `ðŸ’³ Score de CrÃ©dit : ${eco.creditScore}/850\n` +
                    `ðŸ“‰ Dette de PrÃªt : ${eco.loan} $\n` +
                    `ðŸŒŸ RÃ©putation : ${eco.reputation}/200`;
                return api.sendMessage(totalText, threadID, messageID);
            }

            case "deposit":
            case "dep": {
                const amountInput = args[1];
                if (!amountInput) return api.sendMessage("âš ï¸ SpÃ©cifiez un montant ou 'all'.", threadID, messageID);
                
                let amount = amountInput === "all" ? eco.cash : parseInt(amountInput);
                if (isNaN(amount) || amount <= 0) return api.sendMessage("âŒ Montant invalide.", threadID, messageID);
                if (eco.cash < amount) return api.sendMessage("âŒ Vous n'avez pas assez de cash.", threadID, messageID);

                eco.cash -= amount;
                eco.bank += amount;
                addHistory("DÃ©pÃ´t", amount, "DÃ©pÃ´t en banque");
                await usersData.set(senderID, userData);
                return api.sendMessage(`âœ… Vous avez dÃ©posÃ© ${amount} $ sur votre compte bancaire.`, threadID, messageID);
            }
