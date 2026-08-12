import { env } from "./config/env";
import app from "./app";

app.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});
