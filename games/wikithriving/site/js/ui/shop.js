/* Shop UI — spend pearls */
(function(){
  function render(){
    var state=window.App.getState();
    window.Economy.ensureEconomy(state);
    var pearls=state.pearls;
    var shop=window.Economy.getShop();
    document.getElementById('shop-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2rem;margin-bottom:4px">🦪 ${pearls}</div>
        <div style="font-size:.85rem;color:var(--ink3)">Pearls</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${shop.map(function(item){
          var canBuy=pearls>=item.cost;
          return '<div class="card" style="display:flex;align-items:center;gap:14px;'+(canBuy?'':'opacity:.5')+'">'+
            '<span style="font-size:1.8rem">'+item.emoji+'</span>'+
            '<div style="flex:1"><div style="font-weight:600">'+item.name+'</div>'+
            '<div style="font-size:.8rem;color:var(--ink3)">'+item.desc+'</div></div>'+
            '<button class="btn btn-sm '+(canBuy?'btn-primary':'btn-outline')+'" onclick="ShopUI.buy(\''+item.id+'\')">'+item.cost+' 🦪</button>'+
          '</div>';
        }).join('')}
      </div>
      <hr class="gold-rule">
      <div class="card" style="text-align:center">
        <div style="font-size:.8rem;color:var(--ink3);margin-bottom:8px">Earn pearls by:</div>
        <div style="font-size:.8rem;color:var(--ink2);line-height:1.6">
          ✅ Daily Quests (+2) · ✅ Perfect Quiz (+3)<br>
          ✅ Reviews (+2) · ✅ League Top 10 (+10)
        </div>
      </div>
    `;
  }
  function buy(itemId){
    var state=window.App.getState();
    var result=window.Economy.buyItem(state,itemId);
    if(result.ok){
      window.App.setState(state);
      alert(result.msg);
    } else {
      alert(result.msg);
    }
    render();
  }
  window.ShopUI={render:render,buy:buy};
})();
