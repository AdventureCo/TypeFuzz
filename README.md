# FuzzBot

**What is this:**
A ( not-inherently furry ) discord bot designed to be hyper modular and super extendable
  
## Running
For development:
```
npm run devel
```

For linting:
```
npm run lint
```

## Folder Structure
```
 src
  │   MongoHelper.ts    # Our MongoDB helper
  │   start.ts          # App entry point
  └───modules           # Modules are self contained 'modules'
  └─────admin           # Admin commands or utilities
  └─────public          # Publicly interactive modules
  └───jobs              # Cron / scheduled jobs
  └───utility           # All our utility classes, like loggers

```

### Module directory structure
Each module should aim to only do one thing, and thus should only contain three core resources:
* `models/` folder to store you database models
* `ClassName.ts` the class name of your function, ex module `MuteUser` should be called `MuteUser.ts`
* `README.md` readme to declare what the module does, and any `environment variables` it requires at runtime

Because modules are loosely coupled, you should *not* directly call other modules and instead use our in app message passing. As such, all of your class methods should be ***private*** and *not* public.

## Intro video
[Here is a quick, high-level overview of the bot and how it works](https://youtu.be/QbTXkXg0DhU)

## Documentation
### Helper Functions
The core singleton `DiscordServer` has a few helper functions to aid you while developing your module. These helper functions can be viewed in the file, but here are the most common ones you'll probably use:
- `getChannel` fetches the channel based on the `environment variable` of the same name. Ex `getChannel('CHANNEL_MUTE')` will fetch the channel from `process.env.CHANNEL_MUTE`
- `getGuild` returns the guild object the server is currently running in
- `isUserStaff` returns a boolean of weather the user has a staff role listed in environment variables
- `getClient` returns the client object. Please avoid using this and instead use our helper functions for consistency across modules

### Environment variables
For the sake of consistency, please follow the following pattern when naming environment variables:

- **Channels:** `CHANNEL_`, ex `CHANNEL_WELCOME`
- **Misc roles:** `ROLE_`, ex `ROLE_BOT`
- **Staff roles:** !IMPORTANT! Roles here will be used as verification for staff status! `ROLE_STAFF_`, ex `ROLE_STAFF_SUPPORT`

Please see `start.sh` for more

## Style guide
All functions will have a `DocBlock` to describe its purpose
```js
/**
* Short function description
*/
function name () {
  ...
}
```

All functions will be static typed
```js
/**
* Print name and age to console
*/
function name (name: String, age: Number): void {
  console.log(name, age)
}
```

Filenames to match class names
```js
// PatAdventure.ts
export class PatAdventure {
  ...
}
```

## Code guide
* Models can ( and should! ) throw errors

## When to split up modules
Modules should focus on doing one specific thing and doing it well. If you find that your module is trying to do too many different things at once, it may be best to split up the functionality into multiple smaller modules
