# Osservatorio follower di @TheLouisMahdi

Pannello integrato nel portfolio: [Apri il monitor](https://thelouismahdi.github.io/TheLouisMahdi/follower-monitor/).

## Funzioni

- Panoramica: follower, following, relazioni reciproche e perdite osservate.
- Ricerca e filtri per identificare i profili da valutare manualmente.
- Cronologia dei nuovi follower e di quelli persi, con un massimo di 80 eventi.
- Elenco dei profili protetti, salvato esclusivamente nel browser.
- Collegamenti ai profili GitHub per decidere autonomamente se seguire o smettere di seguire.

Il sito **non** dispone di token di accesso e **non** esegue follow o unfollow automatici.

## Monitoraggio

Il workflow `.github/workflows/monitor-follower.yml` controlla le liste pubbliche alle **17 di ogni ora (UTC)** tramite l'API ufficiale GitHub. Le esecuzioni possono subire ritardi. Il primo controllo crea soltanto la situazione iniziale, senza inventare eventi passati.

I dati vengono pubblicati in `follower-monitor/data.json` **solo quando cambiano**. Il pannello legge il file direttamente dall'API del repository, così le variazioni diventano visibili senza attendere un nuovo deploy GitHub Pages.

`updated_at` indica l'ultima variazione della fotografia salvata, non l'ultimo controllo eseguito. Il numero delle perdite è il numero di eventi conservati, non un totale storico assoluto.

## Privacy e sicurezza

Il progetto è pubblico: i follower, i seguiti e la cronologia salvata sono visibili nel repository. La lista protetta non viene inviata a GitHub: rimane nel localStorage del dispositivo e non si sincronizza tra browser.

L'API viene usata soltanto per leggere le relazioni pubbliche. Non sono necessari token personali e non vengono utilizzati permessi GitHub per modificare i follower.

Autore: [@TheLouisMahdi](https://github.com/TheLouisMahdi).
