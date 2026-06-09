import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── Dados base (portados do Python) ──────────────────────────────────────────

const NUTRIENTES = {
  Proteina:    { unidade: "g",   recomendado_dia: 90 },
  Carboidrato: { unidade: "g",   recomendado_dia: 330 },
  Gordura:     { unidade: "g",   recomendado_dia: 77 },
  Vitamina:    { unidade: "mcg", recomendado_dia: 150 },
  Mineral:     { unidade: "mg",  recomendado_dia: 1000 },
};

const ASTRONAUTAS = {
  A1: { nome: "Elena Vasquez",  modulo: "Harmony",    dias: 180 },
  A2: { nome: "Kenji Tanaka",   modulo: "Destiny",    dias: 120 },
  A3: { nome: "Yuri Petrov",    modulo: "Zvezda",     dias: 200 },
  A4: { nome: "Amara Osei",     modulo: "Tranquility",dias: 90  },
  A5: { nome: "Lars Eriksson",  modulo: "Columbus",   dias: 150 },
  A6: { nome: "Priya Nair",     modulo: "Kibo",       dias: 60  },
};

const ALIMENTOS_BASE = {
  F01: { nome: "Frango Liofilizado",   deposito: "D1", estoque: 24, minimo: 10, Proteina: 28, Carboidrato: 0,  Gordura: 5,  Vitamina: 20,  Mineral: 80  },
  F02: { nome: "Arroz Integral",       deposito: "D1", estoque: 30, minimo: 15, Proteina: 5,  Carboidrato: 45, Gordura: 2,  Vitamina: 5,   Mineral: 30  },
  F03: { nome: "Atum em Embalagem",    deposito: "D2", estoque: 8,  minimo: 12, Proteina: 25, Carboidrato: 0,  Gordura: 3,  Vitamina: 15,  Mineral: 50  },
  F04: { nome: "Granola Espacial",     deposito: "D2", estoque: 20, minimo: 10, Proteina: 8,  Carboidrato: 60, Gordura: 10, Vitamina: 30,  Mineral: 120 },
  F05: { nome: "Purê de Batata",       deposito: "D3", estoque: 5,  minimo: 8,  Proteina: 3,  Carboidrato: 30, Gordura: 1,  Vitamina: 10,  Mineral: 200 },
  F06: { nome: "Barra de Proteína",    deposito: "D1", estoque: 40, minimo: 20, Proteina: 20, Carboidrato: 25, Gordura: 8,  Vitamina: 40,  Mineral: 90  },
  F07: { nome: "Feijão Liofilizado",   deposito: "D4", estoque: 18, minimo: 10, Proteina: 12, Carboidrato: 40, Gordura: 1,  Vitamina: 5,   Mineral: 150 },
  F08: { nome: "Suco de Laranja",      deposito: "D3", estoque: 3,  minimo: 10, Proteina: 1,  Carboidrato: 26, Gordura: 0,  Vitamina: 60,  Mineral: 20  },
  F09: { nome: "Ovo Desidratado",      deposito: "D4", estoque: 22, minimo: 10, Proteina: 12, Carboidrato: 1,  Gordura: 9,  Vitamina: 25,  Mineral: 55  },
  F10: { nome: "Macarrão Integral",    deposito: "D2", estoque: 15, minimo: 8,  Proteina: 7,  Carboidrato: 55, Gordura: 2,  Vitamina: 8,   Mineral: 40  },
  F11: { nome: "Mix de Castanhas",     deposito: "D4", estoque: 12, minimo: 6,  Proteina: 10, Carboidrato: 15, Gordura: 20, Vitamina: 10,  Mineral: 70  },
  F12: { nome: "Suplemento Vitamínico",deposito: "D3", estoque: 2,  minimo: 15, Proteina: 0,  Carboidrato: 5,  Gordura: 0,  Vitamina: 100, Mineral: 300 },
};

const MODULOS_GRAFO = {
  Harmony:     { vizinhos: { Destiny: 12, Tranquility: 15, Unity: 10, Kibo: 18, Columbus: 16 } },
  Destiny:     { vizinhos: { Harmony: 12, Columbus: 14, Zarya: 25 } },
  Zvezda:      { vizinhos: { Unity: 22, Zarya: 11, Tranquility: 20 } },
  Tranquility: { vizinhos: { Harmony: 15, Unity: 13, Zvezda: 20, Kibo: 17, Columbus: 19 } },
  Unity:       { vizinhos: { Harmony: 10, Zvezda: 22, Zarya: 14, Tranquility: 13 } },
  Zarya:       { vizinhos: { Unity: 14, Zvezda: 11, Destiny: 25 } },
  Columbus:    { vizinhos: { Harmony: 16, Destiny: 14, Tranquility: 19 } },
  Kibo:        { vizinhos: { Harmony: 18, Tranquility: 17 } },
  D1:          { vizinhos: { Destiny: 3 } },
  D2:          { vizinhos: { Zvezda: 3 } },
  D3:          { vizinhos: { Tranquility: 3 } },
  D4:          { vizinhos: { Zarya: 3 } },
};

// ── Dijkstra ─────────────────────────────────────────────────────────────────
// MELHORIA 1: fila ordenada na inserção em vez de sort() a cada iteração

function dijkstra(grafo, origem) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  for (const n of Object.keys(grafo)) {
    dist[n] = Infinity;
    prev[n] = null;
  }
  dist[origem] = 0;

  // Fila simples ordenada — insere já na posição certa
  const queue = [[0, origem]];

  function inserirOrdenado(item) {
    let i = 0;
    while (i < queue.length && queue[i][0] <= item[0]) i++;
    queue.splice(i, 0, item);
  }

  while (queue.length) {
    const [d, u] = queue.shift();
    if (visited.has(u)) continue;
    visited.add(u);

    for (const [v, w] of Object.entries(grafo[u]?.vizinhos || {})) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
        inserirOrdenado([nd, v]); // insere ordenado, não faz sort depois
      }
    }
  }

  return { dist, prev };
}

function reconstruirCaminho(prev, destino) {
  const path = [];
  let n = destino;
  while (n) { path.unshift(n); n = prev[n]; }
  return path;
}

// ── Estado inicial ────────────────────────────────────────────────────────────
// MELHORIA 2: spread {...} em vez de JSON.parse(JSON.stringify()) para clonar

function initState() {
  const consumo = {};
  for (const aid of Object.keys(ASTRONAUTAS))
    consumo[aid] = { Proteina: 0, Carboidrato: 0, Gordura: 0, Vitamina: 0, Mineral: 0 };

  // Cópia do estoque usando spread — mais limpo que JSON.parse(JSON.stringify())
  const estoque = {};
  for (const [fid, dados] of Object.entries(ALIMENTOS_BASE))
    estoque[fid] = { ...dados };

  return { consumo, estoque, diaAtual: 1, historico: [] };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const NUT_COLORS = {
  Proteina: "#60a5fa", Carboidrato: "#fbbf24", Gordura: "#f87171",
  Vitamina: "#a78bfa", Mineral: "#34d399",
};

function getPct(val, max) { return Math.min(100, max > 0 ? (val / max) * 100 : 0); }

function getStatusColor(pct) {
  if (pct >= 80) return "#34d399";
  if (pct >= 50) return "#fbbf24";
  return "#f87171";
}

function getEstoqueStatus(item) {
  const pct = (item.estoque / item.minimo) * 100;
  if (pct >= 100) return { color: "#34d399", label: "OK" };
  if (pct >= 60)  return { color: "#fbbf24", label: "BAIXO" };
  return { color: "#f87171", label: "CRÍTICO" };
}

// ── Componentes ───────────────────────────────────────────────────────────────

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.3,
    opacity: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 4,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "white", opacity: s.opacity,
          animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

// NutBar agora mostra duas barras: consumo do dia e acumulado da missão
function NutBar({ label, valorDia, valorTotal, meta, unit, diaAtual }) {
  const pctDia   = getPct(valorDia,   meta);               // % do dia vs meta diária
  const pctTotal = getPct(valorTotal, meta * diaAtual);    // % acumulado vs meta total
  const colorDia   = getStatusColor(pctDia);
  const colorTotal = getStatusColor(pctTotal);
  return (
    <div style={{ marginBottom: 14 }}>
      {/* Nome do nutriente */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
        <span style={{ color: NUT_COLORS[label], fontWeight: 600 }}>{label}</span>
      </div>

      {/* Barra HOJE */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono', monospace", width: 52 }}>HOJE</span>
        <div style={{ flex: 1, height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pctDia}%`, background: colorDia, borderRadius: 3, transition: "width 0.6s ease", boxShadow: `0 0 6px ${colorDia}88` }} />
        </div>
        <span style={{ fontSize: 10, color: colorDia, width: 70, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
          {valorDia.toFixed(0)}/{meta.toFixed(0)} {unit}
        </span>
      </div>

      {/* Barra MISSÃO */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono', monospace", width: 52 }}>MISSÃO</span>
        <div style={{ flex: 1, height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pctTotal}%`, background: colorTotal, borderRadius: 3, transition: "width 0.6s ease", boxShadow: `0 0 6px ${colorTotal}88`, opacity: 0.6 }} />
        </div>
        <span style={{ fontSize: 10, color: colorTotal, width: 70, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
          {valorTotal.toFixed(0)}/{(meta * diaAtual).toFixed(0)} {unit}
        </span>
      </div>
    </div>
  );
}

// ── Chat com Claude ───────────────────────────────────────────────────────────

function ChatPanel({ state, onAction }) {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    text: "🚀 STARage online. Sou o sistema de controle da estação. Diga-me o que aconteceu — quem consumiu o quê, ou peça um relatório de estoque.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg = { role: "user", text };
    setMsgs(m => [...m, userMsg]);
    setLoading(true);

    const context = buildContext(state);
    const history = [...msgs, userMsg]
      .filter(m => m.role !== "system")
      .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Você é o sistema de IA do STARage, armazém inteligente da ISS.
Contexto atual da missão:
${context}

Você pode executar ações respondendo com um bloco JSON no formato:
{"acao": "registrar", "aid": "A1", "fid": "F01", "porcoes": 1}
{"acao": "rota", "aid": "A1", "fid": "F03"}
{"acao": "relatorio", "aid": "A1"}
{"acao": "estoque"}
{"acao": "nenhuma"}

Responda sempre em português, de forma concisa e técnica. Se o usuário pedir para registrar consumo, extraia o astronauta e o alimento da mensagem. Se não tiver certeza, pergunte. Inclua SEMPRE um bloco JSON com a ação no final da resposta, mesmo que seja {"acao":"nenhuma"}.`,
          messages: history,
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "Erro na resposta.";

      const jsonMatch = raw.match(/\{[\s\S]*?"acao"[\s\S]*?\}/);
      let actionResult = null;
      if (jsonMatch) {
        try {
          const action = JSON.parse(jsonMatch[0]);
          actionResult = onAction(action);
        } catch (_) {}
      }

      const cleanText = raw.replace(/\{[\s\S]*?"acao"[\s\S]*?\}/g, "").trim();
      setMsgs(m => [...m, { role: "assistant", text: cleanText + (actionResult ? `\n\n${actionResult}` : "") }]);
    } catch (e) {
      setMsgs(m => [...m, { role: "assistant", text: "Falha na comunicação com o sistema." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "rgba(15,23,42,0.85)", borderRadius: 12,
      border: "1px solid rgba(99,102,241,0.3)", backdropFilter: "blur(12px)",
      overflow: "hidden",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
        <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: "#94a3b8", letterSpacing: 1 }}>STARAGE AI // CANAL SEGURO</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.role === "user" ? "rgba(99,102,241,0.3)" : "rgba(30,41,59,0.9)",
              border: `1px solid ${m.role === "user" ? "rgba(99,102,241,0.5)" : "rgba(71,85,105,0.4)"}`,
              fontSize: 13, lineHeight: 1.55, color: "#e2e8f0",
              fontFamily: m.role === "user" ? "inherit" : "'Space Mono', monospace",
              whiteSpace: "pre-wrap",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "8px 12px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%", background: "#6366f1",
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(99,102,241,0.2)", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ex: A1 consumiu 2 porções de F06..."
          style={{
            flex: 1, background: "rgba(30,41,59,0.8)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background: loading ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.8)",
          border: "none", borderRadius: 8, padding: "8px 14px", color: "white",
          cursor: loading ? "default" : "pointer", fontSize: 16, transition: "all 0.2s",
        }}>
          ↑
        </button>
      </div>
    </div>
  );
}

function buildContext(state) {
  const lines = [`Dia atual da missão: ${state.diaAtual}`, "", "ASTRONAUTAS E CONSUMO:"];
  for (const [aid, ast] of Object.entries(ASTRONAUTAS)) {
    const c = state.consumo[aid];
    lines.push(`  ${aid} (${ast.nome}) em ${ast.modulo}:`);
    for (const [n, meta] of Object.entries(NUTRIENTES)) {
      const pct = getPct(c[n], meta.recomendado_dia * state.diaAtual);
      lines.push(`    ${n}: ${c[n].toFixed(0)}/${(meta.recomendado_dia * state.diaAtual).toFixed(0)} ${meta.unidade} (${pct.toFixed(0)}%)`);
    }
  }
  lines.push("", "ESTOQUE CRÍTICO:");
  for (const [fid, item] of Object.entries(state.estoque)) {
    if (item.estoque < item.minimo)
      lines.push(`  ${fid} ${item.nome}: ${item.estoque}/${item.minimo} (ABAIXO DO MÍNIMO)`);
  }
  lines.push("", "ALIMENTOS DISPONÍVEIS: " + Object.entries(state.estoque).map(([id,i]) => `${id}=${i.nome}`).join(", "));
  lines.push("ASTRONAUTAS: " + Object.entries(ASTRONAUTAS).map(([id,a]) => `${id}=${a.nome}`).join(", "));
  return lines.join("\n");
}

// ── App principal ─────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState(initState);
  const [selectedAstro, setSelectedAstro] = useState("A1");
  const [tab, setTab] = useState("nutricao");
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // MELHORIA 3: useCallback evita recriar handleAction a cada render do App
  const handleAction = useCallback((action) => {
    if (action.acao === "registrar") {
      const { aid, fid, porcoes = 1 } = action;
      if (!ASTRONAUTAS[aid] || !ALIMENTOS_BASE[fid]) return "❌ Astronauta ou alimento inválido.";

      let estoqueAtual = null;
      setState(prev => {
        const item = prev.estoque[fid];
        if (!item || item.estoque < porcoes) return prev; // sem mudança

        // MELHORIA 2 aplicada aqui: spread em vez de JSON.parse(JSON.stringify())
        const novoEstoque = { ...prev.estoque, [fid]: { ...item, estoque: item.estoque - porcoes } };

        const novoConsumo = { ...prev.consumo };
        novoConsumo[aid] = { ...prev.consumo[aid] };
        for (const n of Object.keys(NUTRIENTES))
          novoConsumo[aid][n] += (ALIMENTOS_BASE[fid][n] || 0) * porcoes;

        const novoHist = [...prev.historico, { aid, fid, porcoes, dia: prev.diaAtual, ts: new Date().toLocaleTimeString() }];
        estoqueAtual = item;
        return { ...prev, estoque: novoEstoque, consumo: novoConsumo, historico: novoHist };
      });

      const nomeItem = ALIMENTOS_BASE[fid].nome;
      showToast(`✓ ${ASTRONAUTAS[aid].nome} consumiu ${porcoes}x ${nomeItem}`);
      return `✓ Registrado: ${porcoes}x ${nomeItem} para ${ASTRONAUTAS[aid].nome}`;
    }

    if (action.acao === "rota") {
      const { aid, fid } = action;
      if (!ASTRONAUTAS[aid] || !ALIMENTOS_BASE[fid]) return "❌ Dados inválidos.";
      const origem = ASTRONAUTAS[aid].modulo;
      const deposito = ALIMENTOS_BASE[fid].deposito;
      const { dist, prev } = dijkstra(MODULOS_GRAFO, origem);
      const caminho = reconstruirCaminho(prev, deposito);
      return `📍 Rota: ${caminho.join(" → ")}\n💰 Custo total: ${dist[deposito]}m`;
    }

    if (action.acao === "estoque") {
      // Lê o estoque direto do state via closure não funciona bem em useCallback,
      // então retornamos uma string que o ChatPanel vai exibir
      return "__checar_estoque__";
    }

    if (action.acao === "relatorio") {
      const { aid } = action;
      const ast = ASTRONAUTAS[aid];
      if (!ast) return "❌ Astronauta inválido.";
      return "__relatorio__" + aid;
    }

    return null;
  }, []); // sem dependências — só usa constantes e setState

  const astro   = ASTRONAUTAS[selectedAstro];
  const consumo = state.consumo[selectedAstro]; // acumulado total

  // Consumo só do dia atual — calculado a partir do histórico
  const consumoDia = Object.keys(NUTRIENTES).reduce((acc, n) => {
    acc[n] = state.historico
      .filter(h => h.aid === selectedAstro && h.dia === state.diaAtual)
      .reduce((soma, h) => soma + (ALIMENTOS_BASE[h.fid]?.[n] || 0) * h.porcoes, 0);
    return acc;
  }, {});
  const criticos = Object.entries(state.estoque).filter(([, i]) => i.estoque < i.minimo);

  // MELHORIA 4: useMemo — Dijkstra roda UMA vez para todos os críticos,
  // só quando o astronauta selecionado ou o estoque mudam
  const rotasCriticos = useMemo(() => {
    if (criticos.length === 0) return {};
    const origem = astro.modulo;
    const { dist, prev } = dijkstra(MODULOS_GRAFO, origem);
    const resultado = {};
    for (const [fid] of criticos) {
      const deposito = state.estoque[fid].deposito;
      resultado[fid] = {
        caminho: reconstruirCaminho(prev, deposito),
        custo: dist[deposito],
      };
    }
    return resultado;
  }, [selectedAstro, state.estoque]);

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #020818 0%, #0a0f2e 50%, #060d1f 100%)",
      fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:0.8} }
        @keyframes pulse { 0%,100%{transform:scale(0.8);opacity:0.4} 50%{transform:scale(1.2);opacity:1} }
        @keyframes slideIn { from{transform:translateY(-10px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes glow { 0%,100%{box-shadow:0 0 10px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 20px rgba(99,102,241,0.6)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.4);border-radius:2px}
        * { box-sizing: border-box; }
      `}</style>

      <StarField />

      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.type === "success" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
          border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.5)" : "rgba(248,113,113,0.5)"}`,
          borderRadius: 10, padding: "10px 16px", fontSize: 13,
          color: toast.type === "success" ? "#34d399" : "#f87171",
          animation: "slideIn 0.3s ease", backdropFilter: "blur(8px)",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "20px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24, fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: -1 }}>
                <span style={{ color: "#6366f1" }}>★</span> STARage
              </div>
              <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#475569", letterSpacing: 2, paddingTop: 2 }}>
                SMART SPACE STORAGE
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2, fontFamily: "'Space Mono', monospace" }}>
              ISS // DIA {state.diaAtual} DE MISSÃO
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setState(s => ({ ...s, diaAtual: s.diaAtual + 1 }))} style={{
              background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: 8, padding: "6px 14px", color: "#a5b4fc", fontSize: 12,
              cursor: "pointer", fontFamily: "'Space Mono', monospace",
            }}>
              + DIA
            </button>
            {criticos.length > 0 && (
              <div style={{
                background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)",
                borderRadius: 8, padding: "6px 14px", color: "#f87171", fontSize: 12,
                fontFamily: "'Space Mono', monospace", animation: "glow 2s infinite",
              }}>
                ⚠ {criticos.length} CRÍTICO{criticos.length > 1 ? "S" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Layout principal */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 340px", gap: 16, alignItems: "start" }}>

          {/* Coluna esquerda: astronautas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#475569", letterSpacing: 2, marginBottom: 4 }}>
              TRIPULAÇÃO
            </div>
            {Object.entries(ASTRONAUTAS).map(([aid, ast]) => {
              const c = state.consumo[aid];
              // Média baseada no acumulado vs meta total da missão
              const mediaP = Object.keys(NUTRIENTES).reduce((acc, n) => {
                return acc + getPct(c[n], NUTRIENTES[n].recomendado_dia * state.diaAtual);
              }, 0) / Object.keys(NUTRIENTES).length;
              // Consumo só de hoje para o badge de alerta
              const comeuHoje = state.historico.some(h => h.aid === aid && h.dia === state.diaAtual);
              const isSelected = selectedAstro === aid;
              return (
                <div key={aid} onClick={() => setSelectedAstro(aid)} style={{
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                  background: isSelected ? "rgba(99,102,241,0.2)" : "rgba(15,23,42,0.6)",
                  border: `1px solid ${isSelected ? "rgba(99,102,241,0.6)" : "rgba(71,85,105,0.3)"}`,
                  backdropFilter: "blur(8px)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: isSelected ? "#a5b4fc" : "#cbd5e1" }}>
                        {ast.nome.split(" ")[0]}
                      </div>
                      <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono', monospace" }}>
                        {aid} · {ast.modulo}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: getStatusColor(mediaP) }}>
                        {mediaP.toFixed(0)}%
                      </div>
                      {!comeuHoje && (
                        <div style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: "#f87171", letterSpacing: 0.5 }}>
                          SEM REFEIÇÃO
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${mediaP}%`,
                      background: getStatusColor(mediaP),
                      borderRadius: 2, transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coluna central */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div style={{
              padding: "16px 20px", borderRadius: 12,
              background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.3)",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: "#e2e8f0" }}>
                    {astro.nome}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#6366f1", marginTop: 2 }}>
                    {selectedAstro} // MÓDULO {astro.modulo.toUpperCase()} // DIA {astro.dias} DE MISSÃO
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono', monospace" }}>REFEIÇÕES HOJE</div>
                  <div style={{ fontSize: 28, fontWeight: 300, color: "#6366f1" }}>
                    {state.historico.filter(h => h.aid === selectedAstro && h.dia === state.diaAtual).length}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 2, background: "rgba(15,23,42,0.6)", borderRadius: 10, padding: 4, border: "1px solid rgba(71,85,105,0.3)" }}>
              {[["nutricao","NUTRIÇÃO"],["estoque","ESTOQUE"],["rotas","ROTAS"],["historico","HISTÓRICO"]].map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: "7px 0", borderRadius: 7, border: "none", cursor: "pointer",
                  background: tab === t ? "rgba(99,102,241,0.3)" : "transparent",
                  color: tab === t ? "#a5b4fc" : "#475569", fontSize: 11,
                  fontFamily: "'Space Mono', monospace", letterSpacing: 1, transition: "all 0.2s",
                }}>
                  {label}
                </button>
              ))}
            </div>

            {tab === "nutricao" && (
              <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(71,85,105,0.3)", backdropFilter: "blur(12px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#475569", letterSpacing: 2 }}>
                    STATUS NUTRICIONAL
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, fontFamily: "'Space Mono', monospace" }}>
                    <span style={{ color: "#94a3b8" }}>▬ <span style={{ color: "#6366f1" }}>HOJE</span></span>
                    <span style={{ color: "#94a3b8" }}>▬ <span style={{ color: "#475569" }}>MISSÃO (DIA {state.diaAtual})</span></span>
                  </div>
                </div>
                {Object.entries(NUTRIENTES).map(([n, meta]) => (
                  <NutBar
                    key={n}
                    label={n}
                    valorDia={consumoDia[n]}
                    valorTotal={consumo[n]}
                    meta={meta.recomendado_dia}
                    unit={meta.unidade}
                    diaAtual={state.diaAtual}
                  />
                ))}
              </div>
            )}

            {tab === "estoque" && (
              <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(71,85,105,0.3)", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#475569", letterSpacing: 2, marginBottom: 14 }}>
                  INVENTÁRIO DE ALIMENTOS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(state.estoque).map(([fid, item]) => {
                    const st = getEstoqueStatus(item);
                    const pct = Math.min(100, (item.estoque / item.minimo) * 100);
                    return (
                      <div key={fid} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(30,41,59,0.6)", border: "1px solid rgba(71,85,105,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#6366f1" }}>{fid}</span>
                            <span style={{ fontSize: 13, color: "#cbd5e1" }}>{item.nome}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.estoque}/{item.minimo}</span>
                            <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", padding: "2px 6px", borderRadius: 4, background: `${st.color}22`, color: st.color, letterSpacing: 1 }}>{st.label}</span>
                          </div>
                        </div>
                        <div style={{ height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: st.color, borderRadius: 2, transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "rotas" && (
              <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(71,85,105,0.3)", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#475569", letterSpacing: 2, marginBottom: 14 }}>
                  DIJKSTRA // ROTAS DE REABASTECIMENTO
                </div>
                {criticos.length === 0 ? (
                  <div style={{ color: "#34d399", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>✓ SEM ITENS CRÍTICOS</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Usa rotasCriticos do useMemo — já calculado uma vez só */}
                    {[...criticos]
                      .sort((a, b) => (rotasCriticos[a[0]]?.custo || 0) - (rotasCriticos[b[0]]?.custo || 0))
                      .map(([fid, item]) => {
                        const rota = rotasCriticos[fid];
                        const st = getEstoqueStatus(item);
                        return (
                          <div key={fid} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(30,41,59,0.7)", border: `1px solid ${st.color}44` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{item.nome}</span>
                              <span style={{ fontSize: 11, color: st.color, fontFamily: "'Space Mono', monospace" }}>{rota?.custo}m</span>
                            </div>
                            <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#64748b", letterSpacing: 0.5 }}>
                              {rota?.caminho.join(" → ")}
                            </div>
                            <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>
                              Estoque: {item.estoque}/{item.minimo} · {item.deposito}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {tab === "historico" && (
              <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(71,85,105,0.3)", backdropFilter: "blur(12px)", maxHeight: 400, overflowY: "auto" }}>
                <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#475569", letterSpacing: 2, marginBottom: 14 }}>
                  LOG DE CONSUMO
                </div>
                {state.historico.filter(h => h.aid === selectedAstro).length === 0 ? (
                  <div style={{ color: "#475569", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>NENHUM REGISTRO</div>
                ) : (
                  [...state.historico].filter(h => h.aid === selectedAstro).reverse().map((h, i) => (
                    <div key={i} style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 6, background: "rgba(30,41,59,0.6)", border: "1px solid rgba(71,85,105,0.2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: "#cbd5e1" }}>{state.estoque[h.fid]?.nome || h.fid}</span>
                        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#6366f1" }}>×{h.porcoes}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#475569", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                        DIA {h.dia} · {h.ts}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Coluna direita: Chat */}
          <div style={{ height: 620 }}>
            <ChatPanel state={state} onAction={handleAction} />
          </div>
        </div>
      </div>
    </div>
  );
}
