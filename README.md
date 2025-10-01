[▶️ Jugar RPG Dungeons](https://mcapoterovaina-tech.github.io/RPGDungeons/rpg-dungeon-game/index.html)
<h1>Documento de Diseño Técnico: RPG Dungeon Laberinto</h1>

<h2>1.0 Introducción a la Arquitectura del Juego</h2>

<h2>1.1. Propósito del Documento</h2>
<p>Este documento de diseño técnico tiene como objetivo desglosar la arquitectura de software del juego "RPG Dungeon Laberinto", un roguelike desarrollado íntegramente en JavaScript puro, HTML y CSS. Su propósito es servir como una guía fundamental para el equipo de desarrollo, proporcionando un análisis detallado de los componentes clave del sistema. Se cubrirá desde las estructuras de datos que definen el contenido del juego hasta el bucle principal que orquesta la lógica y el renderizado, con el fin de facilitar la incorporación de nuevos miembros al proyecto, así como el mantenimiento y la expansión del código existente.</p>

<h2>1.2. Resumen de la Arquitectura</h2>
<p>La arquitectura del juego está organizada de manera pragmática en tres capas principales que separan las responsabilidades de forma clara:</p>
<p>• Capa de Presentación: Compuesta por el HTML que estructura los elementos de la interfaz (menús, diálogos, inventario) y el CSS que define su estilo visual. El componente central de esta capa es el elemento &lt;canvas&gt; de HTML, donde el motor de renderizado dibuja activamente el mundo del juego, los personajes y los efectos visuales.</p>
<p>• Capa de Lógica del Juego: Es el núcleo del sistema, escrito en JavaScript. Gestiona el estado completo del juego, incluyendo la posición del jugador, las estadísticas de los enemigos y los objetos del mapa. Contiene la lógica de interacción (movimiento, combate), los sistemas de generación procedural y, fundamentalmente, el gameLoop que actualiza y sincroniza todos los componentes en cada fotograma.</p>
<p>• Capa de Datos: Se basa en estructuras de datos estáticas, principalmente arrays de objetos, que definen el contenido del juego. Constantes como WEAPONS y ENEMY_TYPES actúan como una base de datos en memoria, permitiendo que la lógica del juego acceda a las propiedades de los enemigos y el equipamiento sin codificar estos valores directamente en las funciones.</p>

<h2>1.3. Próximos Pasos</h2>
<p>El análisis comenzará por la capa de datos, examinando las estructuras estáticas que sirven de cimiento para todo el contenido del juego.</p>

<h2>2.0 Definición de Contenido: Estructuras de Datos Estáticas</h2>

<h2>2.1. Estrategia de Separación de Datos</h2>
<p>La arquitectura del juego adopta un enfoque estratégico clave al separar los datos de contenido de la lógica de programación. Al definir entidades como armas, enemigos y objetos de la tienda en arrays de objetos (const WEAPONS, const ENEMY_TYPES), se logra un sistema altamente modular. Este diseño permite a los desarrolladores y diseñadores de juego modificar, equilibrar o ampliar el contenido del juego (añadiendo nuevas armas o enemigos) simplemente editando estos arrays, sin necesidad de alterar el código del motor principal. Esta separación agiliza el desarrollo y facilita el mantenimiento a largo plazo.</p>

<h2>2.2. Constante WEAPONS</h2>
<p>La constante WEAPONS define la base de datos de todas las armas disponibles que pueden ser encontradas o equipadas por el jugador. Cada objeto dentro del array representa un arma con un conjunto de propiedades que dictan su comportamiento en el juego.</p>
<p>Propiedad: name — Propósito: El nombre del arma, mostrado en la UI (inventario, diálogos).</p>
<p>Propiedad: dmg — Propósito: El valor de daño base que inflige el arma en el sistema de combate.</p>
<p>Propiedad: color — Propósito: El código de color hexadecimal para la representación visual del arma en el canvas.</p>
<p>Propiedad: price — Propósito: El costo en oro del arma, utilizado en el sistema de la tienda.</p>
<p>Propiedad: desc — Propósito: Una breve descripción textual para la UI.</p>

<h2>2.3. Constante ENEMY_TYPES</h2>
<p>De forma similar, ENEMY_TYPES funciona como un bestiario que define las características de cada tipo de enemigo que el jugador puede encontrar en la mazmorra. Estos atributos son cruciales para balancear la curva de dificultad y la progresión del jugador. La lógica de generación de enemigos en spawnFloor() selecciona tipos basados en el currentFloor, lo que significa que a medida que el jugador desciende, se enfrenta a desafíos mayores. Por ejemplo, un enemigo de piso bajo como el Murciélago (hp: 24, dmg: 3, exp: 1) contrasta marcadamente con un enemigo de alto nivel como el Dragón (hp: 120, dmg: 20, exp: 18). Este dramático incremento en los atributos clave define una curva de progresión y recompensa pronunciada.</p>
<p>Propiedad: name — Propósito: El nombre del tipo de enemigo, mostrado en la UI y los diálogos.</p>
<p>Propiedad: color — Propósito: El color utilizado para renderizar al enemigo en el canvas.</p>
<p>Propiedad: hp — Propósito: Los puntos de vida iniciales del enemigo, determinando su resistencia.</p>
<p>Propiedad: exp — Propósito: La cantidad de puntos de experiencia que el jugador recibe al derrotarlo.</p>
<p>Propiedad: dmg — Propósito: El daño que el enemigo inflige al jugador durante el combate.</p>

<h2>2.4. Constante SHOP_WEAPONS</h2>
<p>La constante SHOP_WEAPONS es una extensión de WEAPONS. Utiliza el operador de propagación (...WEAPONS) para incluir todas las armas base y luego añade un conjunto de armas más poderosas y caras. Esta estructura de datos se utiliza exclusivamente para poblar el inventario del mercader (merchantStock), ofreciendo al jugador una vía de progresión de equipo a medida que acumula oro.</p>

<h2>2.5. Conclusión de la Sección</h2>
<p>Una vez definidos los datos estáticos que dan forma al contenido, el siguiente paso es analizar cómo el juego gestiona la información dinámica que cambia constantemente durante una partida.</p>

<h2>3.0 Núcleo del Juego: Configuración y Gestión de Estado</h2>

<h2>3.1. Rol de las Variables Globales y de Configuración</h2>
<p>Las constantes de configuración y las variables de estado globales forman la columna vertebral del motor del juego. Las constantes, como MAP_W y MAP_H, establecen las reglas inmutables del mundo, definiendo sus dimensiones físicas. Por otro lado, las variables de estado mantienen un registro en tiempo real de cada elemento dinámico: la posición y salud del jugador (player), la lista de enemigos en el piso actual (enemies), el oro acumulado (gold) y los estados de la interfaz (inDialog). Este conjunto de variables representa una "instantánea" completa del juego en cualquier momento.</p>

<h2>3.2. Constantes de Configuración</h2>
<p>Estas constantes definen los parámetros fundamentales del mundo del juego y su renderizado.</p>
<p>• TILE: Un entero (32) que representa el tamaño en píxeles de cada celda del mapa (ancho y alto). Es la unidad base para todos los cálculos de posición y renderizado.</p>
<p>• MAP_W y MAP_H: Definen las dimensiones del mapa en unidades de TILE (20 de ancho por 15 de alto). Estos valores controlan directamente el tamaño de la mazmorra generada.</p>

<h2>3.3. Variables Clave de Gestión de Estado</h2>
<p>Las siguientes variables son cruciales para rastrear el estado del juego en tiempo real.</p>
<p>Estado del Jugador — player: Objeto que contiene todos los datos del jugador (posición, HP, inventario, etc.). Ejemplo: player.hp -= enemy.dmg;</p>
<p>Estado del Jugador — gold: Cantidad de oro que posee el jugador. Ejemplo: gold += chest.gold;</p>
<p>Estado del Jugador — level: Nivel actual del jugador. Ejemplo: level++; en checkLevelUp()</p>
<p>Estado del Jugador — exp: Puntos de experiencia acumulados por el jugador. Ejemplo: exp += enemy.exp;</p>
<p>Entidades del Piso — enemies: Array de objetos que representa a todos los enemigos vivos en el piso. Ejemplo: for (const enemy of enemies) drawEnemy(enemy);</p>
<p>Entidades del Piso — items: Array de objetos para los ítems en el suelo (ej. pociones). Ejemplo: items.splice(i, 1); al recoger un ítem.</p>
<p>Entidades del Piso — chests: Array de objetos para los cofres en el piso. Ejemplo: chest.opened = true;</p>
<p>Entidades del Piso — merchantHere: Booleano que indica si un mercader ha aparecido en el piso actual. Ejemplo: if (merchantHere && merchant.x === player.x)</p>
<p>Entidades del Piso — merchant: Objeto que contiene los datos del mercader si merchantHere es true. Ejemplo: drawMerchant()</p>
<p>Estado de la Interfaz — inDialog: Booleano que indica si un cuadro de diálogo está activo (pausa la acción). Ejemplo: if (inDialog) return; para bloquear el movimiento.</p>
<p>Estado de la Interfaz — inventoryOpen: Booleano que indica si el menú de inventario está visible. Ejemplo: if (!inDialog && !inventoryOpen && e.key.toLowerCase() === 'i')</p>
<p>Estado de la Interfaz — dialogQueue: Array que almacena la secuencia de mensajes a mostrar en el diálogo. Ejemplo: dialogQueue = texts.slice(); en showDialog()</p>
<p>Estado del Juego — currentFloor: El número del piso actual de la mazmorra. Ejemplo: currentFloor--; al subir las escaleras.</p>
<p>Estado del Juego — paused: Booleano que indica si el juego está en estado de pausa. Ejemplo: if (gameStarted && !paused) requestAnimationFrame(gameLoop);</p>

<h2>3.4. Inicialización y Generación de Niveles</h2>
<p>Las funciones resetGame() y spawnFloor() son responsables de establecer y restablecer el estado del juego.</p>
<p>• resetGame(): Esta función se invoca al comenzar una nueva partida. Inicializa el estado completo del juego a sus valores por defecto. Resetea gold, exp y level, y coloca al jugador en el piso más alto (currentFloor = MAX_FLOOR). Es crucial notar la inicialización de las estadísticas del jugador: la vida actual (hp) se establece en 126 (Math.floor(90 * 1.4)), mientras que la vida máxima (maxHp) se establece en 22 (Math.floor(16 * 1.4)). Esto proporciona al jugador una reserva de salud inicial significativa, muy por encima de su máximo base, para facilitar el arranque. Finalmente, llama a spawnFloor() para poblar el primer nivel.</p>
<p>• spawnFloor(): Esta función se ejecuta cada vez que el jugador llega a un nuevo piso. Su responsabilidad es poblar el mapa vacío con entidades dinámicas, garantizando la rejugabilidad. Genera un número variable de enemigos (5 a 7), dos cofres, una posible poción en el suelo (70% de probabilidad) y un mercader (40% de probabilidad, excepto en el último piso). La posición de cada entidad se elige aleatoriamente en una casilla de suelo válida y desocupada.</p>

<h2>3.5. Transición</h2>
<p>La creación del estado de un piso depende de una estructura de mapa transitable, la cual es generada por un algoritmo procedural específico.</p>

<h2>4.0 Generación Procedural del Mundo</h2>

<h2>4.1. Importancia de la Generación Procedural</h2>
<p>La generación procedural es un pilar del género roguelike, y en este juego, la función genMap() es la responsable de esta tarea. Su objetivo es crear un diseño de mazmorra único para cada piso, asegurando que ninguna partida sea idéntica a la anterior. Esto fomenta la adaptabilidad del jugador y aumenta significativamente la rejugabilidad del título.</p>

<h2>4.2. Análisis del Algoritmo</h2>
<p>El algoritmo de genMap() es un método simple pero efectivo para generar un mapa cavernoso.</p>
<p>1. Inicialización: Crea una matriz bidimensional vacía llamada map.</p>
<p>2. Iteración: Recorre cada celda (x, y) de la matriz.</p>
<p>3. Lógica Condicional: Para cada celda, aplica una serie de reglas:</p>
<p>• Si la celda está en el borde del mapa (x === 0, y === 0, etc.), se designa como un muro (1).</p>
<p>• Para las celdas interiores, se utiliza una probabilidad (Math.random() &lt; 0.13) para determinar si se convierte en un muro (1). En caso contrario, es una celda de suelo transitable (0).</p>
<p>4. Puntos de Acceso Garantizados: De manera crucial, el algoritmo asegura explícitamente que la casilla de entrada (map[2][2] = 0) y la de salida (map[MAP_H-2][MAP_W-2] = 0) sean siempre suelo, garantizando que el nivel sea siempre navegable desde el inicio hasta el fin.</p>

<h2>4.3. Conclusión</h2>
<p>Una vez que el mapa ha sido generado por genMap() y poblado con entidades por spawnFloor(), el siguiente paso lógico es traducir esta estructura de datos en una representación visual para el jugador, una tarea que recae en el motor de renderizado.</p>

<h2>5.0 Motor de Renderizado y Componentes Visuales</h2>

<h2>5.1. Rol del Motor de Renderizado</h2>
<p>El motor de renderizado es el conjunto de funciones de JavaScript cuya única responsabilidad es traducir el estado actual del juego (almacenado en variables como map, player, enemies, etc.) en una representación visual en el elemento &lt;canvas&gt; del HTML. Este proceso se repite en cada fotograma del bucle principal del juego para crear la ilusión de movimiento y de interactividad.</p>

<h2>5.2. Desglose de las Funciones de Dibujado</h2>
<p>Cada función de dibujado se especializa en renderizar un tipo específico de entidad, dependiendo de los datos de estado correspondientes.</p>
<p>• drawTile(): Es la función más básica. Renderiza el mapa base, celda por celda, dibujando un rectángulo de un color (#444 para muros, #222 para suelo) según el valor (1 o 0) almacenado en la matriz map.</p>
<p>• drawPlayer(): Visualiza el objeto player. Su lógica es más compleja, ya que gestiona efectos visuales. Para crear una animación de movimiento fluida, utiliza la variable player.anim —un valor de progreso de 0.0 a 1.0— para interpolar la posición en pantalla del jugador entre su casilla anterior (player.px, player.py) y su casilla actual (player.x, player.y). También aplica un efecto de parpadeo cuando el jugador recibe daño (player.blink &gt; 0) y renderiza una animación de ataque (damageAnim).</p>
<p>• drawEnemy(): Itera sobre el array enemies y dibuja cada enemigo vivo. Además de su forma y color (definidos en ENEMY_TYPES), renderiza una barra de vida sobre su cabeza, calculando su longitud en proporción a su hp actual frente a su maxHp.</p>
<p>• drawItem(), drawChest(), y drawMerchant(): Estas funciones se encargan de renderizar los objetos interactivos del mapa, obteniendo sus posiciones de los arrays items y chests y de la variable merchant. La apariencia de los cofres cambia si su propiedad opened es true.</p>
<p>• drawParticles(): Gestiona y renderiza el array particles. Cada partícula tiene una posición, velocidad y tiempo de vida. Esta función actualiza su estado en cada fotograma y las dibuja en pantalla, creando efectos visuales para acciones como ataques o la obtención de objetos.</p>

<h2>5.3. Función y Lógica de drawMinimap()</h2>
<p>La función drawMinimap() proporciona una vista táctica esencial para el jugador. Toma los datos del map y las posiciones de todas las entidades (player, enemies, items, etc.) y los renderiza en un canvas separado, utilizando un contexto de renderizado distinto llamado mctx. Cada entidad se representa como un píxel de un color distintivo (blanco para el jugador, colores específicos para enemigos, verde para pociones), lo que permite al jugador orientarse rápidamente y planificar su ruta a través del nivel.</p>

<h2>5.4. Transición</h2>
<p>La representación visual del juego es estática en sí misma. Lo que le da vida es el bucle principal que invoca estas funciones de dibujado constantemente y orquesta toda la lógica del juego.</p>

<h2>6.0 Lógica Principal y Flujo de Juego (Game Loop)</h2>

<h2>6.1. El Corazón del Juego</h2>
<p>La función gameLoop() es el motor central del juego. Se ejecuta de forma continua gracias a requestAnimationFrame, un mecanismo del navegador que sincroniza la ejecución con la tasa de refresco del monitor. En cada fotograma, gameLoop() es responsable de orquestar la secuencia completa de operaciones: actualizar el estado del juego, procesar las acciones del jugador y renderizar el resultado en pantalla.</p>

<h2>6.2. Secuencia de Operaciones dentro del Bucle</h2>
<p>El orden de ejecución dentro del bucle es crítico para asegurar un comportamiento consistente y un renderizado correcto.</p>
<p>1. Limpieza del Canvas: La primera operación es ctx.clearRect, que borra el contenido del fotograma anterior.</p>
<p>2. Renderizado por Capas: Se invoca la secuencia de funciones de dibujado en un orden estricto para garantizar el correcto apilamiento visual (eje Z). Esta secuencia asegura que el mapa se dibuje primero, luego los objetos estáticos y finalmente las entidades dinámicas como enemigos y el jugador en la capa superior:</p>
<p>• drawMinimap()</p>
<p>• drawTile() (para cada celda del mapa)</p>
<p>• drawItem()</p>
<p>• drawChest()</p>
<p>• drawMerchant()</p>
<p>• drawEnemy()</p>
<p>• drawPlayer()</p>
<p>• drawParticles()</p>
<p>3. Actualización de la Interfaz: Se llama a updateHUD() para refrescar la información de estado (HP, Nivel, Oro, etc.) en la capa de HTML.</p>
<p>4. Procesamiento de Animaciones: Se actualizan los contadores que controlan las animaciones visuales, como player.anim (movimiento), player.blink (daño recibido) y damageAnim (ataque).</p>
<p>5. Manejo del Input del Jugador: Se verifica el estado del objeto keys. Si una tecla de movimiento está presionada y ha pasado un tiempo mínimo desde el último movimiento, se invoca a movePlayer.</p>
<p>6. Lógica de IA Enemiga: Se itera sobre todos los enemigos. Si un enemigo está cerca del jugador y una comprobación de probabilidad tiene éxito, intenta moverse hacia el jugador.</p>
<p>7. Recursión: Finalmente, se llama a requestAnimationFrame(gameLoop) para programar la ejecución del siguiente fotograma.</p>

<h2>6.3. Validación de Movimiento</h2>
<p>La función canMove(x, y) es un componente de validación crucial que previene movimientos ilegales. Antes de que cualquier entidad (jugador o enemigo) se mueva a una nueva casilla, esta función comprueba dos condiciones fundamentales:</p>
<p>1. Que la casilla de destino en la matriz map sea suelo (su valor es 0).</p>
<p>2. Que la casilla de destino no esté actualmente ocupada por un enemigo vivo. Solo si ambas condiciones son verdaderas, el movimiento es permitido.</p>

<h2>6.4. Sistema de Combate</h2>
<p>El combate se gestiona en la función attackEnemy, que se activa cuando el jugador presiona Espacio junto a un enemigo. El flujo de eventos es el siguiente:</p>
<p>1. Intercambio de Daño: El jugador inflige daño al enemigo, calculado a partir del dmg del equippedWeapon. Simultáneamente, el enemigo contraataca, infligiendo un daño fijo definido por su enemy.dmg.</p>
<p>2. Reducción de HP: Se actualizan los puntos de vida de ambos combatientes.</p>
<p>3. Feedback Visual y Auditivo: Se activan animaciones (damageAnim, player.blink), se reproducen efectos de sonido (playNote) y se generan partículas (addParticle) para comunicar el impacto.</p>
<p>4. Comprobación de Estado: Se verifica si la vida del enemigo ha llegado a cero. Si es así, el enemigo es derrotado, y el jugador recibe experiencia (exp). A continuación, se comprueba la vida del jugador. Si llega a cero, el juego termina.</p>

<h2>6.5. Sistema de Progresión</h2>
<p>Esta función gestiona el sistema de subida de nivel. Se invoca cada vez que el jugador gana experiencia. Compara la exp total del jugador con el umbral necesario para el siguiente nivel, calculado mediante la fórmula Math.floor(level * 10 * 1.58). Si se alcanza el umbral, el jugador sube de nivel (level++), su vida máxima aumenta (maxHp += 4), y su salud se restaura por completo.</p>

<h2>6.6. Transición</h2>
<p>Para que el gameLoop pueda procesar las acciones del jugador, primero debe recibir las órdenes del usuario, lo cual nos lleva a los sistemas de interacción.</p>

<h2>7.0 Sistemas de Interacción del Jugador</h2>

<h2>7.1. El Puente entre Jugador y Juego</h2>
<p>Los sistemas de gestión de entradas y de interacción son el puente fundamental entre las intenciones del jugador y la lógica del juego. Estos componentes son responsables de capturar las pulsaciones de teclas y traducirlas en acciones significativas dentro del mundo virtual, como moverse por la mazmorra, atacar a un enemigo, gestionar el inventario o comerciar con un mercader.</p>

<h2>7.2. Sistema de Control por Teclado</h2>
<p>El control del jugador se implementa a través de event listeners globales para los eventos keydown y keyup.</p>
<p>• Al presionar una tecla, el evento keydown establece la propiedad correspondiente en el objeto keys a true (ej. keys['w'] = true).</p>
<p>• Al soltarla, el evento keyup la revierte a false.</p>
<p>Este sistema está gobernado por un conjunto de variables de estado (paused, inDialog, inventoryOpen) que actúan como "guardias". Por ejemplo, la lógica de ataque con la tecla Espacio solo se ejecuta si inDialog, inventoryOpen y paused son false, previniendo acciones no deseadas en contextos de menú o diálogo.</p>

<h2>7.3. Sistema de Inventario</h2>
<p>El sistema de inventario se gestiona a través de varias funciones interconectadas:</p>
<p>• showInventory(): Cuando el jugador presiona 'I', esta función se activa. Lee el array player.inventory y genera dinámicamente contenido HTML para representar los objetos. Este HTML se inyecta en el inventoryDiv.</p>
<p>• equipWeapon(i) y useItem(i): Estas funciones se exponen globalmente en el objeto window para que puedan ser invocadas desde los botones generados en el HTML del inventario (onclick="equipWeapon(...)"). equipWeapon actualiza la variable equippedWeapon, mientras que useItem consume una poción y restaura la salud del jugador.</p>

<h2>7.4. Mecánica de Interacción con el Mercader</h2>
<p>La interacción con el mercader sigue un flujo de eventos bien definido:</p>
<p>1. Activación: El jugador se mueve a la misma casilla que ocupa la entidad merchant.</p>
<p>2. Apertura de la Tienda: Se llama a openMerchantShop(). Esta función genera un inventario aleatorio para la tienda (merchantStock).</p>
<p>3. Visualización: A diferencia de otros paneles de UI definidos en HTML, la interfaz de la tienda (merchantShopDiv) se genera y estiliza programáticamente en JavaScript mediante document.createElement('div') y se inyecta en el DOM. Esta interfaz muestra las opciones de compra.</p>
<p>4. Transacción: Al hacer clic en comprar, se invoca a buyMerchantItem(i). Esta función verifica si el jugador tiene suficiente gold. Si la transacción es exitosa, resta el costo del gold del jugador y añade el objeto a player.inventory.</p>

<h2>7.5. Conclusión</h2>
<p>La interacción directa del jugador con el mundo del juego requiere una comunicación constante de vuelta hacia él, una tarea que cumple la capa de interfaz de usuario.</p>

<h2>8.0 Interfaz de Usuario (UI) y Visualización de Datos (HUD)</h2>

<h2>8.1. Rol de la Capa de Interfaz de Usuario</h2>
<p>La interfaz de usuario (UI), construida con elementos HTML estándar y estilizada con CSS, es un componente fundamental para la experiencia del jugador. Su rol es comunicar de manera clara, concisa y no intrusiva el estado del juego. Muestra información vital como la salud y la experiencia, presenta diálogos narrativos y proporciona los menús necesarios para la interacción, como el inventario y la tienda.</p>

<h2>8.2. Componentes de la UI Basados en HTML/CSS</h2>
<p>La estructura de la UI está definida en el HTML y su apariencia y posicionamiento en el CSS. Selectores como #dialog, #inventory, #menu y #hud apuntan a elementos &lt;div&gt; específicos. La visibilidad de estos elementos es controlada dinámicamente desde JavaScript alterando su propiedad display de CSS. Este mecanismo está directamente vinculado a las variables de estado del juego. Por ejemplo, el &lt;div&gt; con id #pause se vuelve visible cuando la variable de estado paused es true, y el #inventory se muestra cuando inventoryOpen es true.</p>

<h2>8.3. Head-Up Display (HUD)</h2>
<p>El Head-Up Display (HUD) es el elemento de la UI que proporciona información crítica en tiempo real. La función updateHUD() se invoca en cada fotograma del gameLoop. Su tarea es recopilar los datos más relevantes del estado del juego (currentFloor, player.hp, player.maxHp, level, exp, gold, etc.), formatearlos en una cadena de texto y actualizar el contenido del elemento #hud. Esto asegura que el jugador siempre tenga una visión actualizada de sus estadísticas principales.</p>

<h2>8.4. Sistema de Diálogos</h2>
<p>El sistema de diálogos permite mostrar mensajes secuenciales al jugador de forma modal, pausando el juego mientras el diálogo está activo. Su lógica se basa en la interacción de los siguientes componentes:</p>
<p>• inDialog: Una variable booleana que, cuando es true, bloquea la mayoría de las demás interacciones del jugador.</p>
<p>• dialogQueue: Un array que almacena la secuencia de cadenas de texto que se deben mostrar.</p>
<p>• showDialog(): Esta función inicia el diálogo. Establece inDialog a true, puebla el dialogQueue con los textos a mostrar, y muestra el primer mensaje del array.</p>
<p>• nextDialog(): Se activa cuando el jugador presiona Espacio o Enter durante un diálogo. Muestra el siguiente mensaje de la cola. Si la cola está vacía, establece inDialog a false y oculta el cuadro de diálogo, reanudando el juego.</p>

<h2>8.5. Transición</h2>
<p>Para complementar la retroalimentación visual de la UI, el juego incorpora un último componente sensorial: el sistema de audio.</p>

<h2>9.0 Sistema de Audio Procedural</h2>

<h2>9.1. Implementación Ligera de Audio</h2>
<p>El juego utiliza la Web Audio API nativa del navegador para generar tanto los efectos de sonido como la música de fondo de manera procedural. Este enfoque tiene una ventaja significativa: no depende de archivos de audio externos (como .mp3 o .wav), lo que resulta en una implementación extremadamente ligera, con tiempos de carga instantáneos y sin necesidad de gestionar assets de audio.</p>

<h2>9.2. Generación de Efectos de Sonido</h2>
<p>La función de utilidad playNote(freq, dur, vol, type) es la base de todos los efectos de sonido del juego. Al ser llamada, crea programáticamente un OscillatorNode para generar un tono simple con una frecuencia, duración, volumen y tipo de onda específicos. Esta función se invoca en respuesta a eventos clave del juego para proporcionar retroalimentación auditiva, como al atacar, recibir un objeto, navegar por un diálogo o subir de nivel.</p>

<h2>9.3. Música de Fondo Procedural</h2>
<p>La función startMusic() se ejecuta una sola vez al inicio del juego. Dentro de ella, se establece un bucle (loop) gestionado por llamadas recursivas a setTimeout con un retardo de 400 ms. En cada iteración, se crea un OscillatorNode que reproduce una nota de una secuencia predefinida, ciclando a través de un array de cuatro frecuencias: 220, 330, 440, 330. Todas las notas se enrutan a través de un GainNode global (musicGain), creando una melodía simple pero persistente que establece la atmósfera del juego.</p>

<h2>9.4. Conclusión</h2>
<p>En conjunto, todos los sistemas analizados —desde las estructuras de datos estáticas y la gestión de estado dinámico, pasando por la generación procedural, el motor de renderizado, el bucle principal, los sistemas de interacción, la interfaz de usuario y el audio procedural— se integran de manera cohesiva para crear la experiencia de juego completa y funcional de "RPG Dungeon Laberinto".</p>
