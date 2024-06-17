import {Locator, Page} from '@playwright/test'

import {BasePage} from '../BasePage'

export class TopBarMenuLoggedInUserPage extends BasePage {

    constructor(page: Page) {
        super(page)
    }

    get accountSummaryTab() {
        return this.page.locator('#account_summary_tab');
    }

    get accountActivityTab() {
        return this.page.locator('#account_activity_tab');
    }

    get transferFundsTab() {
        return this.page.locator('#transfer_funds_tab');
    }

    get payBillsTab() {
        return this.page.locator('#pay_bills_tab');
    }

    get myMoneyMapTab() {
        return this.page.locator('#pay_bills_tab');
    }

    get onlineStatementsTab() {
        return this.page.locator('#pay_bills_tab');
    }

    async clickTab(tabname: string) {
        switch (tabname) {
            case 'Account Summary':
                await this.accountSummaryTab.click()
                break
            case 'Account Activity':
                await this.accountActivityTab.click()
                break
            case 'Transfer Funds':
                await this.transferFundsTab.click()
                break
            case 'Pay Bills':
                await this.payBillsTab.click()
                break
            case 'My Money App':
                await this.myMoneyMapTab.click()
                break
            case 'Online Statements':
                await this.onlineStatementsTab.click()
                break
            default:
                throw new Error('Could not find a tab with a given name')
        }
    }
}
