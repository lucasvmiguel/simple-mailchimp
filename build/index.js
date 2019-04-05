"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const _ = require("lodash");
class Client {
    constructor(params) {
        this._maybeLog = (functionName, response) => {
            if (this.logging) {
                console.log(`MAILCHIMP RESPONSE ${functionName}: ${JSON.stringify(response.data)}\n`);
            }
        };
        this._requestHttp = (url, method, data) => __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default({
                method,
                data,
                url: `${this.url}${url}`,
                validateStatus: () => true,
                headers: {
                    authorization: `Basic ${this.authToken}`
                }
            });
            this._maybeLog(url, response);
            return response;
        });
        this._getUser = (userEmail) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._requestHttp(`/search-members?list_id=${this.listId}&query=${userEmail}`, "get");
            const members = _.get(response, ['data', 'exact_matches', 'members']);
            if (response.status === 200 && _.size(members) > 0) {
                const user = response.data.exact_matches.members[0];
                const tags = Array.isArray(user.tags) ? _.map(user.tags, t => t.name) : [];
                const extra = Object.assign({}, user.merge_fields, { FNAME: undefined });
                return Promise.resolve({
                    id: user.id,
                    email: user.email_address,
                    name: user.merge_fields.FNAME,
                    tags,
                    extra
                });
            }
            return Promise.resolve(null);
        });
        this.getUser = (userEmail) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this._getUser(userEmail);
            if (!user) {
                return Promise.resolve(null);
            }
            return Promise.resolve(Object.assign({}, user, { id: undefined }));
        });
        this.addOrGetUser = (user) => __awaiter(this, void 0, void 0, function* () {
            const userAlreadyCreated = yield this._getUser(user.email);
            if (userAlreadyCreated) {
                return Promise.resolve(userAlreadyCreated);
            }
            const userTags = Array.isArray(user.tags) ? user.tags : [];
            const userExtra = user.extra ? user.extra : {};
            const response = yield this._requestHttp(`/lists/${this.listId}/members`, "post", {
                email_address: user.email,
                status: "subscribed",
                tags: userTags,
                merge_fields: Object.assign({}, userExtra, { FNAME: user.name })
            });
            if (response.status !== 200) {
                return Promise.reject(null);
            }
            return Promise.resolve({
                email: response.data.email_address,
                name: response.data.merge_fields.FNAME,
                tags: userTags,
                extra: Object.assign({}, response.data.merge_fields, { FNAME: undefined })
            });
        });
        this.editUserTags = (userEmail, tags) => __awaiter(this, void 0, void 0, function* () {
            const userAlreadyCreated = yield this._getUser(userEmail);
            if (!userAlreadyCreated) {
                return Promise.resolve(null);
            }
            const userTags = Array.isArray(userAlreadyCreated.tags) ? _.concat(userAlreadyCreated.tags, tags) : tags;
            const userTagsValidated = _.chain(userTags)
                .uniq()
                .map(t => _.includes(tags, t) ? { name: t, status: "active" } : { name: t, status: "inactive" })
                .value();
            const response = yield this._requestHttp(`/lists/${this.listId}/members/${userAlreadyCreated.id}/tags`, "post", {
                tags: userTagsValidated
            });
            if (response.status !== 204) {
                return Promise.reject(null);
            }
            return Promise.resolve({
                name: userAlreadyCreated.name,
                email: userAlreadyCreated.email,
                tags: _.map(userTagsValidated, t => t.name),
                extra: userAlreadyCreated.extra
            });
        });
        this.editUserExtra = (userEmail, userExtra) => __awaiter(this, void 0, void 0, function* () {
            const userAlreadyCreated = yield this._getUser(userEmail);
            if (!userAlreadyCreated) {
                return Promise.resolve(null);
            }
            const extra = Object.assign({}, userExtra, { FNAME: userAlreadyCreated.name });
            const response = yield this._requestHttp(`/lists/${this.listId}/members/${userAlreadyCreated.id}`, "put", {
                merge_fields: extra
            });
            if (response.status !== 200) {
                return Promise.reject(null);
            }
            return Promise.resolve({
                name: userAlreadyCreated.name,
                email: userAlreadyCreated.email,
                tags: userAlreadyCreated.tags,
                extra
            });
        });
        this.authToken = Buffer.from(`${params.username}:${params.apiKey}`).toString("base64");
        this.url = params.url;
        this.listId = params.listId;
        this.logging = !!params.logging;
    }
}
exports.Client = Client;
