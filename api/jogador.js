import { rota, falha } from "./_lib/http.js";
import { estado, entrar, marcar, trocarCartela } from "./_lib/jogo.js";

/* POST /api/jogador
   { acao: "entrar", nome }  |  { acao: "marcar", id, par }  |  { acao: "trocar", id } */
export default rota(async (req, res) => {
  if (req.method !== "POST") throw falha(405, "Use POST.");
  const { acao, id, nome, par } = req.body || {};
  let jogadorId = id;
  if (acao === "entrar") jogadorId = (await entrar(nome)).id;
  else if (acao === "marcar") await marcar(id, par);
  else if (acao === "trocar") await trocarCartela(id);
  else throw falha(400, "Ação inválida.");
  res.json(await estado({ jogadorId }));
});
