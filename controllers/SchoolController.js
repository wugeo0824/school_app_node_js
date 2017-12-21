var Teacher = require('../models/Teacher');
var Student = require('../models/Student');

var SchoolController = {
    Register(req, res) {
        const teacherEmail = req.body.teacher;
        const studentEmails = req.body.students;

        if (!teacherEmail) {
            badRequest(res, "teacher email can't be blank");
            return;
        }

        if (!studentEmails || studentEmails.length <= 0) {
            badRequest(res, "must include at least one student email");
            return;
        }

        var students = studentEmails.map(function (item) {
            var student = new Student({
                email: item
            });
            student.save();
            return student._id;
        })

        var newTeacher = new Teacher({
            _id: teacherEmail,
            email: teacherEmail,
            students: students,
        });

        Teacher.findOneAndUpdate(
            { 'email': teacherEmail },
            newTeacher,
            { upsert: true, new: true, runValidators: true },
            function (err, teacher) {
                if (err) {
                    handleError(400, err, res);
                    return;
                }

                res.json({
                    success: true
                })
            }
        );
    },

    Retrieve(req, res) {
        var teacherEmail = req.query.email;

        if (!teacherEmail) {
            badRequest(res, "email can't be blank");
            return;
        }

        Teacher.findOne({ 'email': teacherEmail })
            .populate('students')
            .exec(function (err, teacher) {
                if (err) {
                    handleError(404, err, res);
                    return;
                }

                var studentEmails = teacher.students.map(item => item.email)

                res.json({
                    success: true,
                    students: studentEmails
                });
            });
    },
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

module.exports = SchoolController