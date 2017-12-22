var Teacher = require('../models/Teacher');
var Student = require('../models/Student');

var Promise = require('bluebird');

var SchoolController = {

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

        Promise.map(studentEmails, function (inputEmail) {
            const student = new Student({
                _id: inputEmail,
                email: inputEmail
            });
            return Student.findOneAndUpdate({ 'email': inputEmail }, student, { upsert: true, runValidators: true })

        }).then(function (students) {
            const newTeacher = new Teacher({
                _id: teacherEmail,
                email: teacherEmail,
                students: students,
            });

            return Teacher.findOneAndUpdate({ 'email': teacherEmail }, newTeacher, { upsert: true, runValidators: true })

        }).then(function (teacher) {
            res.json({
                success: true
            })
        }).catch(function (err) {
            handleError(400, err, res);
        });
    },

    Retrieve(req, res) {
        var teacherEmail = req.body.email;

        if (!teacherEmail) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        Teacher.findOne({ 'email': teacherEmail })
            .populate('students')
            .then(function (teacher) {
                if (!teacher) {
                    badRequest(res, "this teacher email does not exist");
                    return;
                }
                return Promise.map(teacher.students, function (student) {
                    return student.email;
                });
            }).then(function (resultEmails) {
                res.json({
                    success: true,
                    students: resultEmails
                });
            }).catch(function (err) {
                handleError(400, err, res);
            });
    },

    CommonStudents(req, res) {
        var teachers = req.body.teachers;

        if (!teachers || teachers.length != 2 || teachers[0] == teachers[1]) {
            badRequest(res, "two different teacher emails are needed");
            return;
        }

        Promise.all([
            Teacher.findOne({ 'email': teachers[0] }).populate('students'),
            Teacher.findOne({ 'email': teachers[1] }).populate('students')
        ]).then(function (results) {
            if (!results[0] || !results[1]) {
                badRequest(res, "teacher does not exist");
                return;
            }

            var emailList1 = results[0].students.map(student => student.email);
            var emailList2 = results[1].students.map(student => student.email);

            return emailList1.filter(item => emailList2.includes(item));
        }).then(function (commonList) {
            res.json({
                success: true,
                students: commonList
            });
        }).catch(function (err) {
            handleError(400, err, res);
        });
    },

    Suspend(req, res) {
        var studentEmail = req.body.student;

        if (!studentEmail) {
            badRequest(res, "student email can't be blank");
            return;
        }

        Student.findOne({ email: studentEmail })
            .then(function (student) {
                if (!student) {
                    badRequest(res, "student does not exist");
                    return;
                }
                return student.suspend();
            }).then(function () {
                res.json({
                    success: true
                })
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

        const findMentionedStudents = new Promise(function (resolve, reject) {
            var mentioned = notification.split(" ").filter(function (word) {
                return validateEmail(word);
            });
            resolve(mentioned);
        }).then(function (mentioned) {
            console.log("MENTIONED" + mentioned);
            return Promise.map(mentioned, function (studentEmail) {
                return Student.findOne({ email: studentEmail })
            })
        }).then(function (mentionedStudents) {
            return mapNonSuspendedStudentsIntoEmails(mentionedStudents);
        });

        const findTeacherStudents = Teacher.findOne({ email: teacherEmail })
            .populate('students')
            .then(function (teacher) {
                if (!teacher) {
                    return [];
                }

                return mapNonSuspendedStudentsIntoEmails(teacher.students);
            });

        Promise.all([
            findMentionedStudents,
            findTeacherStudents
        ]).then(function (results) {
            const mentioned = results[0];
            const studentEmails = results[1];

            const unique = Array.from(new Set(mentioned.concat(studentEmails)));

            res.json({
                success: true,
                students: unique
            })
        }).catch(function (err) {
            handleError(400, err, res);
        });
    }
}

function badRequest(res, msg) {
    res.status(400)
        .json({
            success: false,
            message: msg
        });
}

function handleError(statusCode, err, res) {
    res.status(statusCode)
        .json({
            success: false,
            message: err.message
        });
}

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function mapNonSuspendedStudentsIntoEmails(students) {
    return students
        .filter(student => filterSuspendedStudent(student))
        .map(student => student.email);
}

function filterSuspendedStudent(student) {
    if (student) {
        return !student.suspended
    }
    return false;
}

module.exports = SchoolController