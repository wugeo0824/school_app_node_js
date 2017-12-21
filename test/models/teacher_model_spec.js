var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');

// var TeacherModel = require('../../models/Teacher')

describe('teacher model', function () {

    var TeacherModel;

    beforeEach(function (done) {
        mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
        mongoose.connection.once('connected', () => {
            mongoose.connection.db.dropDatabase();

            // require('..../models').registerModels();
            // This is the right model because ^registerModels set it up for us.
            TeacherModel = require('../../models/Teacher');
            done();
        });
    });

    afterEach(function (done) {
        mongoose.disconnect();
        done();
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
        const validEmail = 'valid@email.this'
        var teacherValid = new TeacherModel({ email: validEmail });
        teacherValid.save(function (err, teacher) {
            expect(err).to.not.exist;
            expect(teacher.email).to.equal(validEmail)
            done();
        });
    });

});