import { apiClient } from "./apiClient";
import { UserModel } from "@/Types/user";

export type { UserModel };

export const userService = {
  async getUsers(): Promise<UserModel[]> {
    try {
      const response = await apiClient.get<UserModel[]>("/users");
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {}
    return [];
  },

  async getUserById(id: string): Promise<UserModel | null> {
    try {
      const response = await apiClient.get<UserModel>(`/users/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}
    return null;
  },

  async createUser(userData: Omit<UserModel, "id"> & { id?: string }): Promise<UserModel> {
    const newUser: UserModel = {
      ...userData,
      id: userData.id || `EMP-${String(Math.floor(100 + Math.random() * 900))}`,
    };

    try {
      const response = await apiClient.post<UserModel>("/users", newUser);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return newUser;
  },

  async updateUser(id: string, userData: Partial<UserModel>): Promise<UserModel> {
    try {
      const response = await apiClient.put<UserModel>(`/users/${id}`, userData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {}

    return { ...userData, id } as UserModel;
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`/users/${id}`);
      if (response.success) {
        return true;
      }
    } catch {}

    return true;
  },
};
