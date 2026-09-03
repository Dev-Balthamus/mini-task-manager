import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export const up = (pgm: MigrationBuilder): void => {
  // Si abilita la generazione di UUID interna a PostgreSQL
  pgm.createExtension("uuid-ossp", { ifNotExists: true });

  // Si crea il tipo ENUM per la priorità
  pgm.createType("task_priority", ["low", "medium", "high"]);

  // Si crea la tabella `tasks` nel database
  pgm.createTable("tasks", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    description: {
      type: "varchar(255)",
      notNull: false,
    },
    priority: {
      type: "task_priority",
      notNull: true,
      default: "medium",
    },
    executed: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    /*
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    */
  });
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.dropTable("tasks");
  pgm.dropType("task_priority");
};
