import { timingSafeEqual } from "node:crypto";
import { rota, falha } from "./_lib/http.js";
import { estado, sortear, novaPartida, desempatar } from "./_lib/jogo.js";

/* Fora do Vercel (npm run dev) a senha padrão é "bingo" */
const SENHA = process.env.SORTEIO_SENHA || (process.env.VERCEL ? null : "bingo");

function confere(senha) {
  if (!SENHA) throw falha(500, "Defina a variável SORTEIO_SENHA no painel do Vercel.");
  const a = Buffer.from(String(senha || ""));
  const b = Buffer.from(SENHA);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw falha(401, "Senha incorreta.");
}

const ACOES = { entrar: async () => {}, sortear, nova: novaPartida, desempate: desempatar };

/* POST /api/sorteio  { senha, acao: "entrar" | "sortear" | "nova" | "desempate" } */
export default rota(async (req, res) => {
  if (req.method !== "POST") throw falha(405, "Use POST.");
  const { senha, acao } = req.body || {};
  confere(senha);
  if (!ACOES[acao]) throw falha(400, "Ação inválida.");
  await ACOES[acao]();
  res.json(await estado({ painel: true }));
});
