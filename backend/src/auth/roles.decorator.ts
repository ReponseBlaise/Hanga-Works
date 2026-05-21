export function Roles(...roles: ('LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' | 'ADMIN')[]) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value.roles = roles;
    return descriptor;
  };
}
