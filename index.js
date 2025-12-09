// =======================
// IMPORTS Y CONFIG
// =======================
const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

// Variables de entorno
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY;
const VOICEFLOW_VERSION_ID = process.env.VOICEFLOW_VERSION_ID;
const PORT = process.env.PORT || 3000;

// Validaciones básicas
if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ Falta TELEGRAM_BOT_TOKEN en las variables de entorno");
  process.exit(1);
}

if (!VOICEFLOW_API_KEY) {
  console.error("❌ Falta VOICEFLOW_API_KEY en las variables de entorno");
  process.exit(1);
}

if (!VOICEFLOW_VERSION_ID) {
  console.error("❌ Falta VOICEFLOW_VERSION_ID en las variables de entorno");
  process.exit(1);
}

// =======================
// INICIALIZAR BOT TELEGRAM
// =======================
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// =======================
// FUNCIÓN: MANDAR MENSAJE A VOICEFLOW
// =======================
async function sendToVoiceflow(userId, text) {
  const url = `https://general-runtime.voiceflow.com/state/${VOICEFLOW_VERSION_ID}/user/${userId}/interact`;

  const body = {
    action: {
      type: "text",
      payload: text,
    },
  };

  const headers = {
    Authorization: `Bearer ${VOICEFLOW_API_KEY}`,
    "Content-Type": "application/json",
  };

  const response = await axios.post(url, body, { headers });

  // Voiceflow responde con una lista de "traces"
  return response.data;
}

// =======================
// MANEJAR TODOS LOS TEXTOS DE TELEGRAM
// =======================
bot.on("text", async (ctx) => {
  const userId = String(ctx.from.id);
  const userText = ctx.message.text;

  console.log(`📩 Mensaje de Telegram (${userId}): ${userText}`);

  try {
    const traces = await sendToVoiceflow(userId, userText);

    // Recorrer las respuestas de Voiceflow
    for (const trace of traces) {
      // Texto normal
      if (trace.type === "text") {
        const message = trace.payload?.message;
        if (message) {
          console.log(`📤 Respuesta VF (texto): ${message}`);
          await ctx.reply(message);
        }
      }

      // Opcional: si usas "choices" en Voiceflow (botones / opciones)
      if (trace.type === "choice") {
        const choices = trace.payload?.choices || [];
        if (choices.length > 0) {
          const optionsText = choices.map((c, i) => `${i + 1}. ${c.name}`).join("\n");
          await ctx.reply(`Opciones:\n${optionsText}`);
        }
      }

      // Si Voiceflow manda "end" podrías hacer algo especial, pero no es obligatorio
      if (trace.type === "end") {
        console.log(`✅ Conversación finalizada por Voiceflow para user ${userId}`);
      }
    }
  } catch (error) {
    console.error("❌ Error hablando con Voiceflow:", error.response?.data || error.message);
    await ctx.reply("Hubo un problema al procesar tu mensaje, inténtalo de nuevo en un momento 🙏");
  }
});

// =======================
// INICIAR BOT Y SERVIDOR HTTP
// =======================
bot.launch()
  .then(() => {
    console.log("🤖 Bot de Telegram iniciado correctamente");
  })
  .catch((err) => {
    console.error("❌ Error iniciando el bot de Telegram:", err);
    process.exit(1);
  });

const app = express();

app.get("/", (req, res) => {
  res.send("Bot de hospedaje + Voiceflow corriendo ✅");
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP escuchando en puerto ${PORT}`);
});

// Manejo de cierre limpio
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
// =======================
