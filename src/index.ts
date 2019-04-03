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
    this.authToken = Buffer.from(
      `${params.username}:${params.apiKey}`
    ).toString("base64");
    this.url = params.url;
    this.listId = params.listId;
    this.logging = !!params.logging;
  }

  private _requestHttp = async (
    url: string,
    method: "get" | "post" | "put",
    data?: object
  ) => {
    return axios({
      method,
      data,
      url: `${this.url}${url}`,
      validateStatus: () => true,
      headers: {
        authorization: `Basic ${this.authToken}`
      }
    });
  };

  private _getUser = async (
    userEmail: string
  ): Promise<IUserDetailed | null> => {
    const response = await this._requestHttp(
      `/search-members?list_id=${this.listId}&query=${userEmail}`,
      "get"
    );

    if (this.logging) {
      const data = response && response.data;
      console.log(`MAILCHIMP RESPONSE _getUser: ${JSON.stringify(data)}\n`);
    }

    if (
      response.status === 200 &&
      response.data &&
      response.data.exact_matches &&
      Array.isArray(response.data.exact_matches.members) &&
      response.data.exact_matches.members.length > 0
    ) {
      const user = response.data.exact_matches.members[0];
      const tags = Array.isArray(user.tags)
        ? _.map(user.tags, t => t.name)
        : [];
      const extra = { ...user.merge_fields, FNAME: undefined };

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

  public getUser = async (userEmail: string): Promise<IUserDetailed | null> => {
    const user = await this._getUser(userEmail);

    if (!user) {
      return Promise.resolve(null);
    }

    return Promise.resolve(user);
  };

  public addOrGetUser = async (user: IUser): Promise<IUser | null> => {
    const userAlreadyCreated = await this._getUser(user.email);
    if (userAlreadyCreated) {
      return Promise.resolve(userAlreadyCreated);
    }

    const userTags = Array.isArray(user.tags) ? user.tags : [];
    const userExtra = user.extra ? user.extra : {};

    const response = await this._requestHttp(
      `/lists/${this.listId}/members`,
      "post",
      {
        email_address: user.email,
        status: "subscribed",
        tags: userTags,
        merge_fields: {
          ...userExtra,
          FNAME: user.name
        }
      }
    );

    if (this.logging) {
      const data = response && response.data;
      console.log(`MAILCHIMP RESPONSE addOrGetUser: ${JSON.stringify(data)}\n`);
    }

    if (response.status === 200) {
      return Promise.resolve({
        email: response.data.email_address,
        name: response.data.merge_fields.FNAME,
        tags: userTags,
        extra: {
          ...response.data.merge_fields,
          FNAME: undefined
        }
      });
    }

    return Promise.reject(null);
  };

  public editUserTags = async (
    userEmail: string,
    tags: string[]
  ): Promise<IUser | null> => {
    const userAlreadyCreated = await this._getUser(userEmail);
    if (!userAlreadyCreated) {
      return Promise.resolve(null);
    }

    const userTags = Array.isArray(userAlreadyCreated.tags)
      ? _.concat(userAlreadyCreated.tags, tags)
      : tags;
    const userTagsValidated = _.chain(userTags)
      .uniq()
      .map(t =>
        _.includes(tags, t)
          ? { name: t, status: "active" }
          : { name: t, status: "inactive" }
      )
      .value();

    const response = await this._requestHttp(
      `/lists/${this.listId}/members/${userAlreadyCreated.id}/tags`,
      "post",
      {
        tags: userTagsValidated
      }
    );

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
  };

  public editUserExtra = async (
    userEmail: string,
    userExtra: IUserExtra
  ): Promise<IUser | null> => {
    const userAlreadyCreated = await this._getUser(userEmail);
    if (!userAlreadyCreated) {
      return Promise.resolve(null);
    }

    const extra = { ...userExtra, FNAME: userAlreadyCreated.name };
    const response = await this._requestHttp(
      `/lists/${this.listId}/members/${userAlreadyCreated.id}`,
      "put",
      {
        merge_fields: extra
      }
    );

    if (this.logging) {
      const data = response && response.data;
      console.log(
        `MAILCHIMP RESPONSE editUserExtra: ${JSON.stringify(data)}\n`
      );
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
  };
}
