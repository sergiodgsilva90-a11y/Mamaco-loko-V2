// ========================================
// MAMAKO LOKO STORE - SCRIPT PRINCIPAL
// ========================================

let todasAsContas = [];
let contasFiltradas = [];
let filtroAtivo = 'todas';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contasContainer')) {
        carregarContas();
        configurarEventos();
    }
    if (document.getElementById('conta-nome')) {
        carregarDetalhes();
    }
});

// Carregar contas do JSON
async function carregarContas() {
    try {
        const resposta = await fetch('data/contas.json');
        const dados = await resposta.json();
        todasAsContas = dados.contas;
        contasFiltradas = [...todasAsContas];
        renderizarContas(contasFiltradas);
        document.getElementById('loadingMsg').style.display = 'none';
    } catch (erro) {
        console.error('Erro:', erro);
        document.getElementById('loadingMsg').textContent = 'Erro ao carregar contas';
    }
}

// Renderizar contas
function renderizarContas(contas) {
    const container = document.getElementById('contasContainer');
    const emptyMsg = document.getElementById('emptyMsg');

    if (contas.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    container.innerHTML = contas.map(conta => `
        <div class="conta-card" onclick="irParaDetalhes('${conta.id}')">
            <img src="${conta.imagem}" alt="${conta.nome}" class="card-img">
            <div class="card-content">
                <h3 class="card-nome">${conta.nome}</h3>
                <div class="card-info">
                    <span class="card-info-label">Míticos:</span> ${conta.miticos.length}
                </div>
                <div class="card-info">
                    <span class="card-info-label">Void:</span> ${conta.vazio.length}
                </div>
                <div class="card-preco">${conta.preco}</div>
                <span class="card-status status-${conta.status.toLowerCase()}">${conta.status}</span>
                <button class="card-btn" onclick="event.stopPropagation(); irParaDetalhes('${conta.id}')">VER DETALHES</button>
            </div>
        </div>
    `).join('');
}

// Configurar eventos
function configurarEventos() {
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroAtivo = btn.dataset.filter;
            aplicarFiltros();
        });
    });

    // Busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros);
    }

    // Navegação
    atualizarNav();
}

// Aplicar filtros
function aplicarFiltros() {
    const termo = document.getElementById('searchInput')?.value.toLowerCase() || '';
    let resultado = todasAsContas;

    if (filtroAtivo !== 'todas') {
        resultado = resultado.filter(c => c.status.toLowerCase() === filtroAtivo);
    }

    if (termo) {
        resultado = resultado.filter(c => 
            c.nome.toLowerCase().includes(termo) ||
            c.miticos.some(m => m.toLowerCase().includes(termo)) ||
            c.vazio.some(v => v.toLowerCase().includes(termo))
        );
    }

    contasFiltradas = resultado;
    renderizarContas(contasFiltradas);
}

// Ir para detalhes
function irParaDetalhes(id) {
    window.location.href = `conta.html?id=${id}`;
}

// Carregar detalhes da conta
function carregarDetalhes() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    fetch('data/contas.json')
        .then(r => r.json())
        .then(dados => {
            const conta = dados.contas.find(c => c.id === id);
            if (!conta) window.location.href = 'index.html';
            else preencherDetalhes(conta);
        });
}

// Preencher página de detalhes
function preencherDetalhes(conta) {
    document.getElementById('breadcrumb-name').textContent = conta.nome;
    document.getElementById('conta-nome').textContent = conta.nome;
    document.getElementById('conta-status').textContent = conta.status;
    document.getElementById('conta-status').className = `status-badge status-${conta.status.toLowerCase()}`;
    document.getElementById('conta-preco').textContent = conta.preco;
    document.getElementById('conta-descricao').textContent = conta.descricao;
    document.getElementById('imgPrincipal').src = conta.imagem;

    document.getElementById('miticos').innerHTML = conta.miticos.map(m => 
        `<span class="badge">👑 ${m}</span>`
    ).join('');

    document.getElementById('vazio').innerHTML = conta.vazio.map(v => 
        `<span class="badge">🌑 ${v}</span>`
    ).join('');

    document.getElementById('outros').innerHTML = conta.outros.map(o => 
        `<span class="badge">⭐ ${o}</span>`
    ).join('');

    document.title = `${conta.nome} - Mamako Loko Store`;
}

// Atualizar navegação
function atualizarNav() {
    const pagina = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.href.includes(pagina)) link.classList.add('active');
    });
}