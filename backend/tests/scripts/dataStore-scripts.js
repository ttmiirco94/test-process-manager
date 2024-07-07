const request = require("supertest");
const {FakerUtilsCH} = require("../utils/faker-utils");

function formatDate(inputDate) {
    const day = String(inputDate.getDate()).padStart(2, '0');
    const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = inputDate.getFullYear();

    return `${day}.${month}.${year}`;
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
            "birthday": formatDate(FakerUtilsCH.faker.date.birthdate({ min: 18, max: 65, mode: 'age' })),
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

module.exports = { createDataStoreRecordsTestDataWithFaker };