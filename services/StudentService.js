const StudentModel = require('../models/student');

const StudentService = {

    insertOrUpdate(studentEmail) {
        const student = new StudentModel({
            _id: studentEmail,
            email: studentEmail
        });

        return StudentModel.findOneAndUpdate({ email: studentEmail }, student, { upsert: true, new: true, runValidators: true });
    },

};

module.exports = StudentService;
