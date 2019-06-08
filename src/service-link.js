import {HttpLink} from "apollo-link-http";
import fetch from 'node-fetch'
import {introspectSchema, makeRemoteExecutableSchema} from "graphql-tools/dist/index";
import {setContext} from "apollo-link-context";
import {services} from "./config";

export async function getServiceSchema2(serviceName) {
    const link = new HttpLink({uri: `http://${services[serviceName]}/graphql`, fetch});

    const contextLink = setContext((request, prevContext) => {
        return {headers: prevContext.graphqlContext}
    }).concat(link);

    return makeRemoteExecutableSchema({
        schema: await introspectSchema(contextLink),
        link: contextLink,
    })
}
