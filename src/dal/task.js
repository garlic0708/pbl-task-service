import "../connection/mongo-connection"
import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema({
    name: String,
    startDate: Date,
    duration: Number,
    progress: Number,
    assigneeId: String,
    projectId: {type: String, index: true},
});

const Task = mongoose.model('Task', TaskSchema);

const execTask = new Proxy(Task, {
    get(target, p) {
        return async (...args) => {
            if (p.endsWith('Update'))
                args[2] = {
                    new: true,
                    ...args[2],
                };
            return target[p](...args).exec();
        }
    }
});

export const {
    findByIdAndUpdate: updateTask,
    findByIdAndDelete: deleteTask,
    findById
} = execTask;

export async function createTask(args) {
    return new Task(args).save()
}

export async function findByProjectId(projectId) {
    return Task.find({projectId}).exec()
}
