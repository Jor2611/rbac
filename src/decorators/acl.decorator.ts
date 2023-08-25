import { SetMetadata } from "@nestjs/common";

///////////////////////////////////////////////////////////////
/// We could assign custom types to resource and operation, ///
/// but currently preferred to keep them as a string for    ///
/// keeping RBAC more flexible, so setting correct values   ///
/// is the developer's responsibility.                      ///
///////////////////////////////////////////////////////////////
export const ACL = (resource: string, operation: string) => SetMetadata('acl', { resource, operation });