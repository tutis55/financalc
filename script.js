```javascript
/* ======================================================
   FINANCALC
   SCRIPT COMPLETO
====================================================== */


/* ======================================================
   ELEMENTOS
====================================================== */

const boton =
    document.getElementById("calcular");

const botonPrestamo =
    document.getElementById("calcularPrestamo");

const botonHipoteca =
    document.getElementById("calcularHipoteca");

const botonAhorro =
    document.getElementById("calcularAhorro");

const botonInflacion =
    document.getElementById("calcularInflacion");

const botonPresupuesto =
    document.getElementById("calcularPresupuesto");

const moneda =
    document.getElementById("moneda");

const botonModoOscuro =
    document.getElementById("modoOscuro");

const botonArriba =
    document.getElementById("arriba");

const cookieBanner =
    document.getElementById("cookieBanner");

const aceptarCookies =
    document.getElementById("aceptarCookies");

const rechazarCookies =
    document.getElementById("rechazarCookies");

const compartir =
    document.getElementById("compartir");

const copiarEnlace =
    document.getElementById("copiarEnlace");


/* ======================================================
   MONEDAS
====================================================== */

/*
   Tu selector utiliza estos valores:

   "$"  = USD
   "₡"  = CRC
   "€"  = EUR
   "£"  = GBP
   "MX$" = MXN
*/

const mapaMonedas = {

    "$": "USD",

    "₡": "CRC",

    "€": "EUR",

    "£": "GBP",

    "MX$": "MXN"

};


/*
   Moneda seleccionada anteriormente.
*/

let monedaAnterior =
    moneda.value;


/* ======================================================
   TASAS EN CACHÉ
====================================================== */

/*
   Guardamos las tasas para evitar hacer
   una consulta nueva cada vez.

   Ejemplo:

   USD_CRC
   CRC_USD
   EUR_GBP
   MXN_CRC
*/

const cacheTasas = {};


/* ======================================================
   CAMPOS QUE REPRESENTAN DINERO
====================================================== */

const camposMonetarios = [

    "inicial",

    "mensual",

    "montoPrestamo",

    "precioCasa",

    "enganche",

    "ahorroInicial",

    "metaAhorro",

    "aporteAhorro",

    "dineroInflacion",

    "ingresoMensual"

];


/* ======================================================
   FORMATO DE DINERO
====================================================== */

function formatoDinero(valor) {

    const simbolo =
        moneda.value;

    const numero =
        Number(valor);

    if (
        !Number.isFinite(numero)
    ) {

        return (
            simbolo +
            "0.00"
        );

    }

    return (

        simbolo +

        numero.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )

    );
}


/* ======================================================
   VALIDACIÓN
====================================================== */

function numeroValido(valor) {

    return Number.isFinite(
        Number(valor)
    );

}


/* ======================================================
   OBTENER TASA DE CAMBIO EXACTA
====================================================== */

async function obtenerTasaCambio(
    origen,
    destino
) {

    /*
       Misma moneda.
    */

    if (
        origen === destino
    ) {

        return 1;

    }


    /*
       Creamos una clave para guardar
       la tasa en memoria.
    */

    const clave =
        origen +
        "_" +
        destino;


    /*
       Si ya tenemos la tasa, la reutilizamos.
    */

    if (
        Number.isFinite(
            cacheTasas[clave]
        )
    ) {

        return cacheTasas[clave];

    }


    /*
       Endpoint oficial para una sola
       pareja de monedas.

       Ejemplo:

       CRC/USD
       USD/CRC
       EUR/GBP
    */

    const url =
        "https://api.frankfurter.dev/v2/rate/" +
        origen +
        "/" +
        destino;


    const respuesta =
        await fetch(
            url
        );


    if (
        !respuesta.ok
    ) {

        throw new Error(
            "No se pudo obtener la tasa " +
            origen +
            "/" +
            destino
        );

    }


    const datos =
        await respuesta.json();


    const tasa =
        Number(
            datos.rate
        );


    if (
        !Number.isFinite(tasa)
    ) {

        throw new Error(
            "La tasa de cambio recibida no es válida."
        );

    }


    /*
       Guardamos la tasa.
    */

    cacheTasas[clave] =
        tasa;


    return tasa;
}


/* ======================================================
   CONVERTIR UNA CANTIDAD
====================================================== */

async function convertirCantidad(
    cantidad,
    origen,
    destino
) {

    const numero =
        Number(cantidad);


    if (
        !Number.isFinite(numero)
    ) {

        return numero;

    }


    if (
        origen === destino
    ) {

        return numero;

    }


    const tasa =
        await obtenerTasaCambio(
            origen,
            destino
        );


    /*
       Conversión directa:

       cantidad × tasa
    */

    return (
        numero *
        tasa
    );
}


/* ======================================================
   CONVERTIR TODOS LOS CAMPOS
====================================================== */

async function convertirCamposMonetarios(
    origen,
    destino
) {

    if (
        origen === destino
    ) {

        return;

    }


    /*
       Obtenemos la tasa antes de modificar
       cualquier valor.

       Si Internet falla, no tocamos
       los datos del usuario.
    */

    const tasa =
        await obtenerTasaCambio(
            origen,
            destino
        );


    for (
        const id
        of camposMonetarios
    ) {

        const campo =
            document.getElementById(
                id
            );


        /*
           Campo inexistente o vacío.
        */

        if (

            !campo ||

            campo.value === ""

        ) {

            continue;

        }


        const valor =
            Number(
                campo.value
            );


        if (
            !Number.isFinite(
                valor
            )
        ) {

            continue;

        }


        const convertido =
            valor *
            tasa;


        /*
           Guardamos dos decimales.
        */

        campo.value =
            Number(
                convertido.toFixed(2)
            );

    }

}


/* ======================================================
   RECALCULAR TODAS LAS CALCULADORAS
====================================================== */

function recalcularTodo() {


    /* INVERSIÓN */

    if (

        document.getElementById(
            "inicial"
        ).value !== ""

    ) {

        calcular();

    }


    /* PRÉSTAMO */

    if (

        document.getElementById(
            "montoPrestamo"
        ).value !== ""

    ) {

        calcularPrestamo();

    }


    /* HIPOTECA */

    if (

        document.getElementById(
            "precioCasa"
        ).value !== ""

    ) {

        calcularHipoteca();

    }


    /* AHORRO */

    if (

        document.getElementById(
            "ahorroInicial"
        ).value !== ""

    ) {

        calcularAhorro();

    }


    /* INFLACIÓN */

    if (

        document.getElementById(
            "dineroInflacion"
        ).value !== ""

    ) {

        calcularInflacion();

    }


    /* PRESUPUESTO */

    if (

        document.getElementById(
            "ingresoMensual"
        ).value !== ""

    ) {

        calcularPresupuesto();

    }

}


/* ======================================================
   INTERÉS COMPUESTO
====================================================== */

function calcular() {

    const inicial =
        Number(
            document.getElementById(
                "inicial"
            ).value
        );


    const mensual =
        Number(
            document.getElementById(
                "mensual"
            ).value
        );


    const tasa =
        Number(
            document.getElementById(
                "tasa"
            ).value
        );


    const anos =
        Number(
            document.getElementById(
                "anos"
            ).value
        );


    if (

        !numeroValido(inicial) ||

        !numeroValido(mensual) ||

        !numeroValido(tasa) ||

        !numeroValido(anos) ||

        inicial < 0 ||

        mensual < 0 ||

        tasa < 0 ||

        anos <= 0

    ) {

        alert(
            "Por favor, introduce valores válidos."
        );

        return;

    }


    const meses =
        Math.round(
            anos * 12
        );


    const tasaMensual =
        tasa /
        100 /
        12;


    let dinero =
        inicial;


    const valoresAnuales =
        [];


    for (

        let mes = 1;

        mes <= meses;

        mes++

    ) {

        dinero =
            dinero *
            (
                1 +
                tasaMensual
            );


        dinero +=
            mensual;


        if (
            mes % 12 === 0
        ) {

            valoresAnuales.push({

                ano:
                    mes / 12,

                valor:
                    dinero,

                aportado:
                    inicial +
                    mensual * mes

            });

        }

    }


    const totalAportado =
        inicial +
        mensual * meses;


    const intereses =
        Math.max(

            dinero -
            totalAportado,

            0

        );


    const porcentaje =

        totalAportado > 0

            ? (

                intereses /
                totalAportado

            ) * 100

            : 0;


    document.getElementById(
        "resultado"
    ).textContent =

        formatoDinero(
            dinero
        );


    document.getElementById(
        "aportado"
    ).textContent =

        formatoDinero(
            totalAportado
        );


    document.getElementById(
        "intereses"
    ).textContent =

        formatoDinero(
            intereses
        );


    document.getElementById(
        "porcentajeGanancia"
    ).textContent =

        porcentaje.toFixed(2) +
        "%";


    document.getElementById(
        "graficaFinal"
    ).textContent =

        formatoDinero(
            dinero
        );


    document.getElementById(
        "graficaAportado"
    ).textContent =

        formatoDinero(
            totalAportado
        );


    document.getElementById(
        "graficaIntereses"
    ).textContent =

        formatoDinero(
            intereses
        );


    crearGrafica(
        valoresAnuales
    );

}


/* ======================================================
   GRÁFICA
====================================================== */

function crearGrafica(
    valores
) {

    const grafica =
        document.getElementById(
            "grafica"
        );


    grafica.innerHTML =
        "";


    if (

        !valores ||

        valores.length === 0

    ) {

        grafica.innerHTML = `

            <div class="mensaje-grafica">

                No hay datos suficientes
                para mostrar la gráfica.

            </div>

        `;

        return;

    }


    const maximo =
        Math.max(

            ...valores.map(

                dato =>

                    Math.max(

                        dato.valor,

                        dato.aportado

                    )

            )

        );


    valores.forEach(
        function(dato) {


            const grupo =
                document.createElement(
                    "div"
                );


            grupo.className =
                "barra-grupo";


            /* ==================================================
               BARRA DE INVERSIÓN
            ================================================== */

            const barraInversion =
                document.createElement(
                    "div"
                );


            barraInversion.className =
                "barra inversion";


            const alturaInversion =

                maximo > 0

                    ? (

                        dato.valor /
                        maximo

                    ) * 100

                    : 4;


            barraInversion.style.height =

                Math.max(

                    alturaInversion,

                    4

                ) +

                "%";


            const valorInversion =
                document.createElement(
                    "span"
                );


            valorInversion.className =
                "valor-barra";


            valorInversion.textContent =

                formatoDinero(
                    dato.valor
                );


            barraInversion.appendChild(
                valorInversion
            );


            /* ==================================================
               BARRA DE APORTADO
            ================================================== */

            const barraAportado =
                document.createElement(
                    "div"
                );


            barraAportado.className =
                "barra aportado";


            const alturaAportado =

                maximo > 0

                    ? (

                        dato.aportado /
                        maximo

                    ) * 100

                    : 4;


            barraAportado.style.height =

                Math.max(

                    alturaAportado,

                    4

                ) +

                "%";


            const valorAportado =
                document.createElement(
                    "span"
                );


            valorAportado.className =
                "valor-barra";


            valorAportado.textContent =

                formatoDinero(
                    dato.aportado
                );


            barraAportado.appendChild(
                valorAportado
            );


            /* ==================================================
               ETIQUETA DE AÑO
            ================================================== */

            const etiqueta =
                document.createElement(
                    "span"
                );


            etiqueta.className =
                "barra-label";


            etiqueta.textContent =
                "Año " +
                dato.ano;


            grupo.appendChild(
                barraInversion
            );


            grupo.appendChild(
                barraAportado
            );


            grupo.appendChild(
                etiqueta
            );


            grafica.appendChild(
                grupo
            );

        }
    );

}


/* ======================================================
   PRÉSTAMO
====================================================== */

function calcularPrestamo() {

    const monto =
        Number(
            document.getElementById(
                "montoPrestamo"
            ).value
        );


    const tasa =
        Number(
            document.getElementById(
                "tasaPrestamo"
            ).value
        );


    const anos =
        Number(
            document.getElementById(
                "anosPrestamo"
            ).value
        );


    if (

        !numeroValido(monto) ||

        !numeroValido(tasa) ||

        !numeroValido(anos) ||

        monto <= 0 ||

        tasa < 0 ||

        anos <= 0

    ) {

        alert(
            "Por favor, introduce valores válidos para el préstamo."
        );

        return;

    }


    const meses =
        Math.round(
            anos * 12
        );


    const tasaMensual =
        tasa /
        100 /
        12;


    let pagoMensual;


    if (
        tasaMensual === 0
    ) {

        pagoMensual =
            monto /
            meses;

    } else {

        const factor =
            Math.pow(

                1 +
                tasaMensual,

                meses

            );


        pagoMensual =

            monto *

            (
                tasaMensual *
                factor
            ) /

            (
                factor -
                1
            );

    }


    const totalPagado =
        pagoMensual *
        meses;


    const intereses =
        Math.max(

            totalPagado -
            monto,

            0

        );


    document.getElementById(
        "pagoMensual"
    ).textContent =

        formatoDinero(
            pagoMensual
        );


    document.getElementById(
        "totalPagado"
    ).textContent =

        formatoDinero(
            totalPagado
        );


    document.getElementById(
        "interesesPrestamo"
    ).textContent =

        formatoDinero(
            intereses
        );

}


/* ======================================================
   HIPOTECA
====================================================== */

function calcularHipoteca() {

    const precio =
        Number(
            document.getElementById(
                "precioCasa"
            ).value
        );


    const enganche =
        Number(
            document.getElementById(
                "enganche"
            ).value
        );


    const tasa =
        Number(
            document.getElementById(
                "tasaHipoteca"
            ).value
        );


    const anos =
        Number(
            document.getElementById(
                "anosHipoteca"
            ).value
        );


    if (

        !numeroValido(precio) ||

        !numeroValido(enganche) ||

        !numeroValido(tasa) ||

        !numeroValido(anos) ||

        precio <= 0 ||

        enganche < 0 ||

        enganche >= precio ||

        tasa < 0 ||

        anos <= 0

    ) {

        alert(
            "Por favor, introduce valores válidos para la hipoteca."
        );

        return;

    }


    const monto =
        precio -
        enganche;


    const meses =
        Math.round(
            anos * 12
        );


    const tasaMensual =
        tasa /
        100 /
        12;


    let pagoMensual;


    if (
        tasaMensual === 0
    ) {

        pagoMensual =
            monto /
            meses;

    } else {

        const factor =
            Math.pow(

                1 +
                tasaMensual,

                meses

            );


        pagoMensual =

            monto *

            (
                tasaMensual *
                factor
            ) /

            (
                factor -
                1
            );

    }


    const totalPagado =
        pagoMensual *
        meses;


    const intereses =
        Math.max(

            totalPagado -
            monto,

            0

        );


    document.getElementById(
        "pagoHipoteca"
    ).textContent =

        formatoDinero(
            pagoMensual
        );


    document.getElementById(
        "totalHipoteca"
    ).textContent =

        formatoDinero(
            totalPagado
        );


    document.getElementById(
        "interesesHipoteca"
    ).textContent =

        formatoDinero(
            intereses
        );

}


/* ======================================================
   AHORRO
====================================================== */

function calcularAhorro() {

    const inicial =
        Number(
            document.getElementById(
                "ahorroInicial"
            ).value
        );


    const meta =
        Number(
            document.getElementById(
                "metaAhorro"
            ).value
        );


    const mensual =
        Number(
            document.getElementById(
                "aporteAhorro"
            ).value
        );


    const tasa =
        Number(
            document.getElementById(
                "tasaAhorro"
            ).value
        );


    if (

        !numeroValido(inicial) ||

        !numeroValido(meta) ||

        !numeroValido(mensual) ||

        !numeroValido(tasa) ||

        inicial < 0 ||

        meta <= 0 ||

        mensual < 0 ||

        tasa < 0

    ) {

        alert(
            "Por favor, introduce valores válidos para la meta de ahorro."
        );

        return;
    }


    if (
        inicial >= meta
    ) {

        document.getElementById(
            "tiempoAhorro"
        ).textContent =
            "Meta alcanzada";


        document.getElementById(
            "totalAhorro"
        ).textContent =
            formatoDinero(
                inicial
            );


        document.getElementById(
            "interesesAhorro"
        ).textContent =
            formatoDinero(
                0
            );


        document.getElementById(
            "porcentajeMeta"
        ).textContent =
            "100%";


        document.getElementById(
            "barraMeta"
        ).style.width =
            "100%";


        return;
    }


    if (

        mensual === 0 &&

        tasa === 0

    ) {

        alert(
            "Necesitas aportar dinero mensualmente o tener un rendimiento mayor que 0% para alcanzar la meta."
        );

        return;
    }


    let meses =
        0;


    let dinero =
        inicial;


    const tasaMensual =
        tasa /
        100 /
        12;


    while (

        dinero < meta &&

        meses < 1200

    ) {

        dinero =
            dinero *
            (
                1 +
                tasaMensual
            );


        dinero +=
            mensual;


        meses++;

    }


    if (
        dinero < meta
    ) {

        alert(
            "Con esos valores no se alcanza la meta dentro de 100 años. Aumenta el aporte mensual o revisa la meta."
        );

        return;
    }


    const totalAportado =
        inicial +
        mensual * meses;


    const intereses =
        Math.max(

            dinero -
            totalAportado,

            0

        );


    const progreso =
        Math.min(

            (
                dinero /
                meta
            ) * 100,

            100

        );


    const anos =
        Math.floor(
            meses /
            12
        );


    const mesesRestantes =
        meses %
        12;


    let textoTiempo =
        "";


    if (
        anos > 0
    ) {

        textoTiempo +=

            anos +

            (
                anos === 1
                    ? " año"
                    : " años"
            );

    }


    if (
        mesesRestantes > 0
    ) {

        if (
            textoTiempo !== ""
        ) {

            textoTiempo +=
                " y ";

        }


        textoTiempo +=

            mesesRestantes +

            (
                mesesRestantes === 1
                    ? " mes"
                    : " meses"
            );

    }


    document.getElementById(
        "tiempoAhorro"
    ).textContent =
        textoTiempo;


    document.getElementById(
        "totalAhorro"
    ).textContent =
        formatoDinero(
            totalAportado
        );


    document.getElementById(
        "interesesAhorro"
    ).textContent =
        formatoDinero(
            intereses
        );


    document.getElementById(
        "porcentajeMeta"
    ).textContent =
        progreso.toFixed(0) +
        "%";


    document.getElementById(
        "barraMeta"
    ).style.width =
        progreso +
        "%";

}


/* ======================================================
   INFLACIÓN
====================================================== */

function calcularInflacion() {

    const dinero =
        Number(
            document.getElementById(
                "dineroInflacion"
            ).value
        );


    const tasa =
        Number(
            document.getElementById(
                "tasaInflacion"
            ).value
        );


    const anos =
        Number(
            document.getElementById(
                "anosInflacion"
            ).value
        );


    if (

        !numeroValido(dinero) ||

        !numeroValido(tasa) ||

        !numeroValido(anos) ||

        dinero < 0 ||

        tasa < 0 ||

        anos <= 0

    ) {

        alert(
            "Por favor, introduce valores válidos para la inflación."
        );

        return;
    }


    const factor =
        Math.pow(

            1 +
            tasa /
            100,

            anos

        );


    const futuro =
        dinero *
        factor;


    const aumento =
        futuro -
        dinero;


    document.getElementById(
        "valorFuturoInflacion"
    ).textContent =
        formatoDinero(
            futuro
        );


    document.getElementById(
        "perdidaInflacion"
    ).textContent =
        formatoDinero(
            aumento
        );


    document.getElementById(
        "factorInflacion"
    ).textContent =
        factor.toFixed(2) +
        "x";

}


/* ======================================================
   PRESUPUESTO 50/30/20
====================================================== */

function calcularPresupuesto() {

    const ingreso =
        Number(
            document.getElementById(
                "ingresoMensual"
            ).value
        );


    if (

        !numeroValido(ingreso) ||

        ingreso <= 0

    ) {

        alert(
            "Por favor, introduce un ingreso mensual válido."
        );

        return;
    }


    const necesidades =
        ingreso *
        0.50;


    const deseos =
        ingreso *
        0.30;


    const ahorro =
        ingreso *
        0.20;


    document.getElementById(
        "necesidades"
    ).textContent =
        formatoDinero(
            necesidades
        );


    document.getElementById(
        "deseos"
    ).textContent =
        formatoDinero(
            deseos
        );


    document.getElementById(
        "ahorroPresupuesto"
    ).textContent =
        formatoDinero(
            ahorro
        );

}


/* ======================================================
   EVENTOS DE CALCULADORAS
====================================================== */

boton.addEventListener(
    "click",
    calcular
);


botonPrestamo.addEventListener(
    "click",
    calcularPrestamo
);


botonHipoteca.addEventListener(
    "click",
    calcularHipoteca
);


botonAhorro.addEventListener(
    "click",
    calcularAhorro
);


botonInflacion.addEventListener(
    "click",
    calcularInflacion
);


botonPresupuesto.addEventListener(
    "click",
    calcularPresupuesto
);


/* ======================================================
   CAMBIO REAL DE MONEDA
====================================================== */

moneda.addEventListener(
    "change",
    async function() {

        const nuevaMoneda =
            moneda.value;


        const origen =
            mapaMonedas[
                monedaAnterior
            ];


        const destino =
            mapaMonedas[
                nuevaMoneda
            ];


        /*
           Verificación.
        */

        if (

            !origen ||

            !destino

        ) {

            moneda.value =
                monedaAnterior;

            return;

        }


        /*
           Misma moneda.
        */

        if (
            origen === destino
        ) {

            return;

        }


        /*
           Deshabilitamos temporalmente
           el selector para evitar varios
           cambios mientras esperamos la API.
        */

        moneda.disabled =
            true;


        try {

            /*
               AQUÍ ocurre la conversión real.

               Ejemplo:

               10,000 CRC
               × tasa CRC/USD
               = dólares

               O:

               10,000 CRC
               × tasa CRC/EUR
               = euros
            */

            await convertirCamposMonetarios(

                origen,

                destino

            );


            /*
               Confirmamos la nueva moneda
               solo después de convertir.
            */

            monedaAnterior =
                nuevaMoneda;


            localStorage.setItem(

                "financalcMoneda",

                nuevaMoneda

            );


            /*
               Recalculamos todas las
               calculadoras activas.
            */

            recalcularTodo();


        } catch (error) {

            /*
               Si falla Internet o la API,
               volvemos a la moneda anterior.
            */

            moneda.value =
                monedaAnterior;


            alert(

                "No se pudo actualizar el tipo de cambio. Comprueba tu conexión a Internet e inténtalo nuevamente."

            );


        } finally {

            moneda.disabled =
                false;

        }

    }
);


/* ======================================================
   MODO OSCURO
====================================================== */

botonModoOscuro.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "modo-oscuro-activo"
        );


        const activo =
            document.body.classList.contains(
                "modo-oscuro-activo"
            );


        botonModoOscuro.textContent =

            activo

                ? "☀️"

                : "🌙";


        localStorage.setItem(

            "financalcModoOscuro",

            activo

        );

    }
);


/* ======================================================
   CARGAR MODO OSCURO
====================================================== */

const modoGuardado =
    localStorage.getItem(
        "financalcModoOscuro"
    );


if (
    modoGuardado === "true"
) {

    document.body.classList.add(
        "modo-oscuro-activo"
    );


    botonModoOscuro.textContent =
        "☀️";

}


/* ======================================================
   CARGAR MONEDA GUARDADA
====================================================== */

const monedaGuardada =
    localStorage.getItem(
        "financalcMoneda"
    );


if (
    monedaGuardada
) {

    const existe =
        Array.from(
            moneda.options
        ).some(

            opcion =>
                opcion.value ===
                monedaGuardada

        );


    if (
        existe
    ) {

        moneda.value =
            monedaGuardada;


        monedaAnterior =
            monedaGuardada;

    }

}


/* ======================================================
   ENTER PARA CALCULAR
====================================================== */

document.querySelectorAll(
    ".calculadora input"
).forEach(
    function(input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key !==
                    "Enter"
                ) {

                    return;

                }


                const calculadora =
                    input.closest(
                        ".calculadora"
                    );


                if (
                    !calculadora
                ) {

                    return;

                }


                switch (
                    calculadora.id
                ) {

                    case "inversiones":

                        calcular();

                        break;


                    case "prestamos":

                        calcularPrestamo();

                        break;


                    case "hipoteca":

                        calcularHipoteca();

                        break;


                    case "ahorro":

                        calcularAhorro();

                        break;


                    case "inflacion":

                        calcularInflacion();

                        break;


                    case "presupuesto":

                        calcularPresupuesto();

                        break;

                }

            }
        );

    }
);


/* ======================================================
   BOTÓN VOLVER ARRIBA
====================================================== */

window.addEventListener(
    "scroll",
    function() {

        if (
            window.scrollY >
            500
        ) {

            botonArriba.style.display =
                "flex";

        } else {

            botonArriba.style.display =
                "none";

        }

    }
);


botonArriba.addEventListener(
    "click",
    function() {

        window.scrollTo({

            top:
                0,

            behavior:
                "smooth"

        });

    }
);


/* ======================================================
   COMPARTIR
====================================================== */

compartir.addEventListener(
    "click",
    async function() {

        const datos = {

            title:
                "FinanCalc",

            text:
                "Prueba FinanCalc, calculadoras financieras gratuitas.",

            url:
                window.location.href

        };


        if (
            navigator.share
        ) {

            try {

                await navigator.share(
                    datos
                );

            } catch (error) {

                /* Usuario canceló */

            }

        } else {

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );


                alert(
                    "Enlace copiado."
                );


            } catch (error) {

                alert(
                    "No se pudo copiar el enlace."
                );

            }

        }

    }
);


/* ======================================================
   COPIAR ENLACE
====================================================== */

copiarEnlace.addEventListener(
    "click",
    async function() {

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );


            const textoOriginal =
                copiarEnlace.textContent;


            copiarEnlace.textContent =
                "✅ Enlace copiado";


            setTimeout(
                function() {

                    copiarEnlace.textContent =
                        textoOriginal;

                },
                1800
            );


        } catch (error) {

            alert(
                "No se pudo copiar el enlace."
            );

        }

    }
);


/* ======================================================
   COOKIES
====================================================== */

const cookiesGuardadas =
    localStorage.getItem(
        "financalcCookies"
    );


if (
    !cookiesGuardadas
) {

    cookieBanner.style.display =
        "block";

}


aceptarCookies.addEventListener(
    "click",
    function() {

        localStorage.setItem(

            "financalcCookies",

            "aceptadas"

        );


        cookieBanner.style.display =
            "none";

    }
);


rechazarCookies.addEventListener(
    "click",
    function() {

        localStorage.setItem(

            "financalcCookies",

            "rechazadas"

        );


        cookieBanner.style.display =
            "none";

    }
);
```
