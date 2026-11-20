/* NBA Sim — squadre e telecronaca IT/EN */
(function () {
    'use strict';

    const BASE_TEAMS = {
        LAL: { name: 'Los Angeles Lakers', short: 'LAL', color: '#FDB927', players: [
            { name: 'LeBron James', ovr: 96, off: 94, def: 88, pos: 'SF' },
            { name: 'Anthony Davis', ovr: 94, off: 89, def: 96, pos: 'C' },
            { name: 'Austin Reaves', ovr: 82, off: 84, def: 75, pos: 'SG' },
            { name: "D'Angelo Russell", ovr: 81, off: 83, def: 70, pos: 'PG' },
            { name: 'Rui Hachimura', ovr: 79, off: 78, def: 74, pos: 'PF' }
        ]},
        GSW: { name: 'Golden State Warriors', short: 'GSW', color: '#1D428A', players: [
            { name: 'Stephen Curry', ovr: 96, off: 98, def: 70, pos: 'PG' },
            { name: 'Klay Thompson', ovr: 84, off: 85, def: 76, pos: 'SG' },
            { name: 'Draymond Green', ovr: 82, off: 70, def: 92, pos: 'PF' },
            { name: 'Andrew Wiggins', ovr: 80, off: 78, def: 81, pos: 'SF' },
            { name: 'Kevon Looney', ovr: 77, off: 70, def: 80, pos: 'C' }
        ]},
        BOS: { name: 'Boston Celtics', short: 'BOS', color: '#007A33', players: [
            { name: 'Jayson Tatum', ovr: 95, off: 94, def: 88, pos: 'SF' },
            { name: 'Jaylen Brown', ovr: 89, off: 88, def: 82, pos: 'SG' },
            { name: 'Jrue Holiday', ovr: 87, off: 80, def: 94, pos: 'PG' },
            { name: 'Kristaps Porzingis', ovr: 86, off: 85, def: 84, pos: 'C' },
            { name: 'Derrick White', ovr: 84, off: 80, def: 86, pos: 'SG' }
        ]},
        CHI: { name: 'Chicago Bulls', short: 'CHI', color: '#CE1141', players: [
            { name: 'DeMar DeRozan', ovr: 86, off: 88, def: 70, pos: 'SF' },
            { name: 'Zach LaVine', ovr: 85, off: 87, def: 72, pos: 'SG' },
            { name: 'Nikola Vucevic', ovr: 83, off: 84, def: 78, pos: 'C' },
            { name: 'Coby White', ovr: 80, off: 80, def: 72, pos: 'PG' },
            { name: 'Alex Caruso', ovr: 79, off: 70, def: 90, pos: 'PF' }
        ]},
        MIL: { name: 'Milwaukee Bucks', short: 'MIL', color: '#00471B', players: [
            { name: 'Giannis Antetokounmpo', ovr: 97, off: 96, def: 94, pos: 'PF' },
            { name: 'Damian Lillard', ovr: 92, off: 94, def: 70, pos: 'PG' },
            { name: 'Khris Middleton', ovr: 83, off: 82, def: 76, pos: 'SF' },
            { name: 'Brook Lopez', ovr: 82, off: 78, def: 88, pos: 'C' },
            { name: 'Malik Beasley', ovr: 77, off: 76, def: 70, pos: 'SG' }
        ]},
        DEN: { name: 'Denver Nuggets', short: 'DEN', color: '#0E2240', players: [
            { name: 'Nikola Jokic', ovr: 98, off: 98, def: 82, pos: 'C' },
            { name: 'Jamal Murray', ovr: 88, off: 89, def: 74, pos: 'PG' },
            { name: 'Aaron Gordon', ovr: 84, off: 80, def: 86, pos: 'PF' },
            { name: 'Michael Porter Jr.', ovr: 83, off: 85, def: 72, pos: 'SF' },
            { name: 'Kentavious Caldwell-Pope', ovr: 78, off: 76, def: 80, pos: 'SG' }
        ]},
        MIA: { name: 'Miami Heat', short: 'MIA', color: '#98002E', players: [
            { name: 'Jimmy Butler', ovr: 93, off: 92, def: 94, pos: 'SF' },
            { name: 'Bam Adebayo', ovr: 89, off: 84, def: 95, pos: 'C' },
            { name: 'Tyler Herro', ovr: 83, off: 86, def: 72, pos: 'SG' },
            { name: 'Terry Rozier', ovr: 80, off: 82, def: 74, pos: 'PG' },
            { name: 'Duncan Robinson', ovr: 78, off: 84, def: 65, pos: 'SF' }
        ]},
        PHI: { name: 'Philadelphia 76ers', short: 'PHI', color: '#006BB6', players: [
            { name: 'Joel Embiid', ovr: 98, off: 97, def: 92, pos: 'C' },
            { name: 'Tyrese Maxey', ovr: 88, off: 89, def: 75, pos: 'PG' },
            { name: 'Tobias Harris', ovr: 82, off: 82, def: 76, pos: 'PF' },
            { name: 'Kelly Oubre Jr.', ovr: 80, off: 82, def: 72, pos: 'SF' },
            { name: 'Kyle Lowry', ovr: 79, off: 78, def: 80, pos: 'PG' }
        ]},
        PHX: { name: 'Phoenix Suns', short: 'PHX', color: '#1D1160', players: [
            { name: 'Kevin Durant', ovr: 96, off: 97, def: 84, pos: 'PF' },
            { name: 'Devin Booker', ovr: 94, off: 96, def: 75, pos: 'SG' },
            { name: 'Bradley Beal', ovr: 86, off: 88, def: 72, pos: 'SG' },
            { name: 'Jusuf Nurkic', ovr: 81, off: 78, def: 80, pos: 'C' },
            { name: 'Grayson Allen', ovr: 79, off: 82, def: 74, pos: 'SF' }
        ]},
        DAL: { name: 'Dallas Mavericks', short: 'DAL', color: '#00538C', players: [
            { name: 'Luka Doncic', ovr: 98, off: 99, def: 75, pos: 'PG' },
            { name: 'Kyrie Irving', ovr: 91, off: 94, def: 72, pos: 'SG' },
            { name: 'P.J. Washington', ovr: 79, off: 78, def: 78, pos: 'PF' },
            { name: 'Daniel Gafford', ovr: 80, off: 75, def: 85, pos: 'C' },
            { name: 'Tim Hardaway Jr.', ovr: 78, off: 82, def: 68, pos: 'SF' }
        ]},
        PBC: { name: 'Basket Club Piacenza', short: 'PBC', color: '#C1121F', players: [
            { name: 'Enrico Massari', ovr: 79, off: 78, def: 81, pos: 'PG' },
            { name: 'Luca Roljic', ovr: 83, off: 89, def: 72, pos: 'SG' },
            { name: 'Umberto Livelli', ovr: 94, off: 96, def: 80, pos: 'SG' },
            { name: 'Milo Galli', ovr: 99, off: 99, def: 68, pos: 'SF' },
            { name: 'Andrea Bassani', ovr: 91, off: 94, def: 78, pos: 'C' }
        ]},
        NYK: { name: 'New York Knicks', short: 'NYK', color: '#F58426', players: [
            { name: 'Jalen Brunson', ovr: 93, off: 94, def: 75, pos: 'PG' },
            { name: 'Julius Randle', ovr: 87, off: 88, def: 80, pos: 'PF' },
            { name: 'OG Anunoby', ovr: 84, off: 80, def: 92, pos: 'SF' },
            { name: 'Josh Hart', ovr: 80, off: 78, def: 84, pos: 'SG' },
            { name: 'Mitchell Robinson', ovr: 80, off: 70, def: 90, pos: 'C' }
        ]},
        OKC: { name: 'Oklahoma City Thunder', short: 'OKC', color: '#007AC1', players: [
            { name: 'Shai Gilgeous-Alexander', ovr: 95, off: 96, def: 84, pos: 'PG' },
            { name: 'Chet Holmgren', ovr: 86, off: 80, def: 92, pos: 'C' },
            { name: 'Jalen Williams', ovr: 84, off: 84, def: 80, pos: 'SF' },
            { name: 'Luguentz Dort', ovr: 78, off: 72, def: 88, pos: 'SG' },
            { name: 'Josh Giddey', ovr: 79, off: 80, def: 74, pos: 'PG' }
        ]},
        CLE: { name: 'Cleveland Cavaliers', short: 'CLE', color: '#860038', players: [
            { name: 'Donovan Mitchell', ovr: 93, off: 95, def: 75, pos: 'SG' },
            { name: 'Darius Garland', ovr: 85, off: 87, def: 72, pos: 'PG' },
            { name: 'Evan Mobley', ovr: 86, off: 78, def: 94, pos: 'PF' },
            { name: 'Jarrett Allen', ovr: 83, off: 76, def: 90, pos: 'C' },
            { name: 'Max Strus', ovr: 79, off: 82, def: 74, pos: 'SF' }
        ]}
    };

    const BENCH_NAMES = ['J. Carter', 'M. Reed', 'D. Brooks', 'A. Fisher', 'T. Walker', 'R. James', 'K. Moore', 'S. Davis', 'C. Brown', 'N. Price'];
    const DEFAULT_STRATEGY = { pace: 50, threeRate: 50, defense: 50, rotation: 50 };

    function expandTeam(team) {
        const copy = JSON.parse(JSON.stringify(team));
        copy.players = copy.players.slice(0, 8);
        const start = copy.players.length;
        for (let i = start; i < 8; i++) {
            const base = copy.players[(i - start) % 5];
            const drop = 8 + (i - start) * 2;
            copy.players.push({
                name: BENCH_NAMES[(i + team.short.charCodeAt(0)) % BENCH_NAMES.length] + ' ' + (i - start + 1),
                ovr: Math.max(60, base.ovr - drop),
                off: Math.max(60, base.off - drop),
                def: Math.max(60, base.def - drop),
                pos: base.pos,
                bench: true
            });
        }
        copy.strategy = Object.assign({}, DEFAULT_STRATEGY, copy.strategy || {});
        return copy;
    }

    const TEAMS = {};
    Object.keys(BASE_TEAMS).forEach(function (k) { TEAMS[k] = expandTeam(BASE_TEAMS[k]); });

    const C = {
        it: {
            intro: ['Benvenuti al {arena}: {home} contro {away}!', 'Si gioca al {arena}: {home} vs {away}!'],
            tipoff: ['Palla a due! Si parte!', 'Via! Il pubblico è in piedi!'],
            make2: ['{p} appoggia a canestro!', '{p} dalla media... dentro!', 'Gran passaggio per {p}: due punti!', '{p} con il fadeaway... ciuff!'],
            make3: ['{p} da lontano... BANG, TRIPLA!', '{p} step back dall\'arco... È BUONA!', 'Mano calda di {p}: ancora tre!'],
            dunk: ['{p} decolla... CHE SCHIACCIATA!', '{p} affonda con potenza!', 'POSTER! {p} inchioda!'],
            miss: ['{p} forza il tiro... fuori.', '{p} sbaglia.', 'Ferro per {p}.', 'Stoppata? No, solo un errore di {p}.'],
            block: ['STOPPATA di {d} su {p}!', '{d} respinge il tiro di {p}!'],
            steal: ['{d} ruba palla a {p}!', 'Lettura perfetta di {d}!'],
            turnover: ['{p} perde palla.', 'Passaggio sbagliato di {p}.'],
            orb: ['Rimbalzo offensivo di {p}!', '{p} ci crede e recupera!'],
            foul: ['Fallo su {p}: due liberi.', '{p} subisce contatto, va in lunetta.'],
            ftMake: ['{p} segna il libero.', 'Dalla lunetta {p} non sbaglia.'],
            ftMiss: ['{p} sbaglia il libero.', 'Il ferro respinge il tiro di {p}.'],
            hot: ['{p} è IN FIAMME!', 'Non sbaglia più, {p}!'],
            lead: ['CAMBIO DI LEADERSHIP: {team} avanti!', '{team} passa in vantaggio!'],
            aside: ['Il pubblico del {arena} è una bolgia!', 'Che intensità in campo!', 'Pace altissima in questo momento.'],
            quarter: ['FINE Q{num}: {home} {hs} - {as} {away}', '🏁 FINE {q}! {home} {hs} - {as} {away}'],
            halftime: ['INTERVALLO: {home} {hs} - {as} {away}. Migliore: {top} con {pts} punti.'],
            win: ['🏆 VINCE {team}, {hs} - {as}!', '{team} si aggiudica la partita {hs} - {as}!'],
            buzzer: ['🚨 SIRENA! {p} segna sul buzzer!'],
            milestone20: ['{p} arriva a 20 punti!'],
            milestone30: ['🔥 {p} tocca quota 30!'],
            milestone5x3: ['🎯 Quinta tripla di {p}!'],
            milestoneDD: ['📈 Doppia doppia per {p}!'],
            injury: ['⚠️ Infortunio: {p} esce dal campo.'],
            foulout: ['🚨 {p} è espulso per 6 falli!'],
            sub: ['🔄 Sostituzione: entra {p}.'],
            clutch: ['⏱️ CLUTCH TIME! Ultimi due minuti, tutto può succedere.'],
            prediction: ['🔮 Pronostico: {team}. Vediamo se hai ragione!'],
            err: ['⚠️ Replay in corso... si riparte.'],
            gamereset: ['🔄 Nuova partita!']
        },
        en: {
            intro: ['Welcome to the {arena}: {home} vs {away}!', 'Tonight at the {arena}, {home} takes on {away}!'],
            tipoff: ['Tip-off! Here we go!', 'We are underway!'],
            make2: ['{p} finishes at the rim!', '{p} from mid-range... good!', 'Great pass finds {p} for two!'],
            make3: ['{p} from deep... BANG, THREE!', '{p} step back from three... IT\'S GOOD!', 'Hot hand {p}: another triple!'],
            dunk: ['{p} takes off... WHAT A DUNK!', '{p} slams it home!', 'POSTERIZED by {p}!'],
            miss: ['{p} forces it... off the mark.', '{p} misses.', 'Iron for {p}.'],
            block: ['REJECTED! {d} blocks {p}!', '{d} swats {p}\'s attempt!'],
            steal: ['{d} steals from {p}!', 'Great read by {d}!'],
            turnover: ['{p} loses the ball.', 'Bad pass by {p}.'],
            orb: ['Offensive rebound by {p}!', '{p} grabs the offensive board!'],
            foul: ['Foul on {p}: two free throws.', '{p} draws the contact, goes to the line.'],
            ftMake: ['{p} knocks down the free throw.', 'From the line, {p} doesn\'t miss.'],
            ftMiss: ['{p} misses the free throw.', 'The rim rejects {p}\'s shot.'],
            hot: ['{p} is ON FIRE!', '{p} can\'t miss right now!'],
            lead: ['LEAD CHANGE! {team} takes over!', '{team} moves in front!'],
            aside: ['The {arena} crowd is electric!', 'What intensity on the floor!'],
            quarter: ['END OF Q{num}: {home} {hs} - {as} {away}', '🏁 END OF {q}! {home} {hs} - {as} {away}'],
            halftime: ['HALFTIME: {home} {hs} - {as} {away}. Top performer: {top} with {pts} points.'],
            win: ['🏆 {team} WINS, {hs} - {as}!', '{team} takes this one {hs} - {as}!'],
            buzzer: ['🚨 BUZZER! {p} scores at the horn!'],
            milestone20: ['{p} reaches 20 points!'],
            milestone30: ['🔥 {p} hits 30 points!'],
            milestone5x3: ['🎯 Fifth triple for {p}!'],
            milestoneDD: ['📈 Double-double for {p}!'],
            injury: ['⚠️ Injury: {p} is out.'],
            foulout: ['🚨 {p} fouls out!'],
            sub: ['🔄 Substitution: {p} checks in.'],
            clutch: ['⏱️ CLUTCH TIME! Final two minutes, anything can happen.'],
            prediction: ['🔮 Prediction: {team}. Let\'s see if you\'re right!'],
            err: ['⚠️ Replay review... we go again.'],
            gamereset: ['🔄 New game!']
        }
    };

    function commentary(lang, key, vars) {
        const lines = (C[lang] || C.en)[key] || (C.en[key] || [key]);
        let text = lines[Math.floor(Math.random() * lines.length)];
        if (vars) Object.keys(vars).forEach(function (k) { text = text.split('{' + k + '}').join(String(vars[k])); });
        return text;
    }

    window.NBAData = {
        TEAMS: TEAMS, BASE_TEAMS: BASE_TEAMS, keys: Object.keys(TEAMS),
        expandTeam: expandTeam, commentary: commentary, DEFAULT_STRATEGY: DEFAULT_STRATEGY
    };
})();
