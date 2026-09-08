const gid = id => document.getElementById(id);
const Editor = {
  init() {
    gid('btn-add-card').addEventListener('click', async () => {
      const q = gid('card-q').value || 'Domanda vuota';
      const a = gid('card-a').value || 'Risposta vuota';
      await Deck.init();
      await Deck.save({ q, a, interval: 1, ef: 2.5, next: Date.now() + 86400000, created: new Date().toISOString() });
      gid('card-q').value = ''; gid('card-a').value = '';
      alert('Card aggiunta al deck locale');
    });
  }
};
