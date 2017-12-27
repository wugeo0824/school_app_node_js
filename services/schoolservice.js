const Student = require('../models/student');
const StudentService = require('./StudentService');
const TeacherService = require('./TeacherService');
const SchoolHelper = require('../utils/SchoolHelper');
const Promise = require('bluebird');


function findMentionedStudents(notification) {
    const mentionedEmailsInNotification = notification.split(' ').filter(word => SchoolHelper.validateEmail(word));

    return Promise.map(
        mentionedEmailsInNotification,
        mentionedEmail => Student.findOne({ email: mentionedEmail })
    ).then(mentionedStudents => SchoolHelper.mapNonSuspendedStudentsIntoEmails(mentionedStudents));
}

function findTeachersStudents(teacherEmail) {
    return TeacherService.findOneWithStudentsPopulated(teacherEmail)
        .then((teacher) => {
            if (!teacher) {
                return [];
            }

            return SchoolHelper.mapNonSuspendedStudentsIntoEmails(teacher.students);
        });
}

const SchoolService = {

    insertOrUpdateTeacherWithStudents(studentEmails, teacherEmail) {
        return Promise.map(
            studentEmails,
            inputEmail => StudentService.insertOrUpdate(inputEmail)
        ).then(students => TeacherService.insertOrUpdate(teacherEmail, students));
    },

    retrieveStudentsUnderTeacher(teacherEmail) {
        return TeacherService.findOneWithStudentsPopulated(teacherEmail)
            .then((teacher) => {
                if (!teacher) {
                    return Promise.reject(new Error('this teacher email does not exist'));
                }
                return Promise.map(teacher.students, student => student.email);
            });
    },

    findCommonStudentsBetweenTwoTeachers(teacher1, teacher2) {
        return Promise.all([
            TeacherService.findOneWithStudentsPopulated(teacher1),
            TeacherService.findOneWithStudentsPopulated(teacher2),
        ]).then((results) => {
            if (!results[0] || !results[1]) {
                return Promise.reject(new Error('teacher does not exist'));
            }

            const emailList1 = results[0].students.map(student => student.email);
            const emailList2 = results[1].students.map(student => student.email);

            return emailList1.filter(item => emailList2.includes(item));
        });
    },

    suspendStudent(studentEmail) {
        return Student.findOne({ email: studentEmail })
            .then((student) => {
                if (!student) {
                    return Promise.reject(new Error('student does not exist'));
                }
                return student.suspend();
            });
    },

    retrieveStudentsForNotification(teacherEmail, notification) {
        const findMentionedStudentsPromise = findMentionedStudents(notification);
        const findTeacherStudentsPromise = findTeachersStudents(teacherEmail);

        return Promise.all([
            findMentionedStudentsPromise,
            findTeacherStudentsPromise,
        ]).then((results) => {
            const mentionedEmails = results[0];
            const studentEmails = results[1];

            return Array.from(new Set(mentionedEmails.concat(studentEmails)));
        });
    },
};

module.exports = SchoolService;
