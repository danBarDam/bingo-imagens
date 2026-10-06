import { rota } from "./_lib/http.js";
import { estado } from "./_lib/jogo.js";

/* GET /api/estado?jogador=<id>  ou  ?painel=1 */
export default rota(async (req, res) => {
  res.json(await estado({ jogadorId: req.query.jogador, painel: !!req.query.painel }));
});
