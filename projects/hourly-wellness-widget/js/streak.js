// streak.js — LocalStorage persistence for Hourly Wellness Widget
// Stores: streak, totalBreaks, lastBreakDate, minutesSaved

var ls = (k, def) => { try { const v = JSON.parse(localStorage.getItem('hww_' + k)); return v !== null ? v : def } catch { return def } }
var lss = (k, v) => localStorage.setItem('hww_' + k, JSON.stringify(v))

const Streak = {
  state: { streak: 0, totalBreaks: 0, lastBreak: null, minutesSaved: 0 },

  load() {
    const s = ls('stats', null);
    if (s) Object.assign(this.state, s);
  },

  save() {
    ls('stats', this.state);
  },

  markBreak() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (this.state.lastBreak === today) return; // already counted today

    if (this.state.lastBreak === yesterdayStr) {
      // continued streak
      this.state.streak++;
    } else if (this.state.lastBreak !== null) {
      // missed a day or reset
      this.state.streak = 1;
    } else {
      // first break
      this.state.streak = 1;
    }

    this.state.totalBreaks++;
    this.state.lastBreak = today;
    this.state.minutesSaved = Math.round(this.state.totalBreaks); // 1 min per break, adjust as needed

    Streak.save();
    Streak.render();
  },

  render() {
    const dot = gid('total-streak');
    if (dot) dot.textContent = this.state.streak + '🔥';
    const total = gid('total-breaks');
    if (total) total.textContent = this.state.totalBreaks || '0';
    const last = gid('last-break');
    if (last) last.textContent = this.state.lastBreak ? new Date(this.state.lastBreak).toLocaleDateString('it-IT') : '—';
    const mins = gid('minutes-saved');
    if (mins) mins.textContent = Math.round(this.state.minutesSaved) + 'm';
  },
};