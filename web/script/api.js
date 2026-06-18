const API_BASE_URL = 'http://localhost:3003';

class ApiClient {
  getToken() {
    return localStorage.getItem('authToken');
  }

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
        if (response.status === 401) {
          this.handleUnauthorized();
        }

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

  handleUnauthorized() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');

    if (!window.location.pathname.includes('login.html')) {
      window.location.href = '/web/index/login.html';
    }
  }

  async cadastro(dados) {
    return this.request('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  async login(dados) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  async verificarToken() {
    return this.request('/auth/verificar-token', {
      method: 'GET',
      authenticated: true,
    });
  }

  async buscarPerfil() {
    return this.request('/api/usuarios/perfil', {
      method: 'GET',
      authenticated: true,
    });
  }

  async atualizarPerfil(dados) {
    return this.request('/api/usuarios/perfil', {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify(dados),
    });
  }

  async listarBarbeiros() {
    return this.request('/api/barbeiros', {
      method: 'GET',
    });
  }

  async listarServicos() {
    return this.request('/api/servicos', {
      method: 'GET',
    });
  }

  async listarMeusAgendamentos() {
    return this.request('/api/agendamentos/meus-agendamentos', {
      method: 'GET',
      authenticated: true,
    });
  }

  async criarAgendamento(dados) {
    return this.request('/api/agendamentos', {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify(dados),
    });
  }

  async buscarAgendamento(id) {
    return this.request(`/api/agendamentos/${id}`, {
      method: 'GET',
      authenticated: true,
    });
  }

  async atualizarAgendamento(id, dados) {
    return this.request(`/api/agendamentos/${id}`, {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify(dados),
    });
  }

  async cancelarAgendamento(id) {
    return this.request(`/api/agendamentos/${id}/cancelar`, {
      method: 'PATCH',
      authenticated: true,
      body: JSON.stringify({}),
    });
  }

  async listarHorariosBloqueados() {
    return this.request('/api/horarios-bloqueados', {
      method: 'GET',
    });
  }

  async listarHorariosBloqueadosPorData(data) {
    return this.request(`/api/horarios-bloqueados/data/${data}`, {
      method: 'GET',
    });
  }

  async listarHorariosBloqueadosPorBarbeiroEData(nomeBarbeiro, data) {
    return this.request(
      `/api/horarios-bloqueados/buscar?nomeBarbeiro=${encodeURIComponent(nomeBarbeiro)}&data=${data}`,
      {
        method: 'GET',
      }
    );
  }
}

const api = new ApiClient();

window.api = api;
