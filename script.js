let player = {
    coins: 888,
    cash: 2,
    level: 4,
    exp: 302,
    cars: [
        { name: "Muscle Car", color: "#557a46", roofColor: "#3c582f", x: 5, y: 1 },
        { name: "Hatch Vermelho", color: "#d9534f", roofColor: "#b53b38", x: 4, y: 3 },
        { name: "Sedan Branco", color: "#ecf0f1", roofColor: "#bdc3c7", x: 6, y: 4 },
        { name: "Picape Azul", color: "#2980b9", roofColor: "#1f618d", x: 2, y: 5 },
        { name: "Fusca Clássico", color: "#c0392b", roofColor: "#922b21", x: 1, y: 6 }
    ]
};

function loadGame() {
    const saved = localStorage.getItem("cartowner_save_3d_real");
    if (saved) player = JSON.parse(saved);
}

function saveGame() {
    localStorage.setItem("cartowner_save_3d_real", JSON.stringify(player));
}

const canvas = document.getElementById("isometricCanvas");
const ctx = canvas.getContext("2d");

function isoToScreen(isoX, isoY) {
    const tileW = 64;
    const tileH = 32;
    const originX = canvas.width / 2;
    const originY = 70;

    return {
        x: originX + (isoX - isoY) * (tileW / 2),
        y: originY + (isoX + isoY) * (tileH / 2)
    };
}

function draw3DCar(pt, car) {
    const height = 18; // Altura tridimensional do veículo

    // Sombra projetada no chão
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y + 12, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Laterais 3D do corpo do carro (Efeito de extrusão para baixo)
    ctx.fillStyle = shadeColor(car.color, -30);
    ctx.beginPath();
    ctx.moveTo(pt.x - 24, pt.y + 10);
    ctx.lineTo(pt.x - 24, pt.y + 10 + height);
    ctx.lineTo(pt.x, pt.y + 22 + height);
    ctx.lineTo(pt.x + 24, pt.y + 10 + height);
    ctx.lineTo(pt.x + 24, pt.y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Corpo Principal (Base superior do carro)
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y + 10, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#111";
    ctx.stroke();

    // Cabine / Teto 3D do Carro
    ctx.fillStyle = car.roofColor;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y + 2, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nome do Carro flutuando acima
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = "bold 10px Tahoma";
    ctx.textAlign = "center";
    ctx.strokeText(car.name, pt.x, pt.y - 12);
    ctx.fillText(car.name, pt.x, pt.y - 12);
}

// Função auxiliar para escurecer cores nas laterais 3D
fn = shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
    R = (R<255)?R:255; G = (G<255)?G:255; B = (B<255)?B:255;
    let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    return "#"+RR+GG+BB;
};

function drawIsometricScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Paredes Tridimensionais da Garagem ao fundo
    ctx.fillStyle = "#e0dccf";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(60, 140);
    ctx.lineTo(60, 220);
    ctx.lineTo(canvas.width / 2, 360);
    ctx.lineTo(canvas.width - 60, 220);
    ctx.lineTo(canvas.width - 60, 140);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8c8574";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Grid do Piso Isométrico
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const pt = isoToScreen(x, y);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x + 32, pt.y + 16);
            ctx.lineTo(pt.x, pt.y + 32);
            ctx.lineTo(pt.x - 32, pt.y + 16);
            ctx.closePath();

            if (x < 4 && y > 3) {
                ctx.fillStyle = (x + y) % 2 === 0 ? "#111" : "#1b4f72"; // Tapetes
            } else if (x > 4 && y > 2) {
                ctx.fillStyle = "#1c1c1c"; // Elevadores
            } else {
                ctx.fillStyle = (x + y) % 2 === 0 ? "#f4efe1" : "#e8e1cd"; // Piso
            }
            ctx.fill();
            ctx.strokeStyle = "#d1c7b3";
            ctx.stroke();
        }
    }

    // Ordenar carros por profundidade isométrica (coordenada X+Y) para sobreposição correta em 3D
    let sortedCars = [...player.cars].sort((a, b) => (a.x + a.y) - (b.x + b.y));
    
    sortedCars.forEach(car => {
        const pt = isoToScreen(car.x, car.y);
        draw3DCar(pt, car);
    });
}

function updateUI() {
    document.getElementById("coins").textContent = player.coins;
    document.getElementById("cash").textContent = player.cash;
    document.getElementById("player-level").textContent = player.level;
    document.getElementById("player-exp").textContent = String(player.exp).padStart(7, '0');
    drawIsometricScene();
}

// Configurações de modais e botões
const modal = document.getElementById("game-modal");
document.getElementById("btn-buy").addEventListener("click", () => modal.classList.remove("hidden"));
document.getElementById("close-modal").addEventListener("click", () => modal.classList.add("hidden"));

document.getElementById("work-mechanic").addEventListener("click", () => {
    player.coins += 25;
    player.exp += 15;
    updateUI();
    saveGame();
});

document.getElementById("buy-sport-car").addEventListener("click", () => {
    if (player.coins >= 300) {
        player.coins -= 300;
        player.cars.push({
            name: "Novo Esportivo",
            color: "#e67e22",
            roofColor: "#b96414",
            x: Math.floor(Math.random() * 5),
            y: Math.floor(Math.random() * 5)
        });
        updateUI();
        saveGame();
        modal.classList.add("hidden");
        alert("Carro 3D adicionado à garagem!");
    } else {
        alert("Moedas insuficientes!");
    }
});

loadGame();
updateUI();