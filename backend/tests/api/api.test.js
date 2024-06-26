const request = require('supertest');
const {FakerUtils} = require("../utils/faker-utils");
const baseURL = 'http://localhost:3001';

describe('API Tests for authorization', () => {
    it('correct credentials', async () => {
        const res = await request(baseURL)
            .get('/api/tests/results/')
            .auth('admin', 'admin123!');
        console.log(JSON.stringify(res.body));
        expect([200, 404]).toContain(res.status);
    });

    it('correct credentials', async () => {
        const res = await request(baseURL)
            .get('/api/tests/results/')
            .auth('admin', 'adminWrong123!');
        expect(res.status).toBe(401);
    });
});

describe('API Tests for /logs', () => {
    it('should get logs', async () => {
        const res = await request(baseURL)
            .get('/logs/v2')
            .auth('admin', 'admin123!');
        console.log(res.body);
        //expect(res.status).toBe(200);
    });
});

describe('API Tests for /data-store', () => {
    it('should post data store', async () => {
        const res = await request(baseURL)
            .post('/api/data-store/TST-1')
            .send({key: 'ÄÖO12', value: '991100!!'})
            .auth('admin', 'admin123!');
        //console.log(res.body);
        expect(res.status).toBe(200);
    });

    it('test', async () => {
        console.log(FakerUtils.faker.system.fileName());
    });
});