(function() {
    const publicPages = [
        'login.html',
        'index.html',
        'home.html'
    ];

    const currentPage = window.location.pathname.split('/').pop();
    const isPublicPage = publicPages.some(page => currentPage.includes(page));

    if (isPublicPage) {
        return;
    }

    const token = localStorage.getItem('authToken');
    const usuario = localStorage.getItem('usuario');

    if (!token || !usuario) {
        console.log('Usuário não autenticado. Redirecionando para login...');
        window.location.href = '/web/index/login.html';
        return;
    }

    if (window.api) {
        window.api.verificarToken()
            .catch(error => {
                console.error('Token inválido ou expirado:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('usuario');
                window.location.href = '/web/index/login.html';
            });
    }
})();
