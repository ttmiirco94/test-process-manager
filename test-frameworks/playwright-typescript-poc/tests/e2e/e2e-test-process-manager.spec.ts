import {expect, Page, request, test} from '@playwright/test'
import {LandingPage} from '../../page-objects/LandingPage'
import {LoginPage} from '../../page-objects/LoginPage'
import {TopBarMenuLoggedInUserPage} from '../../page-objects/components/TopBarMenuLoggedInUserPage'

const username = 'admin';
const password = 'admin123!';
const baseUrl = 'http://localhost:3001/api/tests';

test('TST-123 | Example Playwright Test', async ({page}) => {
    let landingPage = new LandingPage(page)
    let loginPage = new LoginPage(page)
    let topBarMenuLoggedInUserPage = new TopBarMenuLoggedInUserPage(page)
    await landingPage.visit();

    await landingPage.clickSignIn();
    await loginPage.login('username', 'password');

    await page.goto('http://zero.webappsecurity.com/bank/account-summary.html');

    await topBarMenuLoggedInUserPage.accountSummaryTab.isVisible();

    await landingPage.clickUsername();
    await landingPage.clickLogoutOption();

    await expect(page).toHaveURL('http://zero.webappsecurity.com/index.html');
})

test('GetSeleniumTestData | Read Stored Test Data from Selenium Test', async ({}) => {
    //Just for testing retrieve-test-data\:testID endpoint
    await retrieveTestData('OpenGoogleTest');
})

//We need a grep-able word/ID (currently: has to be unique in project) in testName
//Here -> SeleniumPlusPlaywright
//Future -> Use XRay testID (TST-12345), because in theory: 1 XRay Test = 1 Automated Test
test('SeleniumPlusPlaywright | 1. Do Stuff in Playwright 2. Execute Selenium Test, save test-data 3. Retrieve test-data continue Playwright Test', async ({page}) => {
    //Execute test until we come require external test-data and/or test execution
    await doTestRelevantStuff1(page);

    //Start external test execution, save generated test-data
    await startSeleniumTest('OpenGoogleTest');

    //Continue test, retrieve previous created test-data if needed
    await doTestRelevantStuff2(page);
});

//Outsourced code to keep the overview clean for demo presentation
async function startSeleniumTest(testID: string) {
    const endpoint = '/selenium-test/' + testID;
    const url = baseUrl + endpoint;

    const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = {
        'Authorization': `Basic ${base64Credentials}`
    };

    const context = await request.newContext({
        extraHTTPHeaders: headers,
        timeout: 30000  // Set timeout to 30 seconds
    });

    try {
        const response = await context.put(url, {
            timeout: 30000  // Set timeout to 30 seconds for the request
        });

        expect(response.ok()).toBeTruthy();

        const buffer = await response.body();
        const result = buffer.toString('utf-8'); // Specify encoding if needed, default is 'utf-8'

        console.log('Response Body: ', result);
        expect(result).toBeDefined();
    } catch (error) {
        console.error('Request failed:', error);
    } finally {
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

    const context = await request.newContext({
        extraHTTPHeaders: headers
    });

    const response = await context.get(url);

    expect(response.ok()).toBeTruthy();

    fetchedData = await response.json();

    console.log('Fetched data:', fetchedData);
    expect(fetchedData).toBeDefined();

    await context.dispose();
    return fetchedData;
}

async function doTestRelevantStuff1(page: Page) {
    await page.goto('https://www.writerr.net/');
    await page.getByRole('button', {name: 'Allow all'}).click();
    await page.waitForTimeout(3000);
    await page.locator('//textarea[contains(@name, "editor")]').fill('This browser is opened by Playwright.');
    await page.locator('//textarea[contains(@name, "editor")]').click();
    await page.keyboard.type('\nWatch how Playwright will start a Selenium Test using the Test-Process-Manager API');
    await page.keyboard.type('\nand then fetch test data from the Selenium Test');
    await page.keyboard.type('\nSelenium Test starts in 3 seconds...');
    await page.waitForTimeout(3000);
}

async function doTestRelevantStuff2(page: Page) {
    await page.locator('//textarea[contains(@name, "editor")]').click();
    await page.keyboard.type('\nSelenium Test finished successfully, now fetching data...');
    await page.keyboard.type('\n' + JSON.stringify(await retrieveTestData('OpenGoogleTest')));
    await page.keyboard.type('\nTest finished, closing in 3 seconds...');
    await page.waitForTimeout(3000);
}