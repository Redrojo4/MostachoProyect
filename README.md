# Waiter Subproject

Subproyecto aislado del flujo de mesero extraido del POS principal.

## Uso

1. Copia `.env.example` a `.env`.
2. Configura tus credenciales externas de Supabase y los datos del mesero.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev`.

## Variables

- `VITE_SUPABASE_URL`: URL de tu proyecto en Supabase.
- `VITE_SUPABASE_ANON_KEY`: llave publica del proyecto.
- `VITE_RESTAURANT_ID`: restaurante al que se debe limitar la app.
- `VITE_WAITER_ID`: identificador del mesero actual.
- `VITE_WAITER_NAME`: nombre del mesero mostrado en pantalla.
- `VITE_WAITER_EMAIL`: email opcional del mesero.

## Alcance

Incluye solo el flujo de mesero:

- tablero de mesas
- vista y edicion de orden
- envio a cocina
- division y cobro de cuenta

No incluye autenticacion, cocina ni gerente.
