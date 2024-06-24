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
            logger.info('No tests found.');
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

exports.findAndUpdateTestByTestID = async (testID, updatedData) => {
    try {
         const test = await Test.findByPk(testID);
        if (!test) {
            logger.info(`Test with ID ${testID} not found`);
            return;
        }
        logger.info(`Updating test ${testID} with new values: ${JSON.stringify(updatedData)}`);
        await test.update(updatedData);
        await test.save();
    } catch (error) {
        logger.error(`Error updating test: ${testID}`, error);
        throw error;
    }
};