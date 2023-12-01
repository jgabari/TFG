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

const FICHERO_JSON = 'state.json';
let state_json = fs.readFileSync(FICHERO_JSON);
let state = JSON.parse(state_json);

//Inicialización de variables
let fichero = '';
let nickname = '';
let password = '';
let money = 1000;
let money_encoded = '';
let squares = [];
let squares_encoded = '';
let cookie = '';

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



    //Extraigo las cookies si las hay
    // cookie = req.headers.cookie;
    // if (cookie) {
    //     let pares = cookie.split(';');
    //     pares.forEach((element, index) => {
    //         let [nombre, valor] = element.split('=');
    //         if (nombre.trim() === 'nickname') {
    //             nickname = valor;
    //         } else if (nombre.trim() === 'password') {
    //             password = valor;
    //         } else if (nombre.trim() === 'money') {
    //             money = parseInt(valor);
    //         }
    //     });
    // }

    // Saco el nombre del fichero que tengo que buscar
    if (url.pathname=='/') {
        fichero = 'index.html';
    } else if (url.pathname=='/download') {
        let stateData = '';
        req.on('data', chunk => {
            stateData += chunk;
        })
        req.on('end', () => {
            fs.writeFileSync("state.json", stateData)
        })
    }else {
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
            } else if (extension == 'js') {
                res.setHeader('Content-Type', 'application/javascript');
            } else if (extension == 'css') {
                res.setHeader('Content-Type', 'text/css');
            } else if (extension == 'json') {
                res.setHeader('Content-Type', 'application/json');
            }
            page = data;
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