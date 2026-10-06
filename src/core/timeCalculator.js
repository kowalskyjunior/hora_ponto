(function(){
  const BASE_MINUTES = 9 * 60 + 48;
  const EXTRA_MINUTES = 1 * 60 + 58;

  function parseTime(value){
    if(typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return null;
    const [hours, minutes] = value.split(":").map(Number);
    if(hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  function formatMinutes(total){
    const minutes = ((total % 1440) + 1440) % 1440;
    return String(Math.floor(minutes / 60)).padStart(2,"0") + ":" + String(minutes % 60).padStart(2,"0");
  }

  function calculateEntry(entry, extra){
    const start = parseTime(entry);
    if(start === null) return null;
    const journey = BASE_MINUTES + (extra ? EXTRA_MINUTES : 0);
    const exit = start + journey;
    return {
      entry,
      exit: formatMinutes(exit),
      journeyMinutes: journey,
      journeyLabel: extra ? "11h46min" : "9h48min"
    };
  }

  window.HourKWO = window.HourKWO || {};
  window.HourKWO.Core = { BASE_MINUTES, EXTRA_MINUTES, parseTime, formatMinutes, calculateEntry };
})();