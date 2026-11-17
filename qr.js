'use strict';
const grid=document.getElementById('qrGrid');
const status=document.getElementById('qrStatus');
document.getElementById('printBtn').addEventListener('click',()=>window.print());
(async()=>{
  try{
    const response=await fetch('sons.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Catalogue introuvable.');
    const sounds=await response.json();
    if(typeof QRCode==='undefined')throw new Error('Bibliothèque QR indisponible : vérifie ta connexion internet.');
    for(const sound of sounds){
      const card=document.createElement('div');card.className='qr-card';
      const qr=document.createElement('div');qr.className='qr-slot';
      const icon=document.createElement('span');icon.className='sound-icon sound-icon-card tone-'+(sound.couleur||'mint');icon.textContent=sound.icone||'🔊';icon.setAttribute('aria-hidden','true');
      const title=document.createElement('strong');title.textContent=sound.nom;
      const id=document.createElement('code');id.textContent=sound.id;
      card.append(icon,qr);grid.append(card);
      new QRCode(qr,{text:sound.id,width:130,height:130,colorDark:'#14293a',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
    }
    status.textContent=sounds.length+' QR codes générés. Ils sont stables même si tu modifies ensuite le fichier MP3 associé.';
  }catch(err){status.textContent='Erreur : '+err.message;}
})();
