/* NBA Sim — persistenza versionata */
(function () {
    'use strict';

    const KEY = 'nba.sim.v1';

    function defaults() {
        return {
            version: 1,
            settings: { lang: 'it', sound: true },
            season: null,
            playoffs: null,
            history: [],
            predictions: { total: 0, correct: 0, points: 0 },
            customTeams: [],
            matchup: { home: 'LAL', away: 'BOS', prediction: null }
        };
    }

    const NBAStorage = {
        data: defaults(),
        load: function () {
            try {
                const raw = JSON.parse(localStorage.getItem(KEY));
                if (raw && raw.version === 1) {
                    const d = defaults();
                    this.data = {
                        version: 1,
                        settings: Object.assign(d.settings, raw.settings || {}),
                        season: raw.season || null,
                        playoffs: raw.playoffs || null,
                        history: Array.isArray(raw.history) ? raw.history.slice(0, 40) : [],
                        predictions: Object.assign(d.predictions, raw.predictions || {}),
                        customTeams: Array.isArray(raw.customTeams) ? raw.customTeams : [],
                        matchup: Object.assign(d.matchup, raw.matchup || {})
                    };
                }
            } catch (e) { this.data = defaults(); }
            return this.data;
        },
        save: function () { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {} },
        reset: function () { this.data = defaults(); this.save(); },
        set: function (k, v) { this.data.settings[k] = v; this.save(); },
        addHistory: function (entry) {
            this.data.history.unshift(entry);
            this.data.history = this.data.history.slice(0, 40);
            this.save();
        },
        recordPrediction: function (predicted, actual) {
            this.data.predictions.total++;
            if (predicted && predicted === actual) {
                this.data.predictions.correct++;
                this.data.predictions.points += 10;
            }
            this.save();
        },
        addCustomTeam: function (team) {
            const i = this.data.customTeams.findIndex(function (t) { return t.short === team.short; });
            if (i >= 0) this.data.customTeams[i] = team; else this.data.customTeams.push(team);
            this.save();
        }
    };

    window.NBAStorage = NBAStorage;
})();
