// test/test.js
import { expect } from 'chai';
import {initDb, Test, Output, sequelize, TestData} from '../database.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../test-data/database.sqlite');

before(async () => {
    await initDb();
});

after(async () => {
    await sequelize.close();
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }
});

describe('Database Operations', () => {
    before(async () => {
        // Insert example data
        await Test.create({
            id: 'TST-123',
            type: 'Playwright'
        });

        await Output.bulkCreate([
            {
                testId: 'TST-123',
                message: 'Running 1 test using 1 worker ok 1 [Chromium] testse2ee2e-test-process-managerspects105 TST-123 Example Playwright Test (29s) 1 passed (37s)',
                timestamp: '2024-06-20 00:52:01'
            },
            {
                testId: 'TST-123',
                message: '200:success',
                timestamp: '2024-06-20 00:52:01'
            }
        ]);

        await fillTableWithTestData();
    });

    it('should fetch the test data', async () => {
        const test = await Test.findByPk('TST-123');

        expect(test).to.not.be.null;
        expect(test.type).to.equal('Playwright');

        const outputs = await Output.findAll({ where: { testId: 'TST-123' } });
        expect(outputs).to.have.lengthOf(2);
        expect(outputs[0].message).to.include('Running 1 test');
        expect(outputs[1].message).to.equal('200:success');
    });

    it('should not find a non-existent test', async () => {
        const test = await Test.findByPk('NON_EXISTENT_ID');
        expect(test).to.be.null;
    });

    it('should throw an error when creating a Test without an id', async () => {
        try {
            await Test.create({
                type: 'Playwright'
            });
        } catch (error) {
            expect(error).to.exist;
            expect(error.name).to.equal('SequelizeValidationError');
        }
    });

    it('should throw an error when creating an Output with an invalid testId', async () => {
        try {
            await Output.create({
                testId: 'INVALID_ID',
                message: 'Invalid testId',
                timestamp: new Date()
            });
        } catch (error) {
            expect(error).to.exist;
            expect(error.name).to.equal('SequelizeForeignKeyConstraintError');
        }
    });

    it('should add new entry if testID does not exist', async () => {
        const testID = 'TST-321';
        const testData = { exampleKey1: "Example data for test_2 pushed" };

        await addOrUpdateTestData(testID, testData);

        const entry = await TestData.findOne({ where: { testID } });
        expect(entry).to.not.be.null;
        expect(entry.testData).to.deep.equal([testData]);
    });

    it('should update existing entry if testID exists', async () => {
        const testID = 'TST-321';
        const additionalTestData = { exampleKey2: "Additional data for test_2" };

        await addOrUpdateTestData(testID, additionalTestData);

        const entry = await TestData.findOne({ where: { testID } });
        expect(entry).to.not.be.null;
        expect(entry.testData).to.deep.equal([
            { exampleKey1: "Example data for test_2 pushed" },
            additionalTestData,
        ]);
    });
});

async function fillTableWithTestData() {
    const testDataSamples = [
        {
            testID: 'TST-123',
            testData: [
                {
                    exampleKey1: "Running 1 test using 1 worker ok 1 [Chromium] testse2ee2e-test-process-managerspects105 TST-123 Example Playwright Test (29s) 1 passed (37s)",
                    exampleKey2: "adawdwa223 12.05.94"
                },
                {
                    exampleKey1: "200:success"
                },
                {
                    exampleKey1: "200:success",
                    exampleKey2: "211111111111111114242424",
                    exampleKey3: "awdawdwadawdawdawd"
                }
            ]
        },
        {
            testID: 'TST-1234',
            testData: [
                {
                    exampleKey1: "Example data for test_2"
                }
            ]
        },
        {
            testID: 'TST-12345',
            testData: [
                {
                    exampleKey1: "Another example data for test_3"
                },
                {
                    exampleKey1: "More data for test_3"
                }
            ]
        }
    ];

    try {
        for (const data of testDataSamples) {
            await TestData.create(data);
        }
        console.log('Test data inserted successfully!');
    } catch (error) {
        console.error('Error inserting test data: ', error);
    }
}

async function addOrUpdateTestData(testID, newTestData) {
    try {
        const existingEntry = await TestData.findOne({ where: { testID } });

        if (existingEntry) {
            const updatedTestData = [...existingEntry.testData, newTestData];
            existingEntry.testData = updatedTestData;
            await existingEntry.save();
        } else {
            await TestData.create({ testID, testData: [newTestData] });
        }
    } catch (error) {
        console.error('Error in addOrUpdateTestData: ', error);
        throw error;
    }
}