import app from "./app.js";
import "dotenv/config";

app.listen(process.env.DB_PORT, () => {
  console.log(`app working on port:${process.env.DB_PORT}`);
});
