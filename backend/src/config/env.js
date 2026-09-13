import dotenv from 'dotenv';

// Load the backend environment file reliably even when npm is started from the project root.
dotenv.config({ path: new URL('../../.env', import.meta.url) });
