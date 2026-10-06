export default function Topo({ children }) {
  return (
    <header className="topo">
      <div className="logo">
        <span className="bola">B</span>Bingo de Imagens
      </div>
      {children && <div className="topo-dir">{children}</div>}
    </header>
  );
}
