Documento de Diseño Técnico: RPG Dungeon Laberinto

1.0 Introducción a la Arquitectura del Juego

1.1. Propósito del Documento

Este documento de diseño técnico tiene como objetivo desglosar la arquitectura de software del juego "RPG Dungeon Laberinto", un roguelike desarrollado íntegramente en JavaScript puro, HTML y CSS. Su propósito es servir como una guía fundamental для el equipo de desarrollo, proporcionando un análisis detallado de los componentes clave del sistema. Se cubrirá desde las estructuras de datos que definen el contenido del juego hasta el bucle principal que orquesta la lógica y el renderizado, con el fin de facilitar la incorporación de nuevos miembros al proyecto, así como el mantenimiento y la expansión del código existente.

1.2. Resumen de la Arquitectura

La arquitectura del juego está organizada de manera pragmática en tres capas principales que separan las responsabilidades de forma clara:

* Capa de Presentación: Compuesta por el HTML que estructura los elementos de la interfaz (menús, diálogos, inventario) y el CSS que define su estilo visual. El componente central de esta capa es el elemento <canvas> de HTML, donde el motor de renderizado dibuja activamente el mundo del juego, los personajes y los efectos visuales.
* Capa de Lógica del Juego: Es el núcleo del sistema, escrito en JavaScript. Gestiona el estado completo del juego, incluyendo la posición del jugador, las estadísticas de los enemigos y los objetos del mapa. Contiene la lógica de interacción (movimiento, combate), los sistemas de generación procedural y, fundamentalmente, el gameLoop que actualiza y sincroniza todos los componentes en cada fotograma.
* Capa de Datos: Se basa en estructuras de datos estáticas, principalmente arrays de objetos, que definen el contenido del juego. Constantes como WEAPONS y ENEMY_TYPES actúan como una base de datos en memoria, permitiendo que la lógica del juego acceda a las propiedades de los enemigos y el equipamiento sin codificar estos valores directamente en las funciones.

1.3. Próximos Pasos

El análisis comenzará por la capa de datos, examinando las estructuras estáticas que sirven de cimiento para todo el contenido del juego.


--------------------------------------------------------------------------------


2.0 Definición de Contenido: Estructuras de Datos Estáticas

2.1. Estrategia de Separación de Datos

La arquitectura del juego adopta un enfoque estratégico clave al separar los datos de contenido de la lógica de programación. Al definir entidades como armas, enemigos y objetos de la tienda en arrays de objetos (const WEAPONS, const ENEMY_TYPES), se logra un sistema altamente modular. Este diseño permite a los desarrolladores y diseñadores de juego modificar, equilibrar o ampliar el contenido del juego (añadiendo nuevas armas o enemigos) simplemente editando estos arrays, sin necesidad de alterar el código del motor principal. Esta separación agiliza el desarrollo y facilita el mantenimiento a largo plazo.

2.2. Constante 

La constante WEAPONS define la base de datos de todas las armas disponibles que pueden ser encontradas o equipadas por el jugador. Cada objeto dentro del array representa un arma con un conjunto de propiedades que dictan su comportamiento en el juego.

Propiedad	Propósito
name	El nombre del arma, mostrado en la UI (inventario, diálogos).
dmg	El valor de daño base que inflige el arma en el sistema de combate.
color	El código de color hexadecimal para la representación visual del arma en el canvas.
price	El costo en oro del arma, utilizado en el sistema de la tienda.
desc	Una breve descripción textual para la UI.

2.3. Constante 

De forma similar, ENEMY_TYPES funciona como un bestiario que define las características de cada tipo de enemigo que el jugador puede encontrar en la mazmorra. Estos atributos son cruciales para balancear la curva de dificultad y la progresión del jugador. La lógica de generación de enemigos en spawnFloor() selecciona tipos basados en el currentFloor, lo que significa que a medida que el jugador desciende, se enfrenta a desafíos mayores. Por ejemplo, un enemigo de piso bajo como el Murciélago (hp:24, dmg:3, exp:1) contrasta marcadamente con un enemigo de alto nivel como el Dragón (hp:120, dmg:20, exp:18). Este dramático incremento en los atributos clave define una curva de progresión y recompensa pronunciada.

Propiedad	Propósito
name	El nombre del tipo de enemigo, mostrado en la UI y los diálogos.
color	El color utilizado para renderizar al enemigo en el canvas.
hp	Los puntos de vida iniciales del enemigo, determinando su resistencia.
exp	La cantidad de puntos de experiencia que el jugador recibe al derrotarlo.
dmg	El daño que el enemigo inflige al jugador durante el combate.

2.4. Constante 

La constante SHOP_WEAPONS es una extensión de WEAPONS. Utiliza el operador de propagación (...WEAPONS) para incluir todas las armas base y luego añade un conjunto de armas más poderosas y caras. Esta estructura de datos se utiliza exclusivamente para poblar el inventario del mercader (merchantStock), ofreciendo al jugador una vía de progresión de equipo a medida que acumula oro.

2.5. Conclusión de la Sección

Una vez definidos los datos estáticos que dan forma al contenido, el siguiente paso es analizar cómo el juego gestiona la información dinámica que cambia constantemente durante una partida.


--------------------------------------------------------------------------------


3.0 Núcleo del Juego: Configuración y Gestión de Estado

3.1. Rol de las Variables Globales y de Configuración

Las constantes de configuración y las variables de estado globales forman la columna vertebral del motor del juego. Las constantes, como MAP_W y MAP_H, establecen las reglas inmutables del mundo, definiendo sus dimensiones físicas. Por otro lado, las variables de estado mantienen un registro en tiempo real de cada elemento dinámico: la posición y salud del jugador (player), la lista de enemigos en el piso actual (enemies), el oro acumulado (gold) y los estados de la interfaz (inDialog). Este conjunto de variables representa una "instantánea" completa del juego en cualquier momento.

3.2. Constantes de Configuración

Estas constantes definen los parámetros fundamentales del mundo del juego y su renderizado.

* TILE: Un entero (32) que representa el tamaño en píxeles de cada celda del mapa (ancho y alto). Es la unidad base para todos los cálculos de posición y renderizado.
* MAP_W y MAP_H: Definen las dimensiones del mapa en unidades de TILE (20 de ancho por 15 de alto). Estos valores controlan directamente el tamaño de la mazmorra generada.

3.3. Variables Clave de Gestión de Estado

Las siguientes variables son cruciales para rastrear el estado del juego en tiempo real.

Variable	Propósito	Ejemplo de Uso
Estado del Jugador		
player	Objeto que contiene todos los datos del jugador (posición, HP, inventario, etc.).	player.hp -= enemy.dmg;
gold	Cantidad de oro que posee el jugador.	gold += chest.gold;
level	Nivel actual del jugador.	level++; en checkLevelUp()
exp	Puntos de experiencia acumulados por el jugador.	exp += enemy.exp;
Entidades del Piso		
enemies	Array de objetos que representa a todos los enemigos vivos en el piso.	for (const enemy of enemies) drawEnemy(enemy);
items	Array de objetos para los ítems en el suelo (ej. pociones).	items.splice(i, 1); al recoger un ítem.
chests	Array de objetos para los cofres en el piso.	chest.opened = true;
merchantHere	Booleano que indica si un mercader ha aparecido en el piso actual.	if (merchantHere && merchant.x === player.x)
merchant	Objeto que contiene los datos del mercader si merchantHere es true.	drawMerchant()
Estado de la Interfaz		
inDialog	Booleano que indica si un cuadro de diálogo está activo (pausa la acción).	if (inDialog) return; para bloquear el movimiento.
inventoryOpen	Booleano que indica si el menú de inventario está visible.	if (!inDialog && !inventoryOpen && e.key.toLowerCase() === 'i')
dialogQueue	Array que almacena la secuencia de mensajes a mostrar en el diálogo.	dialogQueue = texts.slice(); en showDialog()
Estado del Juego		
currentFloor	El número del piso actual de la mazmorra.	currentFloor--; al subir las escaleras.
paused	Booleano que indica si el juego está en estado de pausa.	if (gameStarted && !paused) requestAnimationFrame(gameLoop);

3.4. Inicialización y Generación de Niveles

Las funciones resetGame() y spawnFloor() son responsables de establecer y restablecer el estado del juego.

* resetGame(): Esta función se invoca al comenzar una nueva partida. Inicializa el estado completo del juego a sus valores por defecto. Resetea gold, exp y level, y coloca al jugador en el piso más alto (currentFloor = MAX_FLOOR). Es crucial notar la inicialización de las estadísticas del jugador: la vida actual (hp) se establece en 126 (Math.floor(90 * 1.4)), mientras que la vida máxima (maxHp) se establece en 22 (Math.floor(16 * 1.4)). Esto proporciona al jugador una reserva de salud inicial significativa, muy por encima de su máximo base, para facilitar el arranque. Finalmente, llama a spawnFloor() para poblar el primer nivel.
* spawnFloor(): Esta función se ejecuta cada vez que el jugador llega a un nuevo piso. Su responsabilidad es poblar el mapa vacío con entidades dinámicas, garantizando la rejugabilidad. Genera un número variable de enemigos (5 a 7), dos cofres, una posible poción en el suelo (70% de probabilidad) y un mercader (40% de probabilidad, excepto en el último piso). La posición de cada entidad se elige aleatoriamente en una casilla de suelo válida y desocupada.

3.5. Transición

La creación del estado de un piso depende de una estructura de mapa transitable, la cual es generada por un algoritmo procedural específico.


--------------------------------------------------------------------------------


4.0 Generación Procedural del Mundo

4.1. Importancia de la Generación Procedural

La generación procedural es un pilar del género roguelike, y en este juego, la función genMap() es la responsable de esta tarea. Su objetivo es crear un diseño de mazmorra único para cada piso, asegurando que ninguna partida sea idéntica a la anterior. Esto fomenta la adaptabilidad del jugador y aumenta significativamente la rejugabilidad del título.

4.2. Análisis del Algoritmo 

El algoritmo de genMap() es un método simple pero efectivo para generar un mapa cavernoso.

1. Inicialización: Crea una matriz bidimensional vacía llamada map.
2. Iteración: Recorre cada celda (x, y) de la matriz.
3. Lógica Condicional: Para cada celda, aplica una serie de reglas:
  * Si la celda está en el borde del mapa (x === 0, y === 0, etc.), se designa como un muro (1).
  * Para las celdas interiores, se utiliza una probabilidad (Math.random() < 0.13) para determinar si se convierte en un muro (1). En caso contrario, es una celda de suelo transitable (0).
4. Puntos de Acceso Garantizados: De manera crucial, el algoritmo asegura explícitamente que la casilla de entrada (map[2][2] = 0) y la de salida (map[MAP_H-2][MAP_W-2] = 0) sean siempre suelo, garantizando que el nivel sea siempre navegable desde el inicio hasta el fin.

4.3. Conclusión

Una vez que el mapa ha sido generado por genMap() y poblado con entidades por spawnFloor(), el siguiente paso lógico es traducir esta estructura de datos en una representación visual para el jugador, una tarea que recae en el motor de renderizado.


--------------------------------------------------------------------------------


5.0 Motor de Renderizado y Componentes Visuales

5.1. Rol del Motor de Renderizado

El motor de renderizado es el conjunto de funciones de JavaScript cuya única responsabilidad es traducir el estado actual del juego (almacenado en variables como map, player, enemies, etc.) en una representación visual en el elemento <canvas> del HTML. Este proceso se repite en cada fotograma del bucle principal del juego para crear la ilusión de movimiento y interactividad.

5.2. Desglose de las Funciones de Dibujado

Cada función de dibujado se especializa en renderizar un tipo específico de entidad, dependiendo de los datos de estado correspondientes.

* drawTile(): Es la función más básica. Renderiza el mapa base, celda por celda, dibujando un rectángulo de un color (#444 para muros, #222 para suelo) según el valor (1 o 0) almacenado en la matriz map.
* drawPlayer(): Visualiza el objeto player. Su lógica es más compleja, ya que gestiona efectos visuales. Para crear una animación de movimiento fluida, utiliza la variable player.anim —un valor de progreso de 0.0 a 1.0— para interpolar la posición en pantalla del jugador entre su casilla anterior (player.px, player.py) y su casilla actual (player.x, player.y). También aplica un efecto de parpadeo cuando el jugador recibe daño (player.blink > 0) y renderiza una animación de ataque (damageAnim).
* drawEnemy(): Itera sobre el array enemies y dibuja cada enemigo vivo. Además de su forma y color (definidos en ENEMY_TYPES), renderiza una barra de vida sobre su cabeza, calculando su longitud en proporción a su hp actual frente a su maxHp.
* drawItem(), drawChest(), y drawMerchant(): Estas funciones se encargan de renderizar los objetos interactivos del mapa, obteniendo sus posiciones de los arrays items y chests y de la variable merchant. La apariencia de los cofres cambia si su propiedad opened es true.
* drawParticles(): Gestiona y renderiza el array particles. Cada partícula tiene una posición, velocidad y tiempo de vida. Esta función actualiza su estado en cada fotograma y las dibuja en pantalla, creando efectos visuales para acciones como ataques o la obtención de objetos.

5.3. Función y Lógica de 

La función drawMinimap() proporciona una vista táctica esencial para el jugador. Toma los datos del map y las posiciones de todas las entidades (player, enemies, items, etc.) y los renderiza en un canvas separado, utilizando un contexto de renderizado distinto llamado mctx. Cada entidad se representa como un píxel de un color distintivo (blanco para el jugador, colores específicos para enemigos, verde para pociones), lo que permite al jugador orientarse rápidamente y planificar su ruta a través del nivel.

5.4. Transición

La representación visual del juego es estática en sí misma. Lo que le da vida es el bucle principal que invoca estas funciones de dibujado constantemente y orquesta toda la lógica del juego.


--------------------------------------------------------------------------------


6.0 Lógica Principal y Flujo de Juego (Game Loop)

6.1. El Corazón del Juego: 

La función gameLoop() es el motor central del juego. Se ejecuta de forma continua gracias a requestAnimationFrame, un mecanismo del navegador que sincroniza la ejecución con la tasa de refresco del monitor. En cada fotograma, gameLoop() es responsable de orquestar la secuencia completa de operaciones: actualizar el estado del juego, procesar las acciones del jugador y renderizar el resultado en pantalla.

6.2. Secuencia de Operaciones dentro de 

El orden de ejecución dentro del bucle es crítico para asegurar un comportamiento consistente y un renderizado correcto.

1. Limpieza del Canvas: La primera operación es ctx.clearRect, que borra el contenido del fotograma anterior.
2. Renderizado por Capas: Se invoca la secuencia de funciones de dibujado en un orden estricto para garantizar el correcto apilamiento visual (eje Z). Esta secuencia asegura que el mapa se dibuje primero, luego los objetos estáticos y finalmente las entidades dinámicas como enemigos y el jugador en la capa superior:
  * drawMinimap()
  * drawTile() (para cada celda del mapa)
  * drawItem()
  * drawChest()
  * drawMerchant()
  * drawEnemy()
  * drawPlayer()
  * drawParticles()
3. Actualización de la Interfaz: Se llama a updateHUD() para refrescar la información de estado (HP, Nivel, Oro, etc.) en la capa de HTML.
4. Procesamiento de Animaciones: Se actualizan los contadores que controlan las animaciones visuales, como player.anim (movimiento), player.blink (daño recibido) y damageAnim (ataque).
5. Manejo del Input del Jugador: Se verifica el estado del objeto keys. Si una tecla de movimiento está presionada y ha pasado un tiempo mínimo desde el último movimiento, se invoca a movePlayer.
6. Lógica de IA Enemiga: Se itera sobre todos los enemigos. Si un enemigo está cerca del jugador y una comprobación de probabilidad tiene éxito, intenta moverse hacia el jugador.
7. Recursión: Finalmente, se llama a requestAnimationFrame(gameLoop) para programar la ejecución del siguiente fotograma.

6.3. Validación de Movimiento: 

La función canMove(x, y) es un componente de validación crucial que previene movimientos ilegales. Antes de que cualquier entidad (jugador o enemigo) se mueva a una nueva casilla, esta función comprueba dos condiciones fundamentales:

1. Que la casilla de destino en la matriz map sea suelo (su valor es 0).
2. Que la casilla de destino no esté actualmente ocupada por un enemigo vivo. Solo si ambas condiciones son verdaderas, el movimiento es permitido.

6.4. Sistema de Combate: 

El combate se gestiona en la función attackEnemy, que se activa cuando el jugador presiona Espacio junto a un enemigo. El flujo de eventos es el siguiente:

1. Intercambio de Daño: El jugador inflige daño al enemigo, calculado a partir del dmg del equippedWeapon. Simultáneamente, el enemigo contraataca, infligiendo un daño fijo definido por su enemy.dmg.
2. Reducción de HP: Se actualizan los puntos de vida de ambos combatientes.
3. Feedback Visual y Auditivo: Se activan animaciones (damageAnim, player.blink), se reproducen efectos de sonido (playNote) y se generan partículas (addParticle) para comunicar el impacto.
4. Comprobación de Estado: Se verifica si la vida del enemigo ha llegado a cero. Si es así, el enemigo es derrotado, y el jugador recibe experiencia (exp). A continuación, se comprueba la vida del jugador. Si llega a cero, el juego termina.

6.5. Sistema de Progresión: 

Esta función gestiona el sistema de subida de nivel. Se invoca cada vez que el jugador gana experiencia. Compara la exp total del jugador con el umbral necesario para el siguiente nivel, calculado mediante la fórmula Math.floor(level * 10 * 1.58). Si se alcanza el umbral, el jugador sube de nivel (level++), su vida máxima aumenta (maxHp += 4), y su salud se restaura por completo.

6.6. Transición

Para que el gameLoop pueda procesar las acciones del jugador, primero debe recibir las órdenes del usuario, lo cual nos lleva a los sistemas de interacción.


--------------------------------------------------------------------------------


7.0 Sistemas de Interacción del Jugador

7.1. El Puente entre Jugador y Juego

Los sistemas de gestión de entradas y de interacción son el puente fundamental entre las intenciones del jugador y la lógica del juego. Estos componentes son responsables de capturar las pulsaciones de teclas y traducirlas en acciones significativas dentro del mundo virtual, como moverse por la mazmorra, atacar a un enemigo, gestionar el inventario o comerciar con un mercader.

7.2. Sistema de Control por Teclado

El control del jugador se implementa a través de event listeners globales para los eventos keydown y keyup.

* Al presionar una tecla, el evento keydown establece la propiedad correspondiente en el objeto keys a true (ej. keys['w'] = true).
* Al soltarla, el evento keyup la revierte a false.

Este sistema está gobernado por un conjunto de variables de estado (paused, inDialog, inventoryOpen) que actúan como "guardias". Por ejemplo, la lógica de ataque con la tecla Espacio solo se ejecuta si inDialog, inventoryOpen y paused son false, previniendo acciones no deseadas en contextos de menú o diálogo.

7.3. Sistema de Inventario

El sistema de inventario se gestiona a través de varias funciones interconectadas:

* showInventory(): Cuando el jugador presiona 'I', esta función se activa. Lee el array player.inventory y genera dinámicamente contenido HTML para representar los objetos. Este HTML se inyecta en el inventoryDiv.
* equipWeapon(i) y useItem(i): Estas funciones se exponen globalmente en el objeto window para que puedan ser invocadas desde los botones generados en el HTML del inventario (onclick="equipWeapon(...)"). equipWeapon actualiza la variable equippedWeapon, mientras que useItem consume una poción y restaura la salud del jugador.

7.4. Mecánica de Interacción con el Mercader

La interacción con el mercader sigue un flujo de eventos bien definido:

1. Activación: El jugador se mueve a la misma casilla que ocupa la entidad merchant.
2. Apertura de la Tienda: Se llama a openMerchantShop(). Esta función genera un inventario aleatorio para la tienda (merchantStock).
3. Visualización: A diferencia de otros paneles de UI definidos en HTML, la interfaz de la tienda (merchantShopDiv) se genera y estiliza programáticamente en JavaScript mediante document.createElement('div') y se inyecta en el DOM. Esta interfaz muestra las opciones de compra.
4. Transacción: Al hacer clic en comprar, se invoca a buyMerchantItem(i). Esta función verifica si el jugador tiene suficiente gold. Si la transacción es exitosa, resta el costo del gold del jugador y añade el objeto a player.inventory.

7.5. Conclusión

La interacción directa del jugador con el mundo del juego requiere una comunicación constante de vuelta hacia él, una tarea que cumple la capa de interfaz de usuario.


--------------------------------------------------------------------------------


8.0 Interfaz de Usuario (UI) y Visualización de Datos (HUD)

8.1. Rol de la Capa de Interfaz de Usuario

La interfaz de usuario (UI), construida con elementos HTML estándar y estilizada con CSS, es un componente fundamental para la experiencia del jugador. Su rol es comunicar de manera clara, concisa y no intrusiva el estado del juego. Muestra información vital como la salud y la experiencia, presenta diálogos narrativos y proporciona los menús necesarios para la interacción, como el inventario y la tienda.

8.2. Componentes de la UI Basados en HTML/CSS

La estructura de la UI está definida en el HTML y su apariencia y posicionamiento en el CSS. Selectores como #dialog, #inventory, #menu y #hud apuntan a elementos <div> específicos. La visibilidad de estos elementos es controlada dinámicamente desde JavaScript alterando su propiedad display de CSS. Este mecanismo está directamente vinculado a las variables de estado del juego. Por ejemplo, el <div> con id #pause se vuelve visible cuando la variable de estado paused es true, y el #inventory se muestra cuando inventoryOpen es true.

8.3. Head-Up Display (HUD) y 

El Head-Up Display (HUD) es el elemento de la UI que proporciona información crítica en tiempo real. La función updateHUD() se invoca en cada fotograma del gameLoop. Su tarea es recopilar los datos más relevantes del estado del juego (currentFloor, player.hp, player.maxHp, level, exp, gold, etc.), formatearlos en una cadena de texto y actualizar el contenido del elemento #hud. Esto asegura que el jugador siempre tenga una visión actualizada de sus estadísticas principales.

8.4. Sistema de Diálogos

El sistema de diálogos permite mostrar mensajes secuenciales al jugador de forma modal, pausando el juego mientras el diálogo está activo. Su lógica se basa en la interacción de los siguientes componentes:

* inDialog: Una variable booleana que, cuando es true, bloquea la mayoría de las demás interacciones del jugador.
* dialogQueue: Un array que almacena la secuencia de cadenas de texto que se deben mostrar.
* showDialog(): Esta función inicia el diálogo. Establece inDialog a true, puebla el dialogQueue con los textos a mostrar, y muestra el primer mensaje del array.
* nextDialog(): Se activa cuando el jugador presiona Espacio o Enter durante un diálogo. Muestra el siguiente mensaje de la cola. Si la cola está vacía, establece inDialog a false y oculta el cuadro de diálogo, reanudando el juego.

8.5. Transición

Para complementar la retroalimentación visual de la UI, el juego incorpora un último componente sensorial: el sistema de audio.


--------------------------------------------------------------------------------


9.0 Sistema de Audio Procedural

9.1. Implementación Ligera de Audio

El juego utiliza la Web Audio API nativa del navegador para generar tanto los efectos de sonido como la música de fondo de manera procedural. Este enfoque tiene una ventaja significativa: no depende de archivos de audio externos (como .mp3 o .wav), lo que resulta en una implementación extremadamente ligera, con tiempos de carga instantáneos y sin necesidad de gestionar assets de audio.

9.2. Generación de Efectos de Sonido: 

La función de utilidad playNote(freq, dur, vol, type) es la base de todos los efectos de sonido del juego. Al ser llamada, crea programáticamente un OscillatorNode para generar un tono simple con una frecuencia, duración, volumen y tipo de onda específicos. Esta función se invoca en respuesta a eventos clave del juego para proporcionar retroalimentación auditiva, como al atacar, recibir un objeto, navegar por un diálogo o subir de nivel.

9.3. Música de Fondo Procedural: 

La función startMusic() se ejecuta una sola vez al inicio del juego. Dentro de ella, se establece un bucle (loop) gestionado por llamadas recursivas a setTimeout con un retardo de 400ms. En cada iteración, se crea un OscillatorNode que reproduce una nota de una secuencia predefinida, ciclando a través de un array de cuatro frecuencias: [220, 330, 440, 330]. Todas las notas se enrutan a través de un GainNode global (musicGain), creando una melodía simple pero persistente que establece la atmósfera del juego.

9.4. Conclusión

En conjunto, todos los sistemas analizados —desde las estructuras de datos estáticas y la gestión de estado dinámico, pasando por la generación procedural, el motor de renderizado, el bucle principal, los sistemas de interacción, la interfaz de usuario y el audio procedural— se integran de manera cohesiva para crear la experiencia de juego completa y funcional de "RPG Dungeon Laberinto".
