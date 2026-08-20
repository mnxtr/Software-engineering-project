import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`NSU Companion Server running on port ${PORT}`);
});
