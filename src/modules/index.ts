/**
 * Admin Modules
 */
export * from 'modules/admin/ModLog/ModLog'
export * from 'modules/admin/MuteUser/MuteUser'
export * from 'modules/admin/SetBotActivity/SetBotActivity'
export * from 'modules/admin/DupliMuter/DupliMuter'
export * from 'modules/admin/ServerCloser/ServerCloser'

/**
 * Public Modules
 */
export * from 'modules/public/GreetUser/GreetUser'
export * from 'modules/public/RoleAssigner/RoleAssigner'

/**
 * Module interface
 */
export interface ModuleInterface {
  apply(): any
}
