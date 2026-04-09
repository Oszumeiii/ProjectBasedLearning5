import React, { createContext, useContext, useState, useCallback } from "react";
import {
  createAssignment as createAssignmentApi,
  getAssignmentStats,
  gradeSubmission as gradeSubmissionApi,
  listAssignmentsByCourse,
  listAssignmentSubmissions,
  submitAssignment as submitAssignmentApi,
  type Assignment,
  type AssignmentSubmission,
} from "../features/classroom/services/assignment.service";
import {
  addClassPostComment,
  createClassPost,
  listClassPostsByCourse,
  type ClassPost,
} from "../features/classroom/services/classPost.service";

interface AssignmentContextType {
  assignments: Assignment[];
  posts: ClassPost[];
  getAssignmentsByCourse: (courseId: number) => Assignment[];
  getPostsByCourse: (courseId: number) => ClassPost[];
  ensureCourseData: (courseId: number) => Promise<void>;
  createAssignment: (assignment: {
    courseId: number;
    title: string;
    description: string;
    deadline: string;
    maxScore: number;
    type: Assignment["assignment_type"];
    attachments: Array<{ name: string; size: string }>;
  }) => Promise<Assignment>;
  submitAssignment: (assignmentId: number, formData: FormData) => Promise<void>;
  gradeSubmission: (
    assignmentId: number,
    studentId: number,
    score: number,
    feedback: string
  ) => Promise<void>;
  addPost: (post: { courseId: number; content: string; isPinned?: boolean }) => Promise<void>;
  addComment: (postId: number, content: string) => Promise<void>;
  getAssignmentStats: typeof getAssignmentStats;
}

const AssignmentContext = createContext<AssignmentContextType | null>(null);

export const useAssignments = () => {
  const ctx = useContext(AssignmentContext);
  if (!ctx) throw new Error("useAssignments must be used within AssignmentProvider");
  return ctx;
};

export const AssignmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [posts, setPosts] = useState<ClassPost[]>([]);

  const ensureCourseData = useCallback(async (courseId: number) => {
    const [assignmentItems, postItems] = await Promise.all([
      listAssignmentsByCourse(courseId),
      listClassPostsByCourse(courseId),
    ]);

    const assignmentsWithSubs = await Promise.all(
      assignmentItems.map(async (assignment) => {
        try {
          const submissions = await listAssignmentSubmissions(assignment.id);
          return { ...assignment, submissions };
        } catch {
          return { ...assignment, submissions: [] as AssignmentSubmission[] };
        }
      })
    );

    setAssignments((prev) => {
      const remaining = prev.filter((item) => item.course_id !== courseId);
      return [...remaining, ...assignmentsWithSubs];
    });
    setPosts((prev) => {
      const remaining = prev.filter((item) => item.course_id !== courseId);
      return [...remaining, ...postItems];
    });
  }, []);

  const getAssignmentsByCourse = useCallback(
    (courseId: number) => assignments.filter((a) => a.course_id === courseId),
    [assignments]
  );

  const getPostsByCourse = useCallback(
    (courseId: number) => posts.filter((p) => p.course_id === courseId),
    [posts]
  );

  const createAssignment = useCallback(
    async (data: {
      courseId: number;
      title: string;
      description: string;
      deadline: string;
      maxScore: number;
      type: Assignment["assignment_type"];
      attachments: Array<{ name: string; size: string }>;
    }) => {
      const created = await createAssignmentApi({
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        maxScore: data.maxScore,
        assignmentType: data.type,
        attachments: data.attachments,
      });
      await ensureCourseData(data.courseId);
      return created;
    },
    [ensureCourseData]
  );

  const submitAssignment = useCallback(async (assignmentId: number, formData: FormData) => {
    await submitAssignmentApi(assignmentId, formData);
    const courseId = Number(formData.get("courseId"));
    if (courseId) {
      await ensureCourseData(courseId);
    }
  }, [ensureCourseData]);

  const gradeSubmission = useCallback(
    async (assignmentId: number, studentId: number, score: number, feedback: string) => {
      const targetAssignment = assignments.find((item) => item.id === assignmentId);
      const targetSubmission = targetAssignment?.submissions?.find((item) => item.student_id === studentId);
      if (!targetAssignment || !targetSubmission) return;
      await gradeSubmissionApi(targetSubmission.id, { score, feedback });
      await ensureCourseData(targetAssignment.course_id);
    },
    [assignments, ensureCourseData]
  );

  const addPost = useCallback(async (post: { courseId: number; content: string; isPinned?: boolean }) => {
    await createClassPost(post);
    await ensureCourseData(post.courseId);
  }, [ensureCourseData]);

  const addComment = useCallback(async (postId: number, content: string) => {
    const targetPost = posts.find((item) => item.id === postId);
    if (!targetPost) return;
    await addClassPostComment(postId, content);
    await ensureCourseData(targetPost.course_id);
  }, [ensureCourseData, posts]);

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        posts,
        getAssignmentsByCourse,
        getPostsByCourse,
        ensureCourseData,
        createAssignment,
        submitAssignment,
        gradeSubmission,
        addPost,
        addComment,
        getAssignmentStats,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};
