const { Telegraf } = require("telegraf");

const TOKEN = "7754966695:AAEwt9Xz4J3Q1CijW00wvK01xHr_Y-U76W8";
const bot = new Telegraf(TOKEN);

// Replace with your ngrok URL for local testing
const netlify_web_link = "https://7e0a-197-58-153-28.ngrok-free.app/";

// Handle the `/start` command
bot.start((ctx) => {
  const userName = ctx.from.first_name || "User"; // Get user's first name or default to "User"
  ctx.reply(`Welcome, ${userName}! 😊`, {
    reply_markup: {
      keyboard: [
        [
          { text: "Open Web App", web_app: { url: netlify_web_link } },
        ],
      ],
    },
  });
});

// Command to retrieve funds (fetching from your backend)
bot.command("funds", async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || "Anonymous"; // Telegram username or default

  try {
    const backendApiUrl = `https://f385-197-42-61-182.ngrok-free.app/api/getFunds`;

    // Sending a POST request with the necessary data
    const response = await fetch(backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramUserId: userId,
        telegramUsername: username,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const userFunds = data.funds || 0;
      ctx.reply(`Your current funds: $${userFunds.toFixed(2)}`);
    } else {
      ctx.reply("Could not retrieve your funds at the moment. Please try again later.");
    }
  } catch (error) {
    console.error("Error fetching user funds:", error);
    ctx.reply("An error occurred while retrieving your funds. Please try again later.");
  }
});

// Start the bot
bot.launch();

// Graceful stop for development environments
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
