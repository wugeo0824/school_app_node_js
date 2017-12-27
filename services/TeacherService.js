const TeacherModel = require('../models/teacher');

const TeacherService = {

    insertOrUpdate(teacherEmail, students) {
        const newTeacher = new TeacherModel({
            _id: teacherEmail,
            email: teacherEmail,
            students: students
        });

        return TeacherModel.findOneAndUpdate({ email: teacherEmail }, newTeacher, { upsert: true, runValidators: true });
    },

    findOneWithStudentsPopulated(teacherEmail) {
        return TeacherModel.findOne({ email: teacherEmail }).populate('students');
    },

};

module.exports = TeacherService;
