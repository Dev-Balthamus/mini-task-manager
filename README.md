# Mini Task Manager

**Mini Task Manager** è un progetto di app per la gestione di compiti e/o attività da svolgere.
Allo stadio di sviluppo corrente, l'app permette ad un utente unico di annotare i propri task, salvarli in una lista ri-ordinabile, tracciarne lo stato di esecuzione, cancellarli dalla lista qualora si voglia liberare spazio.

## Caratteristiche principali

- **Creare i task**: L'utente, cliccando su apposito pulsante, apre un form attraverso cui definire le specifiche di un singolo task: titolo (obbligatorio) - descrizione (opzionale) - priorità (obbligatorio). Una volta soddisfatto, può salvare il task, o semplicemente chiudere il form in caso di ripensamento.
- **Ordinare i task**: L'utente può ordinare i task in base alla priorità definita (bassa - media - alta) o allo stato di esecuzione (eseguito o no). Task con priorità e/o stato di esecuzione uguali tra loro, sono ordinati da quello creato per primo a quello creato per ultimo.
- **Modificare o eliminare i task**: L'utente può modificare o eliminare ogni singolo task, cliccando sull'apposito pulsante posto nello spazio del task nella lista. Cliccando per modificare un task, si riapre il form per definirne le specifiche: salvarlo senza avere apportato modifiche lascia il task con le specifiche di prima della modifica. Cliccando per eliminare un task, si apre un avviso in cui si chiede conferma o no prima di procedere all'effettiva eliminazione del task dall'elenco di quelli in memoria.
- **Salvataggio task**: Il salvataggio dei task avviene in un file JSON, ciascuno come oggetto entro un unico array per l'intero file.

## Tecnologie utilizzate

- **Frontend**: TypeScript, React, Vite, HTML, CSS;
- **Backend**: Node, Express.

## Come avviare il progetto

Il progetto dell'app **Mini Task Manager** consta di un repository unico, al cui primo livello di articolazione si distinguono una cartella che contiene tutto il Frontend e una che contiene tutto il Backend.
Chiaramente Frontend e Backend vanno avviati e tenuti attivi sempre insieme affinché il progetto funzioni.
Pertanto, tanto che si lavori in un IDE tanto che no, si richiede di aprire due terminali:

- uno che punta a _"./mini-task-manager/frontend/"_, sul quale eseguire il comando **npm run dev**
- uno che punta a _"./mini-task-manager/backend/"_, sul quale eseguire il comando **npm start**
  Una volta che sia il Frontend sia il Backend saranno avviati, sarà possibile utilizzare l'applicazione da un qualsiasi browser che punti a _http://localhost:5173/_.
  (N.B.: "5173" è la porta che Vite imposta di default per far girare le applicazioni React: durante lo sviluppo si è deciso di lasciare quella. Cambiare la porta è possibile, andando a modificare il file "vite.config".)

## ~ Breve nota sul percorso dello sviluppo ~

Essendo il primo progetto con questo stack tecnologico di cui mi sono occupato dopo tanti mesi che mi stavo dedicando a tutt'altro, l'intero percorso fin qui è stato rallentato e complicato dal fatto che ogni singolo avanzamento nello sviluppo è stato preceduto da un tempo per ravvivare le conoscenze e competenze acquisite.
Il passaggio più difficile da affrontare è stato quello della corretta strutturazione del Context con cui i dati dei task possono essere acceduti e manipolati globalmente per tutti i componenti dell'applicativo. Un gradino subito sotto, ho avuto le maggiori difficoltà nella gestione della logica dietro il form, che quando serve alla creazione del task deve funzionare in un dato modo e quando invece serve alla modifica del task deve funzionare in un modo differente. Tant'è vero che ho preso la decisione di non affrontare lo spostamento della maggior parte della logica del form sul Context, e dunque di non far sì che il componente TaskForm fosse soltanto presentazionale: una scelta che, una volta acquisite maggiori padronanza e scioltezza nello sviluppo con questo stack, non ripeterei.

## ~ Domande aperte, e loro risposte ~

1. Quando si crea un task, il Frontend deve aspettare la risposta del Backend prima di mostrarlo? Pro e contro.
   La risposta è sì. La ragione è evitare che possa crearsi in interfaccia un task non salvato correttamente in database, rischiando un disallineamento tra Frontend e Backend, ed evitando di impiegare il "localStorage" complicando la struttura dei flussi di dati. Questi sono i pro di una scelta del genere. I contro che si potrebbero avere starebbero nell'ambito dell'esperienza utente, da un lato in fatto di velocità di aggiornamento dei dati in interfaccia, da un altro lato in fatto di difficoltà/impossibilità di lavoro qualora si riscontrassero problematiche di connessione al server su cui i dati vengono allocati e manipolati.
2. Dove viene generato l'ID di un nuovo task: Frontend o Backend? Perché?
   L'ID di un nuovo task viene generato lato Frontend, in quanto si è scelto di usare in quanto tale un timestamp generato al momento di creazione del task, inteso come il momento in cui tutti i dati delle specifiche del task sono stati definiti dall'utente nel compilare il form relativo e presi insieme per l'invio al Backend a fini di salvataggio.
3. Cosa succede se due utenti creano un task contemporaneamente?
   Questa domanda è quella che mi mette più in difficoltà, in quanto per come l'app è strutturata adesso non esiste una reale possibilità di farne un utilizzo multi-utente con condivisione di database. Pertanto potrei solo esporre un ragionamento tutto teorico secondo cui, nell'eventualità di un utilizzo multi-utente con condivisione di database, potrebbero sorgere rischi di salvataggio e gestione corretti di entrambi i task, se l'ID fosse costituito solo dal timestamp. Per risolvere la potenziale criticità vedrei come unica strada quella di stabilire che l'ID sia una stringa composta in modo più complesso, interpolando più dati.
4. E` stato duplicato codice tra form di creazione e di modifica? Come si potrebbe evitare?
   Dunque, in fatto di struttura presentazionale dei form di creazione e modifica di task, non c'è stata duplicazione di codice in quanto in questo progetto entrambe le varianti del form sono gestite in un unico componente React le cui parti cambiano grazie a tecniche di rendering condizionale a seconda di quale pulsante in quale punto dell'applicativo richiama il form. In fatto di logica dietro ai form, se è vero che i due flussi di gestione e manipolazione dei dati dei task sono decisamente simili tra creazione e modifica di un task, l'unico modo per evitare anche solo la possibilità di scrivere codice duplicato sarebbe ricorrere alle strutture condizionali, dimezzando il numero di funzioni necessarie a gestire le due differenti logiche.
5. Cosa viene messo in un "useEffect" e cosa no?
   Considerato che si può impiegare un "useEffect" nei casi di fetch di dati, definizione di listener globali, gestione di timer e intervalli e poco altro ancora, in questo progetto se ne è limitato l'uso alla chiamata dell'API di tipo _get-all_ per il recupero dei dati dell'intero JSON di task.
