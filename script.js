// Gerenciamento de Estado
const state = {
    currentUser: null,
    vehicles: [],  // Inicializando el array
    alerts: []     // Inicializando el array
};

// Elementos DOM
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const vehicleSection = document.getElementById('vehicleSection');
const alertSection = document.getElementById('alertSection');
const recoverySection = document.getElementById('recoverySection');

// Sistema de Notificação
class NotificationSystem {
    static async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    static async showNotification(title, message) {
        const hasPermission = await this.requestPermission();
        if (hasPermission) {
            const notification = new Notification(title, {
                body: message,
                icon: 'assets/car-icon.svg'
            });

            // Som de notificação
            const audio = new Audio('assets/notification.mp3');
            audio.play();

            return notification;
        }
    }
}

// API Simulada
class API {
    static async login(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Verificar se o usuário já tem veículo cadastrado
                const hasVehicle = state.vehicles.length > 0;
                resolve({ 
                    success: true, 
                    user: { email, name: 'Usuário Teste' },
                    hasVehicle: hasVehicle 
                });
            }, 1000);
        });
    }

    static async registerUser(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, user: userData });
            }, 1000);
        });
    }

    static async registerVehicle(vehicleData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                state.vehicles.push(vehicleData);
                resolve({ success: true, vehicle: vehicleData });
            }, 1000);
        });
    }

    static async sendAlert(alertData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                state.alerts.push(alertData);
                resolve({ success: true, alert: alertData });
            }, 1000);
        });
    }

    static async recoverPassword(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ 
                    success: true, 
                    message: 'Link de recuperação enviado para seu e-mail' 
                });
            }, 1000);
        });
    }
}

// Event Listeners
// Modificar a função loadFromLocalStorage
function loadFromLocalStorage() {
    const savedState = localStorage.getItem('javoucar_state');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        state.currentUser = parsedState.currentUser;
        state.vehicles = parsedState.vehicles || [];
        state.alerts = parsedState.alerts || [];

        if (state.currentUser) {
            // Sempre ir para a seção de alertas se houver usuário logado
            showSection(alertSection);
            updateVehicleList(state.vehicles);
            updateAlertsList();
        } else {
            showSection(loginSection);
        }
    }
}

// Modificar o evento de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;

    const response = await API.login(email, password);
    if (response.success) {
        state.currentUser = response.user;
        saveToLocalStorage();
        // Ir direto para a seção de alertas
        showSection(alertSection);
        updateVehicleList(state.vehicles);
        updateAlertsList();
    }
});

// Modificar o evento de registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        name: e.target.elements[0].value,
        email: e.target.elements[1].value,
        telefone: e.target.elements[2].value,  // Adicionando o telefone
        password: e.target.elements[3].value
    };

    try {
        const response = await API.registerUser(userData);
        if (response.success) {
            state.currentUser = response.user;
            saveToLocalStorage();
            showSection(vehicleSection);
            alert('Usuário cadastrado com sucesso!'); // Feedback para o usuário
        }
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        alert('Erro ao cadastrar usuário. Por favor, tente novamente.');
    }
});

// Event Listeners
// Remova o evento duplicado de registro de veículo e mantenha apenas este
// Função para salvar dados no localStorage (mover para o início do arquivo, após a declaração do state)
function saveToLocalStorage() {
    localStorage.setItem('javoucar_state', JSON.stringify({
        currentUser: state.currentUser,
        vehicles: state.vehicles,
        alerts: state.alerts
    }));
}

// Função para carregar dados do localStorage
// Modificar o evento de logout para manter os veículos
document.getElementById('logoutButton').addEventListener('click', function() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        // Manter os veículos no localStorage
        const savedVehicles = state.vehicles;
        
        // Limpar apenas os dados do usuário e alertas
        state.currentUser = null;
        state.alerts = [];
        
        // Manter os veículos no state
        state.vehicles = savedVehicles;
        
        // Salvar no localStorage
        saveToLocalStorage();
        
        // Mostrar tela de login
        showSection(loginSection);
    }
});

document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const vehicleData = {
            id: Date.now().toString(),
            placa: e.target.elements[0].value.toUpperCase(),
            modelo: e.target.elements[1].value,
            cor: e.target.elements[2].value,
            estado: e.target.elements[3].value
        };

        const response = await API.registerVehicle(vehicleData);
        if (response.success) {
            saveToLocalStorage(); // Agora a função está disponível
            alert('Veículo cadastrado com sucesso!');
            showSection(alertSection);
            updateVehicleList(state.vehicles);
            e.target.reset();
        }
    } catch (error) {
        console.error('Erro ao cadastrar veículo:', error);
        alert('Erro ao cadastrar veículo. Por favor, tente novamente.');
    }
});

// Adicionar evento para transformar placa em maiúscula enquanto digita
document.querySelector('#vehicleForm input[placeholder="Placa"]').addEventListener('input', function(e) {
    this.value = this.value.toUpperCase();
});

// Função para preencher estados
function populateStates() {
    const states = [
        { uf: 'AC', nome: 'Acre' },
        { uf: 'AL', nome: 'Alagoas' },
        { uf: 'AP', nome: 'Amapá' },
        { uf: 'AM', nome: 'Amazonas' },
        { uf: 'BA', nome: 'Bahia' },
        { uf: 'CE', nome: 'Ceará' },
        { uf: 'DF', nome: 'Distrito Federal' },
        { uf: 'ES', nome: 'Espírito Santo' },
        { uf: 'GO', nome: 'Goiás' },
        { uf: 'MA', nome: 'Maranhão' },
        { uf: 'MT', nome: 'Mato Grosso' },
        { uf: 'MS', nome: 'Mato Grosso do Sul' },
        { uf: 'MG', nome: 'Minas Gerais' },
        { uf: 'PA', nome: 'Pará' },
        { uf: 'PB', nome: 'Paraíba' },
        { uf: 'PR', nome: 'Paraná' },
        { uf: 'PE', nome: 'Pernambuco' },
        { uf: 'PI', nome: 'Piauí' },
        { uf: 'RJ', nome: 'Rio de Janeiro' },
        { uf: 'RN', nome: 'Rio Grande do Norte' },
        { uf: 'RS', nome: 'Rio Grande do Sul' },
        { uf: 'RO', nome: 'Rondônia' },
        { uf: 'RR', nome: 'Roraima' },
        { uf: 'SC', nome: 'Santa Catarina' },
        { uf: 'SP', nome: 'São Paulo' },
        { uf: 'SE', nome: 'Sergipe' },
        { uf: 'TO', nome: 'Tocantins' }
    ];

    const stateSelect = document.querySelector('#vehicleForm select');
    stateSelect.innerHTML = '<option value="">Selecione o Estado</option>';
    
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.uf;
        option.textContent = `${state.uf} - ${state.nome}`;
        stateSelect.appendChild(option);
    });
}

// Inicialização
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    showSection(registerSection);
});

// Solicitar permissão de notificação ao carregar a página
NotificationSystem.requestPermission();

// Remover esta linha que estava limpando o localStorage
// localStorage.clear(); <- Remover esta linha

// Adicione após o loadFromLocalStorage()
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    populateStates();  // Chamada para popular os estados
});

// Sistema de Mensagens Pré-configuradas
const MENSAGENS_PREDEFINIDAS = [
    'Carro impedindo saída, por favor retirar',
    'Luzes acesas!',
    'Pneu murcho',
    'Porta-malas aberto',
    'Janela aberta'
];

// Event Listeners
// Sistema de Som
class SoundSystem {
    static beepInterval = null;

    static async playAlertBeeps() {
        // Limpa qualquer intervalo existente
        if (this.beepInterval) {
            clearInterval(this.beepInterval);
        }

        const playBeepSequence = async () => {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const beepDuration = 200;
            const frequency = 800;
            const gap = 300;

            for (let i = 0; i < 3; i++) {
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;
                
                const startTime = context.currentTime + (i * (beepDuration + gap)) / 1000;
                oscillator.start(startTime);
                oscillator.stop(startTime + beepDuration / 1000);
            }
        };

        // Toca a sequência imediatamente
        await playBeepSequence();

        // Configura o intervalo para repetir a cada 3 segundos
        this.beepInterval = setInterval(playBeepSequence, 3000);
    }

    static async playConfirmBeep() {
        // Para a sequência de bips de alerta
        if (this.beepInterval) {
            clearInterval(this.beepInterval);
            this.beepInterval = null;
        }

        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 1000;
        
        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
    }

    static stopAlertBeeps() {
        if (this.beepInterval) {
            clearInterval(this.beepInterval);
            this.beepInterval = null;
        }
    }
}

function showAlertModal(placa, modelo, cor, mensagem) {
    const modal = document.getElementById('alertModal');
    const overlay = document.getElementById('modalOverlay');
    
    document.getElementById('modalPlaca').textContent = placa;
    document.getElementById('modalModelo').textContent = modelo;
    document.getElementById('modalCor').textContent = cor;
    document.getElementById('modalMessage').textContent = mensagem;
    
    modal.classList.add('active');
    overlay.classList.add('active');
    
    // Tocar os três bips de alerta e vibrar o dispositivo
    SoundSystem.playAlertBeeps();
    vibrarDispositivo();
}

// Modificar a função vibrarDispositivo para um padrão mais notável
function vibrarDispositivo() {
    if ('vibrate' in navigator) {
        // Padrão de vibração: 200ms vibra, 100ms para, 200ms vibra
        navigator.vibrate([200, 100, 200]);
    }
}

// Modificar o evento de confirmação para incluir o bip
document.getElementById('confirmAlert').addEventListener('click', function() {
    const modal = document.getElementById('alertModal');
    const overlay = document.getElementById('modalOverlay');
    
    // Para os bips de alerta e toca o bip de confirmação
    SoundSystem.playConfirmBeep();
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
});

// Adicionar limpeza do som quando o modal for fechado por outros meios
window.addEventListener('beforeunload', () => {
    SoundSystem.stopAlertBeeps();
});

// Modificar o evento de envio do alerta
document.getElementById('alertForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const placa = e.target.elements[0].value.toUpperCase();
    
    const veiculoEncontrado = state.vehicles.find(v => v.placa === placa);
    
    if (!veiculoEncontrado) {
        const cadastrar = confirm('Veículo não encontrado. Deseja cadastrar um novo veículo?');
        if (cadastrar) {
            showSection(vehicleSection);
            document.querySelector('#vehicleForm input[placeholder="Placa"]').value = placa;
        }
        return;
    }

    const alertData = {
        vehicleId: placa,
        message: e.target.elements[1].value,
        timestamp: new Date()
    };

    const response = await API.sendAlert(alertData);
    if (response.success) {
        showAlertModal(
            veiculoEncontrado.placa,
            veiculoEncontrado.modelo,
            veiculoEncontrado.cor,
            alertData.message
        );
        NotificationSystem.showNotification('Novo Alerta', alertData.message);
        updateAlertsList();
        e.target.reset();
    }
});

// Função para criar o seletor de mensagens
function createMessageSelector() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-selector';
    
    // Adicionar botões para mensagens pré-definidas
    MENSAGENS_PREDEFINIDAS.forEach(msg => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'message-button';
        button.textContent = msg;
        button.onclick = () => {
            document.querySelector('#alertForm textarea').value = msg;
        };
        messageContainer.appendChild(button);
    });

    // Inserir antes do formulário de alerta
    const alertForm = document.getElementById('alertForm');
    alertForm.parentNode.insertBefore(messageContainer, alertForm);
}

// Funções Auxiliares
function showSection(section) {
    [loginSection, registerSection, vehicleSection, alertSection].forEach(s => {
        s.classList.add('hidden');
    });
    section.classList.remove('hidden');
}

function updateVehicleList(vehicles) {
    const vehicleSelect = document.getElementById('vehicleSelect');
    // Verificar se o elemento existe antes de tentar modificá-lo
    if (!vehicleSelect) {
        console.log('Elemento vehicleSelect não encontrado');
        return; // Sai da função se o elemento não existir
    }
    
    // Limpa as opções existentes
    vehicleSelect.innerHTML = '<option value="">Selecione o Veículo</option>';
    
    // Adiciona os novos veículos
    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.placa} - ${vehicle.modelo}`;
        vehicleSelect.appendChild(option);
    });
}

// Atualizar a função updateAlertsList para mostrar a placa do veículo
function updateAlertsList() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    alertsList.innerHTML = '';
    
    // Ordenar alertas por data (mais recentes primeiro)
    const sortedAlerts = [...state.alerts].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    sortedAlerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item alert-animation';
        alertElement.innerHTML = `
            <p><strong>Placa:</strong> ${alert.vehicleId}</p>
            <p>${alert.message}</p>
            <small>${new Date(alert.timestamp).toLocaleString()}</small>
        `;
        alertsList.appendChild(alertElement);
    });
}

// Adicionar ao DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    populateStates();
    createMessageSelector();
});

// Adicionar evento para o botão de logout
document.getElementById('logoutButton').addEventListener('click', function() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        // Manter os veículos no localStorage
        const savedVehicles = state.vehicles;
        
        // Limpar apenas os dados do usuário e alertas
        state.currentUser = null;
        state.alerts = [];
        
        // Manter os veículos no state
        state.vehicles = savedVehicles;
        
        // Salvar no localStorage
        saveToLocalStorage();
        
        // Mostrar tela de login
        showSection(loginSection);
    }
});

// Atualizar o CSS
const style = document.createElement('style');
style.textContent = `
    .message-selector {
        margin-bottom: 1rem;
        display: grid;
        gap: 0.5rem;
    }
    
    .message-button {
        padding: 0.5rem;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .message-button:hover {
        background-color: #e0e0e0;
    }
`;

// Adicione este código ao seu script.js existente
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Altera o ícone baseado no estado
        const path = this.querySelector('path');
        if (type === 'text') {
            path.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
        } else {
            path.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');
        }
    });
});


function vibrarDispositivo() {
    // Verifica se a API de vibração está disponível
    if ('vibrate' in navigator) {
        // Vibra por 200ms
        navigator.vibrate(200);
    }
}

// Função para exibir alerta com vibração
function exibirAlertaComVibracao(mensagem) {
    // Vibra o dispositivo
    vibrarDispositivo();
    
    // ... existing code ...
    // (seu código existente para exibir o alerta)
    // ... existing code ...
}