document.addEventListener('DOMContentLoaded', function() {
  initLoginPage();
});

function initLoginPage() {
  initTabs();
  initLoginForm();
  initCadastroForm();
  initPasswordToggle();
  initFormAnimations();
  initInputMasks();
}

function initTabs() {
  function showTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const clickedButton = event.target;
    clickedButton.classList.add('active');

    const targetContent = document.getElementById(tabName + '-tab');
    if (targetContent) {
      targetContent.classList.add('active');

      targetContent.style.opacity = '0';
      targetContent.style.transform = 'translateY(10px)';
      setTimeout(() => {
        targetContent.style.transition = 'all 0.3s ease';
        targetContent.style.opacity = '1';
        targetContent.style.transform = 'translateY(0)';
      }, 10);
    }
  }

  window.showTab = showTab;
}

function initLoginForm() {
  const loginForm = document.querySelector('.login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const rememberCheckbox = document.querySelector('input[name="remember"]');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    clearFieldErrors(emailInput);
    clearFieldErrors(passwordInput);

    let hasErrors = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError(emailInput, 'E-mail é obrigatório');
      hasErrors = true;
    } else if (!emailRegex.test(email)) {
      showFieldError(emailInput, 'Por favor, insira um e-mail válido');
      hasErrors = true;
    }

    if (!password) {
      showFieldError(passwordInput, 'Senha é obrigatória');
      hasErrors = true;
    } else if (password.length < 6) {
      showFieldError(passwordInput, 'A senha deve ter pelo menos 6 caracteres');
      hasErrors = true;
    }

    if (hasErrors) {
      showNotification('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    const submitBtn = loginForm.querySelector('.login-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    submitBtn.disabled = true;

    api.login({ email, senha: password })
      .then(data => {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        showNotification('Login realizado com sucesso!', 'success');
        sessionStorage.setItem('showLastVisitAfterLogin', 'true');

        setTimeout(() => {
          window.location.href = '/web/index/home.html';
        }, 1000);
      })
      .catch(error => {
        submitBtn.disabled = true;
        let cooldown = 3;

        const cooldownInterval = setInterval(() => {
          if (cooldown > 0) {
            submitBtn.innerHTML = `Aguarde ${cooldown}s para tentar novamente`;
            cooldown--;
          } else {
            clearInterval(cooldownInterval);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
        }, 1000);

        showNotification(error.message, 'error');
      });
  });

  const rememberedEmail = localStorage.getItem('rememberEmail');
  if (rememberedEmail) {
    const emailInput = document.getElementById('loginEmail');
    if (emailInput) {
      emailInput.value = rememberedEmail;
      const rememberCheckbox = document.querySelector('input[name="remember"]');
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }
}

function initCadastroForm() {
  const cadastroForm = document.querySelector('.cadastro-form');
  if (!cadastroForm) return;

  cadastroForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const birthdateInput = document.getElementById('birthdate');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const birthdate = birthdateInput.value;

    [nameInput, phoneInput, emailInput, passwordInput, confirmPasswordInput, birthdateInput].forEach(input => {
      clearFieldErrors(input);
    });

    let hasErrors = false;

    if (!name) {
      showFieldError(nameInput, 'Nome completo é obrigatório');
      hasErrors = true;
    } else if (name.length < 3) {
      showFieldError(nameInput, 'Nome deve ter pelo menos 3 caracteres');
      hasErrors = true;
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
      showFieldError(nameInput, 'Nome deve conter apenas letras');
      hasErrors = true;
    }

    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    if (!phone) {
      showFieldError(phoneInput, 'Telefone é obrigatório');
      hasErrors = true;
    } else if (!phoneRegex.test(phone)) {
      showFieldError(phoneInput, 'Telefone inválido. Use o formato (86) 99999-8888');
      hasErrors = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError(emailInput, 'E-mail é obrigatório');
      hasErrors = true;
    } else if (!emailRegex.test(email)) {
      showFieldError(emailInput, 'Por favor, insira um e-mail válido');
      hasErrors = true;
    }

    if (!password) {
      showFieldError(passwordInput, 'Senha é obrigatória');
      hasErrors = true;
    } else if (password.length < 6) {
      showFieldError(passwordInput, 'A senha deve ter pelo menos 6 caracteres');
      hasErrors = true;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      showFieldError(passwordInput, 'Senha deve conter letras maiúsculas, minúsculas e números');
      hasErrors = true;
    }

    if (!confirmPassword) {
      showFieldError(confirmPasswordInput, 'Confirmação de senha é obrigatória');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      showFieldError(confirmPasswordInput, 'As senhas não coincidem');
      hasErrors = true;
    }

    if (!birthdate) {
      showFieldError(birthdateInput, 'Data de nascimento é obrigatória');
      hasErrors = true;
    } else {
      const birthDate = new Date(birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (age < 18 || (age === 18 && monthDiff < 0)) {
        showFieldError(birthdateInput, 'Você deve ter pelo menos 18 anos');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      showNotification('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    const submitBtn = cadastroForm.querySelector('.cadastro-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
    submitBtn.disabled = true;

    api.cadastro({
      nomeCompleto: name,
      telefone: phone,
      email: email,
      senha: password,
      dataNascimento: birthdate
    })
      .then(data => {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        showNotification('Cadastro realizado com sucesso!', 'success');
        sessionStorage.setItem('showLastVisitAfterLogin', 'true');

        setTimeout(() => {
          window.location.href = '/web/index/home.html';
        }, 1000);
      })
      .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification(error.message, 'error');
      });
  });

  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordInput = document.getElementById('password');

  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('blur', function() {
      if (this.value && passwordInput.value && this.value !== passwordInput.value) {
        showFieldError(this, 'As senhas não coincidem');
      }
    });
  }
}

function initPasswordToggle() {
  const togglePassword = document.getElementById('toggleLoginPassword');
  const passwordInput = document.getElementById('loginPassword');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }
}

function initFormAnimations() {
  const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
      this.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });

    input.addEventListener('input', function() {
      if (this.value) {
        this.classList.add('has-value');
      } else {
        this.classList.remove('has-value');
      }
    });
  });
}

function initInputMasks() {
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');

      if (value.length <= 11) {
        if (value.length <= 2) {
          value = value;
        } else if (value.length <= 7) {
          value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else {
          value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
        e.target.value = value;
      }
    });
  }
}

function showFieldError(input, message) {
  clearFieldErrors(input);

  input.style.borderColor = '#e74c3c';
  input.classList.add('error');

  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.color = '#e74c3c';
  errorDiv.style.fontSize = '0.875rem';
  errorDiv.style.marginTop = '0.25rem';

  input.parentElement.appendChild(errorDiv);
}

function clearFieldErrors(input) {
  input.style.borderColor = '';
  input.classList.remove('error');

  const errorDiv = input.parentElement.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };

  notification.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}
