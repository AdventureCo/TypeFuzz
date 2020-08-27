## NewUser module
Create `NewUser` module to set `NewUser` role on join that:
- disables image sending
- disables link embedding

And removes after X hours

### Environment variables
- `ROLE_NEWUSER` new user role ID
- `REMOVE_NEW_AFTER` remove `new user` role after `X` hours, defaults to 36
