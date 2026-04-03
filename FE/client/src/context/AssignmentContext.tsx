import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  MOCK_ASSIGNMENTS,
  MOCK_POSTS,
  type Assignment,
  type AssignmentSubmission,
  type ClassPost,
} from "../mocks/assignments";

const ASSIGNMENTS_KEY = "pbl5_assignments";
const POSTS_KEY = "pbl5_posts";
const MAPPED_COURSES_KEY = "pbl5_mapped_courses";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupted data */
  }
  return fallback;
}

function saveToStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota exceeded */
  }
}

interface AssignmentContextType {
  assignments: Assignment[];
  posts: ClassPost[];
  getAssignmentsByCourse: (courseId: number) => Assignment[];
  getPostsByCourse: (courseId: number) => ClassPost[];
  ensureCourseData: (courseId: number) => void;
  createAssignment: (
    assignment: Omit<Assignment, "id" | "createdAt">
  ) => Assignment;
  submitAssignment: (
    assignmentId: number,
    studentId: number,
    studentName: string,
    studentEmail: string,
    fileName: string,
    fileSize: string
  ) => void;
  gradeSubmission: (
    assignmentId: number,
    studentId: number,
    score: number,
    feedback: string
  ) => void;
  addPost: (post: Omit<ClassPost, "id" | "createdAt">) => void;
  addComment: (
    postId: number,
    authorName: string,
    authorRole: "lecturer" | "student",
    content: string
  ) => void;
}

const AssignmentContext = createContext<AssignmentContextType | null>(null);

export const useAssignments = () => {
  const ctx = useContext(AssignmentContext);
  if (!ctx)
    throw new Error("useAssignments must be used within AssignmentProvider");
  return ctx;
};

export const AssignmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    loadFromStorage(ASSIGNMENTS_KEY, MOCK_ASSIGNMENTS)
  );
  const [posts, setPosts] = useState<ClassPost[]>(() =>
    loadFromStorage(POSTS_KEY, MOCK_POSTS)
  );
  const mappedCourses = useRef<Set<number>>(
    new Set(loadFromStorage<number[]>(MAPPED_COURSES_KEY, [1]))
  );

  useEffect(() => {
    saveToStorage(ASSIGNMENTS_KEY, assignments);
  }, [assignments]);

  useEffect(() => {
    saveToStorage(POSTS_KEY, posts);
  }, [posts]);

  // When a course page is opened, ensure mock data exists for that courseId.
  // Clones template mock data (courseId=1) into the visited courseId if no data exists.
  const ensureCourseData = useCallback(
    (courseId: number) => {
      if (mappedCourses.current.has(courseId)) return;
      mappedCourses.current.add(courseId);
      saveToStorage(
        MAPPED_COURSES_KEY,
        Array.from(mappedCourses.current)
      );

      const hasAssignments = assignments.some((a) => a.courseId === courseId);
      if (!hasAssignments) {
        const templateAssignments = MOCK_ASSIGNMENTS.filter(
          (a) => a.courseId === 1
        );
        const templatePosts = MOCK_POSTS.filter((p) => p.courseId === 1);

        if (templateAssignments.length > 0) {
          const cloned = templateAssignments.map((a, i) => ({
            ...a,
            id: Date.now() + i + 1000,
            courseId,
            submissions: a.submissions.map((s, j) => ({
              ...s,
              id: Date.now() + i * 100 + j + 2000,
            })),
          }));
          setAssignments((prev) => [...prev, ...cloned]);
        }

        if (templatePosts.length > 0) {
          const clonedPosts = templatePosts.map((p, i) => ({
            ...p,
            id: Date.now() + i + 5000,
            courseId,
            comments: p.comments.map((c, j) => ({
              ...c,
              id: Date.now() + i * 100 + j + 6000,
            })),
          }));
          setPosts((prev) => [...prev, ...clonedPosts]);
        }
      }
    },
    [assignments]
  );

  const getAssignmentsByCourse = useCallback(
    (courseId: number) => assignments.filter((a) => a.courseId === courseId),
    [assignments]
  );

  const getPostsByCourse = useCallback(
    (courseId: number) => posts.filter((p) => p.courseId === courseId),
    [posts]
  );

  const createAssignment = useCallback(
    (data: Omit<Assignment, "id" | "createdAt">): Assignment => {
      const newAssignment: Assignment = {
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setAssignments((prev) => [newAssignment, ...prev]);
      return newAssignment;
    },
    []
  );

  const submitAssignment = useCallback(
    (
      assignmentId: number,
      studentId: number,
      studentName: string,
      studentEmail: string,
      fileName: string,
      fileSize: string
    ) => {
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id !== assignmentId) return a;
          const existingIdx = a.submissions.findIndex(
            (s) => s.studentId === studentId
          );
          const updatedSubmission: AssignmentSubmission = {
            id: Date.now(),
            assignmentId,
            studentId,
            studentName,
            studentEmail,
            submittedAt: new Date().toISOString(),
            status: "submitted",
            score: null,
            feedback: null,
            fileName,
            fileSize,
          };
          const newSubs = [...a.submissions];
          if (existingIdx >= 0) {
            newSubs[existingIdx] = updatedSubmission;
          } else {
            newSubs.push(updatedSubmission);
          }
          return { ...a, submissions: newSubs };
        })
      );
    },
    []
  );

  const gradeSubmission = useCallback(
    (
      assignmentId: number,
      studentId: number,
      score: number,
      feedback: string
    ) => {
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id !== assignmentId) return a;
          return {
            ...a,
            submissions: a.submissions.map((s) =>
              s.studentId === studentId
                ? { ...s, status: "graded" as const, score, feedback }
                : s
            ),
          };
        })
      );
    },
    []
  );

  const addPost = useCallback(
    (data: Omit<ClassPost, "id" | "createdAt">) => {
      const newPost: ClassPost = {
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
    },
    []
  );

  const addComment = useCallback(
    (
      postId: number,
      authorName: string,
      authorRole: "lecturer" | "student",
      content: string
    ) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: Date.now(),
                    authorName,
                    authorRole,
                    content,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : p
        )
      );
    },
    []
  );

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ASSIGNMENTS_KEY && e.newValue) {
        try {
          setAssignments(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
      if (e.key === POSTS_KEY && e.newValue) {
        try {
          setPosts(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};
