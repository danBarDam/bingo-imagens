export const falha = (status, mensagem) => Object.assign(new Error(mensagem), { status });

/* Envolve um handler: nunca guarda em cache e devolve erros como { erro } */
export const rota = (fn) => async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    await fn(req, res);
  } catch (e) {
    if (!e.status) console.error(e);
    res.status(e.status || 500).json({ erro: e.status ? e.message : "Erro no servidor. Tente de novo." });
  }
};
