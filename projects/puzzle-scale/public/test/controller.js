const gid = id => document.getElementById(id);
document.getElementById('btn-run-tests').addEventListener('click', () => {
  if (typeof TestEngine !== 'undefined') {
    TestEngine.run();
  } else {
    gid('test-output').innerHTML = '<p style="color:#e94560">Errore: motore test non caricato.</p>';
  }
});
