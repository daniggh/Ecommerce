class Alfajor {
    constructor(id, nombre, precio, imagen){
        this.id     = id;
        this.nombre = nombre;
        this.precio = parseFloat(precio);
        this.imagen = imagen;
        this.precioIVA = 0;
        this.cantidad = 0;
        this.total = 0;
    }
    calcularPrecioIVA(){
        this.precioIVA = this.precio + (this.precio * 0.21);
        this.precioIVA = this.precioIVA.toFixed(2)
    }
}
 
//declaro mis variables globales
let precioFinal;
let carrito = [];
let alfajores = [];
let grouped = [];
