import {Page} from '@playwright/test'

import {BasePage} from '../page-objects/BasePage'

export class LandingPage extends BasePage {

    constructor(page: Page) {
        super(page)
    }

    get feedbackLink() {
        return this.page.locator('#feedback');
    }

    get logoutLink() {
        return this.page.locator('#logout_link');
    }

    get searchbox() {
        return this.page.locator('#searchTerm');
    }

    get signInButton() {
        return this.page.locator('#signin_button');
    }

    get usernameDropdown() {
        return this.page.locator('#settingsBox > ul > li:nth-child(3) > a');
    }

    async clickFeedbackLink() {
        await this.feedbackLink.click()
    }

    async clickLogoutOption() {
        await this.logoutLink.click()
    }

    async clickSignIn() {
        await this.signInButton.click()
    }

    async clickUsername() {
        await this.usernameDropdown.click()
    }

    async searchForPhrase(phrase: string) {
        await this.searchbox.type(phrase)
        await this.page.keyboard.press('Enter')
    }

    async visit() {
        await this.page.goto('http://zero.webappsecurity.com/')
    }
}
