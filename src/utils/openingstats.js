import { supabase, setUserContext } from './supabase.js';

export const getUserOpeningStats = async (username) => {
    console.log("Getting opening stats for username:", username);
    
    try {
        await setUserContext(username);

        const { data: openingStats, error } = await supabase
            .from('opening_stats')
            .select('*')
            .eq('username', username);

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        if (!openingStats || openingStats.length === 0) {
            console.log("No opening stats found for username:", username);
            return { 
                allOpenings: [{
                    id: 1,
                    name: "Queen's Gambit",
                    icon: "♕",
                    games: 10,
                    winRate: 70,
                    accuracy: 85,
                    blunders: 2,
                    whiteWins: 4,
                    blackWins: 3,
                    draws: 3
                }],
                metrics: {
                    gamesPlayed: 10,
                    winPercentage: 70,
                    avgAccuracy: 85,
                    avgBlunders: 2
                }
            };
        }

        const getOpeningIcon = (openingName) => {
            const name = openingName.toLowerCase();
            if (name.includes('sicilian')) return '♛';
            if (name.includes('queen')) return '♕';
            if (name.includes('king')) return '♔';
            if (name.includes('italian') || name.includes('giuoco')) return '♗';
            if (name.includes('french')) return '♞';
            if (name.includes('english')) return '♜';
            if (name.includes('ruy') || name.includes('lopez')) return '♖';
            if (name.includes('caro') || name.includes('kann')) return '♙';
            if (name.includes('scotch')) return '🏴';
            if (name.includes('vienna')) return '🇦🇹';
            if (name.includes('dutch')) return '🇳🇱';
            if (name.includes('nimzo')) return '♞';
            if (name.includes('london')) return '🏙️';
            return '♟';
        };

        const allOpenings = openingStats.map((stat, index) => {
            const avgACPL = stat.avg_opening_acpl || 0;
            
            function acplToAccuracy(acpl) {
                const k = 0.005;
                let acc = 100 * Math.exp(-k * acpl);
                return parseFloat(acc.toFixed(2));
            }
            
            return {
                id: index + 1,
                name: stat.opening_name,
                icon: getOpeningIcon(stat.opening_name),
                games: stat.total_games || 0,
                winRate: stat.win_rate || 0,
                accuracy: stat.opening_accuracy || acplToAccuracy(avgACPL),
                blunders: stat.avg_opening_blunders || 0,
                whiteWins: stat.total_white_wins || 0,
                blackWins: stat.total_black_wins || 0,
                draws: stat.total_draws || 0,
                losses: stat.total_losses || 0
            };
        }).sort((a, b) => b.games - a.games);

        const totalGames = allOpenings.reduce((s, o) => s + (o.games || 0), 0);
        const totalWins = allOpenings.reduce((s, o) => s + (o.whiteWins || 0) + (o.blackWins || 0), 0);
        const accWeighted = allOpenings.reduce((s, o) => s + (o.accuracy || 0) * (o.games || 0), 0);
        const blundersWeighted = allOpenings.reduce((s, o) => s + (o.blunders || 0) * (o.games || 0), 0);

        const metrics = {
            gamesPlayed: totalGames,
            winPercentage: totalGames ? parseFloat(((totalWins / totalGames) * 100).toFixed(1)) : 0,
            avgAccuracy: totalGames ? parseFloat((accWeighted / totalGames).toFixed(1)) : 0,
            avgBlunders: totalGames ? parseFloat((blundersWeighted / totalGames).toFixed(2)) : 0
        };

        return { allOpenings, metrics };

    } catch (error) {
        console.error('Error fetching opening stats:', error);
        console.log('Error details:', JSON.stringify(error, null, 2));
        return { 
            allOpenings: [{
                id: 1,
                name: "Queen's Gambit",
                icon: "♕",
                games: 10,
                winRate: 70,
                accuracy: 85,
                blunders: 2,
                whiteWins: 4,
                blackWins: 3,
                draws: 3
            }],
            metrics: {
                gamesPlayed: 10,
                winPercentage: 70,
                avgAccuracy: 85,
                avgBlunders: 2
            }
        };
    }
};
