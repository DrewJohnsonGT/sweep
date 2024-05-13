import puppeteer from 'puppeteer';

interface HandlerEvent {
  formUrl: string;
  email: string;
  headless: string;
}

export const handler = async (event: HandlerEvent) => {
  console.log('Entering sweepstakes at URL:', event.formUrl);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: event.headless === 'true',
  });
  const page = await browser.newPage();

  try {
    await page.goto(event.formUrl);
    page.setViewport({ width: 1280, height: 800 });

    // Input section is inside an iframe
    const frames = page.frames();
    const frame = frames[1]; // frames[0] is the main page, frames[1] is the first iframe
    console.log('Frame URL:', frame.url());
    if (!frame) {
      throw new Error('No iframe found');
    }
    // Ensure the frame input is loaded and elements can be interacted with
    await frame.waitForSelector('input[type="email"]', { visible: true });
    await frame.type('input[type="email"]', event.email);
    console.log('Entered email address');

    // Click the submit button
    // Check the form for the submit button
    await frame.waitForSelector('button[type="submit"]', { visible: true });
    console.log('Found submit button');

    await frame.click('button[type="submit"]');
    console.log('Clicked submit button');

    // Wait for the next form to load
    await frame.waitForFunction(
      (text) => document.body.innerText.includes(text),
      {},
      'By clicking',
    );
    console.log('Next form loaded');
    const buttons = await frame.$$eval('button', (buttons) =>
      buttons.map((button) => ({
        html: button.outerHTML,
        text: button?.textContent?.trim(),
        visible: window.getComputedStyle(button).display !== 'none',
      })),
    );

    console.log('Buttons found:', buttons);

    const enterButtons = await frame.$$('button.xButton.xCTA.xSubmit');
    console.log('Enter buttons:', enterButtons);
    const enterButton = enterButtons[0];
    if (!enterButton) {
      throw new Error('No enter button found');
    }
    await enterButton.click();
    console.log('Clicked enter button');

    // There is another button to confirm the submission
    // make sure this button has the text "Enter" in it
    const buttonText = await frame.evaluate(() => {
      return document.querySelector('button[type="submit"]')?.textContent;
    });
    console.log('Button text:', buttonText);
    await frame.click('button[type="submit"]');
    console.log('Confirmed submission');
    // await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Form submission successful' }),
    };
  } catch (error) {
    console.error('Error:', error);
    await browser.close();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred' }),
    };
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
