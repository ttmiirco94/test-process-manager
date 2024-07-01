const request = require("supertest");
const {FakerUtils} = require("../utils/faker-utils");

const createDataStoreRecords = async () => {
    const baseURL = 'http://localhost:3001';
    const setAmountOfNewDataStoreRecords = 20;

    for(let i = 0; i < setAmountOfNewDataStoreRecords; i++) {
        try {
            let testID = 'TST-' + FakerUtils.faker.number.int(1000);
            let fakerKey = FakerUtils.faker.system.fileName();
            let fakerValue = FakerUtils.faker.company.catchPhrase();

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

if (require.main === module) {
    createDataStoreRecords();
}

module.exports = { createDataStoreRecords };