interface IUserExtra {
    [key: string]: string | number;
}
export interface IClient {
    url: string;
    username: string;
    apiKey: string;
    listId: string;
    logging?: boolean;
}
export interface IUser {
    email: string;
    name: string;
    tags: string[];
    extra: IUserExtra;
}
export interface ICampaign {
    title: string;
    subject: string;
    fromName: string;
    replyTo: string;
    templateId: number;
}
export declare class Client {
    private authToken;
    private url;
    private listId;
    private logging;
    constructor(params: IClient);
    private _maybeLog;
    private _requestHttp;
    private _getUser;
    getUser: (userEmail: string) => Promise<IUser>;
    addOrGetUser: (user: IUser) => Promise<IUser>;
    editUserTags: (userEmail: string, tags: string[]) => Promise<IUser>;
    editUserExtra: (userEmail: string, userExtra: IUserExtra) => Promise<IUser>;
}
export {};
