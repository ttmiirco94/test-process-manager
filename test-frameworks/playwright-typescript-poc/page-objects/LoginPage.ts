import {expect, Page} from '@playwright/test'

import {BasePage} from './BasePage'

export class LoginPage extends BasePage {

    constructor(page: Page) {
        super(page)
    }

    get errorMessage() {
        return this.page.locator('.alert-error');
    }

    get passwordInput() {
        return this.page.locator('#user_password');
    }

    get submitButton() {
        return this.page.locator('text=Sign in');
    }

    get usernameInput() {
        return this.page.locator('#user_login');
    }

    async assertErrorMessage(errorMessage: string) {
        await expect(this.errorMessage).toHaveText(errorMessage)
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username)
        await this.passwordInput.fill(password)
        await this.submitButton.click()
    }
}
