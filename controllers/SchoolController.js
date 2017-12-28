const ResponseHelper = require('../utils/ResponseHelper');
const SchoolService = require('../services/SchoolService');

const { badRequest, handleError, successWithJsonBody } = ResponseHelper;

const SchoolController = {

    Register(req, res) {
        const { teacher, students } = req.body;

        if (!teacher) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        if (!students || students.length < 1) {
            badRequest(res, 'must include at least one student email');
            return;
        }

        SchoolService.insertOrUpdateTeacherWithStudents(students, teacher)
            .then(() => {
                successWithJsonBody(res);
            }).catch((err) => {
                handleError(400, err, res);
            });
    },

    Retrieve(req, res) {
        const { email } = req.body;

        if (!email) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        SchoolService.retrieveStudentsUnderTeacher(email)
            .then((resultEmails) => {
                successWithJsonBody(res, { students: resultEmails });
            }).catch((err) => {
                handleError(400, err, res);
            });
    },

    CommonStudents(req, res) {
        const { teachers } = req.body;

        if (!teachers || teachers.length !== 2 || teachers[0] === teachers[1]) {
            badRequest(res, 'two different teacher emails are needed');
            return;
        }

        SchoolService.findCommonStudentsBetweenTwoTeachers(teachers[0], teachers[1])
            .then((commonList) => {
                successWithJsonBody(res, { students: commonList });
            }).catch((err) => {
                handleError(400, err, res);
            });
    },

    Suspend(req, res) {
        const { student } = req.body;

        if (!student) {
            badRequest(res, "student email can't be blank");
            return;
        }

        SchoolService.suspendStudent(student)
            .then(() => {
                successWithJsonBody(res);
            }).catch((err) => {
                handleError(400, err, res);
            });
    },

    RetrieveForNotifications(req, res) {
        const { teacher, notification } = req.body;

        if (!teacher) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        if (!notification) {
            badRequest(res, "notification can't be blank");
            return;
        }

        SchoolService.retrieveStudentsForNotification(teacher, notification)
            .then((uniqueStudents) => {
                successWithJsonBody(res, { students: uniqueStudents });
            }).catch((err) => {
                handleError(400, err, res);
            });
    },
};

module.exports = SchoolController;
