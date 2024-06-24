const createCustomLogger = require("../config/logger");
const TestOutput = require("../models/TestOutput");
const Test = require("../models/Test");

const logger = createCustomLogger('databaseHelper.js');

exports.getTestsAndOutputs = async () => {
    try {
        const tests = await Test.findAll({
            include: [
                {
                    model: TestOutput,
                    as: 'TestOutputs',
                    required: false
                }
            ]
        });

        if (tests.length === 0) {
            console.log('No tests found.');
            return {};
        }

        const results = {};
        tests.forEach(test => {
            results[test.testID] = {
                type: test.type,
                output: test.TestOutputs.map(output => ({
                    timestamp: output.timestamp,
                    message: output.message
                }))
            };
        });
        return results;
    } catch (error) {
        logger.error('Error fetching test results:', error);
        throw error;
    }
};