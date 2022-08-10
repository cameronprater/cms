# Client Management System

## Architecture
We use the following web platforms and containerized technologies in our deployed system.
* [Cloudflare][cloudflare] (DNS, SSL certificate, firewall security)
* [Amazon EC2][aws] (application server)
* [Amazon VPC][aws] (application server network rules)
* [Nginx][nginx] (reverse proxy)
* [React][react] (frontend)
* [Auth0][auth0] (authentication)
* [Quarkus][quarkus] (backend)
* [MariaDB][mariadb] (database)
* [Adminer][adminer] (database management)
* [mysql-backup-sidecar][backup-sidecar] (automated MariaDB backups)

## Development Environment
Before proceeding, [Git][git] must be installed with [properly configured authorship][git-authorship]. You will also 
need to generate and set aside a [personal GitHub access token][gh-pat] with `repo` access so your IDEs have access to
this private repository. [Docker][docker] is also required for running backend tests and running the system locally on
your machine.

### Backend Requirements
* Java IDE (recommended: [IntelliJ IDEA][intellij])
* JDK 11+ (recommended: [OpenJDK][openjdk])

### Frontend Requirements
* JavaScript IDE (recommended: [Visual Studio Code][vscode])
* [Node.js 17+][nodejs]

### Running Locally
> **NOTE:** If you want to rebuild the frontend and backend images, append the following to your Docker Compose command:
> `--build --force-recreate --no-deps react quarkus`

Before running the following command, change the value of the `REACT_APP_API` variable in `/frontend/.env` to
`http://localhost:8081/api`. Additionally, you should edit the Auth0 application settings to include the URL
`http://localhost:3000` in `Allowed Callback URLs`, `Allowed Logout URLs`, and `Allowed Web Origins`.
```
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

The frontend will be exposed at http://localhost:3000, while the backend will be accessible from 
http://localhost:8081/api. This will enable frontend file watching, so changes made in `/frontend` will be reflected in 
the running application.

Run the following command to stop the running containers.
```
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Simulating the Production Environment
If you want to simulate the production environment, you will need to edit the `nginx.conf` file by changing each 
`server_name` entry to `localhost` and change the value of the `REACT_APP_API` variable in `/frontend/.env` to 
`https://localhost/api`. Additionally, you will need to add the environment variable `QUARKUS_PROFILE=dev` to the 
`quarkus` service in `docker-compose.prod.yml`. Additionally, you should edit the Auth0 application settings to include 
the URL `https://localhost` in `Allowed Callback URLs`, `Allowed Logout URLs`, and `Allowed Web Origins`. Then, run the 
following command.
```
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

The frontend will be exposed at http://localhost, while the backend will be accessible from http://localhost/api. An 
Adminer panel will also be available at http://localhost/adminer.

Run the following command to stop the running containers.
```
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Production Environment
The system is deployed to an Amazon EC2 instance with Cloudflare providing DNS routing to the EC2 instance's IP address. 
We additionally utilize an Auth0 tenant which communicates with the frontend to issue tokens and communicates with the 
backend to create and update user entries in our database.

### Amazon
#### VPC
Our EC2 instance relies on an elastic IP address (`Virtual Private Cloud` > `Elastic IPs`) and a custom security group 
(`Security` > `Security Groups`) with HTTP and HTTPS inbound rules consisting of a managed prefix list 
(`Virtual Private Cloud` > `Managed Prefix Lists`) containing Cloudflare's IPv4 addresses. The elastic IP address and 
security group are associated with our running instance. 

The security group consists of three inbound rules: an SSH rule allowing traffic from a custom IP address 
corresponding to the value of "My IP" in the `Source` dropdown (you may have to re-initialize this value if you cannot 
connect to the EC2 instance via SSH), and HTTP and HTTPS rules whose sources correspond to our custom managed prefix 
list. The managed prefix list consists of IPv4 addresses obtained from https://www.cloudflare.com/ips-v4. The SSH rule
only allows the corresponding IP address to connect to the instance via SSH, while the HTTP and HTTPS rules only allow 
traffic proxied from Cloudflare.

### EC2
To connect to the EC2 instance via SSH, please follow the instructions [here][ec2]. If you need to recreate the Quarkus 
and React containers, first cd into the cms folder `cd /cms`, then pull the upstream repository by running `git pull 
upstream` and logging in with your GitHub username and previously obtained personal access token. Then run the following 
Docker Compose command to recreate the containers.
```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --no-deps --force-recreate react quarkus
```

If for any reason you need to configure a new Linux instance to run the application, make sure all the required VPC 
resources are properly configured and are associated with the new instance, then SSH into the instance and run the 
following commands, passing in your GitHub credentials when necessary.
```
sudo yum update -y 
sudo amazon-linux-extras install docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

sudo yum install git -y
mkdir cms
cd /cms
git init
git pull https://github.com/cmc-learning-tree/cms.git
git remote add upstream https://github.com/cmc-learning-tree/cms.git

sudo chmod +x /backend/mvnw
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
You must also edit the Cloudflare configuration to route the domain name to the newly allocated elastic IP address.

### Cloudflare
#### DNS
Our EC2 elastic IP address has an associated DNS A record in our Cloudflare configuration which is routed from our 
domain name. Due to our EC2 instance's security group, traffic is only allowed from and proxied through Cloudflare. We 
additionally provide DNS records to prevent email spoofing via our domain name and to resolve the`www` subdomain. The 
following table shows our DNS configuration.

| Type  | Name              | Content                                         | Proxy status |
|-------|-------------------|-------------------------------------------------|--------------|
| A     | cameronprater.com | Insert AWS Elastic IP                           | Proxied      |
| CNAME | www               | cameronprater.com                               | Proxied      |
| TXT   | cameronprater.com | v=spf1 -all                                     | DNS only     |
| TXT   | _dmarc            | v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; | DNS only     |
| TXT   | *._domainkey      | v=DKIM1; p=                                     | DNS only     |


#### Origin Certificates
A Cloudflare TLS certificate is installed on our application server to encrypt traffic between Cloudflare and our EC2 
instance and is available in Cloudflare at `SSL/TLS` > `Origin Certificate`. The certificate is installed on our 
deployed Nginx container at `nginx.conf`.

#### Firewall Rules
We have a deployed firewall rule which only allows traffic to the `/adminer` relative path if the request is sent via
an approved IP address. Currently, this is configured to only accept traffic from a Marshall University network (ASN 
14200). Therefore, if you want to access the Adminer deployment from a non-Marshall University IP address, you will need
to edit the following associated firewall rule (`Security` > `WAF` > `Adminer`). Please note that VPNs may also prevent 
you from accessing the Adminer deployment.
```
(http.request.uri.path contains "/adminer" and ip.geoip.asnum ne 14200)
```

We use the following additional rule (`Security` > `WAF` > `Dotfiles & PHP Files`) to block some malicious traffic from 
reaching the EC2 instance.
```
((http.request.uri.path contains ".php") or (http.request.uri.path contains "/.")) and (ip.geoip.asnum ne 14200)
```

### Auth0
#### Users
You can manage users and roles by logging into our Auth0 tenant and navigating to `User Management`. From here, you can 
manage roles, assign and remove roles from users, and change user credentials. To add more team members to the tenant, 
navigate to `Settings` > `Tenant Members`.

#### Applications
By navigating to `Applications`, you can find the frontend application settings used in our system in `Applications` >
`CMC Learning Tree` and our backend settings in `APIs` > `CMC Learning Tree`. Relevant frontend settings include the 
`Domain`, `Client ID`, `Allowed Callback URLs`, `Allowed Logout URLs`, and `Allowed Web Origins`. The backend settings 
used in our application are the `Identifier` and `Allow Offline Access`.

#### Actions
Our system requires a deployed Auth0 Action to customize tokens and to call our backend when a user logs in
(`Actions` > `Library` > `Custom` > `Update Tokens & API Users`). This action requires two npm dependencies, `axios` and 
`uuid`, as well as two secrets, `USERNAME` and `PASSWORD`. The required username and password values are configured in 
the `quarkus` service in `docker-compose.yml`. The following action is deployed into our application's login flow 
(`Actions` > `Flows` > `Login`).
```js
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  // add custom token claims
  const namespace = "http://localhost:8080/api";
  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
  let uuid = event.user.app_metadata.uuid;  
  if (!uuid)  {
    uuid = uuidv4();
    api.user.setAppMetadata("uuid", uuid);
  }
  api.idToken.setCustomClaim(`${namespace}/uuid`, uuid);
  api.accessToken.setCustomClaim(`${namespace}/uuid`, uuid);

  // create or update api user
  const url = "https://cameronprater.com/api/users";
  const json = {
    id: uuid,
    email: event.user.email,
    name: event.user.nickname,
    picture:  event.user.picture,
    active: true
  };
  const auth = {
    username: event.secrets.USERNAME,
    password: event.secrets.PASSWORD  
  };

  axios.put(url + "/" + uuid, json, { auth })
    .catch(function (error) {
      if (error.response && error.response.status === 404) {
        axios.post(url, json, { auth });
      }
  });
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };
```

[adminer]: https://adminer.org
[auth0]: https://auth0.com
[aws]: https://aws.amazon.com
[backup-sidecar]: https://github.com/woolfg/mysql-backup-sidecar
[cloudflare]: https://cloudflare.com
[create-users]: https://github.com/cmc-learning-tree/cms/blob/main/backend/core/init-db/1_create_users.sql
[docker]: https://docker.com/products/docker-desktop
[ec2]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstances.html
[gh-pat]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
[git]: https://git-scm.com/downloads
[git-authorship]: https://git-scm.com/docs/gittutorial
[intellij]: https://jetbrains.com/idea/download
[mariabackup]: https://mariadb.com/kb/en/mariabackup
[mariadb]: https://mariadb.com
[nginx]: https://nginx.org
[nodejs]: https://nodejs.org
[openjdk]: https://adoptium.net
[quarkus]: https://quarkus.io
[react]: https://reactjs.org
[vscode]: https://code.visualstudio.com