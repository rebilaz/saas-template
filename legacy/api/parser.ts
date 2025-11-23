import { NextApiRequest } from "next";

export async function parseBody<T>(req: NextApiRequest): Promise<T> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body) as T);
            } catch (e) {
                reject(e);
            }
        });
    });
}