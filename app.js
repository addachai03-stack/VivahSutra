const modal=document.getElementById("editorModal");
const $=id=>document.getElementById(id);
const fields=["languageInput","occasionInput","traditionInput","brideInput","groomInput","hostInput","relativesInput","dateInput","timeInput","venueInput","rsvpInput","messageInput","designInput","colorInput"];
const readData=()=>Object.fromEntries(fields.map(id=>[id,$(id).value]));
const openEditor=()=>{modal.hidden=false;document.body.style.overflow="hidden";refreshPreview();};
const closeEditor=()=>{modal.hidden=true;document.body.style.overflow="";};
$("heroCreate").addEventListener("click",openEditor);
$("topCreate").addEventListener("click",openEditor);
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

function dateLabel(value){
  if(!value)return "YOUR WEDDING DATE";
  const d=new Date(value+"T12:00:00");
  return Number.isNaN(d.valueOf())?"YOUR WEDDING DATE":d.toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}).toUpperCase();
}
function timeLabel(value){
  if(!value)return "";
  const [h,m]=value.split(":").map(Number);
  const suffix=h>=12?"PM":"AM";
  return (h%12||12)+":" +String(m).padStart(2,"0")+" "+suffix;
}
function refreshPreview(){
  const d=readData();
  const hindi=d.languageInput==="hi";
  $("previewBride").textContent=d.brideInput.trim()||"Bride";
  $("previewGroom").textContent=d.groomInput.trim()||"Groom";
  $("previewHost").textContent=(d.hostInput.trim()||(hindi?"सपरिवार सादर आमंत्रित":"TOGETHER WITH THEIR FAMILIES")).toUpperCase();
  $("previewOccasion").textContent=hindi?"आपको सादर आमंत्रित करते हैं":(d.occasionInput==="Wedding"?"REQUEST THE PLEASURE OF YOUR COMPANY":"JOIN US TO CELEBRATE OUR "+d.occasionInput.toUpperCase());
  $("previewDate").textContent=dateLabel(d.dateInput);
  $("previewTime").textContent=timeLabel(d.timeInput);
  $("previewVenue").textContent=d.venueInput.trim().toUpperCase()||"VENUE TO BE ANNOUNCED";
  $("previewMessage").textContent=d.messageInput.trim();
  $("previewRsvp").textContent=d.rsvpInput.trim()?"RSVP · "+d.rsvpInput.trim():"";
  const familyNames=d.relativesInput.split(/\n|,/).map(name=>name.trim()).filter(Boolean);
  $("previewRelatives").replaceChildren(...(familyNames.length?familyNames.map(name=>{const line=document.createElement("div");line.textContent=name;return line;}):[Object.assign(document.createElement("div"),{textContent:"Your family names will appear here"})]));
  $("previewMantra").textContent=hindi?"॥ शुभ मंगल ॥":(d.traditionInput==="Hindu"||d.traditionInput==="Jain"?"॥ श्री गणेशाय नमः ॥":"WITH JOY & BLESSINGS");
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
  ctx.textAlign="center";ctx.fillStyle=ink;
  const draw=(txt,y,size,font="Georgia",weight="normal")=>{ctx.font=weight+" "+size+"px "+font;ctx.fillText(txt,600,y,980);};
  draw(d.languageInput==="hi"?"॥ शुभ मंगल ॥":"॥ SHUBH VIVAH ॥",190,34);
  draw(d.designInput==="mughal"?"✿":d.designInput==="pastel"?"✧":"✺",260,78,"Georgia");
  const chosenPhotoKeys=["bride","groom"].filter(key=>photoImages[key]&&photoImages[key].complete&&photoImages[key].naturalWidth);
  if(chosenPhotoKeys.length){
    const size=chosenPhotoKeys.length===1?170:132;
    const gap=chosenPhotoKeys.length===1?0:34;
    const total=chosenPhotoKeys.length*size+(chosenPhotoKeys.length-1)*gap;
    chosenPhotoKeys.forEach((key,index)=>{
      const x=600-total/2+index*(size+gap),y=390-size/2;
      ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(photoImages[key],x,y,size,size);ctx.restore();
      ctx.strokeStyle=accent;ctx.lineWidth=6;ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2+4,0,Math.PI*2);ctx.stroke();
    });
  }
  draw((d.hostInput||"TOGETHER WITH THEIR FAMILIES").toUpperCase(),520,25,"Arial");
  draw(d.brideInput||"Bride",700,76);
  draw("&",790,45);
  draw(d.groomInput||"Groom",880,76);
  ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(300,960);ctx.lineTo(900,960);ctx.stroke();
  draw(d.occasionInput==="Wedding"?"REQUEST THE PLEASURE OF YOUR COMPANY":"JOIN US TO CELEBRATE "+d.occasionInput.toUpperCase(),1040,23,"Arial");
  draw(dateLabel(d.dateInput),1130,30,"Arial","bold");
  draw(timeLabel(d.timeInput),1185,25,"Arial");
  const venue=(d.venueInput||"VENUE TO BE ANNOUNCED").toUpperCase();
  const words=venue.split(" ");let line="",y=1260;
  ctx.font="28px Arial";
  for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>850){draw(line,y,28,"Arial");y+=42;line=word;}else line=test;}
  if(line)draw(line,y,28,"Arial");
  if(d.messageInput)draw(d.messageInput,1400,22,"Arial");
  if(d.rsvpInput)draw("RSVP · "+d.rsvpInput,1460,20,"Arial");
  draw(d.languageInput==="hi"?"॥ सादर आमंत्रित ॥":"WITH LOVE & BLESSINGS",1510,22);
  addFreeWatermark(ctx);
  return canvas;
}
$("downloadImage").addEventListener("click",()=>{
  if(!requirePaidCheckout())return;
  try{
    const canvas=makeInvitationImage();const link=document.createElement("a");
    link.download="VivahSutra-Invitation.png";link.href=canvas.toDataURL("image/png");link.click();
    $("saveStatus").textContent="Invitation image created.";
  }catch(error){$("saveStatus").textContent="Image export failed in this browser. Try PDF print.";}
});
$("printPdf").addEventListener("click",()=>{
  if(!requirePaidCheckout())return;
  try{
    const data=makeInvitationImage().toDataURL("image/png");
    const win=window.open("","_blank");
    if(!win){$("saveStatus").textContent="Allow pop-ups for this site, then try again.";return;}
    win.document.write('<!doctype html><html><head><title>VivahSutra Invitation</title><style>@page{size:A5 portrait;margin:0}html,body{margin:0;width:100%;height:100%}img{width:100%;height:100%;object-fit:contain}</style></head><body><img src="'+data+'" onload="window.print()"></body></html>');
    win.document.close();
  }catch(error){$("saveStatus").textContent="PDF print could not open. Try image download.";}
});
$("shareInvite").addEventListener("click",async()=>{
  if(!requirePaidCheckout())return;
  try{
    const blob=await new Promise(resolve=>makeInvitationImage().toBlob(resolve,"image/png"));
    const file=new File([blob],"VivahSutra-Invitation.png",{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Our wedding invitation"});}
    else if(navigator.share){await navigator.share({title:"Our wedding invitation",text:"You're invited to celebrate with us! "+$("previewDate").textContent+" · "+$("previewVenue").textContent});}
    else{$("saveStatus").textContent="Use Download image, then share it from Photos.";}
  }catch(error){if(error.name!=="AbortError")$("saveStatus").textContent="Sharing unavailable. Download the image instead.";}
});
if("serviceWorker"in navigator&&location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
