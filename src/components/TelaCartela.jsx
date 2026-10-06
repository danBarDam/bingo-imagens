import Imagem from "./Imagem.jsx";
import { LETRAS, QTD_RECENTES } from "../dados.js";
import { parPorId, faltamParaBingo } from "../utils.js";

export default function TelaCartela({ estado, eu, pendentes, alternar, trocarCartela }) {
  const { sorteadas, total } = estado;
  const recentes = sorteadas.slice(-QTD_RECENTES).reverse();
  // Clique ainda não confirmado pelo servidor: mostra já invertido (marcar/desmarcar)
  const marcada = (id) => (id in eu.marcas) !== pendentes.has(id);
  const certas = new Set(eu.cartela.filter((id) => eu.marcas[id] === true));
  const invalidas = eu.cartela.filter((id) => eu.marcas[id] === false).length;
  const faltam = faltamParaBingo(eu.cartela, certas);

  return (
    <>
      <AvisoResultado estado={estado} eu={eu} />

      {/* Faixa com as últimas sorteadas (a atual em destaque) */}
      <div className="faixa">
        <div className="sorteadas">
          <span className="rot">
            Últimas sorteadas · {sorteadas.length} de {total}
          </span>
          {recentes.length === 0 && (
            <>
              <div className="mini atual vazia" title="Nenhuma ainda"></div>
              <span className="esperando">Aguardando o primeiro sorteio…</span>
            </>
          )}
          {recentes.map((id, i) => {
            const p = parPorId(id);
            return (
              <div key={id} className={"mini" + (i === 0 ? " atual" : "")} title={i === 0 ? "Imagem atual" : "Sorteada antes"}>
                <Imagem fonte={p.sorteio} alt={p.nome} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="cartela-area">
        <div>
          <div className="cartela-topo">
            <h2>CARTELA DE {eu.nome.toUpperCase()}</h2>
            <span className="num">Cartela nº {String(eu.num).padStart(3, "0")}</span>
          </div>
          <div className="cartela">
            <div className="letras">
              {LETRAS.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
            <div className="grade-cartela">
              {eu.cartela.map((id) => {
                const p = parPorId(id);
                const m = marcada(id);
                const pendente = pendentes.has(id);
                const certa = eu.marcas[id] === true;
                return (
                  <button
                    key={id}
                    className={"casa" + (m ? " marcada " + (pendente ? "pendente" : certa ? "certa" : "errada") : "")}
                    onClick={() => alternar(id)}
                    aria-pressed={m}
                    aria-label={p.nome}
                  >
                    <Imagem fonte={p.cartela} alt={p.nome} />
                  </button>
                );
              })}
            </div>
          </div>
          <p className="dica">
            Olhe a imagem sorteada e clique na imagem da sua cartela que combina com ela. Clique de novo para desmarcar.
            Faça uma linha, coluna ou diagonal!
          </p>
        </div>

        <div className="placar">
          {eu.ganhouEm !== null && <div className="bingo">BINGO!</div>}
          <div className="linha"><span>Imagens sorteadas</span><span>{sorteadas.length}</span></div>
          <div className="linha"><span>Acertos marcados</span><span>{certas.size}</span></div>
          <div className="linha"><span>Faltam para o bingo</span><span>{faltam}</span></div>
          {invalidas > 0 && (
            <div className="aviso">
              {invalidas === 1 ? "1 marcação em vermelho não vale" : `${invalidas} marcações em vermelho não valem`}: a
              imagem ainda não tinha sido sorteada (ou não combina). Desmarque e marque de novo quando ela sair.
            </div>
          )}
          <button
            className="btn"
            onClick={trocarCartela}
            disabled={sorteadas.length > 0}
            title={sorteadas.length > 0 ? "Só dá para trocar antes do primeiro sorteio" : ""}
          >
            Trocar cartela
          </button>
        </div>
      </div>
    </>
  );
}

function AvisoResultado({ estado, eu }) {
  const { ganhadores, candidatos, precisaDesempate, vencedor, desempate } = estado;
  if (!ganhadores.length) return null;

  const nome = (pub) => ganhadores.find((g) => g.pub === pub)?.nome;
  const meusNumeros = desempate.map((r) => r[eu.pub]).filter((n) => n !== undefined);

  let texto;
  let destaque = false;
  if (vencedor === eu.pub) {
    texto = "🏆 Você ganhou!";
    destaque = true;
  } else if (precisaDesempate && candidatos.includes(eu.pub)) {
    texto = "Empate! Aguarde o desempate na tela do sorteio.";
    destaque = true;
  } else if (precisaDesempate) {
    texto = `Empate entre ${candidatos.map(nome).join(" e ")}. Aguardando o desempate…`;
  } else {
    texto = `🏆 ${nome(vencedor)} ganhou!`;
  }

  return (
    <div className={"resultado" + (destaque ? " meu" : "")} aria-live="polite">
      {texto}
      {meusNumeros.length > 0 && <span className="meus-numeros">Seus números no desempate: {meusNumeros.join(", ")}</span>}
    </div>
  );
}
