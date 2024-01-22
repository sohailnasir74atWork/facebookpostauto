const express = require("express");
const axios = require("axios");
const schedule = require("node-schedule");
const { OpenAI } = require("openai");
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.PAGE_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);
const topics = ["web development", "AI", "data extraction"];

async function generatePost() {
  // Choose a random topic
  const topic = topics[Math.floor(Math.random() * topics.length)];

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: `Write a short 3 line content about ${topic}.` },
    ],
    model: "gpt-3.5-turbo",
  });

  // Extract the generated text
  const postContent = completion.choices[0].message.content.trim();
  return postContent;
}

async function postOnPage(message) {
  console.log(PAGE_ID, PAGE_ACCESS_TOKEN, OPENAI_API_KEY)
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v12.0/${PAGE_ID}/feed`,
      {
        message: message,
        access_token: PAGE_ACCESS_TOKEN,
      }
    );
    console.log("Post successful:", response.data);
  } catch (error) {
    console.error("Error posting on page:", error.message);
  }
}

// Schedule post every day at the specified time
schedule.scheduleJob("0 12 */3 * *", async () => {
  const postContent = await generatePost();
  postOnPage(postContent);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});