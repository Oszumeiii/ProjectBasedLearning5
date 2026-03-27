import { useState } from "react";
import { Bell, Key, Loader2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { classroomService } from "../../features/classroom/services/classroom.service";
import { toast } from "react-hot-toast";

export const TopNavBar = () => {
  const [courseCode, setCourseCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoinCourse = async () => {
    const trimmedCode = courseCode.trim();

    // 1. Validation cơ bản tại Client
    if (!trimmedCode) {
      toast.error("Vui lòng nhập mã lớp học");
      return;
    }

    try {
      setIsJoining(true);

      // 2. Gọi API tham gia lớp
      // Lưu ý: Endpoint trong service của bạn là joinCourseByCode
      const response = await classroomService.joinCourseByCode(trimmedCode);

      // 3. Xử lý thành công
      toast.success(response.message || "Tham gia lớp học thành công!");
      setCourseCode(""); // Reset input

      // 4. Cập nhật giao diện
      // Nếu bạn dùng Global State (Redux/Zustand), hãy trigger fetch lại danh sách lớp tại đây.
      // Nếu không, điều hướng về Lobby là cách tốt nhất để useEffect ở đó tự gọi lại dữ liệu.
      navigate("/student/lobby");

      // Reload nhẹ để đảm bảo dữ liệu mới nhất nếu không dùng state management chuyên sâu
      if (window.location.pathname === "/student/lobby") {
        window.location.reload();
      }
    } catch (error: any) {
      // 5. Xử lý lỗi chi tiết từ Backend (400, 404, 409...)
      const message =
        error.response?.data?.message ||
        "Không thể tham gia lớp học vào lúc này";
      toast.error(message);

      console.error("Join course error:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-8 sticky top-0 z-40 bg-[#0b1326]/80 backdrop-blur-md h-20 border-b border-slate-800/30">
      <div className="flex items-center gap-8">
        <h2 className="font-headline font-black text-xl text-[#dae2fd]">
          Trang sinh viên
        </h2>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/student/lobby"
            className={({ isActive }) =>
              `font-manrope font-bold text-sm transition-all pb-1 ${
                isActive
                  ? "text-[#adc6ff] border-b-2 border-[#0566d9]"
                  : "text-slate-400 hover:text-[#adc6ff]"
              }`
            }
          >
            Tổng quan về lớp học
          </NavLink>

          <NavLink
            to="/student/library"
            className={({ isActive }) =>
              `font-manrope font-bold text-sm transition-all pb-1 ${
                isActive
                  ? "text-[#adc6ff] border-b-2 border-[#0566d9]"
                  : "text-slate-400 hover:text-[#adc6ff]"
              }`
            }
          >
            Tài liệu tham khảo
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Khối nhập mã lớp */}
        <div className="flex items-center bg-[#171f33] rounded-full px-4 py-1.5 border border-slate-800/20 focus-within:border-[#0566d9] transition-all">
          <Key size={14} className="text-[#c6c6cd] mr-2" />
          <input
            className="bg-transparent border-none focus:ring-0 text-[12px] w-32 font-mono tracking-widest text-[#adc6ff] uppercase placeholder:normal-case placeholder:font-body outline-none"
            placeholder="Mã tham gia"
            maxLength={10}
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isJoining && handleJoinCourse()
            }
            disabled={isJoining}
          />
          <button
            onClick={handleJoinCourse}
            disabled={isJoining || !courseCode.trim()}
            className="ml-2 text-xs font-bold text-[#d8e2ff] bg-[#0566d9]/20 px-3 py-1 rounded-full hover:bg-[#0566d9]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex justify-center items-center"
          >
            {isJoining ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              "Tham gia"
            )}
          </button>
        </div>

        {/* Thông báo & Profile */}
        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 text-[#c6c6cd] hover:text-[#dae2fd] relative group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0b1326]"></span>
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-[#0566d9]/30 p-0.5 overflow-hidden ml-2 cursor-pointer hover:border-[#0566d9] transition-all">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
