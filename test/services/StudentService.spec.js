const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const student = require('../../models/student');

describe('student service', function () {

    const subject = require('../../services/StudentService');

    describe('insert or update student', function () {

        const inputEmail = 'inputemail@sample.com';

        let studentModelSpy;

        before(function () {
            studentModelSpy = sinon.spy(student, 'findOneAndUpdate');
        });

        after(function () {
            student.findOneAndUpdate.restore();
        });

        it('should only call model update method once', function () {
            subject.insertOrUpdate(inputEmail);

            expect(studentModelSpy.calledOnce).to.be.true;
        });

        it('should first find if a student model with input email exists', function () {
            subject.insertOrUpdate(inputEmail);

            expect(studentModelSpy.args[0][0].email).to.equal(inputEmail);
        });

        it('should supply a student model with input email for insertion', function () {
            subject.insertOrUpdate(inputEmail);

            expect(studentModelSpy.args[0][1].email).to.equal(inputEmail);
        });

        it('should use upsert flag', function () {
            subject.insertOrUpdate(inputEmail);

            expect(studentModelSpy.args[0][2].upsert).to.be.true;
        });

        it('should use upsert flag to enable update or insert feature', function () {
            subject.insertOrUpdate(inputEmail);

            expect(studentModelSpy.args[0][2].upsert).to.be.true;
        });

        it('should use new flag to ask for updated model to be returned', function () {
            subject.insertOrUpdate(inputEmail);

            expect(studentModelSpy.args[0][2].new).to.be.true;
        });

        it('should use runValidators flag to make sure model is validated', function () {
            subject.insertOrUpdate(inputEmail);

            expect(studentModelSpy.args[0][2].runValidators).to.be.true;
        });
    });
});
