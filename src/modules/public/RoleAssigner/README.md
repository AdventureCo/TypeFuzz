## RoleAssigner module
Allows you to set self-assignable user roles in your server. 

You are unable to list roles higher than the bots role, set using `ROLE_BOT`

### Commands
Requires staff permissions
- `addRole` adds role to list, used as `addRole ROLE_ID`
- `removeRole` removes role from list, used as `removeRole ROLE_ID`
- `updateRole` updates role info ( name, color ), used as `updateRole ROLE_ID`

### Environment variables
- `CHANNEL_ROLES` channel to list the roles in
- `ROLE_BOT` the current bots role