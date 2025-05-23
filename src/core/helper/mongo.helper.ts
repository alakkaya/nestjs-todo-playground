import { hashSync } from 'bcryptjs';

export function preSave(next: any) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = hashSync(this.password, 12); // salt rounds
  next();
}

export const leanObjectsId = (results) => {
  results.forEach((result) => leanObjectId(result));
};

export const leanObjectId = (result) => {
  if (result) {
    result._id = result._id.toString();
  }
};
