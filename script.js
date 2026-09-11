let player = {
    coins: 150,
    reputation: 1,
    level: 1,
    cars: [
        { name: "Fusca Clássico", color: "#3498db", speed: 10, engineLevel: 1, x: 2, y: 2 },
        { name: "Esportivo", color: "#e74c3c", speed: 45, engineLevel: 1, x: 5, y: 2 }
    ]
};

function loadGame() {
    const saved = localStorage.getItem("cartowner_save_3d");
    if (saved) player = JSON.parse(saved);
}

function saveGame() {
    localStorage.setItem("cartowner_save_3d", JSON.stringify(player));
}

const canvas = document.getElementById("isometricCanvas");
const ctx = canvas.getContext("2d");

// Coordenadas para projeção isométrica
function isoToScreen(isoX, isoY) {
    const tileWidth = 64;
    const tileHeight = 32;
    const originX = canvas.width / 2;
    const originY = 60;

    const screenX = originX + (isoX - isoY) * (tileWidth / 2);
    const screenY = originY + (isoX + isoY) * (tileHeight / 2);
    return { x: screenX, y: screenY };
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar piso quadriculado da garagem
    const rows = 8;
    const cols = 8;
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            const pt = isoToScreen(x, y);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x + 32, pt.y + 16);
            ctx.lineTo(pt.x, pt.y + 32);
            ctx.lineTo(pt.x - 32, pt.y + 16);
            ctx.closePath();
            
            ctx.fillStyle = (x + y) % 2 === 0 ? "#e3d5b8" : "#d4c5a9";
            ctx.fill();
            ctx.strokeStyle = "#b5a382";
            ctx.stroke();
        }
    }

    // Desenhar os carros na perspectiva isométrica 3D
    player.cars.forEach((car, index) => {
        // Distribuir nas vagas da garagem
        let gridX = 2 + (index % 3) * 2;
        let gridY = 2 + Math.floor(index / 3) * 2;
        
        const pt = isoToScreen(gridX, gridY);

        // Corpo estilizado do carrinho 3D isométrico
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 16, 26, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#222";
        ctx.stroke();

        // Cabine do carro
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 12, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nome do carro flutuando na isometric view
        ctx.fillStyle = "#000";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(car.name, pt.x, pt.y - 5);
    });
}

function updateUI() {
    document.getElementById("coins").textContent = player.coins;
    document.getElementById("reputation").textContent = player.reputation;
    document.getElementById("player-level").textContent = player.level;
    drawGrid();
}

// Botões de ação
document.getElementById("work-btn").addEventListener("click", () => {
    player.coins += 15;
    updateUI();
    saveGame();
});

document.getElementById("upgrade-engine-btn").addEventListener("click", () => {
    let car = player.cars[0];
    let cost = 50 * car.engineLevel;
    if (player.coins >= cost) {
        player.coins -= cost;
        car.engineLevel++;
        car.speed += 10;
        updateUI();
        saveGame();
        alert("Motor turbinado!");
    } else {
        alert("Moedas insuficientes!");
    }
});

document.getElementById("buy-car-btn").addEventListener("click", () => {
    if (player.coins >= 300) {
        player.coins -= 300;
        player.cars.push({
            name: "Esportivo " + (player.cars.length + 1),
            color: "#e67e22",
            speed: 50,
            engineLevel: 1
        });
        updateUI();
        saveGame();
        alert("Novo carro estacionado na garagem!");
    } else {
        alert("Moedas insuficientes para o esportivo!");
    }
});

loadGame();
updateUI();