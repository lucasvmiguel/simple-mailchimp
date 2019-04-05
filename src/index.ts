import axios from "axios";
import * as _ from "lodash";

interface IUserDetailed extends IUser {
  id: string;
}

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

export class Client {
  private authToken: string;
  private url: string;
  private listId: string;
  private logging: boolean;

  constructor(params: IClient) {
    this.authToken = Buffer.from(`${params.username}:${params.apiKey}`).toString("base64");
    this.url = params.url;
    this.listId = params.listId;
    this.logging = !!params.logging;
  }

  private _maybeLog = (functionName: string, response: any) => {
    if (this.logging) {
      console.log(`MAILCHIMP RESPONSE ${functionName}: ${JSON.stringify(response.data)}\n`);
    }
  };

  private _requestHttp = async (
    url: string,
    method: "get" | "post" | "put",
    data?: object
  ) => {
    const response = await axios({
      method,
      data,
      url: `${this.url}${url}`,
      validateStatus: () => true,
      headers: {
        authorization: `Basic ${this.authToken}`
      }
    });

    this._maybeLog(url, response);

    return response
  };

  private _getUser = async (userEmail: string): Promise<IUserDetailed | null> => {
    const response = await this._requestHttp(`/search-members?list_id=${this.listId}&query=${userEmail}`, "get");

    const members = _.get(response, ['data', 'exact_matches', 'members']);

    if (response.status === 200 && _.size(members) > 0) {
      const user = response.data.exact_matches.members[0];
      const tags = Array.isArray(user.tags) ? _.map(user.tags, t => t.name) : [];
      const extra = { ...user.merge_fields };
      delete extra.FNAME;

      return Promise.resolve({
        id: user.id,
        email: user.email_address,
        name: user.merge_fields.FNAME,
        tags,
        extra
      });
    }

    return Promise.resolve(null);
  };

  public getUser = async (userEmail: string): Promise<IUser | null> => {
    const user = await this._getUser(userEmail);

    if (!user) {
      return Promise.resolve(null);
    }

    const userCloned = _.clone(user);
    delete userCloned.id;
    return Promise.resolve(userCloned);
  };

  public addOrGetUser = async (user: IUser): Promise<IUser | null> => {
    const userAlreadyCreated = await this._getUser(user.email);

    if (userAlreadyCreated) {
      const userCloned = _.clone(userAlreadyCreated);
      delete userCloned.id;
      return Promise.resolve(userCloned);
    }

    const userTags = Array.isArray(user.tags) ? user.tags : [];
    const userExtra = user.extra ? user.extra : {};

    const response = await this._requestHttp(`/lists/${this.listId}/members`, "post", {
      email_address: user.email,
      status: "subscribed",
      tags: userTags,
      merge_fields: {
        ...userExtra,
        FNAME: user.name
      }
    });

    if (response.status !== 200) {
      return Promise.reject(null);
    }

    const userResponse = {
      email: response.data.email_address,
      name: response.data.merge_fields.FNAME,
      tags: userTags,
      extra: response.data.merge_fields,
    }
    delete userResponse.extra.FNAME;

    return Promise.resolve(userResponse);
  };

  public editUserTags = async (userEmail: string, tags: string[]): Promise<IUser | null> => {
    const userAlreadyCreated = await this._getUser(userEmail);
    if (!userAlreadyCreated) {
      return Promise.resolve(null);
    }

    const userTags = Array.isArray(userAlreadyCreated.tags) ? _.concat(userAlreadyCreated.tags, tags) : tags;
    const userTagsValidated = _.chain(userTags)
      .uniq()
      .map(t => _.includes(tags, t) ? { name: t, status: "active" } : { name: t, status: "inactive" })
      .value();

    const response = await this._requestHttp(`/lists/${this.listId}/members/${userAlreadyCreated.id}/tags`, "post", {
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
  };

  public editUserExtra = async (userEmail: string, userExtra: IUserExtra): Promise<IUser | null> => {
    const userAlreadyCreated = await this._getUser(userEmail);
    if (!userAlreadyCreated) {
      return Promise.resolve(null);
    }

    const extra = { ...userAlreadyCreated.extra, ...userExtra, FNAME: userAlreadyCreated.name };
    const response = await this._requestHttp(`/lists/${this.listId}/members/${userAlreadyCreated.id}`, "put", {
      merge_fields: extra
    });

    if (response.status !== 200) {
      return Promise.reject(null);
    }

    const userResponse = {
      name: userAlreadyCreated.name,
      email: userAlreadyCreated.email,
      tags: userAlreadyCreated.tags,
      extra
    };
    delete userResponse.extra.FNAME;

    return Promise.resolve(userResponse);
  };
}
