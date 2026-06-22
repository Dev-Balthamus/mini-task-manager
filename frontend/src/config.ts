/* File per le configurazioni centrali dell'applicazione.
   In questo progetto, controlla la presenza effettiva e corretta delle variabili d'ambiente definite. */

if (!import.meta.env.VITE_API_URL) {
  console.error(
    "ERRORE CRITICO! \n La variabile d'ambiente VITE_API_URL è mancante. \n Controlla di avere tra i files del progetto il file .env, e che sia scritto correttamente.",
  );

  throw new Error("Verifica sulle variabili d'ambiente: FALLITA. App non avviata!");
}

console.log("Verifica sulle variabili d'ambiente: RIUSCITA!");
