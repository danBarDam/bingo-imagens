import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { falha } from "./http.js";
import { PARES } from "../../src/dados.js";
import { embaralhar, novaCartela, temBingo } from "../../src/utils.js";

const K_JOGO = "bingo:jogo"; // { partida, ordem, qtd, desempate: [rodada...] }
const K_JOGADORES = "bingo:jogadores"; // id secreto -> jogador
const K_GANHADORES = "bingo:ganhadores"; // pub -> { pub, nome, num, ganhouEm, em }

const idCurto = () => randomUUID().slice(0, 8);
const numeroCartela = () => 1 + Math.floor(Math.random() * 999);

/* ---------- partida ---------- */

export async function lerJogo() {
  return (await db.get(K_JOGO)) || novaPartida();
}

export async function novaPartida() {
  const jogo = { partida: idCurto(), ordem: embaralhar(PARES.map((p) => p.id)), qtd: 0, desempate: [] };
  await db.del(K_JOGADORES, K_GANHADORES);
  await db.set(K_JOGO, jogo);
  return jogo;
}

export async function sortear() {
  const jogo = await lerJogo();
  jogo.qtd = Math.min(jogo.qtd + 1, jogo.ordem.length);
  await db.set(K_JOGO, jogo);
  return jogo;
}

/* Cada empatado ainda na disputa recebe um número de 1 a 10; o maior vence */
export async function desempatar() {
  const jogo = await lerJogo();
  const { candidatos, precisaDesempate } = resumo(jogo, await db.hgetall(K_GANHADORES));
  if (!precisaDesempate) throw falha(409, "Não há empate para desempatar.");
  const rodada = {};
  for (const pub of candidatos) rodada[pub] = 1 + Math.floor(Math.random() * 10);
  jogo.desempate.push(rodada);
  await db.set(K_JOGO, jogo);
  return jogo;
}

/* ---------- estado público (nunca expõe a ordem futura nem ids secretos) ---------- */

export function resumo(jogo, ganhadoresHash) {
  const ganhadores = Object.values(ganhadoresHash || {}).sort((a, b) => a.ganhouEm - b.ganhouEm || a.em - b.em);
  const primeira = ganhadores[0]?.ganhouEm;
  const empatados = ganhadores.filter((g) => g.ganhouEm === primeira).map((g) => g.pub);

  let candidatos = empatados;
  for (const rodada of jogo.desempate) {
    const max = Math.max(...Object.values(rodada));
    candidatos = Object.keys(rodada).filter((pub) => rodada[pub] === max);
  }

  return {
    partida: jogo.partida,
    total: jogo.ordem.length,
    sorteadas: jogo.ordem.slice(0, jogo.qtd),
    ganhadores,
    empatados,
    desempate: jogo.desempate,
    candidatos,
    precisaDesempate: candidatos.length > 1,
    vencedor: candidatos.length === 1 ? candidatos[0] : null,
  };
}

export async function estado({ jogadorId, painel } = {}) {
  const jogo = await lerJogo();
  const [ganhadores, eu, jogadores] = await Promise.all([
    db.hgetall(K_GANHADORES),
    jogadorId ? db.hget(K_JOGADORES, jogadorId) : null,
    painel ? db.hlen(K_JOGADORES) : undefined,
  ]);
  const r = resumo(jogo, ganhadores);
  if (jogadorId) r.eu = eu;
  if (painel) r.jogadores = jogadores;
  return r;
}

/* ---------- jogadores ---------- */

export async function entrar(nome) {
  nome = String(nome || "").trim().replace(/\s+/g, " ").slice(0, 30);
  if (!nome) throw falha(400, "Digite seu nome.");
  const jogador = {
    id: randomUUID(),
    pub: idCurto(),
    nome,
    num: numeroCartela(),
    cartela: novaCartela(),
    marcas: {}, // parId -> true (valeu) | false (marcou antes de ser sorteada)
    ganhouEm: null,
  };
  await db.hset(K_JOGADORES, { [jogador.id]: jogador });
  return jogador;
}

async function lerJogador(id) {
  const j = id && (await db.hget(K_JOGADORES, id));
  if (!j) throw falha(404, "Cartela não encontrada (a partida pode ter recomeçado).");
  return j;
}

export async function marcar(id, parId) {
  const [jogador, jogo] = await Promise.all([lerJogador(id), lerJogo()]);
  parId = Number(parId);
  if (!jogador.cartela.includes(parId)) throw falha(400, "Essa imagem não está na sua cartela.");

  if (parId in jogador.marcas) delete jogador.marcas[parId];
  else jogador.marcas[parId] = jogo.ordem.slice(0, jogo.qtd).includes(parId);

  if (jogador.ganhouEm === null) {
    const certas = new Set(jogador.cartela.filter((p) => jogador.marcas[p] === true));
    if (temBingo(jogador.cartela, certas)) {
      jogador.ganhouEm = jogo.qtd;
      const { pub, nome, num } = jogador;
      await db.hset(K_GANHADORES, { [pub]: { pub, nome, num, ganhouEm: jogo.qtd, em: Date.now() } });
    }
  }
  await db.hset(K_JOGADORES, { [id]: jogador });
}

export async function trocarCartela(id) {
  const [jogador, jogo] = await Promise.all([lerJogador(id), lerJogo()]);
  if (jogo.qtd > 0) throw falha(409, "Só dá para trocar a cartela antes do primeiro sorteio.");
  Object.assign(jogador, { cartela: novaCartela(), num: numeroCartela(), marcas: {} });
  await db.hset(K_JOGADORES, { [id]: jogador });
}
