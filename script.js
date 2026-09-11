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
    const originY = 80;

    return {
        x: originX + (isoX - isoY) * (tileW / 2),
        y: originY + (isoX + isoY) * (tileH / 2)
    };
}

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
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y + 14, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - 6);
    ctx.lineTo(pt.x + 16, pt.y + 2);
    ctx.lineTo(pt.x, pt.y + 10);
    ctx.lineTo(pt.x - 16, pt.y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - 4);
    ctx.lineTo(pt.x + 10, pt.y + 1);
    ctx.lineTo(pt.x, pt.y + 5);
    ctx.lineTo(pt.x - 10, pt.y + 1);
    ctx.closePath();
    ctx.fill();

    if (isSelected) {
        ctx.strokeStyle = "#f39c12";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 4, 34, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

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
                ctx.fillStyle = "rgba(46, 204, 113, 0.3)";
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
                    updateUI();
                } else {
                    alert("Esta vaga já está ocupada por outro veículo!");
                }
            }
        } else {
            const foundCar = player.cars.find(c => c.x === clickedTile.x && c.y === clickedTile.y);
            if (foundCar) {
                selectedCar = foundCar;
                updateUI();
            }
        }
    } else {
        const foundCar = player.cars.find(c => c.x === clickedTile.x && c.y === clickedTile.y);
        if (foundCar) {
            const newColor = prompt(`Customizar ${foundCar.name}:\nDigite o código da nova cor HEX (ex: #e74c3c, #3498db, #f1c40f, #9b59b6):`, foundCar.color);
            if (newColor) {
                foundCar.color = newColor;
                saveGame();
                updateUI();
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
            if (editMode) alert("Modo de Edição Ativado! Clique em um carro e depois na vaga de destino.");
            updateUI();
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
            alert(`📊 Status do Jogador:\n- Nível: ${player.level}\n- Carros na Frota: ${player.cars.length}\n- Moedas: ${player.coins}\n- Cash: ${player.cash}`);
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
        alert(`Parabéns! Você subiu para o Level ${player.level}!`);
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
            type: "advanced",
            color: randomColors[Math.floor(Math.random() * randomColors.length)],
            x: Math.floor(Math.random() * 6),
            y: Math.floor(Math.random() * 6)
        });
        updateUI();
        saveGame();
        modal.classList.add("hidden");
        alert(`Parabéns! ${randomName} comprado e estacionado na garagem!`);
    } else {
        alert("Moedas insuficientes na sua conta!");
    }
});

loadGame();
updateUI();