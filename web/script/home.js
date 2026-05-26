const COOKIE_CONSENT_KEY = 'cookieConsentAccepted';
const BOOKING_DRAFT_KEY = 'bookingDraft';
const LAST_VISIT_KEY = 'lastVisit';
const VISIT_COUNT_KEY = 'visitCount';

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    initVisitCookies();
    initCookieConsent();
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

function initGreeting() {
    const authToken = localStorage.getItem('authToken');
    const greetingContainer = document.querySelector('.greeting');
    const userNameElement = document.getElementById('userName');

    if (greetingContainer) {
        greetingContainer.style.display = 'flex';
    }

    if (!authToken) {
        if (userNameElement) {
            userNameElement.style.display = 'none';
        }
        updateGreeting(false);
        setInterval(() => updateGreeting(false), 3600000);
        return;
    }

    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:3003/api/usuarios/perfil', false);
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();

        if (xhr.status === 200) {
            const userData = JSON.parse(xhr.responseText);

            localStorage.setItem('usuario', JSON.stringify(userData));

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
            if (isAuthenticated) {
                greetingElement.textContent = greeting + ',';
            } else {
                greetingElement.textContent = greeting;
            }
        }
    }
}

function initUserDropdown() {
    const userBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (!userBtn || !dropdownMenu) return;

    const authToken = localStorage.getItem('authToken');
    const usuarioData = localStorage.getItem('usuario');

    if (!authToken || !usuarioData) {
        dropdownMenu.innerHTML = '<a href="/web/index/login.html">Fazer Login</a>';
    } else {
        dropdownMenu.innerHTML = `
            <a href="/web/index/profile.html">Perfil</a>
            <a href="#" id="logoutLink">Sair</a>
        `;
    }

    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isVisible ? 'none' : 'block';

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

    window.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    if (authToken && usuarioData) {
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('authToken');
                localStorage.removeItem('usuario');
                window.location.href = '/web/index/login.html';
            });
        }
    }
}

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

    heroImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    topDiv.style.backgroundImage = `url('${heroImages[currentHero]}')`;
    topDiv.classList.add('show');

    setInterval(() => {
        const nextHero = (currentHero + 1) % heroImages.length;
        bottomDiv.style.backgroundImage = `url('${heroImages[nextHero]}')`;
        bottomDiv.classList.add('show');

        [topDiv, bottomDiv] = [bottomDiv, topDiv];
        setTimeout(() => bottomDiv.classList.remove('show'), 1000);
        currentHero = nextHero;
    }, 5000);
}

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();

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

    function renderCalendar(month, year) {
        calendarGrid.innerHTML = '';
        calendarHeader.textContent = `${nomesMes[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.classList.add('calendar-day-header');
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDiv);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');

            const dateObj = new Date(year, month, day);
            dateObj.setHours(0, 0, 0, 0);

            if (dateObj < today) {
                dayDiv.classList.add('disabled');
            }

            if (dateObj.getTime() === today.getTime()) {
                dayDiv.classList.add('today');
            }

            dayDiv.textContent = day;
            calendarGrid.appendChild(dayDiv);

            dayDiv.addEventListener('click', () => {
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

                const selectedDateSpan = document.querySelector('.selected-date-info span');
                const selectedInfoDate = document.querySelector('.selected-info p span');

                if (selectedDateSpan) selectedDateSpan.textContent = dataFormatada;
                if (selectedInfoDate) selectedInfoDate.textContent = dataFormatada;

                window.selectedDate = dateObj;
                saveBookingDraft({
                    selectedDate: dateObj.toISOString(),
                });

                const barberName = window.selectedBarber ? window.selectedBarber.name : null;
                renderTimeSlots(dateObj, barberName);

                setTimeout(() => {
                    stepCalendar.classList.remove('active');
                    document.getElementById('step-time').classList.add('active');
                    scrollToSection('booking');
                }, 300);
            });
        }
    }

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

    renderCalendar(currentMonth, currentYear);
}

function initBookingSystem() {
    const stepTime = document.getElementById('step-time');
    const stepService = document.getElementById('step-service');
    const timeSlotsContainer = document.querySelector('.time-slots');
    const bookingForm = document.getElementById('bookingForm');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const closePopup = document.getElementById('closePopup');
    const serviceSelect = document.getElementById('service');
    const barberSelect = document.getElementById('barber');
    const notesInput = document.getElementById('notes');

    if (!timeSlotsContainer || !bookingForm) return;

    const workingHours = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                         '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

    window.renderTimeSlots = async function(date, nomeBarbeiro = null) {
        if (!timeSlotsContainer) return;

        timeSlotsContainer.innerHTML = '';

        const loading = document.createElement('div');
        loading.classList.add('loading-slots');
        loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando horários...';
        timeSlotsContainer.appendChild(loading);

        const dataFormatada = formatDateForAPI(date);
        let occupiedSlots = [];

        try {
            let horariosBloqueados;

            if (nomeBarbeiro) {
                horariosBloqueados = await api.listarHorariosBloqueadosPorBarbeiroEData(nomeBarbeiro, dataFormatada);
            } else {
                horariosBloqueados = await api.listarHorariosBloqueadosPorData(dataFormatada);
            }

            occupiedSlots = horariosBloqueados.map(h => h.horario);
        } catch (error) {
            console.error('Erro ao buscar horários bloqueados:', error);
        }

        setTimeout(() => {
            timeSlotsContainer.innerHTML = '';

            workingHours.forEach(hour => {
                const slot = document.createElement('div');
                slot.classList.add('time-slot');

                const [h, m] = hour.split(':');
                const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(h), parseInt(m));
                const now = new Date();

                if (slotDate < now) {
                    slot.classList.add('unavailable');
                    slot.title = 'Horário já passou';
                }
                else if (nomeBarbeiro && occupiedSlots.includes(hour)) {
                    slot.classList.add('unavailable-striked');
                    slot.title = `Horário ocupado para ${nomeBarbeiro}`;
                }
                else {
                    slot.title = 'Clique para selecionar';
                }

                slot.textContent = hour;
                timeSlotsContainer.appendChild(slot);

                slot.addEventListener('click', () => {
                    if (slotDate < now) {
                        showNotification('Este horário já passou', 'error');
                        return;
                    }

                    if (nomeBarbeiro && occupiedSlots.includes(hour)) {
                        showNotification(`Este horário não está disponível para ${nomeBarbeiro}`, 'error');
                        return;
                    }

                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');

                    window.selectedTime = hour;
                    saveBookingDraft({ selectedTime: hour });

                    const selectedInfoTime = document.querySelector('.selected-info p:nth-child(2) span');
                    if (selectedInfoTime) selectedInfoTime.textContent = hour;

                    if (!nomeBarbeiro && window.selectedDate) {
                        filterAvailableBarbers(window.selectedDate, hour);
                    }

                    setTimeout(() => {
                        if (stepTime) stepTime.classList.remove('active');
                        if (stepService) stepService.classList.add('active');
                        scrollToSection('booking');
                    }, 300);
                });
            });

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

    restoreBookingDraft();

    if (serviceSelect) {
        serviceSelect.addEventListener('change', () => {
            saveBookingDraft({ service: serviceSelect.value });
        });
    }

    if (barberSelect) {
        barberSelect.addEventListener('change', () => {
            const barberId = barberSelect.value;
            saveBookingDraft({ barber: barberId });

            if (!barberId) {
                window.selectedBarber = null;
                return;
            }

            const barberName = getBarberNameById(barberId);
            if (barberName) {
                window.selectedBarber = { id: barberId, name: barberName };
            }
        });
    }

    if (notesInput) {
        notesInput.addEventListener('input', () => {
            saveBookingDraft({ notes: notesInput.value });
        });
    }

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const service = document.getElementById('service');
        const barber = document.getElementById('barber');

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

        const submitBtn = bookingForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';
        submitBtn.disabled = true;

        const selectedDate = document.querySelector('.selected-info p span').textContent;
        const selectedTime = document.querySelector('.selected-info p:nth-child(2) span').textContent;
        const serviceText = service.selectedOptions[0].textContent;
        const barberText = barber.selectedOptions[0].textContent;

        const dadosAgendamento = {
            nomeBarbeiro: barberText,
            nomeServico: serviceText.split(' - ')[0],
            data: formatDateForAPI(window.selectedDate),
            horario: window.selectedTime,
            observacoes: document.getElementById('notes')?.value || undefined
        };

        api.criarAgendamento(dadosAgendamento)
            .then(agendamento => {
                const popupDate = document.getElementById('popupDate');
                const popupTime = document.getElementById('popupTime');
                const popupService = document.getElementById('popupService');
                const popupBarber = document.getElementById('popupBarber');

                if (popupDate) popupDate.textContent = selectedDate;
                if (popupTime) popupTime.textContent = selectedTime;
                if (popupService) popupService.textContent = serviceText;
                if (popupBarber) popupBarber.textContent = barberText;

                if (confirmationPopup) {
                    confirmationPopup.style.display = 'flex';
                    confirmationPopup.style.opacity = '0';
                    setTimeout(() => {
                        confirmationPopup.style.transition = 'opacity 0.3s ease';
                        confirmationPopup.style.opacity = '1';
                    }, 10);
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                bookingForm.reset();

                window.selectedDate = null;
                window.selectedTime = null;

                if (stepService) stepService.classList.remove('active');

                    clearBookingDraft();

                showNotification('Agendamento realizado com sucesso!', 'success');
            })
            .catch(error => {
                console.error('Erro ao criar agendamento:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showNotification(error.message || 'Erro ao criar agendamento', 'error');
            });
    });

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

        if (confirmationPopup) {
            confirmationPopup.addEventListener('click', function(e) {
                if (e.target === confirmationPopup) {
                    closePopup.click();
                }
            });
        }
    }

    document.querySelectorAll('.btn-secondary[data-step-back]').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetStep = this.getAttribute('data-step-back');
            const currentStep = this.closest('.booking-step');

            if (currentStep) {
                currentStep.classList.remove('active');
            }

            if (targetStep === 'calendar') {
                document.getElementById('step-calendar').classList.add('active');
                restoreAllBarbers();
            } else if (targetStep === 'time') {
                document.getElementById('step-time').classList.add('active');
                if (!window.selectedBarber) {
                    restoreAllBarbers();
                }
            }

            scrollToSection('booking');
        });
    });
}

function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        card.addEventListener('click', function() {
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

    document.querySelectorAll('.service-card, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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

function initServiceModal() {
    const serviceModal = document.getElementById('serviceModal');
    const closeModal = document.getElementById('closeServiceModal');
    const serviceCards = document.querySelectorAll('.service-card');
    const addToCalculatorBtn = document.getElementById('addToCalculatorBtn');
    const bookServiceBtn = document.getElementById('bookServiceBtn');

    if (!serviceModal) return;

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

    serviceCards.forEach(card => {
        const detailsBtn = card.querySelector('.service-details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const serviceId = card.getAttribute('data-service');
                openServiceModal(serviceId, servicesData[serviceId]);
            });
        }

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('service-details-btn')) return;
            const serviceId = card.getAttribute('data-service');
            openServiceModal(serviceId, servicesData[serviceId]);
        });
    });

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

            if (this.value === 'corte' || this.value === 'barba') {
                const pacote = document.querySelector('.calculator-option input[value="corte_barba"]');
                if (pacote && pacote.checked) {
                    pacote.checked = false;
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

                const serviceSelect = document.getElementById('service');
                if (serviceSelect) {
                    serviceSelect.value = serviceId;
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

        let subtotal = 0;
        selected.forEach(checkbox => {
            const price = parseFloat(checkbox.getAttribute('data-price'));
            subtotal += price;
        });

        let discount = 0;
        const hasCorte = selected.some(cb => cb.value === 'corte');
        const hasBarba = selected.some(cb => cb.value === 'barba');
        const hasPacote = selected.some(cb => cb.value === 'corte_barba');

        if (hasCorte && hasBarba && !hasPacote) {
            discount = 5.00;
            discountLine.style.display = 'flex';
        } else if (hasPacote) {
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
            checkbox.dispatchEvent(new Event('change'));
            showNotification('Serviço adicionado à calculadora!', 'success');
        }
    };
}

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

window.selectBarber = function(barberId, barberName) {
    const authToken = localStorage.getItem('authToken');
    const usuarioData = localStorage.getItem('usuario');

    if (!authToken || !usuarioData) {
        showNotification('Faça login para realizar um agendamento', 'error');
        setTimeout(() => {
            window.location.href = '/web/index/login.html';
        }, 1500);
        return;
    }

    document.querySelectorAll('.barber-card').forEach(card => {
        card.classList.remove('selected-barber');
        card.style.border = '';
        card.style.boxShadow = '';
    });

    const selectedCard = document.querySelector(`.barber-card[data-barber="${barberId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected-barber');
        selectedCard.style.border = '2px solid #e74c3c';
        selectedCard.style.boxShadow = '0 8px 24px rgba(231, 76, 60, 0.3)';
    }

    window.selectedBarber = {
        id: barberId,
        name: barberName
    };
    saveBookingDraft({ barber: barberId });

    const barberSelect = document.getElementById('barber');
    if (barberSelect) {
        barberSelect.value = barberId;
        scrollToSection('booking');
        showNotification(`Barbeiro ${barberName} selecionado! Agora escolha uma data.`, 'success');

        const stepService = document.getElementById('step-service');
        if (stepService && stepService.classList.contains('active')) {
            barberSelect.focus();
            barberSelect.style.borderColor = '#e74c3c';
            setTimeout(() => {
                barberSelect.style.borderColor = '';
            }, 2000);
        }
    }

    if (window.selectedDate) {
        renderTimeSlots(window.selectedDate, barberName);
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

window.selectServiceForBooking = function(serviceId) {
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
        saveBookingDraft({ service: serviceId });
        showNotification('Serviço selecionado! Agora escolha data e horário.', 'success');
    }
};

function initVisitCookies() {
    let visitCount = parseInt(getCookie(VISIT_COUNT_KEY), 10) || 0;
    visitCount++;
    setCookie(VISIT_COUNT_KEY, visitCount, 365);

    const lastVisit = getCookie(LAST_VISIT_KEY);
    const agora = new Date();
    setCookie(LAST_VISIT_KEY, agora.toISOString(), 365);

    if (lastVisit) {
        const ultimaData = new Date(lastVisit);
        const dataFormatada = ultimaData.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        setTimeout(() => {
            showNotification(
                `Bem-vindo de volta! Visita #${visitCount} | Última vez: ${dataFormatada}`,
                'info'
            );
        }, 1500);
    }
}

function initCookieConsent() {
    const banner = document.getElementById('cookieConsentBanner');
    const acceptBtn = document.getElementById('acceptCookiesBtn');

    if (!banner || !acceptBtn) return;

    const consent = getCookie(COOKIE_CONSENT_KEY);
    if (consent === 'true') {
        banner.style.display = 'none';
        return;
    }

    banner.style.display = 'flex';

    acceptBtn.addEventListener('click', () => {
        setCookie(COOKIE_CONSENT_KEY, 'true', 180);
        banner.style.display = 'none';
    });
}

function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
        const [key, ...rest] = cookie.split('=');
        if (key === name) {
            return decodeURIComponent(rest.join('='));
        }
    }
    return null;
}

function saveBookingDraft(partialDraft) {
    try {
        const current = getBookingDraft();
        const next = {
            ...current,
            ...partialDraft,
        };
        sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(next));
    } catch (error) {
        console.error('Erro ao salvar rascunho de agendamento:', error);
    }
}

function getBookingDraft() {
    try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.error('Erro ao ler rascunho de agendamento:', error);
        return {};
    }
}

function clearBookingDraft() {
    sessionStorage.removeItem(BOOKING_DRAFT_KEY);
}

function restoreBookingDraft() {
    const draft = getBookingDraft();
    if (!draft || Object.keys(draft).length === 0) return;

    const serviceSelect = document.getElementById('service');
    const barberSelect = document.getElementById('barber');
    const notesInput = document.getElementById('notes');
    const selectedDateSpan = document.querySelector('.selected-date-info span');
    const selectedInfoDate = document.querySelector('.selected-info p span');
    const selectedInfoTime = document.querySelector('.selected-info p:nth-child(2) span');

    if (draft.service && serviceSelect) {
        serviceSelect.value = draft.service;
    }

    if (draft.barber && barberSelect) {
        barberSelect.value = draft.barber;
        const barberName = getBarberNameById(draft.barber);
        if (barberName) {
            window.selectedBarber = { id: draft.barber, name: barberName };
        }
    }

    if (typeof draft.notes === 'string' && notesInput) {
        notesInput.value = draft.notes;
    }

    if (draft.selectedDate) {
        const restoredDate = new Date(draft.selectedDate);
        if (!Number.isNaN(restoredDate.getTime())) {
            window.selectedDate = restoredDate;
            const dateText = formatDateForStorage(restoredDate);
            if (selectedDateSpan) selectedDateSpan.textContent = dateText;
            if (selectedInfoDate) selectedInfoDate.textContent = dateText;
        }
    }

    if (draft.selectedTime) {
        window.selectedTime = draft.selectedTime;
        if (selectedInfoTime) selectedInfoTime.textContent = draft.selectedTime;
    }
}

function getBarberNameById(barberId) {
    const barberMap = {
        luciano: 'Luciano Sousa Barbosa',
        pedro: 'Pedro Henrique Rodrigues',
        joao: 'João Vitor Santana',
        samuel: 'Samuel Torres',
    };

    return barberMap[barberId] || null;
}

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

async function filterAvailableBarbers(date, horario) {
    const dataFormatada = formatDateForAPI(date);

    try {
        const horariosBloqueados = await api.listarHorariosBloqueadosPorData(dataFormatada);

        const barbeirosOcupados = horariosBloqueados
            .filter(h => h.horario === horario)
            .map(h => h.nomeBarbeiro);

        const todosBarbeiros = [
            { id: 'luciano', name: 'Luciano Sousa Barbosa' },
            { id: 'pedro', name: 'Pedro Henrique Rodrigues' },
            { id: 'joao', name: 'João Vitor Santana' },
            { id: 'samuel', name: 'Samuel Torres' }
        ];

        const barbeirosDisponiveis = todosBarbeiros.filter(
            barbeiro => !barbeirosOcupados.includes(barbeiro.name)
        );

        const barberSelect = document.getElementById('barber');
        if (barberSelect) {
            barberSelect.innerHTML = '<option value="">Selecione um barbeiro</option>';

            barbeirosDisponiveis.forEach(barbeiro => {
                const option = document.createElement('option');
                option.value = barbeiro.id;
                option.textContent = barbeiro.name;
                barberSelect.appendChild(option);
            });

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

function formatDateForStorage(date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateForAPI(date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
