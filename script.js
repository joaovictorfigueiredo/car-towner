let player = {
    coins: 888,
    cash: 2,
    level: 4,
    exp: 302,
    cars: [
        { name: "Muscle Car", type: "muscle", color: "#e74c3c", x: 5, y: 1 },
        { name: "Hatch Vermelho", type: "hatch", color: "#e67e22", x: 4, y: 3 },
        { name: "Sedan Branco", type: "sedan", color: "#ecf0f1", x: 6, y: 4 },
        { name: "Picape Azul", type: "truck", color: "#2980b9", x: 2, y: 5 },
        { name: "Fusca Clássico", type: "classic", color: "#27ae60", x: 1, y: 6 }
    ]
};

let editMode = false;
let selectedCar = null;

function loadGame() {
    const saved = localStorage.getItem("cartowner_pro_save");
    if (saved) player = JSON.parse(saved);
}

function saveGame() {
    localStorage.setItem("cartowner_pro_save", JSON.stringify(player));
}

const canvas = document.getElementById("isometricCanvas");
const ctx = canvas.getContext("2d");

function isoToScreen(isoX, isoY) {
    const tileW = 64;
    const tileH = 32;
    const originX = canvas.width / 2;
    const originY = 80;

    return {
        x: originX + (isoX - isoY) * (tileW / 2),
        y: originY + (isoX + isoY) * (tileH / 2)
    };
}

// Conversão inversa de Tela (Mouse) para Coordenadas do Grid Isométrico (x, y)
function screenToIso(screenX, screenY) {
    const tileW = 64;
    const tileH = 32;
    const originX = canvas.width / 2;
    const originY = 80;

    const relX = screenX - originX;
    const relY = screenY - originY;

    const isoX = (relX / (tileW / 2) + relY / (tileH / 2)) / 2;
    const isoY = (relY / (tileH / 2) - relX / (tileW / 2)) / 2;

    return {
        x: Math.floor(isoX),
        y: Math.floor(isoY)
    };
}

function drawProCar(pt, car, isSelected) {
    // Sombra suave no chão
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y + 14, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sombra do corpo do veículo
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.moveTo(pt.x - 26, pt.y + 6);
    ctx.lineTo(pt.x, pt.y + 20);
    ctx.lineTo(pt.x + 26, pt.y + 6);
    ctx.lineTo(pt.x + 26, pt.y + 10);
    ctx.lineTo(pt.x, pt.y + 24);
    ctx.lineTo(pt.x - 26, pt.y + 10);
    ctx.closePath();
    ctx.fill();

    // Carroceria principal
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - 12);
    ctx.lineTo(pt.x + 30, pt.y + 4);
    ctx.lineTo(pt.x, pt.y + 18);
    ctx.lineTo(pt.x - 30, pt.y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.strokeStyle = isSelected ? "#f1c40f" : "#111";
    ctx.stroke();

    // Teto / Cabine
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - 6);
    ctx.lineTo(pt.x + 16, pt.y + 2);
    ctx.lineTo(pt.x, pt.y + 10);
    ctx.lineTo(pt.x - 16, pt.y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Para-brisa brilhante
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - 4);
    ctx.lineTo(pt.x + 10, pt.y + 1);
    ctx.lineTo(pt.x, pt.y + 5);
    ctx.lineTo(pt.x - 10, pt.y + 1);
    ctx.closePath();
    ctx.fill();

    // Indicador visual se estiver selecionado para mover
    if (isSelected) {
        ctx.strokeStyle = "#f39c12";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 4, 34, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Placa de identificação do carro
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(pt.x - 35, pt.y - 28, 70, 16);
    ctx.strokeStyle = isSelected ? "#f1c40f" : "#f39c12";
    ctx.lineWidth = 1;
    ctx.strokeRect(pt.x - 35, pt.y - 28, 70, 16);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(car.name, pt.x, pt.y - 16);
}

function drawIsometricScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Paredes e Estrutura da Garagem
    const gradWall = ctx.createLinearGradient(0, 0, 0, 300);
    gradWall.addColorStop(0, "#f9f6ee");
    gradWall.addColorStop(1, "#d5cebe");
    
    ctx.fillStyle = gradWall;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(50, 130);
    ctx.lineTo(50, 230);
    ctx.lineTo(canvas.width / 2, 380);
    ctx.lineTo(canvas.width - 50, 230);
    ctx.lineTo(canvas.width - 50, 130);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8c8574";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Grid do Piso Isométrico (8x8)
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const pt = isoToScreen(x, y);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x + 32, pt.y + 16);
            ctx.lineTo(pt.x, pt.y + 32);
            ctx.lineTo(pt.x - 32, pt.y + 16);
            ctx.closePath();

            if (editMode && selectedCar) {
                ctx.fillStyle = "rgba(46, 204, 113, 0.3)"; // Destaca o piso em modo de edição
            } else if (x < 4 && y > 3) {
                ctx.fillStyle = (x + y) % 2 === 0 ? "#1e1e1e" : "#2c3e50";
            } else if (x > 4 && y > 2) {
                ctx.fillStyle = "#222222";
            } else {
                ctx.fillStyle = (x + y) % 2 === 0 ? "#fdfbf7" : "#ece4d0";
            }
            ctx.fill();
            ctx.strokeStyle = "#d4cbb3";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Renderização dos carros ordenada por profundidade
    let sortedCars = [...player.cars].sort((a, b) => (a.x + a.y) - (b.x + b.y));
    
    sortedCars.forEach(car => {
        const pt = isoToScreen(car.x, car.y);
        drawProCar(pt, car, car === selectedCar);
    });
}

function updateUI() {
    document.getElementById("coins").textContent = player.coins;
    document.getElementById("cash").textContent = player.cash;
    document.getElementById("player-level").textContent = player.level;
    document.getElementById("player-exp").textContent = String(player.exp).padStart(7, '0');
    drawIsometricScene();
}

// Clique no Canvas para selecionar e reposicionar carros no Modo Edição
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedTile = screenToIso(mouseX, mouseY);

    if (editMode) {
        if (selectedCar) {
            // Se já tem um carro selecionado, move para o tile clicado (se estiver dentro do grid 0-7)
            if (clickedTile.x >= 0 && clickedTile.x < 8 && clickedTile.y >= 0 && clickedTile.y < 8) {
                // Verifica se já tem outro carro na vaga
                const occupant = player.cars.find(c => c.x === clickedTile.x && c.y === clickedTile.y);
                if (!occupant) {
                    selectedCar.x = clickedTile.x;
                    selectedCar.y = clickedTile.y;
                    selectedCar = null;
                    editMode = false;
                    document.getElementById("edit-garage-btn").style.background = "";
                    saveGame();
                    updateUI();
                } else {
                    alert("Esta vaga já está ocupada por outro veículo!");
                }
            }
        } else {
            // Seleciona o carro na coordenada clicada
            const foundCar = player.cars.find(c => c.x === clickedTile.x && c.y === clickedTile.y);
            if (foundCar) {
                selectedCar = foundCar;
                updateUI();
            }
        }
    }
});

// Botão Edit Garage
const editBtn = document.getElementById("edit-garage-btn") || document.querySelector("button:nth-child(1)");
// Criando ou ajustando evento para o botão de editar garagem existente na UI inferior
document.querySelectorAll(".flex button, button").forEach(btn => {
    if (btn.textContent.includes("Edit Garage")) {
        btn.id = "edit-garage-btn";
        btn.addEventListener("click", () => {
            editMode = !editMode;
            selectedCar = null;
            btn.style.background = editMode ? "#f39c12" : "";
            if (editMode) alert("Modo de Edição Ativado! Clique no carro que deseja mover e depois clique na nova vaga.");
            updateUI();
        });
    }
});

// Configurações de modais e botões padrão
const modal = document.getElementById("game-modal");
document.getElementById("btn-buy").addEventListener("click", () => modal.classList.remove("hidden"));
document.getElementById("close-modal").addEventListener("click", () => modal.classList.add("hidden"));

document.getElementById("work-mechanic").addEventListener("click", () => {
    player.coins += 35;
    player.exp += 20;
    updateUI();
    saveGame();
});

document.getElementById("buy-sport-car").addEventListener("click", () => {
    if (player.coins >= 300) {
        player.coins -= 300;
        const newCarsList = ["Super Esportivo", "Drift Master", "Street Racer", "Turbo Coupe"];
        const randomName = newCarsList[Math.floor(Math.random() * newCarsList.length)];
        const randomColors = ["#9b59b6", "#1abc9c", "#e74c3c", "#f1c40f", "#34495e"];
        
        player.cars.push({
            name: randomName,
            type: "sport",
            color: randomColors[Math.floor(Math.random() * randomColors.length)],
            x: Math.floor(Math.random() * 6),
            y: Math.floor(Math.random() * 6)
        });
        updateUI();
        saveGame();
        modal.classList.add("hidden");
        alert("Parabéns! Novo carro adicionado à sua garagem!");
    } else {
        alert("Moedas insuficientes na sua conta!");
    }
});

loadGame();
updateUI();