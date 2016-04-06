#!/usr/bin/env node

var HTTP_PATH = '/ci-hook/';
var HTTP_PORT = 52314;
var GIT_REPO = 'UPDATE_REPO_SLUG_HERE';
var GIT_BRANCH = 'master';
var BUILD_TASK = './task.sh';

var express = require('express');
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var log = require('util').log;

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function sendResponse(res, body) {
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.end(body);
}

app.post(HTTP_PATH, function (req, res) {
	var isRequiredBranch;
	var payload;

	try {
		payload = JSON.parse(req.params.payload);
	} catch(ex) {

	}

	console.log('==============');
	console.log(payload);
	console.log('==============');
	console.log(req.body);
	console.log('==============');

	if (payload.repository.slug == GIT_REPO) {
		isRequiredBranch = payload.commits
			.some(function (c) {
				return c.branch == GIT_BRANCH;
			});

		if (isRequiredBranch) {
			log('Run task');
			exec(BUILD_TASK, function (err, stdout, stderr) {
				log(stderr);
			});
		}
	}

	sendResponse(res, 'OK\n');
});

log('Started');

app.listen(HTTP_PORT);
