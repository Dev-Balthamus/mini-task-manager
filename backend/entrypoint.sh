#!/bin/sh

# Istruzione che interrompe immediatamente lo script se un comando dovesse fallire
set -e

echo "Inizio della fase di avvio del backend..."

# Passaggio di esecuzione delle migrazioni
echo "Esecuzione delle migrazioni del database..."
npm run m-up

# Passaggio di avvio del server Express.JS
echo "Avvio del server di backend.."
exec "$@"