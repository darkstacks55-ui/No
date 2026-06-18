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

            case "withdraw":
            case "wd": {
                const amountInput = args[1];
                if (!amountInput) return api.sendMessage("âš ï¸ SpÃ©cifiez un montant ou 'all'.", threadID, messageID);
                
                let amount = amountInput === "all" ? eco.bank : parseInt(amountInput);
                if (isNaN(amount) || amount <= 0) return api.sendMessage("âŒ Montant invalide.", threadID, messageID);
                if (eco.bank < amount) return api.sendMessage("âŒ Solde bancaire insuffisant.", threadID, messageID);

                eco.bank -= amount;
                eco.cash += amount;
                addHistory("Retrait", amount, "Retrait de la banque");
                await usersData.set(senderID, userData);
                return api.sendMessage(`âœ… Vous avez retirÃ© ${amount} $ de votre compte bancaire.`, threadID, messageID);
            }

            case "transfer": {
                const targetID = args[1];
                const amount = parseInt(args[2]);
                if (!targetID || isNaN(amount) || amount <= 0) {
                    return api.sendMessage("âš ï¸ Utilisation: bank transfer [ID_Utilisateur] [Montant]", threadID, messageID);
                }
                if (eco.bank < amount) return api.sendMessage("âŒ Solde bancaire insuffisant pour ce virement.", threadID, messageID);

                let targetData = await usersData.get(targetID);
                if (!targetData) return api.sendMessage("âŒ Utilisateur cible introuvable.", threadID, messageID);
                if (!targetData.bankSystem) return api.sendMessage("âŒ La cible n'a pas encore ouvert de compte bancaire.", threadID, messageID);

                eco.bank -= amount;
                targetData.bankSystem.bank += amount;

                addHistory("Transfert", -amount, `Vers l'utilisateur ${targetID}`);
                targetData.bankSystem.history.unshift({
                    date: new Date().toISOString().split('T')[0],
                    type: "Transfert",
                    amount: amount,
                    details: `ReÃ§u de l'utilisateur ${senderID}`
                });

                await usersData.set(senderID, userData);
                await usersData.set(targetID, targetData);
                return api.sendMessage(`âœ… Virement rÃ©ussi de ${amount} $ vers l'utilisateur ${targetID}.`, threadID, messageID);
            }

            case "daily": {
                const now = Date.now();
                if (now - eco.lastDaily < 86400000) {
                    const remaining = 86400000 - (now - eco.lastDaily);
                    const hours = Math.floor(remaining / 3600000);
                    return api.sendMessage(`â³ Vous avez dÃ©jÃ  rÃ©cupÃ©rÃ© votre bonus quotidien. Revenez dans ${hours}h.`, threadID, messageID);
                }
                const dailyReward = 1500;
                eco.cash += dailyReward;
                eco.lastDaily = now;
                addHistory("Daily", dailyReward, "RÃ©compense quotidienne");
                await usersData.set(senderID, userData);
                return api.sendMessage(`ðŸŽ RÃ©compense quotidienne rÃ©cupÃ©rÃ©e ! Vous gagnez ${dailyReward} $.`, threadID, messageID);
            }

            case "work": {
                const now = Date.now();
                if (now - eco.lastWork < 1800000) { // 30 mins cooldown
                    return api.sendMessage("â³ Vous Ãªtes fatiguÃ©. Attendez 30 minutes entre chaque session de travail.", threadID, messageID);
                }
                const salary = Math.floor(Math.random() * (600 - 250 + 1)) + 250;
                eco.cash += salary;
                eco.lastWork = now;
                eco.achievements.workCount = (eco.achievements.workCount || 0) + 1;
                
                // AmÃ©lioration du score de crÃ©dit via le travail rÃ©gulier
                if (eco.creditScore < 850) eco.creditScore = Math.min(850, eco.creditScore + 2);

                addHistory("Travail", salary, "Salaire reÃ§u");
                await usersData.set(senderID, userData);
                return api.sendMessage(`ðŸ› ï¸ Vous avez travaillÃ© dur et touchÃ© un salaire de ${salary} $. Votre score de crÃ©dit s'amÃ©liore lÃ©gÃ¨rement.`, threadID, messageID);
            }

                case "loan": {
                const action = args[1]?.toLowerCase();
                if (action === "request") {
                    if (eco.loan > 0) return api.sendMessage(`âŒ Vous avez dÃ©jÃ  un prÃªt actif de ${eco.loan} $ Ã  rembourser d'abord.`, threadID, messageID);
                    
                    // Calcul de la capacitÃ© d'emprunt basÃ©e sur le credit score
                    let maxLoan = Math.floor((eco.creditScore * 50));
                    const amount = parseInt(args[2]);

                    if (isNaN(amount) || amount <= 0 || amount > maxLoan) {
                        return api.sendMessage(`âš ï¸ Montant invalide. BasÃ© sur votre score de crÃ©dit (${eco.creditScore}), votre limite d'emprunt est de ${maxLoan} $.`, threadID, messageID);
                    }

                    eco.loan = Math.floor(amount * 1.15); // 15% d'intÃ©rÃªts imposÃ©s
                    eco.bank += amount;
                    addHistory("PrÃªt", amount, "PrÃªt bancaire contractÃ© (+15% intÃ©rÃªt)");
                    await usersData.set(senderID, userData);
                    return api.sendMessage(`ðŸ›ï¸ PrÃªt accordÃ© ! ${amount} $ ajoutÃ©s Ã  votre banque. Vous devez rembourser un total de ${eco.loan} $.`, threadID, messageID);
                } else {
                    return api.sendMessage("âš ï¸ Utilisez: `bank loan request [montant]` pour demander un prÃªt.", threadID, messageID);
                }
            }

            case "repay": {
                const amountInput = args[1];
                if (!eco.loan || eco.loan <= 0) return api.sendMessage("âŒ Vous n'avez aucune dette active.", threadID, messageID);
                
                let amount = amountInput === "all" ? eco.loan : parseInt(amountInput);
                if (isNaN(amount) || amount <= 0) return api.sendMessage("âŒ Indiquez un montant valide.", threadID, messageID);
                if (eco.cash < amount) return api.sendMessage("âŒ Vous n'avez pas assez de cash sur vous pour ce remboursement.", threadID, messageID);

                if (amount > eco.loan) amount = eco.loan;

                eco.cash -= amount;
                eco.loan -= amount;

                if (eco.loan === 0) {
                    eco.creditScore = Math.min(850, eco.creditScore + 40); // Gros bonus de score si dette Ã©teinte
                }

                addHistory("Dette", -amount, "Remboursement prÃªt");
                await usersData.set(senderID, userData);
                return api.sendMessage(`âœ… Vous avez remboursÃ© ${amount} $. Dette restante : ${eco.loan} $. Your credit score updated.`, threadID, messageID);
            }

            case "leaderboard":
            case "lb": {
                // RÃ©cupÃ©ration globale simplifiÃ©e via le gestionnaire global de GoatBot
                const allUsers = await usersData.getAll();
                let leaders = [];

                for (const u of allUsers) {
                    if (u.data?.bankSystem) {
                        const totalWorth = (u.data.bankSystem.cash || 0) + (u.data.bankSystem.bank || 0) + (u.data.bankSystem.vault || 0);
                        leaders.push({ id: u.userID, name: u.name || `Utilisateur ${u.userID}`, total: totalWorth });
                    }
                }

                leaders.sort((a, b) => b.total - a.total);
                let lbText = "ðŸ† â”€â”€ [ LEADERBOARD DES PLUS RICHES ] â”€â”€ ðŸ†\n\n";
                leaders.slice(0, 10).forEach((user, index) => {
                    lbText += `${index + 1}. ${user.name} - ${user.total} $\n`;
                });
                return api.sendMessage(lbText, threadID, messageID);
            }

            case "rob": {
                const targetID = args[1];
                if (!targetID || targetID === senderID) return api.sendMessage("âš ï¸ SpÃ©cifiez l'ID d'une cible valide.", threadID, messageID);

                const now = Date.now();
                if (now - eco.lastRob < 3600000) {
                    return api.sendMessage("â³ Votre jauge de suspicion est trop Ã©levÃ©e. Attendez 1 heure.", threadID, messageID);
                }

                let targetData = await usersData.get(targetID);
                if (!targetData || !targetData.bankSystem) return api.sendMessage("âŒ Cible introuvable ou inactive financiÃ¨rement.", threadID, messageID);

                let targetEco = targetData.bankSystem;
                if (targetEco.cash < 200) return api.sendMessage("âŒ Cette cible est trop pauvre pour Ãªtre dÃ©troussÃ©e.", threadID, messageID);

                eco.lastRob = now;
                const successChance = Math.random();

                if (successChance > 0.45) { // 55% de chance de rÃ©ussite
                    const stolenCash = Math.floor(targetEco.cash * (Math.random() * (0.40 - 0.15) + 0.15));
                    targetEco.cash -= stolenCash;
                    eco.cash += stolenCash;
                    eco.achievements.successfulRobs = (eco.achievements.successfulRobs || 0) + 1;
                    eco.reputation = Math.max(0, eco.reputation - 15);

                    addHistory("Vol (Auteur)", stolenCash, `Vol rÃ©ussi sur ${targetID}`);
                    targetEco.history.unshift({
                        date: new Date().toISOString().split('T')[0],
                        type: "Vol (Victime)",
                        amount: -stolenCash,
                        details: `DÃ©troussÃ© par l'utilisateur ${senderID}`
                    });

                    await usersData.set(senderID, userData);
                    await usersData.set(targetID, targetData);
                    return api.sendMessage(`ðŸ¥· SuccÃ¨s ! Vous avez dÃ©valisÃ© ${stolenCash} $ des poches de la cible. Votre rÃ©putation baisse.`, threadID, messageID);
                } else {
                    // Ã‰chec du braquage : Amende et baisse drastique de rÃ©putation/crÃ©dit
                    const fine = Math.floor(eco.cash * 0.20) || 100;
                    eco.cash = Math.max(0, eco.cash - fine);
                    eco.creditScore = Math.max(300, eco.creditScore - 50);
                    eco.reputation = Math.max(0, eco.reputation - 25);

                    await usersData.set(senderID, userData);
                    return api.sendMessage(`ðŸš¨ Ã‰chec ! La police vous a arrÃªtÃ©. Vous payez une amende de ${fine} $. Votre rÃ©putation et score de crÃ©dit s'effondrent.`, threadID, messageID);
                }
            }
