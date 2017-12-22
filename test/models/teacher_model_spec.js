var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');

var TeacherModel = require('../../models/Teacher');
var StudentModel = require('../../models/Student');

describe('teacher model', function () {

    before(function (done) {
        mongoose.disconnect();
        mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
        mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
        mongoose.connection.once('connected', () => {
            done();
        })
    });

    after(function () {
        mongoose.disconnect();
    });

    beforeEach(function (done) {
        TeacherModel.remove({}, (err) => {
            StudentModel.remove({}, (err) => {
                done();
            });
        });
    });

    it('should not save without an email', function (done) {
        var teacherWithoutEmail = new TeacherModel();
        teacherWithoutEmail.save(function (err, teacher) {
            expect(err).to.exist;
            expect(err.errors.email.name).to.equal('ValidatorError');
            done();
        });
    });

    it('should not save if email is invalid', function (done) {
        var teacherInvalidEmail = new TeacherModel({ email: 'invalid email' });
        teacherInvalidEmail.save(function (err, teacher) {
            expect(err).to.exist;
            expect(err.errors.email.name).to.equal('ValidatorError');
            done();
        });
    });

    it('should save if email valid', function (done) {
        const validEmail = "valid@email.this";
        var teacherValid = new TeacherModel({ email: validEmail });

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
        var teacherValid = new TeacherModel({ email: validEmail, students: [ student ] });

        teacherValid.save(function (err, teacher) {
            expect(err).to.not.exist;
            expect(teacher.email).to.equal(validEmail);
            expect(teacher.students[0].email).to.equal(studentEmail);
            done();
        });
    });
});