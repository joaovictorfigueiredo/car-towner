let player = {
    coins: 888,
    cash: 2,
    level: 4,
    exp: 302,
    nextLevelExp: 500,
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
let animationFrameId = null;
let animTimer = 0;

function loadGame() {
    const saved = localStorage.getItem("cartowner_pro_save");
    if (saved) {
        player = JSON.parse(saved);
        if (!player.nextLevelExp) player.nextLevelExp = 500;
    }
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
    const originY = 60;

    return {
        x: originX + (isoX - isoY) * (tileW / 2),
        y: originY + (isoX + isoY) * (tileH / 2)
    };
}

function screenToIso(screenX, screenY) {
    const tileW = 64;
    const tileH = 32;
    const originX = canvas.width / 2;
    const originY = 60;

    const relX = screenX - originX;
    const relY = screenY - originY;

    const isoX = (relX / (tileW / 2) + relY / (tileH / 2)) / 2;
    const isoY = (relY / (tileH / 2) - relX / (tileW / 2)) / 2;

    return {
        x: Math.floor(isoX),
        y: Math.floor(isoY)
    };
}

function drawDetailedCar(pt, car, isSelected, offsetY) {
    const currentY = pt.y + offsetY;

    // Sombra do Carro
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(pt.x, currentY + 14, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base inferior / Rodas simuladas
    ctx.fillStyle = "#111";
    ctx.fillRect(pt.x - 22, currentY + 4, 8, 6);
    ctx.fillRect(pt.x + 14, currentY + 4, 8, 6);

    // Corpo principal do Carro (Design por Tipo)
    ctx.fillStyle = car.color;
    ctx.beginPath();
    if (car.type === "muscle") {
        // Carro Esportivo / Muscle robusto
        ctx.moveTo(pt.x - 28, currentY + 2);
        ctx.lineTo(pt.x - 18, currentY - 10);
        ctx.lineTo(pt.x + 18, currentY - 10);
        ctx.lineTo(pt.x + 28, currentY + 2);
        ctx.lineTo(pt.x + 24, currentY + 12);
        ctx.lineTo(pt.x - 24, currentY + 12);
    } else if (car.type === "truck") {
        // Picape com caçamba
        ctx.moveTo(pt.x - 26, currentY + 4);
        ctx.lineTo(pt.x - 20, currentY - 6);
        ctx.lineTo(pt.x + 10, currentY - 6);
        ctx.lineTo(pt.x + 26, currentY + 4);
        ctx.lineTo(pt.x + 24, currentY + 12);
        ctx.lineTo(pt.x - 24, currentY + 12);
    } else {
        // Sedan / Hatch Padrão
        ctx.moveTo(pt.x - 24, currentY + 4);
        ctx.lineTo(pt.x - 14, currentY - 12);
        ctx.lineTo(pt.x + 14, currentY - 12);
        ctx.lineTo(pt.x + 24, currentY + 4);
        ctx.lineTo(pt.x + 22, currentY + 12);
        ctx.lineTo(pt.x - 22, currentY + 12);
    }
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.strokeStyle = isSelected ? "#f1c40f" : "#222";
    ctx.stroke();

    // Vidros / Para-brisa (Cabine)
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.moveTo(pt.x - 14, currentY - 4);
    ctx.lineTo(pt.x - 8, currentY - 12);
    ctx.lineTo(pt.x + 8, currentY - 12);
    ctx.lineTo(pt.x + 14, currentY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brilho no Vidro
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(pt.x - 4, currentY - 10);
    ctx.lineTo(pt.x + 4, currentY - 10);
    ctx.lineTo(pt.x + 2, currentY - 5);
    ctx.lineTo(pt.x - 2, currentY - 5);
    ctx.closePath();
    ctx.fill();

    // Faróis dianteiros brilhantes
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(pt.x + 18, currentY + 2, 4, 3);
    ctx.fillRect(pt.x - 22, currentY + 2, 4, 3);

    // Seleção em destaque
    if (isSelected) {
        ctx.strokeStyle = "#e67e22";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, currentY + 6, 32, 16, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Placa / Nome flutuante do Carro
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(pt.x - 40, currentY - 32, 80, 16);
    ctx.strokeStyle = isSelected ? "#f1c40f" : "#d35400";
    ctx.lineWidth = 1;
    ctx.strokeRect(pt.x - 40, currentY - 32, 80, 16);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(car.name, pt.x, currentY - 20);
}

function drawIsometricScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenho da Estrada de Chegada (Acesso à Garagem)
    ctx.fillStyle = "#34495e";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 48, 20);
    ctx.lineTo(canvas.width / 2 + 48, 20);
    ctx.lineTo(canvas.width / 2 + 120, 120);
    ctx.lineTo(canvas.width / 2 - 120, 120);
    ctx.closePath();
    ctx.fill();

    // Linhas centrais amarelas da estrada
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, 120);
    ctx.stroke();
    ctx.setLineDash([]); // Reseta o tracejado

    // Paredes e Fundo da Garagem
    const gradWall = ctx.createLinearGradient(0, 0, 0, 250);
    gradWall.addColorStop(0, "#2c3e50");
    gradWall.addColorStop(1, "#1a252f");
    
    ctx.fillStyle = gradWall;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 40);
    ctx.lineTo(40, 140);
    ctx.lineTo(40, 220);
    ctx.lineTo(canvas.width / 2, 360);
    ctx.lineTo(canvas.width - 40, 220);
    ctx.lineTo(canvas.width - 40, 140);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f39c12";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Piso Isométrico (Grid 8x8)
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
                ctx.fillStyle = "rgba(46, 204, 113, 0.4)";
            } else {
                ctx.fillStyle = (x + y) % 2 === 0 ? "#2c2c2c" : "#3e3e3e";
            }
            ctx.fill();
            ctx.strokeStyle = "#555";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Renderização dos carros ordenados por profundidade isométrica
    animTimer += 0.06;
    let sortedCars = [...player.cars].sort((a, b) => (a.x + a.y) - (b.x + b.y));
    
    sortedCars.forEach((car, index) => {
        const pt = isoToScreen(car.x, car.y);
        const offsetY = Math.sin(animTimer + index) * 2.5; // Efeito leve de flutuação/motor
        drawDetailedCar(pt, car, car === selectedCar, offsetY);
    });
}

function startRenderLoop() {
    function loop() {
        drawIsometricScene();
        animationFrameId = requestAnimationFrame(loop);
    }
    loop();
}

function updateUI() {
    document.getElementById("coins").textContent = player.coins;
    document.getElementById("cash").textContent = player.cash;
    document.getElementById("player-level").textContent = player.level;
    document.getElementById("player-exp").textContent = String(player.exp).padStart(7, '0');
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedTile = screenToIso(mouseX, mouseY);

    if (editMode) {
        if (selectedCar) {
            if (clickedTile.x >= 0 && clickedTile.x < 8 && clickedTile.y >= 0 && clickedTile.y < 8) {
                const occupant = player.cars.find(c => c.x === clickedTile.x && c.y === clickedTile.y);
                if (!occupant) {
                    selectedCar.x = clickedTile.x;
                    selectedCar.y = clickedTile.y;
                    selectedCar = null;
                    editMode = false;
                    saveGame();
                } else {
                    alert("Esta vaga já está ocupada!");
                }
            }
        } else {
            const foundCar = player.cars.find(c => c.x === clickedTile.x && c.y === clickedTile.y);
            if (foundCar) {
                selectedCar = foundCar;
            }
        }
    } else {
        const foundCar = player.cars.find(c => c.x === clickedTile.x && c.y === clickedTile.y);
        if (foundCar) {
            const newColor = prompt(`Customizar cor de ${foundCar.name} (HEX):\nEx: #e74c3c, #3498db, #f1c40f, #9b59b6`, foundCar.color);
            if (newColor) {
                foundCar.color = newColor;
                saveGame();
            }
        }
    }
});

document.querySelectorAll(".flex button, button").forEach(btn => {
    const text = btn.textContent.trim();
    if (text.includes("Edit Garage")) {
        btn.addEventListener("click", () => {
            editMode = !editMode;
            selectedCar = null;
            if (editMode) alert("Modo de Edição Ativado! Clique no carro e depois na vaga.");
        });
    } else if (text.includes("Challenges")) {
        btn.addEventListener("click", () => {
            player.coins += 150;
            player.exp += 50;
            if (player.exp >= player.nextLevelExp) {
                player.level += 1;
                player.exp -= player.nextLevelExp;
                player.nextLevelExp += 250;
            }
            saveGame();
            updateUI();
            alert("🏁 Desafio Concluído! +150 moedas ganhas!");
        });
    } else if (text.includes("Car Show")) {
        btn.addEventListener("click", () => {
            player.coins += 100;
            saveGame();
            updateUI();
            alert("🏆 Car Show: Premiação de +100 moedas resgatada!");
        });
    } else if (text.includes("Mail")) {
        btn.addEventListener("click", () => {
            alert("📬 Caixa de Entrada: Nenhuma nova mensagem.");
        });
    } else if (text.includes("Stats")) {
        btn.addEventListener("click", () => {
            alert(`📊 Status do Jogador:\n- Nível: ${player.level}\n- Carros na Frota: ${player.cars.length}\n- Moedas: ${player.coins}`);
        });
    }
});

const modal = document.getElementById("game-modal");
document.getElementById("btn-buy").addEventListener("click", () => modal.classList.remove("hidden"));
document.getElementById("close-modal").addEventListener("click", () => modal.classList.add("hidden"));

document.getElementById("work-mechanic").addEventListener("click", () => {
    player.coins += 40;
    player.exp += 35;

    if (player.exp >= player.nextLevelExp) {
        player.level += 1;
        player.exp -= player.nextLevelExp;
        player.nextLevelExp += 250;
        alert(`Parabéns! Nível ${player.level} alcançado!`);
    }

    updateUI();
    saveGame();
});

document.getElementById("buy-sport-car").addEventListener("click", () => {
    if (player.coins >= 300) {
        player.coins -= 300;
        const newCarsList = ["Super Esportivo", "SUV Blindado", "Caminhonete 4x4", "Hypercar GT"];
        const randomName = newCarsList[Math.floor(Math.random() * newCarsList.length)];
        const randomColors = ["#9b59b6", "#1abc9c", "#e74c3c", "#f1c40f", "#34495e", "#e67e22"];
        
        player.cars.push({
            name: randomName,
            type: "muscle",
            color: randomColors[Math.floor(Math.random() * randomColors.length)],
            x: Math.floor(Math.random() * 6),
            y: Math.floor(Math.random() * 6)
        });
        saveGame();
        modal.classList.add("hidden");
        alert(`Parabéns! ${randomName} comprado e estacionado!`);
    } else {
        alert("Moedas insuficientes!");
    }
});

loadGame();
updateUI();
startRenderLoop();