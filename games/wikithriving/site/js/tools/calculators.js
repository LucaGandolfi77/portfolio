/* Calculators — tip, compound interest, unit converter, mortgage */
(function(){
  function tipCalculator(bill,pct){
    const tip=bill*pct/100;
    return{tip:Math.round(tip*100)/100,total:Math.round((bill+tip)*100)/100};
  }
  function compoundInterest(principal,rate,years,monthly){
    const r=rate/100/12;
    const n=years*12;
    if(monthly){
      const total=principal*Math.pow(1+r,n)+monthly*((Math.pow(1+r,n)-1)/r);
      return Math.round(total*100)/100;
    }
    return Math.round(principal*Math.pow(1+r,n)*100)/100;
  }
  function mortgageCalc(principal,rate,years){
    const r=rate/100/12;
    const n=years*12;
    if(r===0) return{monthly:Math.round(principal/n*100)/100,total:principal};
    const monthly=principal*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    return{monthly:Math.round(monthly*100)/100,total:Math.round(monthly*n*100)/100};
  }
  function unitConvert(value,from,to){
    const tables={
      km_mile:{factor:0.621371},mile_km:{factor:1.60934},
      kg_lb:{factor:2.20462},lb_kg:{factor:0.453592},
      c_f:{convert:v=>v*9/5+32},f_c:{convert:v=>(v-32)*5/9},
      l_gal:{factor:0.264172},gal_l:{factor:3.78541},
      cm_inch:{factor:0.393701},inch_cm:{factor:2.54},
      oz_g:{factor:28.3495},g_oz:{factor:0.035274}
    };
    const t=tables[from+'_'+to];
    if(!t) return null;
    if(t.convert) return Math.round(t.convert(value)*100)/100;
    return Math.round(value*t.factor*100)/100;
  }
  window.Calculators={tipCalculator,compoundInterest,mortgageCalc,unitConvert};
})();
