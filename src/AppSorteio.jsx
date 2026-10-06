import { useState, useEffect } from "react";
import { api, lerGuardado, guardar } from "./api.js";
import { useEstado } from "./useEstado.js";
import Topo from "./components/Topo.jsx";
import TelaSorteio from "./components/TelaSorteio.jsx";

const CHAVE_SENHA = "bingo:senha";

export default function AppSorteio() {
  const [senha, setSenha] = useState(() => lerGuardado(sessionStorage, CHAVE_SENHA));
  const { estado, aplicar, offline } = useEstado({ painel: 1 }, !!senha, 1500);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  // O pedido de "Nova partida" expira após 3s se não for confirmado
  useEffect(() => {
    if (!confirmando) return;
    const t = setTimeout(() => setConfirmando(false), 3000);
    return () => clearTimeout(t);
  }, [confirmando]);

  const sair = () => {
    guardar(sessionStorage, CHAVE_SENHA, null);
    setSenha(null);
  };

  const acao = async (nome) => {
    setOcupado(true);
    setErro("");
    try {
      aplicar(await api.sorteio(senha, nome));
    } catch (e) {
      if (e.status === 401) sair();
      else setErro(e.message);
    } finally {
      setOcupado(false);
    }
  };

  const pedirNovaPartida = () => {
    if (!confirmando) return setConfirmando(true);
    setConfirmando(false);
    acao("nova");
  };

  if (!senha) {
    return (
      <>
        <Topo>
          <a className="btn pequeno" href="/">Ir para a cartela</a>
        </Topo>
        <TelaLogin
          aoEntrar={async (s) => {
            const dados = await api.sorteio(s, "entrar");
            guardar(sessionStorage, CHAVE_SENHA, s);
            setSenha(s);
            aplicar(dados);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Topo>
        <span className="selo">Sorteio</span>
        <a className="btn pequeno" href="/" target="_blank" rel="noopener">Abrir uma cartela ↗</a>
        <button className="btn pequeno" onClick={sair}>Sair</button>
      </Topo>
      {(offline || erro) && <div className="aviso">{erro || "Sem conexão com o servidor. Tentando de novo…"}</div>}
      {estado ? (
        <TelaSorteio
          estado={estado}
          ocupado={ocupado}
          sortear={() => acao("sortear")}
          desempatar={() => acao("desempate")}
          pedirNovaPartida={pedirNovaPartida}
          confirmando={confirmando}
        />
      ) : (
        <p className="carregando">Carregando…</p>
      )}
    </>
  );
}

function TelaLogin({ aoEntrar }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      await aoEntrar(senha);
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  };

  return (
    <form className="cartao-entrada" onSubmit={enviar}>
      <h2>ÁREA DO SORTEIO</h2>
      <label htmlFor="senha">Senha</label>
      <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus required />
      {erro && <div className="aviso">{erro}</div>}
      <button className="btn primario" disabled={enviando || !senha}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
