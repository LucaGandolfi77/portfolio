/* Profile Engine — derives stage, currency, region from onboarding */
(function(){
  function getStage(age){
    for(const s of window.STAGES) if(age>=s.range[0]&&age<=s.range[1]) return s;
    return window.STAGES[0];
  }
  function getCountry(name){
    return window.COUNTRIES.find(c=>c.n===name)||null;
  }
  function buildProfile(data){
    const{age,gender,country}=data;
    const stage=getStage(age);
    const c=getCountry(country);
    const profile={
      age,gender,country,
      stageId:stage.id,stageName:stage.name,stageEmoji:stage.emoji,stageRange:stage.range,
      flag:c?c.f:'🌍',currency:c?c.cur:'$',region:c?c.region:'world',
      drivingAge:c?c.driving:18,votingAge:c?c.voting:18,emergency:c?c.emergency:'112',
      units:c?c.units:'metric',createdAt:Date.now()
    };
    return profile;
  }
  function getCurrencySymbol(cur){
    const map={EUR:'€',GBP:'£',JPY:'¥',CNY:'¥',INR:'₹',KRW:'₩',TRY:'₺',₽:'₽',RUB:'₽',
      BRL:'R$',AUD:'A$',CAD:'C$',CHF:'CHF',SEK:'kr',NOK:'kr',DKK:'kr',PLN:'zł',CZK:'Kč',HUF:'Ft',
      THB:'฿',SGD:'S$',HKD:'HK$',MXN:'$',ZAR:'R',EGP:'E£',AED:'د.إ',SAR:'﷼',
      IDR:'Rp',MYR:'RM',PHP:'₱',VND:'₫',PKR:'Rs',BDT:'৳',NPR:'Rs',LKR:'Rs',
      NGN:'₦',GHS:'₵',KES:'KSh',TZS:'TSh',XOF:'CFA',XAF:'FCFA',NZD:'NZ$',
      COP:'$',CLP:'$',ARS:'$',PEN:'S/.',UYU:'$U',CRC:'₡',GTQ:'Q',HNL:'L',
      BSD:'$',TTD:'T$',JMD:'J$',FJD:'F$',WST:'T$',TOP:'T$',
      ISK:'kr',ISK:'ISK',BGN:'лв',RSD:'din',HRK:'kn',UAH:'₴',GEL:'₾',AMD:'֏',AZN:'₼',
      ILS:'₪',KWD:'د.ا',QAR:'QR',BHD:'BD',OMR:'﷼',JOD:'JD',LBP:'L£',IQD:'ع.د',
      SYP:'SYP',YER:'﷼',IRR:'﷼',AFN:'؋',PKR:'Rs',MMK:'K',KHR:'៛',LAK:'₭',
      MNT:'₮',KZT:'₸',UZS:'so\'m',TJS:'TJS',TMT:'T',BTN:'Nu.',MVR:'Rf',
      SCR:'Rs',MUR:'Rs',MGA:'Ar',MWK:'MK',ZMW:'ZK',ZWL:'Z$',BWP:'P',
      SDG:'SDG',SSP:'SSP',ETB:'Br',SOS:'Sh',RWF:'RF',UGX:'USh',NGN:'₦',
      XCD:'EC$',HTG:'G',PYG:'₲',BOB:'Bs',VES:'Bs.S',IQD:'ع.د'};
    return map[cur]||cur;
  }
  window.Profile={buildProfile,getStage,getCurrencySymbol};
})();
