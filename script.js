// Estado estruturado do jogador e da garagem (com múltiplos carros)
let player = {
    coins: 150,
    reputation: 1,
    level: 1,
    cars: [
        { id: 1, name: "Fusca Clássico", speed: 10, engineLevel: 1 }
    ]
};

// Carregar dados salvos
function loadGame() {
    const savedData = localStorage.getItem("cartowner_save_v2");
    if (savedData) {
        player = JSON.parse(savedData);
    }
}

// Salvar progresso
function saveGame() {
    localStorage.setItem("cartowner_save_v2", JSON.stringify(player));
}

// Elementos da interface
const coinsEl = document.getElementById("coins");
const reputationEl = document.getElementById("reputation");
const playerLevelEl = document.getElementById("player-level");
const carsGridEl = document.getElementById("cars-grid");
const workBtn = document.getElementById("work-btn");
const upgradeEngineBtn = document.getElementById("upgrade-engine-btn");
const buySportCarBtn = document.getElementById("buy-sport-car");

// Atualizar interface e renderizar vagas da garagem
function updateUI() {
    coinsEl.textContent = player.coins;
    reputationEl.textContent = player.reputation;
    playerLevelEl.textContent = player.level;
    
    // Renderizar carros estacionados na garagem
    carsGridEl.innerHTML = "";
    player.cars.forEach(car => {
        const card = document.createElement("div");
        card.className = "car-mini-card";
        card.innerHTML = `
            🚗
            <h4>${car.name}</h4>
            <p>Vel: ${car.speed}</p>
            <p>Motor: Nv.${car.engineLevel}</p>
        `;
        carsGridEl.appendChild(card);
    });
}

// Sistema de navegação por abas
document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", (e) => {
        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
        
        e.target.classList.add("active");
        document.getElementById(e.target.getAttribute("data-target")).classList.add("active");
    });
});

// Ação de trabalhar na oficina
workBtn.addEventListener("click", () => {
    player.coins += 15;
    updateUI();
    saveGame();
});

// Melhorar motor do primeiro carro da garagem
upgradeEngineBtn.addEventListener("click", () => {
    let mainCar = player.cars[0];
    let cost = 50 * mainCar.engineLevel;
    if (player.coins >= cost) {
        player.coins -= cost;
        mainCar.engineLevel += 1;
        mainCar.speed += 8;
        alert("Motor melhorado com sucesso!");
        updateUI();
        saveGame();
    } else {
        alert("Moedas insuficientes!");
    }
});

// Comprar novo carro esportivo para a garagem
buySportCarBtn.addEventListener("click", () => {
    if (player.coins >= 300) {
        player.coins -= 300;
        player.cars.push({
            id: player.cars.length + 1,
            name: "Carro Esportivo",
            speed: 45,
            engineLevel: 1
        });
        alert("Parabéns! Novo carro adicionado à garagem!");
        updateUI();
        saveGame();
    } else {
        alert("Moedas insuficientes para comprar o esportivo!");
    }
});

// Inicialização
loadGame();
updateUI();