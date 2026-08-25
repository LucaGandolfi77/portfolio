/* I DUE LUMI — Palette unita (GBA warm) */
const PAL = {
  ink:'#191515', inkSoft:'#483d3b',
  sky:'#a7c7e7', mist:'#c4d7e0', fog:'#ede3d9', milk:'#f5f0e5', cream:'#f7e8c9',
  dusk:'#3d5a9e',
  night:'#0d0b09', slate:'#5e564a',
  dirt:'#7a6f5e', cocoa:'#5e432d', wheat:'#e8d5a8', butter:'#ffe066',
  honey:'#e8a55a', amber:'#c07a28', gold:'#f2c14e', pumpkin:'#cf6a3a', terracotta:'#c65d3e', rust:'#993322', rose:'#e87373', blush:'#f2a0a0',
  leaf:'#6e884a', moss:'#4e6a2e', sage:'#8ba674', berry:'#c0532e',
};

function hex(c){
  if(c[0]==='#') return c;
  return '#'+c;
}
