var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import axios from "axios";
import * as _ from "lodash";
var Client = /** @class */ (function () {
    function Client(params) {
        var _this = this;
        this._requestHttp = function (url, method, data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, axios({
                        method: method,
                        data: data,
                        url: "" + this.url + url,
                        validateStatus: function () { return true; },
                        headers: {
                            authorization: "Basic " + this.authToken
                        }
                    })];
            });
        }); };
        this._getUser = function (userEmail) { return __awaiter(_this, void 0, void 0, function () {
            var response, data, user, tags, extra;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._requestHttp("/search-members?list_id=" + this.listId + "&query=" + userEmail, "get")];
                    case 1:
                        response = _a.sent();
                        if (this.logging) {
                            data = response && response.data;
                            console.log("MAILCHIMP RESPONSE _getUser: " + JSON.stringify(data) + "\n");
                        }
                        if (response.status === 200 &&
                            response.data &&
                            response.data.exact_matches &&
                            Array.isArray(response.data.exact_matches.members) &&
                            response.data.exact_matches.members.length > 0) {
                            user = response.data.exact_matches.members[0];
                            tags = Array.isArray(user.tags)
                                ? _.map(user.tags, function (t) { return t.name; })
                                : [];
                            extra = __assign({}, user.merge_fields, { FNAME: undefined });
                            return [2 /*return*/, Promise.resolve({
                                    id: user.id,
                                    email: user.email_address,
                                    name: user.merge_fields.FNAME,
                                    tags: tags,
                                    extra: extra
                                })];
                        }
                        return [2 /*return*/, Promise.resolve(null)];
                }
            });
        }); };
        this.getUser = function (userEmail) { return __awaiter(_this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getUser(userEmail)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, Promise.resolve(null)];
                        }
                        return [2 /*return*/, Promise.resolve(user)];
                }
            });
        }); };
        this.addOrGetUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
            var userAlreadyCreated, userTags, userExtra, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getUser(user.email)];
                    case 1:
                        userAlreadyCreated = _a.sent();
                        if (userAlreadyCreated) {
                            return [2 /*return*/, Promise.resolve(userAlreadyCreated)];
                        }
                        userTags = Array.isArray(user.tags) ? user.tags : [];
                        userExtra = user.extra ? user.extra : {};
                        return [4 /*yield*/, this._requestHttp("/lists/" + this.listId + "/members", "post", {
                                email_address: user.email,
                                status: "subscribed",
                                tags: userTags,
                                merge_fields: __assign({}, userExtra, { FNAME: user.name })
                            })];
                    case 2:
                        response = _a.sent();
                        if (this.logging) {
                            data = response && response.data;
                            console.log("MAILCHIMP RESPONSE addOrGetUser: " + JSON.stringify(data) + "\n");
                        }
                        if (response.status === 200) {
                            return [2 /*return*/, Promise.resolve({
                                    email: response.data.email_address,
                                    name: response.data.merge_fields.FNAME,
                                    tags: userTags,
                                    extra: __assign({}, response.data.merge_fields, { FNAME: undefined })
                                })];
                        }
                        return [2 /*return*/, Promise.reject(null)];
                }
            });
        }); };
        this.editUserTags = function (userEmail, tags) { return __awaiter(_this, void 0, void 0, function () {
            var userAlreadyCreated, userTags, userTagsValidated, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getUser(userEmail)];
                    case 1:
                        userAlreadyCreated = _a.sent();
                        if (!userAlreadyCreated) {
                            return [2 /*return*/, Promise.resolve(null)];
                        }
                        userTags = Array.isArray(userAlreadyCreated.tags)
                            ? _.concat(userAlreadyCreated.tags, tags)
                            : tags;
                        userTagsValidated = _.chain(userTags)
                            .uniq()
                            .map(function (t) {
                            return _.includes(tags, t)
                                ? { name: t, status: "active" }
                                : { name: t, status: "inactive" };
                        })
                            .value();
                        return [4 /*yield*/, this._requestHttp("/lists/" + this.listId + "/members/" + userAlreadyCreated.id + "/tags", "post", {
                                tags: userTagsValidated
                            })];
                    case 2:
                        response = _a.sent();
                        if (this.logging) {
                            data = response && response.data;
                            console.log("MAILCHIMP RESPONSE editUserTags: " + JSON.stringify(data) + "\n");
                        }
                        if (response.status === 204) {
                            return [2 /*return*/, Promise.resolve({
                                    name: userAlreadyCreated.name,
                                    email: userAlreadyCreated.email,
                                    tags: _.map(userTagsValidated, function (t) { return t.name; }),
                                    extra: userAlreadyCreated.extra
                                })];
                        }
                        return [2 /*return*/, Promise.reject(null)];
                }
            });
        }); };
        this.editUserExtra = function (userEmail, userExtra) { return __awaiter(_this, void 0, void 0, function () {
            var userAlreadyCreated, extra, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getUser(userEmail)];
                    case 1:
                        userAlreadyCreated = _a.sent();
                        if (!userAlreadyCreated) {
                            return [2 /*return*/, Promise.resolve(null)];
                        }
                        extra = __assign({}, userExtra, { FNAME: userAlreadyCreated.name });
                        return [4 /*yield*/, this._requestHttp("/lists/" + this.listId + "/members/" + userAlreadyCreated.id, "put", {
                                merge_fields: extra
                            })];
                    case 2:
                        response = _a.sent();
                        if (this.logging) {
                            data = response && response.data;
                            console.log("MAILCHIMP RESPONSE editUserExtra: " + JSON.stringify(data) + "\n");
                        }
                        if (response.status === 200) {
                            return [2 /*return*/, Promise.resolve({
                                    name: userAlreadyCreated.name,
                                    email: userAlreadyCreated.email,
                                    tags: userAlreadyCreated.tags,
                                    extra: extra
                                })];
                        }
                        return [2 /*return*/, Promise.reject(null)];
                }
            });
        }); };
        this.authToken = Buffer.from(params.username + ":" + params.apiKey).toString("base64");
        this.url = params.url;
        this.listId = params.listId;
        this.logging = !!params.logging;
    }
    return Client;
}());
export { Client };
