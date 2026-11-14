const modal=document.getElementById("editorModal");
const $=id=>document.getElementById(id);

const weddingNotes={
  Wedding:["शुभ शुरुआत, सुंदर यादें और अपनों का साथ।","दो दिल, दो परिवार — एक खूबसूरत रिश्ता।","मंगल अवसर पर आपका स्नेह ही सबसे बड़ा उपहार है।"],
  Engagement:["एक नए रिश्ते की पहली खूबसूरत अंगूठी।","दो परिवारों के मिलने से खुशियाँ दोगुनी होती हैं।","नई शुरुआत को अपनों के आशीर्वाद से सजाएँ।"],
  Haldi:["हल्दी की खुशबू, हँसी और ढेर सारा प्यार।","पीले रंग में रंग जाएँ खुशियों के पल।","हर रस्म में अपनों का साथ सबसे खास।"],
  Mehendi:["मेहंदी के रंग में सजे प्यार के नाम।","हथेलियों पर खुशियाँ, दिलों में उत्सव।","रंग गहरे हों और रिश्ते और भी प्यारे।"],
  Sangeet:["संगीत, मुस्कान और यादगार शाम।","हर धुन पर झूमें अपने, हर पल बने खास।","खुशियों की महफ़िल में आपका स्वागत है।"],
  Reception:["आपकी मौजूदगी हमारी शाम को खास बनाएगी।","मिलें, मुस्कुराएँ और खुशियाँ साथ मनाएँ।","एक यादगार शाम, अपनों के नाम।"],
  "Save the Date":["तारीख़ याद रखें — खुशियों का दिन आने वाला है।","एक खास दिन, एक प्यारा निमंत्रण।","हमारी नई कहानी की तारीख़ नोट कर लें।"]
};
let weddingNoteTimer;
let weddingNoteIndex=0;
function updateWeddingNote(reset=true){
  const occasion=$("occasionInput").value||"Wedding";
  const lines=weddingNotes[occasion]||weddingNotes.Wedding;
  if(reset)weddingNoteIndex=0;
  const target=$("weddingNote");
  if(target)target.textContent=lines[weddingNoteIndex%lines.length];
  clearInterval(weddingNoteTimer);
  weddingNoteTimer=setInterval(()=>{
    weddingNoteIndex=(weddingNoteIndex+1)%lines.length;
    if(target)target.textContent=lines[weddingNoteIndex];
  },4200);
}

const fields=["languageInput","occasionInput","traditionInput","brideInput","groomInput","hostInput","relativesInput","dateInput","timeInput","venueInput","rsvpInput","messageInput","designInput","colorInput"];
const readData=()=>Object.fromEntries(fields.map(id=>[id,$(id).value]));
const openEditor=()=>{modal.hidden=false;document.body.classList.add("editor-open");document.body.style.overflow="hidden";$("editorQuickNav").hidden=false;refreshPreview();};
const closeEditor=()=>{modal.hidden=true;document.body.classList.remove("editor-open");document.body.style.overflow="";$("editorQuickNav").hidden=true;};
document.querySelectorAll("[data-editor-target]").forEach(button=>button.addEventListener("click",()=>{const target=$(button.dataset.editorTarget);if(!target)return;if(target.tagName==="DETAILS")target.open=true;target.scrollIntoView({behavior:"smooth",block:"start"});}));
$("heroCreate").addEventListener("click",openEditor);
$("topCreate").addEventListener("click",openEditor);
if($("bottomCreate"))$("bottomCreate").addEventListener("click",openEditor);
$("closeEditor").addEventListener("click",closeEditor);
modal.addEventListener("click",e=>{if(e.target===modal)closeEditor();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden)closeEditor();});

const filterButtons=[...document.querySelectorAll(".filter-chip")];
const templateCards=[...document.querySelectorAll(".template-card")];
filterButtons.forEach(button=>button.addEventListener("click",()=>{
  filterButtons.forEach(item=>item.classList.toggle("active",item===button));
  templateCards.forEach(card=>{card.hidden=button.dataset.filter!=="all"&&card.dataset.category!==button.dataset.filter;});
}));
document.querySelectorAll(".choose-template").forEach((button,index)=>button.addEventListener("click",()=>{
  $("designInput").value=button.dataset.design||["royal","floral","minimal","traditional","mughal","pastel"][index]||"royal";
  openEditor();
}));

function dateLabel(value,language="en"){
  if(!value)return language==="hi"?"विवाह की तिथि":"YOUR WEDDING DATE";
  const d=new Date(value+"T12:00:00");
  return Number.isNaN(d.valueOf())?(language==="hi"?"विवाह की तिथि":"YOUR WEDDING DATE"):d.toLocaleDateString(language==="hi"?"hi-IN":"en-IN",{day:"2-digit",month:"long",year:"numeric"});
}
function timeLabel(value,language="en"){
  if(!value)return "";
  const [h,m]=value.split(":").map(Number);
  const suffix=language==="hi"?(h>=12?"अपराह्न":"पूर्वाह्न"):(h>=12?"PM":"AM");
  return (h%12||12)+":" +String(m).padStart(2,"0")+" "+suffix;
}
const traditionSymbols={Hindu:"ॐ",Muslim:"☪",Sikh:"☬",Christian:"✝",Jain:"卐","Secular / Other":"✦"};
const traditionMantras={Hindu:"॥ श्री गणेशाय नमः ॥",Muslim:"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",Sikh:"ੴ ਸਤਿਨਾਮ",Christian:"✝ WITH GOD’S BLESSINGS",Jain:"अहिंसा परमो धर्मः","Secular / Other":"WITH LOVE & BLESSINGS"};
const templateAssetPaths={royal:"./assets/rajwada-royale.svg",floral:"./assets/garden-of-love.svg",minimal:"./assets/modern-heirloom.svg",traditional:"./assets/mangal-patrika.svg",mughal:"./assets/mughal-garden.svg",pastel:"./assets/pastel-bloom.svg"};
const templateAssetImages={};
const templateAssetsReady=Promise.all(Object.entries(templateAssetPaths).map(([design,path])=>new Promise((resolve,reject)=>{
  const image=new Image();
  templateAssetImages[design]=image;
  image.onload=()=>resolve();
  image.onerror=()=>reject(new Error("Invitation design artwork could not be loaded."));
  image.src=path;
})));
function drawTemplateAsset(ctx,design){
  const asset=templateAssetImages[design];
  if(!asset||!asset.complete||!asset.naturalWidth)return false;
  ctx.save();ctx.globalAlpha=.34;ctx.drawImage(asset,0,0,1200,1600);ctx.restore();return true;
}
const hindiOccasions={Wedding:"विवाह समारोह",Engagement:"सगाई समारोह",Haldi:"हल्दी समारोह",Mehendi:"मेहंदी समारोह",Sangeet:"संगीत समारोह",Reception:"स्वागत समारोह","Save the Date":"तिथि सुरक्षित रखें"};
const canvasFont=(language,serif=false)=>language==="hi"?(serif?'"Noto Serif Devanagari", "Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif':'"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif'):(serif?"Georgia":"Arial");
function refreshPreview(){
  const d=readData();
  const hindi=d.languageInput==="hi";
  $("previewBride").textContent=d.brideInput.trim()||"Bride";
  $("previewGroom").textContent=d.groomInput.trim()||"Groom";
  $("previewHost").textContent=(d.hostInput.trim()||(hindi?"सपरिवार सादर आमंत्रित":"TOGETHER WITH THEIR FAMILIES")).toUpperCase();
  $("previewOccasion").textContent=hindi?(hindiOccasions[d.occasionInput]||"समारोह में सादर आमंत्रित"):(d.occasionInput==="Wedding"?"REQUEST THE PLEASURE OF YOUR COMPANY":"JOIN US TO CELEBRATE OUR "+d.occasionInput.toUpperCase());
  $("previewDate").textContent=dateLabel(d.dateInput,d.languageInput);
  $("previewTime").textContent=timeLabel(d.timeInput,d.languageInput);
  $("previewVenue").textContent=d.venueInput.trim().toUpperCase()||(hindi?"स्थान की जानकारी शीघ्र":"VENUE TO BE ANNOUNCED");
  $("previewMessage").textContent=d.messageInput.trim();
  $("previewTagline").textContent="दो परिवारों का मिलन, दो दिलों का संगम";
  $("previewRsvp").textContent=d.rsvpInput.trim()?(hindi?"उत्तर हेतु · ":"RSVP · ")+d.rsvpInput.trim():"";
  const familyNames=d.relativesInput.split(/[\n,;]+/).map(name=>name.trim()).filter(Boolean);
  $("previewRelatives").replaceChildren(...(familyNames.length?familyNames.map(name=>{const line=document.createElement("div");line.textContent=name;return line;}):[Object.assign(document.createElement("div"),{textContent:hindi?"परिवार के नाम यहाँ दिखेंगे":"Your family names will appear here"})]));
  $("backKicker").textContent=hindi?"॥ सपरिवार ॥":"WITH LOVE & BLESSINGS";
  $("backTitle").textContent=hindi?"हमारे परिवार":"Our Families";
  $("backFooter").textContent=hindi?"आपकी उपस्थिति हमारे लिए अनमोल है":"WE LOOK FORWARD TO CELEBRATING WITH YOU";
  $("previewMantra").textContent=traditionMantras[d.traditionInput]||traditionMantras["Secular / Other"];
  $("previewTraditionSymbol").textContent=traditionSymbols[d.traditionInput]||"✦";
  $("exportCard").className="export-card design-"+d.designInput+" accent-"+d.colorInput;
  $("exportCard").dataset.language=d.languageInput;
  const photoWrap=$("previewPhotos");
  const photoIds=["bride","groom"];
  const previewIds=["previewBridePhoto","previewGroomPhoto"];
  let visiblePhotos=0;
  photoIds.forEach((key,index)=>{const el=$(previewIds[index]);if(photoData[key]){el.src=photoData[key];el.hidden=false;visiblePhotos++;}else{el.removeAttribute("src");el.hidden=true;}});
  photoWrap.hidden=visiblePhotos===0;
}
$("inviteForm").addEventListener("submit",e=>{e.preventDefault();refreshPreview();$("saveStatus").textContent="Preview updated.";});
$("flipCardButton").addEventListener("click",()=>{const card=$("flipCard");card.classList.toggle("is-flipped");$("cardSideLabel").textContent=card.classList.contains("is-flipped")?"Inside · Family names":"Front cover";$("flipCardButton").textContent=card.classList.contains("is-flipped")?"Fold / Flip to front ↻":"Open / Flip card ↻";});
$("occasionInput").addEventListener("change",()=>updateWeddingNote(true));
updateWeddingNote();
fields.forEach(id=>$(id).addEventListener("input",()=>{refreshPreview();saveDraft();}));
fields.forEach(id=>$(id).addEventListener("change",()=>{refreshPreview();saveDraft();}));

document.querySelectorAll(".mode-button").forEach(button=>button.addEventListener("click",()=>{
  document.querySelectorAll(".mode-button").forEach(b=>b.classList.toggle("active",b===button));
  document.body.classList.toggle("advanced-mode",button.dataset.mode==="advanced");
  $("saveStatus").textContent=button.dataset.mode==="advanced"?"Advanced controls shown.":"Simple editor selected.";
}));
let photoData={bride:"",groom:""},photoImages={bride:null,groom:null};
function saveDraft(){
  try{
    localStorage.setItem("vivahsutra-draft-v1",JSON.stringify({...readData(),photoData}));
    $("saveStatus").textContent="Draft saved on this device ✓";
  }catch(error){$("saveStatus").textContent="Could not save on this device. Please check browser storage.";}
}
$("saveDraft").addEventListener("click",saveDraft);
try{
  const saved=JSON.parse(localStorage.getItem("vivahsutra-draft-v1")||"null");
  if(saved){fields.forEach(id=>{if(typeof saved[id]==="string")$(id).value=saved[id];});photoData={bride:typeof saved.photoData==="object"?(saved.photoData?.bride||""):"",groom:typeof saved.photoData==="object"?(saved.photoData?.groom||""):""};
    Object.keys(photoData).forEach(key=>{if(photoData[key]){photoImages[key]=new Image();photoImages[key].onload=()=>refreshPreview();photoImages[key].src=photoData[key];}});}
}catch(error){/* Ignore an unreadable local draft and keep the starter values. */}
updateWeddingNote();
refreshPreview();
function handlePhotoInput(inputId,key){
  $(inputId).addEventListener("change",()=>{
    const file=$(inputId).files&&$(inputId).files[0];
    if(!file){photoData[key]="";photoImages[key]=null;refreshPreview();saveDraft();return;}
    if(!file.type.startsWith("image/")){$("saveStatus").textContent="Please choose an image from Photos.";return;}
    if(file.size>12*1024*1024){$("saveStatus").textContent="Choose a photo smaller than 12 MB.";return;}
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(1,900/Math.max(img.width,img.height));
        const cv=document.createElement("canvas");
        cv.width=Math.max(1,Math.round(img.width*scale));cv.height=Math.max(1,Math.round(img.height*scale));
        cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
        photoData[key]=cv.toDataURL("image/jpeg",0.78);
        photoImages[key]=new Image();
        photoImages[key].onload=()=>{refreshPreview();saveDraft();};
        photoImages[key].src=photoData[key];
      };
      img.onerror=()=>{$("saveStatus").textContent="Could not read this photo. Try another image.";};
      img.src=reader.result;
    };
    reader.onerror=()=>{$("saveStatus").textContent="Photo could not be opened.";};
    reader.readAsDataURL(file);
  });
}
handlePhotoInput("bridePhotoInput","bride");
handlePhotoInput("groomPhotoInput","groom");


let selectedPlan="free";
const planDetails={free:{price:0,label:"Free"},basic:{price:29,label:"Basic"},premium:{price:49,label:"Premium"},royal:{price:79,label:"Royal"}};
document.querySelectorAll(".plan-option").forEach(button=>button.addEventListener("click",()=>{
  selectedPlan=button.dataset.plan;
  document.querySelectorAll(".plan-option").forEach(item=>item.classList.toggle("selected",item===button));
  const detail=planDetails[selectedPlan];
  $("planStatus").textContent=selectedPlan==="free"
    ?"Free Beta is active. Create your invitation and download or share a watermarked sample."
    :detail.label+" plan selected (₹"+detail.price+"). Secure online checkout is not connected yet; no payment will be taken.";
}));
function addFreeWatermark(ctx){
  if(selectedPlan!=="free")return;
  ctx.save();
  ctx.translate(600,800);
  ctx.rotate(-Math.PI/5);
  ctx.fillStyle="rgba(110,75,65,.22)";
  ctx.font="bold 72px Arial";
  ctx.textAlign="center";
  ctx.fillText("VIVAHSUTRA • FREE PREVIEW",0,0);
  ctx.restore();
}
function requirePaidCheckout(){
  if(selectedPlan==="free")return true;
  $("planStatus").textContent="Paid plans are not active in Free Beta. No payment has been taken. Select Free to download a watermarked sample.";
  $("saveStatus").textContent="Paid checkout is not connected yet.";
  return false;
}
function setCanvasFont(ctx,text,maxWidth,startSize,minSize=20,font=canvasFont(readData().languageInput,true),weight="normal"){
  let size=startSize;
  do{
    ctx.font=weight+" "+size+"px "+font;
    if(ctx.measureText(text).width<=maxWidth||size<=minSize)break;
    size-=2;
  }while(size>=minSize);
  return size;
}
function wrapCanvasText(ctx,text,maxWidth,maxLines=2){
  const words=String(text||"").trim().split(/\s+/).filter(Boolean);
  if(!words.length)return [];
  const lines=[];let line="";
  words.forEach(word=>{
    const candidate=line?line+" "+word:word;
    if(line&&ctx.measureText(candidate).width>maxWidth&&lines.length<maxLines-1){lines.push(line);line=word;}
    else if(!line&&ctx.measureText(word).width>maxWidth){
      let chunk="";
      for(const char of word){if(chunk&&ctx.measureText(chunk+char).width>maxWidth){lines.push(chunk);chunk=char;}else chunk+=char;}
      line=chunk;
    }else line=candidate;
  });
  if(line)lines.push(line);
  if(lines.length>maxLines){lines.length=maxLines;lines[maxLines-1]=lines[maxLines-1].replace(/[.…]*$/,"")+"…";}
  return lines;
}
function drawCanvasLines(ctx,lines,x,y,lineGap){
  lines.forEach((line,index)=>ctx.fillText(line,x,y+index*lineGap));
}
function makeInvitationImage(){
  const d=readData();
  const canvas=document.createElement("canvas");
  canvas.width=1200;canvas.height=1600;
  const ctx=canvas.getContext("2d");
  const themes={royal:["#4b1724","#f0d69f"],floral:["#f3e5e0","#70484d"],minimal:["#eee7da","#493b34"],traditional:["#f0d49a","#71352b"],mughal:["#29483b","#f3dfb5"],pastel:["#f7e9e7","#77545d"]};
  const [bg,ink]=themes[d.designInput]||themes.royal;
  const accents={gold:"#c99a4b",rose:"#b76d75",green:"#64816a",blue:"#54808a"};
  const accent=accents[d.colorInput]||accents.gold;
  ctx.fillStyle=bg;ctx.fillRect(0,0,1200,1600);
  ctx.strokeStyle=accent;ctx.lineWidth=8;ctx.strokeRect(48,48,1104,1504);ctx.lineWidth=2;ctx.strokeRect(70,70,1060,1460);
  drawTemplateAsset(ctx,d.designInput);
  ctx.textAlign="center";ctx.fillStyle=ink;
  const font=canvasFont(d.languageInput,true),plain=canvasFont(d.languageInput);
  const draw=(txt,y,size,fontFace=font,weight="normal",maxWidth=960)=>{
    const safe=String(txt||"");
    setCanvasFont(ctx,safe,maxWidth,size,18,fontFace,weight);
    ctx.fillText(safe,600,y,maxWidth);
  };
  draw(traditionMantras[d.traditionInput]||traditionMantras["Secular / Other"],180,32,plain);
  draw(traditionSymbols[d.traditionInput]||"✦",250,72,"Georgia");
  const chosenPhotoKeys=["bride","groom"].filter(key=>photoImages[key]&&photoImages[key].complete&&photoImages[key].naturalWidth);
  if(chosenPhotoKeys.length){
    const size=chosenPhotoKeys.length===1?156:122,gap=34,total=chosenPhotoKeys.length*size+(chosenPhotoKeys.length-1)*gap;
    chosenPhotoKeys.forEach((key,index)=>{
      const x=600-total/2+index*(size+gap),y=315-size/2;
      ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(photoImages[key],x,y,size,size);ctx.restore();
      ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2+4,0,Math.PI*2);ctx.stroke();
    });
  }
  draw((d.hostInput||(d.languageInput==="hi"?"सपरिवार":"TOGETHER WITH THEIR FAMILIES")).toUpperCase(),435,24,plain);
  draw(d.brideInput||"Bride",600,72);
  draw("&",680,42,"Georgia");
  draw(d.groomInput||"Groom",760,72);
  ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(300,825);ctx.lineTo(900,825);ctx.stroke();
  draw("दो परिवारों का मिलन, दो दिलों का संगम",890,28,canvasFont("hi",true),"bold");
  const occasion=d.languageInput==="hi"?(hindiOccasions[d.occasionInput]||"समारोह में"):(d.occasionInput==="Wedding"?"REQUEST THE PLEASURE OF YOUR COMPANY":"JOIN US TO CELEBRATE "+d.occasionInput.toUpperCase());
  draw(occasion,950,22,plain);
  draw(dateLabel(d.dateInput,d.languageInput),1020,29,plain,"bold");
  draw(timeLabel(d.timeInput,d.languageInput),1065,24,plain);
  const venue=(d.venueInput||(d.languageInput==="hi"?"स्थान की जानकारी शीघ्र":"VENUE TO BE ANNOUNCED")).toUpperCase();
  ctx.font="normal 27px "+plain;
  const venueLines=wrapCanvasText(ctx,venue,850,2);
  drawCanvasLines(ctx,venueLines,600,1130,36);
  let nextY=1190;
  if(d.messageInput){
    ctx.font="normal 21px "+plain;
    const lines=wrapCanvasText(ctx,d.messageInput,850,2);
    drawCanvasLines(ctx,lines,600,nextY,30);nextY+=lines.length*30+12;
  }
  if(d.rsvpInput){
    const rsvp=(d.languageInput==="hi"?"उत्तर हेतु · ":"RSVP · ")+d.rsvpInput;
    ctx.font="normal 19px "+plain;
    const lines=wrapCanvasText(ctx,rsvp,850,2);
    drawCanvasLines(ctx,lines,600,nextY,27);nextY+=lines.length*27+8;
  }
  draw(d.languageInput==="hi"?"॥ सादर आमंत्रित ॥":"WITH LOVE & BLESSINGS",Math.min(1510,Math.max(1450,nextY+28)),21,plain);
  addFreeWatermark(ctx);
  return canvas;
}

function makeInvitationBackImage(){
  const d=readData();
  const canvas=document.createElement("canvas");
  canvas.width=1200;canvas.height=1600;
  const ctx=canvas.getContext("2d");
  const themes={royal:["#4b1724","#f0d69f"],floral:["#f3e5e0","#70484d"],minimal:["#eee7da","#493b34"],traditional:["#f0d49a","#71352b"],mughal:["#29483b","#f3dfb5"],pastel:["#f7e9e7","#77545d"]};
  const [bg,ink]=themes[d.designInput]||themes.royal;
  const accents={gold:"#c99a4b",rose:"#b76d75",green:"#64816a",blue:"#54808a"};
  const accent=accents[d.colorInput]||accents.gold;
  ctx.fillStyle=bg;ctx.fillRect(0,0,1200,1600);
  ctx.strokeStyle=accent;ctx.lineWidth=8;ctx.strokeRect(48,48,1104,1504);ctx.lineWidth=2;ctx.strokeRect(70,70,1060,1460);
  drawTemplateAsset(ctx,d.designInput);
  ctx.textAlign="center";ctx.fillStyle=ink;
  const font=canvasFont(d.languageInput,true),plain=canvasFont(d.languageInput);
  const draw=(txt,y,size,fontFace=font,weight="normal",maxWidth=940)=>{
    const safe=String(txt||"");
    setCanvasFont(ctx,safe,maxWidth,size,18,fontFace,weight);
    ctx.fillText(safe,600,y,maxWidth);
  };
  draw(traditionMantras[d.traditionInput]||traditionMantras["Secular / Other"],210,28,plain);
  draw(traditionSymbols[d.traditionInput]||"✦",290,70,"Georgia");
  draw(d.languageInput==="hi"?"हमारे परिवार":"OUR FAMILIES",380,58);
  ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(300,440);ctx.lineTo(900,440);ctx.stroke();
  const names=d.relativesInput.split(/[\n,;]+/).map(name=>name.trim()).filter(Boolean);
  const list=names.length?names:["Your family names"];
  const maxVisible=14,shown=list.slice(0,maxVisible);
  const startY=535,availableHeight=800,lineGap=Math.min(68,Math.floor(availableHeight/Math.max(shown.length,1)));
  shown.forEach((name,index)=>{
    const size=setCanvasFont(ctx,name,900,36,19,font);
    ctx.fillText(name,600,startY+index*lineGap,900);
  });
  if(list.length>maxVisible)draw(d.languageInput==="hi"?"और "+(list.length-maxVisible)+" सदस्य":"and "+(list.length-maxVisible)+" more family members",startY+maxVisible*lineGap+12,22,plain);
  draw(d.languageInput==="hi"?"आपकी उपस्थिति हमारे लिए अनमोल है":"WE LOOK FORWARD TO CELEBRATING WITH YOU",1430,19,plain);
  addFreeWatermark(ctx);
  return canvas;
}
$("downloadImage").addEventListener("click",async()=>{
  if(!requirePaidCheckout())return;
  try{
    await templateAssetsReady;
    const canvas=makeInvitationImage();const link=document.createElement("a");
    link.download="VivahSutra-Invitation.png";link.href=canvas.toDataURL("image/png");link.click();
    $("saveStatus").textContent="Invitation image created.";
  }catch(error){$("saveStatus").textContent="Design artwork or image export could not load. Please retry.";}
});
$("printPdf").addEventListener("click",async()=>{
  if(!requirePaidCheckout())return;
  const win=window.open("","_blank");
  if(!win){$("saveStatus").textContent="Allow pop-ups for this site, then try again.";return;}
  try{
    await templateAssetsReady;
    const front=makeInvitationImage().toDataURL("image/png");
    const back=makeInvitationBackImage().toDataURL("image/png");
    win.document.write('<!doctype html><html><head><title>VivahSutra Two-Sided Invitation</title><style>@page{size:A5 portrait;margin:0}html,body{margin:0;padding:0} .page{width:100%;height:100vh;display:flex;align-items:center;justify-content:center;page-break-after:always;break-after:page} .page:last-child{page-break-after:auto;break-after:auto}img{width:100%;height:100%;object-fit:contain}</style></head><body><div class="page"><img src="'+front+'"></div><div class="page"><img src="'+back+'"></div><script>window.onload=()=>window.print()<\/script></body></html>');
    win.document.close();
    $("saveStatus").textContent="Two-sided PDF is ready: front and family-name back.";
  }catch(error){win.close();$("saveStatus").textContent="Design artwork or PDF export could not load. Please retry.";}
});
$("downloadBackImage").addEventListener("click",async()=>{
  if(!requirePaidCheckout())return;
  try{
    await templateAssetsReady;
    const link=document.createElement("a");
    link.download="VivahSutra-Invitation-Back.png";
    link.href=makeInvitationBackImage().toDataURL("image/png");
    link.click();
    $("saveStatus").textContent="Back-side image created.";
  }catch(error){$("saveStatus").textContent="Design artwork or back-side export could not load. Please retry.";}
});
$("shareInvite").addEventListener("click",async()=>{
  if(!requirePaidCheckout())return;
  try{
    await templateAssetsReady;
    const blob=await new Promise((resolve,reject)=>makeInvitationImage().toBlob(result=>result?resolve(result):reject(new Error("Image conversion failed.")),"image/png"));
    const file=new File([blob],"VivahSutra-Invitation.png",{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Our wedding invitation"});}
    else if(navigator.share){await navigator.share({title:"Our wedding invitation",text:"You're invited to celebrate with us! "+$("previewDate").textContent+" · "+$("previewVenue").textContent});}
    else{$("saveStatus").textContent="Use Download image, then share it from Photos.";}
  }catch(error){if(error.name!=="AbortError")$("saveStatus").textContent="Design artwork or sharing could not load. Please retry.";}
});
if("serviceWorker"in navigator&&location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
