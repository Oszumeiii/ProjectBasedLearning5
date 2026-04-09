import axiosInstance from "../../../services/axios";

export interface ClassPostComment {
  id: number;
  post_id: number;
  author_id: number;
  author_name?: string;
  author_role?: "student" | "lecturer" | "manager" | "admin" | string;
  content: string;
  created_at: string;
}

export interface ClassPost {
  id: number;
  course_id: number;
  author_id: number;
  author_name?: string;
  author_role?: "student" | "lecturer" | "manager" | "admin" | string;
  content: string;
  is_pinned: boolean;
  attachments: Array<{ name: string; url?: string; size?: string }>;
  created_at: string;
  comments: ClassPostComment[];
}

export const listClassPostsByCourse = async (courseId: number): Promise<ClassPost[]> => {
  const response = await axiosInstance.get<{ items: ClassPost[] }>(`/assignments/class-posts/course/${courseId}`);
  return response.data.items.map((item) => ({
    ...item,
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
    comments: Array.isArray(item.comments) ? item.comments : [],
  }));
};

export const createClassPost = async (body: {
  courseId: number;
  content: string;
  isPinned?: boolean;
  attachments?: Array<{ name: string; url?: string; size?: string }>;
}) => {
  const response = await axiosInstance.post(`/assignments/class-posts`, body);
  return response.data;
};

export const addClassPostComment = async (postId: number, content: string) => {
  const response = await axiosInstance.post(`/assignments/class-posts/${postId}/comments`, { content });
  return response.data;
};
