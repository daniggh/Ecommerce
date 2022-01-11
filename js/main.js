function getData(){
    //recupero el carrito del local storage
    if(JSON.parse(localStorage.getItem('carritoU')) != null){
        carrito = JSON.parse(localStorage.getItem('carritoU'));
    }

    //preparo la pantalla
    limpiarPantalla();
    botonCarrito();

    //obtengo los productos, si hay los muestro en pantalla
    const url = "data/productos.json"
    $.getJSON(url,function(respuesta, estado){
        if (estado === "success"){
            for (const rta of respuesta){   
                $(".container").append(`<div id="product${rta.id}" style="display:none" class="products">
                                            <div id="foto"><img src=${rta.imagen} alt=""></div>
                                            <div>${rta.precio}</div>
                                            <div id="buttons">
                                            <button class="button" id="btn${rta.id}">Agregar a la lista</button>
                                            </div>
                                        </div>`)
            $(`.products`).fadeIn();

            $(`#btn${rta.id}`).on('click', function (){
                    let prd = new Alfajor(rta.id, rta.nombre, rta.precio, rta.imagen);
                    metodos(prd);       
                    $("nav").html(`<button class="button" id="bVerCarr">Ver lista (${grouped.length}) </button>`)
                    $(`#bVerCarr`).on('click', function (){  
                        if ( grouped.length > 0 || JSON.parse(localStorage.getItem('carrito')) != null){
                            fCarrito();
                        }else{
                            popup("La lista está vacía, seleccione algun producto.");
                        } 
                    })
                    $(`#product${rta.id}`).css("background-color", "green")

            })}
        }else{
            popup("Error al obtener la información de los productos");
        }
    })

}

function popup(mensaje) {
    //reemplazo el alert por un popup propio
    $(".popup").empty().append(`<div id="popup" class="popupH">
                            <div>${mensaje}</div>
                            <button class="button" id="btnX">X</button></div>
                        </div>`)

    $(`#btnX`).on('click', function (){
        $("div").remove("#popup");
                    })
                        
}

function metodos(alfajorx){
    //calculo el precio con IVA, agrego el producto, agrupo los productos iguales, calculo el precio total de la compra y guardo en local storage
    alfajorx.calcularPrecioIVA();
    carrito.push(alfajorx);
    reducirCarrito();
    precio();
    //guardo el carrito agrupado (para mostrarlo correctamente), y no-agrupado (para que no se pisen los valores al agregar productos en una sesion nueva) 
    localStorage.setItem('carrito', JSON.stringify(grouped));
    localStorage.setItem('carritoU', JSON.stringify(carrito));
}

function reducirCarrito(){
    //utilizando el metodo map, agrupo los productos por tipo y calculo el total de cada grupo
    grouped = carrito.reduce((map => (r, a) => {
        if (!map.has(a.id)) {
            map.set(a.id, { id: a.id, 
                            nombre: a.nombre, 
                            precio: a.precio, 
                            imagen: a.imagen,
                            precioIVA: a.precioIVA,
                            cantidad: 0, 
                            total: a.total});
            r.push(map.get(a.id));
        }
        map.get(a.id).cantidad++;
        map.get(a.id).total = map.get(a.id).cantidad * map.get(a.id).precioIVA;
        map.get(a.id).total.toFixed(2);
        return r;
    })(new Map), []);
}

function precio(){
    //calculo el precio final, acumulando los totales de cada producto (incluyen IVA y estan multiplicados por la cantidad de cada item)
    precioFinal = grouped.reduce(function (accumulator, item){
        localStorage.setItem('precioTotal', (accumulator + item.total));
        return accumulator + item.total;
        }, 0);  
    precioFinal.toFixed(2)
}

function botonCarrito(){
    //agrego el botón para ver el carrito y su funcionalidad
    let cantc = 0;
    if(JSON.parse(localStorage.getItem('carrito')) != null){
        cantc = JSON.parse(localStorage.getItem('carrito')).length;
    }

    $(".nav").append(`<button class="button" id="bVerCarr">Ver lista (${cantc}) </button>`)
    $(`#bVerCarr`).on('click', function (){  
        if ( grouped.length > 0 || JSON.parse(localStorage.getItem('carrito')) != null){
            fCarrito();
        }else{
            popup("La lista está vacía, seleccione algun producto.");
        } 
    })
}

function fCarrito(){
    //elimino los botones que no quiero que se multipliquen
    $("button").remove("#bVerCarr");
    $("button").remove("#bVerCat");
    $("button").remove("#bClean");
    $("button").remove("#bDownload");

    //agrego los botones que necesito
    $(".nav").append(`<button class="button" id="bClean">Limpiar lista</button>`)
    $(`#bClean`).on('click', function (){  
        limpiarPantalla();
        localStorage.removeItem('carrito');
        localStorage.removeItem('carritoU');
        localStorage.removeItem('precioTotal');
        carrito = [];
        grouped = [];
    })
    $(".nav").append(`<button class="button" id="bVerCat">Ver catalogo</button>`)
    $(`#bVerCat`).on('click', function (){  
        limpiarPantalla();
        $("button").remove("#bVerCat");
        $("button").remove("#bClean");
        $("button").remove("#bDownload");
        getData();
    })
    $(".nav").append(`<button class="button" id="bDownload" type="submit">Descargar lista</button>`)
    $(`#bDownload`).on('click', function (){  
        limpiarPantalla();
        $("button").remove("#bClean");
        $("button").remove("#bDownload");
        lista = JSON.stringify(grouped, replacer, '\t');
        lista = lista.replace(/"/g, '');
        lista = lista.replace(/{/g, '');
        lista = lista.replace(/}/g, '');
        lista = lista.replace(/,/g, '');
        lista = lista.replace(/]/g, '');
        lista = lista.replace(/		/g, '');
        lista = lista.replace(/nombre:/g, 'Nombre:');
        lista = lista.replace(/cantidad:/g, 'Cantidad:');
        lista = lista.replace(/total:/g, 'Total:');
        lista = lista.substring(1)
        $(".container").append(`<form class="carr" onsubmit="download(this['name'].value, this['text'].value)">
                                      <input class="download" type="text" name="name" value="Lista de alfajores.txt">
                                       <textarea style="height:200px;width:500px;" class="download" name="text">${lista}</textarea>
                                      <input class="button" type="submit" value="Descargar">
                                    </form>`)
    })

    //si hay datos en el local storage, los recupero y los muestro
    if(JSON.parse(localStorage.getItem('carrito')) != null){
        //limpio el carrito
        limpiarPantalla();
        //agrego el final del carrito
        precioFinal = JSON.parse(localStorage.getItem('precioTotal'))     
        precioFinal = precioFinal.toFixed(2)
        $(".carrito").empty().append(`<div class="carrC">
                                        <p> Tenés que llevar $${precioFinal} al kiosco</p>
                                    </div>`)
        //agrego el cuerpo del carrito, con cada producto y sus datos
        cuerCarr();
    }  
}

function replacer(key, value) {
    // Filtrando propiedades 
    if (key == 'id' || key == 'imagen' || key == 'precio' || key == 'precioIVA') {
      return undefined;
    }

    return value;
  }

function cuerCarr(){
    grouped = JSON.parse(localStorage.getItem('carrito'));
    for (const producto of grouped) {
        $(".carrito").append(`
            <div id="carr${producto.id}" class="carr">
                <img id="fotoChiquita" src=${producto.imagen} alt="">
                <p class="carrH" id="Nombre"> ${producto.nombre}</p>
                <p class="carrH"> Precio: $${producto.precio}</p>
                <p class="carrH"> Precio IVA: $${producto.precioIVA}</p>
                <p class="carrH"> Cantidad: ${producto.cantidad} </p>
                <p class="carrH"> Total: $${producto.total} </p>
                <button class="button" id="bElim${producto.id}">Eliminar</button>
            </div>`)
            
        $(`#bElim${producto.id}`).on('click', function (){
          $(`#carr${producto.id}`).remove();
          grouped = grouped.filter(function(element){
              return element.id != `${producto.id}`
          })
          precioFinal = precioFinal - `${producto.total}`;
          precioFinal = precioFinal.toFixed(2)
          //si el precio final tiene valor, guardo los datos en local storage, si no lo vacio
          if (precioFinal != null && precioFinal > 0){
            localStorage.setItem('precioTotal', precioFinal);
            localStorage.setItem('carrito', JSON.stringify(grouped));
          }else{
            $("div").remove(".carrC");
            localStorage.removeItem('carrito');
            localStorage.removeItem('carritoU');
            localStorage.removeItem('precioTotal');
            carrito = [];
          }

          $(".carrC").html(`<div class="carrC">
                                <p> Tenés que llevar $${precioFinal} al kiosco</p>
                            </div>`)
        })
    }
}

function limpiarPantalla (){
    $("div").remove(".cuerCarr");
    $("div").remove(".carr");
    $("div").remove(".carrC");
    $("div").remove(".products");
    $("div").remove(".popupH");
    $("form").remove();
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

getData()