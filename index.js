#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var log = require('util').log;

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/ci-hook/', function (req, res) {
	var payload = JSON.parse(req.param('payload'));

	if (payload.repository.slug == 'UPDATE_REPO_SLUG_HERE') {
		var isRequiredBranch = payload.commits
			.some(function (c) {
				return c.branch == 'master'; // branch to track
			});
		if (isRequiredBranch) {
			log('Run task');
			exec('./task.sh', function (err, stdout, stderr) {
				log(stderr);
			});
		}
	}

	var body = 'OK\n';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.end(body);
});

log('Started');

app.listen(52314); // CI server port
