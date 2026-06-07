import axiosInstance from "../../../services/axios";
import { downloadBinaryFile } from "./report.service";

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

export interface ClassPostAttachmentInput {
  file: File;
  name: string;
  size: string;
}

export const listClassPostsByCourse = async (courseId: number): Promise<ClassPost[]> => {
  const response = await axiosInstance.get<{ items: ClassPost[] }>(`/assignments/class-posts/course/${courseId}`);
  return response.data.items.map((item) => ({
    ...item,
    id: Number(item.id),
    course_id: Number(item.course_id),
    author_id: Number(item.author_id),
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
    comments: Array.isArray(item.comments)
      ? item.comments.map((comment) => ({
          ...comment,
          id: Number(comment.id),
          post_id: Number(comment.post_id),
          author_id: Number(comment.author_id),
        }))
      : [],
  }));
};

export const createClassPost = async (body: {
  courseId: number;
  content: string;
  isPinned?: boolean;
  attachments?: Array<{ name: string; url?: string; size?: string }>;
  attachmentFiles?: File[];
}) => {
  const formData = new FormData();
  formData.append("courseId", String(body.courseId));
  formData.append("content", body.content);
  if (body.isPinned !== undefined) formData.append("isPinned", String(body.isPinned));
  if (body.attachments?.length) {
    formData.append("attachments", JSON.stringify(body.attachments));
  }
  if (body.attachmentFiles?.length) {
    body.attachmentFiles.forEach((file) => formData.append("files", file));
  }
  const response = await axiosInstance.post(`/assignments/class-posts`, formData);
  return response.data;
};

export const addClassPostComment = async (postId: number, content: string) => {
  const response = await axiosInstance.post(`/assignments/class-posts/${postId}/comments`, { content });
  return response.data;
};

export const downloadClassPostAttachmentInBrowser = async (
  postId: number,
  attachmentIndex: number,
  preferredFileName?: string
) => {
  await downloadBinaryFile(
    `/assignments/class-posts/${postId}/attachments/${attachmentIndex}/download`,
    preferredFileName
  );
};
