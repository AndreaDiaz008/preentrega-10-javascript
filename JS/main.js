
let pedidos = [];


function guardarPedidosEnStorage() {
    localStorage.setItem("pedidosLlaveros", JSON.stringify(pedidos));
}


const contenedorPedidos = document.getElementById('contenedor-pedidos');
const datosPedidos = document.getElementById('formulario-pedido');
const inputBusqueda = document.getElementById("input-busqueda");
const botonTema = document.getElementById("btn-tema");


function notificar(mensaje, tipo = "info") {
    let fondo = "#2563eb";
    if (tipo === "exito") fondo = "linear-gradient(to right, #00b09b, #96c93d)";
    if (tipo === "error") fondo = "linear-gradient(to right, #ff5f6d, #ffc371)";
    if (tipo === "aviso") fondo = "linear-gradient(to right, #f2994a, #f2c94c)";

    Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: fondo,
            borderRadius: "8px",
            fontSize: "14px"
        }
    }).showToast();
}


function renderizarPedidos(lista) {
    contenedorPedidos.innerHTML = "";

    if (lista.length === 0) {
        contenedorPedidos.innerHTML = `<p class="mensaje-vacio">No hay pedidos para mostrar.</p>`;
        return;
    }

    lista.forEach(pedido => {
        const { id, cliente, modelo, cantidad, estado } = pedido;

        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-pedido');

        tarjeta.innerHTML = `
            <h3>Cliente: ${cliente}</h3>
            <p>Modelo: ${modelo}</p>
            <p>Cantidad: ${cantidad}</p>
            <p>
                Estado:
                <select class="select-estado">
                    <option value="Pendiente" ${estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="En producción" ${estado === "En producción" ? "selected" : ""}>En producción</option>
                    <option value="Listo para entrega" ${estado === "Listo para entrega" ? "selected" : ""}>Listo para entrega</option>
                    <option value="Entregado" ${estado === "Entregado" ? "selected" : ""}>Entregado</option>
                </select>
            </p>
            <button class="btn-eliminar">Eliminar</button>
        `;


        const botonEliminar = tarjeta.querySelector(".btn-eliminar");
        botonEliminar.addEventListener("click", () => {
            pedidos = pedidos.filter(item => item.id !== id);
            guardarPedidosEnStorage();
            renderizarPedidos(pedidos);
            notificar(`Pedido de ${cliente} eliminado.`, "aviso");
        });

     
        const selectEstado = tarjeta.querySelector(".select-estado");
        selectEstado.addEventListener("change", (e) => {
            pedido.estado = e.target.value;
            guardarPedidosEnStorage();
            notificar(`Estado de ${cliente} actualizado a: ${pedido.estado}`, "info");
        });

        contenedorPedidos.appendChild(tarjeta);
    });
}


async function cargarDatosIniciales() {

    contenedorPedidos.innerHTML = `<p class="cargando">Cargando catálogo de pedidos...</p>`;

    try {
        const guardados = localStorage.getItem("pedidosLlaveros");

        if (guardados) {

            pedidos = JSON.parse(guardados);
        } else {

            const respuesta = await fetch("./data.json");
            
            if (!respuesta.ok) {
                throw new Error(`Error en la petición: ${respuesta.status}`);
            }

            const datos = await respuesta.json();
            pedidos = datos;
            guardarPedidosEnStorage();
        }

        notificar("Datos cargados correctamente", "exito");
    } catch (error) {
        console.error("Fallo al obtener pedidos:", error);
        notificar("Error al conectar con la fuente de datos.", "error");
        pedidos = [];
    } finally {

        renderizarPedidos(pedidos);
    }
}


cargarDatosIniciales();


datosPedidos.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombreCliente = document.getElementById("input-cliente").value.trim();
    const modeloLlavero = document.getElementById("input-modelo").value.trim();
    const cantidadLlavero = Number(document.getElementById("input-cantidad").value);

    if (!nombreCliente || !modeloLlavero || cantidadLlavero <= 0) {
        notificar("Por favor completá todos los campos correctamente.", "error");
        return;
    }

    const nuevoPedido = {
        id: Date.now(),
        cliente: nombreCliente,
        modelo: modeloLlavero,
        cantidad: cantidadLlavero,
        estado: "Pendiente"
    };

    pedidos.push(nuevoPedido);
    guardarPedidosEnStorage();
    renderizarPedidos(pedidos);
    datosPedidos.reset();

    notificar(`¡Pedido de ${nombreCliente} registrado!`, "exito");
});


inputBusqueda.addEventListener("input", (e) => {
    const termino = e.target.value.toLowerCase();
    const pedidosFiltrados = pedidos.filter(pedido => 
        pedido.cliente.toLowerCase().includes(termino) ||
        pedido.modelo.toLowerCase().includes(termino)
    );
    renderizarPedidos(pedidosFiltrados);
});


const temaGuardado = localStorage.getItem("tema");
if (temaGuardado === "dark") {
    document.body.classList.add("dark-mode");
    botonTema.textContent = "☀️ Modo Claro";
}

botonTema.addEventListener("click", () => {
    const esModoOscuro = document.body.classList.toggle("dark-mode");
    botonTema.textContent = esModoOscuro ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    localStorage.setItem("tema", esModoOscuro ? "dark" : "light");
});
