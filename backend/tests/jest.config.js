module.exports = {
    setupFilesAfterEnv: ["./jest.setup.js"],
    testMatch: ["**/tests/api/*.test.js", "**/tests/database/*.test.js"],
    testPathIgnorePatterns: ["/node_modules/", "./tests/scripts/"],
    testTimeout: 10000,
    injectGlobals: true
};