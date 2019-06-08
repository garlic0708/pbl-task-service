import config from "./graphql";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import http from 'http';

const PORT = process.env['PORT'] || 4000;
const app = express();

const {getSchema, ...rest} = config;

getSchema()
    .then(schema => {
        const server = new ApolloServer({
            schema,
            ...rest,
        });
        server.applyMiddleware({app});

        const httpServer = http.createServer(app);
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
        });
    })
    .catch(err => {
        console.error(err);
        console.error(err.result)
    });
