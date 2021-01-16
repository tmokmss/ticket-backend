import * as jwt from "jsonwebtoken";

export function createIdToken(userId: string): string {
    return jwt.sign({
        sub: userId,
    }, 'hoge');
}
