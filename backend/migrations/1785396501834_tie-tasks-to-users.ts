import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export const up = (pgm: MigrationBuilder): void => {
  // Si aggiunge la colonna user_id senza vincolo NOT NULL iniziale
  pgm.addColumn("tasks", {
    user_id: {
      type: "uuid",
      references: "users(id)",
      onDelete: "CASCADE",
    },
  });

  // Si popolano i mock task esistenti che non hanno uno user_id
  pgm.sql(`
    DO $$
    DECLARE
      fallback_user_id UUID;
    BEGIN
      -- Verifica se ci sono task esistenti privi di user_id
      IF EXISTS (SELECT 1 FROM tasks WHERE user_id IS NULL) THEN
        
        -- Cerca o crea un utente fallback per i dati legacy/mock
        SELECT id INTO fallback_user_id 
        FROM users 
        WHERE email = 'system.fallback@example.com';

        IF fallback_user_id IS NULL THEN
          INSERT INTO users (email, password)
          VALUES ('system.fallback@example.com', 'FallbackPasswordSystem123!')
          RETURNING id INTO fallback_user_id;
        END IF;

        -- Assegna l'ID dell'utente fallback a tutti i task orfani
        UPDATE tasks 
        SET user_id = fallback_user_id 
        WHERE user_id IS NULL;

      END IF;
    END $$;
  `);

  // Nel momento in cui non ci sono più righe con user_id NULL, applichiamo il vincolo NOT NULL
  pgm.alterColumn("tasks", "user_id", {
    notNull: true,
  });

  // Si crea un indice per ottimizzare le query filtrate per utente
  pgm.createIndex("tasks", "user_id");
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.dropIndex("tasks", "user_id");
  pgm.dropColumn("tasks", "user_id");

  // Si rimuove l'utente fallback se creato durante la migrazione
  pgm.sql(`DELETE FROM users WHERE email = 'system.fallback@example.com';`);
};
