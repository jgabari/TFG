const http = require('http');
const fs = require('fs');

const PUERTO = 9090;

const pagina_error = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi users</title>
</head>
<body>
    <h1>ERROR</h1>
    <h3>Recurso no encontrado o no compatible<h3>
</body>
</html>
`

const FICHERO_JSON = 'users.json';
let users_json = fs.readFileSync(FICHERO_JSON);
let users = JSON.parse(users_json);
let users_list = [];
users.users.forEach((element) => {
    users_list.push(element.nombre);
})

const server = http.createServer((req, res) => {

    console.log("_____________________________________________");
    console.log("Petición recibida!");

    //Valores por defecto de la respuesta
    let code = 200;
    let code_msg = 'OK';
    let page = '';
    
    //Construyo la URL que ha solicitado el cliente y extraigo el recurso solicitado
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log('RECURSO PEDIDO: ' + url.pathname);

    //Inicialización de variables
    let fichero = '';
    let nickname = '';
    let password = '';
    let direccion = '';
    let tarjeta = '';
    let nuevo_pedido = {};
    let cookie = '';
    let cookie_carrito = 'carrito=';
    let carrito = [];

    //Extraigo las cookies si las hay
    cookie = req.headers.cookie;
    if (cookie) {
        let pares = cookie.split(';');
        pares.forEach((element, index) => {
            let [nombre, valor] = element.split('=');
            if (nombre.trim() === 'nickname') {
                nickname = valor;
            } else if (nombre.trim() === 'password') {
                password = valor;
            }
        });
    }

    // Saco el nombre del fichero que tengo que buscar
    if (url.pathname=='/') {
        fichero = 'index.html';
    // } else if (url.pathname=='/favicon.ico') {
    //     fichero = 'icono.png';
    } else if (url.pathname=='/users') {
        fichero = 'users.json';
    } else if (url.pathname == '/login') {
        nickname = url.searchParams.get('nick');
        password = url.searchParams.get('pswd');
        console.log("Login: " + nickname);
        found = false;
        for (i = 0; i < users.users.length; i++) {
            if (users.users[i].nickname == nickname) {
                if (users.users[i].password == password) {
                    found = true;
                }
            }
        }
        if (found == true) {
            res.setHeader('Set-Cookie', ["user="+nickname, "password="+password]);
            fichero = 'game.html';
        } else {
            new_user = { "nickname": nickname, "password": password };
            users['users'].push(new_user);
            users_json = JSON.stringify(users);
            fs.writeFileSync(FICHERO_JSON, users_json);
            res.setHeader('Set-Cookie', ["user="+nickname, "password="+password]);
            fichero = 'game.html';
        }
    // } else if (url.pathname == '/finalizar') {
    //     fichero = 'compra_realizada.html';
    //     direccion = url.searchParams.get('direccion');
    //     tarjeta = url.searchParams.get('tarjeta');
    //     nuevo_pedido = {"nickname": nickname,"direccion":direccion,"tarjeta":tarjeta,"producto":carrito};
    //     users['pedidos'].push(nuevo_pedido);
    //     users_json = JSON.stringify(users);
    //     fs.writeFileSync(FICHERO_JSON, users_json);
    } else if (url.pathname == '/login.html') {
        fichero = 'login.html';
        // if (nickname) {
        //     fichero = 'yalogeado.html';
        // }
    // } else if (url.pathname == '/carrito_x100pre') {
    //     if (nickname) {
    //         cookie_carrito += "x100pre:"
    //         res.setHeader('Set-Cookie', cookie_carrito);
    //     }
    //     fichero = 'producto1.html';
    // } else if (url.pathname == '/carrito_yhlqmdlg') {
    //     if (nickname) {
    //         cookie_carrito += "yhlqmdlg:"
    //         res.setHeader('Set-Cookie', cookie_carrito);
    //     }
    //     fichero = 'producto2.html';
    // } else if (url.pathname == '/carrito_ultimotour') {
    //     if (nickname) {
    //         cookie_carrito += "elultimotourdelmundo:";
    //         res.setHeader('Set-Cookie', cookie_carrito);
    //     }
    //     fichero = 'producto3.html';
    // } else if (url.pathname == '/busqueda') {
    //     fichero = 'index.html';
    // } else if (url.pathname == '/buscar') {
    //     let se_busca = url.searchParams.get('producto');
    //     se_busca = se_busca.toUpperCase();
    //     if (se_busca == 'X100PRE') {
    //         fichero = 'producto1.html';
    //     } else if (se_busca == 'YHLQMDLG') {
    //         fichero = 'producto2.html';
    //     } else if (se_busca == 'ELULTIMOTOURDELMUNDO') {
    //         fichero = 'producto3.html';
    //     } else {
    //         fichero = 'index.html';
    //     }
    } else {
        fichero = url.pathname.slice(1);
    }
    console.log("FICHERO QUE SE BUSCA: " + fichero);



    //Lectura asincrona del fichero
    fs.readFile(fichero, (err, data) => {
        
        if (err) {
            //Si no se encuentra el fichero
            console.log("Error!");
            console.log(err.message);
            code = 404;
            code_msg = "Not Found";
            res.setHeader('Content-Type', 'text/html');
            page = pagina_error;
        } else {
            console.log("Fichero encontrado!");
            //Extraigo la extension del nombre del fichero segun cual sea
            //hago la respuesta que corresponda
            punto = fichero.indexOf('.');
            extension = fichero.slice(punto + 1);
            if (extension == 'html'){
                res.setHeader('Content-Type', 'text/html');
            } else if (extension == 'jpg'){
                res.setHeader('Content-Type', 'image/jpg');
            } else if (extension == 'png') {
                res.setHeader('Content-Type', 'image/png');
            } else if (extension == 'css') {
                res.setHeader('Content-Type', 'text/css');
            } else if (extension == 'json') {
                res.setHeader('Content-Type', 'application/json');
            } else if (extension == 'js') {
                res.setHeader('Content-Type', 'application/javascript');
            }
            page = data;
            // if (/* fichero == 'bienvenida.html' ||  */fichero == 'login_error.html'/*  || fichero == 'yalogeado.html' */) {
            //     page = page.toString().replace("USUARIO", nickname);
            // } else if (fichero == 'index.html') {
            //     if (url.pathname == '/busqueda') {
            //         res.setHeader('Content-Type', "application/json");
            //         //-- Leer los parámetros
            //         let param1 = url.searchParams.get('param1');
            //         param1 = param1.toUpperCase();
            //         let result = [];
            //         for (let prod of users_list) {
            //             //-- Pasar a mayúsculas
            //             prodU = prod.toUpperCase();
            //             //-- Si el producto comienza por lo indicado en el parametro
            //             //-- meter este producto en el array de resultados
            //             if (prodU.startsWith(param1)) {
            //                 result.push(prod);
            //             }
            //         }
            //         page = JSON.stringify(result);
            //     } else if (nickname) {
            //         const ENLACE_LOGIN = '<a id="botonlogin" href="login.html">LOGIN</a>';
            //         const NOMBRE_USUARIO = '<a id="botonlogin" href="yalogeado.html">' + nickname + '</a>';
            //         page = page.toString().replace(ENLACE_LOGIN, NOMBRE_USUARIO);
            //     }
            // } else if (fichero == 'finalizar_compra.html') {
            //     let LISTACARRITO = '<ul>';
            //     carrito.forEach((element) => {
            //         LISTACARRITO += '<li>'+element+'</li>';
            //     })
            //     LISTACARRITO += '</ul>';
            //     page = page.toString().replace('LISTACARRITO', LISTACARRITO);
            // } else if (fichero == 'producto1.html') {
            //     const DESCRIPCION = users.users[0].descripcion;
            //     page = page.toString().replace('DESCRIPCIONJSON', DESCRIPCION);
            // } else if (fichero == 'producto2.html') {
            //     const DESCRIPCION = users.users[1].descripcion;
            //     page = page.toString().replace('DESCRIPCIONJSON', DESCRIPCION);
            // } else if (fichero == 'producto3.html') {
            //     const DESCRIPCION = users.users[2].descripcion;
            //     page = page.toString().replace('DESCRIPCIONJSON', DESCRIPCION);
            // }
        }
        //Asigno los valores de la respuesta y la envio
        res.statusCode = code;
        res.statusMessage = code_msg;
        res.write(page);
        res.end();
        console.log("Respuesta enviada!");
    })
});

//Lanzo el servidor
server.listen(9090);
console.log('Servidor escuchando en el puerto ' + PUERTO);