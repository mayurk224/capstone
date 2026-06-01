import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config()

const port = 3000;

app.listen(port, () => {
    console.log(`aiOrchestration Server is running on port ${port}`);
});