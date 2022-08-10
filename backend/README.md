# Client Management System API

## Architecture
The CMS API is a Java application created using the [Quarkus framework][quarkus]. The application includes Java models 
for each business entity, data access objects to connect each Java model to its corresponding database table, services 
classes to implement required business logic, and secured REST endpoints that the SPA may invoke to create, retrieve,
update, and delete entities via JSON.

### Data
The API leverages a MariaDB database to persist data. The database schema is migrated using Docker Compose volumes. 

Rather than using a complex ORM whose SQL is abstracted away from application code, we instead leverage the [JDBI][jdbi] 
library so that all our SQL queries and updates can be viewed easily and written with more complexity than an ORM would 
allow. Quarkus does not provide a JDBI extension as of the time of writing, so we currently provide our own with limited 
support (native executables cannot be produced using the current version of the extension).

### Services
To access the JDBI SQL objects and implement other required business logic, we use service [beans][beans] for each
business entity. Each bean utilizes dependency injection to gather required dependencies. Additionally, we implement 
each service reactively using [SmallRye Mutiny][mutiny-guide] and validate SPA JSON input using
[Hibernate Validator][validator-guide].

### REST
We provide REST endpoints so that the SPA may access each service. The REST layer is implemented using 
[RestEASY Reactive][resteasy-guide] and uses Jackson for serializing and deserializing JSON. Each endpoint is protected 
by user role (and in more specific cases, user ID) to satisfy business requirements using 
[bearer token authentication][oidc-guide]. The bearer tokens are provided by [Auth0][auth0] when the user logs into the
SPA.

#### Endpoints & JSON Specifications

| Path                                       | Method   | Roles              | Response Status | Response Body | Request Body | Description                            |
|--------------------------------------------|----------|--------------------|-----------------|---------------|--------------|----------------------------------------|
| `/api/cases`                               | `POST`   | `customer-service` | 200             | `Case`        | `Case`       | Creates case                           |
| `/api/cases/{caseId}`                      | `GET`    | all                | 200             | `Case`        |              | Gets expanded view of case by ID       |
| `/api/cases`                               | `GET`    | all                | 200             | `Case[]`      |              | Gets simple view of every case         |
| `/api/cases/{caseId}`                      | `PUT`    | `customer-service` | 204             |               | `Case`       | Updates case by ID                     |
| `/api/cases/{caseId}/close`                | `POST`   | `customer-service` | 204             |               |              | Closes or reopens case                 |
| `/api/cases/{caseId}/state/{state}`        | `POST`   | determinant [1]    | 204             |               |              | Updates case to given state            |
| `/api/cases/{caseId}/comments`             | `POST`   | all                | 200             | `Comment`     | `Comment`    | Creates comment                        |
| `/api/cases/{caseId}/comments/{commentId}` | `PUT`    | determinant [2]    | 204             |               | `Comment`    | Updates comment by ID                  |
| `/api/cases/{caseId}/comments/{commentId}` | `DELETE` | determinant [2]    | 204             |               |              | Deletes comment by ID                  |
| `/api/cases/{caseId}/files`                | `POST`   | all                | 200             | `File`        | `File`       | Creates file                           |
| `/api/cases/{caseId}/files/{fileId}`       | `GET`    | determinant [3]    | 200             | `File`        |              | Gets file by ID                        |
| `/api/cases/{caseId}/files/{fileId}`       | `PUT`    | determinant [2]    | 204             |               | `File`       | Updates file by ID                     |
| `/api/cases/{caseId}/files/{fileId}`       | `DELETE` | determinant [2]    | 204             |               |              | Deletes file by ID                     |
| `/api/users`                               | `POST`   | `auth0` [4]        | 200             | `User`        | `User`       | Creates user                           |
| `/api/users/{userId}`                      | `PUT`    | `auth0` [4]        | 204             |               | `User`       | Updates user by ID                     |

1. This is configured in [`application.yml`][app-yml]
2. Only the comment or file author may edit or delete their comment or file
3. Users may set role permissions for comments or files when uploaded or edited which may prevent other roles from retrieving their JSON representation
4. The `auth0` role is derived using verified BASIC authentication rather than bearer token authentication

##### Case
`State = RECOMMENDATION_PENDING | PARENT_OUTREACH | PAYMENT_PENDING | REPORT_PENDING | LOGBOOK_PENDING`
```
{
  child: {
    id: Integer // on response
    name: String
    parent: {
      id:   Integer // on response
      name: String
    }
  }
  state: State // on response
  closed: Boolean // on response
  comments: Comment[] // expanded: on response (can be empty)
  files: File[] // expanded: on response (can be empty)
}
```

##### Comment
`Role = CLINICAL_DIRECTOR | CUSTOMER_SERVICE | ACCOUNTING | REPORTING_ASSISTANT | THERAPIST`
```
{
  id: Integer // on response
  content: String
  timestamp: String // on response
  author: User // on response
  permissions: Role[] // on response, optional on request
}
```

##### Uploaded File
Please see the frontend source code for examples on how to upload files.
```
Content-Type: multipart/form-data
---
Content-Disposition: form-data; name="data"; 
---
Content-Disposition: form-data; name="metadata"; 
{
  description: String // optional
  permissions: Role[] // optional
}
```

##### Downloaded File
Please see the frontend source code for examples on how to download files.
```
Content-Type: multipart/form-data
---
Content-Disposition: form-data; name="data"; 
---
Content-Disposition: form-data; name="metadata"; 
{
  id: Integer
  name: String // expanded
  extension: String // expanded
  description: String // expanded
  timestamp: String // expanded
  author: User // expanded
  permissions: Role[]
}
```

##### User
```
{
  id: UUID
  email: String
  name: String
  picture: String
  active: Boolean
}
```

## Testing
To test the application, Docker is required. Please ensure the Docker daemon is running on your machine, then run
`./mvnw clean verify`.

## Running Locally
To build and start the CMS API and MariaDB containers, run the following Docker Compose command.
```
docker compose -f docker-compose.yml up -d --build --force-recreate quarkus
```

The API will be exposed at `http://localhost:8081`. If you also want to run the SPA, see the README at the repository root.

Run the following command to stop the running containers.
```
docker compose -f docker-compose.yml down
```

[app-yml]: https://github.com/cmc-learning-tree/cms/blob/main/backend/core/src/main/resources/application.yml
[auth0]: https://auth0.com
[beans]: https://quarkus.io/guides/cdi#ok-lets-start-simple-what-is-a-bean
[jdbi]: https://jdbi.org
[mutiny-guide]: https://quarkus.io/guides/mutiny-primer
[oidc-guide]: https://quarkus.io/guides/security-openid-connect
[quarkus]: https://quarkus.io
[resteasy-guide]: https://quarkus.io/guides/resteasy-reactive
[validator-guide]: https://quarkus.io/guides/validation