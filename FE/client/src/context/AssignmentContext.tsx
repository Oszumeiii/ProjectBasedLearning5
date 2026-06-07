import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  createAssignment as createAssignmentApi,
  getAssignmentStats,
  gradeSubmission as gradeSubmissionApi,
  listAssignmentsByCourse,
  listAssignmentSubmissions,
  submitAssignment as submitAssignmentApi,
  type Assignment,
  type AssignmentAttachmentInput,
  type AssignmentSubmission,
} from "../features/classroom/services/assignment.service";
import {
  addClassPostComment,
  createClassPost,
  listClassPostsByCourse,
  type ClassPost,
  type ClassPostAttachmentInput,
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
    attachments: AssignmentAttachmentInput[];
  }) => Promise<Assignment>;
  submitAssignment: (assignmentId: number, formData: FormData) => Promise<void>;
  gradeSubmission: (
    assignmentId: number,
    submissionId: number,
    payload: { feedback: string }
  ) => Promise<void>;
  addPost: (post: {
    courseId: number;
    content: string;
    isPinned?: boolean;
    attachments?: ClassPostAttachmentInput[];
  }) => Promise<void>;
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

  // Refs to always access latest state (avoids stale closures)
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const assignmentsRef = useRef(assignments);
  assignmentsRef.current = assignments;
  const courseRequestVersionRef = useRef<Record<number, number>>({});

  const ensureCourseData = useCallback(async (courseId: number) => {
    const requestVersion = (courseRequestVersionRef.current[courseId] ?? 0) + 1;
    courseRequestVersionRef.current[courseId] = requestVersion;
    const [assignmentResult, postResult] = await Promise.allSettled([
      listAssignmentsByCourse(courseId),
      listClassPostsByCourse(courseId),
    ]);

    if (assignmentResult.status === "rejected") {
      console.error("Failed to load assignments", assignmentResult.reason);
    }
    if (postResult.status === "rejected") {
      console.error("Failed to load class posts", postResult.reason);
    }

    const assignmentItems =
      assignmentResult.status === "fulfilled" ? assignmentResult.value : [];
    const postItems = postResult.status === "fulfilled" ? postResult.value : [];

    const assignmentsWithSubs = await Promise.all(
      assignmentItems.map(async (assignment) => {
        try {
          const submissions = await listAssignmentSubmissions(assignment.id);
          return { ...assignment, submissions };
        } catch (error) {
          console.error("Failed to load assignment submissions", error);
          return { ...assignment, submissions: [] as AssignmentSubmission[] };
        }
      })
    );

    if (courseRequestVersionRef.current[courseId] !== requestVersion) {
      return;
    }

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
      attachments: AssignmentAttachmentInput[];
    }) => {
      const created = await createAssignmentApi({
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        maxScore: data.maxScore,
        assignmentType: data.type,
        attachmentFiles: data.attachments.map((item) => item.file),
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
    async (assignmentId: number, submissionId: number, payload: { feedback: string }) => {
      const targetAssignment = assignmentsRef.current.find(
        (item) => Number(item.id) === Number(assignmentId)
      );
      if (!targetAssignment) {
        throw new Error("Không tìm thấy bài tập để phản hồi");
      }
      const result = await gradeSubmissionApi(Number(submissionId), {
        feedback: payload.feedback.trim(),
      });
      const updatedSubmission = result?.submission as AssignmentSubmission | undefined;
      if (updatedSubmission) {
        setAssignments((prev) =>
          prev.map((assignment) => {
            if (Number(assignment.id) !== Number(assignmentId)) return assignment;
            return {
              ...assignment,
              submissions: (assignment.submissions ?? []).map((submission) =>
                Number(submission.id) === Number(submissionId)
                  ? {
                      ...submission,
                      ...updatedSubmission,
                      id: Number(updatedSubmission.id),
                      assignment_id: Number(updatedSubmission.assignment_id),
                      student_id: Number(updatedSubmission.student_id),
                      report_id:
                        updatedSubmission.report_id !== null &&
                        updatedSubmission.report_id !== undefined
                          ? Number(updatedSubmission.report_id)
                          : null,
                      score:
                        updatedSubmission.score !== null && updatedSubmission.score !== undefined
                          ? Number(updatedSubmission.score)
                          : null,
                    }
                  : submission
              ),
            };
          })
        );
      }
      await ensureCourseData(Number(targetAssignment.course_id));
    },
    [ensureCourseData]
  );

  const addPost = useCallback(async (post: {
    courseId: number;
    content: string;
    isPinned?: boolean;
    attachments?: ClassPostAttachmentInput[];
  }) => {
    await createClassPost({
      courseId: post.courseId,
      content: post.content,
      isPinned: post.isPinned,
      attachmentFiles: post.attachments?.map((item) => item.file),
    });
    await ensureCourseData(post.courseId);
  }, [ensureCourseData]);

  const addComment = useCallback(async (postId: number, content: string) => {
    const targetPost = postsRef.current.find((item) => item.id === postId);
    if (!targetPost) {
      console.warn(`addComment: post ${postId} not found in current posts`);
      return;
    }
    await addClassPostComment(postId, content);
    await ensureCourseData(targetPost.course_id);
  }, [ensureCourseData]);

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
