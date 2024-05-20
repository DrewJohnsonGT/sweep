import puppeteer from 'puppeteer';

interface HandlerEvent {
  formUrl: string;
  email: string;
  headless: string;
}

export const handler = async (event: HandlerEvent) => {
  console.log('Entering sweepstakes at URL:', event.formUrl);

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
    headless: event.headless === 'true',
    devtools: true,
  });
  const page = await browser.newPage();

  try {
    await page.goto(event.formUrl);
    page.setViewport({ width: 1280, height: 800 });

    // Ensure the frame input is loaded and elements can be interacted with
    await page.waitForSelector('input[type="email"]', { visible: true });
    await page.type('input[type="email"]', event.email);
    console.log('Entered email address');

    // Click the submit button
    // Check the form for the submit button
    await page.waitForSelector('button[type="submit"]', { visible: true });
    console.log('Found submit button');

    await page.click('button[type="submit"]');
    console.log('Clicked submit button');

    // Wait for the next form to load
    await page.waitForFunction(
      (text) => document.body.innerText.includes(text),
      {},
      'By clicking',
    );
    console.log('Next form loaded');

    const buttons = await page?.$$('button');
    console.log(buttons);
    if (!buttons) {
      throw new Error('No buttons found');
    }

    const buttonElements = [];
    for (const button of buttons) {
      const buttonElement = await button.evaluate((node) => {
        const buttonText = node.innerText;
        const buttonLocation = node.getBoundingClientRect();
        const buttonX = buttonLocation.x;
        const buttonY = buttonLocation.y;
        return {
          buttonLocation,
          text: buttonText,
          x: buttonX,
          y: buttonY,
        };
      });
      buttonElements.push(buttonElement);
    }

    const bodyBoundingBox = await page.evaluate(() => {
      const body = document.querySelector('body');
      if (!body) {
        throw new Error('Body not found');
      }
      return body.getBoundingClientRect();
    });
    console.log('Body bounding box:', bodyBoundingBox);

    for (const button of buttonElements) {
      console.log('Clicking button:', button.text);
      console.log('Button location:', button.x, button.y);
      await page.mouse.click(button.x, button.y - bodyBoundingBox.y);
      console.log('Clicked button:', button.text);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Form submission successful' }),
    };
  } catch (error) {
    console.error('Error:', error);
    // await browser.close();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred' }),
    };
  } finally {
    // await browser.close();
  }
};

if (process.env.DEV === 'true') {
  handler({
    formUrl: process.env.FORM_URL,
    email: process.env.EMAIL,
    headless: process.env.HEADLESS,
  }).catch((err) => {
    console.error('Error running handler:', err);
  });
}
