export default {
  "id": "test-id",
  "email_address": "test-email-lucas@gmail.com",
  "unique_email_id": "298862ca64",
  "email_type": "html",
  "status": "subscribed",
  "merge_fields": {
    "FNAME": "Test Lucas",
    "LNAME": "",
    "ADDRESS": "",
    "PHONE": "",
    "COMPLETION": 33
  },
  "stats": {
    "avg_open_rate": 0,
    "avg_click_rate": 0
  },
  "ip_signup": "",
  "timestamp_signup": "",
  "ip_opt": "87.44.41.94",
  "timestamp_opt": "2019-04-05T10:15:41+00:00",
  "member_rating": 2,
  "last_changed": "2019-04-05T10:15:41+00:00",
  "language": "",
  "vip": false,
  "email_client": "",
  "location": {
    "latitude": 0,
    "longitude": 0,
    "gmtoff": 0,
    "dstoff": 0,
    "country_code": "",
    "timezone": ""
  },
  "source": "API - Generic",
  "tags_count": 1,
  "tags": [
    {
      "id": 70201,
      "name": "vieira"
    },
    {
      "id": 70202,
      "name": "lucas"
    }
  ],
  "list_id": "test-list-id",
  "_links": [
    {
      "rel": "self",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id",
      "method": "GET",
      "targetSchema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/Response.json"
    },
    {
      "rel": "parent",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members",
      "method": "GET",
      "targetSchema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/CollectionResponse.json",
      "schema": "https://us15.api.mailchimp.com/schema/3.0/CollectionLinks/Lists/Members.json"
    },
    {
      "rel": "update",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id",
      "method": "PATCH",
      "targetSchema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/Response.json",
      "schema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/PATCH.json"
    },
    {
      "rel": "upsert",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id",
      "method": "PUT",
      "targetSchema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/Response.json",
      "schema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/PUT.json"
    },
    {
      "rel": "delete",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id",
      "method": "DELETE"
    },
    {
      "rel": "activity",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id/activity",
      "method": "GET",
      "targetSchema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/Activity/Response.json"
    },
    {
      "rel": "goals",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id/goals",
      "method": "GET",
      "targetSchema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/Goals/Response.json"
    },
    {
      "rel": "notes",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id/notes",
      "method": "GET",
      "targetSchema": "https://us15.api.mailchimp.com/schema/3.0/Definitions/Lists/Members/Notes/CollectionResponse.json"
    },
    {
      "rel": "delete_permanent",
      "href": "https://us15.api.mailchimp.com/3.0/lists/test-list-id/members/test-id/actions/delete-permanent",
      "method": "POST"
    }
  ]
}