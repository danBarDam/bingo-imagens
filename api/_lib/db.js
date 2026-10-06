import { Redis } from "@upstash/redis";

/* Banco compartilhado entre o sorteio e as cartelas.
   No Vercel: Upstash Redis (as variáveis são criadas pela integração do Marketplace).
   No computador (npm run dev) sem essas variáveis: guarda tudo na memória. */
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

function memoria() {
  const m = (globalThis.__bingoMemoria ??= new Map());
  const copia = (v) => (v === undefined ? null : structuredClone(v));
  return {
    async get(k) { return copia(m.get(k)); },
    async set(k, v) { m.set(k, structuredClone(v)); return "OK"; },
    async hget(k, f) { return copia(m.get(k)?.[f]); },
    async hset(k, obj) { m.set(k, { ...(m.get(k) || {}), ...structuredClone(obj) }); return 1; },
    async hgetall(k) {
      const h = m.get(k);
      return h && Object.keys(h).length ? structuredClone(h) : null;
    },
    async hlen(k) { return Object.keys(m.get(k) || {}).length; },
    async del(...ks) { ks.forEach((k) => m.delete(k)); return ks.length; },
  };
}

function semBanco() {
  const erro = () => {
    throw Object.assign(
      new Error("Banco não configurado: conecte o Upstash Redis ao projeto no painel do Vercel (Storage)."),
      { status: 500 }
    );
  };
  return new Proxy({}, { get: () => erro });
}

export const db = url && token ? new Redis({ url, token }) : process.env.VERCEL ? semBanco() : memoria();
