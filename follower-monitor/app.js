"use strict";

const ACCOUNT = "TheLouisMahdi";
const API_DATA = "https://api.github.com/repos/TheLouisMahdi/TheLouisMahdi/contents/follower-monitor/data.json?ref=main";
const STORAGE_KEY = "thelouismahdi-protetti-v1";
const validLogin = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const byId = id => document.getElementById(id);
let data = null;
let filtro = "tutti";
let protetti;

try {
  const salvati = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  protetti = new Set(Array.isArray(salvati) ? salvati.filter(v => typeof v === "string" && validLogin.test(v)).map(v => v.toLowerCase()) : []);
} catch {
  protetti = new Set();
}

function salvaProtetti() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...protetti].sort()));
  disegnaProtetti();
  disegnaPersone();
}

function profilo(login) {
  return "https://github.com/" + encodeURIComponent(login);
}

function vuoto(testo) {
  const p = document.createElement("p");
  p.className = "empty";
  p.textContent = testo;
  return p;
}

function dataLeggibile(iso) {
  if (!iso) return "In attesa del primo controllo";
  return new Date(iso).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
}

function identita(utente) {
  const img = document.createElement("img");
  img.className = "avatar";
  img.loading = "lazy";
  img.alt = "";
  img.src = "https://avatars.githubusercontent.com/u/" + utente.id + "?v=4";
  return img;
}

function disegnaProtetti() {
  const elenco = byId("protectedList");
  elenco.replaceChildren();
  if (!protetti.size) {
    elenco.append(vuoto("Nessun profilo protetto su questo dispositivo."));
    return;
  }
  for (const login of [...protetti].sort()) {
    const tag = document.createElement("span");
    tag.className = "protected-tag";
    tag.append(document.createTextNode("◇ @" + login));
    const rimuovi = document.createElement("button");
    rimuovi.type = "button";
    rimuovi.textContent = "×";
    rimuovi.setAttribute("aria-label", "Rimuovi " + login + " dai protetti");
    rimuovi.addEventListener("click", () => {
      protetti.delete(login);
      salvaProtetti();
    });
    tag.append(rimuovi);
    elenco.append(tag);
  }
}

function disegnaPersone() {
  const lista = byId("peopleList");
  lista.replaceChildren();
  if (!data) {
    lista.append(vuoto("In attesa dei dati."));
    return;
  }
  const followers = new Set(data.followers.map(u => u.id));
  const following = new Set(data.following.map(u => u.id));
  const utenti = new Map([...data.followers, ...data.following].map(u => [u.id, u]));
  const ricerca = byId("search").value.trim().toLowerCase();
  const visibili = [...utenti.values()].filter(u => {
    const protetto = protetti.has(u.login.toLowerCase());
    if (!u.login.toLowerCase().includes(ricerca)) return false;
    if (filtro === "follower") return followers.has(u.id);
    if (filtro === "seguiti") return following.has(u.id);
    if (filtro === "da-ricambiare") return followers.has(u.id) && !following.has(u.id);
    if (filtro === "non-ricambiati") return following.has(u.id) && !followers.has(u.id);
    if (filtro === "protetti") return protetto;
    return true;
  }).sort((a, b) => a.login.localeCompare(b.login));
  byId("resultCount").textContent = visibili.length + " profili";

  if (!visibili.length) {
    lista.append(vuoto("Nessun profilo corrisponde alla ricerca."));
    return;
  }
  const frammento = document.createDocumentFragment();
  for (const utente of visibili) {
    const riga = document.createElement("article");
    riga.className = "person";
    riga.append(identita(utente));
    const info = document.createElement("div");
    info.className = "person-info";
    const nome = document.createElement("div");
    nome.className = "person-name";
    nome.textContent = "@" + utente.login;
    const stato = document.createElement("div");
    stato.className = "person-meta";
    stato.textContent = followers.has(utente.id) && following.has(utente.id)
      ? "Relazione reciproca"
      : followers.has(utente.id) ? "Ti segue · non ancora ricambiato" : "Lo segui · non ricambia";
    info.append(nome, stato);
    riga.append(info);
    const azioni = document.createElement("div");
    azioni.className = "person-actions";
    const proteggi = document.createElement("button");
    proteggi.type = "button";
    proteggi.className = "mini-button" + (protetti.has(utente.login.toLowerCase()) ? " protected" : "");
    proteggi.textContent = protetti.has(utente.login.toLowerCase()) ? "◇ Protetto" : "◇ Proteggi";
    proteggi.addEventListener("click", () => {
      const login = utente.login.toLowerCase();
      if (protetti.has(login)) protetti.delete(login);
      else protetti.add(login);
      salvaProtetti();
    });
    const link = document.createElement("a");
    link.href = profilo(utente.login);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "mini-button";
    link.textContent = "Apri ↗";
    link.setAttribute("aria-label", "Apri il profilo di " + utente.login);
    azioni.append(proteggi, link);
    riga.append(azioni);
    frammento.append(riga);
  }
  lista.append(frammento);
}

function disegnaEventi() {
  const lista = byId("eventList");
  lista.replaceChildren();
  if (!data || !data.events.length) {
    lista.append(vuoto("Nessuna variazione registrata. Il primo controllo crea solo il punto di partenza."));
    return;
  }
  for (const evento of data.events.slice(0, 12)) {
    const riga = document.createElement("div");
    riga.className = "event";
    const icona = document.createElement("span");
    icona.className = "event-icon" + (evento.kind === "perso" ? " lost" : "");
    icona.textContent = evento.kind === "perso" ? "↘" : "↗";
    const corpo = document.createElement("div");
    corpo.className = "event-body";
    const link = document.createElement("a");
    link.href = profilo(evento.login);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "@" + evento.login;
    const stato = document.createElement("small");
    stato.textContent = evento.kind === "perso" ? "Ha smesso di seguirti" : "Ha iniziato a seguirti";
    corpo.append(link, stato);
    const quando = document.createElement("time");
    quando.className = "event-date";
    quando.textContent = dataLeggibile(evento.at);
    riga.append(icona, corpo, quando);
    lista.append(riga);
  }
}

function disegnaRiepilogo() {
  const followers = new Set(data.followers.map(u => u.id));
  const seguiti = new Set(data.following.map(u => u.id));
  byId("countFollowers").textContent = followers.size.toLocaleString("it-IT");
  byId("countFollowing").textContent = seguiti.size.toLocaleString("it-IT");
  byId("countMutual").textContent = [...followers].filter(id => seguiti.has(id)).length.toLocaleString("it-IT");
  byId("countLost").textContent = data.events.filter(e => e.kind === "perso").length.toLocaleString("it-IT");
  byId("updatedAt").textContent = "Ultima variazione: " + dataLeggibile(data.updated_at);
}

async function aggiorna() {
  const avviso = byId("notice");
  avviso.className = "notice";
  avviso.textContent = "Lettura della fotografia salvata su GitHub...";
  byId("refreshBtn").disabled = true;
  try {
    const risposta = await fetch(API_DATA + "&t=" + Date.now(), {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });
    if (!risposta.ok) throw new Error("GitHub API: HTTP " + risposta.status);
    const file = await risposta.json();
    const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, "")), c => c.charCodeAt(0));
    const risultato = JSON.parse(new TextDecoder().decode(bytes));
    if (risultato.version !== 1 || !Array.isArray(risultato.followers)
      || !Array.isArray(risultato.following) || !Array.isArray(risultato.events)) {
      throw new Error("Formato dell'archivio non valido.");
    }
    data = risultato;
    disegnaRiepilogo();
    disegnaPersone();
    disegnaEventi();
    avviso.className = "notice success";
    avviso.textContent = data.updated_at
      ? "Archivio sincronizzato. Controllo automatico previsto ogni ora, al minuto 17 UTC."
      : "Il primo controllo orario non è ancora stato completato.";
  } catch (errore) {
    avviso.className = "notice error";
    avviso.textContent = "Impossibile leggere i dati: " + errore.message;
  } finally {
    byId("refreshBtn").disabled = false;
  }
}

document.querySelectorAll("[data-filter]").forEach(bottone => {
  bottone.addEventListener("click", () => {
    filtro = bottone.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(b => b.classList.toggle("selected", b === bottone));
    disegnaPersone();
  });
});
byId("search").addEventListener("input", disegnaPersone);
byId("refreshBtn").addEventListener("click", aggiorna);
byId("protectedForm").addEventListener("submit", evento => {
  evento.preventDefault();
  const input = byId("protectedInput");
  const login = input.value.trim().replace(/^@/, "").toLowerCase();
  if (!validLogin.test(login)) {
    input.setCustomValidity("Inserisci un nome utente GitHub valido.");
    input.reportValidity();
    return;
  }
  input.setCustomValidity("");
  protetti.add(login);
  salvaProtetti();
  input.value = "";
});
byId("protectedInput").addEventListener("input", evento => evento.target.setCustomValidity(""));
disegnaProtetti();
aggiorna();
