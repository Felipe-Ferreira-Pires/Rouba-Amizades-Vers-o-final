const TelaInicial = document.getElementById('Tela-Inicial');
const BtnJogar = document.getElementById('iniciarJogo');
const CorPersonagem = document.getElementById("corPersonagem");
const NomePersonagem = document.getElementById("nomePersonagem");

const firebaseConfig = {
  apiKey: "AIzaSyAZUjhUzZXxCnPvQZ9e9XXPdEWJwD302Sk",
  storageBucket: "rouba-amizades.appspot.com",
  databaseURL: "https://rouba-amizades-default-rtdb.firebaseio.com",
  projectId: "rouba-amizades",
  storageBucket: "rouba-amizades.firebasestorage.app",
  messagingSenderId: "43287587360",
  appId: "1:43287587360:web:998c040ced285e9a6eaa45"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database()
const rankingRef = database.ref("ranking");
let jogadorId = null

const rankingDiv = document.getElementById( 'ranking')
const jogadoresRef = database.ref('jogadores')


const rankingLista = document.getElementById( 'rankingLista')
const rankingMenu = document.getElementById( 'rankingMenu')

let nomeJogador = "";

function SalvarPontuacaoNoFireBase () {
    if (!nomeJogador || pontuacao<0) {
        console.log ("Não salva: nomeJogador ou pontuação inválida");
        return
    }
    console.log (`Salvando pontuação: ${pontuacao} para ${nomeJogador}`)

    rankingRef.child(jogadorId).set({
        nome: nomeJogador,
        pontos: pontuacao,
        data: firebase.database.ServerValue.TIMESTAMP
    }).then (() => {
        console.log("A pontuação foi salva com sucesso")
    }).catch((error) => {
        console.log("Erro ao salvar a pontuacao no FireBase"+error)
    })
  }
let raio = 20;
let x = 500;
let y = 500;
let quadradox = 500;
let quadradoy = 100;
let perderx = 500;
let perdery = 500;
let bandeirax = 0;
let bandeiray = 0;
let speedx = 0;
let speedy = 6;
let lado = 60;
let lado2 = 30;
let ladoB = 20;
let ladoB2 = 20;
let corPersonagem = "white";
let canvas;
let novaX, novaY;
let ctx;
let jogador;
let vel = 5;
let pontuacao = 0;
let jogadoresOutros = []
let velX = 0, velY = 0
let toqueJogador = false
let outros2,outros


const imagemDeFundo = new Image ()
const imagemCriança = new Image ()
imagemCriança.src = "criança.webp"
const imagemBola = new Image()
imagemBola.src = "bola.png"

let checkpoint = false;
const perigosos = [];

let setas = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};


let tocouPortalEsquerdo = false;
let tocouPortalDireito = false;
let portalEsquerdo = { 
  x: 0,
  y: 0,
  lado: 50,
  ativo: true
};
let portalDireito = { 
  x: 0,
  y: 0,
  lado: 50,
  ativo: true 
};




BtnJogar.addEventListener('click', () => {
  if (NomePersonagem.value.trim() !== "") {
    nomeJogador = NomePersonagem.value.trim();
    jogadorId = nomeJogador + "_" + Date.now();
    jogadoresRef.child(jogadorId).onDisconnect().remove()
    TelaInicial.classList.add('hidden');
    rankingDiv.style.display ="block"
    corPersonagem = document.getElementById("corPersonagem").value;
    canvas = document.createElement("canvas");
    canvas.id = "meuCanvas";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animar();
    SalvarPontuacaoNoFireBase()
    imagemDeFundo.src="fundo.jpg"

  } else {
    alert("Por favor insira um nome");
  }

  let quantidadeMaxima = 20;
  let contador = 0;
  

  for (let yLinha = 0; yLinha < canvas.height; yLinha += 100) {
    for (let xColuna = 0; xColuna < canvas.width; xColuna += 100) {
      if (contador >= quantidadeMaxima) break;
      perigosos.push({
        x: xColuna,
        y: yLinha,
        lado: 40,
        velX2: 0,
        velY2: (Math.random() * 2) + 1
      });
      contador++;
    }
    if (contador >= quantidadeMaxima) break;
  }
});



rankingRef.orderByChild ('pontos').limitToLast(10).on('value',
   (snapshot) => {
    const dados = snapshot.val () || {};
    const ranking = Object.values(dados).sort((a,b) => b.pontos-a.pontos)
    let htmlMenu = '<h3> Melhores Pontuações </h3><ol>'
    ranking.slice (0,5).forEach(jogador=> {
        htmlMenu += `<li>${jogador.nome}: ${jogador.pontos} </li>`
    })
        htmlMenu += `</ol>`

        rankingMenu.innerHTML = htmlMenu

        let html = ""
        ranking.slice(0,5).forEach(jogador=> {
            html += `<div>${jogador.nome}: ${jogador.pontos}</div>`
        })

        rankingLista.innerHTML = html
   })


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  x = Math.min(Math.max(x, raio), canvas.width - raio);
  y = Math.min(Math.max(y, raio), canvas.height - raio);
 

}

function desenhandoPlayer() {
  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fillStyle = corPersonagem;
  ctx.fill();
  ctx.closePath();
}

function desenharTeste() {
  ctx.fillStyle = "Red";
  for (let inimigo of perigosos) {
    ctx.drawImage (imagemCriança,inimigo.x, inimigo.y, inimigo.lado, inimigo.lado);
  }
}


function desenharPortais() {
  const centroY = canvas.height / 2;

  portalEsquerdo.y = centroY - portalEsquerdo.lado / 2;
  portalDireito.x = canvas.width - portalDireito.lado;
  portalDireito.y = centroY - portalDireito.lado / 2;

  if (portalEsquerdo.ativo) {
    ctx.beginPath();
    ctx.drawImage(imagemBola,portalEsquerdo.x, portalEsquerdo.y, portalEsquerdo.lado, portalEsquerdo.lado);
    ctx.fillStyle = "purple";
    ctx.fill();
    ctx.closePath();
  }

  if (portalDireito.ativo) {
    ctx.beginPath();
    ctx.drawImage(imagemBola,portalDireito.x, portalDireito.y, portalDireito.lado, portalDireito.lado);
    ctx.fillStyle = "purple";
    ctx.fill();
    ctx.closePath();
  }
}


function atualizarPosicao() {
  quadradox += speedx;
  quadradoy += speedy;

  if (quadradox + lado > canvas.width || quadradox - lado < 0) speedx = -speedx;
  if (quadradoy + lado > canvas.height || quadradoy - lado < 0) speedy = -speedy;

  novaY = y;
  novaX = x;

  if (setas.ArrowUp) novaY -= vel;
  if (setas.ArrowDown) novaY += vel;
  if (setas.ArrowLeft) novaX -= vel;
  if (setas.ArrowRight) novaX += vel;

  if (novaX - raio < 0) novaX = raio;
  if (novaX + raio > canvas.width) novaX = canvas.width - raio;
  if (novaY - raio < 0) novaY = raio;
  if (novaY + raio > canvas.height) novaY = canvas.height - raio;

  x = novaX;
  y = novaY;

  for (let inimigo of perigosos) {
    inimigo.x += inimigo.velX2;
    inimigo.y += inimigo.velY2;

    if (inimigo.x + inimigo.lado > canvas.width || inimigo.x < 0) inimigo.velX2 *= -1;
    if (inimigo.y + inimigo.lado > canvas.height || inimigo.y < 0) inimigo.velY2 *= -1;
  }
}


jogadoresRef.on("value", (snapshot) => {
    const todos = snapshot.val() || {}
    jogadoresOutros = []

    for(let id in todos) {
        if (id !==jogadorId){
          
            jogadoresOutros.push({
              id:id,
              ... todos [id] // '...' = spreed
            })
           
        }
    }
})

function animar() {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imagemDeFundo,0,0, canvas.width, canvas.height)
  moverComVelocidade();
  desenhandoPlayer();
  desenharTeste();
  atualizarPosicao();
  verificarColisao();
  DesenharPontuacao();
  desenharPortais();
  atualizarPosicaoFireBase()
  desenharOutrosJogadores()
  atualizarPosicaoOutrosJogadores()
  empurrarOutrosJogadores()



  if (portalEsquerdo.ativo && verificarColisaoComPortal(portalEsquerdo)) {
  tocouPortalEsquerdo = true;
}
if (portalDireito.ativo && verificarColisaoComPortal(portalDireito)) {
  tocouPortalDireito = true;
}


if (portalEsquerdo.ativo && verificarColisaoComPortal(portalEsquerdo)) {
  tocouPortalEsquerdo = true;
  portalEsquerdo.ativo = false; 
  setTimeout(() => {
    portalEsquerdo.ativo = true;
  }, 3000);
}
if (portalDireito.ativo && verificarColisaoComPortal(portalDireito)) {
  tocouPortalDireito = true;
  portalDireito.ativo = false;
  setTimeout(() => {
    portalDireito.ativo = true;
  }, 3000);
}

if (tocouPortalEsquerdo && x >= canvas.width / 2 - raio && x <= canvas.width / 2 + raio) {
  pontuacao++;
  SalvarPontuacaoNoFireBase();

  tocouPortalEsquerdo = false;
}

if (tocouPortalDireito && x >= canvas.width / 2 - raio && x <= canvas.width / 2 + raio) {
  pontuacao++;
  SalvarPontuacaoNoFireBase();

  tocouPortalDireito = false;
}



  for (let inimigo of perigosos) {
    if (verificarColisaoComPerigoso(inimigo)) {
      if (pontuacao >= 0.5) {

      x = canvas.width / 2;
      y = canvas.height / 2;
      inimigo.x = Math.random() * (canvas.width - inimigo.lado);
      inimigo.y = Math.random() * (canvas.height - inimigo.lado);
      pontuacao -= 0.5
      } else {
      x = canvas.width / 2;
      y = canvas.height / 2;
      inimigo.x = Math.random() * (canvas.width - inimigo.lado);
      inimigo.y = Math.random() * (canvas.height - inimigo.lado);
      }
      SalvarPontuacaoNoFireBase();

    } 
  }

  requestAnimationFrame(animar);
}

function verificarColisao() {
  const disX = Math.abs(x - (quadradox + lado / 2));
  const disY = Math.abs(y - (quadradoy + lado / 2));
  const disX2 = Math.abs(x - (perderx + lado2 / 2));
  const disY2 = Math.abs(y - (perdery + lado2 / 2));
  return (disX < raio + lado / 2 && disY < raio + lado / 2) || (disX2 < raio + lado2 / 2 && disY2 < raio + lado2 / 2);
}

function verificarColisaoComPerigoso(obj) {
  const distX = Math.abs(x - (obj.x + obj.lado / 2));
  const distY = Math.abs(y - (obj.y + obj.lado / 2));
  return distX < raio + obj.lado / 2 && distY < raio + obj.lado / 2;
}

function verificarColisaoComPortal(portal) {
  const distX = Math.abs(x - (portal.x + portal.lado / 2));
  const distY = Math.abs(y - (portal.y + portal.lado / 2));
  return distX < raio + portal.lado / 2 && distY < raio + portal.lado / 2;
}

function DesenharPontuacao() {
  ctx.fillStyle = "Black";
  ctx.font = "30px Arial";
  ctx.fillText("Pontuação: " + pontuacao, 100, 40);
}


function desenharOutrosJogadores () {
    for (outros of jogadoresOutros) {
        ctx.beginPath()
        ctx.arc(outros.x,outros.y,raio,0,Math.PI*2)
        ctx.fillStyle= outros.cor || "grey"
        ctx.fill()
        ctx.closePath()

        ctx.font= "14px Arial"
        ctx.fillStyle ="White"
        ctx.fillText(outros.nome, outros.x+raio+5,outros.y);


    }

}

function empurrarOutrosJogadores() {
  for (let outros of jogadoresOutros) {
    let distx = outros.x - x;
    let disty = outros.y - y;
    let d = Math.sqrt(distx * distx + disty * disty);

    if (d > 0 && d < raio * 2) {
      // Normaliza vetor
      let nx = distx / d;
      let ny = disty / d;

      let forca = 5; // intensidade do empurrão

      // aplica em SI MESMO
      velX = -nx * forca;
      velY = -ny * forca;

      // aplica também no OUTRO jogador (via Firebase)
      jogadoresRef.child(outros.id).update({
        velX: nx * forca,
        velY: ny * forca
      });
    }
  }
}





function moverComVelocidade() {
  x += velX;
  y += velY;

  // Desacelera suavemente
  velX *= 0.9; // desacelera suavemente
  velY *= 0.9;


  // Atualiza posição no BD
  jogadoresRef.child(jogadorId).update({
    x: x,
    y: y,

    
  }); 
  
  }



  
function atualizarPosicaoOutrosJogadores() {
  for (let outros of jogadoresOutros) {
    if (outros.velX || outros.velY) {
      outros.x += outros.velX ;
      outros.y += outros.velY ;

      // Garante que não saiam do canvas
      outros.x = Math.max(raio, Math.min(canvas.width - raio, outros.x));
      outros.y = Math.max(raio, Math.min(canvas.height - raio, outros.y));

        }    }
}

function atualizarPosicaoFireBase() {
  jogadoresRef.child(jogadorId).update({
    x: x,
    y: y,
    cor: corPersonagem,
    nome: nomeJogador,
    velX: velX,
    velY: velY
  });
}



document.addEventListener('keydown', function (e) {
  if (e.key.toLowerCase() === "w") setas.ArrowUp = true;
  if (e.key.toLowerCase() === "s") setas.ArrowDown = true;
  if (e.key.toLowerCase() === "a") setas.ArrowLeft = true;
  if (e.key.toLowerCase() === "d") setas.ArrowRight = true;
});

document.addEventListener('keyup', function (e) {
  if (e.key.toLowerCase() === "w") setas.ArrowUp = false;
  if (e.key.toLowerCase() === "s") setas.ArrowDown = false;
  if (e.key.toLowerCase() === "a") setas.ArrowLeft = false;
  if (e.key.toLowerCase() === "d") setas.ArrowRight = false;
});


document.addEventListener('wheel', function(event) {
  if (event.ctrlKey) {
    event.preventDefault();
  }
}, { passive: false }); 

document.addEventListener("keydown", function(e) {
  if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=")) {
    e.preventDefault();
  }
});
