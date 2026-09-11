// Estado inicial do jogador
let player = {
    coins: 100,
    reputation: 1,
    car: {
        name: "Fusca Clássico",
        speed: 10,
        engineLevel: 1
    }
};

// Carregar dados salvos anteriormente no navegador (LocalStorage)
function loadGame() {
    const savedData = localStorage.getItem("cartowner_save");
    if (savedData) {
        player = JSON.parse(savedData);
    }
}

// Salvar progresso automaticamente
function saveGame() {
    localStorage.setItem("cartowner_save", JSON.stringify(player));
}

// Elementos da tela
const coinsEl = document.getElementById("coins");
const reputationEl = document.getElementById("reputation");
const carNameEl = document.getElementById("car-name");
const carSpeedEl = document.getElementById("car-speed");
const workBtn = document.getElementById("work-btn");
const upgradeEngineBtn = document.getElementById("upgrade-engine-btn");
const buySportCarBtn = document.getElementById("buy-sport-car");

// Atualizar informações na tela
function updateUI() {
    coinsEl.textContent = player.coins;
    reputationEl.textContent = player.reputation;
    carNameEl.textContent = player.car.name;
    carSpeedEl.textContent = player.car.speed;
}

// Sistema de navegação por abas
document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", (e) => {
        document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
        
        e.target.classList.add("active");
        const targetTab = document.getElementById(e.target.getAttribute("data-target"));
        targetTab.classList.add("active");
    });
});

// Ação de trabalhar na oficina para ganhar dinheiro
workBtn.addEventListener("click", () => {
    player.coins += 15;
    updateUI();
    saveGame();
});

// Ação de comprar melhoria de motor
upgradeEngineBtn.addEventListener("click", () => {
    let cost = 50 * player.car.engineLevel;
    if (player.coins >= cost) {
        player.coins -= cost;
        player.car.engineLevel += 1;
        player.car.speed += 5;
        alert("Motor melhorado com sucesso!");
        updateUI();
        saveGame();
    } else {
        alert("Moedas insuficientes!");
    }
});

// Ação de comprar novo carro
buySportCarBtn.addEventListener("click", () => {
    if (player.coins >= 300) {
        player.coins -= 300;
        player.car.name = "Carro Esportivo";
        player.car.speed = 40;
        alert("Parabéns! Você comprou um Carro Esportivo!");
        updateUI();
        saveGame();
    } else {
        alert("Moedas insuficientes para comprar o esportivo!");
    }
});

// Inicializar carregando dados e interface
loadGame();
updateUI();