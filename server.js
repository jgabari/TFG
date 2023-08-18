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
    cookie = req.headers.cookie;
    if (cookie) {
        let pares = cookie.split(';');
        pares.forEach((element, index) => {
            let [nombre, valor] = element.split('=');
            if (nombre.trim() === 'nickname') {
                nickname = valor;
            } else if (nombre.trim() === 'password') {
                password = valor;
            } else if (nombre.trim() === 'money') {
                money = parseInt(valor);
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
                    squares = users.users[i].squares;
                    money = users.users[i].money;
                    found = true;
                }
            }
        }
        if (found == true) {
            squares_encoded = JSON.stringify(squares);
            money_encoded = money.toString();
            res.setHeader('Set-Cookie', ["user="+nickname, "password="+password, "money="+money_encoded, "progress="+squares_encoded]);
            fichero = 'game.html';
        } else {
            new_user = { "nickname": nickname, "password": password, "money": 1000, "squares":[{"x":0,"y":0,"brightness":128}] };
            users['users'].push(new_user);
            users_json = JSON.stringify(users);
            fs.writeFileSync(FICHERO_JSON, users_json);
            res.setHeader('Set-Cookie', ["user="+nickname, "password="+password, "money=" + money.toString()]);
            fichero = 'game.html';
        }
    } else if (url.pathname == '/login.html') {
        fichero = 'login.html';
    } else if (url.pathname == '/saveexit') {
        fichero = 'index.html';
        money = url.searchParams.get('money');
        let progressData = '';
        req.on('data', chunk => {
            progressData += chunk;
        })

        req.on('end', () => {
            console.log("Datos de Progreso recibidos: ");
            console.log(progressData);
            let progressJSON = JSON.parse(progressData);
            for (i = 0; i < users.users.length; i++) {
                if (users.users[i].nickname == nickname) {
                    if (users.users[i].password == password) {
                        users.users[i].squares = progressJSON;
                        users.users[i].money = money;
                        users_json = JSON.stringify(users);
                        fs.writeFileSync(FICHERO_JSON, users_json);
                        console.log("Datos de progreso guardados!");
                    }
                }
            }

        })
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