const chai = require('chai');
const sinon = require('sinon');
const testService = require('../../services/testService');
const testControllerTest = require('../../controllers/testController');
const { expect } = chai;

describe('Test Controller', () => {
    describe('runSeleniumTest', () => {
        it('should call runTest with correct parameters for Selenium', () => {
            const req = { params: { testID: '123' } };
            const res = {};
            const runTestStub = sinon.stub(testService, 'runTest');

            testControllerTest.runSeleniumTest(req, res);

            expect(runTestStub.calledOnce).to.be.true;
            expect(runTestStub.calledWith('123', 'selenium', res)).to.be.true;

            runTestStub.restore();
        });
    });

    // Add more tests for other controller methods
});