export interface User {
  _id: string;
  fullname: string;
  nickname: string;
  password: string;
  createdAt?: Date; // Optional field because they will be set automatically
  updatedAt?: Date;
}
