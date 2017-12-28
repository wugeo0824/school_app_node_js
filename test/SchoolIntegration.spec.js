const request = require('request');
const chai = require('chai');

const { expect } = chai;

const mongoose = require('mongoose');
const DB_URL = require('../config/constants').DB_URL_TEST;

const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');

mongoose.Promise = require('bluebird');

describe("integration tests", function () {

    before(function (done) {
        mongoose.disconnect(function() {
            mongoose.connect(DB_URL, { useMongoClient: true });
            mongoose.connection.once('connected', () => {
                done();
            }).on('error', function (error) {
                console.warn(error)
            });
        });
    });

    after(function (done) {
        mongoose.disconnect(function() {
            done();
        });
    });

    afterEach(function (done) {
        TeacherModel.remove({}, (err) => {
            StudentModel.remove({}, (err) => {
                done();
            });
        });
    })

    describe("register", function () {
        const url = "http://localhost:3000/api/register";

        it("should return false if teacher param is blank", function (done) {
            const req = { form: { students: ["student@email.com"] } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("teacher email can't be blank");
                done();
            });
        });

        it("should return false if invalid teacher email", function (done) {
            const req = { form: { teacher: "invalid email", students: ["student@email.com"] } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                done();
            });
        });

        it("should return false if students param is blank", function (done) {
            const req = { form: { teacher: "invalid email" } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("must include at least one student email");
                done();
            });
        });

        it("should return false if there are zero student emails", function (done) {
            const req = { form: { teacher: "invalid email", students: [] } };
            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("must include at least one student email");
                done();
            });
        });

        it("should return success if valid email", function (done) {
            const req = { form: { teacher: "teacher@email.com", students: ["student@email.com"] } };
            request.post(url, req, function (error, response, body) {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

    });

    describe("retrieve", function () {
        const url = "http://localhost:3000/api/retrieve";
        const studentEmail = "student@email.com";
        const teacherEmail = "teacher@email.com";

        beforeEach(function (done) {
            const url = "http://localhost:3000/api/register";
            const req = { form: { teacher: teacherEmail, students: [studentEmail] } };

            request.post(url, req, function (error, response, body) {
                done();
            });
        });

        it("should return false if email param is blank", function (done) {
            request.post(url, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("teacher email can't be blank");
                done();
            });
        });

        it("should return false if invalid email", function (done) {
            const invalidEmail = "invalid email";
            const req = { form: { email: invalidEmail } }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("this teacher email does not exist");
                done();
            });
        });

        it("should return false if email does not exist", function (done) {
            const alienEmail = "alien_teacher@email.com";
            const req = { form: { email: alienEmail } }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("this teacher email does not exist");
                done();
            });
        });

        it("should return success with correct result", function (done) {
            const url = "http://localhost:3000/api/retrieve";
            const req = { form: { email: teacherEmail } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.include.string('"success":true');
                expect(body).to.include.string(studentEmail);
                done();
            });
        });
    });

    describe('common students', function () {
        const url = "http://localhost:3000/api/commonstudents";

        beforeEach(function (done) {
            const teacher1Req = {
                form: {
                    teacher: "teacher1@email.com",
                    students: ["student1@email.com", "student2@email.com", "student3@email.com"]
                }
            };
            const teacher2Req = {
                form: {
                    teacher: "teacher2@email.com",
                    students: ["student1@email.com", "student2@email.com", "student4@email.com"]
                }
            };
            const registerUrl = "http://localhost:3000/api/register";

            request.post(registerUrl, teacher1Req, function (error, response, body) {
                request.post(registerUrl, teacher2Req, function (error, response, body) {
                    done();
                });
            });
        });

        it("should return false if teachers param is blank", function (done) {
            request.post(url, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("two different teacher emails are needed");
                done();
            });
        });

        it("should return false if only one teacher email is provided", function (done) {
            const req = { form: { teachers: ["teacher1@email.com"] } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("two different teacher emails are needed");
                done();
            });
        });

        it("should return false if more than two teacher emails are provided", function (done) {
            const req = { form: { teachers: ["teacher1@email.com", "teacher2@email.com", "teacher3@email.com"] } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("two different teacher emails are needed");
                done();
            });
        });

        it("should return false if same teacher emails are provided", function (done) {
            const req = { form: { teachers: ["teacher1@email.com", "teacher1@email.com"] } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("two different teacher emails are needed");
                done();
            });
        });

        it("should return false if first email is not registered", function (done) {
            const req = { form: { teachers: ["teacher_alien1@email.com", "teacher2@email.com"] } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("teacher does not exist");
                done();
            });
        });

        it("should return false if second email is not registered", function (done) {
            const req = { form: { teachers: ["teacher1@email.com", "teacher_alien2@email.com"] } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("teacher does not exist");
                done();
            });
        });

        it("should return success with correct results", function (done) {
            const req = { form: { teachers: ["teacher1@email.com", "teacher2@email.com"] } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.include.string('"success":true');
                expect(body).to.include.string("student1@email.com");
                expect(body).to.include.string("student2@email.com");
                expect(body).to.not.include.string("student3@email.com");
                expect(body).to.not.include.string("student4@email.com");
                done();
            });
        });
    });

    describe('suspend', function () {
        const url = "http://localhost:3000/api/suspend";

        beforeEach(function (done) {
            const req = {
                form: {
                    teacher: "teacher1@email.com",
                    students: ["student1@email.com", "student2@email.com", "student3@email.com"]
                }
            };
            const registerUrl = "http://localhost:3000/api/register";

            request.post(registerUrl, req, function (error, response, body) {
                done();
            });
        });

        it("should return false if student email param is blank", function (done) {
            request.post(url, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("student email can't be blank");
                done();
            });
        });

        it("should return false if student email is invalid", function (done) {
            const req = { form: { student: "invalid student email" } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("student does not exist");
                done();
            });
        });

        it("should return false if student email is invalid", function (done) {
            const req = { form: { student: "student_mars@email.com" } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("student does not exist");
                done();
            });
        });

        it("should return success if student email exists", function (done) {
            const req = { form: { student: "student1@email.com" } };

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.include.string('"success":true');
                done();
            });
        });
    });

    describe('retrieve for notifications', function () {
        const url = "http://localhost:3000/api/retrievefornotifications";
        const suspendedStudent = "suspended@email.com";

        beforeEach(function (done) {
            const registerReq1 = {
                form: {
                    teacher: "teacher1@email.com",
                    students: [
                        "student1@email.com",
                        "student2@email.com",
                        "student3@email.com",
                        suspendedStudent
                    ]
                }
            };

            const registerReq2 = {
                form: {
                    teacher: "teacher2@email.com",
                    students: [
                        "student1@email.com",
                        "student4@email.com",
                        "student5@email.com"
                    ]
                }
            };

            const registerUrl = "http://localhost:3000/api/register";

            const suspendReq = { form: { student: suspendedStudent } }
            const suspendUrl = "http://localhost:3000/api/suspend";

            request.post(registerUrl, registerReq1, function (error, response, body) {
                request.post(registerUrl, registerReq2, function (error, response, body) {
                    request.post(suspendUrl, suspendReq, function (error, response, body) {
                        done();
                    });
                });
            });
        });

        it("should return false if teacher param is blank", function (done) {
            const req = { form: { notification: "Hello students! studentagnes@example.com" } }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("teacher email can't be blank");
                done();
            });
        });

        it("should return false if notification param is blank", function (done) {
            const req = { form: { teacher: "teacher1@email.com" } }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body).to.include.string('"success":false');
                expect(body).to.include.string("notification can't be blank");
                done();
            });
        });

        it("should return mentioned students even if teacher does not exist", function (done) {
            const req = {
                form: {
                    teacher: "teacher_alien@email.com",
                    notification: "Hello students! student1@email.com student4@email.com"
                }
            }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.include.string('"success":true');
                expect(body).to.include.string("student1@email.com");
                expect(body).to.include.string("student4@email.com");
                done();
            });
        });

        it("should not return non-existing students even if they are mentioned", function (done) {
            const req = {
                form: {
                    teacher: "teacher_alien@email.com",
                    notification: "Hello students! student1@email.com student_alien@sample.com"
                }
            }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.include.string('"success":true');
                expect(body).to.include.string("student1@email.com");
                expect(body).to.not.include.string("student_alien@sample.com");
                done();
            });
        });

        it("should not return suspended students even if they are mentioned", function (done) {
            const req = {
                form: {
                    teacher: "teacher_alien@email.com",
                    notification: `Hello students! student1@email.com ${suspendedStudent}`
                }
            }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.include.string('"success":true');
                expect(body).to.include.string("student1@email.com");
                expect(body).to.not.include.string(suspendedStudent);
                done();
            });
        });

        it("should not return suspended students even if they are registered under teacher", function (done) {
            const req = {
                form: {
                    teacher: "teacher1@email.com",
                    notification: "Hello students! student4@email.com"
                }
            }

            request.post(url, req, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.include.string('"success":true');
                expect(body).to.include.string("student1@email.com");
                expect(body).to.include.string("student2@email.com");
                expect(body).to.include.string("student3@email.com");
                expect(body).to.include.string("student4@email.com");
                expect(body).to.not.include.string("student5@email.com");
                expect(body).to.not.include.string(suspendedStudent);
                done();
            });
        });
    });
});
