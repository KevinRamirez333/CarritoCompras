create database proyectoDesarrolloWeb;

use proyectoDesarrolloWeb;

create table usuarios (
id_usuario int auto_increment primary key,
email varchar(100),
password_hash varchar(255),
nombre varchar(100)

);
create table categorias(
	id_categoria int auto_increment primary key,
    nombre varchar(100)
    );
    
create table productos (
	id_producto int auto_increment primary key,
    nombre varchar(100),
    precio float,
    stock int,
    descripcion text,
    imagen_url varchar(200),
    id_categoria int,
    constraint fk_categoria foreign key (id_categoria) references categorias(id_categoria)
);

alter table productos 
    add id_proveedor int,
    add constraint fk_proveedor foreign key (id_proveedor) references proveedores(id_proveedor);
    
create table clientes(
	id_cliente int auto_increment primary key,
    nombre varchar(100),
    email varchar(100),
    direccion varchar(200),
    telefono varchar(20),
    password varchar(200)
);

ALTER TABLE clientes ADD COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo';

create table ventas(
	id_venta int auto_increment primary key,
    id_cliente int,
    fecha date,
    total float,
    constraint fk_cliente foreign key (id_cliente) references clientes(id_cliente)
);

create table detalle_ventas(
	id_detalle int auto_increment primary key,
    id_venta int,
    id_producto int, 
    cantidad int,
    precio_unitario float,
    constraint fk_venta foreign key(id_venta) references ventas(id_venta),
    constraint fk_producto foreign key (id_producto) references productos(id_producto) 
);

create table proveedores (
    id_proveedor int auto_increment primary key,
    nombre varchar(100),
    direccion varchar(200),
    telefono varchar(20)
);



create table carritos (
    id_carrito int auto_increment primary key,
    id_cliente int,
    total float,
    creado_en datetime default current_timestamp,
    constraint fk_carrito_cliente foreign key (id_cliente) references clientes(id_cliente)
);
SELECT * FROM clientes WHERE id_cliente = 3;

create table carrito_items (
    id_item int auto_increment primary key,
    id_carrito int,
    id_producto int,
    cantidad int,
    precio_unitario float,
    subtotal float,
    constraint fk_item_carrito foreign key (id_carrito) references carritos(id_carrito),
    constraint fk_item_producto foreign key (id_producto) references productos(id_producto)
);