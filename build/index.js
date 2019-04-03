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
        this._requestHttp = (url, method, data) => __awaiter(this, void 0, void 0, function* () {
            return axios_1.default({
                method,
                data,
                url: `${this.url}${url}`,
                validateStatus: () => true,
                headers: {
                    authorization: `Basic ${this.authToken}`
                }
            });
        });
        this._getUser = (userEmail) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._requestHttp(`/search-members?list_id=${this.listId}&query=${userEmail}`, "get");
            if (this.logging) {
                const data = response && response.data;
                console.log(`MAILCHIMP RESPONSE _getUser: ${JSON.stringify(data)}\n`);
            }
            if (response.status === 200 &&
                response.data &&
                response.data.exact_matches &&
                Array.isArray(response.data.exact_matches.members) &&
                response.data.exact_matches.members.length > 0) {
                const user = response.data.exact_matches.members[0];
                const tags = Array.isArray(user.tags)
                    ? _.map(user.tags, t => t.name)
                    : [];
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
            return Promise.resolve(user);
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
            if (this.logging) {
                const data = response && response.data;
                console.log(`MAILCHIMP RESPONSE addOrGetUser: ${JSON.stringify(data)}\n`);
            }
            if (response.status === 200) {
                return Promise.resolve({
                    email: response.data.email_address,
                    name: response.data.merge_fields.FNAME,
                    tags: userTags,
                    extra: Object.assign({}, response.data.merge_fields, { FNAME: undefined })
                });
            }
            return Promise.reject(null);
        });
        this.editUserTags = (userEmail, tags) => __awaiter(this, void 0, void 0, function* () {
            const userAlreadyCreated = yield this._getUser(userEmail);
            if (!userAlreadyCreated) {
                return Promise.resolve(null);
            }
            const userTags = Array.isArray(userAlreadyCreated.tags)
                ? _.concat(userAlreadyCreated.tags, tags)
                : tags;
            const userTagsValidated = _.chain(userTags)
                .uniq()
                .map(t => _.includes(tags, t)
                ? { name: t, status: "active" }
                : { name: t, status: "inactive" })
                .value();
            const response = yield this._requestHttp(`/lists/${this.listId}/members/${userAlreadyCreated.id}/tags`, "post", {
                tags: userTagsValidated
            });
            if (this.logging) {
                const data = response && response.data;
                console.log(`MAILCHIMP RESPONSE editUserTags: ${JSON.stringify(data)}\n`);
            }
            if (response.status === 204) {
                return Promise.resolve({
                    name: userAlreadyCreated.name,
                    email: userAlreadyCreated.email,
                    tags: _.map(userTagsValidated, t => t.name),
                    extra: userAlreadyCreated.extra
                });
            }
            return Promise.reject(null);
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
            if (this.logging) {
                const data = response && response.data;
                console.log(`MAILCHIMP RESPONSE editUserExtra: ${JSON.stringify(data)}\n`);
            }
            if (response.status === 200) {
                return Promise.resolve({
                    name: userAlreadyCreated.name,
                    email: userAlreadyCreated.email,
                    tags: userAlreadyCreated.tags,
                    extra
                });
            }
            return Promise.reject(null);
        });
        this.authToken = Buffer.from(`${params.username}:${params.apiKey}`).toString("base64");
        this.url = params.url;
        this.listId = params.listId;
        this.logging = !!params.logging;
    }
}
exports.Client = Client;
