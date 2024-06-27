const testDataController = require("../controllers/testDataController");
const express = require('express');
const router = express.Router();

router.get('/:testID', testDataController.getTestData);
router.post('/:testID', (req, res) => { testDataController.storeTestData(req, res, req.app.get('wss')); });
router.delete('/:testID', (req, res) => { testDataController.deleteTestData(req, res, req.app.get('wss')); });

module.exports = router;