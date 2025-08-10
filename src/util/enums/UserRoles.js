/**
 * @readonly
 * @enum
 */
const UserRoles = Object.freeze({
  owner: 'Owner',
  employee: 'Employee',
  customer: 'Customer'
});

const UserRolesEnum = Object.values(UserRoles);
export default UserRolesEnum;
