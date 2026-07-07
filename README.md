# Mini Task Manager v. 1.1.0

**Mini Task Manager** è un progetto di app per la gestione di compiti e/o attività da svolgere.
Allo stadio di sviluppo corrente, l'app permette ad un utente unico di annotare i propri task, salvarli in una lista ri-ordinabile, tracciarne lo stato di esecuzione, cancellarli dalla lista qualora si voglia liberare spazio.

<br>

## Caratteristiche principali

- **Creare i task**: L'utente, cliccando su apposito pulsante, apre un form attraverso cui definire le specifiche di un singolo task: titolo (obbligatorio) - descrizione (opzionale) - priorità (obbligatorio). Una volta soddisfatto, può salvare il task, o semplicemente chiudere il form in caso di ripensamento.
- **Ordinare i task**: L'utente può ordinare i task in base alla priorità definita (bassa - media - alta) o allo stato di esecuzione (eseguito o no). Task con priorità e/o stato di esecuzione uguali tra loro, sono ordinati da quello creato per primo a quello creato per ultimo.
- **Modificare o eliminare i task**: L'utente può modificare o eliminare ogni singolo task, cliccando sull'apposito pulsante posto nello spazio del task nella lista. Cliccando per modificare un task, si riapre il form per definirne le specifiche: salvarlo senza avere apportato modifiche lascia il task con le specifiche di prima della modifica. Cliccando per eliminare un task, si apre un avviso in cui si chiede conferma o no prima di procedere all'effettiva eliminazione del task dall'elenco di quelli in memoria.
- **Salvataggio task**: Il salvataggio dei task avviene in un file JSON, ciascuno come oggetto entro un unico array per l'intero file.

<br>

## Tecnologie utilizzate

- Frontend: TypeScript, React, Vite, HTML, CSS;
- Backend: Node, Express.
- DevOps: Docker.

<br>

## Come configurare e avviare il progetto

Il progetto dell'app Mini Task Manager consta di un repository unico, al cui primo livello di articolazione si distinguono una cartella che contiene tutto il Frontend e una che contiene tutto il Backend.
Tutte le volte che il progetto sia clonato ex novo su macchina locale, vi sono delle azioni preliminari che vanno compiute.

La prima riguarda sia il Frontend sia il Backend, ed è: l'installazione delle dipendenze del progetto. Essendo diverse tra le due parti del progetto, il comando da terminale specifico per questo scopo, ossia npm install, va eseguito due volte:

- una quando il terminale punta a _"./mini-task-manager/frontend/"_, per installare le dipendenze del Frontend
- una quando il terminale punta a _"./mini-task-manager/backend/"_, per installare le dipendenze del Backend

La seconda riguarda solo il Frontend, perché in esso l'URL principale delle API del progetto è codificato come variabile d'ambiente. Pertanto, una volta clonato ex novo il progetto, si deve:

- nella directory _"./mini-task-manager/frontend/"_, duplicare il file **.env.example** e rinominare la copia in _.env_;
- aprire il nuovo file **.env** per rimuovere il commento e aggiornare i placeholders nel valore della variabile d'ambiente con quelli effettivi configurati sulla macchina in uso e la copia del progetto in esecuzione.

La terza è dovuta al fatto che l'intero progetto si presenta Dockerizzato (cioè vede l'implementazione di Docker).
Si fa dunque presente ora che, al fine di avviare il progetto, è necessario avere almeno il Docker Engine installato sulla macchina in uso.
Verificata tale pre-condizione, si apre un terminale che punta a _"./mini-task-manager/"_ sul quale eseguire il comando docker compose up -d --build.
Grazie a questo comando, Docker provvederà a:

- costruire sulla macchina le immagini dei due container, uno per il Frontend e uno per il Backend, dell'applicazione;
- costruire i container ed eventuali volumi ad essi collegati, oltre che ad aprire le porte definite per collegarli in rete;
- avviare i container in background.

Per utilizzare l'app di progetto, bisogna che una scheda di un browser punti all'indirizzo su cui risponde il Frontend del Mini Task Manager; ossia: **http://localhost:5173**.

Da questo momento in avanti, tutta la gestione delle sessioni dell'app e dei suoi container può anche essere eseguita via client Docker Desktop, se installato sulla macchina dalla quale si sta lavorando.
Per una gestione delle sessioni e dei container tutta da terminale, si rimanda alla documentazione ufficiale di Docker CLI: **https://docs.docker.com/reference/cli/docker/**.

<br>

## ~ Breve nota sul percorso dello sviluppo - v. 1.0.0 ~

Essendo il primo progetto con questo stack tecnologico di cui mi sono occupato dopo tanti mesi che mi stavo dedicando a tutt'altro, l'intero percorso fin qui è stato rallentato e complicato dal fatto che ogni singolo avanzamento nello sviluppo è stato preceduto da un tempo per ravvivare le conoscenze e competenze acquisite.
Il passaggio più difficile da affrontare è stato quello della corretta strutturazione del Context con cui i dati dei task possono essere acceduti e manipolati globalmente per tutti i componenti dell'applicativo. Un gradino subito sotto, ho avuto le maggiori difficoltà nella gestione della logica dietro il form, che quando serve alla creazione del task deve funzionare in un dato modo e quando invece serve alla modifica del task deve funzionare in un modo differente. Tant'è vero che ho preso la decisione di non affrontare lo spostamento della maggior parte della logica del form sul Context, e dunque di non far sì che il componente TaskForm fosse soltanto presentazionale: una scelta che, una volta acquisite maggiori padronanza e scioltezza nello sviluppo con questo stack, non ripeterei.

<br>

## ~ Domande aperte, e loro risposte v. 1.0.0 ~

1. Quando si crea un task, il Frontend deve aspettare la risposta del Backend prima di mostrarlo? Pro e contro.<br>
   La risposta è sì. La ragione è evitare che possa crearsi in interfaccia un task non salvato correttamente in database, rischiando un disallineamento tra Frontend e Backend, ed evitando di impiegare il "localStorage" complicando la struttura dei flussi di dati. Questi sono i pro di una scelta del genere. I contro che si potrebbero avere starebbero nell'ambito dell'esperienza utente, da un lato in fatto di velocità di aggiornamento dei dati in interfaccia, da un altro lato in fatto di difficoltà/impossibilità di lavoro qualora si riscontrassero problematiche di connessione al server su cui i dati vengono allocati e manipolati.
2. Dove viene generato l'ID di un nuovo task: Frontend o Backend? Perché?<br>
   L'ID di un nuovo task viene generato lato Frontend, in quanto si è scelto di usare in quanto tale un timestamp generato al momento di creazione del task, inteso come il momento in cui tutti i dati delle specifiche del task sono stati definiti dall'utente nel compilare il form relativo e presi insieme per l'invio al Backend a fini di salvataggio.
3. Cosa succede se due utenti creano un task contemporaneamente?<br>
   Questa domanda è quella che mi mette più in difficoltà, in quanto per come l'app è strutturata adesso non esiste una reale possibilità di farne un utilizzo multi-utente con condivisione di database. Pertanto potrei solo esporre un ragionamento tutto teorico secondo cui, nell'eventualità di un utilizzo multi-utente con condivisione di database, potrebbero sorgere rischi di salvataggio e gestione corretti di entrambi i task, se l'ID fosse costituito solo dal timestamp. Per risolvere la potenziale criticità vedrei come unica strada quella di stabilire che l'ID sia una stringa composta in modo più complesso, interpolando più dati.
4. E` stato duplicato codice tra form di creazione e di modifica? Come si potrebbe evitare?<br>
   Dunque, in fatto di struttura presentazionale dei form di creazione e modifica di task, non c'è stata duplicazione di codice in quanto in questo progetto entrambe le varianti del form sono gestite in un unico componente React le cui parti cambiano grazie a tecniche di rendering condizionale a seconda di quale pulsante in quale punto dell'applicativo richiama il form. In fatto di logica dietro ai form, se è vero che i due flussi di gestione e manipolazione dei dati dei task sono decisamente simili tra creazione e modifica di un task, l'unico modo per evitare anche solo la possibilità di scrivere codice duplicato sarebbe ricorrere alle strutture condizionali, dimezzando il numero di funzioni necessarie a gestire le due differenti logiche.
5. Cosa viene messo in un "useEffect" e cosa no?<br>
   Considerato che si può impiegare un "useEffect" nei casi di fetch di dati, definizione di listener globali, gestione di timer e intervalli e poco altro ancora, in questo progetto se ne è limitato l'uso alla chiamata dell'API di tipo _get-all_ per il recupero dei dati dell'intero JSON di task.

<br>

## ~ Altre domande aperte, e loro risposte - v.1.1.0 ~

6. Se due menù devono mostrare scelte diverse e indipendenti, possono condividere lo stesso stato?<br>
   La risposta, in effetti, è no: associare due menù alla stessa variabile di stato in linea di massima non garantisce il funzionamento indipendente dell'uno rispetto all'altro. Ragione per cui, con questa prima fase di aggiornamento e fixing, tra le prime modifiche su cui ho lavorato c'è stata proprio la creazione di due stati distinti per i due diversi filtri della lista dei task.
7. Dove conviene generare l'ID di un task, sul client o sul server? Fatto col `Date.now()` sul client, cosa succede se due task nascono nello stesso millisecondo?<br>
   Allora, in effetti se si stabilisce che l'ID dei task sia generato sul client, si può verificare che due task vengano generati nello stesso millisecondo, e quindi con un ID identico tra loro. Ragione per cui conviene che l'ID di un task sia generato sul server, ed è stata lavorata una modifica di questo genere.
8. Come si dovrebbe testare l'endpoint di creazione senza aprire il browser?<br>
   Per testare gli endpoint di un'app, e quindi nel nostro caso quello di creazione di un task, senza aprire un browser, si dovrebbe ricorrere a specifici software per il testing di API, qual'è anche Postman. Va però considerato il fatto che, nel caso nella struttura dell'app sia definito che l'ID come timestamp venga generato lato client, per il testing dell'endpoint di creazione si dovrebbe fornire un mock ID precedentemente generato fuori dal flusso di lavoro dell'app: cosa che porta un ulteriore punto a favore dello spostamento della generazione del timestamp per ID lato server.

<br>

## ~ Altre domande aperte, e loro risposte - v.1.2.0 ~

9.  Una volta integrato Bootstrap nel progetto, quanto codice TSX e CSS scritto da zero da parte dello sviluppatore può essere eliminato? Quali file CSS diventano inutili e possono essere cancellati?<br>
    Integrare Bootstrap in questo progetto ha consentito di tagliare la code base di parecchie linee di codice, soprattutto sul componente "_TaskForm_" e il CSS ad esso relativo, rendendo più leggibile la struttura del componente e la sua stilizzazione più armoniosa. Non è avvenuto, invece, di cancellare interi file CSS poiché procedere in tal senso e dunque accettare talune stilizzazioni di default di Bootstrap andava a produrre disarmonie nell'estetica dell'app, e si è voluto preservare l'originalità dell'estetica definita dallo sviluppatore, ricorrendo pertanto a tutti i file CSS già creati come mezzo per intervenire sul CSS di Bootstrap per modificarlo e armonizzarlo all'occorrenza. Fare questo tipo di lavoro ha prodotto come ulteriore conseguenza il refactoring di porzioni di CSS scritto da zero a fini di migliorare o correggere dettagli estetici.
10. In Docker, qual è la differenza tra "_immagine_" e "_container_"?<br>
    In Docker, una **immagine** è un template per creare un dato container; in sostanza è un file di tipo "_Dockerfile_" con caratteristica di essere "read only", che consta di un dato numero di istruzioni ordinate e sequenziate in layers, tra cui vi può essere l'import di altre immagini già esistenti; le immagini vengono salvate in registri, che sono o pubblici o privati o corporate, per accedere ai quali talvolta serve autenticarsi con credenziali del proprio account Docker.
    Invece, un **container** è una istanza di una immagine Docker, isolata dalla macchina su cui esiste ma anche dagli altri container eventualmente esistenti su di essa, che si può connettere a una o più reti mediante le porte che abbia definite, e cui può essere abbinata (in termini tecnici "montata") una allocazione di memoria dedicata nella quale far persistere alcuni dati o configurazioni anche nel caso di corruzione o eliminazione del container stesso.
11. In un progetto Dockerizzato che abbia un frontend con React, quando si fissano le variabili d'ambiente Vite: nella fase di build o di esecuzione dell'app?<br>
    In un progetto Dockerizzato il cui frontend è scritto in React con Vite, se vi sono variabili d'ambiente di Vite esse vengono fissate durante la fase di build; per questo motivo, infatti, quando si scrive il file compose del progetto, nella sezione del servizio definito per il frontend, c'è la possibilità di dedicare una sezione apposita all'environment.
