import { createRoot } from "react-dom/client";

console.log('[main] Loading App module...');

let App: any;
try {
  const mod = await import("./App.tsx");
  App = mod.default;
  console.log('[main] App module loaded successfully');
} catch (err) {
  console.error('[main] Failed to load App module:', err);
  document.getElementById("root")!.innerHTML = `<pre style="color:red;padding:2rem;">App failed to load:\n${err}</pre>`;
}

import "./index.css";

if (App) {
  createRoot(document.getElementById("root")!).render(<App />);
}
