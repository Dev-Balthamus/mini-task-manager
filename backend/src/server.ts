import app from "./app.js";

const port = 3000;

app.listen(port, () => {
  console.log(`Server dell'app "Mio Task Manager" in ascolto sulla porta ${port}`);
});
