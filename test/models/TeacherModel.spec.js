const chai = require('chai');
const expect = chai.expect;

const mongoose = require('mongoose');
const DB_URL = require('../../config/constants').DB_URL_TEST;

const TeacherModel = require('../../models/teacher');
const StudentModel = require('../../models/student');

describe('teacher model', function () {

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

    beforeEach(function (done) {
        TeacherModel.remove({}, (err) => {
            StudentModel.remove({}, (err) => {
                done();
            });
        });
    });

    it('should not save without an email', function (done) {
        const teacherWithoutEmail = new TeacherModel();
        teacherWithoutEmail.save(function (err, teacher) {
            expect(err).to.exist;
            expect(err.errors.email.name).to.equal('ValidatorError');
            done();
        });
    });

    it('should not save if email is invalid', function (done) {
        const teacherInvalidEmail = new TeacherModel({ email: 'invalid email' });
        teacherInvalidEmail.save(function (err, teacher) {
            expect(err).to.exist;
            expect(err.errors.email.name).to.equal('ValidatorError');
            done();
        });
    });

    it('should save if email valid', function (done) {
        const validEmail = "valid@email.this";
        const teacherValid = new TeacherModel({ email: validEmail });

        teacherValid.save(function (err, teacher) {
            expect(err).to.not.exist;
            expect(teacher.email).to.equal(validEmail)
            done();
        });
    });

    it('should save with correct params', function (done) {
        const validEmail = "valid@email.this";
        const studentEmail = "student@email.com";
        const student = new StudentModel({ email: studentEmail })
        const teacherValid = new TeacherModel({ email: validEmail, students: [ student ] });

        teacherValid.save(function (err, teacher) {
            expect(err).to.not.exist;
            expect(teacher.email).to.equal(validEmail);
            expect(teacher.students[0].email).to.equal(studentEmail);
            done();
        });
    });
});