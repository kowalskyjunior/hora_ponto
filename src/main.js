(function(){
  const { DOM, Core, PontoMais } = window.HourKWO;
  let exitDate = null;
  let lastSync = null;

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
    DOM.countdown.textContent = [h,m,s].map((v,i)=> i === 0 ? String(v).padStart(2,"0") : String(v).padStart(2,"0")).join(":");
  }

  function setStatus(state, text){
    DOM.syncStatus.dataset.state = state;
    DOM.syncStatus.textContent = text;
  }

  function renderPontomais(payload){
    if(!payload || !payload.entrada){
      setStatus("waiting","PontoMais · nenhum registro de hoje detectado");
      DOM.syncHint.textContent = "Deixe a tela de ponto do PontoMais aberta e clique em Sincronizar novamente.";
      return;
    }

    lastSync = payload;
    DOM.input.value = payload.entrada;
    DOM.recordEntry.textContent = payload.entrada || "--:--";
    DOM.recordExit.textContent = payload.saida || "Em aberto";
    DOM.recordLast.textContent = payload.ultimoRegistro || payload.entrada || "--:--";
    DOM.records.hidden = false;
    setStatus("connected","PontoMais · sincronizado");
    DOM.syncHint.textContent = "Dados recebidos do PontoMais " + (payload.capturadoEm ? "às " + payload.capturadoEm : "") + ".";
    calculateExit();
  }

  function handleStatus(status){
    if(!status) return;
    if(status.state === "extension-missing"){
      setStatus("error","Extensão · não detectada");
      DOM.syncHint.textContent = "A extensão do HourKWO não está disponível nesta página.";
      return;
    }
    if(status.state === "pontomais-detected"){
      setStatus("waiting","PontoMais · aba detectada");
    }
    if(status.state === "capturing"){
      setStatus("waiting","PontoMais · lendo dados da jornada");
    }
    if(status.state === "error"){
      setStatus("error","PontoMais · falha ao ler dados");
      DOM.syncHint.textContent = status.message || "Não foi possível ler a jornada.";
    }
  }

  DOM.input.addEventListener("change", calculateExit);
  DOM.input.addEventListener("keydown", e => { if(e.key === "Enter") calculateExit(); });
  DOM.extraToggle.addEventListener("change", calculateExit);
  DOM.syncButton.addEventListener("click", () => {
    PontoMais.requestSync();
    setStatus("waiting","PontoMais · sincronizando...");
    DOM.syncHint.textContent = "Solicitando novamente os dados da jornada...";
  });

  window.addEventListener("hourkwo:noop",()=>{});
  window.addEventListener(PontoMais.DATA_EVENT, e => renderPontomais(e.detail));
  window.addEventListener(PontoMais.STATUS_EVENT, e => handleStatus(e.detail));

  setInterval(updateClock,1000);
  updateClock();
  calculateExit();
  PontoMais.init();
})();