import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/* Em `npm run dev`, atende /api/* com os mesmos arquivos da pasta api/ que o Vercel usa */
function apiLocal() {
  return {
    name: "api-local",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res) => {
        const url = new URL(req.url, "http://localhost");
        const nome = url.pathname.replace(/^\/+|\/+$/g, "");
        if (!/^[a-z]+$/.test(nome)) {
          res.statusCode = 404;
          return res.end();
        }
        let corpo = "";
        for await (const parte of req) corpo += parte;
        req.query = Object.fromEntries(url.searchParams);
        req.body = corpo ? JSON.parse(corpo) : {};
        res.status = (codigo) => ((res.statusCode = codigo), res);
        res.json = (obj) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(obj));
        };
        const mod = await server.ssrLoadModule(`/api/${nome}.js`);
        await mod.default(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), "")); // lê .env.local (ex.: SORTEIO_SENHA)
  return { plugins: [react(), apiLocal()] };
});
