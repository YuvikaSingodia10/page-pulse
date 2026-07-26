const app = require("./app");
const config = require("./config");

const server = app.listen(config.port, () => {
  console.log(`Page Pulse running on port ${config.port}`);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});

server.on("close", () => {
  console.log("SERVER CLOSED");
});

process.on("exit", (code) => {
  console.log("NODE PROCESS EXITING WITH CODE:", code);
});