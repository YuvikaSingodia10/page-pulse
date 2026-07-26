const express = require("express");
const { auditWebsite } = require("../controllers/audit.controller");

const router = express.Router();

router.post("/", auditWebsite);

module.exports = router;