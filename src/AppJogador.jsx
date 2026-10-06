import { useState, useEffect, useRef } from "react";
import { api, lerGuardado, guardar } from "./api.js";
import { useEstado } from "./useEstado.js";
import Topo from "./components/Topo.jsx";
import TelaCartela from "./components/TelaCartela.jsx";

const CHAVE_SESSAO = "bingo:jogador"; // { id, nome }
const CHAVE_NOME = "bingo:nome"; // último nome usado, para já vir preenchido

export default function AppJogador() {
  const [sessao, setSessao] = useState(() => lerGuardado(localStorage, CHAVE_SESSAO));
  const { estado, aplicar, offline } = useEstado({ jogador: sessao?.id ?? "" }, !!sessao, 2000);
  const [pendentes, setPendentes] = useState(() => new Set()); // casas clicadas aguardando o servidor
  const [erro, setErro] = useState("");
  const [recomecou, setRecomecou] = useState(false);
  const fila = useRef(Promise.resolve());

  const entrar = async (nome) => {
    const dados = await api.jogador({ acao: "entrar", nome });
    const nova = { id: dados.eu.id, nome: dados.eu.nome };
    guardar(localStorage, CHAVE_SESSAO, nova);
    guardar(localStorage, CHAVE_NOME, nova.nome);
    setRecomecou(false);
    setSessao(nova);
    aplicar(dados);
  };

  // Se a partida recomeçou, a cartela antiga deixa de existir: volta para a tela de nome
  useEffect(() => {
    if (!sessao || !estado || estado.eu) return;
    sair();
    setRecomecou(true);
  }, [estado, sessao]);

  const sair = () => {
    guardar(localStorage, CHAVE_SESSAO, null);
    setSessao(null);
    setErro("");
  };

  // As marcações vão em fila para o servidor, na ordem dos cliques
  const enviar = (corpo, aoTerminar) => {
    fila.current = fila.current
      .then(() => api.jogador({ ...corpo, id: sessao.id }))
      .then((dados) => {
        setErro("");
        aplicar(dados);
      })
      .catch((e) => setErro(e.message))
      .finally(aoTerminar);
  };

  const alternar = (par) => {
    setPendentes((s) => new Set(s).add(par));
    enviar({ acao: "marcar", par }, () =>
      setPendentes((s) => {
        const n = new Set(s);
        n.delete(par);
        return n;
      })
    );
  };

  if (!sessao) {
    return (
      <>
        <Topo>
          <a className="btn pequeno" href="/sorteio">Ir para o sorteio</a>
        </Topo>
        <TelaNome aoEntrar={entrar} recomecou={recomecou} />
      </>
    );
  }

  const eu = estado?.eu?.id === sessao.id ? estado.eu : null;

  return (
    <>
      <Topo>
        <span className="selo">{sessao.nome}</span>
        <button className="btn pequeno" onClick={sair}>Trocar nome</button>
      </Topo>
      {(offline || erro) && <div className="aviso">{erro || "Sem conexão com o servidor. Tentando de novo…"}</div>}
      {eu ? (
        <TelaCartela estado={estado} eu={eu} pendentes={pendentes} alternar={alternar} trocarCartela={() => enviar({ acao: "trocar" })} />
      ) : (
        <p className="carregando">Preparando sua cartela…</p>
      )}
    </>
  );
}

function TelaNome({ aoEntrar, recomecou }) {
  const [nome, setNome] = useState(() => lerGuardado(localStorage, CHAVE_NOME) || "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      await aoEntrar(nome);
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  };

  return (
    <form className="cartao-entrada" onSubmit={enviar}>
      <h2>{recomecou ? "NOVA PARTIDA!" : "VAMOS JOGAR!"}</h2>
      {recomecou && <p className="dica">A partida recomeçou. Confirme seu nome para receber uma cartela nova.</p>}
      <label htmlFor="nome">Seu nome</label>
      <input
        id="nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        maxLength={30}
        autoComplete="name"
        autoFocus
        required
      />
      <p className="dica">É esse nome que vai aparecer na tela do sorteio se você ganhar.</p>
      {erro && <div className="aviso">{erro}</div>}
      <button className="btn primario" disabled={enviando || !nome.trim()}>
        {enviando ? "Abrindo…" : "Abrir minha cartela"}
      </button>
    </form>
  );
}
