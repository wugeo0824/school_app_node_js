const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const teacher = require('../../models/teacher');

describe('teacher service', function () {

    const subject = require('../../services/TeacherService');

    describe('insert or update teacher with students', function () {

        const inputEmail = 'teacher@sample.com';

        let teacherFindOneAndUpdateSpy;

        before(function () {
            teacherFindOneAndUpdateSpy = sinon.spy(teacher, 'findOneAndUpdate');
        });

        after(function () {
            teacher.findOneAndUpdate.restore();
        });

        it('should only call model update method once', function () {
            subject.insertOrUpdate(inputEmail);

            expect(teacherFindOneAndUpdateSpy.calledOnce).to.be.true;
        });

        it('should first find if a teacher model with input email exists', function () {
            subject.insertOrUpdate(inputEmail);

            expect(teacherFindOneAndUpdateSpy.args[0][0].email).to.equal(inputEmail);
        });

        it('should supply a teacher model with input email for insertion', function () {
            subject.insertOrUpdate(inputEmail);

            expect(teacherFindOneAndUpdateSpy.args[0][1].email).to.equal(inputEmail);
        });

        it('should use upsert flag', function () {
            subject.insertOrUpdate(inputEmail);

            expect(teacherFindOneAndUpdateSpy.args[0][2].upsert).to.be.true;
        });

        it('should use upsert flag to enable update or insert feature', function () {
            subject.insertOrUpdate(inputEmail);

            expect(teacherFindOneAndUpdateSpy.args[0][2].upsert).to.be.true;
        });

        it('should use runValidators flag to make sure model is validated', function () {
            subject.insertOrUpdate(inputEmail);

            expect(teacherFindOneAndUpdateSpy.args[0][2].runValidators).to.be.true;
        });
    });
});
