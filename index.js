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

function sendResponse(res, body, status) {
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	if (status) {
		res.sendStatus(status);
	}
	res.end(body);
}

function checkGitHubRepoAndBranch(payload) {
	var result = false;

	if (payload.repository.name === GIT_REPO) {
		result = payload.commits
			.some(function (c) {
				return c.branch == GIT_BRANCH;
			});
	}

	return result;
}

function isObject(obj) {
	return !!obj && typeof obj === 'object';
}

app.post(HTTP_PATH, function (req, res) {
	var payload = req.body;

	log ('Check request');
	if (isObject(payload) && isObject(payload.repository) && isObject(payload.commits)) {
		if (checkGitHubRepoAndBranch(payload)) {
			log('Run task');
			exec(BUILD_TASK, function (err, stdout, stderr) {
				log(stderr);
			});
		}

		sendResponse(res, 'OK\n');
	} else {
		sendResponse(res, 'Bad Request\n', 400);
	}
});

log('Started');

app.listen(HTTP_PORT);
