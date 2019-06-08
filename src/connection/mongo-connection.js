import {mongoUrl} from "../config";
import mongoose from "mongoose";

let initialized = false;

async function init() {
    if (!initialized) {
        initialized = true;
        return mongoose.connect(mongoUrl, {useNewUrlParser: true})
    }
}

init();

export async function tearDown() {
    return mongoose.disconnect()
}
