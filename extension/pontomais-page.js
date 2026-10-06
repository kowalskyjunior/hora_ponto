(function(){
  const PREFIX = "[HourKWO/PontoMais]";
  let lastSignature = "";
  const today = new Date().toISOString().slice(0,10);
  const parser = window.HourKWOPontoMaisParser;

  function emit(payload){
    if(!payload) return;
    const signature = [payload.date,payload.horarios.join(","),payload.entrada,payload.saida].join("|");
    if(signature === lastSignature) return;
    lastSignature = signature;
    payload.url = location.href;
    payload.capturadoEm = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    window.postMessage({source:"hourkwo:pontomais-page",type:"PONTOMAIS_DATA",payload},"*");
    console.debug(PREFIX,"dados detectados",payload);
  }

  function inspect(value, source){
    try{
      const parsed = parser.extract(value,today);
      emit(parsed);
    }catch(error){
      console.warn(PREFIX,"falha no parser",error);
    }
  }

  const nativeFetch = window.fetch;
  window.fetch = async function(...args){
    const response = await nativeFetch.apply(this,args);
    try{
      response.clone().text().then(text=>inspect(text,"fetch")).catch(()=>{});
    }catch(error){
      console.debug(PREFIX,"não foi possível clonar fetch",error);
    }
    return response;
  };

  const NativeXHR = window.XMLHttpRequest;
  const nativeOpen = NativeXHR.prototype.open;
  const nativeSend = NativeXHR.prototype.send;
  NativeXHR.prototype.open = function(method,url,...rest){
    this.__hourkwoUrl = String(url || "");
    return nativeOpen.call(this,method,url,...rest);
  };
  NativeXHR.prototype.send = function(...args){
    this.addEventListener("load",function(){
      try{
        const body = this.responseType === "json" ? this.response : this.responseText;
        inspect(body,"xhr");
      }catch(error){
        console.debug(PREFIX,"não foi possível ler XHR",error);
      }
    });
    return nativeSend.apply(this,args);
  };

  function scanDom(){
    const text = document.body && document.body.innerText;
    if(!text) return;

    const labeled = text.match(/(?:entrada|início|inicio|saída|saida|fim)[^0-9]{0,24}\d{2}:\d{2}/gi);
    if(!labeled) return;

    const parsed = parser.extract(labeled.join(" | "),today);
    if(parsed){
      parsed.fonte = "dom";
      emit(parsed);
    }
  }

  window.addEventListener("message",event => {
    if(event.source !== window || !event.data || event.data.source !== "hourkwo") return;
    if(event.data.type === "REQUEST_PONTOMAIS_STATE"){
      window.postMessage({
        source:"hourkwo:pontomais-page",
        type:"PONTOMAIS_STATUS",
        payload:{state:"capturing"}
      },"*");
      scanDom();
    }
  });

  setTimeout(scanDom,1500);
  setInterval(scanDom,2500);
  window.postMessage({
    source:"hourkwo:pontomais-page",
    type:"PONTOMAIS_STATUS",
    payload:{state:"pontomais-detected"}
  },"*");
})();