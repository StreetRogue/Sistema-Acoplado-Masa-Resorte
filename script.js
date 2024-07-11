//HECHO POR: JUAN ESTEBAN CHAVEZ COLLAZOS Y JUAN DAVID VELA CORONADO

const lienzo = document.getElementById("lienzo");
const ctx = lienzo.getContext("2d");
const btnCalcular = document.getElementById("botonW");
const btnIniciar = document.getElementById("botonIniciar");
const btnIniciar2 = document.getElementById("botonIniciar2");
const btnParar = document.getElementById("botonParar");
const inputMasa1 = document.getElementById("inputMasa1");
const inputMasa2 = document.getElementById("inputMasa2");
const inputK1 = document.getElementById("rangoK1");
const valorK1 = document.getElementById("valorK1");
const inputK2 = document.getElementById("rangoK2");
const valorK2 = document.getElementById("valorK2");
const inputK3 = document.getElementById("rangoK3");
const valorK3 = document.getElementById("valorK3");
const inputTextoW1 = document.getElementById("texto-w1");
const inputTextoW2 = document.getElementById("texto-w2");
let resultadoFrecuencia1 = null;
let resultadoFrecuencia2 = null;

// Gráficas
const canvasGrafica = document.getElementById("grafica");
const ctxGrafica = canvasGrafica.getContext("2d");

let animacionActiva = false;
let requestId;
let t = 0; // Tiempo para la animación
let A1 = null;
let A2 = null;

// Datos para las gráficas
let dataW1 = { tiempo: [], posicion1: [], posicion2: [] };
let dataW2 = { tiempo: [], posicion1: [], posicion2: [] };
let chart = null;

// Crear la gráfica inicial (vacía)
function crearGrafica() {
  const data = {
    labels: [],
    datasets: [
      {
        label: 'Posición masa 1 vs tiempo',
        data: [],
        borderColor: 'red',
        fill: false,
      },
      {
        label: 'Posición masa 2 vs tiempo',
        data: [],
        borderColor: 'blue',
        fill: false,
      },
    ],
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Tiempo (s)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Posición (m)'
          }
        }
      }
    }
  };

  chart = new Chart(ctxGrafica, config);
}

// Actualizar la gráfica con nuevos datos
function actualizarGrafica(data) {
  chart.data.labels = data.tiempo;
  chart.data.datasets[0].data = data.posicion1.map((y, i) => ({ x: data.tiempo[i], y }));
  chart.data.datasets[1].data = data.posicion2.map((y, i) => ({ x: data.tiempo[i], y }));
  chart.update();
}

// Cargar la imagen del resorte
const resorteImg = new Image();
resorteImg.src = 'resorteImg.png'; 

resorteImg.onload = function () {
  
  // Actualización de valores
  inputK1.oninput = function () {
    valorK1.textContent = parseFloat(this.value);
    dibujarSistema();
  };

  inputK2.oninput = function () {
    valorK2.textContent = parseFloat(this.value);
    dibujarSistema();
  };

  inputK3.oninput = function () {
    valorK3.textContent = parseFloat(this.value);
    dibujarSistema();
  };

  // Botón iniciar simulación 1
  btnIniciar.addEventListener("click", function () {
    if (!animacionActiva && resultadoFrecuencia1 != null) {
      animacionActiva = true;
      dataW1 = { tiempo: [], posicion1: [], posicion2: [] }; // Reiniciar datos de la gráfica
      t = 0;
      animarSistema(resultadoFrecuencia1, A1, dataW1);
    }
  });

  // Botón para Calcular
  btnCalcular.addEventListener("click", function () {
    hallarFrecuencias();
  });

  // Botón iniciar simulación 2
  btnIniciar2.addEventListener("click", function () {
    if (!animacionActiva && resultadoFrecuencia2 != null) {
      animacionActiva = true;
      dataW2 = { tiempo: [], posicion1: [], posicion2: [] }; // Reiniciar datos de la gráfica
      t = 0;
      animarSistema(resultadoFrecuencia2, A2, dataW2);
    }
  });

  // Botón para detener la simulación
  btnParar.addEventListener("click", function () {
    animacionActiva = false;
    cancelAnimationFrame(requestId);
  });

  // Función para limpiar el lienzo en cada cuadro de animación
  function limpiarLienzo() {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  }

  // Función para dibujar el sistema de resortes
  function dibujarSistema(factor1 = 0, factor2 = 0) {
    limpiarLienzo();
    const masa1X = 247 + factor1; // La posición de masa1 depende de factor
    const masa2X = 494 + factor2; // La posición de masa2 depende de factor

    const cuboAncho = 40;
    const cuboAlto = 40;

    // Dibujar resortes
    ctx.drawImage(resorteImg, 0, lienzo.height / 2 - 10, masa1X - cuboAncho / 2, 20); // Resorte 1 (izquierda)
    ctx.drawImage(resorteImg, masa1X + cuboAncho / 2, lienzo.height / 2 - 10, masa2X - masa1X - cuboAncho, 20); // Resorte 2 (centro)
    ctx.drawImage(resorteImg, masa2X + cuboAncho / 2, lienzo.height / 2 - 10, lienzo.width - masa2X - cuboAncho / 2, 20); // Resorte 3 (derecha)

    // Dibujar los cubos
    ctx.fillStyle = "red";
    ctx.fillRect(masa1X - cuboAncho / 2, lienzo.height / 2 - cuboAlto / 2, cuboAncho, cuboAlto); // Dibuja la masa 1 como un cuadrado

    ctx.fillStyle = "blue";
    ctx.fillRect(masa2X - cuboAncho / 2, lienzo.height / 2 - cuboAlto / 2, cuboAncho, cuboAlto); // Dibuja la masa 2 como un cuadrado
  }

  // Función para calcular frecuencias naturales
  function hallarFrecuencias() {
    // Definir coeficientes de la ecuación cuadrática
    const a = 1;
    const b = -(inputK1.value * inputMasa2.value + inputK2.value * inputMasa2.value + inputK2.value * inputMasa1.value + inputK3.value * inputMasa1.value) / (inputMasa1.value * inputMasa2.value);
    const c = (inputK1.value * inputK2.value + inputK1.value * inputK3.value + inputK2.value * inputK3.value) / (inputMasa1.value * inputMasa2.value);

    // Resolver la ecuación cuadrática: a*x^2 + b*x + c = 0
    const discriminante = b * b - 4 * a * c;

    const x1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    const x2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    const w1 = Math.sqrt(x1);
    const w2 = Math.sqrt(x2);

    // Amplitudes normales para m2 = 1
    const A2_1 = 1; // Amplitud para cuerpo 2 en ω1
    const A2_2 = 1; // Amplitud para cuerpo 2 en ω2

    // Amplitudes para m1 calculadas en consecuencia
    const A1_1 = A2_1 * (inputK2.value / (parseFloat(inputK1.value) + parseFloat(inputK2.value) - parseFloat(inputMasa1.value) * Math.pow(w1, 2)));
    const A1_2 = A2_2 * (inputK2.value / (parseFloat(inputK1.value) + parseFloat(inputK2.value) - parseFloat(inputMasa1.value) * Math.pow(w2, 2)));

    A1 = A1_1;
    A2 = A1_2;

    inputTextoW1.textContent = "ω1 = " + w1 + " (rad/s)"; 
    inputTextoW2.textContent = "ω2 = " + w2 + " (rad/s)";

    resultadoFrecuencia1 = w1;
    resultadoFrecuencia2 = w2;
  }

  //Funcion para animar el sistema
  function animarSistema(frecuencia, amplitud, data) {
    if (animacionActiva) {
      // Calcular los factores usando la ecuación del movimiento armónico simple
      const factor1 = amplitud * Math.sin(frecuencia * t);
      const factor2 = 1 * Math.sin(frecuencia * t); // Amplitud de m2 siempre igual a 1

      // Guardar datos para la gráfica
      data.tiempo.push(t);
      data.posicion1.push(factor1);
      data.posicion2.push(factor2);

      // Incrementar el tiempo para la próxima iteración
      t += 0.05;

      dibujarSistema(factor1, factor2);
      actualizarGrafica(data);
      requestId = requestAnimationFrame(() => animarSistema(frecuencia, amplitud, data));
    }
  }

  // Dibujar el sistema para cuando se cargue la página 
  dibujarSistema(0, 0);
  crearGrafica(); // Crear la gráfica inicial
};

