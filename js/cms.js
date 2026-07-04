/**
 * cms.js — CMS Local Storage Engine
 * Rafael França Advocacia — Site Principal
 *
 * CRUD completo para posts do blog via localStorage.
 * Zero dependência de servidor — 100% client-side.
 * v3.0.0
 */

const CMS_KEY = 'rafaelFrancaCMS_posts';

const DEFAULT_POSTS = [
  {
    id: 'p1',
    title: 'Demitido Sem Receber Tudo? Entenda Suas Verbas Rescisórias',
    excerpt: 'Saber quais verbas rescisórias são devidas pode valer milhares de reais. Veja o que a CLT garante a você — em linguagem direta.',
    content: `<p>Se você foi demitido sem justa causa, a empresa tem obrigação legal de pagar uma série de verbas. Muita gente aceita o que a empresa propõe sem saber que está sendo lesada.</p>
<h2>Quais verbas são devidas na demissão sem justa causa?</h2>
<ul>
  <li><strong>Saldo de salário:</strong> os dias trabalhados no mês da demissão.</li>
  <li><strong>Aviso prévio:</strong> 30 dias + 3 dias por ano trabalhado (máximo 90 dias).</li>
  <li><strong>13º salário proporcional:</strong> 1/12 por mês trabalhado no ano.</li>
  <li><strong>Férias vencidas + 1/3:</strong> se houver período aquisitivo completo.</li>
  <li><strong>Férias proporcionais + 1/3.</strong></li>
  <li><strong>Multa de 40% do FGTS:</strong> sobre todos os depósitos realizados.</li>
  <li><strong>Liberação do FGTS:</strong> para saque imediato.</li>
  <li><strong>Seguro-desemprego:</strong> dependendo do tempo de serviço.</li>
</ul>
<h2>Horas extras e outros direitos esquecidos</h2>
<p>Além das verbas rescisórias, muitos trabalhadores têm direito a reclamar horas extras não pagas, adicional noturno, adicional de insalubridade e diferenças salariais dos últimos 2 anos antes da demissão.</p>
<blockquote>O prazo para ingressar com ação trabalhista é de 2 anos após a demissão. Não espere esse tempo passar.</blockquote>
<h2>Como o escritório pode ajudar?</h2>
<p>O Dr. Rafael França faz uma análise gratuita do seu caso. Se identificarmos valores a mais, entramos com a ação imediatamente. Em muitos casos trabalhistas, os honorários são cobrados apenas se houver vitória — sem risco para você.</p>`,
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=900&auto=format&fit=crop',
    coverAlt: 'Pessoa analisando documentos trabalhistas',
    date: '2026-07-01',
    slug: 'demitido-sem-receber-verbas-rescisórias',
    category: 'Trabalhista',
  },
  {
    id: 'p2',
    title: 'Plano de Saúde Negou Tratamento? Saiba Como Forçar a Cobertura em 48h',
    excerpt: 'Uma liminar judicial pode obrigar o plano a cobrir o tratamento em menos de dois dias. Entenda como funciona e o que você precisa para agir.',
    content: `<p>A negativa de cobertura por plano de saúde é uma das situações mais angustiantes que alguém pode enfrentar. Você está doente, o médico prescreveu o tratamento, e o plano simplesmente diz "não cobrimos". Essa situação tem solução jurídica.</p>
<h2>O que é a Tutela de Urgência (liminar)?</h2>
<p>A Tutela de Urgência é um tipo de decisão judicial que pode ser concedida de forma rápida — às vezes em horas — quando há risco à saúde ou à vida. Ela obriga o plano a cobrir o tratamento antes mesmo da conclusão do processo.</p>
<h2>Quando o plano é obrigado a cobrir?</h2>
<ul>
  <li>Quando o procedimento é indicado por médico credenciado</li>
  <li>Quando a doença está coberta pelo plano (mesmo que o procedimento específico não esteja listado)</li>
  <li>Quando há resolução da ANS que obriga a cobertura</li>
  <li>Quando o plano alega carência de forma indevida em situação de urgência ou emergência</li>
</ul>
<h2>O que você precisa ter para entrar com a ação?</h2>
<ul>
  <li>Laudo médico com a prescrição do tratamento</li>
  <li>Carta de negativa do plano (ou print de e-mail/mensagem)</li>
  <li>Carteirinha/contrato do plano de saúde</li>
</ul>
<blockquote>Em casos de risco de vida, conseguimos liminares em 24 a 72 horas. Cada hora conta.</blockquote>`,
    coverUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=900&auto=format&fit=crop',
    coverAlt: 'Documentos médicos e prescrição sobre mesa',
    date: '2026-06-25',
    slug: 'plano-saude-negou-tratamento-liminar',
    category: 'Saúde',
  },
  {
    id: 'p3',
    title: 'Conta Bloqueada Judicialmente: O Que Fazer Imediatamente?',
    excerpt: 'Um bloqueio Sisbajud pode paralisar sua vida financeira. Saiba como reverter esse quadro e proteger o mínimo existencial garantido pela Constituição.',
    content: `<p>Você tenta fazer uma compra ou transferência e descobre que sua conta foi bloqueada por ordem judicial. É uma situação que paralisa qualquer pessoa. Mas existe saída — e quanto mais rápido você agir, melhor.</p>
<h2>O que é o Sisbajud?</h2>
<p>O Sisbajud (antigo Bacenjud) é o sistema do Judiciário que permite ao juiz ordenar, eletronicamente, o bloqueio de valores nas contas bancárias de uma pessoa ou empresa. Isso pode acontecer em execuções de dívidas, ações trabalhistas, tributárias e até em alguns casos cíveis.</p>
<h2>É possível desbloquear a conta?</h2>
<p>Sim. Existem várias estratégias:</p>
<ul>
  <li><strong>Impenhorabilidade do salário:</strong> a lei protege valores de natureza salarial de bloqueio.</li>
  <li><strong>Mínimo existencial:</strong> valores necessários à sobrevivência não podem ser bloqueados.</li>
  <li><strong>Excesso de penhora:</strong> se bloquearam mais do que a dívida, é possível reduzir.</li>
  <li><strong>Nulidade da citação:</strong> se você não foi citado corretamente, o processo inteiro pode ser anulado.</li>
  <li><strong>Dívida paga ou prescrita:</strong> se a dívida já foi paga ou o prazo prescreveu.</li>
</ul>
<h2>Qual o prazo para agir?</h2>
<p>Não há um prazo fixo, mas quanto mais rápido melhor — especialmente se você precisar dos valores bloqueados para pagar contas essenciais. O escritório pode peticionar em regime de urgência.</p>`,
    coverUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=900&auto=format&fit=crop',
    coverAlt: 'Cartão bancário bloqueado e documentos jurídicos',
    date: '2026-06-18',
    slug: 'conta-bloqueada-sisbajud-o-que-fazer',
    category: 'Bancário',
  },
];

const CMS = {
  _cache: null,

  init() {
    // Migração de chave antiga (outros projetos)
    ['rafaelMachadoCMS_posts', 'rafaelFrancaBancCMS_posts'].forEach(function (oldKey) {
      if (localStorage.getItem(oldKey) && !localStorage.getItem(CMS_KEY)) {
        localStorage.setItem(CMS_KEY, localStorage.getItem(oldKey));
        localStorage.removeItem(oldKey);
      }
    });

    const stored = localStorage.getItem(CMS_KEY);
    if (!stored) {
      localStorage.setItem(CMS_KEY, JSON.stringify(DEFAULT_POSTS));
      return;
    }
    try {
      JSON.parse(stored); // validação
    } catch (_) {
      localStorage.setItem(CMS_KEY, JSON.stringify(DEFAULT_POSTS));
    }
  },

  _load() {
    this.init();
    try {
      const raw = localStorage.getItem(CMS_KEY);
      return JSON.parse(raw) || [];
    } catch (_) {
      return DEFAULT_POSTS.slice();
    }
  },

  getPosts(opts) {
    opts = opts || {};
    let posts = this._load();

    // Filtro por categoria
    if (opts.category) {
      posts = posts.filter(function (p) {
        return (p.category || '').toLowerCase() === opts.category.toLowerCase();
      });
    }

    // Filtro por status (para compatibilidade; todos são 'published' neste CMS)
    if (opts.status && opts.status !== 'all') {
      // noop — todos os posts são published nesta versão
    }

    // Ordenar por data
    posts = posts.sort(function (a, b) {
      return new Date(b.date || b.publishedAt || 0) - new Date(a.date || a.publishedAt || 0);
    });

    // Limite
    if (opts.limit && opts.limit > 0) {
      posts = posts.slice(0, opts.limit);
    }

    return posts;
  },

  getPost(id) {
    return this._load().find(function (p) { return p.id === id; }) || null;
  },

  getPostBySlug(slug) {
    return this._load().find(function (p) { return p.slug === slug; }) || null;
  },

  createPost(data) {
    const posts = this._load();
    const newPost = {
      id: Date.now().toString(),
      title:    data.title    || 'Sem título',
      excerpt:  data.excerpt  || '',
      content:  data.content  || '',
      coverUrl: data.coverUrl || '',
      coverAlt: data.coverAlt || data.title || '',
      date:     data.date     || new Date().toISOString().split('T')[0],
      slug:     data.slug     || this._slugify(data.title || ''),
      category: data.category || '',
      publishedAt: Date.now(),
    };
    posts.unshift(newPost);
    localStorage.setItem(CMS_KEY, JSON.stringify(posts));
    this._cache = null;
    return newPost;
  },

  updatePost(id, data) {
    const posts = this._load();
    const idx = posts.findIndex(function (p) { return p.id === id; });
    if (idx === -1) return null;
    posts[idx] = Object.assign({}, posts[idx], data, {
      id:   id,
      slug: data.slug || posts[idx].slug || this._slugify(data.title || posts[idx].title),
    });
    localStorage.setItem(CMS_KEY, JSON.stringify(posts));
    this._cache = null;
    return posts[idx];
  },

  deletePost(id) {
    const posts = this._load();
    const filtered = posts.filter(function (p) { return p.id !== id; });
    if (filtered.length === posts.length) return false;
    localStorage.setItem(CMS_KEY, JSON.stringify(filtered));
    this._cache = null;
    return true;
  },

  exportJSON() {
    const data = JSON.stringify(this._load(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'backup-blog-rafaelfranca-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON(json) {
    try {
      const posts = JSON.parse(json);
      if (!Array.isArray(posts)) return false;
      localStorage.setItem(CMS_KEY, JSON.stringify(posts));
      this._cache = null;
      return true;
    } catch (_) { return false; }
  },

  _slugify(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 80);
  },
};

window.CMS = CMS;
