const chai = require('chai');
const expect = chai.expect;

const mongoose = require('mongoose');

const StudentModel = require('../../models/Student');

describe('student model', function () {
    before(function (done) {
        mongoose.disconnect(function() {
            mongoose.connect('mongodb://mongo:27017/test', { useMongoClient: true });
            mongoose.connection.once('connected', () => {
                done();
            }).on('error', function (error) {
                console.warn(error)
            });
        });
    });

    after(function (done) {
        mongoose.disconnect(function(done) {
            done();
        });
    });
    
    beforeEach(function (done) {
        StudentModel.remove({}, (err) => {
            done();
        });
    });

    it('should not save without an email', function (done) {
        const studentWithoutEmail = new StudentModel();
        studentWithoutEmail.save(function (err, student) {
            expect(err).to.exist;
            expect(err.errors.email.name).to.equal('ValidatorError');
            done();
        });
    });

    it('should not save if email is invalid', function (done) {
        const studentInvalidEmail = new StudentModel({ email: 'invalid email' });
        studentInvalidEmail.save(function (err, student) {
            expect(err).to.exist;
            expect(err.errors.email.name).to.equal('ValidatorError');
            done();
        });
    });

    it('should save if email valid', function (done) {
        const validEmail = "valid@email.this";
        const studentValid = new StudentModel({ email: validEmail });

        studentValid.save(function (err, student) {
            expect(err).to.not.exist;
            expect(student.email).to.equal(validEmail);
            done();
        });
    });

    it('should not be suspended by default', function (done) {
        const validEmail = "valid@email.this";
        const studentValid = new StudentModel({ email: validEmail });

        studentValid.save(function (err, student) {
            expect(student.suspended).to.equal(false);
            done();
        });
    });

    it('should be suspended when suspend is called', function (done) {
        const validEmail = "valid@email.this";
        const studentValid = new StudentModel({ email: validEmail });

        studentValid.save()
            .then(function (student) {
                expect(student.suspended).to.equal(false);
                return student.suspend();
            }).then(function (student) {
                expect(student.suspended).to.equal(true);
                done();
            });
    });
});
