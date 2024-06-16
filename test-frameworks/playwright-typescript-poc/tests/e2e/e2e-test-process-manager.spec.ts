import {test, expect, request} from '@playwright/test'
import { LandingPage } from '../../page-objects/LandingPage'
import { LoginPage } from '../../page-objects/LoginPage'
import { TopBarMenuLoggedInUserPage } from '../../page-objects/components/TopBarMenuLoggedInUserPage'

const username = 'admin';
const password = 'admin123!';
const baseUrl = 'http://localhost:3001';

test('TST-123 | Example Playwright Test', async ({ page }) => {
  let landingPage = new LandingPage(page)
  let loginPage = new LoginPage(page)
  let topBarMenuLoggedInUserPage = new TopBarMenuLoggedInUserPage(page)
  await landingPage.visit()

  await landingPage.clickSignIn()
  await loginPage.login('username', 'password')

  await page.goto('http://zero.webappsecurity.com/bank/account-summary.html')

  await topBarMenuLoggedInUserPage.accountSummaryTab.isVisible()

  await landingPage.clickUsername()
  await landingPage.clickLogoutOption()

  await expect(page).toHaveURL('http://zero.webappsecurity.com/index.html')
})

test('GetSeleniumTestData | Read Stored Test Data from Selenium Test', async ({}) => {
  await retrieveTestData('OpenGoogleTest');
})

test('SeleniumPlusPlaywright | Execute Selenium Test followed by Playwright Test', async ({ page}) => {
  await page.goto('https://www.writerr.net/');
  await page.getByRole('button', { name: 'Allow all' }).click();
  await page.waitForTimeout(3000);
  await page.locator('//textarea[contains(@name, "editor")]').fill('This browser is opened by Playwright.');
  await page.locator('//textarea[contains(@name, "editor")]').click();
  await page.keyboard.type('\nWatch how Playwright will start a Selenium Test using the Test-Process-Manager API');
  await page.keyboard.type('\nand then fetch test data from the Selenium Test');
  await page.keyboard.type('\nSelenium Test starts in 3 seconds...');
  await page.waitForTimeout(3000);
  await startSeleniumTest('OpenGoogleTest');
  await page.locator('//textarea[contains(@name, "editor")]').click();
  await page.keyboard.type('\nSelenium Test finished successfully, now fetching data...');
  await page.keyboard.type('\n' + JSON.stringify(await retrieveTestData('OpenGoogleTest')));
  await page.keyboard.type('\nTest finished, closing in 3 seconds...');
  await page.waitForTimeout(3000);
});

async function startSeleniumTest(testID: string) {
  const endpoint = '/selenium-test/' + testID;
  const url = baseUrl + endpoint;

  const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${base64Credentials}`
  };

  // Create a new request context
  const context = await request.newContext({
    extraHTTPHeaders: headers,
    timeout: 30000  // Set timeout to 30 seconds
  });

  try {
    // Make the PUT request with a 30s timeout
    const response = await context.put(url, {
      timeout: 30000  // Set timeout to 30 seconds for the request
    });

    // Ensure the response is OK
    expect(response.ok()).toBeTruthy();

    const buffer = await response.body();
    // Convert the Buffer to a string
    const result = buffer.toString('utf-8'); // Specify encoding if needed, default is 'utf-8'

    // Perform your assertions on the jsonResponse
    console.log('Response Body: ', result);
    expect(result).toBeDefined();
  } catch (error) {
    console.error('Request failed:', error);
  } finally {
    // Close the context
    await context.dispose();
  }
}

async function retrieveTestData(testID: string) {
  let fetchedData: any;
  const endpoint = '/retrieve-test-data/' + testID;
  const url = baseUrl + endpoint;

  const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${base64Credentials}`,
    'Content-Type': 'application/json'
  };

  // Create a new request context
  const context = await request.newContext({
    extraHTTPHeaders: headers
  });

  // Make the GET request
  const response = await context.get(url);

  // Ensure the response is OK
  expect(response.ok()).toBeTruthy();

  // Parse the JSON response
  fetchedData = await response.json();

  // Perform your assertions on the jsonResponse
  console.log('Fetched data:', fetchedData);
  expect(fetchedData).toBeDefined();

  // Close the context
  await context.dispose();
  return fetchedData;
}
