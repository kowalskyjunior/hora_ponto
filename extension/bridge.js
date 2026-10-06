(function(){
  const isHourKWOPage = () => location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "kowalskyjunior.github.io" || location.protocol === "file:";

  window.addEventListener("message",event => {
    if(event.source !== window || !event.data) return;

    if(event.data.source === "hourkwo:pontomais-page"){
      chrome.runtime.sendMessage({
        type:event.data.type,
        payload:event.data.payload || null
      }).catch(()=>{});
      return;
    }

    if(isHourKWOPage && event.data.source === "hourkwo" && event.data.type === "REQUEST_PONTOMAIS_STATE"){
      chrome.runtime.sendMessage({type:"GET_PONTOMAIS_STATE"}).catch(()=>{});
    }
  });

  chrome.runtime.onMessage.addListener(message => {
    if(!isHourKWOPage) return;
    if(message.type === "PONTOMAIS_STATE" || message.type === "PONTOMAIS_STATUS"){
      window.postMessage({
        source:"hourkwo-extension",
        type:message.type,
        payload:message.payload || null
      },"*");
    }
  });
})();