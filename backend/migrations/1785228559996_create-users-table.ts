import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export const up = (pgm: MigrationBuilder): void => {
  pgm.createExtension("uuid-ossp", { ifNotExists: true });

  // Si crea la tabella `users` nel database
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    email: {
      type: "varchar(255)",
      notNull: true,
      unique: true, // Requisito: email unica
    },
    password: {
      type: "varchar(255)", // O "text", ideale per memorizzare l'hash (bcrypt/argon2)
      notNull: true,
    },
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
  });
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.dropTable("users");
};
