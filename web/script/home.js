// ============================================
// BARBEARIA STYLE - SCRIPT PRINCIPAL (HOME)
// ============================================

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

/**
 * Inicializa todas as funcionalidades da aplicação
 */
function initApp() {
    initGreeting();
    initUserDropdown();
    initHeroCarousel();
    initNavigation();
    initCalendar();
    initBookingSystem();
    initServiceCards();
    initScrollAnimations();
    initServiceModal();
    initPriceCalculator();
    initBarbersSection();
}

// ============================================
// 1. SAUDAÇÃO DINÂMICA
// ============================================
function initGreeting() {
    // Verifica se o usuário está autenticado
    const authToken = localStorage.getItem('authToken');
    const greetingContainer = document.querySelector('.greeting');
    const userNameElement = document.getElementById('userName');

    // Sempre exibe a saudação
    if (greetingContainer) {
        greetingContainer.style.display = 'flex';
    }

    // Se não estiver autenticado, exibe saudação simples
    if (!authToken) {
        if (userNameElement) {
            userNameElement.style.display = 'none';
        }
        updateGreeting(false);
        setInterval(() => updateGreeting(false), 3600000);
        return;
    }

    // Se estiver autenticado, carrega dados do servidor SINCRONAMENTE
    try {
        // ============================================
        // COMUNICAÇÃO SÍNCRONA - XMLHttpRequest
        // ============================================
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:3003/api/usuarios/perfil', false); // false = SÍNCRONO
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(); // Bloqueia aqui até receber resposta do servidor

        // Verifica se a requisição foi bem-sucedida
        if (xhr.status === 200) {
            const userData = JSON.parse(xhr.responseText);
            
            // Atualiza localStorage com dados frescos do servidor
            localStorage.setItem('usuario', JSON.stringify(userData));
            
            // Exibe o nome do usuário
            if (userNameElement) {
                userNameElement.style.display = 'inline';
                const nomePartes = userData.nomeCompleto.split(' ');
                const primeiroNome = nomePartes[0];
                const inicialSobrenome = nomePartes.length > 1 ? nomePartes[nomePartes.length - 1].charAt(0) + '.' : '';
                userNameElement.textContent = `${primeiroNome} ${inicialSobrenome}`;
            }
            
            updateGreeting(true);
            setInterval(() => updateGreeting(true), 3600000);
        } else {
            // Se falhar, usa localStorage como fallback
            const usuarioData = localStorage.getItem('usuario');
            if (usuarioData) {
                const usuario = JSON.parse(usuarioData);
                if (userNameElement && usuario.nomeCompleto) {
                    userNameElement.style.display = 'inline';
                    const nomePartes = usuario.nomeCompleto.split(' ');
                    const primeiroNome = nomePartes[0];
                    const inicialSobrenome = nomePartes.length > 1 ? nomePartes[nomePartes.length - 1].charAt(0) + '.' : '';
                    userNameElement.textContent = `${primeiroNome} ${inicialSobrenome}`;
                }
                updateGreeting(true);
            } else {
                updateGreeting(false);
            }
            setInterval(() => updateGreeting(true), 3600000);
        }
    } catch (error) {
        console.error('Erro ao carregar dados sincronamente:', error);
        // Fallback para localStorage
        const usuarioData = localStorage.getItem('usuario');
        if (usuarioData) {
            const usuario = JSON.parse(usuarioData);
            if (userNameElement && usuario.nomeCompleto) {
                userNameElement.style.display = 'inline';
                const nomePartes = usuario.nomeCompleto.split(' ');
                const primeiroNome = nomePartes[0];
                const inicialSobrenome = nomePartes.length > 1 ? nomePartes[nomePartes.length - 1].charAt(0) + '.' : '';
                userNameElement.textContent = `${primeiroNome} ${inicialSobrenome}`;
            }
            updateGreeting(true);
        } else {
            updateGreeting(false);
        }
        setInterval(() => updateGreeting(true), 3600000);
    }

    function updateGreeting(isAuthenticated) {
        const now = new Date();
        const hour = now.getHours();
        let greeting = '';

        if (hour >= 5 && hour < 12) {
            greeting = 'Bom dia';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'Boa tarde';
        } else {
            greeting = 'Boa noite';
        }

        const greetingElement = document.getElementById('greeting');
        if (greetingElement) {
            // Se estiver autenticado, adiciona vírgula após a saudação
            if (isAuthenticated) {
                greetingElement.textContent = greeting + ',';
            } else {
                // Se não estiver autenticado, não adiciona vírgula
                greetingElement.textContent = greeting;
            }
        }
    }
}

// ============================================
// 2. DROPDOWN DO USUÁRIO
// ============================================
function initUserDropdown() {
    const userBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (!userBtn || !dropdownMenu) return;

    // Verifica se o usuário está autenticado
    const authToken = localStorage.getItem('authToken');
    const usuarioData = localStorage.getItem('usuario');

    // Atualiza o conteúdo do dropdown baseado no estado de autenticação
    if (!authToken || !usuarioData) {
        // Não autenticado: mostra apenas opção de fazer login
        dropdownMenu.innerHTML = '<a href="/web/index/login.html">Fazer Login</a>';
    } else {
        // Autenticado: mostra perfil e sair
        dropdownMenu.innerHTML = `
            <a href="/web/index/profile.html">Perfil</a>
            <a href="#" id="logoutLink">Sair</a>
        `;
    }

    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isVisible ? 'none' : 'block';

        // Adiciona animação
        if (!isVisible) {
            dropdownMenu.style.opacity = '0';
            dropdownMenu.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                dropdownMenu.style.transition = 'all 0.3s ease';
                dropdownMenu.style.opacity = '1';
                dropdownMenu.style.transform = 'translateY(0)';
            }, 10);
        }
    });

    // Fecha ao clicar fora
    window.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Adiciona evento de logout (se estiver autenticado)
    if (authToken && usuarioData) {
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove dados de autenticação
                localStorage.removeItem('authToken');
                localStorage.removeItem('usuario');
                // Redireciona para login
                window.location.href = '/web/index/login.html';
            });
        }
    }
}

// ============================================
// 3. HERO CAROUSEL
// ============================================
function initHeroCarousel() {
    const heroImages = [
        '/web/img/pic1.jpg',
        '/web/img/pic2.jpg',
        '/web/img/pic3.jpg',
        '/web/img/pic4.jpg',
        '/web/img/pic5.jpg'
    ];

    const heroBg1 = document.querySelector('.hero-bg1');
    const heroBg2 = document.querySelector('.hero-bg2');

    if (!heroBg1 || !heroBg2) return;

    let currentHero = 0;
    let topDiv = heroBg1;
    let bottomDiv = heroBg2;

    // Preload das imagens
    heroImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Inicializa com a primeira imagem
    topDiv.style.backgroundImage = `url('${heroImages[currentHero]}')`;
    topDiv.classList.add('show');

    // Troca de imagem a cada 5 segundos
    setInterval(() => {
        const nextHero = (currentHero + 1) % heroImages.length;
        bottomDiv.style.backgroundImage = `url('${heroImages[nextHero]}')`;
        bottomDiv.classList.add('show');

        [topDiv, bottomDiv] = [bottomDiv, topDiv];
        setTimeout(() => bottomDiv.classList.remove('show'), 1000);
        currentHero = nextHero;
    }, 5000);
}

// ============================================
// 4. NAVEGAÇÃO SUAVE
// ============================================
function initNavigation() {
    // Menu hambúrguer
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Fecha menu ao clicar em um link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Scroll suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();

            // Verifica se está tentando agendar sem estar autenticado
            if (href === '#booking') {
                const authToken = localStorage.getItem('authToken');
                const usuarioData = localStorage.getItem('usuario');

                if (!authToken || !usuarioData) {
                    showNotification('Faça login para realizar um agendamento', 'error');
                    setTimeout(() => {
                        window.location.href = '/web/index/login.html';
                    }, 1500);
                    return;
                }
            }

            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// 5. SISTEMA DE CALENDÁRIO
// ============================================
function initCalendar() {
    const stepCalendar = document.getElementById('step-calendar');
    const calendarGrid = document.querySelector('.calendar-grid');
    const calendarHeader = document.querySelector('.calendar-header h4');
    const navButtons = document.querySelectorAll('.calendar-nav');

    if (!stepCalendar || !calendarGrid || !calendarHeader) return;

    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const nomesMes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Renderiza o calendário
    function renderCalendar(month, year) {
        calendarGrid.innerHTML = '';
        calendarHeader.textContent = `${nomesMes[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Cabeçalhos dos dias da semana
        const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.classList.add('calendar-day-header');
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Espaços vazios antes do primeiro dia
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDiv);
        }

        // Dias do mês
        for (let day = 1; day <= lastDate; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');

            const dateObj = new Date(year, month, day);
            dateObj.setHours(0, 0, 0, 0);

            if (dateObj < today) {
                dayDiv.classList.add('disabled');
            }

            // Destaca o dia de hoje
            if (dateObj.getTime() === today.getTime()) {
                dayDiv.classList.add('today');
            }

            dayDiv.textContent = day;
            calendarGrid.appendChild(dayDiv);

            dayDiv.addEventListener('click', () => {
                // Verifica se o usuário está autenticado
                const authToken = localStorage.getItem('authToken');
                const usuarioData = localStorage.getItem('usuario');

                if (!authToken || !usuarioData) {
                    showNotification('Faça login para realizar um agendamento', 'error');
                    setTimeout(() => {
                        window.location.href = '/web/index/login.html';
                    }, 1500);
                    return;
                }

                if (dayDiv.classList.contains('disabled')) {
                    showNotification('Não é possível agendar em datas passadas', 'error');
                    return;
                }

                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                dayDiv.classList.add('selected');

                const dataFormatada = `${diasSemana[dateObj.getDay()]}, ${day} de ${nomesMes[month]} de ${year}`;
                
                // Atualiza informações selecionadas
                const selectedDateSpan = document.querySelector('.selected-date-info span');
                const selectedInfoDate = document.querySelector('.selected-info p span');
                
                if (selectedDateSpan) selectedDateSpan.textContent = dataFormatada;
                if (selectedInfoDate) selectedInfoDate.textContent = dataFormatada;

                // Armazena a data selecionada
                window.selectedDate = dateObj;

                // Renderiza horários disponíveis
                // Se houver barbeiro selecionado, filtra por ele
                const barberName = window.selectedBarber ? window.selectedBarber.name : null;
                renderTimeSlots(dateObj, barberName);

                // Transição suave para próxima etapa
                setTimeout(() => {
                    stepCalendar.classList.remove('active');
                    document.getElementById('step-time').classList.add('active');
                    scrollToSection('booking');
                }, 300);
            });
        }
    }

    // Navegação entre meses
    if (navButtons.length >= 2) {
        navButtons[0].addEventListener('click', () => {
            if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                showNotification('Você já está no mês atual', 'info');
                return;
            }
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });

        navButtons[1].addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
    }

    // Inicializa o calendário
    renderCalendar(currentMonth, currentYear);
}

// ============================================
// 6. SISTEMA DE AGENDAMENTO
// ============================================
function initBookingSystem() {
    const stepTime = document.getElementById('step-time');
    const stepService = document.getElementById('step-service');
    const timeSlotsContainer = document.querySelector('.time-slots');
    const bookingForm = document.getElementById('bookingForm');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const closePopup = document.getElementById('closePopup');

    if (!timeSlotsContainer || !bookingForm) return;

    const workingHours = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                         '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

    // Renderiza horários disponíveis
    window.renderTimeSlots = async function(date, nomeBarbeiro = null) {
        if (!timeSlotsContainer) return;

        timeSlotsContainer.innerHTML = '';

        // Adiciona loading
        const loading = document.createElement('div');
        loading.classList.add('loading-slots');
        loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando horários...';
        timeSlotsContainer.appendChild(loading);

        // Busca horários bloqueados para a data selecionada
        const dataFormatada = formatDateForAPI(date);
        let occupiedSlots = [];

        try {
            let horariosBloqueados;

            // Se tem barbeiro selecionado, busca apenas os horários dele
            if (nomeBarbeiro) {
                horariosBloqueados = await api.listarHorariosBloqueadosPorBarbeiroEData(nomeBarbeiro, dataFormatada);
            } else {
                // Se não tem barbeiro, busca todos os horários bloqueados da data
                horariosBloqueados = await api.listarHorariosBloqueadosPorData(dataFormatada);
            }

            // Extrai apenas os horários
            occupiedSlots = horariosBloqueados.map(h => h.horario);
        } catch (error) {
            console.error('Erro ao buscar horários bloqueados:', error);
            // Continua sem os horários bloqueados
        }

        // Renderiza horários
        setTimeout(() => {
            timeSlotsContainer.innerHTML = '';

            workingHours.forEach(hour => {
                const slot = document.createElement('div');
                slot.classList.add('time-slot');

                const [h, m] = hour.split(':');
                const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(h), parseInt(m));
                const now = new Date();

                // Verifica se o horário já passou
                if (slotDate < now) {
                    slot.classList.add('unavailable');
                    slot.title = 'Horário já passou';
                }
                // Se tem barbeiro selecionado E o horário está ocupado para esse barbeiro
                else if (nomeBarbeiro && occupiedSlots.includes(hour)) {
                    slot.classList.add('unavailable-striked');
                    slot.title = `Horário ocupado para ${nomeBarbeiro}`;
                }
                // Horário disponível
                else {
                    slot.title = 'Clique para selecionar';
                }

                slot.textContent = hour;
                timeSlotsContainer.appendChild(slot);

                slot.addEventListener('click', () => {
                    // Horários passados não podem ser selecionados
                    if (slotDate < now) {
                        showNotification('Este horário já passou', 'error');
                        return;
                    }

                    // Se tem barbeiro selecionado e o horário está ocupado
                    if (nomeBarbeiro && occupiedSlots.includes(hour)) {
                        showNotification(`Este horário não está disponível para ${nomeBarbeiro}`, 'error');
                        return;
                    }

                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');

                    window.selectedTime = hour;

                    const selectedInfoTime = document.querySelector('.selected-info p:nth-child(2) span');
                    if (selectedInfoTime) selectedInfoTime.textContent = hour;

                    // Se não há barbeiro selecionado, filtra os barbeiros disponíveis para este horário
                    if (!nomeBarbeiro && window.selectedDate) {
                        filterAvailableBarbers(window.selectedDate, hour);
                    }

                    // Transição suave para próxima etapa
                    setTimeout(() => {
                        if (stepTime) stepTime.classList.remove('active');
                        if (stepService) stepService.classList.add('active');
                        scrollToSection('booking');
                    }, 300);
                });
            });

            // Animação de entrada
            const slots = timeSlotsContainer.querySelectorAll('.time-slot');
            slots.forEach((slot, index) => {
                slot.style.opacity = '0';
                slot.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    slot.style.transition = 'all 0.3s ease';
                    slot.style.opacity = '1';
                    slot.style.transform = 'translateY(0)';
                }, index * 30);
            });
        }, 500);
    };

    // Listener para mudança de barbeiro - re-renderiza horários
    const barberSelect = document.getElementById('barber');
   

    // Validação e submissão do formulário
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const service = document.getElementById('service');
        const barber = document.getElementById('barber');

        // Validações
        if (!service.value) {
            showNotification('Por favor, selecione um serviço', 'error');
            service.focus();
            return;
        }

        if (!barber.value) {
            showNotification('Por favor, selecione um barbeiro', 'error');
            barber.focus();
            return;
        }

        if (!window.selectedDate || !window.selectedTime) {
            showNotification('Por favor, selecione data e horário', 'error');
            return;
        }

        // Mostra loading
        const submitBtn = bookingForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';
        submitBtn.disabled = true;

        const selectedDate = document.querySelector('.selected-info p span').textContent;
        const selectedTime = document.querySelector('.selected-info p:nth-child(2) span').textContent;
        const serviceText = service.selectedOptions[0].textContent;
        const barberText = barber.selectedOptions[0].textContent;

        // Prepara dados para enviar à API
        const dadosAgendamento = {
            nomeBarbeiro: barberText,
            nomeServico: serviceText.split(' - ')[0], // Remove o preço
            data: formatDateForAPI(window.selectedDate), // YYYY-MM-DD
            horario: window.selectedTime, // HH:MM
            observacoes: document.getElementById('notes')?.value || undefined
        };

        // Cria agendamento via API
        api.criarAgendamento(dadosAgendamento)
            .then(agendamento => {
                // Preenche o popup
                const popupDate = document.getElementById('popupDate');
                const popupTime = document.getElementById('popupTime');
                const popupService = document.getElementById('popupService');
                const popupBarber = document.getElementById('popupBarber');

                if (popupDate) popupDate.textContent = selectedDate;
                if (popupTime) popupTime.textContent = selectedTime;
                if (popupService) popupService.textContent = serviceText;
                if (popupBarber) popupBarber.textContent = barberText;

                // Exibe o popup
                if (confirmationPopup) {
                    confirmationPopup.style.display = 'flex';
                    confirmationPopup.style.opacity = '0';
                    setTimeout(() => {
                        confirmationPopup.style.transition = 'opacity 0.3s ease';
                        confirmationPopup.style.opacity = '1';
                    }, 10);
                }

                // Reseta o formulário
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                bookingForm.reset();

                // Limpa seleções
                window.selectedDate = null;
                window.selectedTime = null;

                if (stepService) stepService.classList.remove('active');

                showNotification('Agendamento realizado com sucesso!', 'success');
            })
            .catch(error => {
                console.error('Erro ao criar agendamento:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showNotification(error.message || 'Erro ao criar agendamento', 'error');
            });
    });

    // Fechar popup
    if (closePopup) {
        closePopup.addEventListener('click', function() {
            if (confirmationPopup) {
                confirmationPopup.style.opacity = '0';
                setTimeout(() => {
                    confirmationPopup.style.display = 'none';
                    document.getElementById('step-calendar').classList.add('active');
                    scrollToSection('booking');
                }, 300);
            }
        });

        // Fecha ao clicar fora do popup
        if (confirmationPopup) {
            confirmationPopup.addEventListener('click', function(e) {
                if (e.target === confirmationPopup) {
                    closePopup.click();
                }
            });
        }
    }

    // Botões de voltar
    document.querySelectorAll('.btn-secondary[data-step-back]').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetStep = this.getAttribute('data-step-back');
            const currentStep = this.closest('.booking-step');

            if (currentStep) {
                currentStep.classList.remove('active');
            }

            if (targetStep === 'calendar') {
                document.getElementById('step-calendar').classList.add('active');
                // Restaura lista completa de barbeiros ao voltar para o calendário
                restoreAllBarbers();
            } else if (targetStep === 'time') {
                document.getElementById('step-time').classList.add('active');
                // Se voltar para seleção de horário sem barbeiro, restaura lista completa
                if (!window.selectedBarber) {
                    restoreAllBarbers();
                }
            }

            scrollToSection('booking');
        });
    });
}

// ============================================
// 7. INTERATIVIDADE DOS CARDS DE SERVIÇO
// ============================================
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        // Ao clicar, rola até o agendamento
        card.addEventListener('click', function() {
            // Verifica se o usuário está autenticado
            const authToken = localStorage.getItem('authToken');
            const usuarioData = localStorage.getItem('usuario');

            if (!authToken || !usuarioData) {
                showNotification('Faça login para realizar um agendamento', 'error');
                setTimeout(() => {
                    window.location.href = '/web/index/login.html';
                }, 1500);
                return;
            }

            scrollToSection('booking');
            showNotification('Selecione uma data e horário para agendar', 'info');
        });
    });
}

// ============================================
// 8. ANIMAÇÕES DE SCROLL
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observa elementos para animação
    document.querySelectorAll('.service-card, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Mostra notificação ao usuário
 */
function showNotification(message, type = 'info') {
    // Remove notificação anterior se existir
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Scroll suave para uma seção
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 80;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// ============================================
// 9. MODAL DE DETALHES DOS SERVIÇOS
// ============================================
function initServiceModal() {
    const serviceModal = document.getElementById('serviceModal');
    const closeModal = document.getElementById('closeServiceModal');
    const serviceCards = document.querySelectorAll('.service-card');
    const addToCalculatorBtn = document.getElementById('addToCalculatorBtn');
    const bookServiceBtn = document.getElementById('bookServiceBtn');

    if (!serviceModal) return;

    // Dados dos serviços
    const servicesData = {
        corte: {
            title: 'Corte Masculino',
            price: 'R$ 25,00',
            duration: '30 minutos',
            description: 'Corte moderno e estiloso realizado por profissionais experientes. Inclui corte personalizado, acabamento profissional e produtos de qualidade.',
            includes: ['Corte personalizado', 'Acabamento profissional', 'Produtos de qualidade', 'Consulta de estilo'],
            icon: 'fa-cut'
        },
        barba: {
            title: 'Barba',
            price: 'R$ 15,00',
            duration: '20 minutos',
            description: 'Modelagem e aparar barba com técnicas profissionais. Deixe sua barba sempre impecável.',
            includes: ['Modelagem personalizada', 'Aparar e alinhar', 'Produtos para barba', 'Finalização'],
            icon: 'fa-scissors'
        },
        corte_barba: {
            title: 'Corte + Barba',
            price: 'R$ 35,00',
            duration: '45 minutos',
            description: 'Pacote completo com corte e barba. O melhor custo-benefício para cuidar do seu visual.',
            includes: ['Corte completo', 'Barba modelada', 'Produtos premium', 'Consulta de estilo', 'Desconto especial'],
            icon: 'fa-spa'
        },
        sobrancelha: {
            title: 'Sobrancelha',
            price: 'R$ 10,00',
            duration: '15 minutos',
            description: 'Design e limpeza de sobrancelhas para um visual mais definido e harmonioso.',
            includes: ['Design personalizado', 'Limpeza completa', 'Produtos específicos'],
            icon: 'fa-magic'
        }
    };

    // Abre modal ao clicar no card ou botão
    serviceCards.forEach(card => {
        const detailsBtn = card.querySelector('.service-details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const serviceId = card.getAttribute('data-service');
                openServiceModal(serviceId, servicesData[serviceId]);
            });
        }

        // Também abre ao clicar no card inteiro
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('service-details-btn')) return;
            const serviceId = card.getAttribute('data-service');
            openServiceModal(serviceId, servicesData[serviceId]);
        });
    });

    // Fecha modal
    if (closeModal) {
        closeModal.addEventListener('click', closeServiceModal);
    }

    if (serviceModal) {
        serviceModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('service-modal') || e.target.classList.contains('modal-overlay')) {
                closeServiceModal();
            }
        });
    }

    // Adicionar à calculadora
    if (addToCalculatorBtn) {
        addToCalculatorBtn.addEventListener('click', () => {
            const serviceId = addToCalculatorBtn.getAttribute('data-service');
            if (serviceId) {
                addServiceToCalculator(serviceId);
                closeServiceModal();
                scrollToSection('calculator');
            }
        });
    }

    // Agendar serviço
    if (bookServiceBtn) {
        bookServiceBtn.addEventListener('click', () => {
            const serviceId = bookServiceBtn.getAttribute('data-service');
            if (serviceId) {
                selectServiceForBooking(serviceId);
                closeServiceModal();
                scrollToSection('booking');
            }
        });
    }

    function openServiceModal(serviceId, data) {
        if (!data) return;

        document.getElementById('modalServiceTitle').textContent = data.title;
        document.getElementById('modalServicePrice').textContent = data.price;
        document.getElementById('modalServiceDuration').textContent = data.duration;
        document.getElementById('modalServiceDescription').textContent = data.description;
        
        const iconElement = document.getElementById('modalServiceIcon').querySelector('i');
        iconElement.className = `fas ${data.icon}`;

        const includesList = document.getElementById('modalServiceIncludes');
        includesList.innerHTML = '';
        data.includes.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            includesList.appendChild(li);
        });

        // Atualiza botões com data-service
        if (addToCalculatorBtn) {
            addToCalculatorBtn.setAttribute('data-service', serviceId);
        }
        if (bookServiceBtn) {
            bookServiceBtn.setAttribute('data-service', serviceId);
        }

        serviceModal.style.display = 'flex';
        setTimeout(() => {
            serviceModal.style.opacity = '1';
        }, 10);
    }

    function closeServiceModal() {
        serviceModal.style.opacity = '0';
        setTimeout(() => {
            serviceModal.style.display = 'none';
        }, 300);
    }

    window.openServiceModal = openServiceModal;
    window.closeServiceModal = closeServiceModal;
}

// ============================================
// 10. CALCULADORA DE PREÇOS
// ============================================
function initPriceCalculator() {
    const checkboxes = document.querySelectorAll('.calculator-option input[type="checkbox"]');
    const selectedServicesList = document.getElementById('selectedServicesList');
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    const discountLine = document.getElementById('discountLine');
    const totalElement = document.getElementById('total');
    const bookSelectedBtn = document.getElementById('bookSelectedBtn');

    const services = {
        corte: { name: 'Corte Masculino', price: 25.00 },
        barba: { name: 'Barba', price: 15.00 },
        corte_barba: { name: 'Corte + Barba', price: 35.00 },
        sobrancelha: { name: 'Sobrancelha', price: 10.00 }
    };

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Se o pacote for selecionado, desmarca e desabilita os serviços individuais
            if (this.value === 'corte_barba') {
                const corte = document.querySelector('.calculator-option input[value="corte"]');
                const barba = document.querySelector('.calculator-option input[value="barba"]');

                if (this.checked) {
                    if (corte) { corte.checked = false; corte.disabled = true; }
                    if (barba) { barba.checked = false; barba.disabled = true; }
                } else {
                    if (corte) corte.disabled = false;
                    if (barba) barba.disabled = false;
                }
            }

            // Se um serviço individual for marcado, garantir que o pacote não esteja marcado
            if (this.value === 'corte' || this.value === 'barba') {
                const pacote = document.querySelector('.calculator-option input[value="corte_barba"]');
                if (pacote && pacote.checked) {
                    pacote.checked = false;
                    // ao desmarcar o pacote, reabilita os individuais
                    const corte = document.querySelector('.calculator-option input[value="corte"]');
                    const barba = document.querySelector('.calculator-option input[value="barba"]');
                    if (corte) corte.disabled = false;
                    if (barba) barba.disabled = false;
                }
            }

            updateCalculator();
        });
    });

    if (bookSelectedBtn) {
        bookSelectedBtn.addEventListener('click', () => {
            const selected = Array.from(checkboxes).filter(cb => cb.checked);
            if (selected.length > 0) {
                // Se ambos 'corte' e 'barba' foram selecionados, tratar como pacote 'corte_barba'
                const hasCorte = selected.some(cb => cb.value === 'corte');
                const hasBarba = selected.some(cb => cb.value === 'barba');
                const hasPacote = selected.some(cb => cb.value === 'corte_barba');

                let serviceId = null;
                if (hasPacote) {
                    serviceId = 'corte_barba';
                } else if (hasCorte && hasBarba) {
                    serviceId = 'corte_barba';
                } else {
                    serviceId = selected[0].value;
                }

                // Atualiza o select de serviço na área de agendamento
                const serviceSelect = document.getElementById('service');
                if (serviceSelect) {
                    serviceSelect.value = serviceId;
                    // Mantém comportamento consistente chamando a função já existente
                    if (typeof window.selectServiceForBooking === 'function') {
                        window.selectServiceForBooking(serviceId);
                    }
                }

                scrollToSection('booking');
                showNotification('Selecione data e horário para agendar', 'info');
            }
        });
    }

    function updateCalculator() {
        const selected = Array.from(checkboxes).filter(cb => cb.checked);
        
        if (selected.length === 0) {
            selectedServicesList.innerHTML = '<p class="no-selection">Nenhum serviço selecionado</p>';
            subtotalElement.textContent = 'R$ 0,00';
            discountElement.textContent = '-R$ 0,00';
            totalElement.textContent = 'R$ 0,00';
            discountLine.style.display = 'none';
            bookSelectedBtn.disabled = true;
            return;
        }

        // Lista de serviços selecionados
        selectedServicesList.innerHTML = '';
        selected.forEach(checkbox => {
            const serviceId = checkbox.value;
            const service = services[serviceId];
            const div = document.createElement('div');
            div.className = 'selected-service-item';
            div.innerHTML = `
                <span>${service.name}</span>
                <span class="service-price">R$ ${service.price.toFixed(2).replace('.', ',')}</span>
            `;
            selectedServicesList.appendChild(div);
        });

        // Calcula subtotal
        let subtotal = 0;
        selected.forEach(checkbox => {
            const price = parseFloat(checkbox.getAttribute('data-price'));
            subtotal += price;
        });

        // Verifica desconto (se selecionar corte + barba separados, oferece desconto)
        let discount = 0;
        const hasCorte = selected.some(cb => cb.value === 'corte');
        const hasBarba = selected.some(cb => cb.value === 'barba');
        const hasPacote = selected.some(cb => cb.value === 'corte_barba');

        if (hasCorte && hasBarba && !hasPacote) {
            // Se selecionou corte e barba separados, desconto de 5 reais
            discount = 5.00;
            discountLine.style.display = 'flex';
        } else if (hasPacote) {
            // Se selecionou o pacote, já tem desconto embutido
            discountLine.style.display = 'none';
        } else {
            discountLine.style.display = 'none';
        }

        const total = subtotal - discount;

        subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        discountElement.textContent = `-R$ ${discount.toFixed(2).replace('.', ',')}`;
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        bookSelectedBtn.disabled = false;
    }

    window.addServiceToCalculator = function(serviceId) {
        const checkbox = document.querySelector(`.calculator-option input[value="${serviceId}"]`);
        if (checkbox && !checkbox.checked) {
            checkbox.checked = true;
            // Dispara o evento change para aplicar a mesma lógica de habilitar/desabilitar
            checkbox.dispatchEvent(new Event('change'));
            showNotification('Serviço adicionado à calculadora!', 'success');
        }
    };
}

// ============================================
// 11. SEÇÃO DE BARBEIROS
// ============================================
function initBarbersSection() {
    const barberCards = document.querySelectorAll('.barber-card');
    
    barberCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Função global para selecionar barbeiro
window.selectBarber = function(barberId, barberName) {
    // Verifica se o usuário está autenticado
    const authToken = localStorage.getItem('authToken');
    const usuarioData = localStorage.getItem('usuario');

    if (!authToken || !usuarioData) {
        showNotification('Faça login para realizar um agendamento', 'error');
        setTimeout(() => {
            window.location.href = '/web/index/login.html';
        }, 1500);
        return;
    }

    // Remove seleção de todos os cards de barbeiro
    document.querySelectorAll('.barber-card').forEach(card => {
        card.classList.remove('selected-barber');
        card.style.border = '';
        card.style.boxShadow = '';
    });

    // Adiciona classe ao card selecionado
    const selectedCard = document.querySelector(`.barber-card[data-barber="${barberId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected-barber');
        selectedCard.style.border = '2px solid #e74c3c';
        selectedCard.style.boxShadow = '0 8px 24px rgba(231, 76, 60, 0.3)';
    }

    // Salva o barbeiro selecionado globalmente
    window.selectedBarber = {
        id: barberId,
        name: barberName
    };

    const barberSelect = document.getElementById('barber');
    if (barberSelect) {
        barberSelect.value = barberId;
        scrollToSection('booking');
        showNotification(`Barbeiro ${barberName} selecionado! Agora escolha uma data.`, 'success');

        // Se já estiver na etapa de serviço, destaca o select
        const stepService = document.getElementById('step-service');
        if (stepService && stepService.classList.contains('active')) {
            barberSelect.focus();
            barberSelect.style.borderColor = '#e74c3c';
            setTimeout(() => {
                barberSelect.style.borderColor = '';
            }, 2000);
        }
    }

    // Se já houver uma data selecionada, re-renderiza os horários com o filtro do barbeiro
    if (window.selectedDate) {
        renderTimeSlots(window.selectedDate, barberName);
        // Volta para a etapa de horário se já passou
        const stepTime = document.getElementById('step-time');
        const stepCalendar = document.getElementById('step-calendar');
        const stepService = document.getElementById('step-service');

        if (stepService && stepService.classList.contains('active')) {
            stepService.classList.remove('active');
            stepTime.classList.add('active');
        } else if (stepCalendar && !stepCalendar.classList.contains('active')) {
            stepTime.classList.add('active');
        }

        showNotification(`Mostrando horários disponíveis para ${barberName}`, 'info');
    }
};

// Função para selecionar serviço para agendamento
window.selectServiceForBooking = function(serviceId) {
    // Verifica se o usuário está autenticado
    const authToken = localStorage.getItem('authToken');
    const usuarioData = localStorage.getItem('usuario');

    if (!authToken || !usuarioData) {
        showNotification('Faça login para realizar um agendamento', 'error');
        setTimeout(() => {
            window.location.href = '/web/index/login.html';
        }, 1500);
        return;
    }

    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.value = serviceId;
        showNotification('Serviço selecionado! Agora escolha data e horário.', 'success');
    }
};

/**
 * Restaura a lista completa de barbeiros no select
 */
function restoreAllBarbers() {
    const barberSelect = document.getElementById('barber');
    if (barberSelect) {
        const todosBarbeiros = [
            { id: 'luciano', name: 'Luciano Sousa Barbosa' },
            { id: 'pedro', name: 'Pedro Henrique Rodrigues' },
            { id: 'joao', name: 'João Vitor Santana' },
            { id: 'samuel', name: 'Samuel Torres' }
        ];

        barberSelect.innerHTML = '<option value="">Selecione um barbeiro</option>';
        todosBarbeiros.forEach(barbeiro => {
            const option = document.createElement('option');
            option.value = barbeiro.id;
            option.textContent = barbeiro.name;
            barberSelect.appendChild(option);
        });
        barberSelect.disabled = false;
    }
}

/**
 * Filtra barbeiros disponíveis baseado no horário selecionado
 */
async function filterAvailableBarbers(date, horario) {
    const dataFormatada = formatDateForAPI(date);

    try {
        // Busca todos os horários bloqueados para esta data
        const horariosBloqueados = await api.listarHorariosBloqueadosPorData(dataFormatada);

        // Filtra apenas os horários bloqueados para o horário específico selecionado
        const barbeirosOcupados = horariosBloqueados
            .filter(h => h.horario === horario)
            .map(h => h.nomeBarbeiro);

        // Lista de todos os barbeiros disponíveis
        const todosBarbeiros = [
            { id: 'luciano', name: 'Luciano Sousa Barbosa' },
            { id: 'pedro', name: 'Pedro Henrique Rodrigues' },
            { id: 'joao', name: 'João Vitor Santana' },
            { id: 'samuel', name: 'Samuel Torres' }
        ];

        // Filtra apenas os barbeiros disponíveis (que não estão ocupados)
        const barbeirosDisponiveis = todosBarbeiros.filter(
            barbeiro => !barbeirosOcupados.includes(barbeiro.name)
        );

        // Atualiza o select de barbeiros
        const barberSelect = document.getElementById('barber');
        if (barberSelect) {
            // Limpa as opções atuais (exceto a primeira - placeholder)
            barberSelect.innerHTML = '<option value="">Selecione um barbeiro</option>';

            // Adiciona apenas os barbeiros disponíveis
            barbeirosDisponiveis.forEach(barbeiro => {
                const option = document.createElement('option');
                option.value = barbeiro.id;
                option.textContent = barbeiro.name;
                barberSelect.appendChild(option);
            });

            // Se nenhum barbeiro está disponível
            if (barbeirosDisponiveis.length === 0) {
                barberSelect.innerHTML = '<option value="">Nenhum barbeiro disponível neste horário</option>';
                barberSelect.disabled = true;
                showNotification('Nenhum barbeiro disponível neste horário. Selecione outro horário.', 'warning');
            } else {
                barberSelect.disabled = false;
                showNotification(`${barbeirosDisponiveis.length} barbeiro(s) disponível(is) para este horário`, 'success');
            }
        }
    } catch (error) {
        console.error('Erro ao filtrar barbeiros disponíveis:', error);
        showNotification('Erro ao buscar barbeiros disponíveis', 'error');
    }
}

/**
 * Formata data para armazenamento
 */
function formatDateForStorage(date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Formata data para enviar à API (YYYY-MM-DD)
 */
function formatDateForAPI(date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
