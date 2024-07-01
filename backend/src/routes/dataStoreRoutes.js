const express = require('express');
const router = express.Router();
const createCustomLogger = require('../config/logger');
const dataStoreController = require('../controllers/dataStoreController');

const logger = createCustomLogger('dataStoreRoutes.js');

router.get('/:forUI', (req, res) => { dataStoreController.getAllDataStoreRecords(req, res); });
router.get('/find/:testID', dataStoreController.getDataStoreForTest);
router.get('/find/:testID/:key', dataStoreController.getSpecificDataStoreForTest);
router.post('/store/:testID', (req, res) => { dataStoreController.newDataStoreForTest(req, res, req.app.get('wss')); });
router.delete('/delete/:testID', (req, res) => { dataStoreController.deleteDataStoreForTest(req, res, req.app.get('wss')); });

module.exports = router;