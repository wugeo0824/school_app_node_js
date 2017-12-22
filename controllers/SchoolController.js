const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const SchoolHelper = require('../utils/SchoolHelper');
const ResponseHelper = require('../utils/ResponseHelper');
const badRequest = ResponseHelper.badRequest;
const handleError = ResponseHelper.handleError;
const successWithJsonBody = ResponseHelper.successWithJsonBody;

const schoolService = require('../services/schoolservice');

const Promise = require('bluebird');

const SchoolController = {

    Register(req, res) {
        const teacherEmail = req.body.teacher;
        const studentEmails = req.body.students;

        if (!teacherEmail) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        if (!studentEmails || studentEmails.length < 1) {
            badRequest(res, "must include at least one student email");
            return;
        }

        schoolService.insertOrUpdateTeacherWithStudents(studentEmails, teacherEmail)
            .then(function (teacher) {
                successWithJsonBody(res);
            }).catch(function (err) {
                handleError(400, err, res);
            });
    },

    Retrieve(req, res) {
        const teacherEmail = req.body.email;

        if (!teacherEmail) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        schoolService.retrieveStudentsUnderTeacher(teacherEmail)
            .then(function (resultEmails) {
                successWithJsonBody(res, { students: resultEmails });
            }).catch(function (err) {
                handleError(400, err, res);
            });
    },

    CommonStudents(req, res) {
        const teachers = req.body.teachers;

        if (!teachers || teachers.length != 2 || teachers[0] == teachers[1]) {
            badRequest(res, "two different teacher emails are needed");
            return;
        }

        schoolService.findCommonStudentsBetweenTwoTeachers(teachers[0], teachers[1])
            .then(function (commonList) {
                successWithJsonBody(res, { students: commonList });
            }).catch(function (err) {
                handleError(400, err, res);
            });
    },

    Suspend(req, res) {
        const studentEmail = req.body.student;

        if (!studentEmail) {
            badRequest(res, "student email can't be blank");
            return;
        }

        schoolService.suspendStudent(studentEmail)
            .then(function () {
                successWithJsonBody(res);
            }).catch(function (err) {
                handleError(400, err, res);
            });
    },

    RetrieveForNotifications(req, res) {
        const teacherEmail = req.body.teacher;
        const notification = req.body.notification;

        if (!teacherEmail) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        if (!notification) {
            badRequest(res, "notification can't be blank");
            return;
        }

        schoolService.retrieveStudentsForNotification(teacherEmail, notification)
            .then(function (uniqueStudents) {
                successWithJsonBody(res, { students: uniqueStudents });
            }).catch(function (err) {
                handleError(400, err, res);
            });
    }
}

module.exports = SchoolController