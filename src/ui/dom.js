(function(){
  const $ = (id) => document.getElementById(id);
  window.HourKWO = window.HourKWO || {};
  window.HourKWO.DOM = {
    input:$("timeInput"),
    output:$("output"),
    countdown:$("countdown"),
    extraToggle:$("extraToggle"),
    journeyText:$("journeyText"),
    tag:$("tag"),
    currentClock:$("currentClock"),
    footerClock:$("footerClock"),
    syncStatus:$("syncStatus"),
    syncHint:$("syncHint"),
    syncButton:$("syncButton"),
    records:$("records"),
    recordEntry:$("recordEntry"),
    recordExit:$("recordExit"),
    recordLast:$("recordLast")
  };
})();