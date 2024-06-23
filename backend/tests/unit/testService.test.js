const chai = require('chai');
const sinon = require('sinon');
const testService = require('../../services/testService_withoutDB');
const execHelper = require('../../utils/execHelper');
const { expect } = chai;

describe('Test Service', () => {
    describe('runTest', () => {
        it('should call execTestAndRespond with correct parameters for Selenium', () => {
            const execTestAndRespondStub = sinon.stub(execHelper, 'execTestAndRespond');
            const res = {};
            testService.runTest('123', 'selenium', res);

            expect(execTestAndRespondStub.calledOnce).to.be.true;

            execTestAndRespondStub.restore();
        });

        // Add more tests for other service methods
    });
});