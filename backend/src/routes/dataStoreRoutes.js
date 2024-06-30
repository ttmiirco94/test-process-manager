const express = require('express');
const router = express.Router();
const createCustomLogger = require('../config/logger');
const dataStoreController = require('../controllers/dataStoreController');

const logger = createCustomLogger('dataStoreRoutes.js');

router.get('/', dataStoreController.getAllDataStoreRecords);
router.get('/:testID', dataStoreController.getDataStoreForTest);
router.get('/:testID/:key', dataStoreController.getSpecificDataStoreForTest);
router.post('/:testID', (req, res) => { dataStoreController.newDataStoreForTest(req, res, req.app.get('wss')); });
router.delete('/:testID', (req, res) => { dataStoreController.deleteDataStoreForTest(req, res, req.app.get('wss')); });

module.exports = router;