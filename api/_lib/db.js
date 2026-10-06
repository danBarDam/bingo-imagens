import { Redis } from "@upstash/redis";

/* Banco compartilhado entre o sorteio e as cartelas.
   No Vercel: Upstash Redis (as variáveis são criadas pela integração do Marketplace).
   No computador (npm run dev) sem essas variáveis: guarda tudo na memória. */
// A integração pode criar as variáveis com outro prefixo (ex.: STORAGE_KV_REST_API_URL), então procura pelo final do nome
const env = process.env;
const achar = (...finais) => {
  for (const fim of finais) {
    const nome = Object.keys(env).find((k) => k === fim || k.endsWith("_" + fim));
    if (nome && env[nome]) return env[nome];
  }
};
const url = achar("UPSTASH_REDIS_REST_URL", "KV_REST_API_URL");
const token = achar("UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN");

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
  // Mostra só os NOMES das variáveis parecidas (nunca os valores), para ajudar a diagnosticar
  const parecidas = Object.keys(env).filter((k) => /REDIS|KV_|UPSTASH/.test(k));
  const dica = parecidas.length
    ? ` Variáveis encontradas: ${parecidas.join(", ")}.`
    : " Nenhuma variável do banco foi encontrada: depois de conectar, faça Redeploy.";
  const erro = () => {
    throw Object.assign(
      new Error("Banco não configurado: conecte o Upstash Redis ao projeto no painel do Vercel (Storage)." + dica),
      { status: 500 }
    );
  };
  return new Proxy({}, { get: () => erro });
}

export const db = url && token ? new Redis({ url, token }) : process.env.VERCEL ? semBanco() : memoria();
