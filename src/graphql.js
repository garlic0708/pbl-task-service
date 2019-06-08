import {GraphQLDateTime} from "graphql-iso-date/dist/index";
import {gql} from 'apollo-server'
import {createTask, deleteTask, updateTask, findById, findByProjectId} from "./dal/task";
import {mergeDependencies, delegateToSchema, context, pushNotification} from 'pbl-lib'

const typeDefs = gql`

    scalar DateTime

    type Task {
        id: ID!
        name: String!
        startDate: DateTime!
        duration: Int!
        progress: Float!
        assignee: User
        project: Project!
    }

    input UpdateTask {
        name: String
        startDate: DateTime
        duration: Int
        progress: Float
        assigneeId: ID
    }

    type Mutation {
        createTask(args: UpdateTask!, projectId: ID!): Task!
        updateTask(id: ID!, args: UpdateTask!): Task!
        deleteTask(id: ID!): Task!
    }
    
    type Query {
        findTaskByProject(projectId: ID!): [Task!]!
    }
`;

// noinspection JSUnusedGlobalSymbols
const resolvers = {
    DateTime: GraphQLDateTime,
    Task: {
        assignee: async ({assigneeId}, args, context, info) => {
            return assigneeId && delegateToSchema({
                schemaName: 'user-project',
                fieldName: 'getUserByUsername',
                args: {username: assigneeId},
                context,
                info,
            })
        },
        project: async ({projectId}, args, context, info) => {
            return delegateToSchema({
                schemaName: 'user-project',
                fieldName: 'getProjectById',
                args: {id: projectId,},
                context,
                info,
            })
        },
    },
    Mutation: {
        createTask: async (root, {args, projectId}) => createTask({projectId, ...args}),
        updateTask: async (root, {id, args}, context) => {
            const task = await findById(id);
            if (task.assigneeId !== args.assigneeId) {
                const taskName = args.name || task.name;
                console.log('push to', task.assigneeId, args.assigneeId);
                if (task.assigneeId)
                    pushNotification(task.assigneeId, `You have been unassigned to task ${taskName}`, context);
                if (args.assigneeId)
                    pushNotification(args.assigneeId, `You have been assigned to task ${taskName}`, context);
            }
            return updateTask(id, args);
        },
        deleteTask: async (root, {id}) => deleteTask(id),
    },
    Query: {
        findTaskByProject: async (root, {projectId}) => findByProjectId(projectId)
    }
};

async function getSchema() {
    return mergeDependencies(typeDefs, resolvers, ['user-project',])
}

export default {
    getSchema,
    context,
}
