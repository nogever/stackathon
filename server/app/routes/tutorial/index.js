'use strict';
var VIDEOS = require('./videos.json');

var router = require('express').Router();
module.exports = router;

router.get('/vid', function (req, res) {
    res.send(VIDEOS);
});