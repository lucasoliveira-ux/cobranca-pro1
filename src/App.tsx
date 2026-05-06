import { useState, useEffect, useMemo } from "react";

const MOCK_ACORDOS = [
  {
    id: 1,
    cliente: "Maria Silva",
    telefone: "(11) 98765-4321",
    valor: 3200,
    parcelas: 4,
    parcelasPagas: 2,
    vencimento: "2026-05-08",
    status: "em_andamento",
    observacoes: "Prefere contato à tarde",
  },
  {
    id: 2,
    cliente: "João Pereira",
    telefone: "(21) 99123-4567",
    valor: 1500,
    parcelas: 1,
    parcelasPagas: 0,
    vencimento: "2026-05-05",
    status: "atrasado",
    observacoes: "",
  },
  {
    id: 3,
    cliente: "Ana Costa",
    telefone: "(31) 97654-3210",
    valor: 8700,
    parcelas: 6,
    parcelasPagas: 6,
    vencimento: "2026-04-30",
    status: "pago",
    observacoes: "Cliente VIP",
  },
  {
    id: 4,
    cliente: "Carlos Mendes",
    telefone: "(11) 94321-8765",
    valor: 2100,
    parcelas: 3,
    parcelasPagas: 1,
    vencimento: "2026-05-10",
    status: "em_andamento",
    observacoes: "",
  },
  {
    id: 5,
    cliente: "Fernanda Lima",
    telefone: "(51) 98888-1234",
    valor: 5600,
    parcelas: 2,
    parcelasPagas: 0,
    vencimento: "2026-05-03",
    status: "atrasado",
    observacoes: "Prometeu pagar sexta",
  },
  {
    id: 6,
    cliente: "Ricardo Alves",
    telefone: "(11) 97777-9876",
    valor: 920,
    parcelas: 1,
    parcelasPagas: 1,
    vencimento: "2026-04-25",
    status: "pago",
    observacoes: "",
  },
  {
    id: 7,
    cliente: "Patrícia Souza",
    telefone: "(21) 96666-5432",
    valor: 4300,
    parcelas: 5,
    parcelasPagas: 3,
    vencimento: "2026-05-15",
    status: "em_andamento",
    observacoes: "",
  },
  {
    id: 8,
    cliente: "Bruno Oliveira",
    telefone: "(11) 95555-6789",
    valor: 1800,
    parcelas: 2,
    parcelasPagas: 0,
    vencimento: "2026-05-07",
    status: "em_andamento",
    observacoes: "Aguardando confirmação",
  },
];

const META_MENSAL = 100000;

const STATUS_CONFIG = {
  pago: {
    label: "Pago",
    color: "#10b981",
    bg: "rgba(16,185,129,0.15)",
    icon: "✓",
  },
  em_andamento: {
    label: "Em Andamento",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    icon: "▶",
  },
  atrasado: {
    label: "Atrasado",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    icon: "!",
  },
};

function diasParaVencimento(dataStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataStr);
  venc.setHours(0, 0, 0, 0);
  return Math.round((venc - hoje) / (1000 * 60 * 60 * 24));
}

function formatCurrency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function AlertaBadge({ acordo }) {
  const dias = diasParaVencimento(acordo.vencimento);
  if (acordo.status === "pago") return null;
  if (dias < 0)
    return (
      <span
        style={{
          background: "#ef4444",
          color: "#fff",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        ATRASADO
      </span>
    );
  if (dias <= 2)
    return (
      <span
        style={{
          background: "#f59e0b",
          color: "#fff",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        VENCE EM BREVE
      </span>
    );
  return null;
}

const emptyForm = {
  cliente: "",
  telefone: "",
  valor: "",
  parcelas: "",
  parcelasPagas: "0",
  vencimento: "",
  status: "em_andamento",
  observacoes: "",
};

export default function App() {
  const [acordos, setAcordos] = useState(MOCK_ACORDOS);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detalhe, setDetalhe] = useState(null);
  const [alertas, setAlertas] = useState(true);
  const [tab, setTab] = useState("acordos");
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const urgentes = acordos.filter((a) => {
      if (a.status === "pago") return false;
      const d = diasParaVencimento(a.vencimento);
      return d <= 2;
    });
    if (urgentes.length > 0) {
      setNotifs(
        urgentes.map((a) => {
          const d = diasParaVencimento(a.vencimento);
          return {
            id: a.id,
            msg:
              d < 0
                ? `${a.cliente} está ${Math.abs(d)} dia(s) em atraso!`
                : `${a.cliente} vence em ${d} dia(s)!`,
            tipo: d < 0 ? "atrasado" : "urgente",
          };
        })
      );
    }
  }, [acordos]);

  const acordosFiltrados = useMemo(() => {
    return acordos
      .filter((a) => {
        const matchFiltro = filtro === "todos" || a.status === filtro;
        const matchBusca =
          a.cliente.toLowerCase().includes(busca.toLowerCase()) ||
          a.telefone.includes(busca);
        return matchFiltro && matchBusca;
      })
      .sort((a, b) => {
        if (a.status === "atrasado" && b.status !== "atrasado") return -1;
        if (b.status === "atrasado" && a.status !== "atrasado") return 1;
        return new Date(a.vencimento) - new Date(b.vencimento);
      });
  }, [acordos, filtro, busca]);

  const stats = useMemo(() => {
    const total = acordos.length;
    const pagos = acordos.filter((a) => a.status === "pago").length;
    const atrasados = acordos.filter((a) => a.status === "atrasado").length;
    const emAndamento = acordos.filter(
      (a) => a.status === "em_andamento"
    ).length;
    const valorTotal = acordos.reduce((s, a) => s + a.valor, 0);
    const valorRecebido = acordos
      .filter((a) => a.status === "pago")
      .reduce((s, a) => s + a.valor, 0);
    const valorAtrasado = acordos
      .filter((a) => a.status === "atrasado")
      .reduce((s, a) => s + a.valor, 0);
    const progressoMeta = Math.min((valorRecebido / META_MENSAL) * 100, 100);
    return {
      total,
      pagos,
      atrasados,
      emAndamento,
      valorTotal,
      valorRecebido,
      valorAtrasado,
      progressoMeta,
    };
  }, [acordos]);

  function abrirNovo() {
    setEditando(null);
    setForm(emptyForm);
    setModal(true);
  }

  function abrirEditar(a) {
    setEditando(a.id);
    setForm({
      ...a,
      valor: String(a.valor),
      parcelas: String(a.parcelas),
      parcelasPagas: String(a.parcelasPagas),
    });
    setModal(true);
  }

  function salvar() {
    if (!form.cliente || !form.valor || !form.vencimento) return;
    const novo = {
      ...form,
      id: editando || Date.now(),
      valor: parseFloat(form.valor),
      parcelas: parseInt(form.parcelas) || 1,
      parcelasPagas: parseInt(form.parcelasPagas) || 0,
    };
    if (editando) {
      setAcordos((prev) => prev.map((a) => (a.id === editando ? novo : a)));
    } else {
      setAcordos((prev) => [...prev, novo]);
    }
    setModal(false);
  }

  function excluir(id) {
    if (window.confirm("Remover este acordo?"))
      setAcordos((prev) => prev.filter((a) => a.id !== id));
  }

  function marcarPago(id) {
    setAcordos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "pago" } : a))
    );
  }

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#060e1f",
      color: "#e2e8f0",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 0,
    },
    sidebar: {
      width: 220,
      background: "linear-gradient(180deg, #0a1628 0%, #061022 100%)",
      borderRight: "1px solid rgba(59,130,246,0.15)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      zIndex: 100,
    },
    logo: {
      padding: "0 24px 28px",
      borderBottom: "1px solid rgba(59,130,246,0.15)",
    },
    logoText: {
      fontSize: 18,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: -0.5,
    },
    logoSub: {
      fontSize: 11,
      color: "#4a7fc1",
      marginTop: 2,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "11px 24px",
      cursor: "pointer",
      color: active ? "#60a5fa" : "#8ba8cc",
      background: active ? "rgba(59,130,246,0.1)" : "transparent",
      borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      transition: "all 0.2s",
      userSelect: "none",
    }),
    main: { marginLeft: 220, padding: "32px 36px", minHeight: "100vh" },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 28,
    },
    pageTitle: {
      fontSize: 26,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: -1,
    },
    btn: (variant = "primary") => ({
      padding: variant === "sm" ? "6px 14px" : "10px 20px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: variant === "sm" ? 12 : 14,
      background:
        variant === "primary"
          ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
          : variant === "danger"
          ? "rgba(239,68,68,0.15)"
          : variant === "success"
          ? "rgba(16,185,129,0.15)"
          : "rgba(59,130,246,0.1)",
      color:
        variant === "primary"
          ? "#fff"
          : variant === "danger"
          ? "#f87171"
          : variant === "success"
          ? "#34d399"
          : "#60a5fa",
      transition: "all 0.2s",
    }),
    card: {
      background: "linear-gradient(135deg, #0d1b33 0%, #091425 100%)",
      border: "1px solid rgba(59,130,246,0.15)",
      borderRadius: 14,
      padding: 20,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 24,
    },
    statCard: (color) => ({
      background: `linear-gradient(135deg, rgba(${color},0.12) 0%, rgba(${color},0.05) 100%)`,
      border: `1px solid rgba(${color},0.25)`,
      borderRadius: 14,
      padding: "18px 20px",
    }),
    statValue: {
      fontSize: 28,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: -1,
      lineHeight: 1.1,
    },
    statLabel: {
      fontSize: 12,
      color: "#64748b",
      marginTop: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    metaCard: {
      background: "linear-gradient(135deg, #0d1f3c 0%, #091830 100%)",
      border: "1px solid rgba(59,130,246,0.2)",
      borderRadius: 14,
      padding: 24,
      marginBottom: 24,
    },
    progressBar: {
      height: 10,
      background: "rgba(59,130,246,0.15)",
      borderRadius: 99,
      overflow: "hidden",
      margin: "12px 0 8px",
    },
    progressFill: (pct) => ({
      height: "100%",
      width: `${pct}%`,
      background:
        pct >= 100
          ? "linear-gradient(90deg,#10b981,#34d399)"
          : pct >= 60
          ? "linear-gradient(90deg,#3b82f6,#60a5fa)"
          : "linear-gradient(90deg,#f59e0b,#fbbf24)",
      borderRadius: 99,
      transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
    }),
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 6px",
    },
    th: {
      padding: "10px 14px",
      textAlign: "left",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      color: "#475569",
      fontWeight: 600,
    },
    tr: (status) => ({
      background:
        status === "atrasado"
          ? "rgba(239,68,68,0.06)"
          : status === "pago"
          ? "rgba(16,185,129,0.04)"
          : "rgba(59,130,246,0.04)",
      borderRadius: 10,
      cursor: "pointer",
      transition: "background 0.15s",
    }),
    td: {
      padding: "13px 14px",
      fontSize: 14,
      color: "#cbd5e1",
      verticalAlign: "middle",
    },
    tdFirst: { borderRadius: "10px 0 0 10px" },
    tdLast: { borderRadius: "0 10px 10px 0" },
    statusBadge: (s) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: STATUS_CONFIG[s].bg,
      color: STATUS_CONFIG[s].color,
    }),
    filterBar: {
      display: "flex",
      gap: 8,
      marginBottom: 20,
      flexWrap: "wrap",
      alignItems: "center",
    },
    filterBtn: (active) => ({
      padding: "7px 16px",
      borderRadius: 8,
      border: `1px solid ${active ? "#3b82f6" : "rgba(59,130,246,0.2)"}`,
      background: active ? "rgba(59,130,246,0.15)" : "transparent",
      color: active ? "#60a5fa" : "#64748b",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    searchInput: {
      padding: "8px 14px",
      borderRadius: 8,
      border: "1px solid rgba(59,130,246,0.2)",
      background: "rgba(15,30,55,0.8)",
      color: "#e2e8f0",
      fontSize: 14,
      width: 220,
      outline: "none",
    },
    modal: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)",
    },
    modalBox: {
      background: "#0d1b33",
      border: "1px solid rgba(59,130,246,0.25)",
      borderRadius: 18,
      padding: 32,
      width: 480,
      maxHeight: "90vh",
      overflowY: "auto",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid rgba(59,130,246,0.2)",
      background: "rgba(6,14,31,0.8)",
      color: "#e2e8f0",
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box",
      marginTop: 4,
    },
    label: {
      fontSize: 12,
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: 600,
    },
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
    notifBanner: {
      background:
        "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.1))",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 12,
      padding: "12px 18px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    detalheModal: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)",
    },
    detalheBox: {
      background: "#0d1b33",
      border: "1px solid rgba(59,130,246,0.25)",
      borderRadius: 18,
      padding: 32,
      width: 420,
    },
  };

  const navItems = [
    { key: "dashboard", icon: "▦", label: "Dashboard" },
    { key: "acordos", icon: "≡", label: "Acordos" },
    { key: "alertas", icon: "🔔", label: "Alertas", badge: notifs.length },
    { key: "meta", icon: "◎", label: "Minha Meta" },
  ];

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoText}>CobrançaPRO</div>
          <div style={styles.logoSub}>Sistema de acompanhamento de Acordos</div>
        </div>
        <div style={{ padding: "16px 0", flex: 1 }}>
          {navItems.map((n) => (
            <div
              key={n.key}
              style={styles.navItem(tab === n.key)}
              onClick={() => setTab(n.key)}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.badge > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: 99,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {n.badge}
                </span>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(59,130,246,0.1)",
          }}
        >
          <div style={{ fontSize: 11, color: "#334155" }}>Meta do mês</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#3b82f6" }}>
            {formatCurrency(META_MENSAL)}
          </div>
          <div
            style={{
              height: 4,
              background: "rgba(59,130,246,0.15)",
              borderRadius: 99,
              marginTop: 6,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${stats.progressoMeta}%`,
                background: "linear-gradient(90deg,#3b82f6,#60a5fa)",
                borderRadius: 99,
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 4 }}>
            {stats.progressoMeta.toFixed(0)}% atingido
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <>
            <div style={styles.header}>
              <div>
                <div style={styles.pageTitle}>Dashboard</div>
                <div style={{ color: "#4a7fc1", fontSize: 14, marginTop: 2 }}>
                  Visão geral dos seus acordos
                </div>
              </div>
              <button style={styles.btn()} onClick={abrirNovo}>
                + Novo Acordo
              </button>
            </div>

            {notifs.length > 0 && alertas && (
              <div style={styles.notifBanner}>
                <div>
                  <span
                    style={{ fontWeight: 700, color: "#f87171", fontSize: 14 }}
                  >
                    {notifs.length} acordo(s) precisam de atenção!
                  </span>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                    {notifs
                      .slice(0, 2)
                      .map((n) => n.msg)
                      .join(" | ")}
                  </div>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                  onClick={() => setAlertas(false)}
                >
                  ×
                </button>
              </div>
            )}

            <div style={styles.statsGrid}>
              {[
                {
                  label: "Total de Acordos",
                  value: stats.total,
                  color: "59,130,246",
                  icon: "📋",
                },
                {
                  label: "Pagos",
                  value: stats.pagos,
                  color: "16,185,129",
                  icon: "✓",
                },
                {
                  label: "Em Andamento",
                  value: stats.emAndamento,
                  color: "59,130,246",
                  icon: "▶",
                },
                {
                  label: "Atrasados",
                  value: stats.atrasados,
                  color: "239,68,68",
                  icon: "!",
                },
              ].map((s, i) => (
                <div key={i} style={styles.statCard(s.color)}>
                  <div style={{ fontSize: 28, opacity: 0.4 }}>{s.icon}</div>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div style={styles.metaCard}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#4a7fc1",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontWeight: 600,
                      }}
                    >
                      META MENSAL
                    </div>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: -1,
                        marginTop: 4,
                      }}
                    >
                      {formatCurrency(META_MENSAL)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      Arrecadado
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#10b981",
                      }}
                    >
                      {formatCurrency(stats.valorRecebido)}
                    </div>
                  </div>
                </div>
                <div style={styles.progressBar}>
                  <div style={styles.progressFill(stats.progressoMeta)} />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#3b82f6", fontWeight: 700 }}>
                    {stats.progressoMeta.toFixed(1)}% da meta
                  </span>
                  <span style={{ color: "#64748b" }}>
                    Faltam{" "}
                    {formatCurrency(
                      Math.max(0, META_MENSAL - stats.valorRecebido)
                    )}
                  </span>
                </div>
              </div>
              <div style={styles.card}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#4a7fc1",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  Resumo Financeiro
                </div>
                {[
                  {
                    label: "Volume Total",
                    value: stats.valorTotal,
                    color: "#60a5fa",
                  },
                  {
                    label: "Recebido",
                    value: stats.valorRecebido,
                    color: "#10b981",
                  },
                  {
                    label: "Em Aberto",
                    value:
                      stats.valorTotal -
                      stats.valorRecebido -
                      stats.valorAtrasado,
                    color: "#60a5fa",
                  },
                  {
                    label: "Atrasado",
                    value: stats.valorAtrasado,
                    color: "#ef4444",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "7px 0",
                      borderBottom:
                        i < 3 ? "1px solid rgba(59,130,246,0.08)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#64748b" }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: item.color,
                      }}
                    >
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acordos urgentes */}
            <div style={styles.card}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                Acordos Urgentes
              </div>
              {acordos.filter(
                (a) =>
                  a.status !== "pago" && diasParaVencimento(a.vencimento) <= 3
              ).length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 14 }}>
                  Nenhum acordo urgente no momento.
                </div>
              ) : (
                acordos
                  .filter(
                    (a) =>
                      a.status !== "pago" &&
                      diasParaVencimento(a.vencimento) <= 3
                  )
                  .map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid rgba(59,130,246,0.08)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#e2e8f0",
                            fontSize: 14,
                          }}
                        >
                          {a.cliente}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {a.telefone} · {formatDate(a.vencimento)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#ef4444" }}>
                          {formatCurrency(a.valor)}
                        </div>
                        <AlertaBadge acordo={a} />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {/* Acordos Tab */}
        {tab === "acordos" && (
          <>
            <div style={styles.header}>
              <div>
                <div style={styles.pageTitle}>Acordos</div>
                <div style={{ color: "#4a7fc1", fontSize: 14, marginTop: 2 }}>
                  {acordosFiltrados.length} de {acordos.length} acordos
                </div>
              </div>
              <button style={styles.btn()} onClick={abrirNovo}>
                + Novo Acordo
              </button>
            </div>
            <div style={styles.filterBar}>
              {["todos", "em_andamento", "atrasado", "pago"].map((f) => (
                <button
                  key={f}
                  style={styles.filterBtn(filtro === f)}
                  onClick={() => setFiltro(f)}
                >
                  {f === "todos" ? "Todos" : STATUS_CONFIG[f].label}
                </button>
              ))}
              <input
                style={styles.searchInput}
                placeholder="Buscar cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {[
                      "Cliente",
                      "Valor",
                      "Parcelas",
                      "Vencimento",
                      "Status",
                      "Alerta",
                      "Ações",
                    ].map((h) => (
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {acordosFiltrados.map((a) => (
                    <tr
                      key={a.id}
                      style={styles.tr(a.status)}
                      onClick={() => setDetalhe(a)}
                    >
                      <td style={{ ...styles.td, ...styles.tdFirst }}>
                        <div style={{ fontWeight: 600, color: "#e2e8f0" }}>
                          {a.cliente}
                        </div>
                        <div style={{ fontSize: 12, color: "#475569" }}>
                          {a.telefone}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 700, color: "#60a5fa" }}>
                          {formatCurrency(a.valor)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: 13 }}>
                          {a.parcelasPagas}/{a.parcelas}
                        </div>
                        <div
                          style={{
                            height: 3,
                            background: "rgba(59,130,246,0.15)",
                            borderRadius: 99,
                            marginTop: 4,
                            width: 50,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(a.parcelasPagas / a.parcelas) * 100}%`,
                              background: "#3b82f6",
                              borderRadius: 99,
                            }}
                          />
                        </div>
                      </td>
                      <td style={styles.td}>{formatDate(a.vencimento)}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(a.status)}>
                          {STATUS_CONFIG[a.status].icon}{" "}
                          {STATUS_CONFIG[a.status].label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <AlertaBadge acordo={a} />
                      </td>
                      <td
                        style={{ ...styles.td, ...styles.tdLast }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: "flex", gap: 6 }}>
                          {a.status !== "pago" && (
                            <button
                              style={styles.btn("success")}
                              onClick={() => marcarPago(a.id)}
                            >
                              ✓ Pago
                            </button>
                          )}
                          <button
                            style={styles.btn("secondary")}
                            onClick={() => abrirEditar(a)}
                          >
                            ✎
                          </button>
                          <button
                            style={styles.btn("danger")}
                            onClick={() => excluir(a.id)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {acordosFiltrados.length === 0 && (
                <div
                  style={{ padding: 40, textAlign: "center", color: "#475569" }}
                >
                  Nenhum acordo encontrado.
                </div>
              )}
            </div>
          </>
        )}

        {/* Alertas Tab */}
        {tab === "alertas" && (
          <>
            <div style={styles.header}>
              <div style={styles.pageTitle}>🔔 Central de Alertas</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {acordos
                .filter((a) => a.status !== "pago")
                .map((a) => {
                  const dias = diasParaVencimento(a.vencimento);
                  let tipo =
                    dias < 0
                      ? "atrasado"
                      : dias <= 2
                      ? "urgente"
                      : dias <= 7
                      ? "proximo"
                      : null;
                  if (!tipo) return null;
                  return (
                    <div
                      key={a.id}
                      style={{
                        ...styles.card,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderColor:
                          tipo === "atrasado"
                            ? "rgba(239,68,68,0.3)"
                            : tipo === "urgente"
                            ? "rgba(245,158,11,0.3)"
                            : "rgba(59,130,246,0.2)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: 28 }}>
                          {tipo === "atrasado"
                            ? "⚠️"
                            : tipo === "urgente"
                            ? "⏰"
                            : "📅"}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#fff",
                              fontSize: 15,
                            }}
                          >
                            {a.cliente}
                          </div>
                          <div style={{ fontSize: 13, color: "#64748b" }}>
                            {a.telefone} · Venc: {formatDate(a.vencimento)}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color:
                                tipo === "atrasado"
                                  ? "#ef4444"
                                  : tipo === "urgente"
                                  ? "#f59e0b"
                                  : "#60a5fa",
                              marginTop: 2,
                              fontWeight: 600,
                            }}
                          >
                            {tipo === "atrasado"
                              ? `⚠ ${Math.abs(dias)} dia(s) em ATRASO`
                              : tipo === "urgente"
                              ? `⏰ Vence em ${dias} dia(s)`
                              : `📅 Próximo vencimento`}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#60a5fa",
                            fontSize: 16,
                          }}
                        >
                          {formatCurrency(a.valor)}
                        </div>
                        <button
                          style={{ ...styles.btn("success"), marginTop: 8 }}
                          onClick={() => marcarPago(a.id)}
                        >
                          Marcar Pago
                        </button>
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)}
              {acordos.filter(
                (a) =>
                  a.status !== "pago" && diasParaVencimento(a.vencimento) <= 7
              ).length === 0 && (
                <div
                  style={{
                    ...styles.card,
                    textAlign: "center",
                    padding: 60,
                    color: "#64748b",
                  }}
                >
                  <div style={{ fontSize: 40 }}>🎉</div>
                  <div style={{ fontSize: 16, marginTop: 12 }}>
                    Nenhum alerta no momento!
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Meta Tab */}
        {tab === "meta" && (
          <>
            <div style={styles.header}>
              <div style={styles.pageTitle}>◎ Minha Meta Mensal</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 24,
              }}
            >
              <div style={{ ...styles.metaCard, gridColumn: "1 / -1" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#4a7fc1",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 600,
                    }}
                  >
                    META DO MÊS
                  </div>
                  <div
                    style={{
                      fontSize: 52,
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: -2,
                      margin: "8px 0",
                    }}
                  >
                    {formatCurrency(META_MENSAL)}
                  </div>
                  <div
                    style={{ fontSize: 18, color: "#10b981", fontWeight: 600 }}
                  >
                    Arrecadado: {formatCurrency(stats.valorRecebido)}
                  </div>
                </div>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#64748b" }}>Progresso</span>
                    <span style={{ color: "#60a5fa", fontWeight: 700 }}>
                      {stats.progressoMeta.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ ...styles.progressBar, height: 20 }}>
                    <div
                      style={{
                        ...styles.progressFill(stats.progressoMeta),
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {stats.progressoMeta >= 20 &&
                        `${stats.progressoMeta.toFixed(0)}%`}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginTop: 8,
                    }}
                  >
                    <span style={{ color: "#64748b" }}>R$ 0</span>
                    <span
                      style={{
                        color:
                          stats.progressoMeta >= 100 ? "#10b981" : "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {stats.progressoMeta >= 100
                        ? "🎉 META BATIDA!"
                        : `Faltam ${formatCurrency(
                            META_MENSAL - stats.valorRecebido
                          )}`}
                    </span>
                    <span style={{ color: "#64748b" }}>
                      {formatCurrency(META_MENSAL)}
                    </span>
                  </div>
                </div>
              </div>
              {[
                {
                  label: "Acordos Pagos",
                  value: stats.pagos,
                  sub: `de ${stats.total} totais`,
                  color: "16,185,129",
                  icon: "✓",
                },
                {
                  label: "Volume Arrecadado",
                  value: formatCurrency(stats.valorRecebido),
                  sub: "no período",
                  color: "59,130,246",
                  icon: "$",
                },
                {
                  label: "A Receber",
                  value: formatCurrency(stats.valorTotal - stats.valorRecebido),
                  sub: "acordos em aberto",
                  color: "245,158,11",
                  icon: "💰",
                },
                {
                  label: "Em Atraso",
                  value: formatCurrency(stats.valorAtrasado),
                  sub: `${stats.atrasados} acordo(s)`,
                  color: "239,68,68",
                  icon: "!",
                },
              ].map((s, i) => (
                <div key={i} style={styles.statCard(s.color)}>
                  <div style={{ fontSize: 32, opacity: 0.3 }}>{s.icon}</div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#fff",
                      marginTop: 4,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Novo/Editar */}
      {modal && (
        <div style={styles.modal} onClick={() => setModal(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                marginBottom: 24,
              }}
            >
              {editando ? "✎ Editar Acordo" : "+ Novo Acordo"}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={styles.label}>Nome do Cliente *</div>
                <input
                  style={styles.input}
                  value={form.cliente}
                  onChange={(e) =>
                    setForm({ ...form, cliente: e.target.value })
                  }
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div style={styles.formRow}>
                <div>
                  <div style={styles.label}>Telefone</div>
                  <input
                    style={styles.input}
                    value={form.telefone}
                    onChange={(e) =>
                      setForm({ ...form, telefone: e.target.value })
                    }
                    placeholder="(11) 9xxxx-xxxx"
                  />
                </div>
                <div>
                  <div style={styles.label}>Valor do Acordo *</div>
                  <input
                    style={styles.input}
                    type="number"
                    value={form.valor}
                    onChange={(e) =>
                      setForm({ ...form, valor: e.target.value })
                    }
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div>
                  <div style={styles.label}>Nº de Parcelas</div>
                  <input
                    style={styles.input}
                    type="number"
                    value={form.parcelas}
                    onChange={(e) =>
                      setForm({ ...form, parcelas: e.target.value })
                    }
                    placeholder="1"
                  />
                </div>
                <div>
                  <div style={styles.label}>Parcelas Pagas</div>
                  <input
                    style={styles.input}
                    type="number"
                    value={form.parcelasPagas}
                    onChange={(e) =>
                      setForm({ ...form, parcelasPagas: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div>
                  <div style={styles.label}>Data de Vencimento *</div>
                  <input
                    style={styles.input}
                    type="date"
                    value={form.vencimento}
                    onChange={(e) =>
                      setForm({ ...form, vencimento: e.target.value })
                    }
                  />
                </div>
                <div>
                  <div style={styles.label}>Status</div>
                  <select
                    style={styles.input}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="em_andamento">Em Andamento</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
              </div>
              <div>
                <div style={styles.label}>Observações</div>
                <textarea
                  style={{ ...styles.input, height: 70, resize: "vertical" }}
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm({ ...form, observacoes: e.target.value })
                  }
                  placeholder="Notas sobre o acordo..."
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  style={styles.btn("secondary")}
                  onClick={() => setModal(false)}
                >
                  Cancelar
                </button>
                <button style={styles.btn()} onClick={salvar}>
                  Salvar Acordo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhe */}
      {detalhe && (
        <div style={styles.detalheModal} onClick={() => setDetalhe(null)}>
          <div style={styles.detalheBox} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
                {detalhe.cliente}
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: 20,
                }}
                onClick={() => setDetalhe(null)}
              >
                ×
              </button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { label: "Telefone", value: detalhe.telefone || "—" },
                {
                  label: "Valor do Acordo",
                  value: formatCurrency(detalhe.valor),
                  highlight: true,
                },
                {
                  label: "Parcelas",
                  value: `${detalhe.parcelasPagas} pagas de ${detalhe.parcelas}`,
                },
                { label: "Vencimento", value: formatDate(detalhe.vencimento) },
                {
                  label: "Status",
                  value: STATUS_CONFIG[detalhe.status].label,
                  badge: detalhe.status,
                },
                { label: "Observações", value: detalhe.observacoes || "—" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(59,130,246,0.08)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span style={styles.statusBadge(item.badge)}>
                      {item.value}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: item.highlight ? 700 : 500,
                        color: item.highlight ? "#60a5fa" : "#cbd5e1",
                      }}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              {detalhe.status !== "pago" && (
                <button
                  style={{ ...styles.btn("success"), flex: 1 }}
                  onClick={() => {
                    marcarPago(detalhe.id);
                    setDetalhe(null);
                  }}
                >
                  ✓ Marcar como Pago
                </button>
              )}
              <button
                style={{ ...styles.btn("secondary"), flex: 1 }}
                onClick={() => {
                  abrirEditar(detalhe);
                  setDetalhe(null);
                }}
              >
                ✎ Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
