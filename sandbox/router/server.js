import http from "http";
import app, { handleUpgrade } from "./src/app.js";

const server = http.createServer(app);

server.on('upgrade', handleUpgrade);

server.listen(3000, () => {
  console.log("Router is running on port 3000");
});
