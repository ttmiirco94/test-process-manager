const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.put('/selenium/:testID', (req, res) => { testController.runSeleniumTest(req, res, req.app.get('wss')); });

router.put('/playwright/:testID', (req, res) => { testController.runPlaywrightTest(req, res, req.app.get('wss')); });

router.put('/uft/:testID', (req, res) => { testController.runUFTTest(req, res, req.app.get('wss')); });

router.get('/results/:testID', testController.getTestResults);

router.delete('/:testID', (req, res) => { testController.deleteTest(req, res, req.app.get('wss')); });

router.delete('/', (req, res) => { testController.deleteAllTests(req, res, req.app.get('wss')); });

router.get('/test-data/:testID', testController.getTestData);

router.post('/test-data/:testID', testController.storeTestData);

router.delete('/test-data/:testID', testController.deleteTestData);

//TODO: in server.js implement 2. route with api/test-data/, then split this file in 2 (tests/test-data)

module.exports = router;