const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.put('/selenium/:testID', (req, res) => { testController.runSeleniumTest(req, res, req.app.get('wss')); });

router.put('/playwright/:testID', (req, res) => { testController.runPlaywrightTest(req, res, req.app.get('wss')); });

router.put('/uft/:testID', (req, res) => { testController.runUFTTest(req, res, req.app.get('wss')); });

router.get('/results/:testID', testController.getTestResults);

router.get('/results/', testController.getAllTestResults);

router.delete('/:testID', (req, res) => { testController.deleteTest(req, res, req.app.get('wss')); });

router.delete('/', (req, res) => { testController.deleteAllTests(req, res, req.app.get('wss')); });

module.exports = router;