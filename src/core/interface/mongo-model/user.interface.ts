export interface User {
  _id: string;
  fullName: string;
  nickname: string;
  password: string;
  createdAt?: Date; // Optional field because they will be set automatically
  updatedAt?: Date;
}
