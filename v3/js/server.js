import { createServer } from "http";
import { writeFileSync, readFile } from "fs";

const PORT = 9090;

const errorPage = `
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
    <h3>Resource not found or non-compatible<h3>
</body>
</html>
`;

// Inicialización de variables
let file = "";

const server = createServer((req, res) => {
  console.log("_____________________________________________");
  console.log("Request received!");

  // Valores por defecto de la respuesta
  let code = 200;
  let codeMsg = "OK";
  let page = "";

  // Construyo la URL que ha solicitado el cliente y extraigo el recurso solicitado
  const url = new URL(req.url, "http://" + req.headers.host);
  console.log("REQUESTED RESOURCE: " + url.pathname);

  // Saco el nombre del file que tengo que buscar
  if (url.pathname === "/") {
    file = "index.html";
  } else if (url.pathname === "/download") {
    let stateData = "";
    req.on("data", (chunk) => {
      stateData += chunk;
    });
    req.on("end", () => {
      writeFileSync("state.json", stateData);
    });
  } else {
    file = url.pathname.slice(1);
  }
  console.log("FILE WANTED: " + file);

  // Lectura asincrona del file
  readFile(file, (err, data) => {
    if (err) {
      // Si no se encuentra el file
      console.log("Error!");
      console.log(err.message);
      code = 404;
      codeMsg = "Not Found";
      res.setHeader("Content-Type", "text/html");
      page = errorPage;
    } else {
      console.log("FILE FOUND!");
      // Extraigo la extension del nombre del file segun cual sea
      // hago la respuesta que corresponda
      const dot = file.indexOf(".");
      const extension = file.slice(dot + 1);
      if (extension === "html") {
        res.setHeader("Content-Type", "text/html");
      } else if (extension === "js") {
        res.setHeader("Content-Type", "application/javascript");
      } else if (extension === "css") {
        res.setHeader("Content-Type", "text/css");
      } else if (extension === "json") {
        res.setHeader("Content-Type", "application/json");
      }
      page = data;
    }
    // Asigno los valores de la respuesta y la envio
    res.statusCode = code;
    res.statusMessage = codeMsg;
    res.write(page);
    res.end();
    console.log("Response sent!");
  });
});

// Lanzo el servidor
server.listen(9090);
console.log("Server listening on port " + PORT);
