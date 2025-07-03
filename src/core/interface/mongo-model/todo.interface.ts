export interface Todo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string; // ID of the user who owns this todo
  createdAt?: Date; // Optional field because they will be set automatically
  updatedAt?: Date;
}
