import { Handler } from "aws-lambda";
import puppeteer from "puppeteer";

export const handler: Handler = async (event, context) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto("https://example.com");
    await page.type("#username", "your-username");
    await page.type("#password", "your-password");
    await page.click('button[type="submit"]');

    // Add more actions as needed

    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Form submission successful" }),
    };
  } catch (error) {
    console.error("Error:", error);
    await browser.close();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred" }),
    };
  }
};
