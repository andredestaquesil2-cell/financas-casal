// ============================================================================
// PLANILHA INTELIGENTE DO CASAL — CONTROLE DE GASTOS + AGENTE DE IA (iOS)
// ============================================================================

const STORAGE_KEY = 'planilha_casal_v1';

const DEFAULT_CATEGORIES = [
  {
    id: 'alimentacao',
    name: 'Alimentação',
    icon: '🍔',
    budget: 1800,
    defaultSplit: 'default',
    desc: 'Supermercado, feira, padaria, restaurantes e delivery (iFood)'
  },
  {
    id: 'lazer',
    name: 'Lazer',
    icon: '🎉',
    budget: 900,
    defaultSplit: '50_50',
    desc: 'Passeios, cinema, bares, viagens, streaming e saídas do casal'
  },
  {
    id: 'transporte',
    name: 'Transporte',
    icon: '🚗',
    budget: 850,
    defaultSplit: 'default',
    desc: 'Combustível, Uber/99, estacionamento, pedágio e manutenção'
  },
  {
    id: 'moradia',
    name: 'Moradia & Fixos',
    icon: '🏠',
    budget: 2600,
    defaultSplit: 'proportional',
    desc: 'Aluguel/financiamento, condomínio, energia, água, gás e internet'
  },
  {
    id: 'saude',
    name: 'Saúde & Bem-Estar',
    icon: '💊',
    budget: 600,
    defaultSplit: 'default',
    desc: 'Farmácia, plano de saúde, exames, consultas e academia'
  },
  {
    id: 'compras',
    name: 'Compras & Pessoal',
    icon: '🛍️',
    budget: 750,
    defaultSplit: 'default',
    desc: 'Roupas, presentes, utensílios para casa e gastos individuais'
  }
];

const LOCAL_AI_KEYWORDS = [
  {
    category: 'alimentacao',
    keywords: [
      'ifood', 'ifd*', 'rappi', 'ze delivery', 'aiqfome', 'mercado', 'supermercado',
      'hipermercado', 'atacadao', 'assai', 'carrefour', 'pao de acucar', 'extra',
      'condor', 'muffato', 'angeloni', 'zafari', 'guanabara', 'padaria', 'panificadora',
      'acougue', 'hortifruti', 'restaurante', 'lanchonete', 'burger', 'mcdonalds',
      'burger king', 'subway', 'kfc', 'madero', 'coco bambu', 'sushi', 'pizzaria',
      'pizza', 'churrascaria', 'cafeteria', 'starbucks', 'cafe'
    ]
  },
  {
    category: 'lazer',
    keywords: [
      'cinema', 'cinemark', 'cinepolis', 'uci', 'ingresso', 'sympla', 'netflix',
      'spotify', 'disney', 'prime video', 'hbo', 'max', 'apple.com/bill', 'youtube',
      'globoplay', 'steam', 'playstation', 'xbox', 'bar ', 'pub ', 'cervejaria',
      'outback', 'hotel', 'airbnb', 'booking', 'decolar', 'latam', 'gol ', 'azul ',
      'viagem', 'parque', 'passeio'
    ]
  },
  {
    category: 'transporte',
    keywords: [
      'uber', '99app', '99*', '99 pop', 'taxi', 'posto', 'combustivel', 'gasolina',
      'etanol', 'ipiranga', 'shell', 'petrobras', 'br mania', 'sem parar', 'veloe',
      'conectcar', 'pedagio', 'estacionamento', 'estapar', 'oficina', 'pneu', 'ipva'
    ]
  },
  {
    category: 'moradia',
    keywords: [
      'aluguel', 'condominio', 'energia', 'eletrica', 'enel', 'cpfl', 'copel',
      'cemig', 'light', 'celesc', 'sabesp', 'sanepar', 'copasa', 'agua', 'comgas',
      'ultragaz', 'gas ', 'vivo', 'claro', 'tim ', 'internet', 'fibra', 'iptu',
      'leroy merlin'
    ]
  },
  {
    category: 'saude',
    keywords: [
      'farmacia', 'drogaria', 'droga raia', 'drogasil', 'pague menos', 'panvel',
      'pacheco', 'araujo', 'nissei', 'ultrafarma', 'unimed', 'amil', 'sulamerica',
      'hospital', 'clinica', 'laboratorio', 'consulta', 'medico', 'dentista',
      'academia', 'smartfit', 'smart fit', 'bluefit', 'totalpass', 'gympass', 'wellhub'
    ]
  },
  {
    category: 'compras',
    keywords: [
      'amazon', 'mercado livre', 'mercadolivre', 'meli', 'shopee', 'shein', 'aliexpress',
      'magalu', 'casas bahia', 'kabum', 'renner', 'riachuelo', 'cea', 'c&a', 'zara',
      'centauro', 'nike', 'adidas', 'sephora', 'boticario', 'natura', 'americanas',
      'shopping', 'presente', 'roupa', 'petz', 'cobasi'
    ]
  }
];

function getInitialMonthStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function createDemoExpenses(monthStr) {
  return [
    {
      id: 'exp_1',
      date: `${monthStr}-05`,
      desc: 'Aluguel + Condomínio',
      category: 'moradia',
      amount: 2100.00,
      paidBy: 'p1',
      splitMode: 'proportional',
      customVal: 60,
      isFixed: true
    },
    {
      id: 'exp_2',
      date: `${monthStr}-07`,
      desc: 'Conta de Luz e Internet Fibra',
      category: 'moradia',
      amount: 340.00,
      paidBy: 'p2',
      splitMode: 'default',
      customVal: 50,
      isFixed: true
    },
    {
      id: 'exp_3',
      date: `${monthStr}-08`,
      desc: 'Compra do Mês no Supermercado',
      category: 'alimentacao',
      amount: 980.50,
      paidBy: 'p1',
      splitMode: 'default',
      customVal: 50,
      isFixed: false
    },
    {
      id: 'exp_4',
      date: `${monthStr}-10`,
      desc: 'Jantar Especial de Fim de Semana',
      category: 'lazer',
      amount: 260.00,
      paidBy: 'p2',
      splitMode: '50_50',
      customVal: 50,
      isFixed: false
    },
    {
      id: 'exp_5',
      date: `${monthStr}-12`,
      desc: 'Abastecimento Tanque Cheio',
      category: 'transporte',
      amount: 310.00,
      paidBy: 'p1',
      splitMode: 'custom_pct',
      customVal: 70,
      isFixed: false
    },
    {
      id: 'exp_6',
      date: `${monthStr}-14`,
      desc: 'iFood - Pizza + Refrigerante',
      category: 'alimentacao',
      amount: 128.90,
      paidBy: 'p2',
      splitMode: '50_50',
      customVal: 50,
      isFixed: false
    },
    {
      id: 'exp_7',
      date: `${monthStr}-15`,
      desc: 'Cinema + Pipoca',
      category: 'lazer',
      amount: 145.00,
      paidBy: 'p1',
      splitMode: '50_50',
      customVal: 50,
      isFixed: false
    },
    {
      id: 'exp_8',
      date: `${monthStr}-16`,
      desc: 'Farmácia (Remédios e Vitaminas)',
      category: 'saude',
      amount: 185.00,
      paidBy: 'p2',
      splitMode: 'default',
      customVal: 50,
      isFixed: false
    },
    {
      id: 'exp_9',
      date: `${monthStr}-18`,
      desc: 'Uber para Evento',
      category: 'transporte',
      amount: 64.50,
      paidBy: 'p2',
      splitMode: '50_50',
      customVal: 50,
      isFixed: false
    },
    {
      id: 'exp_10',
      date: `${monthStr}-19`,
      desc: 'Presente Pessoal (No cartão de André, 100% dela)',
      category: 'compras',
      amount: 220.00,
      paidBy: 'p1',
      splitMode: '100_p2',
      customVal: 0,
      isFixed: false
    }
  ];
}

// Estado Global da Aplicação
let state = {
  theme: 'dark',
  pierreThemeMigrated: true,
  currentMonth: getInitialMonthStr(),
  activeTab: 'all', // 'all', 'dashboard', 'ai_agent', ou id da categoria
  couple: {
    p1Name: 'André',
    p1Income: 6000,
    p2Name: 'Esposa',
    p2Income: 4000,
    globalSplitMode: '50_50',
    globalCustomPctP1: 60
  },
  aiConfig: {
    cardDigitsP1: '1234',
    cardDigitsP2: '9876',
    geminiApiKey: '',
    customRules: [
      { id: 'r1', keyword: 'posto', category: 'transporte', splitMode: 'custom_pct', customVal: 70 },
      { id: 'r2', keyword: 'ipiranga', category: 'transporte', splitMode: 'custom_pct', customVal: 70 },
      { id: 'r3', keyword: 'sephora', category: 'compras', splitMode: '100_p2', customVal: 0 }
    ]
  },
  aiLogs: [],
  categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
  expensesByMonth: {}
};

let serverConnected = false;
const DEFAULT_CLOUD_TOPIC = 'casal_gastos_andre_esposa_8492a7';
let serverWebhookUrl = `https://ntfy.sh/${DEFAULT_CLOUD_TOPIC}`;

// Carregar do localStorage e sincronizar com Servidor Node (se ativo)
async function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      mergeState(parsed);
    } else {
      const m = state.currentMonth;
      state.expensesByMonth[m] = createDemoExpenses(m);
      saveState();
    }
  } catch (err) {
    console.error('Erro ao carregar dados locais:', err);
  }

  // Tenta conectar ao servidor local (server.js) se estiver em localhost; se estiver no site online (GitHub Pages), sincroniza direto da nuvem!
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname.startsWith('192.168.');
  if (isLocalhost) {
    try {
      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const st = await statusRes.json();
        serverConnected = true;
        if (st.cloudWebhookUrl) serverWebhookUrl = st.cloudWebhookUrl;

        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const sr = await stateRes.json();
          if (sr.state && sr.state.expensesByMonth) {
            mergeState(sr.state);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          } else {
            await fetch('/api/state', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ state })
            });
          }
        }
        renderAll();
        return;
      }
    } catch (e) {}
  }

  // Hospedado na nuvem (GitHub Pages / HTTPS) ou aberto direto: sincroniza direto da fila ntfy.sh no navegador!
  serverConnected = false;
  await syncCloudDirectlyInBrowser();
}

function mergeState(parsed) {
  const nextTheme = parsed.pierreThemeMigrated ? (parsed.theme || 'dark') : 'dark';
  state = {
    ...state,
    ...parsed,
    theme: nextTheme,
    pierreThemeMigrated: true,
    couple: { ...state.couple, ...(parsed.couple || {}) },
    aiConfig: {
      ...state.aiConfig,
      ...(parsed.aiConfig || {}),
      customRules: parsed.aiConfig?.customRules || state.aiConfig.customRules
    },
    processedCloudIds: Array.isArray(parsed.processedCloudIds) ? parsed.processedCloudIds : (state.processedCloudIds || []),
    aiLogs: Array.isArray(parsed.aiLogs) ? parsed.aiLogs : state.aiLogs,
    categories: parsed.categories && parsed.categories.length ? parsed.categories : DEFAULT_CATEGORIES,
    expensesByMonth: parsed.expensesByMonth || {}
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (serverConnected) {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Erro ao salvar dados locais:', err);
  }
}

// ============================================================================
// FUNÇÕES DE CÁLCULO DE DIVISÃO E PORCENTAGEM
// ============================================================================

function formatBRL(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function clamp(n, min, max) {
  return Math.min(Math.max(Number(n) || 0, min), max);
}

function getProportionalP1Pct() {
  const inc1 = Math.max(0, Number(state.couple.p1Income) || 0);
  const inc2 = Math.max(0, Number(state.couple.p2Income) || 0);
  const total = inc1 + inc2;
  if (total <= 0) return 50;
  return Number(((inc1 / total) * 100).toFixed(1));
}

function getGlobalDefaultP1Pct() {
  const mode = state.couple.globalSplitMode;
  if (mode === '50_50') return 50;
  if (mode === 'proportional') return getProportionalP1Pct();
  if (mode === 'custom') return clamp(state.couple.globalCustomPctP1, 0, 100);
  return 50;
}

function getCategoryDefaultP1Pct(catId) {
  const cat = state.categories.find(c => c.id === catId);
  if (!cat || !cat.defaultSplit || cat.defaultSplit === 'default') {
    return getGlobalDefaultP1Pct();
  }
  if (cat.defaultSplit === '50_50') return 50;
  if (cat.defaultSplit === 'proportional') return getProportionalP1Pct();
  if (cat.defaultSplit === '100_p1') return 100;
  if (cat.defaultSplit === '100_p2') return 0;
  return getGlobalDefaultP1Pct();
}

function calculateItemSplit(item) {
  const amount = Math.max(0, Number(item.amount) || 0);
  let pctP1 = 50;

  switch (item.splitMode) {
    case 'default':
      pctP1 = getGlobalDefaultP1Pct();
      break;
    case 'category':
      pctP1 = getCategoryDefaultP1Pct(item.category);
      break;
    case '50_50':
      pctP1 = 50;
      break;
    case 'proportional':
      pctP1 = getProportionalP1Pct();
      break;
    case 'custom_pct':
      pctP1 = clamp(item.customVal, 0, 100);
      break;
    case 'custom_val':
      if (amount > 0) {
        const valP1 = clamp(item.customVal, 0, amount);
        pctP1 = (valP1 / amount) * 100;
      } else {
        pctP1 = 50;
      }
      break;
    case '100_p1':
      pctP1 = 100;
      break;
    case '100_p2':
      pctP1 = 0;
      break;
    default:
      pctP1 = getGlobalDefaultP1Pct();
  }

  const pctP2 = Math.max(0, 100 - pctP1);
  const shareP1 = Number(((amount * pctP1) / 100).toFixed(2));
  const shareP2 = Number((amount - shareP1).toFixed(2));

  let paidP1 = 0;
  let paidP2 = 0;
  if (item.paidBy === 'p1') {
    paidP1 = amount;
    paidP2 = 0;
  } else if (item.paidBy === 'p2') {
    paidP1 = 0;
    paidP2 = amount;
  } else {
    paidP1 = shareP1;
    paidP2 = shareP2;
  }

  const netP1 = Number((paidP1 - shareP1).toFixed(2));

  return {
    amount,
    pctP1: Number(pctP1.toFixed(1)),
    pctP2: Number(pctP2.toFixed(1)),
    shareP1,
    shareP2,
    paidP1,
    paidP2,
    netP1
  };
}

function getMonthExpenses(monthStr = state.currentMonth) {
  if (!state.expensesByMonth[monthStr]) {
    state.expensesByMonth[monthStr] = [];
  }
  return state.expensesByMonth[monthStr];
}

function calculateMonthSummary(monthStr = state.currentMonth) {
  const list = getMonthExpenses(monthStr);
  let totalAmount = 0;
  let totalShareP1 = 0;
  let totalShareP2 = 0;
  let totalPaidP1 = 0;
  let totalPaidP2 = 0;
  let netP1 = 0;

  const byCategory = {};
  state.categories.forEach(c => {
    byCategory[c.id] = {
      category: c,
      count: 0,
      total: 0,
      shareP1: 0,
      shareP2: 0,
      paidP1: 0,
      paidP2: 0
    };
  });

  list.forEach(item => {
    const calc = calculateItemSplit(item);
    totalAmount += calc.amount;
    totalShareP1 += calc.shareP1;
    totalShareP2 += calc.shareP2;
    totalPaidP1 += calc.paidP1;
    totalPaidP2 += calc.paidP2;
    netP1 += calc.netP1;

    if (!byCategory[item.category]) {
      byCategory[item.category] = {
        category: { id: item.category, name: item.category, icon: '📌', budget: 0, defaultSplit: 'default' },
        count: 0,
        total: 0,
        shareP1: 0,
        shareP2: 0,
        paidP1: 0,
        paidP2: 0
      };
    }
    byCategory[item.category].count += 1;
    byCategory[item.category].total += calc.amount;
    byCategory[item.category].shareP1 += calc.shareP1;
    byCategory[item.category].shareP2 += calc.shareP2;
    byCategory[item.category].paidP1 += calc.paidP1;
    byCategory[item.category].paidP2 += calc.paidP2;
  });

  return {
    count: list.length,
    totalAmount: Number(totalAmount.toFixed(2)),
    totalShareP1: Number(totalShareP1.toFixed(2)),
    totalShareP2: Number(totalShareP2.toFixed(2)),
    totalPaidP1: Number(totalPaidP1.toFixed(2)),
    totalPaidP2: Number(totalPaidP2.toFixed(2)),
    netP1: Number(netP1.toFixed(2)),
    byCategory
  };
}

// ============================================================================
// AGENTE DE IA NO NAVEGADOR (FALLBACK QUANDO RODADO SEM SERVIDOR OU EM REDE)
// ============================================================================

function formatDateBR(isoDate) {
  if (!isoDate) return '';
  const parts = String(isoDate).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return isoDate;
}

function parseNotificationWithBrowserAI(rawText, explicitPayer, explicitDate) {
  const text = String(rawText || '').trim();
  const p1Name = (state.couple.p1Name || 'André').toLowerCase();
  const p2Name = (state.couple.p2Name || 'Esposa').toLowerCase();

  // 0. Extrair Data (suporta 19/10/2026, dia 19/10 e formato Carteira Apple "19 de outubro de 2026" ou "19 de out.")
  const now = new Date();
  const currentYear = now.getFullYear();
  let date = explicitDate || now.toISOString().slice(0, 10);

  const monthMapPT = {
    jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
    jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12'
  };

  const matchFullBR = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  const matchExtensoPT = text.match(/\b(\d{1,2})\s+de\s+([a-zç]{3,10})\.?(?:\s+de\s+(\d{4}))?/i);
  if (matchFullBR) {
    const d = String(matchFullBR[1]).padStart(2, '0');
    const m = String(matchFullBR[2]).padStart(2, '0');
    let y = matchFullBR[3];
    if (y.length === 2) y = '20' + y;
    date = `${y}-${m}-${d}`;
  } else if (matchExtensoPT) {
    const d = String(matchExtensoPT[1]).padStart(2, '0');
    const mPrefix = matchExtensoPT[2].toLowerCase().slice(0, 3);
    const m = monthMapPT[mPrefix] || String(now.getMonth() + 1).padStart(2, '0');
    const y = matchExtensoPT[3] || String(currentYear);
    date = `${y}-${m}-${d}`;
  } else {
    const matchShortBR = text.match(/(?:em|dia|data)\s+(\d{1,2})\/(\d{1,2})\b/i);
    if (matchShortBR) {
      const d = String(matchShortBR[1]).padStart(2, '0');
      const m = String(matchShortBR[2]).padStart(2, '0');
      date = `${currentYear}-${m}-${d}`;
    }
  }

  const textNoDate = text
    .replace(/(?:\s+em|\s+dia)?\s+\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/gi, '')
    .replace(/\b\d{1,2}\s+de\s+[a-zç]{3,10}\.?(?:\s+de\s+\d{4})?(?:\s+às\s+\d{1,2}:\d{2})?/gi, '')
    .trim();

  // 1. Extrair Valor
  let amount = 0;
  const regexBRL = /(?:R\$|BRL|\$)\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:[.,]\d{1,2})?)/i;
  const matchBRL = textNoDate.match(regexBRL);
  const matchGen = textNoDate.replace(/\b\d{1,2}:\d{2}\b/g, ' ').match(/(\d{1,3}(?:\.\d{3})+,\d{2}|\d+[.,]\d{2}|\b\d{2,5}\b)/);
  const numCandidate = matchBRL ? matchBRL[1] : matchGen ? matchGen[1] : null;
  if (numCandidate) {
    let s = numCandidate;
    if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
    else if (s.includes(',')) s = s.replace(',', '.');
    amount = parseFloat(s) || 0;
  }

  // 2. Extrair Nome do Estabelecimento (Suporte especial para Notificação da Carteira Apple / Banco do Brasil em múltiplas linhas)
  let desc = 'Compra no Cartão';
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length >= 2) {
    const priceIdx = rawLines.findIndex(l => /(?:R\$|BRL)\s*\d+/i.test(l));
    if (priceIdx !== -1) {
      const isNoiseLine = (s) => /^(?:claro|vivo|tim|oi\b|\d+%\s*carregado|central de notifica|banco do brasil|nubank|ita[uú]|bradesco|santander|inter|ourocard|cart[aã]o|visa|mastercard|elo|\d{1,2}:\d{2}|(?:seg|ter|qua|qui|sex|s[aá]b|dom)\b|santa rosa|avenida|registro dos)/i.test(s);
      // Caso 1 (Banner da Central de Notificações: linha do estabelecimento fica exatamente acima do R$ 12,00)
      if (priceIdx > 0 && !isNoiseLine(rawLines[priceIdx - 1])) {
        desc = rawLines[priceIdx - 1].replace(/\.\s*[A-Za-zÀ-ú\s]+,\s*[A-Z]{2}$/, '').trim();
      } else {
        // Caso 2 (Card expandido da Carteira Apple: R$ 12,00 -> OUROCARD FACIL VISA -> Academia BodyFit - Filial)
        for (let k = priceIdx + 1; k < Math.min(rawLines.length, priceIdx + 4); k++) {
          if (!isNoiseLine(rawLines[k]) && !/\b\d{1,2}\s+de\s+[a-zç]+/i.test(rawLines[k])) {
            desc = rawLines[k].trim();
            break;
          }
        }
      }
    }
  }

  const patterns = [
    /(?:em|no estabelecimento|para)\s+([A-Z0-9À-Ú*.\-\s]{3,40}?)(?:\s+(?:às|as|em|dia|no valor|em \d+x|usando|cartão|cartao|final|\.|,|$))/i,
    /compra\s+(?:aprovada|confirmada).*?(?:R\$\s*[\d.,]+)\s+(?:em|no|na)\s+([^\n.,;]+)/i,
    /(?:R\$\s*[\d.,]+)\s+(?:em|no|na|-)\s+([^\n.,;]+)/i
  ];
  if (desc === 'Compra no Cartão') {
    for (const pat of patterns) {
      const m = textNoDate.match(pat);
      if (m && m[1]) {
        desc = m[1].trim();
        break;
      }
    }
  }
  if (desc === 'Compra no Cartão') {
    let cleaned = textNoDate
      .replace(/(?:compra\s+aprovada|passou|apple\s+pay:?|itaú:?|nubank:?|no\s+cartão(?:\s+final\s+\d+)?)/gi, '')
      .replace(/(?:R\$|BRL)?\s*\d+(?:[.,]\d{1,2})?\s*(?:reais)?/gi, '')
      .replace(/\b(?:dividir|divide|meio a meio|50\/50|100%|proporcional|às \d{2}:\d{2}|usando.*)\b.*/gi, '')
      .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
      .trim();
    if (cleaned.length >= 2) desc = cleaned;
  }

  desc = desc
    .replace(/^(?:IFD\*|IFOOD\s*\*)/i, 'iFood - ')
    .replace(/^(?:UBER\s*\*)/i, 'Uber ')
    .replace(/\s+/g, ' ')
    .trim();

  const lowerAll = `${desc} ${textNoDate}`.toLowerCase();

  // 3. Categoria e Regra
  let category = 'compras';
  let splitMode = 'category';
  let customVal = 50;
  let engineLabel = 'IA Financeira BR';

  const rules = state.aiConfig?.customRules || [];
  for (const r of rules) {
    if (r.keyword && lowerAll.includes(r.keyword.toLowerCase())) {
      if (r.category) category = r.category;
      if (r.splitMode) splitMode = r.splitMode;
      if (r.customVal !== undefined) customVal = Number(r.customVal);
      engineLabel = `Regra IA ("${r.keyword}")`;
      break;
    }
  }

  if (engineLabel === 'IA Financeira BR') {
    for (const grp of LOCAL_AI_KEYWORDS) {
      if (grp.keywords.some(kw => lowerAll.includes(kw))) {
        category = grp.category;
        break;
      }
    }
  }

  // Sobrescreve divisão se houver comando explícito na frase
  const matchCustom = lowerAll.match(/\b(\d{1,2})\s*(?:%|\/)\s*(\d{1,2})\b/);
  if (matchCustom && Number(matchCustom[1]) + Number(matchCustom[2]) === 100) {
    splitMode = 'custom_pct';
    customVal = Number(matchCustom[1]);
  } else if (lowerAll.includes('50/50') || lowerAll.includes('meio a meio')) {
    splitMode = '50_50';
  } else if (lowerAll.includes('100% dela') || lowerAll.includes(`100% ${p2Name}`)) {
    splitMode = '100_p2';
  } else if (lowerAll.includes('100% meu') || lowerAll.includes(`100% ${p1Name}`)) {
    splitMode = '100_p1';
  }

  // 4. Pagador
  let paidBy = explicitPayer === 'p1' || explicitPayer === 'p2' ? explicitPayer : '';
  if (!paidBy) {
    const d1 = (state.aiConfig?.cardDigitsP1 || '').trim().toLowerCase();
    const d2 = (state.aiConfig?.cardDigitsP2 || '').trim().toLowerCase();
    if (d2 && lowerAll.includes(d2)) paidBy = 'p2';
    else if (d1 && lowerAll.includes(d1)) paidBy = 'p1';
    else if (lowerAll.includes(p2Name) || lowerAll.includes('esposa')) paidBy = 'p2';
    else paidBy = 'p1';
  }

  return {
    date,
    desc,
    amount: Number(amount.toFixed(2)),
    category,
    paidBy,
    splitMode,
    customVal,
    engineLabel
  };
}

async function publishExpenseToCloudQueue(expenseObj) {
  try {
    const topic = state.aiConfig?.cloudTopic || DEFAULT_CLOUD_TOPIC;
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: 'POST',
      body: JSON.stringify({ _webExpense: expenseObj })
    });
  } catch (e) {}
}

async function syncCloudDirectlyInBrowser() {
  try {
    const topic = state.aiConfig?.cloudTopic || DEFAULT_CLOUD_TOPIC;
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}/json?poll=1&since=all`);
    if (!res.ok) return 0;
    const raw = await res.text();
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (!Array.isArray(state.processedCloudIds)) state.processedCloudIds = [];
    let added = 0;

    for (const line of lines) {
      let ev;
      try {
        ev = JSON.parse(line);
      } catch {
        continue;
      }
      if (!ev || ev.event !== 'message' || !ev.id || !ev.message) continue;
      const ignoredTestIds = ['VBL37GKjpTLy', '3EtekZgNKJWv', '3oYJFpIYS6fE', 'Cj46sw9mhXVZ'];
      if (ignoredTestIds.includes(ev.id)) continue;
      if (state.processedCloudIds.includes(ev.id)) continue;

      let txt = String(ev.message);
      let payer = 'auto';
      let dt = ev.time ? new Date(ev.time * 1000).toISOString().slice(0, 10) : '';

      try {
        const obj = JSON.parse(ev.message);
        // Se for um lançamento sincronizado de outro navegador/celular pelo site:
        if (obj && obj._webExpense && obj._webExpense.id && obj._webExpense.amount > 0) {
          state.processedCloudIds.push(ev.id);
          const wExp = obj._webExpense;
          const mKey = (wExp.date || new Date().toISOString().slice(0, 10)).slice(0, 7);
          const mList = getMonthExpenses(mKey);
          if (!mList.some(x => x.id === wExp.id)) {
            mList.push(wExp);
            added++;
          }
          continue;
        }
        const mName = String(obj.estabelecimento || obj.merchant || obj.descricao || '').trim();
        const mVal = String(obj.valor || obj.amount || '').trim();
        const mTxt = String(obj.texto || obj.text || '').trim();
        txt = mTxt || (mVal ? `${mName} R$ ${mVal}`.trim() : mName);
        if (obj.pagador || obj.payer) payer = obj.pagador || obj.payer;
        if (obj.data || obj.date) dt = obj.data || obj.date;
      } catch {}

      const monthKey = (dt || new Date().toISOString().slice(0, 10)).slice(0, 7);
      const monthList = getMonthExpenses(monthKey);
      const cloudId = 'cloud_' + ev.id;
      if (monthList.some(x => x.id === cloudId)) continue;

      if (!state.processedCloudIds.includes(ev.id)) {
        state.processedCloudIds.push(ev.id);
      }

      const parsed = parseNotificationWithBrowserAI(txt, payer, dt);
      const timeStr = new Date((ev.time || Date.now() / 1000) * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const isBlankTap = !parsed.amount || parsed.amount <= 0;

      const newExp = {
        id: cloudId,
        date: parsed.date || dt || new Date().toISOString().slice(0, 10),
        desc: isBlankTap
          ? `📱 Compra iPhone (${timeStr}) — Clique p/ pôr local e valor`
          : `🤖 ${parsed.desc}`,
        category: parsed.category || 'compras',
        amount: isBlankTap ? 0 : parsed.amount,
        paidBy: parsed.paidBy || (payer === 'p2' ? 'p2' : 'p1'),
        splitMode: parsed.splitMode || 'default',
        customVal: parsed.customVal ?? 50,
        isFixed: false
      };

      monthList.push(newExp);
      state.aiLogs.unshift({
        id: newExp.id,
        timestamp: new Date((ev.time || Date.now() / 1000) * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rawInput: isBlankTap ? 'Cartão aproximado no iPhone (Apple Pay Brasil não enviou valor via NFC)' : txt,
        engine: `☁️ Nuvem 4G/5G + ${parsed.engineLabel}`,
        expense: newExp
      });
      added++;
    }

    if (added > 0) {
      saveState();
      renderAll();
    }
    return added;
  } catch (e) {
    return 0;
  }
}

// ============================================================================
// RENDERIZAÇÃO DA INTERFACE
// ============================================================================

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

function renderAll() {
  applyTheme();
  renderHeaderAndCoupleBar();
  renderPierreShowcase();
  renderKPISection();
  renderQuickEntryOptions();
  renderSheetTabs();

  const vSheet = document.getElementById('viewSpreadsheet');
  const vDash = document.getElementById('viewDashboard');
  const vAi = document.getElementById('viewAiAgent');

  vSheet.style.display = 'none';
  vDash.style.display = 'none';
  if (vAi) vAi.style.display = 'none';

  if (state.activeTab === 'dashboard') {
    vDash.style.display = 'flex';
    renderDashboardView();
  } else if (state.activeTab === 'ai_agent') {
    if (vAi) {
      vAi.style.display = 'flex';
      renderAiAgentView();
    }
  } else {
    vSheet.style.display = 'block';
    renderSpreadsheetView();
  }
}

function renderPierreShowcase() {
  const { p1Name, p2Name } = state.couple;
  const greetEl = document.getElementById('pierreGreetingTitle');
  if (greetEl) {
    greetEl.textContent = `Olá, ${p1Name} & ${p2Name}`;
  }

  const list = getMonthExpenses(state.currentMonth);
  const txBox = document.getElementById('pierreRecentTransactionsList');
  if (txBox) {
    const recent = [...list].slice(-3).reverse();
    const catColors = {
      alimentacao: '#ea1d2c',
      lazer: '#ff385c',
      transporte: '#2563eb',
      moradia: '#10b981',
      saude: '#ec4899',
      compras: '#8b5cf6'
    };
    const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    if (recent.length === 0) {
      txBox.innerHTML = `<div class="empty-state" style="padding:18px; font-size:12.5px;">Nenhuma transação neste mês ainda. Passe o Apple Pay ou digite ao lado!</div>`;
    } else {
      txBox.innerHTML = recent.map(item => {
        const catObj = state.categories.find(c => c.id === item.category) || { name: 'Geral', icon: '💳' };
        const bgCircle = catColors[item.category] || '#3b82f6';
        const parts = (item.date || '').split('-');
        const dayStr = parts[2] || '01';
        const mIdx = Math.max(0, (parseInt(parts[1], 10) || 1) - 1);
        const dateFormatted = `${dayStr} de ${monthNamesShort[mIdx] || 'Out'}`;
        const payerClass = item.paidBy === 'p2' ? 'p2' : 'p1';
        const payerLabel = item.paidBy === 'p2' ? p2Name : (item.paidBy === 'split' ? 'Ambos' : p1Name);

        return `
          <div class="pierre-tx-card">
            <div class="pierre-tx-left">
              <div class="pierre-tx-icon" style="background:${bgCircle};">${catObj.icon}</div>
              <div class="pierre-tx-meta">
                <div class="pierre-tx-title">${escapeHtml(item.desc.replace(/^🤖\s*/, ''))}</div>
                <div class="pierre-tx-sub">${escapeHtml(catObj.name)} • ${dateFormatted}</div>
              </div>
            </div>
            <div class="pierre-tx-right">
              <div class="pierre-tx-amount">${formatBRL(item.amount)}</div>
              <span class="pastel-name-pill ${payerClass}">${escapeHtml(payerLabel)}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Gráfico de barras verde-neon por dia da semana (Seg a Dom)
  const barsStage = document.getElementById('pierreWeeklyBarsStage');
  const totalValEl = document.getElementById('pierreWeeklyTotalValue');
  const topCatEl = document.getElementById('pierreTopCategoryInsight');
  if (barsStage) {
    // 0=Seg, 1=Ter, 2=Qua, 3=Qui, 4=Sex, 5=Sáb, 6=Dom
    const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    let totalMonth = 0;

    list.forEach(item => {
      const amt = Math.max(0, Number(item.amount) || 0);
      totalMonth += amt;
      if (item.date) {
        const [y, m, d] = item.date.split('-').map(Number);
        if (y && m && d) {
          const jsDay = new Date(y, m - 1, d).getDay(); // 0=Dom .. 6=Sab
          const idx = jsDay === 0 ? 6 : jsDay - 1;
          dayTotals[idx] += amt;
        }
      }
    });

    const maxDay = Math.max(...dayTotals, 1);
    if (totalValEl) totalValEl.textContent = formatBRL(totalMonth);

    barsStage.innerHTML = dayLabels.map((lbl, i) => {
      const val = dayTotals[i];
      if (val <= 0) {
        return `
          <div class="pierre-day-col" title="${lbl}: R$ 0,00">
            <div class="pierre-bar-empty"></div>
            <span class="pierre-day-lbl">${lbl}</span>
          </div>
        `;
      }
      const heightPx = Math.max(18, Math.round((val / maxDay) * 84));
      return `
        <div class="pierre-day-col" title="${lbl}: ${formatBRL(val)}">
          <div class="pierre-bar-pill" style="height:${heightPx}px;"></div>
          <span class="pierre-day-lbl">${lbl}</span>
        </div>
      `;
    }).join('');

    if (topCatEl) {
      const summary = calculateMonthSummary();
      const topCat = [...state.categories]
        .map(c => ({ name: c.name, icon: c.icon, total: summary.byCategory[c.id]?.total || 0 }))
        .sort((a, b) => b.total - a.total)[0];
      if (topCat && topCat.total > 0) {
        topCatEl.textContent = `${topCat.icon} Maior: ${topCat.name} (${formatBRL(topCat.total)})`;
      } else {
        topCatEl.textContent = 'Sem gastos no mês';
      }
    }
  }
}

function renderHeaderAndCoupleBar() {
  const { p1Name, p1Income, p2Name, p2Income, globalSplitMode, globalCustomPctP1 } = state.couple;

  document.getElementById('monthSelector').value = state.currentMonth;

  document.getElementById('avatarP1').textContent = (p1Name || 'A').trim().charAt(0).toUpperCase();
  document.getElementById('avatarP2').textContent = (p2Name || 'E').trim().charAt(0).toUpperCase();

  const inName1 = document.getElementById('inputNameP1');
  if (document.activeElement !== inName1) inName1.value = p1Name;

  const inInc1 = document.getElementById('inputIncomeP1');
  if (document.activeElement !== inInc1) inInc1.value = p1Income;

  const inName2 = document.getElementById('inputNameP2');
  if (document.activeElement !== inName2) inName2.value = p2Name;

  const inInc2 = document.getElementById('inputIncomeP2');
  if (document.activeElement !== inInc2) inInc2.value = p2Income;

  document.getElementById('selectGlobalSplitMode').value = globalSplitMode;
  const customWrap = document.getElementById('customGlobalSplitWrap');
  customWrap.style.display = globalSplitMode === 'custom' ? 'flex' : 'none';

  document.getElementById('lblCustomGlobalP1').textContent = `${p1Name}:`;
  document.getElementById('lblCustomGlobalP2').textContent = p2Name;
  const inCustomPct1 = document.getElementById('inputGlobalCustomPctP1');
  if (document.activeElement !== inCustomPct1) inCustomPct1.value = globalCustomPctP1;
  document.getElementById('txtGlobalCustomPctP2').textContent = `${Number((100 - globalCustomPctP1).toFixed(1))}%`;

  const p1Pct = getGlobalDefaultP1Pct();
  const p2Pct = Number((100 - p1Pct).toFixed(1));
  document.getElementById('defaultSplitBadge').textContent = `${p1Name} ${p1Pct}% / ${p2Name} ${p2Pct}%`;
}

function renderKPISection() {
  const { p1Name, p1Income, p2Name, p2Income } = state.couple;
  const summary = calculateMonthSummary();

  document.getElementById('kpiCountItems').textContent = `${summary.count} ${summary.count === 1 ? 'lançamento' : 'lançamentos'}`;
  document.getElementById('kpiTotalMonth').textContent = formatBRL(summary.totalAmount);

  const totalIncome = (Number(p1Income) || 0) + (Number(p2Income) || 0);
  const ratioIncome = totalIncome > 0 ? ((summary.totalAmount / totalIncome) * 100).toFixed(1) : '0.0';
  document.getElementById('kpiTotalIncomeRatio').textContent = `Comprometimento da renda do casal: ${ratioIncome}%`;

  const p1ShareRatio = summary.totalAmount > 0
    ? ((summary.totalShareP1 / summary.totalAmount) * 100).toFixed(1)
    : getGlobalDefaultP1Pct();
  const p2ShareRatio = summary.totalAmount > 0
    ? (100 - Number(p1ShareRatio)).toFixed(1)
    : (100 - getGlobalDefaultP1Pct()).toFixed(1);

  document.getElementById('barMonthSplitP1').style.width = `${p1ShareRatio}%`;

  // Card Pessoa 1
  document.getElementById('kpiTitleP1').textContent = `Parte Justa de ${p1Name}`;
  document.getElementById('kpiPctP1').textContent = `${p1ShareRatio}% do mês`;
  document.getElementById('kpiFairShareP1').textContent = formatBRL(summary.totalShareP1);
  document.getElementById('kpiPaidByP1').textContent = formatBRL(summary.totalPaidP1);
  const diff1El = document.getElementById('kpiDiffP1');
  if (summary.netP1 > 0.01) {
    diff1El.innerHTML = `Pagou <strong>${formatBRL(summary.netP1)} a mais</strong> que sua parte`;
    diff1El.style.color = 'var(--success)';
  } else if (summary.netP1 < -0.01) {
    diff1El.innerHTML = `Pagou <strong>${formatBRL(Math.abs(summary.netP1))} a menos</strong> que sua parte`;
    diff1El.style.color = 'var(--warning)';
  } else {
    diff1El.textContent = 'Pagou exatamente sua parte';
    diff1El.style.color = 'var(--text-secondary)';
  }

  // Card Pessoa 2
  document.getElementById('kpiTitleP2').textContent = `Parte Justa de ${p2Name}`;
  document.getElementById('kpiPctP2').textContent = `${p2ShareRatio}% do mês`;
  document.getElementById('kpiFairShareP2').textContent = formatBRL(summary.totalShareP2);
  document.getElementById('kpiPaidByP2').textContent = formatBRL(summary.totalPaidP2);
  const netP2 = -summary.netP1;
  const diff2El = document.getElementById('kpiDiffP2');
  if (netP2 > 0.01) {
    diff2El.innerHTML = `Pagou <strong>${formatBRL(netP2)} a mais</strong> que a parte dela`;
    diff2El.style.color = 'var(--success)';
  } else if (netP2 < -0.01) {
    diff2El.innerHTML = `Pagou <strong>${formatBRL(Math.abs(netP2))} a menos</strong> que a parte dela`;
    diff2El.style.color = 'var(--warning)';
  } else {
    diff2El.textContent = 'Pagou exatamente a parte dela';
    diff2El.style.color = 'var(--text-secondary)';
  }

  // Card 4: Veredito do Acerto de Contas
  const headlineEl = document.getElementById('kpiSettlementHeadline');
  const subEl = document.getElementById('kpiSettlementSub');

  if (Math.abs(summary.netP1) <= 0.01) {
    headlineEl.textContent = 'Contas 100% Quitadas!';
    subEl.textContent = `Nenhum valor pendente entre ${p1Name} e ${p2Name}.`;
  } else if (summary.netP1 > 0.01) {
    headlineEl.textContent = `${p2Name} ➔ ${p1Name}: ${formatBRL(summary.netP1)}`;
    subEl.innerHTML = `<strong>${p2Name}</strong> deve transferir <strong>${formatBRL(summary.netP1)}</strong> para <strong>${p1Name}</strong> para fechar o mês.`;
  } else {
    const val = Math.abs(summary.netP1);
    headlineEl.textContent = `${p1Name} ➔ ${p2Name}: ${formatBRL(val)}`;
    subEl.innerHTML = `<strong>${p1Name}</strong> deve transferir <strong>${formatBRL(val)}</strong> para <strong>${p2Name}</strong> para fechar o mês.`;
  }
}

function renderQuickEntryOptions() {
  const { p1Name, p2Name } = state.couple;

  const catSelect = document.getElementById('entryCategory');
  const currentCatVal = catSelect.value;
  catSelect.innerHTML = state.categories
    .map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
    .join('');

  const isSpecificCatTab = state.categories.some(c => c.id === state.activeTab);
  if (isSpecificCatTab) {
    catSelect.value = state.activeTab;
  } else if (currentCatVal && state.categories.some(c => c.id === currentCatVal)) {
    catSelect.value = currentCatVal;
  }

  document.getElementById('optPaidByP1').textContent = `${p1Name} pagou`;
  document.getElementById('optPaidByP2').textContent = `${p2Name} pagou`;
  document.getElementById('optSplit100P1').textContent = `100% ${p1Name} (Individual)`;
  document.getElementById('optSplit100P2').textContent = `100% ${p2Name} (Individual)`;

  document.getElementById('optFilterPayerP1').textContent = `Pago por ${p1Name}`;
  document.getElementById('optFilterPayerP2').textContent = `Pago por ${p2Name}`;
  document.getElementById('optFilter100P1').textContent = `Apenas 100% ${p1Name}`;
  document.getElementById('optFilter100P2').textContent = `Apenas 100% ${p2Name}`;

  document.getElementById('thShareP1').textContent = `Parte ${p1Name} (R$)`;
  document.getElementById('thShareP2').textContent = `Parte ${p2Name} (R$)`;

  updateQuickEntryPreview();
}

function updateQuickEntryPreview() {
  const { p1Name, p2Name } = state.couple;
  const splitMode = document.getElementById('entrySplitMode').value;
  const customField = document.getElementById('entryCustomSplitField');
  const lblCustom = document.getElementById('lblEntryCustomSplit');
  const unitCustom = document.getElementById('unitEntryCustomSplit');

  if (splitMode === 'custom_pct') {
    customField.style.display = 'flex';
    lblCustom.textContent = `% de ${p1Name}`;
    unitCustom.textContent = '%';
  } else if (splitMode === 'custom_val') {
    customField.style.display = 'flex';
    lblCustom.textContent = `Valor ${p1Name} (R$)`;
    unitCustom.textContent = 'R$';
  } else {
    customField.style.display = 'none';
  }

  const amount = Number(document.getElementById('entryAmount').value) || 0;
  const tempItem = {
    amount: amount > 0 ? amount : 100,
    category: document.getElementById('entryCategory').value || 'alimentacao',
    paidBy: document.getElementById('entryPaidBy').value,
    splitMode,
    customVal: Number(document.getElementById('entryCustomInput').value) || 0
  };
  const calc = calculateItemSplit(tempItem);
  const previewEl = document.getElementById('quickEntryPreviewSplit');

  if (amount > 0) {
    previewEl.textContent = `Prévia: ${p1Name} fica com ${formatBRL(calc.shareP1)} (${calc.pctP1}%) | ${p2Name} fica com ${formatBRL(calc.shareP2)} (${calc.pctP2}%)`;
  } else {
    previewEl.textContent = `Regra selecionada: ${p1Name} ${calc.pctP1}% / ${p2Name} ${calc.pctP2}%`;
  }
}

// ============================================================================
// BARRA DE ABAS (GERAL + AGENTE IA + DASHBOARD + CATEGORIAS SEPARADAS)
// ============================================================================

function renderSheetTabs() {
  const tabsBar = document.getElementById('sheetTabsBar');
  const summary = calculateMonthSummary();

  let html = `
    <button type="button" class="sheet-tab ${state.activeTab === 'all' ? 'active' : ''}" data-tab="all">
      📋 Planilha Geral
      <span class="tab-count">${summary.count}</span>
    </button>
    <button type="button" class="sheet-tab ${state.activeTab === 'ai_agent' ? 'active' : ''}" data-tab="ai_agent" style="color: var(--primary);">
      🤖 Agente IA & Cartão (iPhone)
      <span class="tab-count" style="background:var(--primary-light); color:var(--primary);">Auto</span>
    </button>
    <button type="button" class="sheet-tab ${state.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
      📊 Resumo & Simulador
    </button>
  `;

  state.categories.forEach(cat => {
    const catCount = summary.byCategory[cat.id] ? summary.byCategory[cat.id].count : 0;
    const isActive = state.activeTab === cat.id ? 'active' : '';
    html += `
      <button type="button" class="sheet-tab ${isActive}" data-tab="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
        <span class="tab-count">${catCount}</span>
      </button>
    `;
  });

  html += `
    <button type="button" class="sheet-tab-add" id="btnAddCategoryTab" title="Criar uma nova aba de categoria separada">
      + Nova Aba
    </button>
  `;

  tabsBar.innerHTML = html;

  tabsBar.querySelectorAll('.sheet-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.getAttribute('data-tab');
      saveState();
      renderAll();
    });
  });

  const btnAdd = document.getElementById('btnAddCategoryTab');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      document.getElementById('modalNewCategory').classList.add('open');
    });
  }
}

// ============================================================================
// VISÃO 3: AGENTE DE IA & INTEGRAÇÃO COM IPHONE (APPLE PAY / ATALHOS)
// ============================================================================

function renderAiAgentView() {
  const { p1Name, p2Name } = state.couple;

  document.getElementById('optAiTestP1').textContent = `Celular de ${p1Name}`;
  document.getElementById('optAiTestP2').textContent = `Celular de ${p2Name}`;
  document.getElementById('lblCardDigitsP1').textContent = `Final do Cartão de ${p1Name} (4 dígitos)`;
  document.getElementById('lblCardDigitsP2').textContent = `Final do Cartão de ${p2Name} (4 dígitos)`;

  const aiDateInput = document.getElementById('inputAiTestDate');
  if (aiDateInput && !aiDateInput.value) {
    const today = new Date().toISOString().slice(0, 10);
    aiDateInput.value = today.startsWith(state.currentMonth) ? today : `${state.currentMonth}-01`;
  }

  const badge = document.getElementById('aiConnectionBadge');
  if (serverConnected) {
    badge.textContent = '🟢 Servidor + Webhook iOS Online';
  } else {
    badge.textContent = '☁️ Nuvem 4G/5G + IA Online';
  }

  document.getElementById('webhookUrlDisplay').textContent = serverWebhookUrl;

  const inCard1 = document.getElementById('inputCardDigitsP1');
  if (document.activeElement !== inCard1) inCard1.value = state.aiConfig?.cardDigitsP1 || '';

  const inCard2 = document.getElementById('inputCardDigitsP2');
  if (document.activeElement !== inCard2) inCard2.value = state.aiConfig?.cardDigitsP2 || '';

  const inGem = document.getElementById('inputGeminiKey');
  if (document.activeElement !== inGem) inGem.value = state.aiConfig?.geminiApiKey || '';

  // Select de categoria para nova regra
  const ruleCatSel = document.getElementById('newRuleCategory');
  ruleCatSel.innerHTML = state.categories
    .map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
    .join('');

  // Lista de regras customizadas
  const rulesListEl = document.getElementById('aiCustomRulesList');
  const rules = state.aiConfig?.customRules || [];
  if (rules.length === 0) {
    rulesListEl.innerHTML = `<div style="font-size:12px; color:var(--text-muted);">Nenhuma regra personalizada criada ainda.</div>`;
  } else {
    rulesListEl.innerHTML = rules.map((r, idx) => {
      const catObj = state.categories.find(c => c.id === r.category);
      const catLabel = catObj ? `${catObj.icon} ${catObj.name}` : r.category;
      let splitLabel = r.splitMode;
      if (r.splitMode === 'custom_pct') splitLabel = `${r.customVal}% ${p1Name} / ${100 - r.customVal}% ${p2Name}`;
      else if (r.splitMode === '50_50') splitLabel = '50% / 50%';
      else if (r.splitMode === 'proportional') splitLabel = 'Proporcional à Renda';
      else if (r.splitMode === '100_p1') splitLabel = `100% ${p1Name}`;
      else if (r.splitMode === '100_p2') splitLabel = `100% ${p2Name}`;
      else splitLabel = 'Regra da Categoria';

      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:6px; font-size:12.5px;">
          <span>
            Se contiver <strong>"${escapeHtml(r.keyword)}"</strong> ➔ Aba <strong>${catLabel}</strong> ➔ Divisão: <strong>${splitLabel}</strong>
          </span>
          <button type="button" class="btn btn-danger-ghost btn-del-ai-rule" data-idx="${idx}" title="Remover regra">🗑️</button>
        </div>
      `;
    }).join('');

    rulesListEl.querySelectorAll('.btn-del-ai-rule').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-idx'));
        state.aiConfig.customRules.splice(i, 1);
        saveState();
        renderAiAgentView();
      });
    });
  }

  // Histórico de compras capturadas pela IA
  const logBox = document.getElementById('aiActivityLogBox');
  const logs = state.aiLogs || [];
  if (logs.length === 0) {
    logBox.innerHTML = `<div style="color:var(--text-muted); padding:10px 0;">Nenhuma compra automática registrada ainda. Clique em um dos botões de exemplo acima para ver o Agente de IA funcionando ao vivo!</div>`;
  } else {
    logBox.innerHTML = logs.slice(0, 10).map(lg => {
      const exp = lg.expense || {};
      const catObj = state.categories.find(c => c.id === exp.category);
      const payerName = exp.paidBy === 'p2' ? p2Name : p1Name;
      return `
        <div style="padding:8px 12px; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:6px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <div>
            <span class="kpi-badge" style="background:var(--bg-surface); border:1px solid var(--border-color); margin-right:4px;">📅 ${formatDateBR(exp.date)}</span>
            <strong>${escapeHtml(exp.desc || 'Compra')}</strong> — <strong style="color:var(--primary);">${formatBRL(exp.amount)}</strong>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
              Notificação lida: "${escapeHtml(lg.rawInput)}" | Motor: ${escapeHtml(lg.engine || 'IA')}
            </div>
          </div>
          <div style="text-align:right; font-size:11.5px;">
            <span class="kpi-badge badge-p1">${catObj ? `${catObj.icon} ${catObj.name}` : exp.category}</span>
            <span style="margin-left:4px; font-weight:600;">Pago por ${payerName} (${lg.timestamp || 'agora'})</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

async function runAiNotificationCapture(rawText, payerSelection, explicitDate) {
  const text = String(rawText || '').trim();
  if (!text) return;

  const feedbackEl = document.getElementById('aiLastResultFeedback');
  if (feedbackEl) feedbackEl.textContent = '🤖 Analisando compra com IA...';

  if (serverConnected) {
    try {
      const res = await fetch('/api/webhook/compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: text,
          data: explicitDate || '',
          pagador: payerSelection === 'auto' ? '' : payerSelection
        })
      });
      const data = await res.json();
      if (data.ok) {
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const sr = await stateRes.json();
          if (sr.state) mergeState(sr.state);
        }
        if (data.expense && data.expense.date) {
          const dtEl = document.getElementById('inputAiTestDate');
          if (dtEl) dtEl.value = data.expense.date;
          state.currentMonth = data.expense.date.slice(0, 7);
        }
        renderAll();
        if (feedbackEl) {
          const dBr = data.expense?.date ? ` em ${formatDateBR(data.expense.date)}` : '';
          feedbackEl.textContent = `✅ ${data.message}${dBr}`;
        }
        return;
      }
    } catch (e) {
      // Fallback para processamento direto no navegador
    }
  }

  // Processamento local imediato no navegador
  const parsed = parseNotificationWithBrowserAI(text, payerSelection, explicitDate);
  if (!parsed.amount || parsed.amount <= 0) {
    if (feedbackEl) {
      feedbackEl.style.color = 'var(--danger)';
      feedbackEl.textContent = '⚠️ Informe o valor na notificação (ex: R$ 89,90).';
    }
    return;
  }

  const dateStr = parsed.date || new Date().toISOString().slice(0, 10);
  const dtEl = document.getElementById('inputAiTestDate');
  if (dtEl) dtEl.value = dateStr;
  state.currentMonth = dateStr.slice(0, 7);

  const newExp = {
    id: 'ai_' + Date.now(),
    date: dateStr,
    desc: `🤖 ${parsed.desc}`,
    category: parsed.category,
    amount: parsed.amount,
    paidBy: parsed.paidBy,
    splitMode: parsed.splitMode,
    customVal: parsed.customVal,
    isFixed: false
  };

  getMonthExpenses(state.currentMonth).push(newExp);
  state.aiLogs.unshift({
    id: newExp.id,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawInput: text,
    engine: parsed.engineLabel,
    expense: newExp
  });

  saveState();
  publishExpenseToCloudQueue(newExp);
  renderAll();
  const catObj = state.categories.find(c => c.id === parsed.category);
  const fb = document.getElementById('aiLastResultFeedback');
  if (fb) {
    fb.style.color = 'var(--success)';
    fb.textContent = `✅ Lançado em ${formatDateBR(dateStr)}: "${parsed.desc}" (${formatBRL(parsed.amount)}) na aba ${catObj ? catObj.name : parsed.category}!`;
  }
}

// ============================================================================
// VISÃO DE PLANILHA (GERAL OU DE UMA CATEGORIA ESPECÍFICA)
// ============================================================================

function renderSpreadsheetView() {
  const { p1Name, p2Name } = state.couple;
  const summary = calculateMonthSummary();
  const activeCat = state.categories.find(c => c.id === state.activeTab);
  const banner = document.getElementById('categoryBanner');

  if (activeCat) {
    banner.style.display = 'flex';
    document.getElementById('catBannerIcon').textContent = activeCat.icon;
    document.getElementById('catBannerTitle').textContent = `Planilha Separada: ${activeCat.name}`;
    document.getElementById('catBannerDesc').textContent = activeCat.desc || 'Gastos filtrados automaticamente para esta categoria.';

    const catStats = summary.byCategory[activeCat.id] || { total: 0, shareP1: 0, shareP2: 0 };
    document.getElementById('catStatTotal').textContent = formatBRL(catStats.total);
    document.getElementById('catStatLblP1').textContent = `Parte ${p1Name}`;
    document.getElementById('catStatP1').textContent = formatBRL(catStats.shareP1);
    document.getElementById('catStatLblP2').textContent = `Parte ${p2Name}`;
    document.getElementById('catStatP2').textContent = formatBRL(catStats.shareP2);

    const splitSel = document.getElementById('catDefaultSplitSelect');
    splitSel.innerHTML = `
      <option value="default">Seguir Padrão do Casal</option>
      <option value="50_50">50% / 50% (Meio a Meio)</option>
      <option value="proportional">Proporcional à Renda</option>
      <option value="100_p1">100% ${p1Name}</option>
      <option value="100_p2">100% ${p2Name}</option>
    `;
    splitSel.value = activeCat.defaultSplit || 'default';
    splitSel.onchange = (e) => {
      activeCat.defaultSplit = e.target.value;
      saveState();
      renderAll();
    };

    const budgetIn = document.getElementById('catBudgetInput');
    if (document.activeElement !== budgetIn) {
      budgetIn.value = activeCat.budget || 0;
    }
    budgetIn.onchange = (e) => {
      activeCat.budget = Math.max(0, Number(e.target.value) || 0);
      saveState();
      renderAll();
    };
  } else {
    banner.style.display = 'none';
  }

  const rawList = getMonthExpenses();
  const searchQuery = (document.getElementById('searchSheet').value || '').trim().toLowerCase();
  const payerFilter = document.getElementById('filterPayer').value;
  const splitFilter = document.getElementById('filterSplitType').value;

  const filtered = rawList.filter(item => {
    if (activeCat && item.category !== activeCat.id) return false;
    if (searchQuery && !item.desc.toLowerCase().includes(searchQuery)) return false;
    if (payerFilter !== 'all' && item.paidBy !== payerFilter) return false;
    if (splitFilter === 'shared' && (item.splitMode === '100_p1' || item.splitMode === '100_p2')) return false;
    if (splitFilter === '100_p1' && item.splitMode !== '100_p1') return false;
    if (splitFilter === '100_p2' && item.splitMode !== '100_p2') return false;
    return true;
  });

  const tbody = document.getElementById('spreadsheetBody');
  const tfoot = document.getElementById('spreadsheetFoot');

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="13" class="empty-state">
          Nenhum lançamento encontrado nesta visualização. Utilize a linha de lançamento acima ou o Agente de IA para adicionar gastos!
        </td>
      </tr>
    `;
    tfoot.innerHTML = '';
    return;
  }

  let sumTotal = 0;
  let sumP1 = 0;
  let sumP2 = 0;
  let sumNetP1 = 0;

  tbody.innerHTML = filtered.map((item, idx) => {
    const calc = calculateItemSplit(item);
    sumTotal += calc.amount;
    sumP1 += calc.shareP1;
    sumP2 += calc.shareP2;
    sumNetP1 += calc.netP1;

    const catOptions = state.categories.map(c =>
      `<option value="${c.id}" ${c.id === item.category ? 'selected' : ''}>${c.icon} ${c.name}</option>`
    ).join('');

    let netText = '<span style="color:var(--text-muted);">Quitado na hora</span>';
    if (calc.netP1 > 0.01) {
      netText = `<span style="color:var(--p1-color); font-weight:600;">${p2Name} deve ${formatBRL(calc.netP1)}</span>`;
    } else if (calc.netP1 < -0.01) {
      netText = `<span style="color:var(--p2-color); font-weight:600;">${p1Name} deve ${formatBRL(Math.abs(calc.netP1))}</span>`;
    }

    return `
      <tr data-id="${item.id}">
        <td class="row-num">${idx + 1}</td>
        <td>
          <input type="date" class="cell-input row-edit-date" value="${item.date}" />
        </td>
        <td>
          <input type="text" class="cell-input row-edit-desc" value="${escapeHtml(item.desc)}" />
        </td>
        <td>
          <select class="cell-select row-edit-cat">${catOptions}</select>
        </td>
        <td style="text-align:center;">
          <input type="checkbox" class="row-edit-fixed" ${item.isFixed ? 'checked' : ''} title="Gasto fixo mensal" />
        </td>
        <td>
          <input type="number" class="cell-input cell-currency row-edit-amount" step="0.01" min="0" value="${item.amount.toFixed(2)}" />
        </td>
        <td>
          <select class="cell-select row-edit-paidby">
            <option value="p1" ${item.paidBy === 'p1' ? 'selected' : ''}>💳 ${p1Name} pagou</option>
            <option value="p2" ${item.paidBy === 'p2' ? 'selected' : ''}>💳 ${p2Name} pagou</option>
            <option value="split" ${item.paidBy === 'split' ? 'selected' : ''}>✅ Já dividido</option>
          </select>
        </td>
        <td>
          <select class="cell-select row-edit-splitmode">
            <option value="default" ${item.splitMode === 'default' ? 'selected' : ''}>Padrão do Casal</option>
            <option value="category" ${item.splitMode === 'category' ? 'selected' : ''}>Regra da Categoria</option>
            <option value="50_50" ${item.splitMode === '50_50' ? 'selected' : ''}>50% / 50%</option>
            <option value="proportional" ${item.splitMode === 'proportional' ? 'selected' : ''}>Proporcional à Renda</option>
            <option value="custom_pct" ${item.splitMode === 'custom_pct' ? 'selected' : ''}>% Personalizada</option>
            <option value="custom_val" ${item.splitMode === 'custom_val' ? 'selected' : ''}>Valor R$ Personalizado</option>
            <option value="100_p1" ${item.splitMode === '100_p1' ? 'selected' : ''}>100% ${p1Name}</option>
            <option value="100_p2" ${item.splitMode === '100_p2' ? 'selected' : ''}>100% ${p2Name}</option>
          </select>
        </td>
        <td style="text-align:center;">
          <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
            <input
              type="number"
              class="cell-input row-edit-pct"
              style="width:54px; text-align:center; font-weight:700;"
              min="0"
              max="100"
              step="1"
              value="${calc.pctP1}"
              title="Digite a % de ${p1Name} para personalizar este item"
            />
            <span style="font-size:11px; color:var(--text-secondary);">%</span>
          </div>
        </td>
        <td class="cell-share-p1">
          ${formatBRL(calc.shareP1)}
          <span class="share-pct-pill">(${calc.pctP1}%)</span>
        </td>
        <td class="cell-share-p2">
          ${formatBRL(calc.shareP2)}
          <span class="share-pct-pill">(${calc.pctP2}%)</span>
        </td>
        <td style="font-size:12px;">
          ${netText}
        </td>
        <td style="text-align:center;">
          <button type="button" class="btn btn-danger-ghost row-btn-delete" title="Excluir linha">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');

  let footNetText = 'Quitado';
  if (sumNetP1 > 0.01) {
    footNetText = `${p2Name} ➔ ${p1Name}: ${formatBRL(sumNetP1)}`;
  } else if (sumNetP1 < -0.01) {
    footNetText = `${p1Name} ➔ ${p2Name}: ${formatBRL(Math.abs(sumNetP1))}`;
  }

  const totalPctP1 = sumTotal > 0 ? ((sumP1 / sumTotal) * 100).toFixed(1) : '0.0';
  const totalPctP2 = sumTotal > 0 ? ((sumP2 / sumTotal) * 100).toFixed(1) : '0.0';

  tfoot.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:right;">TOTAIS DESTA PLANILHA (${filtered.length} itens):</td>
      <td class="cell-currency">${formatBRL(sumTotal)}</td>
      <td colspan="3" style="text-align:right; color:var(--text-secondary); font-size:12px;">Divisão Acumulada:</td>
      <td class="cell-share-p1">${formatBRL(sumP1)} <span class="share-pct-pill">(${totalPctP1}%)</span></td>
      <td class="cell-share-p2">${formatBRL(sumP2)} <span class="share-pct-pill">(${totalPctP2}%)</span></td>
      <td colspan="2" style="color:var(--primary); font-size:12.5px;">${footNetText}</td>
    </tr>
  `;

  bindSpreadsheetRowEvents();
}

function bindSpreadsheetRowEvents() {
  const tbody = document.getElementById('spreadsheetBody');
  const list = getMonthExpenses();

  tbody.querySelectorAll('tr[data-id]').forEach(tr => {
    const id = tr.getAttribute('data-id');
    const item = list.find(x => x.id === id);
    if (!item) return;

    tr.querySelector('.row-edit-date').addEventListener('change', e => {
      item.date = e.target.value;
      saveState();
      renderAll();
    });

    tr.querySelector('.row-edit-desc').addEventListener('change', e => {
      item.desc = e.target.value.trim() || 'Sem descrição';
      saveState();
      renderAll();
    });

    tr.querySelector('.row-edit-cat').addEventListener('change', e => {
      item.category = e.target.value;
      saveState();
      renderAll();
    });

    tr.querySelector('.row-edit-fixed').addEventListener('change', e => {
      item.isFixed = e.target.checked;
      saveState();
      renderAll();
    });

    tr.querySelector('.row-edit-amount').addEventListener('change', e => {
      item.amount = Math.max(0, Number(e.target.value) || 0);
      saveState();
      renderAll();
    });

    tr.querySelector('.row-edit-paidby').addEventListener('change', e => {
      item.paidBy = e.target.value;
      saveState();
      renderAll();
    });

    tr.querySelector('.row-edit-splitmode').addEventListener('change', e => {
      item.splitMode = e.target.value;
      if (item.splitMode === 'custom_pct' && (item.customVal === undefined || item.customVal === null)) {
        item.customVal = 50;
      }
      saveState();
      renderAll();
    });

    tr.querySelector('.row-edit-pct').addEventListener('change', e => {
      const newPct = clamp(e.target.value, 0, 100);
      item.splitMode = 'custom_pct';
      item.customVal = newPct;
      saveState();
      renderAll();
    });

    tr.querySelector('.row-btn-delete').addEventListener('click', () => {
      const idx = list.findIndex(x => x.id === id);
      if (idx !== -1) {
        list.splice(idx, 1);
        saveState();
        renderAll();
      }
    });
  });
}

// ============================================================================
// VISÃO 2: DASHBOARD CONSOLIDADO POR CATEGORIA & SIMULADOR DE DIVISÃO
// ============================================================================

function renderDashboardView() {
  const { p1Name, p2Name } = state.couple;
  const summary = calculateMonthSummary();

  document.getElementById('dashThP1').textContent = `Parte ${p1Name}`;
  document.getElementById('dashThP2').textContent = `Parte ${p2Name}`;

  const catBody = document.getElementById('dashboardCategoriesBody');
  catBody.innerHTML = state.categories.map(cat => {
    const stat = summary.byCategory[cat.id] || { count: 0, total: 0, shareP1: 0, shareP2: 0 };
    const budget = Number(cat.budget) || 0;
    const pctUsed = budget > 0 ? Math.min(100, (stat.total / budget) * 100) : 0;
    const isOver = budget > 0 && stat.total > budget;
    const barColor = isOver ? 'var(--danger)' : pctUsed > 80 ? 'var(--warning)' : 'var(--primary)';

    return `
      <tr>
        <td>
          <button type="button" class="btn btn-sm btn-open-cat-tab" data-cat="${cat.id}" style="font-weight:700;">
            ${cat.icon} ${cat.name} ↗
          </button>
        </td>
        <td style="text-align:center; font-weight:600;">${stat.count}</td>
        <td class="cell-currency">${formatBRL(stat.total)}</td>
        <td class="cell-share-p1">${formatBRL(stat.shareP1)}</td>
        <td class="cell-share-p2">${formatBRL(stat.shareP2)}</td>
        <td style="text-align:right;">
          <input
            type="number"
            class="cell-input cell-currency dash-cat-budget"
            data-cat="${cat.id}"
            value="${budget}"
            step="50"
            min="0"
            style="width:95px;"
          />
        </td>
        <td>
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600;">
            <span style="color:${isOver ? 'var(--danger)' : 'var(--text-secondary)'};">
              ${budget > 0 ? `${ ((stat.total / budget) * 100).toFixed(0) }%` : 'Sem meta'}
            </span>
            ${isOver ? `<span style="color:var(--danger);">+${formatBRL(stat.total - budget)}</span>` : ''}
          </div>
          <div class="budget-bar-wrap">
            <div class="budget-bar-fill" style="width:${pctUsed}%; background:${barColor};"></div>
          </div>
        </td>
        <td>
          <select class="cell-select dash-cat-split" data-cat="${cat.id}">
            <option value="default" ${cat.defaultSplit === 'default' ? 'selected' : ''}>Seguir Padrão do Casal</option>
            <option value="50_50" ${cat.defaultSplit === '50_50' ? 'selected' : ''}>50% / 50%</option>
            <option value="proportional" ${cat.defaultSplit === 'proportional' ? 'selected' : ''}>Proporcional à Renda</option>
            <option value="100_p1" ${cat.defaultSplit === '100_p1' ? 'selected' : ''}>100% ${p1Name}</option>
            <option value="100_p2" ${cat.defaultSplit === '100_p2' ? 'selected' : ''}>100% ${p2Name}</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');

  catBody.querySelectorAll('.btn-open-cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.getAttribute('data-cat');
      saveState();
      renderAll();
    });
  });

  catBody.querySelectorAll('.dash-cat-budget').forEach(input => {
    input.addEventListener('change', e => {
      const cat = state.categories.find(c => c.id === input.getAttribute('data-cat'));
      if (cat) {
        cat.budget = Math.max(0, Number(e.target.value) || 0);
        saveState();
        renderAll();
      }
    });
  });

  catBody.querySelectorAll('.dash-cat-split').forEach(sel => {
    sel.addEventListener('change', e => {
      const cat = state.categories.find(c => c.id === sel.getAttribute('data-cat'));
      if (cat) {
        cat.defaultSplit = e.target.value;
        saveState();
        renderAll();
      }
    });
  });

  const total = summary.totalAmount;
  const propPct1 = getProportionalP1Pct();
  const propPct2 = Number((100 - propPct1).toFixed(1));

  const simBox = document.getElementById('simulatorComparisonBox');
  simBox.innerHTML = `
    <div class="settlement-explain-list">
      <div class="settlement-explain-row">
        <strong>1️⃣ Divisão Atual Configurada na Planilha:</strong>
        <span>
          <strong style="color:var(--p1-color);">${p1Name}: ${formatBRL(summary.totalShareP1)}</strong> |
          <strong style="color:var(--p2-color);">${p2Name}: ${formatBRL(summary.totalShareP2)}</strong>
        </span>
      </div>
      <div class="settlement-explain-row">
        <strong>2️⃣ Se tudo fosse 50% / 50% (Meio a Meio):</strong>
        <span>
          ${p1Name}: ${formatBRL(total * 0.5)} | ${p2Name}: ${formatBRL(total * 0.5)}
        </span>
      </div>
      <div class="settlement-explain-row">
        <strong>3️⃣ Se tudo fosse Proporcional à Renda (${propPct1}% / ${propPct2}%):</strong>
        <span>
          ${p1Name}: ${formatBRL((total * propPct1) / 100)} | ${p2Name}: ${formatBRL((total * propPct2) / 100)}
        </span>
      </div>
    </div>
  `;

  document.getElementById('dashSettlementExplain').innerHTML = buildSettlementExplanationHtml(summary);
}

function buildSettlementExplanationHtml(summary) {
  const { p1Name, p2Name } = state.couple;
  let finalVerdict = `<strong style="color:var(--success);">✅ Tudo quitado! Ninguém deve nada para ninguém.</strong>`;
  if (summary.netP1 > 0.01) {
    finalVerdict = `<strong style="color:var(--primary); font-size:14px;">👉 Para fechar o mês, ${p2Name} deve transferir ${formatBRL(summary.netP1)} para ${p1Name}.</strong>`;
  } else if (summary.netP1 < -0.01) {
    finalVerdict = `<strong style="color:var(--primary); font-size:14px;">👉 Para fechar o mês, ${p1Name} deve transferir ${formatBRL(Math.abs(summary.netP1))} para ${p2Name}.</strong>`;
  }

  return `
    <div class="settlement-explain-row">
      <span>Total de despesas lançadas no mês:</span>
      <strong>${formatBRL(summary.totalAmount)}</strong>
    </div>
    <div class="settlement-explain-row">
      <span>Quanto cabia a <strong>${p1Name}</strong> pagar (pelas regras de divisão):</span>
      <strong style="color:var(--p1-color);">${formatBRL(summary.totalShareP1)}</strong>
    </div>
    <div class="settlement-explain-row">
      <span>Quanto <strong>${p1Name}</strong> efetivamente pagou do bolso:</span>
      <strong>${formatBRL(summary.totalPaidP1)}</strong>
    </div>
    <hr style="border:none; border-top:1px dashed var(--border-color); margin:4px 0;" />
    <div class="settlement-explain-row">
      <span>Quanto cabia a <strong>${p2Name}</strong> pagar (pelas regras de divisão):</span>
      <strong style="color:var(--p2-color);">${formatBRL(summary.totalShareP2)}</strong>
    </div>
    <div class="settlement-explain-row">
      <span>Quanto <strong>${p2Name}</strong> efetivamente pagou do bolso:</span>
      <strong>${formatBRL(summary.totalPaidP2)}</strong>
    </div>
    <hr style="border:none; border-top:1px solid var(--border-color); margin:4px 0;" />
    <div style="padding-top:4px;">${finalVerdict}</div>
  `;
}

// ============================================================================
// EXPORTAÇÃO PARA EXCEL (.XLSX) COM MÚLTIPLAS ABAS SEPARADAS
// ============================================================================

function exportToExcelWorkbook() {
  if (typeof XLSX === 'undefined') {
    alert('A biblioteca Excel ainda está carregando. Verifique sua conexão ou utilize o Backup JSON.');
    return;
  }

  const { p1Name, p2Name, p1Income, p2Income } = state.couple;
  const summary = calculateMonthSummary();
  const allExpenses = getMonthExpenses();

  const wb = XLSX.utils.book_new();

  const resumoRows = [
    ['PLANILHA INTELIGENTE DE CONTROLE DE GASTOS DO CASAL', ''],
    ['Mês de Referência', state.currentMonth],
    [],
    ['1. DADOS DO CASAL E ACERTO DE CONTAS', ''],
    ['Pessoa', 'Renda Mensal (R$)', 'Parte Justa no Mês (R$)', 'Total Pago do Bolso (R$)', 'Saldo a Receber / Pagar (R$)'],
    [p1Name, Number(p1Income) || 0, summary.totalShareP1, summary.totalPaidP1, summary.netP1],
    [p2Name, Number(p2Income) || 0, summary.totalShareP2, summary.totalPaidP2, -summary.netP1],
    ['TOTAL DO CASAL', (Number(p1Income) || 0) + (Number(p2Income) || 0), summary.totalAmount, summary.totalAmount, 0],
    [],
    ['2. RESUMO POR PLANILHA DE CATEGORIA', ''],
    ['Categoria', 'Qtd Lançamentos', 'Total Gasto (R$)', `Parte ${p1Name} (R$)`, `Parte ${p2Name} (R$)`, 'Meta Mensal (R$)', 'Saldo da Meta (R$)']
  ];

  state.categories.forEach(cat => {
    const st = summary.byCategory[cat.id] || { count: 0, total: 0, shareP1: 0, shareP2: 0 };
    resumoRows.push([
      `${cat.icon} ${cat.name}`,
      st.count,
      Number(st.total.toFixed(2)),
      Number(st.shareP1.toFixed(2)),
      Number(st.shareP2.toFixed(2)),
      Number(cat.budget || 0),
      Number(((cat.budget || 0) - st.total).toFixed(2))
    ]);
  });

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoRows);
  wsResumo['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 24 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo_e_Acerto');

  function buildExpenseSheet(items) {
    const rows = [
      [
        'Data',
        'Descrição do Gasto',
        'Categoria',
        'Fixo?',
        'Valor Total (R$)',
        'Quem Pagou?',
        `% ${p1Name}`,
        `% ${p2Name}`,
        `Parte ${p1Name} (R$)`,
        `Parte ${p2Name} (R$)`,
        'Situação na Linha'
      ]
    ];

    let sTotal = 0;
    let sP1 = 0;
    let sP2 = 0;

    items.forEach(it => {
      const calc = calculateItemSplit(it);
      sTotal += calc.amount;
      sP1 += calc.shareP1;
      sP2 += calc.shareP2;

      const catObj = state.categories.find(c => c.id === it.category);
      const payerName = it.paidBy === 'p1' ? p1Name : it.paidBy === 'p2' ? p2Name : 'Já Dividido';
      let statusLine = 'Quitado';
      if (calc.netP1 > 0.01) statusLine = `${p2Name} deve R$ ${calc.netP1.toFixed(2)}`;
      if (calc.netP1 < -0.01) statusLine = `${p1Name} deve R$ ${Math.abs(calc.netP1).toFixed(2)}`;

      rows.push([
        it.date,
        it.desc,
        catObj ? catObj.name : it.category,
        it.isFixed ? 'Sim' : 'Não',
        calc.amount,
        payerName,
        calc.pctP1,
        calc.pctP2,
        calc.shareP1,
        calc.shareP2,
        statusLine
      ]);
    });

    rows.push([]);
    rows.push([
      'TOTAL',
      `${items.length} lançamentos`,
      '',
      '',
      Number(sTotal.toFixed(2)),
      '',
      '',
      '',
      Number(sP1.toFixed(2)),
      Number(sP2.toFixed(2)),
      ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 34 },
      { wch: 18 },
      { wch: 8 },
      { wch: 16 },
      { wch: 16 },
      { wch: 10 },
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
      { wch: 24 }
    ];
    return ws;
  }

  const wsGeral = buildExpenseSheet(allExpenses);
  XLSX.utils.book_append_sheet(wb, wsGeral, 'Lancamentos_Gerais');

  state.categories.forEach(cat => {
    const catItems = allExpenses.filter(x => x.category === cat.id);
    const wsCat = buildExpenseSheet(catItems);
    const safeSheetName = cat.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\\/?*[\]:]/g, '')
      .substring(0, 28);
    XLSX.utils.book_append_sheet(wb, wsCat, safeSheetName || cat.id);
  });

  XLSX.writeFile(wb, `Planilha_Gastos_${p1Name}_${p2Name}_${state.currentMonth}.xlsx`);
}

// ============================================================================
// UTILITÁRIOS E EVENTOS GERAIS
// ============================================================================

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const ny = d.getFullYear();
  const nm = String(d.getMonth() + 1).padStart(2, '0');
  return `${ny}-${nm}`;
}

function initEvents() {
  document.getElementById('monthSelector').addEventListener('change', e => {
    if (e.target.value) {
      state.currentMonth = e.target.value;
      document.getElementById('entryDate').value = `${state.currentMonth}-01`;
      saveState();
      renderAll();
    }
  });

  document.getElementById('btnPrevMonth').addEventListener('click', () => {
    state.currentMonth = shiftMonth(state.currentMonth, -1);
    document.getElementById('entryDate').value = `${state.currentMonth}-01`;
    saveState();
    renderAll();
  });

  document.getElementById('btnNextMonth').addEventListener('click', () => {
    state.currentMonth = shiftMonth(state.currentMonth, 1);
    document.getElementById('entryDate').value = `${state.currentMonth}-01`;
    saveState();
    renderAll();
  });

  document.getElementById('btnCopyFixed').addEventListener('click', () => {
    const prevM = shiftMonth(state.currentMonth, -1);
    const prevList = state.expensesByMonth[prevM] || [];
    const fixedItems = prevList.filter(x => x.isFixed);

    if (fixedItems.length === 0) {
      alert(`Não há gastos marcados como "Fixo" no mês anterior (${prevM}) para copiar.`);
      return;
    }

    const currentList = getMonthExpenses(state.currentMonth);
    let added = 0;
    fixedItems.forEach(fx => {
      const dayPart = (fx.date || '').split('-')[2] || '05';
      const alreadyExists = currentList.some(c => c.desc === fx.desc && c.category === fx.category);
      if (!alreadyExists) {
        currentList.push({
          ...fx,
          id: 'exp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          date: `${state.currentMonth}-${dayPart}`
        });
        added++;
      }
    });

    saveState();
    renderAll();
    alert(`${added} gasto(s) fixo(s) copiado(s) de ${prevM} para ${state.currentMonth}!`);
  });

  document.getElementById('inputNameP1').addEventListener('input', e => {
    state.couple.p1Name = e.target.value.trim() || 'Pessoa 1';
    saveState();
    renderAll();
  });

  document.getElementById('inputIncomeP1').addEventListener('input', e => {
    state.couple.p1Income = Math.max(0, Number(e.target.value) || 0);
    saveState();
    renderAll();
  });

  document.getElementById('inputNameP2').addEventListener('input', e => {
    state.couple.p2Name = e.target.value.trim() || 'Pessoa 2';
    saveState();
    renderAll();
  });

  document.getElementById('inputIncomeP2').addEventListener('input', e => {
    state.couple.p2Income = Math.max(0, Number(e.target.value) || 0);
    saveState();
    renderAll();
  });

  document.getElementById('selectGlobalSplitMode').addEventListener('change', e => {
    state.couple.globalSplitMode = e.target.value;
    saveState();
    renderAll();
  });

  document.getElementById('inputGlobalCustomPctP1').addEventListener('input', e => {
    state.couple.globalCustomPctP1 = clamp(e.target.value, 0, 100);
    saveState();
    renderAll();
  });

  ['entryAmount', 'entryCategory', 'entryPaidBy', 'entrySplitMode', 'entryCustomInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateQuickEntryPreview);
      el.addEventListener('change', updateQuickEntryPreview);
    }
  });

  document.getElementById('formQuickEntry').addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('entryDate').value || `${state.currentMonth}-01`;
    const desc = document.getElementById('entryDesc').value.trim();
    const category = document.getElementById('entryCategory').value;
    const amount = Number(document.getElementById('entryAmount').value) || 0;
    const paidBy = document.getElementById('entryPaidBy').value;
    const splitMode = document.getElementById('entrySplitMode').value;
    const customVal = Number(document.getElementById('entryCustomInput').value) || 0;
    const isFixed = document.getElementById('entryIsFixed').checked;

    if (!desc || amount <= 0) return;

    const list = getMonthExpenses(state.currentMonth);
    const newItem = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      date,
      desc,
      category,
      amount,
      paidBy,
      splitMode,
      customVal,
      isFixed
    };
    list.push(newItem);

    document.getElementById('entryDesc').value = '';
    document.getElementById('entryAmount').value = '';
    document.getElementById('entryIsFixed').checked = false;
    document.getElementById('entryDesc').focus();

    saveState();
    publishExpenseToCloudQueue(newItem);
    renderAll();
  });

  document.getElementById('searchSheet').addEventListener('input', renderSpreadsheetView);
  document.getElementById('filterPayer').addEventListener('change', renderSpreadsheetView);
  document.getElementById('filterSplitType').addEventListener('change', renderSpreadsheetView);

  document.getElementById('btnLoadDemoData').addEventListener('click', () => {
    state.expensesByMonth[state.currentMonth] = createDemoExpenses(state.currentMonth);
    saveState();
    renderAll();
  });

  document.getElementById('btnClearMonth').addEventListener('click', () => {
    if (confirm(`Deseja realmente apagar todos os lançamentos de ${state.currentMonth}?`)) {
      state.expensesByMonth[state.currentMonth] = [];
      saveState();
      renderAll();
    }
  });

  document.getElementById('btnExportExcel').addEventListener('click', exportToExcelWorkbook);

  document.getElementById('btnToggleTheme').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    applyTheme();
  });

  // Eventos da Aba Agente de IA & iPhone
  document.querySelectorAll('.btn-ai-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      const txt = btn.getAttribute('data-text');
      const payer = btn.getAttribute('data-payer') || 'auto';
      const dtVal = document.getElementById('inputAiTestDate')?.value || '';
      document.getElementById('inputAiTestNotification').value = txt;
      document.getElementById('selectAiTestPayer').value = payer;
      runAiNotificationCapture(txt, payer, dtVal);
    });
  });

  const btnRunAi = document.getElementById('btnRunAiTest');
  if (btnRunAi) {
    btnRunAi.addEventListener('click', () => {
      const txt = document.getElementById('inputAiTestNotification').value;
      const payer = document.getElementById('selectAiTestPayer').value;
      const dtVal = document.getElementById('inputAiTestDate')?.value || '';
      runAiNotificationCapture(txt, payer, dtVal);
    });
  }

  const inCard1 = document.getElementById('inputCardDigitsP1');
  if (inCard1) {
    inCard1.addEventListener('change', e => {
      state.aiConfig.cardDigitsP1 = e.target.value.trim();
      saveState();
    });
  }

  const inCard2 = document.getElementById('inputCardDigitsP2');
  if (inCard2) {
    inCard2.addEventListener('change', e => {
      state.aiConfig.cardDigitsP2 = e.target.value.trim();
      saveState();
    });
  }

  const inGem = document.getElementById('inputGeminiKey');
  if (inGem) {
    inGem.addEventListener('change', e => {
      state.aiConfig.geminiApiKey = e.target.value.trim();
      saveState();
    });
  }

  const btnAddRule = document.getElementById('btnAddAiRule');
  if (btnAddRule) {
    btnAddRule.addEventListener('click', () => {
      const kw = document.getElementById('newRuleKeyword').value.trim();
      const cat = document.getElementById('newRuleCategory').value;
      const sm = document.getElementById('newRuleSplitMode').value;
      const pct = clamp(document.getElementById('newRuleCustomPct').value, 0, 100);
      if (!kw) return;
      state.aiConfig.customRules.push({
        id: 'rule_' + Date.now(),
        keyword: kw,
        category: cat,
        splitMode: sm,
        customVal: pct
      });
      document.getElementById('newRuleKeyword').value = '';
      saveState();
      renderAiAgentView();
    });
  }

  const btnCopyWebhook = document.getElementById('btnCopyWebhookUrl');
  if (btnCopyWebhook) {
    btnCopyWebhook.addEventListener('click', () => {
      navigator.clipboard.writeText(serverWebhookUrl).then(() => {
        btnCopyWebhook.textContent = '✅ Copiado!';
        setTimeout(() => (btnCopyWebhook.textContent = '📋 Copiar URL'), 2000);
      });
    });
  }

  const btnSyncCloud = document.getElementById('btnSyncCloudNow');
  if (btnSyncCloud) {
    btnSyncCloud.addEventListener('click', async () => {
      btnSyncCloud.textContent = '⏳ Buscando...';
      await syncCloudDirectlyInBrowser();
      if (serverConnected) {
        try {
          const res = await fetch('/api/state');
          if (res.ok) {
            const data = await res.json();
            if (data.state) mergeState(data.state);
          }
        } catch (e) {}
      }
      renderAll();
      btnSyncCloud.textContent = '✅ Sincronizado!';
      setTimeout(() => (btnSyncCloud.textContent = '🔄 Sincronizar Nuvem'), 2000);
    });
  }

  // Eventos da Vitrine Pierre Finance (Chat rápido IA e botões pílula)
  const formPierreChat = document.getElementById('formPierreQuickChat');
  if (formPierreChat) {
    formPierreChat.addEventListener('submit', async e => {
      e.preventDefault();
      const inputEl = document.getElementById('inputPierreQuickChat');
      const fbEl = document.getElementById('pierreQuickChatFeedback');
      const txt = (inputEl?.value || '').trim();
      if (!txt) return;
      if (fbEl) fbEl.textContent = '⏳ Interpretando com a IA...';
      await runAiNotificationCapture(txt, 'auto', '');
      if (inputEl) inputEl.value = '';
      if (fbEl) {
        fbEl.innerHTML = '<strong style="color:var(--primary);">✅ Gasto lançado e dividido na planilha!</strong>';
        setTimeout(() => {
          fbEl.textContent = '✨ Lança e divide automaticamente na planilha';
        }, 4000);
      }
    });
  }

  const btnPierreCard = document.getElementById('btnPierreGoCardTab');
  if (btnPierreCard) {
    btnPierreCard.addEventListener('click', () => {
      state.activeTab = 'ai_agent';
      saveState();
      renderAll();
    });
  }

  const btnPierreSync = document.getElementById('btnPierreSyncNow');
  if (btnPierreSync) {
    btnPierreSync.addEventListener('click', async () => {
      const orig = btnPierreSync.textContent;
      btnPierreSync.textContent = '⏳ Sincronizando iPhone...';
      await syncCloudDirectlyInBrowser();
      if (serverConnected) {
        try {
          const res = await fetch('/api/state');
          if (res.ok) {
            const data = await res.json();
            if (data.state) mergeState(data.state);
          }
        } catch (e) {}
      }
      renderAll();
      btnPierreSync.textContent = '✅ iPhone Sincronizado!';
      setTimeout(() => (btnPierreSync.textContent = orig), 2200);
    });
  }

  // Modal de Detalhamento do Acerto
  document.getElementById('btnOpenSettlementModal').addEventListener('click', () => {
    const summary = calculateMonthSummary();
    document.getElementById('modalSettlementBody').innerHTML = buildSettlementExplanationHtml(summary);
    document.getElementById('modalSettlement').classList.add('open');
  });
  document.getElementById('btnCloseSettlementModal').addEventListener('click', () => {
    document.getElementById('modalSettlement').classList.remove('open');
  });
  document.getElementById('btnCloseSettlementModal2').addEventListener('click', () => {
    document.getElementById('modalSettlement').classList.remove('open');
  });

  // Modal Nova Categoria / Aba
  document.getElementById('btnCloseNewCatModal').addEventListener('click', () => {
    document.getElementById('modalNewCategory').classList.remove('open');
  });
  document.getElementById('btnCancelNewCat').addEventListener('click', () => {
    document.getElementById('modalNewCategory').classList.remove('open');
  });
  document.getElementById('formNewCategory').addEventListener('submit', e => {
    e.preventDefault();
    const icon = document.getElementById('newCatIcon').value.trim() || '📌';
    const name = document.getElementById('newCatName').value.trim();
    const budget = Number(document.getElementById('newCatBudget').value) || 0;
    const defaultSplit = document.getElementById('newCatSplit').value;

    if (!name) return;
    const id = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_') + '_' + Date.now().toString(36).slice(-3);

    state.categories.push({
      id,
      name,
      icon,
      budget,
      defaultSplit,
      desc: `Planilha exclusiva para gastos de ${name}`
    });

    state.activeTab = id;
    document.getElementById('newCatName').value = '';
    document.getElementById('modalNewCategory').classList.remove('open');
    saveState();
    renderAll();
  });

  // Modal de Backup JSON
  document.getElementById('btnBackupJson').addEventListener('click', () => {
    document.getElementById('modalBackup').classList.add('open');
  });
  document.getElementById('btnCloseBackupModal').addEventListener('click', () => {
    document.getElementById('modalBackup').classList.remove('open');
  });
  document.getElementById('btnDownloadJson').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_planilha_casal_${state.currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('inputUploadJson').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported && imported.couple && imported.expensesByMonth) {
          state = imported;
          saveState();
          renderAll();
          document.getElementById('modalBackup').classList.remove('open');
          alert('Backup restaurado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  });

  // Sincronização em tempo real: se o iPhone enviar uma compra (na rua no 4G/5G ou em casa), atualiza a tela!
  setInterval(async () => {
    if (serverConnected) {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.state && data.state.aiLogs && data.state.aiLogs.length !== (state.aiLogs || []).length) {
            mergeState(data.state);
            renderAll();
          }
        }
      } catch (e) {}
    } else {
      await syncCloudDirectlyInBrowser();
    }
  }, 5000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().slice(0, 10);
  initEvents();
  loadState().then(() => {
    document.getElementById('entryDate').value = today.startsWith(state.currentMonth)
      ? today
      : `${state.currentMonth}-01`;
    renderAll();
  });
});
