/* File per le configurazioni centrali dell'applicazione.
   In questo progetto, controlla la presenza effettiva e corretta delle variabili d'ambiente definite. */

if (!import.meta.env.VITE_TASKS_URL || !import.meta.env.VITE_AUTH_URL) {
  console.error(
    "ERRORE CRITICO! \n Le variabili d'ambiente VITE_TASKS_URL e VITE_AUTH_URL sono mancanti. \n Controlla di avere tra i files del progetto il file .env, e che sia scritto correttamente.",
  );

  throw new Error("Verifica sulle variabili d'ambiente: FALLITA. App non avviata!");
}

console.log("Verifica sulle variabili d'ambiente: RIUSCITA!");
