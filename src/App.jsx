import AppSorteio from "./AppSorteio.jsx";
import AppJogador from "./AppJogador.jsx";

/* /sorteio → tela do sorteio (com senha);  qualquer outro endereço → cartela do jogador */
const ehSorteio = window.location.pathname.replace(/\/+$/, "") === "/sorteio";

export default function App() {
  return <div id="app">{ehSorteio ? <AppSorteio /> : <AppJogador />}</div>;
}
