/* Studio des Sons — V2 : pictogrammes, vérification du scan, déplacement et suppression. */
'use strict';
const state = {
  catalog: [], byId: new Map(), queue: [], lastAdded: null, selected: -1,
  scanner: null, scannerRunning: false, scanning: false,
  session: null, loading: false, playingIndex: -1
};
const $ = id => document.getElementById(id);
const msg = (text, type = '') => {
  const el = $('status'); el.textContent = type === 'error' ? '⚠' : type === 'success' ? '✓' : '♪';
  el.setAttribute('aria-label', text); el.className = 'status ' + type;
};
const info = (symbol, label) => { $('playbackInfo').textContent=symbol; $('playbackInfo').setAttribute('aria-label',label); };
const soundIcon = sound => sound?.icone || '🔊';
const soundTone = sound => ['amber','lavender','coral','sky','mint'].includes(sound?.couleur) ? sound.couleur : 'mint';

function normalizeId(content) {
  const str = String(content || '').trim();
  if (state.byId.has(str.toUpperCase())) return str.toUpperCase();
  try {
    const url = new URL(str);
    const id = url.searchParams.get('son') || url.searchParams.get('id');
    if (id && state.byId.has(id.toUpperCase())) return id.toUpperCase();
  } catch (_) { /* Le QR peut contenir seulement S001. */ }
  return null;
}

function addSound(raw) {
  const id = normalizeId(raw);
  if (!id) { msg('QR code non reconnu. Le code doit contenir S001, S002…', 'error'); return false; }
  if (state.queue.length >= 5) { msg('Il y a déjà cinq sons. Retire-en un avant d’en ajouter un autre.', 'error'); return false; }
  if (state.session) void stopPlayback();
  if (state.loading) return false;
  state.queue.push(id);
  state.selected = state.queue.length - 1;
  state.lastAdded = id;
  render();
  msg('✓ « ' + state.byId.get(id).nom + ' » ajouté en position ' + state.queue.length + '.', 'success');
  return true;
}

function render() {
  const busy = state.loading;
  $('counter').textContent = state.queue.length + ' / 5';
  $('playBtn').disabled = state.queue.length !== 5 || busy || !!state.session;
  $('scanBtn').disabled = state.queue.length >= 5 || !state.catalog.length || busy;
  $('clearBtn').disabled = !state.queue.length && !state.session;
  $('deleteBtn').disabled = state.selected < 0 || busy;
  $('upBtn').disabled = state.selected <= 0 || busy;
  $('downBtn').disabled = state.selected < 0 || state.selected >= state.queue.length-1 || busy;
  const list = $('trackList'); list.replaceChildren();
  for (let i=0;i<5;i++) {
    const sound=state.byId.get(state.queue[i]);
    const li=document.createElement('li');
    li.className='track-item'+(!sound?' empty':'')+(i===state.playingIndex?' is-playing':'')+(i===state.selected?' selected':'');
    const index=document.createElement('span');index.className='track-index';index.textContent=i+1;
    const button=document.createElement('button');button.className='sound-choice';button.disabled=!sound || busy;
    button.setAttribute('aria-label',sound ? sound.nom+', position '+(i+1) : 'Emplacement libre');
    button.setAttribute('aria-pressed',String(i===state.selected));
    const icon=document.createElement('span');icon.className='sound-icon tone-'+soundTone(sound);icon.textContent=sound?soundIcon(sound):'♪';
    if (sound) {
      const imagePath = sound.image || sound.fichier.replace(/^audio\//, 'images/').replace(/\.mp3$/i, '.png');
      const img = document.createElement('img');
      img.className = 'sound-illustration'; img.alt = sound.nom; img.draggable = false;
      img.addEventListener('load', () => icon.replaceChildren(img), {once:true});
      img.addEventListener('error', () => { icon.textContent = soundIcon(sound); }, {once:true});
      img.src = imagePath;
    }
    button.append(icon);button.addEventListener('click',()=>{state.selected=i;render();});
    const check=document.createElement('span');check.className='selection-check';check.textContent=i===state.selected?'✓':'';check.setAttribute('aria-hidden','true');
    li.append(index,button,check);list.append(li);
  }
  if (!state.session && !busy) info(state.queue.length===5?'✓':'○ ○ ○ ○ ○','Ajoute cinq sons puis appuie sur Lecture.');
}

function moveSound(index, delta) {
  if (state.loading) return;
  const other = index + delta;
  if (other < 0 || other >= state.queue.length) return;
  if (state.session) void stopPlayback();
  [state.queue[index],state.queue[other]] = [state.queue[other],state.queue[index]];
  state.selected = other;
  render();
}
function removeSound(index) {
  if (state.loading) return;
  if (state.session) void stopPlayback();
  if (index < 0 || index >= state.queue.length) return;
  state.queue.splice(index,1);
  state.selected = Math.min(index,state.queue.length-1);
  if (!state.queue.includes(state.lastAdded)) state.lastAdded = state.queue.at(-1) || null;
  render();
  msg('Son retiré. Tu peux scanner une nouvelle carte.');
}

async function closeCamera() {
  if (!state.scanner) return;
  const scanner = state.scanner; state.scanner = null;
  try { if (state.scannerRunning) await scanner.stop(); } catch (error) { console.warn('Arrêt caméra :',error); }
  state.scannerRunning = false;
  try { scanner.clear(); } catch (_) {}
  $('scannerBox').hidden = true;
}
async function openCamera() {
  if (state.scanner) return;
  if (typeof Html5Qrcode === 'undefined') {
    msg('Scanner indisponible. Vérifie la connexion internet.', 'error'); return;
  }
  $('scannerBox').hidden = false;
  msg('Ouverture de la caméra…');
  try {
    const scanner = new Html5Qrcode('qr-reader', {verbose:false});
    state.scanner = scanner;
    await scanner.start(
      {facingMode:'environment'}, {fps:10,qrbox:{width:220,height:220}},
      async decoded => {
        if (state.scanning) return;
        state.scanning = true;
        await closeCamera();
        addSound(decoded);
        state.scanning = false;
      }, () => {}
    );
    if (state.scanner === scanner) { state.scannerRunning = true; msg('Caméra ouverte : vise le QR code d’une carte.'); }
  } catch (error) {
    console.warn(error); await closeCamera();
    msg('Impossible d’accéder à la caméra. Autorise-la et utilise l’adresse HTTPS de ton site.', 'error');
  }
}

function showPlayingPosition(position) {
  if (position === state.playingIndex) return;
  state.playingIndex = position;
  document.querySelectorAll('.track-item').forEach((li,i) => li.classList.toggle('is-playing',i===position));
}
async function stopPlayback() {
  const session = state.session; state.session = null; state.loading = false;
  showPlayingPosition(-1);
  if (!session) { $('stopBtn').disabled = true; $('progressBar').style.width = '0%'; return; }
  if (session.timer) clearInterval(session.timer);
  for (const source of session.sources) { try { source.stop(); } catch (_) {} }
  try { if (session.ctx && session.ctx.state !== 'closed') await session.ctx.close(); } catch (_) {}
  $('stopBtn').disabled = true; $('progressBar').style.width = '0%';
  render();
}
async function playSequence() {
  if (state.queue.length !== 5 || state.loading) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) { info('⚠','Ce navigateur ne prend pas en charge la lecture audio.'); return; }
  // Important pour iPhone : initialiser le son pendant le clic de l’utilisateur.
  const ctx = new AudioCtx();
  const resumePromise = ctx.resume();
  await stopPlayback();
  const session = {ctx,sources:[],timer:null};
  state.session = session; state.loading = true;
  $('stopBtn').disabled = false; render();
  info('⌛','Chargement des cinq sons.');
  try {
    await resumePromise;
    const buffers = [];
    for (const id of state.queue) {
      if (state.session !== session) return;
      const sound = state.byId.get(id);
      const response = await fetch(sound.fichier, {cache:'default'});
      if (!response.ok) throw new Error('Fichier introuvable : ' + sound.fichier + ' (HTTP ' + response.status + ').');
      if (state.session !== session) return;
      const bytes = await response.arrayBuffer();
      if (state.session !== session) return;
      const buffer = await ctx.decodeAudioData(bytes);
      if (!buffer.duration) throw new Error('Le son « ' + sound.nom + ' » est vide.');
      buffers.push(buffer);
      info('⌛ '+buffers.length+' / 5','Chargement des sons.');
    }
    if (state.session !== session) return;
    const start = ctx.currentTime + 0.12;
    let next = start;
    const starts = [];
    buffers.forEach(buffer => {
      starts.push(next);
      const source = ctx.createBufferSource(); source.buffer = buffer;
      const gain = ctx.createGain(); source.connect(gain); gain.connect(ctx.destination);
      const fade = Math.min(.014,buffer.duration/4);
      gain.gain.setValueAtTime(0,next);
      gain.gain.linearRampToValueAtTime(1,next+fade);
      gain.gain.setValueAtTime(1,next+Math.max(fade,buffer.duration-fade));
      gain.gain.linearRampToValueAtTime(0,next+buffer.duration);
      source.start(next); session.sources.push(source);
      next += buffer.duration;
    });
    state.loading = false; render();
    const total = next-start;
    session.timer = setInterval(() => {
      if (state.session !== session) return;
      const elapsed = Math.max(0,ctx.currentTime-start);
      $('progressBar').style.width = (Math.min(1,elapsed/total)*100).toFixed(1)+'%';
      let current = 0;
      while (current < starts.length-1 && ctx.currentTime >= starts[current+1]) current++;
      const position = ctx.currentTime < start ? -1 : current;
      showPlayingPosition(position);
      info(position === -1 ? '⌛' : '♫ '+(current+1)+' / 5','Lecture en cours');
      if (ctx.currentTime >= next) void finishSequence(session);
    },100);
  } catch (error) {
    if (state.session === session) {
      await stopPlayback(); state.loading = false; render();
      info('⚠ 🔊','Lecture impossible : '+error.message);
      msg('Vérifie que tes MP3 sont bien dans le dossier audio/, avec les noms de sons.json.', 'error');
    }
  }
}
async function finishSequence(session) {
  if (state.session !== session) return;
  await stopPlayback(); state.loading = false; render();
  $('progressBar').style.width = '100%';
  info('✓ ♫','Bande-son terminée.');
}
async function init() {
  try {
    const response = await fetch('sons.json',{cache:'no-store'});
    if (!response.ok) throw new Error('Impossible de charger sons.json');
    const sounds = await response.json();
    if (!Array.isArray(sounds) || !sounds.length) throw new Error('Le catalogue est vide.');
    for (const sound of sounds) {
      if (!sound.id || !sound.nom || !sound.fichier || !/^S\d+$/.test(sound.id) || state.byId.has(sound.id)) {
        throw new Error('Une ligne de sons.json est invalide ou en double.');
      }
      state.byId.set(sound.id,sound);
    }
    state.catalog = sounds;
    render(); msg('Prêt : ' + sounds.length + ' sons disponibles. Scanne une carte.');
  } catch (error) {
    msg('Erreur : ' + error.message + '. Utilise l’adresse web du site, pas un fichier local.', 'error');
  }
}
$('scanBtn').addEventListener('click',openCamera);
$('closeScanner').addEventListener('click',closeCamera);
$('playBtn').addEventListener('click',playSequence);
$('stopBtn').addEventListener('click',async()=>{
  await stopPlayback(); state.loading=false; render(); info('■','Lecture arrêtée.');
});
$('clearBtn').addEventListener('click',async()=>{
  await closeCamera(); await stopPlayback(); state.loading=false;
  state.queue=[]; state.lastAdded=null; state.selected=-1; render(); msg('Bande-son effacée.');
});
$('deleteBtn').addEventListener('click',()=>removeSound(state.selected));
$('upBtn').addEventListener('click',()=>moveSound(state.selected,-1));
$('downBtn').addEventListener('click',()=>moveSound(state.selected,1));
init();
