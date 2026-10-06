const STORAGE_KEY = "hourkwoPontomaisState";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({[STORAGE_KEY]: null});
});

chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
  if(message.type === "PONTOMAIS_DATA"){
    const payload = message.payload || null;
    chrome.storage.local.set({[STORAGE_KEY]:payload});
    broadcast({type:"PONTOMAIS_STATE",payload});
    sendResponse({ok:true});
    return true;
  }

  if(message.type === "PONTOMAIS_STATUS"){
    broadcast({type:"PONTOMAIS_STATUS",payload:message.payload || null});
    return;
  }

  if(message.type === "GET_PONTOMAIS_STATE"){
    chrome.storage.local.get(STORAGE_KEY).then(result => {
      const payload = result[STORAGE_KEY] || null;
      try{ sender.tab && chrome.tabs.sendMessage(sender.tab.id,{type:"PONTOMAIS_STATE",payload}); }catch{}
    });
  }
});

async function broadcast(message){
  try{
    const tabs = await chrome.tabs.query({});
    await Promise.all(tabs.filter(t=>t.id != null).map(t => chrome.tabs.sendMessage(t.id,message).catch(()=>null)));
  }catch{}
}