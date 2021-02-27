# alctracker

Manage weekly alcohol consumption from within a Slack channel.

# Setup
## Install `clasp`

This app can easily be deployed to your Google Drive with `clasp` (an official Google Apps Script API client).

See the repository page (https://github.com/google/clasp) for install instructions.

After installing `clasp`, log-in to your Google account with `clasp login`.

## Deploy the app to your Google Drive
### Create an empty Google Apps Script with a Spreadsheet

In your Google Drive page, create a new item of the type `Google Spreadsheet` and open.

Then click `Tools > Script Editor` to create an empty Apps Script project associated to the sheet.

Copy the app ID (not sheet ID) in the URL:

```
https://script.google.com/d/<the-app-id>/edit
```

FOR SECURITY REASONS, YOU MUST NOT SHARE THE ITEM (especially with Edit permission) WITH OTHERS.

### Deploy the app

Create a file named `.clasp.json` in the root directory of this repository, then register your app's ID as follows:

```
{"scriptId":"<the-app-id>"}
```

After setting `scriptId`, you can use `clasp` to deploy the app.

```
clasp push   # upload the code
clasp deploy # publish as a webapp
```

When the app is deployed, a public URL is given to the deployed app.

In the GAS app page, click `Publish` > `Deploy as web app` and you'll see the URL. The URL will be used to connect to Slack later.

## Connect Slack app to the GAS app
### Create a Slack app

Open the Slack API page (https://api.slack.com/) and click `Your Apps` then `Create New App`.

### Authorize the GAS app to use Slack APIs

In your Slack app page,

- open `OAuth & Permissions` tab
- in `Scopes` section, click `Add an OAuth Scope` and add `files:write`

  `files:write` is required to upload chart images to Slack.

- from `Tokens for Your Workspace` section, copy the OAuth Access Token to the clipboard

In your GAS app page,

- click `File` > `Project Properties` > `Script Properties` and add a property as follows:

```
Key: SLACK_ACCESS_TOKEN
Value: <paste the Slack OAuth Access Token>
```

### Enable interaction with the GAS app

In your Slack app page,

- open `Interactivity & Shortcuts` tab and turn on the feature, then copy-and-paste the GAS app's public URL to the `Request URL` field

- open `Basic Information` tab and copy the `Verification Token` in `App Credentials` section

In your GAS app page,

- click `File` > `Project Properties` > `Script Properties` and add a property as follows:

```
Key: SLACK_VERIFICATION_TOKEN
Value: <the Slack Verification Token>
```

### Add a slash command or a shortcut to the Slack app

In your Slack app page, either (or both):

- open `Slash Commands` tab and turn on the feature, then create a new command and copy-and-paste the GAS app's public URL to the `Request URL` field

- open `Interactivity & Shortcuts` tab and create a new shortcut with callback id `add`

### Add an incoming webhook to the Slack app

In your Slack app page,

- open `Incoming Webhooks` tab and turn on the feature, then click `Add New Webhook to Workspace`

In your GAS app page,

- click `File` > `Project Properties` > `Script Properties` and add a property as follows:

```
Key: SLACK_WEBHOOKURL
Value: <the Slack webhook URL created in the Slack app page>
```

```
Key: SLACK_CHANNEL_NAME
Value: <the Slack channel name integrated with the app>
```

In your Slack workspace,

- invite the bot account for the slack app to the channel

## Initialize & authorize the GAS app to use Google APIs

Open `main.gs` in the GAS app page and run `initialize` function manually from the menu `Execute` > `Execute a function` > `intialize`.

You'll be asked to permit the app to use Google Spreadsheet API and outgoing hooks.

After authorization, a message will be posted to your Slack channel.

## Setup triggers

In your GAS app page,

- click `Edit > Current project's trigger` and add a trigger which runs `doTimer` function

  This function creates a spread sheet row to record today's drinks, and posts the summary of the yesterdays' to Slack

My trigger look like this:

```
function: doTimer
version: HEAD
source: time-based
type: date
time: <time you usually wake up>
```

# Development

When you modify the app and want to update the deployment, you can use `-i` option to redeploy without changing the public URL. If `-i` is omitted, you'll have multiple deployments with different versions, in different URLs.

```
clasp push
clasp deploy -i <deployment ID>
```

You can see the list of deployments with `clasp deployments`:

```
$ clasp deployments
2 Deployments.
- <dev deployment ID> @HEAD
- <deployment ID> @4
```

The first deployment tagged `@HEAD` is a read-only deployment for dev use, which always runs the latest version of the app. So you'll usually want to redeploy the second deployment.

After creating unneeded deployments, you can also delete the deployment with `clasp undeploy <ID>` command.
