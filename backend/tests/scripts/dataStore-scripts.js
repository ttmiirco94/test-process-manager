const request = require("supertest");
const {FakerUtilsCH} = require("../utils/faker-utils");

const createDataStoreRecords = async () => {
    const baseURL = 'http://localhost:3001';
    const setAmountOfNewDataStoreRecords = 20;

    for(let i = 0; i < setAmountOfNewDataStoreRecords; i++) {
        try {
            let testID = 'TST-' + FakerUtilsCH.faker.number.int(1000);
            let fakerKey = FakerUtilsCH.faker.system.fileName();
            let fakerValue = FakerUtilsCH.faker.company.catchPhrase();

            //let newRequest = await request(baseURL);

            const res = request(baseURL)
                .post(`/api/data-store/store/${testID}`)
                .send({key: fakerKey, value: fakerValue})
                .auth('admin', 'admin123!')
                .then(res => {
                    console.log(res)
                    if(res.statusCode !== 200) {
                        console.error(`Received statusCode: ${res.statusCode} with message: ${res.body}`);
                        process.exit(1);
                    }
                })

            console.log(`Successfully send request ${i + 1} with testID: ${testID}, key: ${fakerKey} and value: ${fakerValue}`);

        } catch(err) {
            console.log(err);
            process.exit(1);
        }
    }
}

const createDataStoreRecordsTestDataWithFaker = async () => {
    const baseURL = 'http://localhost:3001';
    const setAmountOfNewDataStoreRecords = 5;

    let ii = 1300;
    for(let i = 0; i < setAmountOfNewDataStoreRecords; i++) {
        let testData = {
            "userName": FakerUtilsCH.faker.internet.userName(),
            "passWord": FakerUtilsCH.faker.internet.password({ length: 20 }),
            "firstname": FakerUtilsCH.faker.person.firstName(),
            "lastName": FakerUtilsCH.faker.person.lastName(),
            "birthday": FakerUtilsCH.faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
            "street": FakerUtilsCH.faker.location.street(),
            "houseNo": FakerUtilsCH.faker.number.int(100),
            "zip": FakerUtilsCH.faker.number.int({ min: 1000, max: 9999 }),
            "city": FakerUtilsCH.faker.location.city(),
            "iban": FakerUtilsCH.faker.finance.iban({ formatted: true, countryCode: 'CH'})
        };

        Object.entries(testData).forEach(([key, value]) => {
            const res = request(baseURL)
                .post(`/api/data-store/store/TST-${ii}`)
                .send({ key: key, value: value })
                .auth('admin', 'admin123!')
                .then(async res => {
                    //console.log(res);
                    if (res.statusCode !== 200) {
                        await console.error(`Received statusCode: ${res.statusCode} with message: ${JSON.stringify(res.body)}`);
                        process.exitCode = 1;
                    } else if (res.statusCode === 200) {
                        await console.log('Request send, Response is 200.');
                    }
                })
                .catch(err => {
                    console.error(`Error occurred: ${err.message}`);
                    process. exitCode = 1;
                });
        });
        ii++;
    }
    process.exitCode = 0;
}

if (require.main === module) {
    //createDataStoreRecords();
    (async () => {
        await createDataStoreRecordsTestDataWithFaker();
    })();
    process.exitCode = 0;
}

module.exports = { createDataStoreRecords, createDataStoreRecordsTestDataWithFaker };