"""Monitor pubblico dei follower di @TheLouisMahdi, senza operazioni di follow."""

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ACCOUNT = "TheLouisMahdi"
DATA = Path(__file__).resolve().parents[1] / "follower-monitor" / "data.json"
API = "https://api.github.com"


def elenco(tipo):
    utenti = {}
    pagina = 1
    while True:
        url = f"{API}/users/{ACCOUNT}/{tipo}?" + urlencode({"per_page": 100, "page": pagina})
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2026-03-10",
            "User-Agent": "thelouismahdi-follower-monitor",
        }
        if os.getenv("GITHUB_TOKEN"):
            headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
        with urlopen(Request(url, headers=headers), timeout=25) as risposta:
            risultati = json.load(risposta)
        if not isinstance(risultati, list):
            raise ValueError("Risposta GitHub non valida")
        for utente in risultati:
            identificativo, nome = utente.get("id"), utente.get("login")
            if type(identificativo) is not int or identificativo <= 0 or not isinstance(nome, str):
                raise ValueError("Profilo GitHub non valido")
            utenti[identificativo] = nome
        if len(risultati) < 100:
            return [{"id": identificativo, "login": nome} for identificativo, nome in
                    sorted(utenti.items(), key=lambda item: item[1].lower())]
        pagina += 1


def genera_stato(precedente, follower, seguiti, ora):
    iniziale = precedente is None or precedente.get("updated_at") is None
    precedenti = {u["id"]: u["login"] for u in (precedente or {}).get("followers", [])}
    attuali = {u["id"]: u["login"] for u in follower}
    eventi = list((precedente or {}).get("events", []))

    if not iniziale:
        nuovi = [{"kind": "nuovo", "id": i, "login": n, "at": ora}
                 for i, n in attuali.items() if i not in precedenti]
        persi = [{"kind": "perso", "id": i, "login": n, "at": ora}
                 for i, n in precedenti.items() if i not in attuali]
        eventi = sorted(nuovi + persi, key=lambda e: e["login"].lower()) + eventi

    cambiato = (iniziale or follower != precedente["followers"]
                or seguiti != precedente["following"])
    return {
        "version": 1,
        "updated_at": ora if cambiato else precedente["updated_at"],
        "followers": follower,
        "following": seguiti,
        "events": eventi[:80],
    }


def main():
    precedente = None
    if DATA.exists():
        precedente = json.loads(DATA.read_text(encoding="utf-8"))
        if (not isinstance(precedente, dict) or precedente.get("version") != 1
                or not isinstance(precedente.get("followers"), list)
                or not isinstance(precedente.get("following"), list)
                or not isinstance(precedente.get("events"), list)):
            raise ValueError("Archivio locale non valido: nessun dato sovrascritto")

    follower = elenco("followers")
    seguiti = elenco("following")
    ora = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    stato = genera_stato(precedente, follower, seguiti, ora)
    if stato != precedente:
        DATA.write_text(json.dumps(stato, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Archivio aggiornato.")
    else:
        print("Nessuna variazione dall'ultimo archivio.")
    print(f"Follower: {len(follower)} | Seguiti: {len(seguiti)} | "
          f"Eventi conservati: {len(stato['events'])}")


if __name__ == "__main__":
    main()
