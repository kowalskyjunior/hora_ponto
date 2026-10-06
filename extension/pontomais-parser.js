(function(){
  function normalizeTime(value){
    if(typeof value !== "string") return null;
    const match = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b/);
    return match ? match[1].padStart(2,"0") + ":" + match[2] : null;
  }

  function normalizeDate(value){
    if(typeof value !== "string") return null;
    if(/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return br ? br[3] + "-" + br[2] + "-" + br[1] : null;
  }

  function extract(value, today){
    const candidates = [];
    const seen = new WeakSet();

    function add(times,date,source){
      const clean = [];
      for(const item of times || []){
        const normalized = normalizeTime(String(item));
        if(normalized && !clean.includes(normalized)) clean.push(normalized);
      }
      if(clean.length) candidates.push({times:clean,date:date || today,source});
    }

    function walk(node,inheritedDate=today,depth=0){
      if(node == null || depth > 10) return;
      if(typeof node === "string"){
        const labeled = [];
        for(const m of node.matchAll(/(?:entrada|início|inicio)[^0-9]{0,24}(\d{2}:\d{2})/gi)) labeled.push(m[1]);
        for(const m of node.matchAll(/(?:saída|saida|fim)[^0-9]{0,24}(\d{2}:\d{2})/gi)) labeled.push(m[1]);
        add(labeled,inheritedDate,"text");
        return;
      }
      if(typeof node !== "object") return;
      if(seen.has(node)) return;
      seen.add(node);

      let date = inheritedDate;
      for(const [key,val] of Object.entries(node)){
        if(/^(date|day|reference_date|work_day_date)$/i.test(key)){
          const normalized = normalizeDate(String(val));
          if(normalized) date = normalized;
        }
      }

      if(Array.isArray(node)){
        const times = node.map(item => {
          if(!item || typeof item !== "object") return null;
          return item.time ?? item.datetime ?? item.timestamp ?? item.hour ??
            item.clock_in ?? item.clock_out ?? item.start_time ?? item.end_time;
        }).filter(Boolean);
        if(times.length) add(times,date,"network");
        for(const item of node) walk(item,date,depth+1);
        return;
      }

      for(const [key,val] of Object.entries(node)){
        if(/time_cards?|timeCards|punches|marks?|time_records?|movements|batidas|entries/i.test(key) && Array.isArray(val)){
          const times = val.map(item => {
            if(!item || typeof item !== "object") return null;
            return item.time ?? item.datetime ?? item.timestamp ?? item.hour ??
              item.clock_in ?? item.clock_out ?? item.start_time ?? item.end_time;
          }).filter(Boolean);
          if(times.length) add(times,date,"network");
        }
        walk(val,date,depth+1);
      }
    }

    try{
      const data = typeof value === "string" ? JSON.parse(value) : value;
      walk(data,today,0);
    }catch{
      walk(String(value || ""),today,0);
    }

    const dated = candidates.filter(c => c.date === today);
    const best = (dated.length ? dated : candidates).sort((a,b)=>b.times.length-a.times.length)[0];
    if(!best) return null;

    return {
      date: best.date,
      horarios: best.times,
      entrada: best.times[0] || null,
      saida: best.times.length >= 2 && best.times.length % 2 === 0 ? best.times[best.times.length-1] : null,
      ultimoRegistro: best.times[best.times.length-1] || null,
      fonte: best.source
    };
  }

  window.HourKWOPontoMaisParser = { extract, normalizeTime, normalizeDate };
})();