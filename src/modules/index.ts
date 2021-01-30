/**
 * Admin Modules
 */
export * from 'modules/admin/ModLog/ModLog'
export * from 'modules/admin/MuteUser/MuteUser'
export * from 'modules/admin/SetBotActivity/SetBotActivity'
export * from 'modules/admin/DupliMuter/DupliMuter'
export * from 'modules/admin/ServerCloser/ServerCloser'
export * from 'modules/admin/PanicMode/PanicMode'
export * from 'modules/admin/MetaLog/MetaLog'
export * from 'modules/admin/PingChecker/PingChecker'

/**
 * Public Modules
 */
export * from 'modules/public/GreetUser/GreetUser'
export * from 'modules/public/RoleAssigner/RoleAssigner'
export * from 'modules/public/NewUser/NewUser'
export * from 'modules/public/PublicModLog/PublicModLog'

/**
 * Module interface
 */
export interface ModuleInterface {
  apply(): any
}
