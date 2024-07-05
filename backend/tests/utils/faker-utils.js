const { faker, fakerDE_CH } = require('@faker-js/faker');

class FakerUtils {
    static faker = faker;
}

class FakerUtilsCH {
    static faker = fakerDE_CH;
}

module.exports = { FakerUtils, FakerUtilsCH };