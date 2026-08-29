const boton = document.getElementById("botonCalcular");

boton.onclick = function () {

```
const inicial = Number(document.getElementById("inicial").value);
const mensual = Number(document.getElementById("mensual").value);
const tasa = Number(document.getElementById("tasa").value);
const anos = Number(document.getElementById("anos").value);

const meses = anos * 12;
const tasaMensual = tasa / 100 / 12;

let dinero = inicial;

for (let i = 0; i < meses; i++) {
    dinero = dinero * (1 + tasaMensual);
    dinero = dinero + mensual;
}

const aportado = inicial + (mensual * meses);
const intereses = dinero - aportado;

document.getElementById("resultado").innerText =
    "$" + dinero.toFixed(2);

document.getElementById("aportado").innerText =
    "$" + aportado.toFixed(2);

document.getElementById("intereses").innerText =
    "$" + intereses.toFixed(2);
```

};
