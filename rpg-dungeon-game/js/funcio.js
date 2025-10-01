  // --- Tipos de armas ---
    const WEAPONS = [
      { name: "Espada", dmg: 5, color: "#ccc", price: 10, desc: "Espada básica." },
      { name: "Hacha", dmg: 7, color: "#a52a2a", price: 18, desc: "Hacha poderosa." },
      { name: "Lanza", dmg: 6, color: "#8f8", price: 15, desc: "Lanza larga." },
      { name: "Daga", dmg: 4, color: "#fff", price: 8, desc: "Daga rápida." },
      { name: "Martillo", dmg: 9, color: "#888", price: 22, desc: "Martillo pesado." },
      { name: "Arco", dmg: 5, color: "#fa0", price: 14, desc: "Arco de madera." },
      { name: "Ballesta", dmg: 8, color: "#0ff", price: 20, desc: "Ballesta precisa." },
      { name: "Maza", dmg: 7, color: "#ff0", price: 17, desc: "Maza contundente." },
      { name: "Katana", dmg: 8, color: "#f0f", price: 25, desc: "Katana afilada." },
      { name: "Tridente", dmg: 6, color: "#0af", price: 16, desc: "Tridente marino." },
      { name: "Cetro mágico", dmg: 10, color: "#c0f", price: 30, desc: "Cetro de mago." },
      { name: "Guantelete", dmg: 5, color: "#f90", price: 12, desc: "Guantelete de fuerza." },
      { name: "Báculo", dmg: 7, color: "#0a0", price: 19, desc: "Báculo druídico." },
      { name: "Espada de fuego", dmg: 12, color: "#f00", price: 40, desc: "Espada ardiente." },
      { name: "Espada de hielo", dmg: 11, color: "#0ff", price: 38, desc: "Espada congelante." },
      { name: "Látigo", dmg: 6, color: "#964B00", price: 13, desc: "Látigo flexible." }
    ];

    // --- Audio básico ---
    let audioCtx, musicGain;
    function playNote(freq, dur=0.2, vol=0.2, type='square') {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    }
    function startMusic() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        musicGain = audioCtx.createGain();
        musicGain.gain.value = 0.08;
        musicGain.connect(audioCtx.destination);
        let t = 0;
        function loop() {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.value = [220, 330, 440, 330][t%4];
          osc.connect(musicGain);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
          osc.onended = () => { osc.disconnect(); };
          t++;
          setTimeout(loop, 400);
        }
        loop();
      }
    }

    // --- Pantalla de inicio ---
    const menu = document.getElementById('menu');
    const endScreen = document.getElementById('end');
    const pauseScreen = document.getElementById('pause');
    let gameStarted = false, paused = false;

    // --- Configuración básica ---
    const TILE = 32;
    const MAP_W = 20, MAP_H = 15;
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const minimap = document.getElementById('minimap');
    const mctx = minimap.getContext('2d');
    const dialog = document.getElementById('dialog');
    const hud = document.getElementById('hud');
    const inventoryDiv = document.getElementById('inventory');

    // --- Piso y enemigos ---
    // Enemigos más retadores: más HP, más daño al jugador, menos experiencia
    const ENEMY_TYPES = [
      {name:"Slime", color:"#0f8", hp:28, exp:2, dmg:4},
      {name:"Goblin", color:"#a22", hp:40, exp:3, dmg:6},
      {name:"Espectro", color:"#88f", hp:72, exp:7, dmg:10},
      {name:"Murciélago", color:"#333", hp:24, exp:1, dmg:3},
      {name:"Orco", color:"#4a2", hp:56, exp:4, dmg:8},
      {name:"Araña", color:"#222", hp:32, exp:2, dmg:5},
      {name:"Zombi", color:"#6a6", hp:48, exp:3, dmg:7},
      {name:"Mago", color:"#aaf", hp:36, exp:5, dmg:9},
      {name:"Rata gigante", color:"#999", hp:20, exp:1, dmg:3},
      {name:"Lobo", color:"#bbb", hp:44, exp:3, dmg:7},
      {name:"Esqueleto", color:"#fff", hp:40, exp:3, dmg:7},
      {name:"Minotauro", color:"#a52a2a", hp:80, exp:10, dmg:14},
      {name:"Fantasma", color:"#eee", hp:32, exp:4, dmg:8},
      {name:"Duende", color:"#0fa", hp:28, exp:2, dmg:5},
      {name:"Demonio", color:"#f00", hp:72, exp:8, dmg:12},
      {name:"Golem", color:"#888", hp:88, exp:12, dmg:16},
      {name:"Serpiente", color:"#0a0", hp:36, exp:2, dmg:6},
      {name:"Bruja", color:"#c0f", hp:52, exp:6, dmg:11},
      {name:"Vampiro", color:"#900", hp:60, exp:7, dmg:13},
      {name:"Dragón", color:"#fa0", hp:120, exp:18, dmg:20}
    ];

    // --- Partículas ---
    let particles = [];
    function addParticle(x, y, color) {
      for(let i=0;i<8;i++) {
        particles.push({
          x: x*TILE+TILE/2, y: y*TILE+TILE/2,
          dx: (Math.random()-0.5)*2, dy: (Math.random()-0.5)*2,
          life: 20+Math.random()*10, color
        });
      }
    }
    function drawParticles() {
      for(let i=particles.length-1;i>=0;i--) {
        let p = particles[i];
        ctx.globalAlpha = Math.max(0, p.life/30);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
        p.x += p.dx; p.y += p.dy; p.life--;
        if(p.life<=0) particles.splice(i,1);
      }
      ctx.globalAlpha = 1;
    }

    // --- Mapa de mazmorra (0: suelo, 1: muro) ---
    let map = [];
    function genMap() {
      map = [];
      for (let y = 0; y < MAP_H; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_W; x++) {
          map[y][x] = (x === 0 || y === 0 || x === MAP_W-1 || y === MAP_H-1 || (Math.random() < 0.13)) ? 1 : 0;
        }
      }
      map[2][2] = 0; // Entrada del piso
      map[MAP_H-2][MAP_W-2] = 0; // Escalera/salida del piso
    }

    // --- Objetos del juego ---
    let currentFloor = 20;
    const MAX_FLOOR = 20;
    let player, enemies, items, chests, inDialog, dialogQueue, inventoryOpen, exp=0, level=1, gold=0, damageAnim=0, merchantHere, merchant;
    let equippedWeapon = WEAPONS[0]; // Espada por defecto

    function resetGame() {
      currentFloor = MAX_FLOOR;
      genMap();
      player = {
        x: 2,
        y: 2,
        px: 2,
        py: 2,
        hp: Math.floor(90 * 1.4),      // 40% más vida inicial
        maxHp: Math.floor(16 * 1.4),   // 40% más vida máxima
        anim: 1,
        dir: 'down',
        inventory: [],
        blink: 0
      };
      equippedWeapon = WEAPONS[0];
      exp = 0;
      level = 1;
      gold = 0;
      damageAnim = 0;
      inventoryOpen = false;
      inDialog = false;
      dialogQueue = [];
      spawnFloor();
      endScreen.style.display = "none";
      pauseScreen.style.display = "none";
      particles = [];
    }

    function spawnFloor() {
      enemies = [];
      items = [];
      chests = [];
      merchantHere = false;
      merchant = null;
      let nEnemies = 5 + Math.floor(Math.random()*3);
      let types = [ENEMY_TYPES[(currentFloor-1)%ENEMY_TYPES.length], ENEMY_TYPES[(currentFloor)%ENEMY_TYPES.length]];
      for(let i=0;i<nEnemies;i++) {
        let etype = types[Math.floor(Math.random()*types.length)];
        let ex, ey;
        do {
          ex = Math.floor(Math.random()*(MAP_W-2))+1;
          ey = Math.floor(Math.random()*(MAP_H-2))+1;
        } while (
          map[ey][ex] !== 0 ||
          enemies.some(e=>e.x===ex&&e.y===ey) ||
          (ex===player.x&&ey===player.y)
        );
        enemies.push({
          x: ex, y: ey, hp: etype.hp, maxHp: etype.hp, anim: 0, dir: 'down', alive: true, type: etype.name, exp: etype.exp, color: etype.color, dmg: etype.dmg
        });
      }
      let placed = 0;
      while (placed < 2) {
        let cx = Math.floor(Math.random()*(MAP_W-2))+1;
        let cy = Math.floor(Math.random()*(MAP_H-2))+1;
        if (
          map[cy][cx] === 0 &&
          !chests.some(c=>c.x===cx&&c.y===cy) &&
          !items.some(i=>i.x===cx&&i.y===cy) &&
          !enemies.some(e=>e.x===cx&&e.y===cy) &&
          !(player.x===cx&&player.y===cy)
        ) {
          chests.push({x: cx, y: cy, opened: false, gold: 5+Math.floor(Math.random()*10)});
          placed++;
        }
      }
      if (Math.random()<0.7) {
        let ix, iy;
        do {
          ix = Math.floor(Math.random()*(MAP_W-2))+1;
          iy = Math.floor(Math.random()*(MAP_H-2))+1;
        } while (
          map[iy][ix] !== 0 ||
          items.some(i=>i.x===ix&&i.y===iy) ||
          enemies.some(e=>e.x===ix&&e.y===iy) ||
          chests.some(c=>c.x===ix&&c.y===iy) ||
          (player.x===ix&&player.y===iy)
        );
        items.push({x: ix, y: iy, type: "Poción", name: "Poción"});
      }
      merchantHere = Math.random()<0.4 && currentFloor!==1;
      if (merchantHere) {
        let mx, my;
        do {
          mx = Math.floor(Math.random()*(MAP_W-2))+1;
          my = Math.floor(Math.random()*(MAP_H-2))+1;
        } while (
          map[my][mx] !== 0 ||
          enemies.some(e=>e.x===mx&&e.y===my) ||
          chests.some(c=>c.x===mx&&c.y===my) ||
          items.some(i=>i.x===mx&&i.y===my) ||
          (player.x===mx&&player.y===my)
        );
        merchant = {x: mx, y: my, name: "Mercader"};
      }
    }

    // --- Control de teclas ---
    const keys = {};
    document.addEventListener('keydown', e => {
      if (!gameStarted) return;
      if (paused && e.key.toLowerCase() === 'p') {
        paused = false;
        pauseScreen.style.display = "none";
        gameLoop();
        return;
      }
      if (paused) return;
      keys[e.key.toLowerCase()] = true;
      if (inDialog && (e.key === ' ' || e.key === 'Enter')) {
        nextDialog();
        return; // <-- Agrega este return para evitar que se procese el inventario mientras hay diálogo
      }
      if (!inDialog && !inventoryOpen && e.key.toLowerCase() === 'i') {
        inventoryOpen = true;
        showInventory();
        return;
      }
      if (inventoryOpen && (e.key === 'Escape' || e.key.toLowerCase() === 'i')) {
        inventoryOpen = false;
        inventoryDiv.style.display = "none";
        return;
      }
      if (endScreen.style.display === "block" && (e.key === ' ' || e.key === 'Enter')) {
        menu.style.display = "block";
        endScreen.style.display = "none";
        gameStarted = false;
        return;
      }
      // --- ATAQUE CON ESPACIO ---
      if (!inDialog && !inventoryOpen && !paused && player.hp > 0 && endScreen.style.display !== "block") {
        if (e.key === ' ') {
          const dirs = [
            {dx:0, dy:-1}, {dx:0, dy:1}, {dx:-1, dy:0}, {dx:1, dy:0}
          ];
          for (const dir of dirs) {
            const nx = player.x + dir.dx, ny = player.y + dir.dy;
            const enemy = enemies.find(en => en.alive && en.x === nx && en.y === ny);
            if (enemy) {
              attackEnemy(enemy);
              break;
            }
          }
        }
      }
    });
    document.addEventListener('keyup', e => {
      keys[e.key.toLowerCase()] = false;
    });

    // --- Dibujo ---
    function drawTile(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
    }
    function drawEnemy(enemy) {
      if (!enemy.alive) return;
      ctx.save();
      ctx.translate(enemy.x*TILE+TILE/2, enemy.y*TILE+TILE/2);
      ctx.rotate(Math.sin(Date.now()/200+enemy.x)*0.1);
      ctx.globalAlpha = enemy.type==="Espectro"||enemy.type==="Fantasma"?0.7:1;
      ctx.fillStyle = enemy.color || "#f00";
      ctx.beginPath();
      ctx.arc(0, 0, TILE/2-6, 0, Math.PI*2);
      ctx.fill();
      ctx.font = "10px monospace";
      ctx.fillStyle = "#fff";
      ctx.fillText(enemy.type, -TILE/2+4, TILE/2-8);
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.fillRect(enemy.x*TILE, enemy.y*TILE-8, TILE, 6);
      ctx.fillStyle = "#f00";
      ctx.fillRect(enemy.x*TILE, enemy.y*TILE-8, TILE*(enemy.hp/enemy.maxHp), 6);
    }
    function drawPlayer() {
      let fx = player.px + (player.x-player.px)*player.anim;
      let fy = player.py + (player.y-player.py)*player.anim;
      ctx.save();
      ctx.translate(fx*TILE+TILE/2, fy*TILE+TILE/2);
      ctx.rotate(Math.sin(Date.now()/200)*0.1);
      ctx.globalAlpha = player.blink>0 ? 0.5+0.5*Math.sin(player.blink*0.5) : 1;
      ctx.fillStyle = "#0af";
      ctx.beginPath();
      ctx.arc(0, 0, TILE/2-4, 0, Math.PI*2);
      ctx.fill();
      if (equippedWeapon) {
        ctx.save();
        let swing = damageAnim>0 ? Math.sin(damageAnim*0.3)*1.2 : 0;
        ctx.rotate(player.dir==='left'?-0.7+swing:player.dir==='right'?0.7-swing:player.dir==='up'?-1.2+swing:1.2-swing);
        ctx.fillStyle=equippedWeapon.color || "#ccc";
        ctx.fillRect(10,0,16,4);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.fillRect(fx*TILE, fy*TILE-8, TILE, 6);
      ctx.fillStyle = "#f00";
      ctx.fillRect(fx*TILE, fy*TILE-8, TILE*(player.hp/player.maxHp), 6);
    }
    function drawItem(item) {
      ctx.save();
      ctx.translate(item.x*TILE+TILE/2, item.y*TILE+TILE/2);
      ctx.fillStyle = item.type === "Poción" ? "#0f0" : "#ff0";
      ctx.beginPath();
      ctx.arc(0, 0, TILE/2-12, 0, Math.PI*2);
      ctx.fill();
      ctx.font = "10px monospace";
      ctx.fillStyle = "#fff";
      ctx.fillText(item.name || item.type, -TILE/2+8, TILE/2-10);
      ctx.restore();
    }
    function drawChest(chest) {
      ctx.save();
      ctx.translate(chest.x*TILE+TILE/2, chest.y*TILE+TILE/2);
      ctx.fillStyle = chest.opened ? "#a80" : "#fd0";
      ctx.fillRect(-TILE/2+8, -TILE/2+8, TILE-16, TILE-16);
      ctx.font = "10px monospace";
      ctx.fillStyle = "#fff";
      ctx.fillText("Cofre", -TILE/2+8, TILE/2-10);
      ctx.restore();
    }
    function drawMerchant() {
      if (!merchantHere || !merchant) return;
      ctx.save();
      ctx.translate(merchant.x*TILE+TILE/2, merchant.y*TILE+TILE/2);
      ctx.fillStyle = "#ff0";
      ctx.beginPath();
      ctx.arc(0, 0, TILE/2-8, 0, Math.PI*2);
      ctx.fill();
      ctx.font = "12px monospace";
      ctx.fillStyle = "#fff";
      ctx.fillText(merchant.name, -TILE/2+4, TILE/2-4);
      ctx.restore();
    }
    function drawMinimap() {
      mctx.clearRect(0,0,minimap.width,minimap.height);
      let scaleX = minimap.width/MAP_W, scaleY = minimap.height/MAP_H;
      for(let y=0;y<MAP_H;y++) for(let x=0;x<MAP_W;x++) {
        mctx.fillStyle = map[y][x]===1?"#444":"#222";
        mctx.fillRect(x*scaleX, y*scaleY, scaleX, scaleY);
      }
      mctx.fillStyle = currentFloor===1?"#0f8":"#888";
      mctx.fillRect((MAP_W-2)*scaleX, (MAP_H-2)*scaleY, scaleX, scaleY);
      mctx.fillStyle = "#fff";
      mctx.fillRect(player.x*scaleX, player.y*scaleY, scaleX, scaleY);
      enemies.forEach(e=>{
        if(e.alive) {
          mctx.fillStyle = e.color;
          mctx.fillRect(e.x*scaleX, e.y*scaleY, scaleX, scaleY);
        }
      });
      items.forEach(i=>{
        mctx.fillStyle = i.type==="Poción"?"#0f0":"#ff0";
        mctx.fillRect(i.x*scaleX, i.y*scaleY, scaleX, scaleY);
      });
      chests.forEach(c=>{
        mctx.fillStyle = c.opened?"#a80":"#fd0";
        mctx.fillRect(c.x*scaleX, c.y*scaleY, scaleX, scaleY);
      });
      if (merchantHere && merchant) {
        mctx.fillStyle = "#ff0";
        mctx.fillRect(merchant.x*scaleX, merchant.y*scaleY, scaleX, scaleY);
      }
      mctx.font = "bold 14px monospace";
      mctx.fillStyle = "#fff";
      mctx.fillText("Piso "+currentFloor, 10, 18);
    }

    // --- HUD e inventario ---
    function showInventory() {
      if (!inventoryOpen) { inventoryDiv.style.display = "none"; return; }
      let html = `<h3>Inventario</h3><ul>`;
      player.inventory.forEach((item,i)=>{
        let type = item.type || (item.name === "Poción" ? "Poción" : "Arma");
        let icon = type==="Poción"?'<span class="icon potion"></span>':type==="Llave"?'<span class="icon key"></span>':type==="Arma"?`<span style="background:${item.color};width:18px;height:18px;display:inline-block;border-radius:3px;margin-right:4px;"></span>`:'';
        html += `<li>${icon}${item.name || item} ${type==="Arma" ? `(Daño: ${item.dmg}) <button class="btn" onclick="equipWeapon(${i})">Equipar</button>` : `<button class="btn" onclick="useItem(${i})">Usar</button>`}</li>`;
      });
      html += `</ul>`;
      html += `<p><span class="icon gold"></span> Oro: ${gold} <br>Nivel: ${level} <br>Exp: ${exp}</p>`;
      html += `<p>Arma equipada: <span style="background:${equippedWeapon.color};width:18px;height:18px;display:inline-block;border-radius:3px;margin-right:4px;"></span>${equippedWeapon.name} (Daño: ${equippedWeapon.dmg})</p>`;
      html += `<button class="btn" onclick="inventoryDiv.style.display='none';inventoryOpen=false;">Cerrar</button>`;
      inventoryDiv.innerHTML = html;
      inventoryDiv.style.display = "block";
    }
    window.equipWeapon = function(i) {
      let item = player.inventory[i];
      if (item.type === "Arma") {
        equippedWeapon = item;
        showDialog([`¡Has equipado ${item.name}!`]);
        playNote(880,0.2,0.2,'triangle');
        addParticle(player.x, player.y, item.color);
      }
      showInventory();
    }
    window.useItem = function(i) {
      let item = player.inventory[i];
      if (item.type === "Poción") {
        player.hp = Math.min(player.maxHp, player.hp+6);
        showDialog(["¡Has usado una poción! HP restaurado."]);
        player.inventory.splice(i,1);
        playNote(660,0.2,0.2,'triangle');
        addParticle(player.x, player.y, "#0f0");
      }
      showInventory();
    }
    function updateHUD() {
      // Muestra la barra de XP con el nuevo cálculo
      let next = Math.floor(level * 10 * 1.58);
      hud.innerHTML = `
        <div class="bar"><div class="bar-inner" style="width:${100*player.hp/player.maxHp}%;background:#f00"></div></div>
        <div class="bar"><div class="bar-inner" style="width:${Math.min(100,100*exp/next)}%;background:#0f0"></div></div>
        <span>Piso: ${currentFloor} | HP: ${player.hp}/${player.maxHp} | Nivel: ${level} | Exp: ${exp}/${next} | <span class="icon gold"></span> ${gold} | Inventario: ${player.inventory.map(it=>it.type==="Poción"?'<span class="icon potion"></span>':it.type==="Llave"?'<span class="icon key"></span>':it.type==="Arma"?`<span style="background:${it.color};width:18px;height:18px;display:inline-block;border-radius:3px;margin-right:4px;"></span>${it.name}`:it).join(" ") || "Vacío"} | <span style="background:${equippedWeapon.color};width:18px;height:18px;display:inline-block;border-radius:3px;margin-right:4px;"></span>${equippedWeapon.name} (Daño: ${equippedWeapon.dmg})</span>
      `;
    }

    // --- Lógica principal ---
    function canMove(x, y) {
      return map[y] && map[y][x] === 0 && !enemies.some(e=>e.alive&&e.x===x&&e.y===y);
    }
    function movePlayer(dx, dy) {
      const nx = player.x + dx, ny = player.y + dy;
      if (canMove(nx, ny)) {
        player.px = player.x; player.py = player.y;
        player.x = nx; player.y = ny;
        player.anim = 0;
        player.dir = dx<0?'left':dx>0?'right':dy<0?'up':'down';
        // Mercader
        if (merchantHere && merchant && merchant.x === player.x && merchant.y === player.y) {
          openMerchantShop();
          return;
        }
        // Ítem
        for (let i = items.length-1; i >= 0; i--) {
          const item = items[i];
          if (item.x === player.x && item.y === player.y) {
            if (item.type === "Poción") {
              player.inventory.push({type:"Poción", name:"Poción"});
              showDialog(["¡Has encontrado una poción!"]);
              playNote(660,0.2,0.2,'triangle');
              addParticle(player.x, player.y, "#0f0");
            }
            items.splice(i, 1);
            return;
          }
        }
        // Cofre
        for (const chest of chests) {
          if (!chest.opened && chest.x === player.x && chest.y === player.y) {
            chest.opened = true;
            gold += chest.gold;
            showDialog([`¡Has abierto un cofre! Oro +${chest.gold}`]);
            playNote(550,0.2,0.2,'triangle');
            addParticle(player.x, player.y, "#fd0");
            return;
          }
        }
        // Enemigo
        for (const enemy of enemies) {
          if (enemy.alive && enemy.x === nx && enemy.y === ny) {
            attackEnemy(enemy);
            return;
          }
        }
        // Escalera/salida del piso
        if (player.x === MAP_W-2 && player.y === MAP_H-2) {
          if (currentFloor === 1) {
            showDialog(["¡Has escapado de la mazmorra! ¡Victoria!"]);
            endGame(true);
          } else {
            currentFloor--;
            genMap();
            player.x = 2; player.y = 2; player.px = 2; player.py = 2;
            spawnFloor();
            showDialog([`¡Subiste al piso ${currentFloor}!`]);
            playNote(880,0.2,0.2,'triangle');
          }
        }
      }
    }
    function attackEnemy(enemy) {
      let dmg = equippedWeapon && equippedWeapon.dmg ? equippedWeapon.dmg : WEAPONS[0].dmg;
      enemy.hp -= dmg;
      // Ahora el daño recibido depende del enemigo
      player.hp -= enemy.dmg;
      damageAnim = 8;
      player.blink = 12;
      showDialog([`¡Has atacado al ${enemy.type} con ${equippedWeapon.name}!`, `¡El ${enemy.type} te ha herido! (-${enemy.dmg} HP)`]);
      playNote(220,0.1,0.2,'square');
      addParticle(enemy.x, enemy.y, enemy.color);
      if (enemy.hp <= 0) {
        enemy.alive = false;
        exp += enemy.exp;
        showDialog([`¡Has derrotado al ${enemy.type}! Exp +${enemy.exp}`]);
        playNote(660,0.2,0.2,'triangle');
        addParticle(enemy.x, enemy.y, "#fff");
        checkLevelUp();
      }
      if (player.hp <= 0) {
        showDialog(["¡Has muerto!"]);
        endGame(false);
      }
    }
    function checkLevelUp() {
      // XP necesaria para subir de nivel aumentada en 58%
      let next = Math.floor(level * 10 * 1.58);
      if (exp >= next) {
        level++;
        player.maxHp += 4;
        player.hp = player.maxHp;
        showDialog([`¡Subiste a nivel ${level}! HP aumentado.`]);
        playNote(990,0.3,0.3,'triangle');
        addParticle(player.x, player.y, "#0f0");
      }
    }
    function endGame(win) {
      setTimeout(()=>{
        endScreen.innerHTML = win ? `<h2>¡Victoria!</h2><p>Escapaste de la mazmorra.<br>Presiona Espacio para volver al menú.</p><button class="btn" onclick="restartGame()">Reiniciar</button>` : `<h2>¡Derrota!</h2><p>Has muerto.<br>Presiona Espacio para volver al menú.</p><button class="btn" onclick="restartGame()">Reiniciar</button>`;
        endScreen.style.display = "block";
      }, 1200);
    }
    window.restartGame = function() {
      endScreen.style.display = "none";
      resetGame();
      gameLoop();
    }
    function showDialog(texts) {
      inDialog = true;
      dialogQueue = texts.slice();
      dialog.style.display = "block";
      dialog.innerText = dialogQueue.shift();
      playNote(440,0.1,0.1);
    }
    function nextDialog() {
      if (dialogQueue.length > 0) {
        dialog.innerText = dialogQueue.shift();
        playNote(330,0.1,0.1);
      } else {
        dialog.style.display = "none";
        inDialog = false;
      }
    }

    // --- Bucle principal ---
    let lastMove = 0;
    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawMinimap();
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          drawTile(x, y, map[y][x] === 1 ? "#444" : "#222");
        }
      }
      drawTile(MAP_W-2, MAP_H-2, currentFloor===1?"#0f8":"#888");
      for (const item of items) drawItem(item);
      for (const chest of chests) drawChest(chest);
      drawMerchant();
      for (const enemy of enemies) drawEnemy(enemy);
      drawPlayer();
      drawParticles();
      updateHUD();

      if (player.anim < 1) {
        player.anim += 0.2;
        if (player.anim > 1) player.anim = 1;
      }
      if (player.blink>0) player.blink--;

      if (damageAnim>0) damageAnim--;

      if (!inDialog && !inventoryOpen && player.hp > 0 && endScreen.style.display!=="block" && !paused) {
        if (Date.now()-lastMove>120) {
          if (keys['w']) { movePlayer(0, -1); keys['w'] = false; lastMove=Date.now(); player.anim=0;}
          if (keys['s']) { movePlayer(0, 1); keys['s'] = false; lastMove=Date.now(); player.anim=0;}
          if (keys['a']) { movePlayer(-1, 0); keys['a'] = false; lastMove=Date.now(); player.anim=0;}
          if (keys['d']) { movePlayer(1, 0); keys['d'] = false; lastMove=Date.now(); player.anim=0;}
        }
      }
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        enemy.anim++;
        let chase = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y) < 6;
        if (chase && Math.random() < 0.15) {
          let dx = player.x - enemy.x, dy = player.y - enemy.y;
          if (Math.abs(dx) > Math.abs(dy)) dx = dx > 0 ? 1 : -1, dy = 0;
          else dy = dy > 0 ? 1 : -1, dx = 0;
          let nx = enemy.x+dx, ny = enemy.y+dy;
          if (canMove(nx, ny) && !enemies.some(e=>e!==enemy&&e.alive&&e.x===nx&&e.y===ny) && !(nx === player.x && ny === player.y)) {
            enemy.x = nx; enemy.y = ny;
          }
        }
      }
      if (gameStarted && !paused) requestAnimationFrame(gameLoop);
    }

    document.getElementById('startBtn').onclick = function() {
      menu.style.display = "none";
      gameStarted = true;
      startMusic();
      resetGame();
      gameLoop();
    };

    menu.style.display = "block";

    // --- Armas para la tienda ---
    const SHOP_WEAPONS = [
      ...WEAPONS,
      { name: "Espada oscura", dmg: 14, color: "#222", price: 55, desc: "Espada maldita." },
      { name: "Martillo de trueno", dmg: 16, color: "#0ff", price: 70, desc: "Martillo electrizante." },
      { name: "Lanza venenosa", dmg: 13, color: "#0a2", price: 48, desc: "Lanza con veneno." },
      { name: "Arco largo", dmg: 10, color: "#fa0", price: 35, desc: "Arco de gran alcance." },
      { name: "Ballesta pesada", dmg: 15, color: "#0ff", price: 60, desc: "Ballesta de gran daño." },
      { name: "Espada celestial", dmg: 18, color: "#fff", price: 90, desc: "Espada bendecida." },
      { name: "Guadaña", dmg: 12, color: "#444", price: 50, desc: "Guadaña mortal." },
      { name: "Bastón de hielo", dmg: 13, color: "#0ef", price: 52, desc: "Bastón congelante." },
      { name: "Espada de rayos", dmg: 17, color: "#ff0", price: 80, desc: "Espada electrificada." },
      { name: "Látigo de fuego", dmg: 11, color: "#f60", price: 42, desc: "Látigo ardiente." }
    ];

    // --- Ventana de tienda mejorada ---
    let merchantShopDiv = document.createElement('div');
    merchantShopDiv.id = "merchantShop";
    merchantShopDiv.style.position = "absolute";
    merchantShopDiv.style.left = "50%";
    merchantShopDiv.style.top = "35%";
    merchantShopDiv.style.transform = "translate(-50%, 0)";
    merchantShopDiv.style.background = "#222";
    merchantShopDiv.style.color = "#fff";
    merchantShopDiv.style.padding = "16px 24px";
    merchantShopDiv.style.border = "2px solid #fff";
    merchantShopDiv.style.minWidth = "340px";
    merchantShopDiv.style.display = "none";
    merchantShopDiv.style.zIndex = "3";
    document.body.appendChild(merchantShopDiv);

    let merchantStock = [];

    function openMerchantShop() {
      merchantStock = [];
      let itemsPool = [...SHOP_WEAPONS];
      for (let i = 0; i < 5; i++) {
        let isPotion = Math.random() < 0.3;
        if (isPotion) {
          merchantStock.push({type:"Poción", name:"Poción", price:5, color:"#0f0"});
        } else {
          let idx = Math.floor(Math.random()*itemsPool.length);
          let arma = itemsPool.splice(idx,1)[0];
          merchantStock.push({...arma, type:"Arma"});
        }
      }
      let html = `<h3>Mercader</h3><p>Selecciona lo que deseas comprar:</p><ul>`;
      merchantStock.forEach((item, i) => {
        let icon = item.type==="Poción"
          ? '<span class="icon potion"></span>'
          : `<span style="background:${item.color};width:18px;height:18px;display:inline-block;border-radius:3px;margin-right:4px;"></span>`;
        html += `<li>${icon}<b>${item.name}</b> ${item.type==="Arma" ? `(Daño: ${item.dmg})` : ""} <span style="color:#aaa;">${item.desc||""}</span> - <span class="icon gold"></span> ${item.price} <button class="btn" onclick="buyMerchantItem(${i})">Comprar</button></li>`;
      });
      html += `</ul><button class="btn" onclick="closeMerchantShop()">Cerrar</button>`;
      merchantShopDiv.innerHTML = html;
      merchantShopDiv.style.display = "block";
    }

    window.buyMerchantItem = function(i) {
      let item = merchantStock[i];
      if (gold >= item.price) {
        if (item.type === "Arma") {
          player.inventory.push({...item});
          showDialog([`¡Has comprado ${item.name}!`]);
          playNote(880,0.2,0.2,'triangle');
          addParticle(player.x, player.y, item.color);
        } else if (item.type === "Poción") {
          player.inventory.push({type:"Poción", name:"Poción"});
          showDialog(["¡Has comprado una poción!"]);
          playNote(660,0.2,0.2,'triangle');
          addParticle(player.x, player.y, "#0f0");
        }
        gold -= item.price;
        closeMerchantShop();
      } else {
        showDialog([`No tienes suficiente oro para comprar ${item.name}.`]);
      }
    };

    window.closeMerchantShop = function() {
      merchantShopDiv.style.display = "none";
    };

    // --- Modifica la interacción con el mercader ---
    function movePlayer(dx, dy) {
      const nx = player.x + dx, ny = player.y + dy;
      if (canMove(nx, ny)) {
        player.px = player.x; player.py = player.y;
        player.x = nx; player.y = ny;
        player.anim = 0;
        player.dir = dx<0?'left':dx>0?'right':dy<0?'up':'down';
        // Mercader
        if (merchantHere && merchant && merchant.x === player.x && merchant.y === player.y) {
          openMerchantShop();
          return;
        }
        // Ítem
        for (let i = items.length-1; i >= 0; i--) {
          const item = items[i];
          if (item.x === player.x && item.y === player.y) {
            if (item.type === "Poción") {
              player.inventory.push({type:"Poción", name:"Poción"});
              showDialog(["¡Has encontrado una poción!"]);
              playNote(660,0.2,0.2,'triangle');
              addParticle(player.x, player.y, "#0f0");
            }
            items.splice(i, 1);
            return;
          }
        }
        // Cofre
        for (const chest of chests) {
          if (!chest.opened && chest.x === player.x && chest.y === player.y) {
            chest.opened = true;
            gold += chest.gold;
            showDialog([`¡Has abierto un cofre! Oro +${chest.gold}`]);
            playNote(550,0.2,0.2,'triangle');
            addParticle(player.x, player.y, "#fd0");
            return;
          }
        }
        // Enemigo
        for (const enemy of enemies) {
          if (enemy.alive && enemy.x === nx && enemy.y === ny) {
            attackEnemy(enemy);
            return;
          }
        }
        // Escalera/salida del piso
        if (player.x === MAP_W-2 && player.y === MAP_H-2) {
          if (currentFloor === 1) {
            showDialog(["¡Has escapado de la mazmorra! ¡Victoria!"]);
            endGame(true);
          } else {
            currentFloor--;
            genMap();
            player.x = 2; player.y = 2; player.px = 2; player.py = 2;
            spawnFloor();
            showDialog([`¡Subiste al piso ${currentFloor}!`]);
            playNote(880,0.2,0.2,'triangle');
          }
        }
      }
    }