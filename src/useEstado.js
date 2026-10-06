import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "./api.js";

/* Busca o estado do jogo a cada `intervalo` ms. `aplicar` recebe respostas de ações;
   respostas de buscas mais antigas que a última aplicada são descartadas. */
export function useEstado(params, ativo, intervalo) {
  const [estado, setEstado] = useState(null);
  const [offline, setOffline] = useState(false);
  const seq = useRef(0);
  const aplicado = useRef(0);
  const query = new URLSearchParams(params).toString();

  const aplicar = useCallback((dados) => {
    aplicado.current = ++seq.current;
    setEstado(dados);
  }, []);

  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    const buscar = async () => {
      if (document.hidden) return;
      const n = ++seq.current;
      try {
        const dados = await api.estado(query);
        if (!vivo) return;
        setOffline(false);
        if (n > aplicado.current) {
          aplicado.current = n;
          setEstado(dados);
        }
      } catch {
        if (vivo) setOffline(true);
      }
    };
    buscar();
    const t = setInterval(buscar, intervalo);
    document.addEventListener("visibilitychange", buscar);
    return () => {
      vivo = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", buscar);
    };
  }, [query, ativo, intervalo]);

  return { estado, aplicar, offline };
}
