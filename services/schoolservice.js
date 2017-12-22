const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const SchoolHelper = require('../utils/SchoolHelper');

const Promise = require('bluebird');

const SchoolService = {
    insertOrUpdateTeacherWithStudents(studentEmails, teacherEmail) {
        return Promise.map(studentEmails, function (inputEmail) {
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
                });
    },

    retrieveStudentsUnderTeacher(teacherEmail) {
        return Teacher.findOne({ 'email': teacherEmail })
                .populate('students')
                .then(function (teacher) {
                    if (!teacher) {
                        return Promise.reject(new Error("this teacher email does not exist"));
                    }
                    return Promise.map(teacher.students, function (student) {
                        return student.email;
                    });
                });
    },

    findCommonStudentsBetweenTwoTeachers(teacher1, teacher2) {
        return Promise.all([
                    Teacher.findOne({ 'email': teacher1 }).populate('students'),
                    Teacher.findOne({ 'email': teacher2 }).populate('students')
                ]).then(function (results) {
                    if (!results[0] || !results[1]) {
                        return Promise.reject(new Error("teacher does not exist"));
                    }

                    const emailList1 = results[0].students.map(student => student.email);
                    const emailList2 = results[1].students.map(student => student.email);

                    return emailList1.filter(item => emailList2.includes(item));
                });
    },

    suspendStudent(studentEmail) {
        return Student.findOne({ email: studentEmail })
                .then(function (student) {
                    if (!student) {
                        return Promise.reject(new Error("student does not exist"));
                    }
                    return student.suspend();
                });
    },

    retrieveStudentsForNotification(teacherEmail, notification) {
        const mentioned = notification.split(" ").filter(function (word) {
            return SchoolHelper.validateEmail(word);
        });

        var findMentionedStudents = Promise.map(mentioned, function (studentEmail) {
                return Student.findOne({ email: studentEmail })
            }).then(function (mentionedStudents) {
                return SchoolHelper.mapNonSuspendedStudentsIntoEmails(mentionedStudents);
            });

        var findTeacherStudents = Teacher.findOne({ email: teacherEmail })
            .populate('students')
            .then(function (teacher) {
                if (!teacher) {
                    return [];
                }

                return SchoolHelper.mapNonSuspendedStudentsIntoEmails(teacher.students);
            });

        return Promise.all([
                    findMentionedStudents,
                    findTeacherStudents
                ]).then(function (results) {
                    const mentioned = results[0];
                    const studentEmails = results[1];
        
                    return Array.from(new Set(mentioned.concat(studentEmails)));
                });
    }
}
    
module.exports = SchoolService;