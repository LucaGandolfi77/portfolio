/* Slot Neon — Le Cronache della Sorte: 8 capitoli */
(function () {
    'use strict';

    function c(text, affinity, reward, next) {
        return { text: text, affinity: affinity || {}, reward: reward || {}, next: next || null };
    }
    function n(speaker, text, choices) { return { speaker: speaker, text: text, choices: choices }; }

    const CHAPTERS = [
        {
            id: 'prologo', title: 'Il Varco', subtitle: 'Capitolo I', machine: 'fruit', unlock: 1,
            nodes: [
                n('L\'Archivista', 'Ti svegli davanti a una macchina di legno e ottone. «Finalmente. Qualcuno ha udito il mio richiamo.»', [
                    c('«Chi sei?» — chiedi, cautela.', { ordine: 1 }, { credits: 150 }, 1),
                    c('Tendi la mano verso il vetro.', { caos: 1 }, { gems: 5 }, 1)
                ]),
                n('L\'Archivista', '«Sono il custode delle sorti perdute. Ogni rulli è una porta. Ogni portale nasconde un eco di chi è vissuto prima di te.»', [
                    c('«Voglio vedere.»', { ordine: 1 }, { credits: 100 }, 2),
                    c('«Dimmi prima il prezzo.»', { equilibrio: 1 }, { energy: 1 }, 2)
                ]),
                n('Voce dal Vetro', 'Le ciliegie si illuminano. «Il primo varco è piccolo, ma ogni destino comincia da un frutto.»', [
                    c('Fai il tuo primo giro.', { equilibrio: 1 }, { credits: 200, echo: 'fruit-0' }, 'end'),
                    c('Stringi il gettone più forte.', { caos: 1 }, { credits: 250, shards: 10 }, 'end')
                ])
            ],
            reward: { gems: 10 }, unlockMachine: 'gems'
        },
        {
            id: 'cristalli', title: 'I Cristalli Parlanti', subtitle: 'Capitolo II', machine: 'gems', unlock: 3,
            nodes: [
                n('Sibilla', 'Le gemme risuonano come voci. «Ogni riflesso è una verità che nessuno ha voluto sentire.»', [
                    c('Ascolti in silenzio.', { ordine: 1 }, { gems: 8 }, 1),
                    c('Interrompi il canto.', { caos: 1 }, { credits: 180 }, 1)
                ]),
                n('Sibilla', '«C\'è un giorno in cui il prisma si è rotto. Da allora le sorti viaggiano in frammenti.»', [
                    c('«Li raccoglierò tutti.»', { ordine: 1 }, { shards: 20 }, 2),
                    c('«E se fossero meglio così?»', { caos: 1 }, { gems: 6 }, 2)
                ]),
                n('Prisma', 'Un bagliore ti avvolge. «Allora scegli: verità o possibilità.»', [
                    c('Scegli la verità.', { equilibrio: 1 }, { echo: 'gems-6', credits: 200 }, 'end'),
                    c('Scegli la possibilità.', { caos: 1 }, { echo: 'gems-7', gems: 8 }, 'end')
                ])
            ],
            reward: { gems: 12 }, unlockMachine: 'tarot'
        },
        {
            id: 'arcani', title: 'L\'Arcano Girato', subtitle: 'Capitolo III', machine: 'tarot', unlock: 5,
            nodes: [
                n('Cartomante', '«Le carte non predicono. Ricordano. E tu hai dimenticato qualcosa di importante.»', [
                    c('«Cosa?»', { equilibrio: 1 }, { credits: 200 }, 1),
                    c('Giri una carta a caso.', { caos: 1 }, { gems: 7 }, 1)
                ]),
                n('Cartomante', '«Il Matto, la Luna, la Torre. Hai attraversato tutti e tre, ma non hai mai scelto.»', [
                    c('Scegli la Luna.', { ordine: 1 }, { echo: 'tarot-1' }, 2),
                    c('Scegli la Torre.', { caos: 1 }, { echo: 'tarot-4', credits: 150 }, 2)
                ]),
                n('Il Mondo', 'La carta finale si gira da sola. «Ogni fine è solo un\'altra domanda.»', [
                    c('Accetti la domanda.', { equilibrio: 1 }, { gems: 10, shards: 25 }, 'end'),
                    c('La riscrivi.', { caos: 1 }, { credits: 350 }, 'end')
                ])
            ],
            reward: { gems: 15 }, unlockMachine: 'casino'
        },
        {
            id: 'catene', title: 'Le Catene d\'Oro', subtitle: 'Capitolo IV', machine: 'casino', unlock: 8,
            nodes: [
                n('Croupier', '«Benvenuto nel tavolo che non chiude mai. Qui si gioca con ciò che si ha, non con ciò che si vorrebbe.»', [
                    c('Scommetti tutto.', { caos: 1 }, { credits: 400 }, 1),
                    c('Osserva prima.', { equilibrio: 1 }, { energy: 2 }, 1)
                ]),
                n('Croupier', '«Hai visto il Sette? Porta fortuna a chi lo merita, rovina a chi lo insegue.»', [
                    c('Lo inseguo lo stesso.', { caos: 1 }, { echo: 'casino-5' }, 2),
                    c('Lo lascio andare.', { ordine: 1 }, { gems: 10 }, 2)
                ]),
                n('Il Re', 'Un uomo d\'oro ti guarda. «Vuoi il mio posto o la mia libertà?»', [
                    c('Il posto.', { ordine: 1 }, { echo: 'casino-7', credits: 300 }, 'end'),
                    c('La libertà.', { equilibrio: 1 }, { gems: 20, shards: 30 }, 'end')
                ])
            ],
            reward: { gems: 20 }, unlockMachine: 'garden'
        },
        {
            id: 'giardino', title: 'Il Giardino che Ricorda', subtitle: 'Capitolo V', machine: 'garden', unlock: 11,
            nodes: [
                n('Fata', '«Qui i fiori crescono ricordando le mani che li hanno piantati. Tu ne hai una che conosco.»', [
                    c('Le porgi il gettone.', { equilibrio: 1 }, { credits: 250 }, 1),
                    c('Chiudi la mano.', { caos: 1 }, { gems: 8 }, 1)
                ]),
                n('Fata', '«L\'unicorno non è un animale. È una promessa che qualcuno ha mantenuto.»', [
                    c('Ti fidi.', { ordine: 1 }, { echo: 'garden-5' }, 2),
                    c('Dubiti.', { equilibrio: 1 }, { shards: 25 }, 2)
                ]),
                n('Giardiniere', '«Ogni seme è una possibilità. Sta a te decide quale far fiorire.»', [
                    c('Pianti la speranza.', { ordine: 1 }, { echo: 'garden-7', gems: 12 }, 'end'),
                    c('Pianti la curiosità.', { caos: 1 }, { echo: 'garden-6', credits: 300 }, 'end')
                ])
            ],
            reward: { gems: 25 }, unlockMachine: 'heart'
        },
        {
            id: 'fenice', title: 'La Fenice e l\'Oblio', subtitle: 'Capitolo VI', machine: 'heart', unlock: 16,
            nodes: [
                n('Fenice', '«Sono morta cento volte. Ogni volta ho ricordato qualcosa in più.»', [
                    c('«Cosa ricordi di me?»', { equilibrio: 1 }, { credits: 400 }, 1),
                    c('«Ricorda te stessa.»', { ordine: 1 }, { gems: 15 }, 1)
                ]),
                n('Fenice', '«Il centro della sorte non è un punto. È una persona. E ti sta guardando.»', [
                    c('Ti guardi allo specchio.', { equilibrio: 1 }, { echo: 'heart-4' }, 2),
                    c('Distogli lo sguardo.', { caos: 1 }, { shards: 40 }, 2)
                ]),
                n('Oracolo', '«Vedi? Non eri venuto per vincere. Sei venuto per ricordare chi eri.»', [
                    c('Ricordi tutto.', { ordine: 1 }, { echo: 'heart-6', gems: 25 }, 'end'),
                    c('Scegli di dimenticare.', { caos: 1 }, { credits: 600 }, 'end')
                ])
            ],
            reward: { gems: 30 }, unlockMachine: null
        },
        {
            id: 'archivio', title: 'L\'Archivio delle Sorti', subtitle: 'Capitolo VII', machine: 'heart', unlock: 18,
            nodes: [
                n('L\'Archivista', '«Hai raccolto abbastanza echi. Ora l\'archivio può aprirsi. Ma ricorda: ogni porta che apri ne chiude un\'altra.»', [
                    c('Apri la porta.', { ordine: 1 }, { gems: 20 }, 1),
                    c('Chiedi il prezzo.', { equilibrio: 1 }, { energy: 3 }, 1)
                ]),
                n('Archivio', 'Milioni di gettoni girano in silenzio. Ognuno è una vita non vissuta.', [
                    c('Ne salvi uno.', { ordine: 1 }, { echo: 'heart-7', shards: 50 }, 2),
                    c('Ne lasci girare uno.', { caos: 1 }, { credits: 700 }, 2)
                ]),
                n('Voce', '«La sorte non è cieca. È stanca. Vuoi riposarla o svegliarla?»', [
                    c('La riposi.', { ordine: 1 }, { gems: 30, shards: 50 }, 'end'),
                    c('La svegli.', { caos: 1 }, { credits: 900, gems: 15 }, 'end')
                ])
            ],
            reward: { gems: 35 }, unlockMachine: null
        },
        {
            id: 'finale', title: 'Il Cuore della Sorte', subtitle: 'Capitolo VIII', machine: 'heart', unlock: 22,
            nodes: [
                n('Il Cuore', '«Sei tornato. Nessuno torna, di solito. Hai cambiato qualcosa, là fuori.»', [
                    c('Mostro la collezione.', { ordine: 1 }, { gems: 25 }, 1),
                    c('Mostro le cicatrici.', { caos: 1 }, { credits: 800 }, 1)
                ]),
                n('Il Cuore', '«Le tre vie che hai scelto si chiamano Ordine, Caos ed Equilibrio. Ma tu ne hai percorsa una quarta: la tua.»', [
                    c('Accetto la quarta via.', { equilibrio: 2 }, { gems: 40, shards: 80 }, 2),
                    c('La chiamo per nome.', { caos: 2 }, { credits: 1200 }, 2)
                ]),
                n('L\'Archivista', '«Allora è davvero finita. O è davvero cominciata — dipende da come la guardi.»', [
                    c('Guardo indietro.', { ordine: 2 }, { gems: 50, echo: 'heart-7' }, 'end'),
                    c('Guardo avanti.', { equilibrio: 2 }, { gems: 50, credits: 1000 }, 'end')
                ])
            ],
            reward: { gems: 50, shards: 100 }, unlockMachine: null
        }
    ];

    function grant(state, reward) {
        if (!reward) return;
        if (reward.credits) state.player.credits += reward.credits;
        if (reward.gems) state.player.gems += reward.gems;
        if (reward.energy) state.player.energy += reward.energy;
        if (reward.shards) state.gacha.shards += reward.shards;
        if (reward.echo) {
            if (!state.collection[reward.echo]) state.collection[reward.echo] = { count: 1, star: 1 };
            else state.collection[reward.echo].count++;
        }
    }

    function applyChoice(state, chapterIdx, nodeIdx, choiceIdx) {
        const ch = CHAPTERS[chapterIdx];
        if (!ch || state.progress.chapter < chapterIdx) return { ok: false };
        const node = ch.nodes[nodeIdx];
        if (!node) return { ok: false };
        const choice = node.choices[choiceIdx];
        if (!choice) return { ok: false };

        Object.keys(choice.affinity || {}).forEach(function (k) {
            state.player.affinity[k] = (state.player.affinity[k] || 0) + choice.affinity[k];
        });
        grant(state, choice.reward);

        const next = choice.next;
        const done = next === 'end' || nodeIdx === ch.nodes.length - 1;
        if (done) {
            if (state.progress.completed.indexOf(ch.id) < 0) {
                state.progress.completed.push(ch.id);
                grant(state, ch.reward);
                if (ch.unlockMachine && state.progress.machines.indexOf(ch.unlockMachine) < 0) {
                    state.progress.machines.push(ch.unlockMachine);
                }
                if (state.progress.chapter === chapterIdx && chapterIdx + 1 < CHAPTERS.length) {
                    state.progress.chapter = chapterIdx + 1;
                }
            }
            return { ok: true, done: true, next: null, ending: chapterIdx === CHAPTERS.length - 1 };
        }
        return { ok: true, done: false, next: Number(next) || nodeIdx + 1 };
    }

    function ending(state) {
        const a = state.player.affinity;
        let best = 'equilibrio', val = -Infinity;
        Object.keys(a).forEach(function (k) { if (a[k] > val) { val = a[k]; best = k; } });
        return {
            ordine: 'Sei diventato l\'Ordine: ogni caso ha ora un senso.',
            caos: 'Sei diventato il Caos: ogni senso ha ora un caso.',
            equilibrio: 'Sei diventato l\'Equilibrio: tieni il mondo in mano senza stringerlo.'
        }[best];
    }

    window.SlotStory = { CHAPTERS: CHAPTERS, applyChoice: applyChoice, grant: grant, ending: ending };
})();
