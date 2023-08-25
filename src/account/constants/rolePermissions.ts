export enum AccessTypes {
  All = 'all',
  Self = 'self',
  None = 'none'
};

export enum Roles {
  Customer = 'customer',
  Manager = 'manager'
}


export interface Permission {
  resource: string;
  operation: string;
  access: AccessTypes ;
}

export type RolePermissions = Permission[];

/////////////////////////////////////////////////////
/// Currently planned to setup in monolithic app, ///
/// keeping role permissions as constant is okay  ///
/// for now.                                      ///
/////////////////////////////////////////////////////
export const rolePermissionMap = {
  customer: [
    { resource: 'account', operation: 'read', access: AccessTypes.Self },
    { resource: 'account', operation: 'create', access: AccessTypes.None },
    { resource: 'account', operation: 'update', access: AccessTypes.Self },
    { resource: 'account', operation: 'delete', access: AccessTypes.Self },
    { resource: 'product', operation: 'read', access: AccessTypes.None },
    { resource: 'product', operation: 'create', access: AccessTypes.None },
    { resource: 'product', operation: 'update', access: AccessTypes.Self },
    { resource: 'product', operation: 'delete', access: AccessTypes.Self }
  ], 
  manager: [
    { resource: 'account', operation: 'read', access: AccessTypes.All },
    { resource: 'account', operation: 'create', access: AccessTypes.None },
    { resource: 'account', operation: 'update', access: AccessTypes.All },
    { resource: 'account', operation: 'delete', access: AccessTypes.All },
    { resource: 'product', operation: 'read', access: AccessTypes.None },
    { resource: 'product', operation: 'create', access: AccessTypes.None },
    { resource: 'product', operation: 'update', access: AccessTypes.All },
    { resource: 'product', operation: 'delete', access: AccessTypes.All },
    { resource: 'log', operation: 'read', access: AccessTypes.All },
    { resource: 'log', operation: 'create', access: AccessTypes.All },
    { resource: 'log', operation: 'update', access: AccessTypes.All },
    { resource: 'log', operation: 'delete', access: AccessTypes.All }
  ]
}