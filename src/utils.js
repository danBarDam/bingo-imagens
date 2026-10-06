import { PARES, TAM_CARTELA } from "./dados.js";

export function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const novaCartela = () => embaralhar(PARES.map((p) => p.id)).slice(0, TAM_CARTELA);

export const parPorId = (id) => PARES.find((p) => p.id === id);

/* Linhas, colunas e diagonais de uma grade 4x4 (posições 0..15) */
const N = 4;
const LINHAS = [
  ...[...Array(N)].map((_, r) => [...Array(N)].map((_, c) => r * N + c)),
  ...[...Array(N)].map((_, c) => [...Array(N)].map((_, r) => r * N + c)),
  [...Array(N)].map((_, i) => i * N + i),
  [...Array(N)].map((_, i) => i * N + (N - 1 - i)),
];

/* Quantas casas faltam na linha mais perto de completar (0 = bingo) */
export const faltamParaBingo = (cartela, certas) =>
  Math.min(...LINHAS.map((l) => l.filter((i) => !certas.has(cartela[i])).length));

export const temBingo = (cartela, certas) => faltamParaBingo(cartela, certas) === 0;
