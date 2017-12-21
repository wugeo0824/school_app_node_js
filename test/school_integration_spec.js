var request = require('request');
var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');

var TeacherModel = require('../models/Teacher')

describe("integration tests", function () {

    describe("register", function () {

        const url = "http://localhost:3000/api/register";

        it("should return false if teacher param is not included", function (done) {
            var req = { form: { students: ["student@email.com"] } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                done();
            });
        });

        it("should return false if invalid teacher email", function (done) {
            var req = { form: { teacher: "invalid email", students: ["student@email.com"] } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                done();
            });
        });

        it("should return false if students param is not included", function (done) {
            var req = { form: { teacher: "invalid email" } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("must include at least one student email");
                done();
            });
        });

        it("should return false if there are zero student emails", function (done) {
            var req = { form: { teacher: "invalid email", students: [] } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("must include at least one student email");
                done();
            });
        });

        it("should return success if valid email", function (done) {
            var req = { form: { teacher: "teacher@email.com", students: ["student@email.com"] } };
            request.post(url, req, function (error, response, body) {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

    });

    describe("retrieve", function() {

        const url = "http://localhost:3000/api/retrieve";

        it("should return false if email param is not included", function (done) {
            request.get(url, {}, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                done();
            });
        });

        it("should return false if invalid email", function (done) {
            var req = { form: { email: "invalid email" } };
            request.get(url, req, function (error, response, body) {
                console.log(body)
                expect(response.statusCode).to.equal(404);
                expect(body).to.include.string('"success":false');
                done();
            });
        });
    })

});