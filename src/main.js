(function(){
  const { DOM, Core, PontoMais } = window.HourKWO;
  let exitDate = null;

  function nowTime(){
    const now = new Date();
    return String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
  }

  function updateClock(){
    const current = nowTime();
    DOM.currentClock.textContent = current;
    DOM.footerClock.textContent = current;
    updateCountdown();
  }

  function calculateExit(){
    const result = Core.calculateEntry(DOM.input.value, DOM.extraToggle.checked);
    if(!result) return;

    DOM.output.textContent = result.exit;
    DOM.journeyText.textContent = result.journeyLabel;

    const [h,m] = result.exit.split(":").map(Number);
    const now = new Date();
    exitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if(exitDate.getTime() < now.getTime() && h < 12) exitDate.setDate(exitDate.getDate()+1);

    localStorage.setItem("hourkwo.entry", DOM.input.value);
    localStorage.setItem("hourkwo.extra", DOM.extraToggle.checked ? "1" : "0");

    DOM.output.animate(
      [{opacity:.45,transform:"translateY(10px) scale(.97)"},{opacity:1,transform:"translateY(0) scale(1)"}],
      {duration:300,easing:"cubic-bezier(.2,.8,.2,1)"}
    );
    updateCountdown();
  }

  function updateCountdown(){
    if(!exitDate){
      DOM.countdown.textContent = "--:--:--";
      return;
    }

    const diff = exitDate.getTime() - Date.now();
    if(diff <= 0){
      DOM.countdown.textContent = "Expediente encerrado";
      DOM.tag.hidden = true;
      return;
    }

    DOM.tag.hidden = false;
    const seconds = Math.floor(diff / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    DOM.countdown.textContent = [h,m,s].map(v => String(v).padStart(2,"0")).join(":");
  }

  function setStatus(state, text){
    DOM.syncStatus.dataset.state = state;
    DOM.syncStatus.textContent = text;
  }

  function renderImportedTimes(times, source){
    if(!Array.isArray(times) || !times.length) return;

    const clean = times.filter(v => /^\d{2}:\d{2}$/.test(v)).slice(0, 12);
    if(!clean.length) return;

    DOM.input.value = clean[0];
    DOM.recordEntry.textContent = clean[0];
    DOM.recordExit.textContent = clean.length >= 2 && clean.length % 2 === 0 ? clean[clean.length-1] : "Em aberto";
    DOM.recordLast.textContent = clean[clean.length-1];
    DOM.records.hidden = false;
    setStatus("connected", source === "mobile" ? "PontoMais · importado do celular" : "PontoMais · sincronizado");
    DOM.syncHint.textContent = clean.length > 1
      ? "Marcações recebidas: " + clean.join(" · ")
      : "Entrada recebida: " + clean[0];

    calculateExit();
  }

  function readUrlImport(){
    const params = new URLSearchParams(location.search);
    const times = params.get("times");
    const entry = params.get("entry");
    const exit = params.get("exit");
    const source = params.get("source") || "mobile";

    if(times){
      renderImportedTimes(times.split(",").map(v => v.trim()), source);
      history.replaceState({}, "", location.pathname);
      return true;
    }

    if(entry){
      const values = [entry];
      if(exit) values.push(exit);
      renderImportedTimes(values, source);
      history.replaceState({}, "", location.pathname);
      return true;
    }

    return false;
  }

  function restoreLocalState(){
    const entry = localStorage.getItem("hourkwo.entry");
    const extra = localStorage.getItem("hourkwo.extra");

    if(entry) DOM.input.value = entry;
    if(extra === "1") DOM.extraToggle.checked = true;
  }

  DOM.input.addEventListener("change", calculateExit);
  DOM.input.addEventListener("keydown", e => { if(e.key === "Enter") calculateExit(); });
  DOM.extraToggle.addEventListener("change", calculateExit);
  DOM.syncButton.addEventListener("click", () => {
    PontoMais.requestSync();
    setStatus("waiting","PontoMais · sincronizando...");
    DOM.syncHint.textContent = "Solicitando os dados do PontoMais...";
  });

  window.addEventListener(PontoMais.DATA_EVENT, e => renderImportedTimes(
    e.detail?.horarios || (e.detail?.entrada ? [e.detail.entrada, e.detail.saida].filter(Boolean) : []),
    e.detail?.fonte === "mobile" ? "mobile" : "extension"
  ));
  window.addEventListener(PontoMais.STATUS_EVENT, e => {
    const status = e.detail;
    if(!status) return;
    if(status.state === "extension-missing"){
      setStatus("error","Extensão · não detectada");
      DOM.syncHint.textContent = "No celular, use a sincronização mobile em /mobile/.";
    }
    if(status.state === "pontomais-detected") setStatus("waiting","PontoMais · aba detectada");
    if(status.state === "capturing") setStatus("waiting","PontoMais · lendo dados da jornada");
  });

  setInterval(updateClock,1000);
  restoreLocalState();
  updateClock();
  calculateExit();
  if(!readUrlImport()) PontoMais.init();

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
})();