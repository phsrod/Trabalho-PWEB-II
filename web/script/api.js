// ============================================
// BARBEARIA STYLE - API HELPER
// ============================================

const API_BASE_URL = 'http://localhost:3003';

/**
 * Classe para gerenciar chamadas à API
 */
class ApiClient {
    /**
     * Retorna o token de autenticação do localStorage
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Retorna os headers padrão para requisições
     */
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * Faz uma requisição genérica à API
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.authenticated),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Se o token expirou ou é inválido, redireciona para login
                if (response.status === 401) {
                    this.handleUnauthorized();
                }

                // Se excedeu o limite de requisições (rate limiting)
                if (response.status === 429) {
                    throw new Error('Muitas tentativas. Aguarde 1 minuto para tentar novamente.');
                }

                throw new Error(data.mensagem || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    /**
     * Trata requisições não autorizadas
     */
    handleUnauthorized() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');

        // Não redireciona se já estiver na página de login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/web/index/login.html';
        }
    }

    // ============================================
    // AUTENTICAÇÃO
    // ============================================

    /**
     * Faz cadastro de novo usuário
     */
    async cadastro(dados) {
        return this.request('/auth/cadastro', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    /**
     * Faz login
     */
    async login(dados) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    /**
     * Verifica se o token é válido
     */
    async verificarToken() {
        return this.request('/auth/verificar-token', {
            method: 'GET',
            authenticated: true,
        });
    }

    // ============================================
    // USUÁRIOS
    // ============================================

    /**
     * Busca perfil do usuário logado
     */
    async buscarPerfil() {
        return this.request('/api/usuarios/perfil', {
            method: 'GET',
            authenticated: true,
        });
    }

    /**
     * Atualiza perfil do usuário
     */
    async atualizarPerfil(dados) {
        return this.request('/api/usuarios/perfil', {
            method: 'PUT',
            authenticated: true,
            body: JSON.stringify(dados),
        });
    }

    // ============================================
    // BARBEIROS (Apenas Leitura - Dados Fixos)
    // ============================================

    /**
     * Lista todos os barbeiros
     */
    async listarBarbeiros() {
        return this.request('/api/barbeiros', {
            method: 'GET',
        });
    }

    // ============================================
    // SERVIÇOS (Apenas Leitura - Dados Fixos)
    // ============================================

    /**
     * Lista todos os serviços
     */
    async listarServicos() {
        return this.request('/api/servicos', {
            method: 'GET',
        });
    }

    // ============================================
    // AGENDAMENTOS
    // ============================================

    /**
     * Lista agendamentos do usuário logado
     */
    async listarMeusAgendamentos() {
        return this.request('/api/agendamentos/meus-agendamentos', {
            method: 'GET',
            authenticated: true,
        });
    }

    /**
     * Cria novo agendamento
     */
    async criarAgendamento(dados) {
        return this.request('/api/agendamentos', {
            method: 'POST',
            authenticated: true,
            body: JSON.stringify(dados),
        });
    }

    /**
     * Busca agendamento por ID
     */
    async buscarAgendamento(id) {
        return this.request(`/api/agendamentos/${id}`, {
            method: 'GET',
            authenticated: true,
        });
    }

    /**
     * Atualiza agendamento
     */
    async atualizarAgendamento(id, dados) {
        return this.request(`/api/agendamentos/${id}`, {
            method: 'PUT',
            authenticated: true,
            body: JSON.stringify(dados),
        });
    }

    /**
     * Cancela agendamento
     */
    async cancelarAgendamento(id) {
        return this.request(`/api/agendamentos/${id}/cancelar`, {
            method: 'PATCH',
            authenticated: true,
            body: JSON.stringify({}),
        });
    }

    // ============================================
    // HORÁRIOS BLOQUEADOS
    // ============================================

    /**
     * Lista todos os horários bloqueados
     */
    async listarHorariosBloqueados() {
        return this.request('/api/horarios-bloqueados', {
            method: 'GET',
        });
    }

    /**
     * Lista horários bloqueados por data
     */
    async listarHorariosBloqueadosPorData(data) {
        return this.request(`/api/horarios-bloqueados/data/${data}`, {
            method: 'GET',
        });
    }

    /**
     * Lista horários bloqueados por barbeiro e data
     */
    async listarHorariosBloqueadosPorBarbeiroEData(nomeBarbeiro, data) {
        return this.request(
            `/api/horarios-bloqueados/buscar?nomeBarbeiro=${encodeURIComponent(nomeBarbeiro)}&data=${data}`,
            {
                method: 'GET',
            }
        );
    }
}

// Instância global da API
const api = new ApiClient();

// Torna disponível globalmente
window.api = api;
