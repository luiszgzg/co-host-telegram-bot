const express = require("express");
const { Telegraf } = require("telegraf");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error("Falta TELEGRAM_BOT_TOKEN en las variables de entorno");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

// --- LÓGICA BÁSICA DEL BOT (luego la refinamos para tu hospedaje) --- //

bot.start((ctx) => {
  ctx.reply(
    "¡Bienvenida/o! Soy el asistente de tu hospedaje.\n\n" +
      "Escribe /menu para ver opciones como Wifi, acceso, reglamento y recomendaciones."
  );
});

bot.command("menu", (ctx) => {
  ctx.reply(
    "Menú principal:\n\n" +
      "📶 Wifi\n" +
      "🔐 Acceso y llaves\n" +
      "📋 Reglamento\n" +
      "📍 Recomendaciones locales\n\n" +
      "Puedes escribir: wifi, llaves, reglamento o recomendaciones."
  );
});

bot.hears(/wifi/i, (ctx) => {
  ctx.reply(
    "📶 Wifi del hospedaje:\n\n" +
      "Nombre de red: AQUÍ_EL_NOMBRE\n" +
      "Contraseña: AQUÍ_LA_CONTRASEÑA"
  );
});

bot.hears(/llaves|acceso/i, (ctx) => {
  ctx.reply(
    "🔐 Acceso y llaves:\n\n" +
      "Código de la cerradura: XXXX\n" +
      "Instrucciones: aquí podemos detallar cómo abrir/cerrar y qué hacer en caso de fallo."
  );
});

bot.hears(/reglamento/i, (ctx) => {
  ctx.reply(
    "📋 Reglamento básico de la casa:\n\n" +
      "1. Respeta a los vecinos y mantén el ruido bajo después de las 10 pm.\n" +
      "2. No se permiten fiestas sin autorización previa.\n" +
      "3. Cuida mobiliario, toallas y equipo.\n" +
      "4. Saca la basura en las bolsas designadas.\n" +
      "5. Cualquier daño repórtalo de inmediato."
  );
});

bot.hears(/recomendaciones/i, (ctx) => {
  ctx.reply(
    "📍 Recomendaciones locales:\n\n" +
      "- Restaurante X: ideal para cena romántica.\n" +
      "- Playa Y: perfecta para ver el atardecer.\n" +
      "- Supermercado Z: para comprar despensa cerca.\n\n" +
      "Más adelante puedo mandarte rutas y tips más detallados."
  );
});

// --- INICIAR BOT (long polling) --- //
bot.launch()
  .then(() => console.log("Bot de Telegram iniciado"))
  .catch((err) => {
    console.error("Error iniciando el bot:", err);
    process.exit(1);
  });

// --- Servidor HTTP mínimo para que Render esté feliz --- //
app.get("/", (req, res) => {
  res.send("Bot de hospedaje corriendo ✅");
});

app.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en puerto ${PORT}`);
});

// Parar limpio en Render/Heroku/etc.
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
