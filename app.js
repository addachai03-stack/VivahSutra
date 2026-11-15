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
let weddingNoteIndex=0;
function updateWeddingNote(reset=true){
  const occasion=$("occasionInput").value||"Wedding";
  const lines=weddingNotes[occasion]||weddingNotes.Wedding;
  if(reset)weddingNoteIndex=0;
  const target=$("weddingNote");
  if(target)target.textContent=lines[weddingNoteIndex%lines.length];
}

const fields=["languageInput","occasionInput","traditionInput","brideInput","groomInput","hostInput","relativesInput","dateInput","timeInput","venueInput","rsvpInput","messageInput","designInput","colorInput"];
const readData=()=>Object.fromEntries(fields.map(id=>[id,$(id).value]));
let editorReturnFocus=null;
const openEditor=()=>{editorReturnFocus=document.activeElement;modal.hidden=false;document.body.classList.add("editor-open");document.body.style.overflow="hidden";$("editorQuickNav").hidden=false;refreshPreview();$("closeEditor").focus();};
const closeEditor=()=>{modal.hidden=true;document.body.classList.remove("editor-open");document.body.style.overflow="";$("editorQuickNav").hidden=true;if(editorReturnFocus&&typeof editorReturnFocus.focus==="function")editorReturnFocus.focus();};
document.querySelectorAll("[data-editor-target]").forEach(button=>button.addEventListener("click",()=>{const target=$(button.dataset.editorTarget);if(!target)return;if(target.tagName==="DETAILS")target.open=true;target.scrollIntoView({behavior:"smooth",block:"start"});}));
$("heroCreate").addEventListener("click",openEditor);
$("topCreate").addEventListener("click",openEditor);
if($("bottomCreate"))$("bottomCreate").addEventListener("click",openEditor);
$("closeEditor").addEventListener("click",closeEditor);
modal.addEventListener("click",e=>{if(e.target===modal)closeEditor();});
document.addEventListener("keydown",e=>{if(modal.hidden)return;if(e.key==="Escape"){e.preventDefault();closeEditor();return;}if(e.key!=="Tab")return;const focusable=[...modal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length);if(!focusable.length){e.preventDefault();return;}const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});

const filterButtons=[...document.querySelectorAll(".filter-chip")];
const templateCards=[...document.querySelectorAll(".template-card")];
filterButtons.forEach(button=>{button.setAttribute("aria-pressed",String(button.classList.contains("active")));button.addEventListener("click",()=>{
  filterButtons.forEach(item=>{item.classList.toggle("active",item===button);item.setAttribute("aria-pressed",String(item===button));});
  templateCards.forEach(card=>{card.hidden=button.dataset.filter!=="all"&&card.dataset.category!==button.dataset.filter;});
});});
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
const traditionSymbols={Hindu:"ॐ",Muslim:"☪",Sikh:"☬",Christian:"✝",Jain:"अहिंसा","Secular / Other":"✦"};
const traditionMantras={Hindu:"॥ श्री गणेशाय नमः ॥",Muslim:"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",Sikh:"ੴ ਸਤਿਨਾਮ",Christian:"✝ WITH GOD’S BLESSINGS",Jain:"अहिंसा परमो धर्मः","Secular / Other":"WITH LOVE & BLESSINGS"};
const hindiOccasions={Wedding:"विवाह समारोह",Engagement:"सगाई समारोह",Haldi:"हल्दी समारोह",Mehendi:"मेहंदी समारोह",Sangeet:"संगीत समारोह",Reception:"स्वागत समारोह","Save the Date":"तिथि सुरक्षित रखें"};
const canvasFont=(language,serif=false)=>language==="hi"?(serif?'"Noto Serif Devanagari", "Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif':'"Noto Sans Devanagari", "Nirmala UI", Arial, sans-serif'):(serif?"Georgia":"Arial");
function refreshPreview(){
  const d=readData();
  const hindi=d.languageInput==="hi";
  document.documentElement.lang=hindi?"hi":"en";
  $("previewBride").textContent=d.brideInput.trim()||"Bride";
  $("previewGroom").textContent=d.groomInput.trim()||"Groom";
  $("previewHost").textContent=(d.hostInput.trim()||(hindi?"सपरिवार सादर आमंत्रित":"TOGETHER WITH THEIR FAMILIES")).toUpperCase();
  $("previewOccasion").textContent=hindi?(hindiOccasions[d.occasionInput]||"समारोह में सादर आमंत्रित"):(d.occasionInput==="Wedding"?"REQUEST THE PLEASURE OF YOUR COMPANY":"JOIN US TO CELEBRATE OUR "+d.occasionInput.toUpperCase());
  $("previewDate").textContent=dateLabel(d.dateInput,d.languageInput);
  $("previewTime").textContent=timeLabel(d.timeInput,d.languageInput);
  $("previewVenue").textContent=d.venueInput.trim().toUpperCase()||(hindi?"स्थान की जानकारी शीघ्र":"VENUE TO BE ANNOUNCED");
  $("previewMessage").textContent=d.messageInput.trim();
  $("previewTagline").textContent=hindi?"दो परिवारों का मिलन, दो दिलों का संगम":"Two families united, two hearts as one.";
  $("previewRsvp").textContent=d.rsvpInput.trim()?(hindi?"उत्तर हेतु · ":"RSVP · ")+d.rsvpInput.trim():"";
  const familyNames=d.relativesInput.split(/[\n,;]+/).map(name=>name.trim()).filter(Boolean);
  $("previewRelatives").replaceChildren(...(familyNames.length?familyNames.map(name=>{const line=document.createElement("div");line.textContent=name;return line;}):[Object.assign(document.createElement("div"),{textContent:hindi?"परिवार के नाम यहाँ दिखेंगे":"Your family names will appear here"})]));
  $("backKicker").textContent=hindi?"॥ सपरिवार ॥":"WITH LOVE & BLESSINGS";
  $("backTitle").textContent=hindi?"हमारे परिवार":"Our Families";
  $("backFooter").textContent=hindi?"आपकी उपस्थिति हमारे लिए अनमोल है":"WE LOOK FORWARD TO CELEBRATING WITH YOU";
  const flipped=$("flipCard").classList.contains("is-flipped");
  $("cardSideLabel").textContent=hindi?(flipped?"अंदर · परिवार के नाम":"मुखपृष्ठ"):(flipped?"Inside · Family names":"Front cover");
  $("flipCardButton").textContent=hindi?(flipped?"सामने देखें":"पीछे देखें"):(flipped?"Show front":"Flip card");
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
$("flipCardButton").addEventListener("click",()=>{$("flipCard").classList.toggle("is-flipped");refreshPreview();});
$("occasionInput").addEventListener("change",()=>updateWeddingNote(true));
updateWeddingNote();
fields.forEach(id=>$(id).addEventListener("input",()=>{refreshPreview();saveDraft();}));
fields.forEach(id=>$(id).addEventListener("change",()=>{refreshPreview();saveDraft();}));

const modeButtons=[...document.querySelectorAll(".mode-button")];
modeButtons.forEach(button=>{
  button.setAttribute("aria-pressed",String(button.classList.contains("active")));
  button.addEventListener("click",()=>{
    modeButtons.forEach(item=>{item.classList.toggle("active",item===button);item.setAttribute("aria-pressed",String(item===button));});
    document.body.classList.toggle("advanced-mode",button.dataset.mode==="advanced");
    $("saveStatus").textContent=button.dataset.mode==="advanced"?"Advanced controls shown.":"Simple editor selected.";
  });
});
let photoData={bride:"",groom:""},photoImages={bride:null,groom:null};
function waitForSelectedPhotos(){
  const pending=Object.entries(photoData).filter(([,source])=>Boolean(source)).map(([key])=>{
    const image=photoImages[key];
    if(!image)return Promise.reject(new Error("Selected invitation photo is unavailable."));
    if(image.complete)return image.naturalWidth?Promise.resolve():Promise.reject(new Error("Selected invitation photo could not be decoded."));
    return new Promise((resolve,reject)=>{
      image.addEventListener("load",()=>resolve(),{once:true});
      image.addEventListener("error",()=>reject(new Error("Selected invitation photo could not be loaded.")),{once:true});
      if(image.complete){
        if(image.naturalWidth)resolve();
        else reject(new Error("Selected invitation photo could not be decoded."));
      }
    });
  });
  return Promise.all(pending);
}
const designArtworkPaths={royal:"./assets/rajwada-royale.svg",floral:"./assets/garden-of-love.svg",minimal:"./assets/modern-heirloom.svg",traditional:"./assets/mangal-patrika.svg",mughal:"./assets/mughal-garden.svg",pastel:"./assets/pastel-bloom.svg"};
const designArtworkCache={};
function waitForDesignArtwork(){
  const key=readData().designInput||"royal";
  if(designArtworkCache[key])return designArtworkCache[key];
  designArtworkCache[key]=new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=()=>{delete designArtworkCache[key];reject(new Error("Selected template artwork could not be loaded."));};
    image.src=designArtworkPaths[key]||designArtworkPaths.royal;
  });
  return designArtworkCache[key];
}
function drawDesignArtwork(ctx,d){
  const artwork=designArtworkCache[d.designInput||"royal"];
  if(!artwork||!artwork.complete||!artwork.naturalWidth)return;
  ctx.save();ctx.globalAlpha=0.3;ctx.drawImage(artwork,35,35,1130,1530);ctx.restore();
}
const floralSideArtwork=new Image();\nconst floralSideArtworkReady=new Promise((resolve,reject)=>{floralSideArtwork.onload=resolve;floralSideArtwork.onerror=()=>reject(new Error("Floral side artwork could not be loaded."));floralSideArtwork.src="./assets/floral-side-ornaments.svg";});\nfunction waitForInvitationAssets(){return Promise.all([waitForSelectedPhotos(),waitForDesignArtwork(),floralSideArtworkReady,document.fonts?.ready||Promise.resolve()]);}
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
  const segmenter=typeof Intl!=="undefined"&&Intl.Segmenter?new Intl.Segmenter(undefined,{granularity:"grapheme"}):null;
  const splitGraphemes=value=>segmenter?Array.from(segmenter.segment(value),part=>part.segment):Array.from(value);
  const lines=[];let line="";
  words.forEach(word=>{
    const candidate=line?line+" "+word:word;
    if(line&&ctx.measureText(candidate).width>maxWidth&&lines.length<maxLines-1){lines.push(line);line=word;}
    else if(!line&&ctx.measureText(word).width>maxWidth){
      let chunk="";
      for(const grapheme of splitGraphemes(word)){if(chunk&&ctx.measureText(chunk+grapheme).width>maxWidth){lines.push(chunk);chunk=grapheme;}else chunk+=grapheme;}
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
function drawFloralSideArt(ctx){
  const artwork=floralSideArtwork;
  if(!artwork||!artwork.complete||!artwork.naturalWidth)return;
  ctx.save();ctx.globalAlpha=.78;ctx.drawImage(artwork,0,0,1200,1680);ctx.restore();
}
function makeInvitationImage(){
  const d=readData();
  const canvas=document.createElement("canvas");
  canvas.width=1200;canvas.height=1680;
  const ctx=canvas.getContext("2d");
  const themes={royal:["#4b1724","#f0d69f"],floral:["#f3e5e0","#70484d"],minimal:["#eee7da","#493b34"],traditional:["#f0d49a","#71352b"],mughal:["#29483b","#f3dfb5"],pastel:["#f7e9e7","#77545d"]};
  const [bg,ink]=themes[d.designInput]||themes.royal;
  const defaultAccents={royal:"#c99a4b",floral:"#b77d78",minimal:"#ad8d5d",traditional:"#9e5639",mughal:"#d1ad6e",pastel:"#c68c91"};
  const accents={gold:defaultAccents[d.designInput]||defaultAccents.royal,rose:"#c77b83",green:"#719078",blue:"#6b98a0"};
  const accent=accents[d.colorInput]||accents.gold;
  ctx.fillStyle=bg;ctx.fillRect(0,0,1200,1680);
  drawDesignArtwork(ctx,d);
  drawFloralSideArt(ctx);
  ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.strokeRect(35,35,1130,1610);ctx.lineWidth=2;ctx.strokeRect(55,55,1090,1570);
  ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=ink;
  const font=canvasFont(d.languageInput,true),plain=canvasFont(d.languageInput);
  const draw=(txt,y,size,fontFace=font,weight="normal",maxWidth=850)=>{
    const safe=String(txt||"");
    setCanvasFont(ctx,safe,maxWidth,size,22,fontFace,weight);
    ctx.fillText(safe,600,y,maxWidth);
  };
  const mantra=traditionMantras[d.traditionInput]||traditionMantras["Secular / Other"];
  draw(mantra,160,40,plain,"bold",900);
  draw(traditionSymbols[d.traditionInput]||"✦",260,116,"Georgia","normal",180);
  const chosenPhotoKeys=["bride","groom"].filter(key=>photoImages[key]&&photoImages[key].complete&&photoImages[key].naturalWidth);
  if(chosenPhotoKeys.length){
    const size=chosenPhotoKeys.length===1?150:128,gap=34,total=chosenPhotoKeys.length*size+(chosenPhotoKeys.length-1)*gap;
    chosenPhotoKeys.forEach((key,index)=>{
      const x=600-total/2+index*(size+gap),y=330-size/2;
      ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(photoImages[key],x,y,size,size);ctx.restore();
      ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2+4,0,Math.PI*2);ctx.stroke();
    });
  }
  draw((d.hostInput||(d.languageInput==="hi"?"सपरिवार":"TOGETHER WITH THEIR FAMILIES")).toUpperCase(),390,24,plain,"normal",820);
  draw(d.brideInput||"Bride",520,98,font,"normal",800);
  draw("&",620,42,"Georgia","normal",180);
  draw(d.groomInput||"Groom",720,98,font,"normal",800);
  ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(350,805);ctx.lineTo(850,805);ctx.stroke();
  const tagline=d.languageInput==="hi"?"दो परिवारों का मिलन, दो दिलों का संगम":"Two families united, two hearts as one.";
  ctx.font="bold 38px "+canvasFont(d.languageInput==="hi"?"hi":"en",true);
  const taglineLines=wrapCanvasText(ctx,tagline,780,2);
  drawCanvasLines(ctx,taglineLines,600,875,48);
  const occasion=d.languageInput==="hi"?(hindiOccasions[d.occasionInput]||"समारोह में"):(d.occasionInput==="Wedding"?"REQUEST THE PLEASURE OF YOUR COMPANY":"JOIN US TO CELEBRATE "+d.occasionInput.toUpperCase());
  draw(occasion,985,25,plain,"normal",820);
  draw(dateLabel(d.dateInput,d.languageInput),1060,35,plain,"bold",820);
  draw(timeLabel(d.timeInput,d.languageInput),1120,28,plain,"normal",820);
  const venue=(d.venueInput||(d.languageInput==="hi"?"स्थान की जानकारी शीघ्र":"VENUE TO BE ANNOUNCED")).toUpperCase();
  ctx.font="normal 27px "+plain;
  const venueLines=wrapCanvasText(ctx,venue,800,2);
  drawCanvasLines(ctx,venueLines,600,1190,36);
  let nextY=1270;
  if(d.messageInput){
    ctx.font="italic 29px "+font;
    const lines=wrapCanvasText(ctx,d.messageInput,790,2);
    drawCanvasLines(ctx,lines,600,nextY,37);nextY+=lines.length*37+8;
  }
  if(d.rsvpInput){
    const rsvp=(d.languageInput==="hi"?"उत्तर हेतु · ":"RSVP · ")+d.rsvpInput;
    ctx.font="normal 24px "+plain;
    const lines=wrapCanvasText(ctx,rsvp,800,2);
    drawCanvasLines(ctx,lines,600,nextY,32);nextY+=lines.length*32+8;
  }
  draw(d.languageInput==="hi"?"॥ सादर आमंत्रित ॥":"WITH LOVE & BLESSINGS",1535,33,plain,"bold",800);
  addFreeWatermark(ctx);
  return canvas;
}

function makeInvitationBackImage(){
  const d=readData();
  const canvas=document.createElement("canvas");
  canvas.width=1200;canvas.height=1680;
  const ctx=canvas.getContext("2d");
  const bg="#4b1724",ink="#f4dfb6",accent="#c99a4b";
  ctx.fillStyle=bg;ctx.fillRect(0,0,1200,1680);
  drawFloralSideArt(ctx);
  ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.strokeRect(35,35,1130,1610);ctx.lineWidth=2;ctx.strokeRect(55,55,1090,1570);
  ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=ink;
  const font=canvasFont(d.languageInput,true),plain=canvasFont(d.languageInput);
  const draw=(txt,y,size,fontFace=font,weight="normal",maxWidth=900)=>{
    const safe=String(txt||"");
    setCanvasFont(ctx,safe,maxWidth,size,20,fontFace,weight);
    ctx.fillText(safe,600,y,maxWidth);
  };
  draw(traditionMantras[d.traditionInput]||traditionMantras["Secular / Other"],145,36,plain,"bold",900);
  draw(traditionSymbols[d.traditionInput]||"✦",245,110,"Georgia","normal",180);
  draw(d.languageInput==="hi"?"हमारे परिवार":"OUR FAMILIES",365,64,font,"normal",850);
  ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(365,430);ctx.lineTo(835,430);ctx.stroke();
  const names=d.relativesInput.split(/[\n,;]+/).map(name=>name.trim()).filter(Boolean);
  const list=names.length?names:["Your family names"];
  const maxVisible=12,shown=list.slice(0,maxVisible),areaTop=500,areaBottom=1390,available=areaBottom-areaTop;
  let fontSize=31,lineHeight=43;
  let wrapped=[];
  for(let attempt=0;attempt<5;attempt++){
    ctx.font="normal "+fontSize+"px "+font;
    wrapped=shown.map(name=>wrapCanvasText(ctx,name,820,2));
    const totalLines=wrapped.reduce((sum,lines)=>sum+Math.max(1,lines.length),0);
    lineHeight=Math.min(43,Math.floor(available/Math.max(totalLines,1)));
    if(lineHeight>=fontSize*1.18)break;
    fontSize=Math.max(20,fontSize-3);
    lineHeight=Math.max(25,Math.min(38,Math.floor(available/Math.max(totalLines,1))));
  }
  let y=areaTop+lineHeight/2;
  wrapped.forEach(lines=>{
    ctx.font="normal "+fontSize+"px "+font;
    lines.forEach(line=>{ctx.fillText(line,600,y,840);y+=lineHeight;});
    y+=Math.max(5,Math.floor(lineHeight*.22));
  });
  if(list.length>maxVisible)draw(d.languageInput==="hi"?"और "+(list.length-maxVisible)+" सदस्य":"and "+(list.length-maxVisible)+" more family members",Math.min(1450,y+10),22,plain,"normal",800);
  draw(d.languageInput==="hi"?"आपकी उपस्थिति हमारे लिए अनमोल है":"WE LOOK FORWARD TO CELEBRATING WITH YOU",1540,19,plain,"normal",850);
  addFreeWatermark(ctx);
  return canvas;
}

$("downloadImage").addEventListener("click",async()=>{
  if(!requirePaidCheckout())return;
  try{
    await waitForInvitationAssets();
    const canvas=makeInvitationImage();const link=document.createElement("a");
    link.download="VivahSutra-Invitation.png";link.href=canvas.toDataURL("image/png");link.click();
    $("saveStatus").textContent="Invitation image created.";
  }catch(error){$("saveStatus").textContent="Design artwork or image export could not load. Please retry.";}
});
$("downloadBackImage").addEventListener("click",async()=>{
  if(!requirePaidCheckout())return;
  try{
    await waitForInvitationAssets();
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
    await waitForInvitationAssets();
    const makeFile=(canvas,name)=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(new File([blob],name,{type:"image/png"})):reject(new Error("Image conversion failed.")),"image/png"));
    const files=await Promise.all([
      makeFile(makeInvitationImage(),"VivahSutra-Invitation-Front.png"),
      makeFile(makeInvitationBackImage(),"VivahSutra-Invitation-Back.png")
    ]);
    if(navigator.canShare&&navigator.canShare({files})){
      await navigator.share({files,title:"Our wedding invitation"});
      $("saveStatus").textContent="Front and back shared together.";
    }else if(navigator.share){
      $("saveStatus").textContent="This browser cannot share both image files together. Download Front PNG and Back PNG, then select both in Photos to share.";
    }else{
      files.forEach(file=>{const url=URL.createObjectURL(file);const link=document.createElement("a");link.href=url;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
      $("saveStatus").textContent="Front and back images downloaded separately. Select both in Photos to share together.";
    }
  }catch(error){if(error.name!=="AbortError")$("saveStatus").textContent="Front and back sharing could not complete. Please retry.";}
});
if("serviceWorker"in navigator&&location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

/* Bottom app navigation: all destinations map to existing working features. */
const navCreateButton=$("navCreate");
const navPreviewButton=$("navPreview");
if(navCreateButton)navCreateButton.addEventListener("click",openEditor);
if(navPreviewButton)navPreviewButton.addEventListener("click",()=>{
  openEditor();
  requestAnimationFrame(()=>$("previewPanel").scrollIntoView({behavior:"smooth",block:"start"}));
});
document.querySelectorAll(".app-nav-item[href]").forEach(link=>link.addEventListener("click",()=>{
  document.querySelectorAll(".app-nav-item[href]").forEach(item=>item.classList.toggle("active",item===link));
}));
