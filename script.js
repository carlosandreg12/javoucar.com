// Função para mostrar diferentes telas com animação
function showScreen(screenId) {
    // Oculta todas as telas com fade out
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.opacity = '0';
        setTimeout(() => {
            screen.classList.remove('active');
        }, 300);
    });
    
    // Mostra a tela solicitada com fade in
    setTimeout(() => {
        const targetScreen = document.getElementById(screenId);
        targetScreen.classList.add('active');
        setTimeout(() => {
            targetScreen.style.opacity = '1';
        }, 50);
    }, 300);
}

// Ao carregar a página, mostrar APENAS a tela de boas-vindas
window.addEventListener('load', function() {
    // Verifica se já está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        showScreen('alertas');
    } else {
        showScreen('onboarding');
    }
});

// Botão "Começar Agora" na tela de boas-vindas leva para o login
document.querySelector('#onboarding .primary-button').addEventListener('click', function(e) {
    e.preventDefault();
    showScreen('login');
});

// Formulário de login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    // Simular verificação de usuário cadastrado
    const usuarioCadastrado = localStorage.getItem(email);

    if (usuarioCadastrado) {
        // Se usuário existe, salva estado e vai para alertas
        saveLoginState(email);
        showScreen('alertas');
    } else {
        // Se usuário não existe, vai para cadastro
        showScreen('cadastro');
    }
});

// Formulário de cadastro de usuário
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const telefone = document.getElementById('telefone').value;

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        // Salva dados do usuário no formato correto
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
        usuarios[email] = {
            nome: nome,
            email: email,
            senha: senha,
            telefone: telefone
        };
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Salva o estado de login
        saveLoginState(email);
        
        alert('Usuário cadastrado com sucesso!');
        showScreen('cadastro-veiculo');
    } catch (error) {
        alert('Erro ao cadastrar usuário. Por favor, tente novamente.');
        console.error('Erro no cadastro:', error);
    }
});

// Formulário de cadastro de veículo
document.getElementById('vehicleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const placa = document.getElementById('placa').value.toUpperCase();
    const modelo = document.getElementById('modelo').value;
    const cor = document.getElementById('cor').value;
    const estado = document.getElementById('estado').value;
    const userEmail = localStorage.getItem('userEmail');

    // Validação dos campos
    if (!placa || !modelo || !cor || !estado) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (!userEmail) {
        alert('Você precisa fazer login primeiro!');
        showScreen('cadastro');
        return;
    }

    try {
        // Salvar informações do veículo
        const veiculos = JSON.parse(localStorage.getItem('veiculos') || '{}');
        veiculos[placa] = {
            placa: placa,
            modelo: modelo,
            cor: cor,
            estado: estado,
            userEmail: userEmail
        };
        localStorage.setItem('veiculos', JSON.stringify(veiculos));

        // Salvar a placa como o veículo principal do usuário
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
        if (!usuarios[userEmail]) {
            usuarios[userEmail] = {};
        }
        usuarios[userEmail].veiculoPrincipal = placa;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert('Veículo cadastrado com sucesso!');
        showScreen('alertas');
    } catch (error) {
        alert('Erro ao cadastrar veículo. Por favor, tente novamente.');
        console.error('Erro no cadastro:', error);
    }
});

// Funcionalidade de mostrar/ocultar senha
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
});

// Sistema de alertas atualizado
// Sistema de som usando Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createBeep(frequency = 800, duration = 200) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration/1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration/1000);
}

let alertInterval;

function startAlertBeeps() {
    // Toca dois beeps iniciais
    createBeep(800, 200);
    setTimeout(() => createBeep(800, 200), 300);
    
    // Configura o intervalo para tocar dois beeps a cada 2 segundos
    alertInterval = setInterval(() => {
        createBeep(800, 200);
        setTimeout(() => createBeep(800, 200), 300);
    }, 2000);
}

function showAlert(message, vehicleInfo) {
    const modal = document.querySelector('.alert-modal');
    const alertMessage = modal.querySelector('.alert-message');
    const alertPlate = modal.querySelector('.alert-plate');
    const alertModel = modal.querySelector('.alert-model');
    const alertColor = modal.querySelector('.alert-color');

    alertMessage.textContent = message;
    alertPlate.textContent = vehicleInfo.placa;
    alertModel.textContent = vehicleInfo.modelo;
    alertColor.textContent = vehicleInfo.cor;

    modal.style.display = 'block';
    startAlertBeeps(); // Inicia os beeps de alerta
}

function confirmAlert() {
    const waitingConfirmation = document.querySelector('.waiting-confirmation');
    waitingConfirmation.textContent = 'Alerta confirmado! ✅';
    waitingConfirmation.style.color = '#4CAF50';
    
    // Desabilita o botão de confirmar
    const confirmButton = document.querySelector('.confirm-button');
    confirmButton.disabled = true;
    confirmButton.style.backgroundColor = '#cccccc';
    
    // Para os beeps de alerta
    clearInterval(alertInterval);
    
    // Toca o som de confirmação
    playConfirmationBeep();
    
    // Fecha o alerta após 2 segundos
    setTimeout(() => {
        closeAlert();
    }, 2000);
}

function closeAlert() {
    const modal = document.querySelector('.alert-modal');
    modal.style.display = 'none';
    
    // Para os beeps de alerta
    clearInterval(alertInterval);
    
    // Reseta o estado da confirmação
    const waitingConfirmation = document.querySelector('.waiting-confirmation');
    waitingConfirmation.textContent = 'Aguardando confirmação do proprietário...';
    waitingConfirmation.style.color = '#666';
    
    // Reseta o botão de confirmar
    const confirmButton = document.querySelector('.confirm-button');
    confirmButton.disabled = false;
    confirmButton.style.backgroundColor = '#4CAF50';
}

function sendQuickAlert(message) {
    const placa = document.getElementById('placaAlvo').value.toUpperCase();
    if (!placa) {
        alert('Por favor, digite a placa do veículo!');
        return;
    }

    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('Você precisa fazer login primeiro!');
        showScreen('cadastro');
        return;
    }

    // Buscar informações do veículo no localStorage
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '{}');
    const veiculo = veiculos[placa];

    if (!veiculo) {
        alert('Veículo não encontrado no sistema. Verifique a placa digitada.');
        return;
    }

    showAlert(message, veiculo);
}

// Atualizar o cadastro de veículo para incluir o email do usuário
document.getElementById('vehicleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const placa = document.getElementById('placa').value.toUpperCase();
    const modelo = document.getElementById('modelo').value;
    const cor = document.getElementById('cor').value;
    const estado = document.getElementById('estado').value;
    const userEmail = localStorage.getItem('userEmail');

    // Validação dos campos
    if (!placa || !modelo || !cor || !estado) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (!userEmail) {
        alert('Você precisa fazer login primeiro!');
        showScreen('cadastro');
        return;
    }

    try {
        // Salvar informações do veículo
        const veiculos = JSON.parse(localStorage.getItem('veiculos') || '{}');
        veiculos[placa] = {
            placa: placa,
            modelo: modelo,
            cor: cor,
            estado: estado,
            userEmail: userEmail
        };
        localStorage.setItem('veiculos', JSON.stringify(veiculos));

        // Salvar a placa como o veículo principal do usuário
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
        if (!usuarios[userEmail]) {
            usuarios[userEmail] = {};
        }
        usuarios[userEmail].veiculoPrincipal = placa;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert('Veículo cadastrado com sucesso!');
        showScreen('alertas');
    } catch (error) {
        alert('Erro ao cadastrar veículo. Por favor, tente novamente.');
        console.error('Erro no cadastro:', error);
    }
});

function playConfirmationBeep() {
    createBeep(1000, 300); // Beep mais longo e agudo para confirmação
}

// Atualizar o formulário de alerta personalizado
document.getElementById('alertForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const customMessage = document.getElementById('customMessage').value;
    if (customMessage.trim()) {
        sendQuickAlert(customMessage);
        this.reset();
    }
});

// Formulário de login
// Função para salvar o estado do login
function saveLoginState(email) {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
}

// Função para verificar se o usuário está logado
function checkLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        showScreen('alertas');
    } else {
        showScreen('login');
    }
}

// Atualizar o formulário de login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    // Verificar credenciais
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
    const usuario = usuarios[email];

    if (!usuario || usuario.senha !== senha) {
        alert('Email ou senha incorretos!');
        return;
    }

    // Se as credenciais estiverem corretas
    saveLoginState(email);
    showScreen('alertas');
});

// Função de logout
function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isLoggedIn');
        showScreen('onboarding');
    }
}

// Remove a verificação automática de login para manter o fluxo sequencial
// window.addEventListener('load', checkLoginState);


// Função para formatar/limpar todos os usuários
function formatarUsuarios() {
    if (confirm('Tem certeza que deseja formatar todos os dados de usuários? Esta ação não pode ser desfeita!')) {
        try {
            // Limpa dados de usuários
            localStorage.removeItem('usuarios');
            localStorage.removeItem('veiculos');
            
            // Remove todos os dados de usuários individuais
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    const value = JSON.parse(localStorage.getItem(key));
                    if (value && value.email) {
                        localStorage.removeItem(key);
                        i--; // Ajusta o índice após remover um item
                    }
                } catch (e) {
                    // Ignora itens que não são JSON válido
                    continue;
                }
            }
            
            // Limpa estado de login
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isLoggedIn');
            
            alert('Todos os dados de usuários foram formatados com sucesso!');
            showScreen('onboarding');
        } catch (error) {
            alert('Erro ao formatar dados: ' + error.message);
            console.error('Erro na formatação:', error);
        }
    }
}

// Adicione um botão no HTML para chamar esta função
// Por exemplo, no header da tela de alertas:
document.querySelector('.header-nav').innerHTML = `
    <h2>Enviar Alerta</h2>
    <button class="logout-button" onclick="logout()">Sair</button>
`;

// Função para recuperar senha
function recuperarSenha() {
    const email = document.getElementById('emailRecuperacao').value;
    if (!email) {
        alert('Por favor, digite seu email!');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
    const usuario = usuarios[email];

    if (!usuario) {
        alert('Email não encontrado no sistema!');
        return;
    }

    // Gerar código de verificação (6 dígitos)
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000);
    
    // Salvar código temporariamente
    const codigosRecuperacao = JSON.parse(localStorage.getItem('codigosRecuperacao') || '{}');
    codigosRecuperacao[email] = {
        codigo: codigoVerificacao,
        expiraEm: Date.now() + (10 * 60 * 1000) // 10 minutos
    };
    localStorage.setItem('codigosRecuperacao', JSON.stringify(codigosRecuperacao));

    // Mostrar código (em produção, seria enviado por email)
    alert(`Seu código de verificação é: ${codigoVerificacao}\n\nEm um ambiente real, este código seria enviado para seu email.`);
    
    // Mostrar campo para digitar o código
    document.getElementById('codigoVerificacao').style.display = 'block';
    document.getElementById('emailRecuperacao').readOnly = true;
}

// Função para verificar código e permitir nova senha
function verificarCodigo() {
    const email = document.getElementById('emailRecuperacao').value;
    const codigo = document.getElementById('codigo').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;

    if (!codigo || !novaSenha || !confirmarNovaSenha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (novaSenha !== confirmarNovaSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    const codigosRecuperacao = JSON.parse(localStorage.getItem('codigosRecuperacao') || '{}');
    const dadosRecuperacao = codigosRecuperacao[email];

    if (!dadosRecuperacao || 
        dadosRecuperacao.codigo !== parseInt(codigo) || 
        Date.now() > dadosRecuperacao.expiraEm) {
        alert('Código inválido ou expirado!');
        return;
    }

    // Atualizar senha do usuário
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
    usuarios[email].senha = novaSenha;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Limpar código de recuperação
    delete codigosRecuperacao[email];
    localStorage.setItem('codigosRecuperacao', JSON.stringify(codigosRecuperacao));

    alert('Senha alterada com sucesso! Faça login com sua nova senha.');
    showScreen('login');
}

// Adicionar link de recuperação no formulário de login
document.getElementById('loginForm').insertAdjacentHTML('beforeend', `
    <p style="text-align: center; margin-top: 10px;">
        <a href="#" onclick="showScreen('recuperacao')" style="color: #4CAF50; text-decoration: none;">
            Esqueceu sua senha?
        </a>
    </p>
`);