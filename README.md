parse-password-manager
======================

Web app built on [Parse](https://parse.com/products) that keep track of passwords. This is an example project of how easy and quick it can be to get a hosted web app running with Parse.

This app was designed to gain more experience with Parse and can be used as an example to anyone else who is interested in learning. I am not at all encouraging people to store their real passwords into the live app below.

[View a live application hosted on Parse here](https://password-server.parseapp.com).

Setup using another Parse app
-----------------------------

1. Create an app at [Parse](https://parse.com/apps).

2. Install the [Parse Command Line Tool](https://parse.com/apps/quickstart#hosting).

3. Set up a Cloud Code directory using instructions from the previous link.

4. Copy your new app's application id, and master key into `config/global.json`.

```
"applicationId": "APPLICATION_ID", 
"masterKey": "MASTER_KEY"
```

5. Clone the [parse-password-manager](https://github.com/JamesFator/parse-password-manager) repository.

6. Copy your `config/global.json` into `parse-password-manager/config/global.json`.

7. Change directory to `parse-password-manager` then run `parse deploy`.

8. Access the site at the subdomain that is customizable in the `Hosting` section of your Parse app.