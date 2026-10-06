(function(){
  const REQUEST_EVENT = "hourkwo:request-pontomais";
  const DATA_EVENT = "hourkwo:pontomais-data";
  const STATUS_EVENT = "hourkwo:pontomais-status";

  function requestSync(){
    window.postMessage({ source:"hourkwo", type:"REQUEST_PONTOMAIS_STATE" }, "*");
  }

  function onMessage(event){
    if(event.source !== window || !event.data || event.data.source !== "hourkwo-extension") return;
    if(event.data.type === "PONTOMAIS_STATE"){
      window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail:event.data.payload || null }));
    }
    if(event.data.type === "PONTOMAIS_STATUS"){
      window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail:event.data.payload || null }));
    }
  }

  function init(){
    window.addEventListener("message", onMessage);
    requestSync();
  }

  window.HourKWO = window.HourKWO || {};
  window.HourKWO.PontoMais = { init, requestSync, DATA_EVENT, STATUS_EVENT, REQUEST_EVENT };
})();