async function chamar(url, opcoes) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch {
    throw new Error("Sem conexão com o servidor.");
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw Object.assign(new Error(dados.erro || "Falha no servidor."), { status: resposta.status });
  return dados;
}

const post = (url, corpo) =>
  chamar(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

export const api = {
  estado: (query) => chamar("/api/estado?" + query),
  sorteio: (senha, acao) => post("/api/sorteio", { senha, acao }),
  jogador: (corpo) => post("/api/jogador", corpo),
};

/* localStorage/sessionStorage podem falhar (aba anônima, bloqueio); nunca deixe isso quebrar o jogo */
export function lerGuardado(area, chave) {
  try {
    return JSON.parse(area.getItem(chave));
  } catch {
    return null;
  }
}
export function guardar(area, chave, valor) {
  try {
    valor == null ? area.removeItem(chave) : area.setItem(chave, JSON.stringify(valor));
  } catch {}
}
