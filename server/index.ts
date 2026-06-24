import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 8787);

createApp().listen(PORT, () => {
  console.log(`[api] Bundle API listening on http://localhost:${PORT}/api`);
});
