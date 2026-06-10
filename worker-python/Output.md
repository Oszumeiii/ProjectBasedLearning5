TRƯỜNG ĐẠI HỌC BÁCH KHOA
KHOA CÔNG NGHỆ THÔNG TIN
BÁO CÁO
PBL5: ĐỒ ÁN CÔNG NGHỆ PHẦN MỀM
ỨNG DỤNG MÔ HÌNH RAG TRONG TRIỂN KHAI HỆ THỐNG WEB
QUẢN LÝ, TRUY VẤN BÁO CÁO ĐỒ ÁN VÀ NCKH CỦA SINH VIÊN
Thành Viên Nhóm
Mã SV Tên thành viên Lớp
102230072 Trần Văn Huấn 23T_Nhat2
102230092 Phan Thanh Nhật 23T_Nhat2
102230076 Hồ Khang Hy 23T_Nhat2
Giảng viên hướng dẫn: TS. Phạm Minh Tuấn
ĐÀ NẴNG, 06/2025



# DANH MỤC BẢNG
Hình 1: Khảo sát thực tế tại trường học. ....................................................................................2
Bảng 1: Danh sách yêu cầu chức năng .....................................................................................20
Bảng 2: Danh sách yêu cầu phi chức năng ...............................................................................22
Bảng 3: Danh sách các tác nhân của dự án...............................................................................23
Bảng 4: Danh sách các usecase của chương trình ....................................................................24
Bảng 5. Mô tả các bảng trong cơ sở dữ liệu .............................................................................46
Bảng 6. Công nghệ sử dụng trong hệ thống .............................................................................51



# DANH MỤC HÌNH ẢNH
Hình 1: Khảo sát thực tế tại trường học. ....................................................................................2
Hình 2: Kiến trúc Retrieval-Augmented Generation (RAG) ......................................................9
Hình 3:Embedding model BGE-M3 .........................................................................................10
Hình 4 : Sơ đồ tiền xử lý tài liệu ( Preprocessing ) ..................................................................17
Hình 5 : Sơ đồ truy xuất và tạo câu trả lời (Retrieval & Generation Pipeline). .......................18
Hình 6: Sơ đồ usecase tổng quát của dự án ..............................................................................26
Hình 7: Biểu đồ hoạt động UC001 “Đăng nhập hệ thống DUTSTUDY và phân quyền người
dùng “ .......................................................................................................................................35
Hình 8: Biểu đồ hoạt động UC002 “Tạo lớp học phần”..........................................................36
Hình 9: Biểu đồ hoạt động UC003 “Nộp báo cáo theo lớp học phần” .....................................37
Hình 10:Biểu đồ hoạt động UC004 “Duyệt và đánh giá báo cáo của giảng viên” ...................37
Hình 11:Biểu đồ hoạt động UC005 “Tra cứu và tham khảo báo cáo ” ....................................38
Hình 12:Biểu đồ hoạt động UC005 “Truy vấn hỏi đáp báo cáo sinh viên” .............................39
Hình 13: Biểu đồ trình tự đăng nhập hệ thống và phân quyền người dùng .............................40
Hình 14: Biểu đồ trình tự tạo lớp học phần .............................................................................41
Hình 15: Biểu đồ trình tự nộp báo cáo theo lớp học phần .......................................................41
Hình 16: Biểu đồ trình tự duyệt và đánh giá báo cáo của giảng viên .......................................42
Hình 17: Biểu đồ trình tự tra cứu và tham khảo báo cáo ..........................................................43
Hình 18: Biểu đồ trình tự truy vấn hỏi đáp thông tin tài liệu ...................................................44
Hình 19: Cơ sở dữ liệu tổng quát .............................................................................................45
Hình 20: Mô hình kiến trúc monolith .......................................................................................48
Hình 21: Kiến trúc tổng quát hệ thống .....................................................................................48
Hình 22: Giao diện trang đăng nhập hệ thống ..........................................................................53
Hình 23: Giao diện trang Dashboard (sinh viên) ......................................................................54
Hình 24: Giao diện Dashboard (giảng viên) .............................................................................54
Hình 25: Giao diện Dashboard (admin) ...................................................................................55
Hình 26: Giao diện trang danh sách lớp học phần (sinh viên) .................................................55
Hình 27: Giao diện trang danh sách lớp học phần (giảng viên) ...............................................56
Hình 28: Giao diện trang chi tiết lớp học phần (sinh viên) ......................................................56
Hình 29: Giao diện trang chi tiết lớp học phần (giảng viên) ....................................................57
Hình 30: Giao diện trang nộp báo cáo (sinh viên) ....................................................................57
Hình 31: Giao diện trang quản lý và nhận xét báo cáo (giảng viên) ........................................58
Hình 32: Giao diện trang tài liệu tham khảo (sinh viên) ..........................................................58

Hình 33: Giao diện trang chatbot AI ........................................................................................59
Hình 34: Giao diện trang quản lý người dùng ..........................................................................60
Hình 35: Sơ đồ triển khai .........................................................................................................60



# GIỚI THIỆU
Trong kỷ nguyên chuyển đổi số giáo dục, việc ứng dụng công nghệ thông tin để tối ưu
hóa quy trình dạy và học tại các trường đại học đã trở thành một xu hướng tất yếu.
Đặc biệt, đối với các khối ngành kỹ thuật và công nghệ, các học phần đồ án và dự án
theo mô hình học tập qua dự án (Project-Based Learning - PBL) đóng vai trò cốt lõi.
Đây là môi trường giúp sinh viên cọ xát thực tế, phát triển tư duy giải quyết vấn đề và
là thước đo chính xác nhất cho năng lực chuyên môn trước khi tốt nghiệp.
Tuy nhiên, qua khảo sát thực tế quy trình vận hành các học phần dự án hiện nay, công
tác quản lý và khai thác tài nguyên học liệu đang phải đối mặt với hai thách thức, bất
cập lớn:
Thứ nhất, gánh nặng trong quản lý lớp học và tương tác: Hiện tại, giảng viên
thường phải dành nhiều thời gian cho các tác vụ hành chính thủ công như quản lý
danh sách lớp, chia nhóm sinh viên và thu thập bài nộp cuối kỳ thông qua các kênh rời
rạc (như Email, Zalo, Google Drive). Phương thức lưu trữ phân tán này không chỉ gây
khó khăn cho giảng viên trong việc theo dõi tiến độ, chấm điểm trực quan mà còn
tiềm ẩn nguy cơ cao về thất lạc dữ liệu và thiếu tính đồng bộ.
Thứ hai, sự lãng phí tài nguyên tri thức số: Hàng năm, có hàng ngàn báo cáo
nghiên cứu, đồ án xuất sắc của sinh viên được nghiệm thu và đánh giá cao. Tuy nhiên,
sau khi kết thúc học phần, các tài liệu này thường bị lưu trữ tĩnh dưới dạng các "file
chết" (PDF/Word) trong các kho dữ liệu cục bộ hoặc ổ cứng cá nhân. Sinh viên khóa
sau hoàn toàn thiếu công cụ để tiếp cận, tham khảo hoặc kế thừa một cách hệ thống.
Hệ quả là hiện tượng trùng lặp ý tưởng giữa các khóa diễn ra phổ biến, gây lãng phí
thời gian, công sức và tri thức của cả người dạy lẫn người học.
Nhận thức được những hạn chế trên, đề tài " Xây dựng hệ thống web quản lý báo
cáo đồ án và NCKH của sinh viên .” được nghiên cứu và xây dựng nhằm mang lại
một giải pháp toàn diện và triệt để.
Hệ thống không chỉ dừng lại ở việc mô phỏng một không gian quản lý lớp học trực
tuyến trực quan, khoa học (tương tự các nền tảng LMS hiện đại), mà còn tạo ra bước
đột phá bằng cách tích hợp sâu công nghệ Trí tuệ nhân tạo (AI). Trong tương lai ,
thông qua kiến trúc RAG (Retrieval-Augmented Generation) [20] và cơ sở dữ liệu
vector, hệ thống thiết lập một quy trình tự động hóa khép kín: Ngay khi một báo cáo
xuất sắc được giảng viên phê duyệt, AI sẽ lập tức phân tích, trích xuất và số hóa tài
liệu vào thư viện chung. Từ đó, cho phép sinh viên toàn trường thực hiện truy vấn ngữ
nghĩa (Semantic Search) bằng ngôn ngữ tự nhiên và tương tác, hỏi đáp trực tiếp trên
nội dung tài liệu (Interactive Q&A).
Dự án kỳ vọng sẽ thay đổi hoàn toàn cách thức quản lý học phần dự án truyền thống,
đồng thời chuyển hóa các tệp dữ liệu tĩnh thành một kho tri thức động có tính kế thừa
cao, thúc đẩy phong trào nghiên cứu khoa học và học tập chủ động trong môi trường
học đường.



# MỞ ĐẦU


## 1. Lý do chọn đề tài
Bối cảnh của đề tài (Dựa trên số liệu khảo sát thực tế)
Để có cơ sở thực tiễn khách quan phục vụ cho việc định hình các chức năng cốt lõi
của hệ thống, nhóm nghiên cứu đã tiến hành một cuộc khảo sát thực tế đối với sinh
viên trong trường về thực trạng tiếp cận nguồn tài liệu và học liệu chính thống.
Theo kết quả ghi nhận từ dữ liệu khảo sát với 134 lượt phản hồi cho câu hỏi yêu cầu
đánh giá về việc tìm kiếm tài liệu tham khảo đúng chuyên ngành và lớp học phần tại
trường hiện nay, số liệu đã chỉ ra những bất cập vô cùng nghiêm trọng. Cụ thể, mức
độ khó khăn chiếm tỷ lệ gần như tuyệt đối khi có tới 52,9% sinh viên phản hồi việc
tìm kiếm tài liệu là "Rất khó khăn" (tương ứng vùng màu xanh dương trên biểu đồ) và
35,3% đánh giá ở mức "Khó khăn" (vùng màu đỏ). Như vậy, tổng cộng có tới 88,2%
sinh viên được khảo sát đang gặp áp lực lớn và chưa tìm được phương thức hiệu quả
để tiếp cận các nguồn đồ án hay báo cáo mẫu đúng chuyên ngành.
Trái ngược với sự khó khăn đó, tỷ lệ sinh viên có thể tiếp cận tài liệu dễ dàng lại nằm
ở mức tối thiểu. Chỉ có vỏn vẹn 8,8% người tham gia khảo sát đánh giá ở mức "Bình
thường" (vùng màu vàng) và một tỷ lệ rất nhỏ, khoảng 3%, cảm thấy "Dễ dàng". Đáng
chú ý, kết quả hoàn toàn không ghi nhận bất kỳ một phản hồi nào đánh giá việc tìm
kiếm tài liệu là "Rất dễ dàng".
Hình 1: Khảo sát thực tế tại trường học.
Biểu đồ là minh chứng rõ nét nhất cho thấy sự đứt gãy trong việc lưu trữ và chia sẻ tri
thức giữa các khóa học trực thuộc nhà trường. Tài liệu sinh viên cần thì rất nhiều,
nhưng công cụ để tiếp cận lại hầu như không có. Điều này khẳng định việc xây dựng
nền tảng DUTSTUDY là một yêu cầu mang tính bắt buộc và vô cùng cấp thiết, nhằm
giải quyết triệt để bài toán tìm kiếm tài liệu cho 88,2% sinh viên đang loay hoay hiện
nay.



## 2. Mục đích và Mục tiêu của đề tài


### 2.1. Mục đích đề tài
Mục đích cốt lõi của dự án DUTSTUDY nhằm xây dựng một hệ sinh thái giáo dục số
toàn diện, giúp tối ưu hóa công tác quản lý lớp học phần định hướng dự án (PBL) và
hiện đại hóa cách thức khai thác tài nguyên học liệu tại trường đại học. Dự án tập
trung vào việc chuyển đổi các báo cáo đồ án xuất sắc từ "tài nguyên tĩnh" thành một
"kho tri thức kế thừa động", hỗ trợ sinh viên tự học, tự nghiên cứu hiệu quả thông qua
việc xây dựng một bộ máy tìm kiếm nâng cao (Search Engine).


### 2.2. Mục tiêu đề tài
Về mặt chức năng, hệ thống hướng tới việc xây dựng một không gian cộng tác
trực quan và toàn diện. Phân hệ Quản lý Lớp học được thiết kế để hỗ trợ giảng viên dễ
dàng điều phối lớp học, giao bài tập và đặc biệt là khả năng nhập liệu danh sách sinh
viên số lượng lớn thông qua tệp CSV bằng các tiến trình xử lý ngầm. Bên cạnh đó,
phân hệ Đánh giá và Phê duyệt tích hợp công cụ chấm điểm và nhận xét trực tuyến, đi
kèm với cơ chế bộ lọc một chạm giúp giảng viên phê duyệt báo cáo vào thư viện.
Thao tác này sẽ tự động phân quyền và chuyển đổi trạng thái tài liệu từ không gian
lưu trữ nội bộ sang trạng thái chia sẻ công khai toàn trường.
Về khía cạnh kỹ thuật, dự án tập trung thiết kế và tối ưu hóa hệ quản trị cơ sở dữ liệu
quan hệ, kết hợp chặt chẽ với cấu trúc lập chỉ mục toàn văn và quản lý siêu dữ liệu
chuyên sâu. Mục tiêu cốt lõi là đảm bảo hiệu năng hệ thống luôn ở mức tối ưu, duy trì
thời gian phản hồi dưới ba giây đối với các truy vấn tìm kiếm phức tạp và bộ lọc dữ
liệu đa tầng. Đồng thời, kiến trúc hệ thống cũng đặt ra yêu cầu thiết lập hàng rào bảo
mật tuyệt đối cho mọi tài liệu chưa được phê duyệt, đảm bảo tính riêng tư cho dữ liệu
nội bộ của từng lớp học phần.
Về mặt vận hành, hệ thống đặt kỳ vọng mang lại những giá trị thực tiễn đo lường
được cho cả hoạt động giảng dạy lẫn học tập. Giải pháp này dự kiến sẽ giúp giảng
viên giảm thiểu ít nhất bảy mươi phần trăm thời gian xử lý thủ công đối với các tác vụ
hành chính truyền thống. Đối với người học, nền tảng cam kết giải quyết triệt để bài
toán khó khăn trong việc tìm kiếm tài liệu tham khảo chuyên ngành, trực tiếp hỗ trợ
cho hơn tám mươi tám phần trăm sinh viên theo như số liệu đã được thống kê từ các
đợt khảo sát thực tế.



## 3. Phạm vi và đối tượng của đề tài
Đối tượng nghiên cứu và phạm vi triển khai của dự án được xác định rõ ràng
nhằm đảm bảo tính tập trung và hoàn thành đúng tiến độ đề ra. Về đối tượng tác động,
hệ thống hướng trực tiếp đến ba nhóm người dùng chính trong môi trường đại học bao
gồm sinh viên, những người cần không gian nộp bài, theo dõi tiến độ và khai thác học
liệu; giảng viên, những người trực tiếp quản lý lớp học phần, đánh giá và phê duyệt
các công trình chất lượng; cùng đội ngũ quản trị viên chịu trách nhiệm vận hành hệ
thống và giám sát tài nguyên tri thức. Đối tượng dữ liệu được nghiên cứu là toàn bộ
các công trình nghiên cứu khoa học, báo cáo học phần dự án (PBL) và đồ án tốt
nghiệp của sinh viên.
Về phạm vi chức năng, hệ thống tập trung hoàn toàn vào việc tối ưu hóa các nghiệp vụ
quản lý lớp học phần, luồng chấm điểm, phê duyệt của giảng viên và đặc biệt là phân
hệ Thư viện số thông minh ứng dụng mô hình RAG cùng công nghệ tìm kiếm ngữ
nghĩa. Dự án chủ động loại trừ các tính năng phát trực tuyến video bài giảng thời gian
thực hay các phân hệ quản lý hành chính chuyên sâu của nhà trường như học phí và
lịch học. Trong phạm vi định dạng dữ liệu, bộ máy trích xuất và lập chỉ mục văn bản
phục vụ cho cơ sở dữ liệu vector chỉ tập trung bóc tách nội dung ký tự thô cùng siêu
dữ liệu của các tệp tin phổ biến bao gồm .pdf và .docx, hoàn toàn không áp dụng cho
các tệp tin đa phương tiện hay mã nguồn thuần. Cuối cùng, về phạm vi triển khai, hệ
thống được xây dựng hoàn chỉnh dưới dạng một ứng dụng Web có khả năng vận hành
thực tế trên môi trường Internet, sử dụng nguồn dữ liệu thử nghiệm nội bộ từ các học
phần dự án và đề tài nghiên cứu khoa học mẫu của sinh viên để đánh giá toàn diện
hiệu năng của mô hình.


## 4. Phương pháp nghiên cứu
Để hiện thực hóa mục tiêu đề ra cho dự án, các phương pháp nghiên cứu được
kết hợp một cách chặt chẽ từ lý thuyết đến thực nghiệm kỹ thuật phần mềm.
Đầu tiên, phương pháp nghiên cứu lý thuyết và tài liệu được áp dụng để hệ thống hóa
toàn bộ kiến thức nền tảng về kiến trúc ứng dụng Web hiện đại, cơ chế bất đồng bộ
của Node.js[3], và hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL[6] (Supabase) [16].
Đặc biệt, phương pháp này tập trung chuyên sâu vào việc phân tích các công trình
khoa học tiên tiến về xử lý ngôn ngữ tự nhiên (NLP), nguyên lý hoạt động của các mô
hình ngôn ngữ lớn (LLMs), kỹ thuật chuyển đổi văn bản thành Vector Embedding, và
cấu trúc của mô hình RAG (Retrieval-Augmented Generation) [20] cùng các thuật
toán tìm kiếm khoảng cách ngữ nghĩa (như Cosine Similarity).

Tiếp theo, phương pháp phân tích và thiết kế hệ thống được sử dụng nhằm khảo sát
nhu cầu thực tế của giảng viên và sinh viên trong quy trình quản lý lớp học phần cũng
như khai thác học liệu. Từ đó, xây dựng các biểu đồ luồng dữ liệu, xác định các yêu
cầu chức năng, phi chức năng và thiết kế cấu trúc cơ sở dữ liệu tối ưu với các bảng
liên kết chặt chẽ, tích hợp sẵn extension pgvector[8] cho các tác vụ xử lý AI.
Sau khi hoàn thiện bản thiết kế, phương pháp thực nghiệm và phát triển phần mềm
được triển khai thông qua việc trực tiếp lập trình toàn bộ hệ thống bằng ngôn ngữ
TypeScript[2], sử dụng framework Express.js[4] cho Backend và ReactJS cho
Frontend. Quy trình này bao gồm việc xây dựng các bộ lọc bóc tách văn bản thô từ
file .pdf/.docx, thuật toán chia nhỏ dữ liệu (Chunking), tích hợp API kết nối với mô
hình ngôn ngữ lớn để thử nghiệm thực tế luồng xử lý RAG ngầm.
Cuối cùng, phương pháp kiểm thử và đánh giá được thực hiện dựa trên các tập dữ liệu
báo cáo mẫu của các học phần dự án (PBL). Hệ thống được đưa vào vận hành thử
nghiệm trong môi trường Internet thực tế nhằm đánh giá độ chính xác của các câu trả
lời do AI tổng hợp, đo lường tốc độ phản hồi của bộ máy tìm kiếm ngữ nghĩa, và kiểm
tra tính ổn định của các tính năng cốt lõi như Import danh sách qua file CSV hay
luồng phê duyệt tài liệu của giảng viên, bảo đảm hệ thống đạt chất lượng cao nhất khi
đưa vào ứng dụng thực tiễn.


## 5. Kết quả đạt được
Sau một quá trình nghiên cứu lý thuyết nghiêm túc và triển khai thực nghiệm kỹ thuật,
dự án đã hoàn thành toàn bộ các mục tiêu đề ra và đạt được các kết quả cụ thể về cả
mặt công nghệ lẫn mặt ứng dụng thực tiễn.
Về mặt xây dựng hệ thống quản lý, phân hệ quản lý lớp học phần đã vận hành ổn định
và đồng bộ thời gian thực, cho phép giảng viên dễ dàng khởi tạo lớp học, cấp mã tham
gia và tối ưu hóa thời gian quản lý hành chính thông qua bộ lọc xử lý tự động nhập
danh sách sinh viên bằng file CSV. Luồng nghiệp vụ đánh giá cũng được khép kín
một cách khoa học khi giảng viên có thể chấm điểm, nhận xét trực tiếp và thực hiện
cơ chế phê duyệt các báo cáo xuất sắc từ trạng thái nội bộ lớp học sang trạng thái phát
hành toàn trường chỉ với một thao tác click chuột.
Về mặt ứng dụng trí tuệ nhân tạo – kết quả cốt lõi của đề tài, mô hình RAG
(Retrieval-Augmented Generation) đã được triển khai thành công trên nền tảng
Backend Node.js/TypeScript[2] kết hợp với cơ sở dữ liệu Postgres hỗ trợ extension
pgvector[8]. Tiến trình xử lý ngầm hoạt động mượt mà khi tự động bóc tách chính xác
dữ liệu ký tự thô từ các định dạng tệp tin .pdf v .docx, thực hiện chia nhỏ văn bản và

chuyển đổi thành các chuỗi số Vector Embedding để lưu trữ tập trung. Đặc biệt, giao
diện tương tác hỏi đáp trực tiếp (Chat với PDF) hoạt động ổn định, trợ lý AI có khả
năng truy quét ngữ cảnh tốt, tổng hợp câu trả lời chính xác, ngắn gọn dựa trên chính
nội dung của bài báo cáo được cung cấp mà không xảy ra hiện tượng ảo tưởng thông
tin.
Tựu chung lại, sản phẩm web application hoàn chỉnh này đã được thử nghiệm thực tế
thành công trên môi trường Internet. Dự án không chỉ giải quyết triệt để bài toán quản
lý lớp học trực tuyến mà còn số hóa thành công nguồn tài nguyên học liệu tĩnh từ các
học phần dự án (PBL) và đề tài nghiên cứu khoa học mẫu của sinh viên, mở ra một
kho tri thức động có tính kế thừa cao và có giá trị áp dụng thực tiễn lớn trong môi
trường đại học.
6.Cấu trúc báo cáo
Báo cáo được tổ chức thành phần mở đầu, bốn chương nội dung chính, phần kết luận
và tài liệu tham khảo. Phần mở đầu trình bày lý do chọn đề tài, mục tiêu, phạm vi và
đối tượng nghiên cứu, phương pháp nghiên cứu, kết quả đạt được và cấu trúc của báo
cáo. Phần này giúp người đọc nắm được bối cảnh, định hướng và các đóng góp chính
của đề tài.
Chương 1 trình bày cơ sở lý thuyết liên quan đến đề tài. Nội dung chương bao gồm
tổng quan về kiến trúc ứng dụng Web hiện đại, cơ chế bất đồng bộ hiệu năng cao của
Node.js[3], hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL, lý thuyết xử lý ngôn ngữ tự
nhiên (NLP), kiến trúc mô hình ngôn ngữ lớn (LLMs), kỹ thuật chuyển đổi văn bản
thành không gian số thông qua Vector Embedding, và nguyên lý hoạt động của mô
hình Tạo lập tăng cường tra cứu (Retrieval-Augmented Generation - RAG) cùng các
thuật toán đo khoảng cách toán học phục vụ tìm kiếm dữ liệu ngữ nghĩa.
Chương 2 trình bày phương pháp đề xuất. Chương này mô tả chi tiết quy trình xây
dựng bộ lọc bóc tách dữ liệu ký tự thô từ các định dạng tệp tin phổ biến bao gồm .pdf
và .docx, thuật toán chia nhỏ văn bản thành các đoạn ngữ cảnh tối ưu (Chunking
Pipeline), phương pháp nhúng thông tin bằng Embedding Model, quy trình thiết lập
lưu trữ và tính toán độ tương đồng (Cosine Similarity) trong cơ sở dữ liệu vector.
Ngoài ra, chương này cũng trình bày cơ chế tối ưu Prompt cấu trúc, luồng tích hợp


### API
(Interactive Q&A) không bị sai lệch dữ liệu, cùng phương pháp đánh giá hiệu năng
thực nghiệm của mô hình.

Chương 3 trình bày phân tích và thiết kế hệ thống. Nội dung bao gồm yêu cầu chức
năng, yêu cầu phi chức năng, tác nhân hệ thống, ca sử dụng (Use Case), biểu đồ use
case, đặc tả use case, biểu đồ tuần tự (Sequence Diagram), kiến trúc phân lớp tổng
quát và thiết kế cấu trúc cơ sở dữ liệu quan hệ tích hợp extension pgvector[8]. Chương
này làm rõ cách hệ thống được tổ chức để hỗ trợ các chức năng quản lý lớp học phần,
sinh mã Class Code, tự động Import danh sách sinh viên qua file CSV, luồng chấm
điểm và phê duyệt báo cáo xuất sắc của giảng viên, cùng phân hệ Thư viện số thông
minh.
Chương 4 trình bày quá trình xây dựng hệ thống. Chương này mô tả các công nghệ sử
dụng, môi trường thực nghiệm, xây dựng Backend API bằng ngôn ngữ TypeScript[2]
và framework Express.js[4], phát triển giao diện người dùng Frontend bằng ReactJS,
tích hợp AI Service (RAG Engine & LLM), kết nối cơ sở dữ liệu, kiểm thử chức năng
và triển khai demo thực tế trên môi trường Internet. Các kết quả giao diện và kiểm thử
thực tế được trình bày trực quan để minh họa cho hoạt động của hệ thống.
Phần kết luận tổng hợp các kết quả đã đạt được về mặt quản lý giáo dục trực tuyến lẫn
ứng dụng trí tuệ nhân tạo, nêu ra những hạn chế còn tồn tại và đề xuất hướng phát
triển trong tương lai. Các hướng phát triển bao gồm mở rộng khả năng đọc hiểu cấu
trúc tài liệu chứa hình ảnh hay công thức phức tạp, tối ưu hóa thuật toán phân mảnh
dữ liệu, và nghiên cứu tích hợp các mô hình ngôn ngữ lớn chạy nội bộ (Local LLM
thông qua Ollama) nhằm bảo mật dữ liệu học liệu tuyệt đối và tiết kiệm chi phí vận
hành cho nhà trường.



# CHƯƠNG 1: CƠ SỞ LÝ THUYẾT


## 1.1 Tổng quan về hệ thống quản lý báo cáo và nghiên cứu khoa học


### 1.1.2 Đặc điểm của tài liệu học thuật
Các báo cáo đồ án, khóa luận tốt nghiệp và công trình nghiên cứu khoa học của
sinh viên thường có những đặc điểm riêng biệt so với các loại tài liệu thông thường.
Trước hết, khối lượng dữ liệu được tích lũy qua nhiều năm học là rất lớn, bao gồm nhiều
lĩnh vực chuyên môn khác nhau, tạo nên một kho tri thức đa dạng và phong phú. Nội
dung của các tài liệu này thường mang tính chuyên ngành cao, sử dụng nhiều thuật ngữ
kỹ thuật và kiến thức chuyên sâu liên quan đến từng lĩnh vực nghiên cứu. Bên cạnh đó,
cấu trúc của tài liệu học thuật thường khá phức tạp với nhiều chương, mục, bảng biểu,
hình ảnh và tài liệu tham khảo, đòi hỏi hệ thống quản lý phải có khả năng xử lý và lưu
trữ hiệu quả. Ngoài giá trị học thuật, các tài liệu này còn mang tính kế thừa cao khi sinh
viên và giảng viên thường xuyên sử dụng các nghiên cứu trước đó làm cơ sở tham khảo
cho những đề tài mới. Chính những đặc điểm này làm cho việc quản lý và khai thác
thông tin từ tài liệu học thuật trở nên phức tạp hơn, đồng thời đặt ra yêu cầu về các giải
pháp tìm kiếm và truy xuất thông tin thông minh.


### 1.1.3 Hạn chế của các hệ thống truyền thống
Hiện nay, phần lớn các hệ thống quản lý tài liệu học thuật vẫn sử dụng cơ chế
tìm kiếm dựa trên từ khóa (Keyword Search), trong đó kết quả được xác định thông qua
việc so khớp trực tiếp các từ xuất hiện trong câu truy vấn với nội dung được lập chỉ mục
trong tài liệu. Mặc dù phương pháp này có ưu điểm là dễ triển khai, tốc độ xử lý nhanh
và không yêu cầu tài nguyên tính toán lớn, nhưng vẫn tồn tại nhiều hạn chế khi áp dụng
vào môi trường học thuật. Cụ thể, hệ thống không có khả năng hiểu được ngữ nghĩa
thực sự của câu hỏi, dẫn đến việc bỏ sót nhiều tài liệu có nội dung liên quan nhưng sử
dụng cách diễn đạt khác với từ khóa được nhập vào. Ngoài ra, phương pháp tìm kiếm
theo từ khóa gặp khó khăn trong việc xử lý các trường hợp từ đồng nghĩa, từ viết tắt
hoặc các thuật ngữ chuyên ngành khác nhau nhưng cùng biểu thị một khái niệm. Hệ
thống cũng không hỗ trợ suy luận ngữ cảnh và thường yêu cầu người dùng phải biết
chính xác từ khóa xuất hiện trong tài liệu mới có thể tìm kiếm hiệu quả. Những hạn chế
này làm giảm khả năng khai thác tri thức từ kho tài liệu học thuật, đặc biệt khi số lượng
báo cáo và công trình nghiên cứu ngày càng gia tăng. Do đó, việc ứng dụng các công
nghệ tìm kiếm ngữ nghĩa kết hợp với trí tuệ nhân tạo đang trở thành xu hướng quan

trọng nhằm nâng cao hiệu quả quản lý, truy xuất và khai thác tri thức trong các hệ thống
quản lý báo cáo và nghiên cứu khoa học hiện đại.


## 1.2 Retrieval-Augmented Generation (RAG)
Retrieval-Augmented Generation (RAG) [20] là một kiến trúc trí tuệ nhân tạo
được đề xuất nhằm kết hợp khả năng truy xuất thông tin từ nguồn dữ liệu bên ngoài với
khả năng sinh ngôn ngữ tự nhiên của các mô hình ngôn ngữ lớn. Khác với các mô hình
ngôn ngữ truyền thống vốn chỉ dựa trên tri thức được học trong quá trình huấn luyện,
RAG cho phép hệ thống truy cập và khai thác các nguồn dữ liệu cập nhật theo thời gian
thực hoặc dữ liệu riêng của tổ chức. Cách tiếp cận này giúp nâng cao độ chính xác của
câu trả lời, đồng thời giảm thiểu hiện tượng sinh thông tin không chính xác do mô hình
tự suy diễn.
Nguyên lý hoạt động của RAG được chia thành hai giai đoạn chính là truy xuất thông
tin và sinh câu trả lời. Trong giai đoạn đầu tiên, các tài liệu trong kho tri thức được
chuyển đổi thành vector embedding và lưu trữ trong cơ sở dữ liệu vector. Khi người
dùng gửi một câu hỏi, hệ thống sẽ sử dụng mô hình embedding để chuyển đổi câu hỏi
thành vector có cùng không gian biểu diễn với dữ liệu đã lưu trữ. Sau đó, cơ chế truy
xuất sẽ tìm kiếm những đoạn văn bản có mức độ tương đồng cao nhất với nội dung câu
hỏi. Các đoạn văn bản này được xem là ngữ cảnh liên quan và được chuyển đến mô
hình ngôn ngữ lớn ở giai đoạn tiếp theo. Tại đây, mô hình sẽ sử dụng thông tin được
truy xuất để tổng hợp và sinh ra câu trả lời phù hợp với nội dung tài liệu.
Hình 2: Kiến trúc Retrieval-Augmented Generation (RAG)



## 1.3 Embedding Model BGE-M3
Embedding là kỹ thuật chuyển đổi dữ liệu văn bản thành các vector số thực nhằm
biểu diễn ý nghĩa ngữ nghĩa của nội dung trong không gian nhiều chiều. Các vector
embedding cho phép hệ thống đánh giá mức độ tương đồng giữa các văn bản dựa trên
ý nghĩa thay vì chỉ dựa trên sự xuất hiện của từ khóa. Đây là nền tảng quan trọng của
các hệ thống Semantic Search và Retrieval-Augmented Generation.
Trong đề tài này, mô hình BGE-M3 được sử dụng để sinh embedding cho nội dung báo
cáo và câu truy vấn của người dùng. BGE-M3 là mô hình embedding đa ngôn ngữ được
phát triển bởi BAAI với khả năng hỗ trợ hơn một trăm ngôn ngữ khác nhau, trong đó
có tiếng Việt. Mô hình được huấn luyện nhằm tối ưu cho các tác vụ truy xuất thông tin,
tìm kiếm ngữ nghĩa và hỏi đáp tài liệu. Nhờ khả năng hiểu ngữ cảnh tốt, BGE-M3 có
thể tạo ra các vector biểu diễn có tính khái quát cao, giúp hệ thống xác định được sự
tương đồng giữa các văn bản ngay cả khi chúng sử dụng những từ ngữ khác nhau để
diễn đạt cùng một ý nghĩa.
Trong quá trình xây dựng hệ thống, BGE-M3 được sử dụng để chuyển đổi nội dung của
các báo cáo sau khi được chia thành các đoạn nhỏ thành vector embedding trước khi
lưu trữ vào Milvus. Đồng thời, mô hình cũng được sử dụng để chuyển đổi câu hỏi của
người dùng thành vector truy vấn. Việc sử dụng cùng một mô hình embedding cho cả
dữ liệu và truy vấn giúp đảm bảo tính nhất quán trong không gian biểu diễn và nâng cao
chất lượng tìm kiếm ngữ nghĩa.
Hình 3:Embedding model BGE-M3


## 1.4 Vector Database
Trong các hệ thống Semantic Search và Retrieval-Augmented Generation, dữ
liệu văn bản sau khi được xử lý sẽ được biểu diễn dưới dạng vector có số chiều lớn.
Việc lưu trữ và truy xuất hiệu quả các vector này là nhiệm vụ của cơ sở dữ liệu vector

(Vector Database). Khác với cơ sở dữ liệu quan hệ truyền thống vốn được thiết kế để
xử lý dữ liệu dạng bảng, Vector Database được tối ưu hóa cho việc tìm kiếm các vector
có độ tương đồng cao trong không gian nhiều chiều.
Trong đề tài này, Milvus được lựa chọn làm cơ sở dữ liệu vector chính. Milvus là một
hệ quản trị cơ sở dữ liệu vector mã nguồn mở được thiết kế để hỗ trợ các ứng dụng trí
tuệ nhân tạo quy mô lớn. Hệ thống cung cấp nhiều thuật toán tìm kiếm lân cận gần nhất,
cho phép thực hiện truy vấn trên hàng triệu vector với độ trễ thấp. Ngoài khả năng mở
rộng tốt, Milvus còn hỗ trợ triển khai phân tán và tích hợp thuận lợi với các framework
xây dựng hệ thống RAG hiện đại.
Bên cạnh Milvus, hệ thống còn sử dụng Supabase[16] để lưu trữ dữ liệu nghiệp vụ và
metadata của tài liệu. Supabase được xây dựng trên PostgreSQL[6] và cung cấp nhiều
tính năng như quản lý người dùng, xác thực, lưu trữ tệp và API tự động. Trong kiến trúc
của đề tài, Supabase chịu trách nhiệm quản lý thông tin báo cáo, thông tin người dùng
và các dữ liệu liên quan đến nghiệp vụ, trong khi Milvus tập trung xử lý các vector
embedding phục vụ truy vấn ngữ nghĩa. Sự kết hợp giữa hai nền tảng này giúp tận dụng
được ưu điểm của cả cơ sở dữ liệu quan hệ và cơ sở dữ liệu vector.


## 1.5 Large Language Model – Qwen2-7B-Instruct
Mô hình ngôn ngữ lớn (Large Language Model - LLM) là thành phần chịu trách
nhiệm phân tích ngữ cảnh và sinh câu trả lời trong kiến trúc RAG. Các mô hình này
được huấn luyện trên lượng dữ liệu văn bản khổng lồ nhằm học được cấu trúc ngôn
ngữ, kiến thức tổng quát và khả năng suy luận trong nhiều lĩnh vực khác nhau.
Đối với đề tài này, mô hình Qwen2-7B-Instruct[15] được lựa chọn làm thành phần sinh
câu trả lời. Đây là mô hình mã nguồn mở do Alibaba Cloud phát triển với khoảng bảy
tỷ tham số. Qwen2-7B-Instruct được tối ưu hóa cho các tác vụ hội thoại và làm theo chỉ
dẫn, cho phép mô hình phản hồi chính xác hơn đối với các yêu cầu được mô tả bằng
ngôn ngữ tự nhiên. Bên cạnh đó, mô hình còn hỗ trợ nhiều ngôn ngữ và có khả năng xử
lý ngữ cảnh dài, phù hợp với đặc thù của các tài liệu học thuật.
Trong hệ thống được đề xuất, Qwen2-7B-Instruct[15] không trực tiếp truy cập cơ sở dữ
liệu mà nhận đầu vào từ thành phần Retrieval. Các đoạn văn bản được truy xuất từ
Milvus sẽ được kết hợp với câu hỏi của người dùng để tạo thành ngữ cảnh hoàn chỉnh.
Dựa trên thông tin này, mô hình tiến hành phân tích và sinh ra câu trả lời phù hợp với
nội dung của báo cáo. Cách tiếp cận này giúp giảm đáng kể hiện tượng Hallucination

và đảm bảo rằng các câu trả lời được tạo ra dựa trên nguồn tài liệu thực tế có trong hệ
thống.


## 1.6 React ( Frontend )
React là thư viện JavaScript mã nguồn mở được phát triển bởi Meta Platforms
nhằm hỗ trợ xây dựng giao diện người dùng cho các ứng dụng web hiện đại theo mô
hình Component-Based Architecture. React cho phép chia giao diện thành các thành
phần độc lập, có khả năng tái sử dụng và quản lý riêng biệt, giúp giảm độ phức tạp trong
quá trình phát triển phần mềm. Bên cạnh đó, React sử dụng cơ chế Virtual DOM để tối
ưu hóa quá trình cập nhật giao diện, chỉ thực hiện thay đổi trên những thành phần thực
sự bị ảnh hưởng khi dữ liệu thay đổi, từ đó nâng cao hiệu năng xử lý của ứng dụng.
Trong đề tài này, React được sử dụng để xây dựng giao diện người dùng cho hệ thống
quản lý báo cáo và nghiên cứu khoa học của sinh viên, cung cấp các chức năng như
đăng nhập, quản lý báo cáo, tìm kiếm tài liệu và tương tác với hệ thống hỏi đáp dựa trên
mô hình RAG. Việc lựa chọn React không chỉ giúp giao diện trở nên trực quan, linh
hoạt và dễ sử dụng mà còn hỗ trợ tích hợp hiệu quả với các dịch vụ Backend được phát
triển bằng Node.js và FastAPI [12] trong kiến trúc tổng thể của hệ thống.


## 1.7 Node.js (Backend )
Node.js[3] là môi trường thực thi JavaScript phía máy chủ được xây dựng trên
nền tảng V8 JavaScript Engine của Google, cho phép phát triển các ứng dụng web có
hiệu năng cao và khả năng xử lý đồng thời nhiều yêu cầu trong thời gian thực. Khác với
các mô hình xử lý truyền thống sử dụng đa luồng, Node.js áp dụng kiến trúc hướng sự
kiện (Event-Driven) và cơ chế I/O bất đồng bộ (Non-Blocking I/O), giúp tối ưu việc sử
dụng tài nguyên hệ thống và nâng cao khả năng mở rộng của ứng dụng. Trong đề tài
này, Node.js được sử dụng để xây dựng tầng Backend chịu trách nhiệm xử lý các nghiệp
vụ chính của hệ thống như quản lý người dùng, xác thực và phân quyền tài khoản, quản
lý báo cáo đồ án, nghiên cứu khoa học, tiếp nhận yêu cầu từ giao diện React và điều
phối dữ liệu giữa các thành phần trong hệ thống. Ngoài ra, Node.js còn đóng vai trò như
một API Gateway kết nối với các dịch vụ trí tuệ nhân tạo được triển khai bằng FastAPI,
giúp tách biệt logic nghiệp vụ với các tác vụ xử lý AI nhằm tăng tính linh hoạt và khả
năng bảo trì của hệ thống. Với hiệu năng cao, cộng đồng phát triển lớn, hệ sinh thái thư
viện phong phú và khả năng tích hợp tốt với các công nghệ hiện đại, Node.js[3] là lựa
chọn phù hợp để xây dựng tầng dịch vụ cho hệ thống quản lý báo cáo và nghiên cứu
khoa học của sinh viên tích hợp mô hình Retrieval-Augmented Generation (RAG) [20].



## 1.8 FastAPI
FastAPI[12] là một framework phát triển Web API hiện đại dành cho ngôn ngữ
Python, được thiết kế nhằm xây dựng các dịch vụ có hiệu năng cao, dễ mở rộng và hỗ
trợ xử lý bất đồng bộ. FastAPI tận dụng khả năng của Python Type Hints để tự động
kiểm tra kiểu dữ liệu, sinh tài liệu API và hỗ trợ phát triển ứng dụng một cách nhanh
chóng. Trong đề tài này, FastAPI được sử dụng để triển khai các dịch vụ trí tuệ nhân
tạo, bao gồm xử lý tài liệu, sinh vector embedding bằng mô hình BGE-M3, truy xuất
dữ liệu từ cơ sở dữ liệu vector Milvus và giao tiếp với mô hình ngôn ngữ lớn Qwen2-
7B-Instruct nhằm thực hiện chức năng hỏi đáp dựa trên kiến trúc RAG. Việc tách riêng
các tác vụ AI thành một dịch vụ độc lập giúp hệ thống dễ dàng bảo trì, nâng cấp và mở
rộng trong tương lai. Bên cạnh đó, FastAPI[12] còn hỗ trợ tốt cho việc triển khai các
mô hình học máy và học sâu nhờ khả năng tích hợp trực tiếp với các thư viện Python
phổ biến như PyTorch, Transformers và LangChain, giúp tối ưu quá trình xây dựng hệ
thống trí tuệ nhân tạo trong đề tài.


## 1.9 Redis
Redis[9] là hệ quản trị cơ sở dữ liệu dạng Key-Value hoạt động trên bộ nhớ (In-
Memory Database), được sử dụng rộng rãi trong các hệ thống yêu cầu tốc độ truy xuất
dữ liệu cao. Nhờ khả năng đọc và ghi dữ liệu với độ trễ rất thấp, Redis thường được sử
dụng làm bộ nhớ đệm (Cache), hệ thống lưu trữ phiên đăng nhập hoặc trung gian truyền
tải thông điệp giữa các dịch vụ. Trong hệ thống quản lý báo cáo và nghiên cứu khoa
học của sinh viên, Redis được sử dụng để lưu trữ tạm thời các dữ liệu thường xuyên
được truy cập, giảm số lượng truy vấn trực tiếp đến cơ sở dữ liệu chính và cải thiện hiệu
năng xử lý của hệ thống. Ngoài ra, Redis còn đóng vai trò là thành phần trung gian hỗ
trợ cơ chế hàng đợi xử lý bất đồng bộ, giúp phân phối và quản lý các tác vụ liên quan
đến xử lý tài liệu, sinh embedding và truy vấn mô hình ngôn ngữ lớn. Việc ứng dụng
Redis không chỉ giúp tăng tốc độ phản hồi mà còn nâng cao khả năng mở rộng và ổn
định của hệ thống khi phải phục vụ nhiều người dùng đồng thời.


## 1.10 Queue
Queue hay hàng đợi là cơ chế xử lý bất đồng bộ được sử dụng để quản lý và phân
phối các tác vụ cần thực hiện trong hệ thống. Thay vì xử lý trực tiếp các công việc có
thời gian thực thi dài trên luồng chính, hệ thống sẽ đưa các nhiệm vụ vào hàng đợi và
giao cho các Worker xử lý ở chế độ nền. Trong đề tài này, Queue được sử dụng để xử

lý các tác vụ như đọc nội dung tài liệu PDF, chia nhỏ văn bản, sinh embedding bằng
mô hình BGE-M3 và thực hiện truy vấn mô hình Qwen2-7B-Instruct[15]. Các tác vụ
này thường tiêu tốn nhiều tài nguyên tính toán và có thể làm giảm hiệu năng của hệ
thống nếu được xử lý đồng bộ. Bằng cách kết hợp Queue với Redis và các Worker được
triển khai bằng FastAPI, hệ thống có thể xử lý nhiều yêu cầu đồng thời mà vẫn đảm bảo
tốc độ phản hồi cho người dùng. Cách tiếp cận này giúp tăng khả năng chịu tải, giảm
nguy cơ nghẽn hệ thống và tạo điều kiện thuận lợi cho việc mở rộng quy mô triển khai
trong tương lai.


## 1.11 Docker
Docker[11] là nền tảng mã nguồn mở hỗ trợ đóng gói, triển khai và vận hành
ứng dụng thông qua công nghệ Containerization. Thay vì cài đặt trực tiếp các thành
phần phần mềm trên máy chủ, Docker cho phép đóng gói toàn bộ mã nguồn, thư viện
phụ thuộc và môi trường thực thi vào các container độc lập, đảm bảo tính nhất quán
giữa các môi trường phát triển, kiểm thử và triển khai thực tế. Trong đề tài này, Docker
được sử dụng để triển khai các thành phần của hệ thống như React Frontend, Node.js[3]
Backend, FastAPI AI Service, Redis[9] và Milvus dưới dạng các container riêng biệt.
Việc áp dụng Docker giúp đơn giản hóa quá trình cài đặt, giảm các vấn đề liên quan
đến sự khác biệt môi trường và hỗ trợ triển khai hệ thống một cách nhanh chóng trên
nhiều nền tảng khác nhau. Ngoài ra, Docker còn tạo điều kiện thuận lợi cho việc mở
rộng hệ thống theo kiến trúc Microservice, giúp các thành phần có thể được nâng cấp
hoặc thay thế độc lập mà không ảnh hưởng đến toàn bộ ứng dụng. Với những ưu điểm
về tính linh hoạt, khả năng di động và hiệu quả trong quản lý hạ tầng, Docker[11] là
công nghệ phù hợp để triển khai hệ thống quản lý báo cáo và nghiên cứu khoa học của
sinh viên tích hợp mô hình RAG.



# CHƯƠNG 2: PHƯƠNG PHÁP ĐỀ XUẤT


## 2.1 Phát biểu bài toán
Trong môi trường đại học, các báo cáo học tập, đồ án tốt nghiệp và công trình
nghiên cứu khoa học của sinh viên được tạo ra với số lượng lớn qua từng năm học. Mặc
dù các tài liệu này chứa đựng nhiều tri thức có giá trị phục vụ học tập và nghiên cứu,
phần lớn vẫn được lưu trữ dưới dạng các tệp tin rời rạc hoặc nằm trong các hệ thống
quản lý chỉ hỗ trợ chức năng lưu trữ và tìm kiếm cơ bản. Điều này khiến sinh viên gặp
nhiều khó khăn trong việc tiếp cận các tài liệu liên quan, kế thừa kết quả nghiên cứu
trước đó hoặc tìm kiếm thông tin phục vụ quá trình thực hiện đề tài. Bên cạnh đó, giảng
viên cũng gặp khó khăn trong việc quản lý, kiểm duyệt và đánh giá số lượng lớn báo
cáo được nộp mỗi học kỳ.
Các hệ thống tìm kiếm truyền thống chủ yếu sử dụng cơ chế Keyword Search nên không
thể hiểu được ý nghĩa thực sự của câu hỏi người dùng, dẫn đến khả năng truy xuất tri
thức còn hạn chế khi tài liệu sử dụng các cách diễn đạt khác nhau. Ngoài ra, việc chỉ
cung cấp danh sách tài liệu liên quan chưa đáp ứng được nhu cầu khai thác tri thức trực
tiếp từ nội dung báo cáo. Xuất phát từ những hạn chế trên, đề tài hướng tới xây dựng
một nền tảng quản lý báo cáo và nghiên cứu khoa học dành cho sinh viên và giảng viên,
đồng thời tích hợp mô hình Retrieval-Augmented Generation nhằm hỗ trợ truy vấn và
hỏi đáp thông minh trên kho tri thức học thuật của nhà trường.


## 2.2 Giải pháp đề xuất
Để giải quyết bài toán khai thác tri thức từ các báo cáo học thuật, đề tài đề xuất
xây dựng nền tảng DUTSTUDY kết hợp giữa hệ thống quản lý tài liệu và kiến trúc
Retrieval-Augmented Generation. Khác với các hệ thống RAG thông thường chỉ tập
trung vào việc hỏi đáp tài liệu, hệ thống được thiết kế theo hướng tích hợp toàn bộ quy
trình quản lý học thuật bao gồm sinh viên tải lên báo cáo, giảng viên kiểm duyệt nội
dung, lưu trữ tập trung và khai thác tri thức thông qua giao diện hỏi đáp bằng ngôn ngữ
tự nhiên.
Điểm nổi bật của giải pháp là việc xây dựng kho tri thức từ các báo cáo đã được giảng
viên phê duyệt nhằm đảm bảo chất lượng nguồn dữ liệu đầu vào. Thay vì sử dụng
phương pháp Chunking cố định theo số lượng token như nhiều hệ thống RAG hiện nay,
nghiên cứu đề xuất tổ chức dữ liệu dựa trên cấu trúc Section của tài liệu như Giới
thiệu, Phương pháp nghiên cứu, Kết quả thực nghiệm hoặc Kết luận. Cách tiếp cận này

giúp bảo toàn tính liên kết học thuật và ngữ cảnh của nội dung. Sau quá trình Semantic
Retrieval bằng mô hình Embedding, hệ thống tiếp tục áp dụng cơ chế LLM Re-
ranking để đánh giá lại các Section được truy xuất nhằm lựa chọn những ngữ cảnh
phù hợp nhất trước khi sinh phản hồi. Sự kết hợp giữa quản lý học thuật, truy xuất ngữ
nghĩa và tái xếp hạng bằng mô hình ngôn ngữ lớn tạo nên một giải pháp toàn diện cho
bài toán lưu trữ, kế thừa và khai thác tri thức trong môi trường đại học.


## 2.3 Kiến trúc Hierarchical RAG
Kiến trúc RAG của hệ thống được xây dựng theo mô hình nhiều tầng gồm tầng
quản lý tài liệu, tầng xử lý tri thức và tầng sinh phản hồi. Tại tầng dữ liệu, các báo cáo
sau khi được giảng viên phê duyệt sẽ được phân tích cấu trúc và chuyển đổi thành các
Node tương ứng với từng Section của tài liệu. Các Node này được biểu diễn dưới dạng
vector thông qua mô hình BGE-M3 và lưu trữ trong cơ sở dữ liệu vector Milvus.
Khi người dùng gửi câu hỏi, hệ thống sử dụng mô hình Embedding để chuyển đổi truy
vấn thành vector ngữ nghĩa và thực hiện tìm kiếm Semantic Retrieval trên Milvus nhằm
lấy ra tập các Section có mức độ liên quan cao nhất. Sau đó, cơ chế LLM Re-ranking
được sử dụng để tái đánh giá các kết quả Retrieval dựa trên khả năng đọc hiểu ngữ cảnh
của mô hình ngôn ngữ lớn. Các Section có độ phù hợp cao nhất được đưa vào Prompt
cùng với câu hỏi người dùng và chuyển tới mô hình Qwen2-7B-Instruct[15] để sinh
phản hồi cuối cùng. Kiến trúc này giúp giảm hiện tượng nhiễu ngữ cảnh, hạn chế thông
tin ảo giác và nâng cao độ chính xác của hệ thống hỏi đáp.


### 2.3.1 Quy trình xử lý tài liệu
Quy trình xử lý tài liệu bắt đầu khi sinh viên tải báo cáo hoặc công trình nghiên
cứu khoa học lên hệ thống. Sau khi được giảng viên kiểm duyệt và phê duyệt, tài liệu
sẽ được đưa vào kho tri thức phục vụ cho quá trình truy xuất và hỏi đáp. Hệ thống thực
hiện trích xuất văn bản từ tệp PDF hoặc DOCX, đồng thời phân tích cấu trúc tài liệu
nhằm xác định các Section chính và các tiểu mục liên quan.
Thay vì chia văn bản thành các đoạn cố định dựa trên số lượng token, nghiên cứu lựa
chọn phương pháp xây dựng Node theo từng Section hoàn chỉnh của báo cáo. Mỗi Node
được xem là một đơn vị tri thức độc lập chứa đầy đủ ngữ cảnh học thuật của một nội
dung cụ thể. Sau khi được tạo ra, các Node được chuyển đổi thành vector embedding
thông qua mô hình BGE-M3 và lưu trữ trong Milvus cùng với các metadata như tên đề
tài, tác giả, giảng viên hướng dẫn và lĩnh vực nghiên cứu. Cách tổ chức dữ liệu này giúp

cải thiện chất lượng truy xuất và hỗ trợ hiệu quả cho các bước Retrieval cũng như Re-
ranking trong hệ thống RAG.
Hình 4 : Sơ đồ tiền xử lý tài liệu ( Preprocessing )


### 2.3.2 Quy trình truy vấn và hỏi đáp
Khi người dùng đặt câu hỏi trên giao diện hệ thống, truy vấn được gửi đến dịch
vụ xử lý trí tuệ nhân tạo để thực hiện quá trình truy xuất và sinh phản hồi. Đầu tiên, câu
hỏi được chuyển đổi thành vector embedding bằng mô hình BGE-M3. Vector truy vấn
này được sử dụng để tìm kiếm các Section có độ tương đồng ngữ nghĩa cao nhất trong
cơ sở dữ liệu Milvus. Kết quả trả về là tập Top-K Section liên quan đến nội dung câu
hỏi.
Tiếp theo, hệ thống thực hiện bước LLM Re-ranking nhằm đánh giá lại toàn bộ các
Section trong tập Top-K. Mô hình ngôn ngữ lớn sẽ đọc hiểu đồng thời câu hỏi và nội
dung từng Section để xác định mức độ phù hợp thực sự thay vì chỉ dựa vào khoảng cách
vector. Các Section có điểm đánh giá cao nhất sẽ được lựa chọn làm ngữ cảnh đầu vào
cho Qwen2-7B-Instruct[15]. Dựa trên các thông tin này, mô hình tổng hợp nội dung và
sinh ra câu trả lời hoàn chỉnh cho người dùng. Cơ chế này giúp tăng độ chính xác truy

xuất, giảm nhiễu ngữ cảnh và cải thiện chất lượng phản hồi so với các hệ thống Retrieval
chỉ sử dụng Embedding.
Hình 5 : Sơ đồ truy xuất và tạo câu trả lời (Retrieval & Generation Pipeline).


## 2.4 Thuật toán và luồng xử lý
Luồng xử lý của hệ thống được triển khai theo kiến trúc dịch vụ độc lập gồm
React Frontend, Node.js[3] Backend, FastAPI[12] AI Service, Redis Queue, Milvus và
mô hình Qwen2-7B-Instruct. Đối với luồng xây dựng tri thức, báo cáo sau khi được
giảng viên phê duyệt sẽ trải qua các bước phân tích cấu trúc, tạo Section Node, sinh
embedding và lưu trữ vào Milvus. Đối với luồng hỏi đáp, người dùng gửi câu hỏi từ
giao diện React, yêu cầu được chuyển qua Node.js và FastAPI để thực hiện Semantic
Retrieval trên Milvus. Sau khi nhận được tập Top-K Section, hệ thống tiến hành LLM
Re-ranking, xây dựng Prompt và gửi tới Qwen2-7B-Instruct[15] để sinh phản hồi cuối
cùng.

Đặc biệt, Redis[9] Queue được sử dụng để xử lý bất đồng bộ các tác vụ tốn nhiều tài
nguyên như indexing tài liệu, sinh embedding và cập nhật kho tri thức. Điều này giúp
giảm tải cho hệ thống, tăng khả năng mở rộng và đảm bảo tốc độ phản hồi khi có nhiều
người dùng truy cập đồng thời. Thông qua việc kết hợp quản lý học thuật, Semantic
Retrieval, Section-Based Indexing và LLM Re-ranking, hệ thống tạo ra một nền tảng
hỗ trợ lưu trữ, kế thừa và khai thác tri thức học thuật hiệu quả cho sinh viên và giảng
viên.



# CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG


## 3.1 Tổng quan hệ thống
Hệ thống quản lý và truy vấn báo cáo đồ án ứng dụng mô hình RAG được xây dựng
theo kiến trúc phân tầng, kết hợp giữa nền tảng LMS truyền thống và bộ máy số hóa tri
thức thông minh dựa trên AI. Hệ thống gồm ba thành phần tương tác chặt chẽ qua
RESTful API: Giao diện người dùng (ReactJS/TypeScript) [1] cung cấp không gian lớp
học và thư viện số với màn hình chia đôi độc đáo để vừa đọc tài liệu vừa chat; Máy chủ
xử lý (Node.js/Express) [4] điều phối xác thực JWT, quản lý lớp học và vận hành engine
RAG; và Cơ sở dữ liệu (PostgreSQL + pgvector[8]) lưu trữ song song dữ liệu có cấu
trúc lẫn các chuỗi vector ngữ nghĩa.
Sự vận hành của hệ thống dựa trên hai luồng dữ liệu cốt lõi:
Luồng lập chỉ mục (Indexing Pipeline): Khi đồ án được giảng viên phê duyệt vào thư
viện, hệ thống chạy ngầm để bóc tách văn bản, chia nhỏ thành các phân đoạn ngữ cảnh
(khoảng 500 ký tự) và gọi API nhúng chúng thành vector để lưu vào PostgreSQL[6].
Luồng truy vấn (RAG Pipeline): Khi người dùng đặt câu hỏi, hệ thống tính toán
khoảng cách vector (Cosine Similarity) để tìm các đoạn văn bản có độ tương đồng ngữ
nghĩa cao nhất. Các đoạn văn này được đóng gói làm ngữ cảnh (Prompt) gửi tới mô
hình ngôn ngữ lớn (LLM) để tạo ra câu trả lời chính xác, khách quan, không bị ảo tưởng
thông tin và có trích dẫn nguồn trang trực quan cho sinh viên đối chiếu.


## 3.2 Phân tích yêu cầu chức năng và phi chức năng
Yêu cầu chức năng mô tả các chức năng chính mà hệ thống cần cung cấp cho người
dùng. Dựa trên mục tiêu đề tài, hệ thống cần đáp ứng các yêu cầu sau:
Bảng 1: Danh sách yêu cầu chức năng
STT Mã yêu cầu Tên Yêu Cầu Mô Tả Chi Tiết
Hệ thống phải cho phép người dùng (Sinh viên, Giảng viên,
Quản trị viên) đăng nhập vào hệ thống bằng tài khoản email
Xác thực đăng trường và mật khẩu. Mã hóa mật khẩu bằng bcryptjs và cấp phát
1 FR_01 nhập accessToken qua JWT để bảo mật.
Hệ thống phải hỗ trợ các tài khoản được tạo tự động từ file CSV
Kích hoạt tài tiến hành đổi mật khẩu và kích hoạt tài khoản (active) trong lần
2 FR_02 khoản mới đầu tiên đăng nhập.

Khởi tạo lớp Hệ thống phải cho phép Giảng viên tạo lớp học phần mới bằng
3 FR_03 học phần cách điền thông tin: Tên lớp, Mã môn học, Học kỳ và Năm học.
Ngay khi lớp học phần được khởi tạo, hệ thống phải tự động
Tự động sinh sinh ngẫu nhiên một chuỗi ký tự duy nhất (6-8 ký tự) làm mã
mã Class lớp và cho phép Giảng viên bật/tắt trạng thái hoạt động của mã
4 FR_04 Code này.
Hệ thống phải cho phép Sinh viên nhập mã lớp để gia nhập lớp
Tham gia lớp học phần. Hệ thống cần kiểm tra tính hợp lệ của mã trực thời
5 FR_05 học bằng mã (Real-time) trước khi ghi nhận thành viên.
Hệ thống phải cho phép Giảng viên tải lên file .csv chứa danh
sách sinh viên (student_code, email, full_name). Hệ thống tự
Nhập danh động kiểm tra: nếu tài khoản đã tồn tại thì thêm vào lớp; nếu
sách lớp bằng chưa thì tạo tài khoản ở trạng thái chờ kích hoạt rồi đưa vào lớp
6 FR_06 file CSV học.
Hệ thống phải cho phép Giảng viên tạo các cột mốc nộp báo cáo
Tạo mốc tiến (Milestones/Assignments) kèm theo mô tả, yêu cầu định dạng
7 FR_07 độ bài tập tệp tin và thời gian hạn định (Deadline).
Hệ thống phải cho phép Sinh viên tải các tệp tin báo cáo tiến độ
Nộp báo cáo hoặc đồ án hoàn chỉnh lên hệ thống dưới định dạng quy định
8 FR_08 học phần (.pdf, .docx) trước khi hết hạn.
Hệ thống phải cung cấp giao diện cho Giảng viên theo dõi danh
Đánh giá và sách nộp bài, xem nội dung tệp tin trực tuyến và tiến hành nhập
9 FR_09 Chấm điểm điểm số, lời nhận xét cho từng sinh viên/nhóm sinh viên.
Hệ thống phải cung cấp tính năng cho Giảng viên phê duyệt
Phê duyệt tài (Approve) các báo cáo xuất sắc. Hành động này sẽ chuyển trạng
liệu vào Thư thái tài liệu từ nội bộ (private) sang phát hành toàn trường
10 FR_10 viện (public).
Khi tài liệu được phê duyệt, hệ thống phải chạy ngầm tiến trình
Bóc tách và (Background Job) để trích xuất văn bản thô từ file .pdf/.docx và
Phân mảnh thực hiện chia nhỏ nội dung thành các đoạn ngữ cảnh tối ưu
11 FR_11 văn bản (Chunking Pipeline).
Hệ thống phải gọi API mô hình nhúng (Embedding Model) để
chuyển đổi các đoạn văn bản đã chia nhỏ thành các chuỗi vector
Số hóa và Lưu nhiều chiều và lưu trữ trực tiếp vào bảng report_embeddings
12 FR_12 trữ Vector trong PostgreSQL[6] bằng extension pgvector[8].
Hệ thống phải cung cấp giao diện chia đôi màn hình: một bên
Hỏi đáp tương hiển thị nội dung PDF báo cáo, một bên là khung chat bot AI.
tác tài liệu Hệ thống tự động truy quét các đoạn văn bản liên quan trong file
(Chat với làm ngữ cảnh (Prompt) phối hợp với mô hình ngôn ngữ lớn
13 FR_14 PDF) (LLM) để trả lời các câu hỏi chuyên sâu của sinh viên.

Trích dẫn Hệ thống phải hiển thị chính xác số trang hoặc đoạn văn bản gốc
nguồn tài liệu được AI sử dụng làm căn cứ trả lời câu hỏi, giúp sinh viên dễ
14 FR_15 gốc dàng đối chiếu trực quan.


## 3.3 Yêu cầu phi chức năng
Yêu cầu phi chức năng mô tả các tiêu chí về chất lượng, hiệu năng, bảo mật và khả
năng mở rộng của hệ thống
Bảng 2: Danh sách yêu cầu phi chức năng
STT Mã Yêu Cầu Tên Yêu Cầu Mô Tả Chi Tiết
Các thao tác cơ bản (chuyển trang, tải danh sách lớp,
đăng nhập) phải có thời gian phản hồi dưới 2 giây.
1 NFR_01 Hiệu năng Web Giao diện tải mượt mà không bị giật lag.
Tốc độ phản hồi của tính năng tìm kiếm ngữ nghĩa
và Chatbot AI (Chat với PDF) phải trả về kết quả
trong vòng 3 đến 7 giây (tính cả độ trễ khi gọi API
2 NFR_02 Tốc độ AI/RAG của LLM bên thứ 3).


### API
người dùng phải băm (hashing) trước khi lưu. Hệ
Bảo mật hệ thống phải chống được các lỗi bảo mật cơ bản như
3 NFR_03 thống SQL Injection, XSS.
Các khóa bảo mật quan trọng (OpenAI API Key,
Gemini API Key, Secret Key của JWT) tuyệt đối
Bảo mật API không được hard-code, phải lưu trữ an toàn trong
4 NFR_04 Key biến môi trường (.env).
Giao diện phải thiết kế đáp ứng (Responsive), hoạt
động tốt trên cả PC, Laptop và Máy tính bảng. Đặc
biệt không gian chia đôi màn hình đọc PDF và Chat
5 NFR_05 Trải nghiệm UI AI phải trực quan.
Cơ sở dữ liệu PostgreSQL[6] phải được đánh chỉ mục
(Index) tối ưu cho extension pgvector[8], đảm bảo tốc
Khả năng mở độ truy vấn khoảng cách vector không bị chậm đi khi
6 NFR_06 rộng số lượng báo cáo lên tới hàng nghìn file.

Hệ thống Backend (Node.js[3]) phải có cơ chế tự
động bắt lỗi và tự khởi động lại (restart) khi gặp sự
7 NFR_07 Tính sẵn sàng cố, đảm bảo dịch vụ luôn sẵn sàng 24/7.
Hệ thống đọc và bóc tách dữ liệu phải xử lý trơn tru
các định dạng chuẩn yêu cầu là .pdf và .docx mà
8 NFR_08 Tính tương thích không làm hỏng cấu trúc ký tự thô.


## 3.4 Use Case Diagram
Hệ thống có các tác nhân chính sau:
Bảng 3: Danh sách các tác nhân của dự án
STT Tác nhân (Actor) Vai trò hệ thống
Là đối tượng sử dụng hệ thống để tham gia các lớp học
phần (thông qua mã lớp), theo dõi tiến độ và nộp các báo
cáo/đồ án. Đồng thời, đây là người khai thác chính phân
hệ Thư viện số thông minh để tìm kiếm ngữ nghĩa và trực
tiếp hỏi đáp chuyên sâu với các tài liệu bằng trợ lý AI
1 Sinh viên (RAG).
Là đối tượng vận hành các nghiệp vụ quản lý giáo dục.
Có toàn quyền khởi tạo lớp học, nạp tự động danh sách
sinh viên bằng file CSV, thiết lập các mốc nộp bài
(Milestones). Đặc biệt, giảng viên đóng vai trò là "người
gác cổng" tri thức: thực hiện chấm điểm, nhận xét và phê
2 Giảng viên duyệt các báo cáo xuất sắc đưa vào kho học liệu chung.
Là đối tượng quản lý cấp cao nhất của hệ thống. Chịu
trách nhiệm giám sát toàn bộ hoạt động, quản lý tài
khoản người dùng, kiểm soát tài nguyên lưu trữ của cơ sở
dữ liệu (bao gồm cả dữ liệu Vector) và cấu hình các tham
Quản trị viên số kết nối hệ thống cốt lõi (như API Key của LLM, thông
3 (Admin) số server).
Tác nhân tự động: Đóng vai trò thực thi các tác vụ tính
toán nặng không cần sự can thiệp của con người. Chịu
Hệ thống xử lý trách nhiệm tự động bóc tách file .pdf/.docx, chia nhỏ
ngầm văn bản (Chunking), gọi API nhúng Vector và kết nối với
(System/Background các mô hình ngôn ngữ lớn (LLM) để xử lý luồng tìm
4 Worker) kiếm và hỏi đáp.

Bảng 4: Danh sách các usecase của chương trình
Tác nhân
STT Mã UC Tên usecase Mô tả Usecase tương tác Độ phức tạp
Sinh viên,
Đăng nhập bằng tài Người dùng đăng nhập hệ thống bằng Giảng viên,
1 UC001 khoản Microsoft tài khoản Microsoft do trường cấp. Admin Trung bình
Sinh viên,
Người dùng đăng xuất khỏi hệ thống Giảng viên,
2 UC002 Đăng xuất sau khi sử dụng. Admin Thấp
Giảng viên tạo lớp học phần để quản lý
3 UC003 Tạo lớp học phần tài liệu và sinh viên. Giảng viên Trung bình
Tham gia lớp học Sinh viên tham gia lớp học phần bằng
4 UC004 phần mã lớp do giảng viên cung cấp. Sinh viên Thấp
Sinh viên nộp tệp tin báo cáo vào các
5 UC005 Nộp báo cáo lớp học phần mà mình đang tham gia. Sinh viên Trung bình
Sinh viên xem hoặc truy cập đọc trực
6 UC006 Xem báo cáo tuyến các báo cáo học tập trên nền tảng. Sinh viên Thấp
Người dùng tải tài liệu (file PDF, Sinh viên,
7 UC007 Tải xuống báo cáo Word) về thiết bị cá nhân. Giảng viên Thấp
Người dùng tìm kiếm tài liệu theo các
Tra cứu và tham trường thông tin cơ bản như từ khóa, Sinh viên,
8 UC008 khảo báo cáo tên đồ án hoặc môn học. Giảng viên Trung bình
Quản lý lớp học Giảng viên chỉnh sửa thông tin hoặc
9 UC009 phần xóa lớp học phần đã tạo. Giảng viên Trung bình
Quản lý sinh viên Giảng viên thêm mới hoặc xóa sinh
10 UC010 trong lớp viên khỏi danh sách lớp học phần. Giảng viên Trung bình
Giảng viên chấm điểm, nhận xét đối với
Duyệt và đánh giá báo cáo của sinh viên và thực hiện lệnh
11 UC011 báo cáo phê duyệt. Giảng viên Trung bình
Sau khi được phê duyệt, báo cáo sẽ
được hệ thống chuyển đổi trạng thái và
12 UC012 Công khai báo cáo công khai vào thư viện chung. Giảng viên Thấp

Giảng viên tạo các yêu cầu nộp báo
Tạo mốc nộp bài cáo, quy định định dạng file và thời
13 UC013 (Assignment) gian hết hạn (Deadline). Giảng viên Trung bình
Giảng viên tải file CSV để tự động
Import danh sách thêm hàng loạt sinh viên vào lớp học
14 UC014 sinh viên phần. Giảng viên Trung bình
Người dùng đặt câu hỏi trực tiếp với
file báo cáo PDF. Trợ lý AI đọc nội
Truy vấn hỏi đáp dung, trích xuất ngữ cảnh và tổng hợp Sinh viên,
15 UC015 báo cáo câu trả lời chuẩn xác. Giảng viên Cao
Admin thêm, sửa, xóa, khóa hoặc phân
Quản lý người quyền cho các tài khoản trong toàn bộ
16 UC016 dùng hệ thống. Admin Trung bình
Admin giám sát, ẩn hoặc xóa triệt để
Quản lý kho tài các báo cáo vi phạm khỏi Thư viện số
17 UC017 liệu chung. Admin Trung bình

Biểu đồ use case tổng quát thể hiện các chức năng chính mà từng tác nhân có thể thực
hiện.
Hình 6: Sơ đồ usecase tổng quát của dự án



## 3.5 Đặc tả usecase quan trọng
- Đặc tả use case UC001 “Đăng nhập hệ thống DUTSTUDY và Phân quyền người dùng”
Mã Use case UC001 Tên Use case Đăng nhập hệ thống DUTSTUDY và
Phân quyền người dùng
Tác nhân Người dùng ( Sinh viên / Giảng viên )
Mô tả Người dùng đăng nhập qua tài khoản Microsoft của trường để xác thực
danh tính và được cấp quyền sử dụng các chức năng theo vai trò .
Tiền điều kiện Người dùng có tài khoản Microsoft của trường cấp .
Luồng sự kiện STT Thực hiện bởi Hành động
chính
1. N gười dùng Truy cập trang DUTSTUDY và chọn
(Thành công)
(Sinh viên / “Đăng nhập bằng tài khoản Microsoft”
Giảng viên)
2. H ệ thống Chuyển hướng người dùng đến cổng xác
thực Microsoft Identity Platform
3. N gười dùng Nhập thông tin tài khoản Microsoft
(username, password)
4. M icrosoft Xác thực thông tin và chuyển hướng về
DUTSTUDY kèm Access Token (JWT)
5. H ệ thống Xác thực token: kiểm tra chữ ký, thời hạn,
issuer
6. H ệ thống Trích xuất thông tin người dùng (email, ID)
từ token
7. H ệ thống Xác định vai trò người dùng và cấp quyền
truy cập tương ứng
8. H ệ thống Hiển thị giao diện chính theo quyền của
người dùng
Luồng sự kiện thay STT Thực hiện bởi Hành động
thế
3a. Microsoft Nếu thông tin đăng nhập sai, hiển thị lỗi
“Tài khoản hoặc mật khẩu không đúng” và
yêu cầu đăng nhập lại
5a Hệ thống Nếu token không hợp lệ hoặc hết hạn,
thông báo “Truy cập bị từ chối” và quay lại
trang đăng nhập
7a Hệ thống Nếu người dùng chưa có quyền truy cập,
hiển thị thông báo “Truy cập bị từ chối”
Hậu điều kiện
- Người dùng đã được xác thực và có quyền truy cập các chức năng
tương ứng với vai trò.
- Nếu thất bại, người dùng vẫn ở trang đăng nhập và chưa có quyền truy
cập.

* Dữ liệu đầu vào của thông tin cá nhân gồm các trường dữ liệu sau:
STT Trường dữ liệu Mô tả Bắt buộc? Điều kiện hợp lệ Ví dụ
1. Email Email sinh Có Chỉ được đăng nhập bằng email của 102230099
viên / giảng trường: @sv1.dut.
viên - Sinh viên: @sv1.dut.udn.vn udn.vn
- Giảng viên: @gv.dut.udn.vn
2. Password Mật khẩu của Có Ít nhất 8 ký tự, chứa chữ hoa, chữ ToiLa12#
người dùng thường, số và ký tự đặc biệt $
Đặc tả use case UC003 “Tạo lớp học phần”
Mã Use case UC003 Tên Use case Tạo lớp học phần
Tác nhân Giảng viên
Mô tả Giảng viên khởi tạo lớp học để sinh viên tham gia vào lớp học , làm tiền
đề cho việc nộp báo cáo , sinh mã lớp để sinh viên có thể tham gia.
Tiền điều kiện - Giảng viên đã được cấp tài khoản để đăng nhập.
- Giảng viên đăng nhập thành công
.
Luồng sự kiện STT Thực hiện bởi Hành động
chính
1. Giảng viên Chọn chức năng “Quản lý lớp học phần”
(Thành công)
2. Giảng viên Chọn “Tạo lớp học phần mới”
3. Hệ thống Hiển thị form nhập thông tin lớp
4. Giảng viên Nhập thông tin lớp học phần: Tên môn
học, mã lớp, học kỳ, năm học
5. Giảng viên N hấn “Tạo lớp”
6. Hệ thống Kiểm tra tính hợp lệ dữ liệu
7. Hệ thống Lưu thông tin lớp học phần vào database
8. Hệ thống Hiển thị thông báo tạo lớp thành công + mã
lớp
9. Giảng viên Xem danh sách các lớp học phần đã tạo
Luồng sự kiện thay STT Thực hiện bởi Hành động
thế
6a Hệ thống Nếu thông tin nhập thiếu sai định dạng , hệ
thống hiển thị lỗi , quay lại bước 4
6b Hệ thống Nếu Mã lớp đã tồn tại , hệ thống yêu cầu
nhập mã lớp khác
7a Hệ thống Nếu lưu Database thất bại , hiển thị thông
báo lỗi , không tạo lớp và cho phép thao tác
lại
Hậu điều kiện - Giảng viên có thể quản lý lớp học phần đã tạo.
- Hệ thống lưu trữ danh sách lớp học phần và thành viên tương ứng.

* Dữ liệu đầu vào của thông tin cá nhân gồm các trường dữ liệu sau:
STT Trường dữ liệu Mô tả Bắt buộc? Điều kiện hợp lệ Ví dụ
1. course_id Mã định danh Có Chỉ chứa ký tự chữ, số; không PBL23.99a
lớp học phần trùng với các lớp đã tồn tại
2. course_name Tên môn học Có Không để trống; có thể chứa PBL4
chữ, số, ký tự đặc biệt
3. academy_term Học kỳ và Có Định dạng: HKx_YYYY- HK1_2025-
năm học YYYY (ví dụ: HK1_2025- 2026
2026)
4. enrollment_code Mã lớp để Có Chỉ chứa chữ, số; độ dài 6-10 ABC123
sinh viên tự ký tự
đăng ký
5. lecturer_ID Liên kết tới tài Có Phải là ID hợp lệ đã tồn tại GV102
khoản giảng trong hệ thống giảng viên
viên tạo lớp
Đặc tả use case UC005 “Nộp báo cáo theo lớp học phần”
Mã Use case UC005 Tên Use case Nộp báo cáo theo lớp học
phần
Tác nhân Sinh viên
Mô tả Sinh viên nộp báo cáo vào lớp học phần đã tham gia bằng cách tải lên file
(PDF) và nhập thông tin mô tả. Hệ thống kiểm tra và lưu trữ báo cáo.
Tiền điều kiện - Sinh viên đã đăng nhập hệ thống.
- Sinh viên đã tham gia lớp học phần..
Luồng sự kiện chính STT Thực hiện bởi Hành động
(Thành công)
1 Sinh viên Chọn lớp học phần đã tham gia
2 Hệ thống Kiểm tra quyền truy cập của sinh viên
3 Hệ thống Hiển thị form nộp báo cáo
4 Sinh viên Upload file PDF và nhập mô tả báo cáo
5 Sinh viên Nhấn “Nộp báo cáo”
6 Hệ thống Kiểm tra dung lượng và định dạng file
7 Hệ thống Lưu file
8 Hệ thống Lưu metadata (mô tả, thời gian, sinh viên,
lớp , link báo cáo, trạng thái )
9 Hệ thống Cập nhật trạng thái báo cáo là "Chờ duyệt"
10 Hệ thống Thông báo nộp báo cáo thành công
Luồng sự kiện thay STT Thực hiện bởi Hành động
thế
2a. Hệ thống Nếu sinh viên chưa tham gia lớp học phần,
thông báo “Bạn chưa có quyền nộp báo
cáo cho lớp này”
6a. Hệ thống Nếu file sai định dạng hoặc vượt dung
lượng cho phép, thông báo lỗi và yêu cầu

sinh viên tải lại file khác
6b Hệ thống Nếu báo cáo trễ hạn nộp , hiển thị thông
báo .
7a Hệ thống Nếu lưu file thất bại do lỗi hệ thống, thông
báo lỗi và yêu cầu thực hiện lại .
8a Hệ thống Nếu lưu file metadata thất bại do lỗi hệ
thống, thông báo lỗi và yêu cầu thực hiện
lại .
Hậu điều kiện - File báo cáo và thông tin metadata đã được lưu trong hệ thống.
- Trạng thái báo cáo được cập nhật “Chờ duyệt”.
- Sinh viên nhận được thông báo kết quả thao tác
* Dữ liệu đầu vào của thông tin cá nhân gồm các trường dữ liệu sau:
STT Trường dữ liệu Mô tả Bắt buộc? Điều kiện hợp lệ Ví dụ
1. r eport_id Mã định danh Có Chỉ chứa chữ và số, BC20260406_00
duy nhất cho báo không trùng với các 1
cáo báo cáo đã tồn tại
2. ti tle Tên đề tài đồ án Có Không để trống, tối Xây dựng hệ
hoặc báo cáo đa 200 ký tự thống quản lý
lớp
3. fi le_Path Đường dẫn lưu Có File tồn tại, đúng định /uploads/BC202
file trên máy chủ dạng cho phép (PDF, 60406_001.pdf
DOCX, ZIP…), dung
lượng ≤ 20MB
4. c reated_at Thời điểm sinh Có Không được trước 2026-04-06
viên nộp báo cáo ngày tạo lớp, không 10:30
vượt quá thời hạn nộp
quy định
5. st atus Trạng thái của Có Giá trị Enum: “Chờ Chờ duyệt
báo cáo duyệt”, “Đã duyệt”,
“Yêu cầu sửa”
6. c ourse_id Liên kết tới mã có Phải là khoá học hợp PBL23.99a
khoá học lệ đã tồn tại trong hệ
thống
7. st udent_id Liên kết tới mã Có Phải là MSSV hợp lệ 102230099
sinh viên nộp đã tồn tại trong hệ
báo cáo thống

Đặc tả use case UC011 “Duyệt và đánh giá báo cáo”
Mã Use case UC0011 Tên Use case Duyệt và đánh giá báo cáo
Tác nhân Giảng viên
Mô tả Giảng viên xem danh sách các báo cáo do sinh viên nộp trong lớp học phần
phụ trách, sau đó duyệt hoặc từ chối báo cáo và đưa ra đánh giá.
Tiền điều kiện - Giảng viên đã đăng nhập hệ thống.
- Giảng viên phụ trách ít nhất một lớp học phần.
Luồng sự kiện STT Thực hiện bởi Hành động
chính
1 Giảng viên Chọn lớp học phần mình phụ trách
(Thành công)
2 Hệ thống Hiển thị danh sách các báo cáo chờ duyệt
3 Giảng viên Chọn một báo cáo từ danh sách
4 Hệ thống Hiển thị nội dung báo cáo (file, mô tả, thông
tin sinh viên)
5 Giảng viên Thực hiện duyệt hoặc từ chối báo cáo
6 Giảng viên Nhận xét báo cáo sinh viên
7 Hệ thống Cập nhật trạng thái báo cáo (“Đã duyệt”
hoặc “Yêu cầu sửa”) và lưu lý do nếu có
8 Hệ thống Gửi thông báo kết quả cho sinh viên
Luồng sự kiện thay STT Thực hiện bởi Hành động
thế
6a. Giảng viên Nếu chọn từ chối báo cáo, phải nhập lý do
từ chối
7a. Hệ thống Nếu lưu trạng thái hoặc lý do thất bại do lỗi
hệ thống, thông báo lỗi và yêu cầu thực
hiện lại
8a. Hệ thống Nếu sinh viên không nhận thông báo (lỗi hệ
thống), ghi log và thông báo cho giảng viên
Hậu điều kiện - Báo cáo được cập nhật trạng thái “Đã duyệt” hoặc “Yêu cầu sửa”.
- Lý do từ chối được lưu (nếu có).
- Sinh viên nhận thông báo về kết quả đánh giá.
* Dữ liệu đầu vào của thông tin cá nhân gồm các trường dữ liệu sau:
ST
Trường dữ liệu Mô tả Bắt buộc? Điều kiện hợp lệ Ví dụ
T
1 lecturer_id Mã định danh Có Phải là ID giảng viên hợp lệ GV102
giảng viên thực đã tồn tại trong hệ thống
hiện duyệt
2 repord_id Mã định danh báo Có Phải là ID báo cáo hợp lệ đã BC2026040
cáo cần duyệt được sinh viên nộp 6_001
3 status Trạng thái đánh giá Có Giá trị Enum: “Approved” Approved _001
báo cáo (Đã duyệt) hoặc “Rejected”
(Từ chối)
4 feedback Nhận xét của giảng Không Tối đa 500 ký tự Báo cáo tốt,

viên về báo cáo đầy đủ nội
dung
5 reason Lý do từ chối báo Không Chỉ nhập nếu trangthai= Thiếu phần
cáo (nếu có) rejected, tối đa 300 ký tự kết luận
6 evaluation_score Điểm đánh giá báo Có Số thực từ 0 đến 10 hoặc 8.5
cáo theo thang điểm quy định
7 evaluated_at Thời điểm giảng Có Không được trước ngày nộp 2026-04-06
viên thực hiện đánh báo cáo, định dạng Datetime 14:30
giá
Đặc tả use case UC008 “Tra cứu và tham khảo báo cáo”
Mã Use case UC008 Tên Use case Tra cứu và tham khảo báo
cáo
Tác nhân - Sinh viên
- Giảng viên
Mô tả Cho phép người dùng tìm kiếm, xem và tải về các báo cáo đã được giảng
viên duyệt để phục vụ học tập và tham khảo
Tiền điều kiện - Người dùng đã đăng nhập hệ thống.
- Báo cáo phải đã được duyệt để hiển thị trong thư viện DUTSTUDY .
Luồng sự kiện STT Thực hiện bởi Hành động
chính
1 Giảng viên / Truy cập trang thư viện báo cáo
(Thành công)
Sinh viên
2 Giảng viên / Nhập từ khóa tìm kiếm
Sinh viên
3 Giảng viên / Lọc kết quả theo: tên báo cáo, môn học, lớp
Sinh viên học phần, giảng viên hướng dẫn
4 Hệ thống Truy vấn cơ sở dữ liệu dựa trên từ khóa và
bộ lọc
5 Giảng viên / Hiển thị danh sách báo cáo phù hợp
Sinh viên
6 Giảng viên / Chọn báo cáo để xem trực tiếp hoặc tải về
Sinh viên
Luồng sự kiện thay STT Thực hiện bởi Hành động
thế
3a Hệ thống Nếu không tìm thấy báo cáo phù hợp, hiển
thị thông báo: “Không tìm thấy báo cáo phù
hợp”
6a Giảng viên / Nếu file báo cáo lỗi hoặc không thể tải về,
Sinh viên thông báo lỗi và yêu cầu thử lại
Hậu điều kiện - Người dùng có thể xem hoặc tải về các báo cáo đã được duyệt.
- Thông tin tìm kiếm được ghi nhận để cải thiện hiệu quả tra cứu trong
các lần tiếp theo.

* Dữ liệu đầu vào của thông tin cá nhân gồm các trường dữ liệu sau:
STT Trường dữ liệu Mô tả Bắt buộc? Điều kiện hợp lệ Ví dụ
1 report_id Mã định danh Có Không trùng với các BC20260406_001
duy nhất của báo báo cáo đã tồn tại
cáo
2 Title Tên đề tài báo Có Không để trống, tối đa Xây dựng hệ thống
cáo 200 ký tự quản lý báo cáo đồ án
sinh viên
3 course_name Tên môn học Có Không để trống PBL4
của báo cáo
4 course_id Mã lớp học phần Có Phải là lớp hợp lệ trong PBL23.99
mà báo cáo hệ thống
thuộc về
5 lecturer_id_ Mã giảng viên Có Phải là giảng viên hợp GV102
hướng dẫn/đánh lệ đã tồn tại
giá báo cáo
6 student_id Mã sinh viên Có Phải là sinh viên hợp lệ 102230099
nộp báo cáo đã tồn tại
7 status Trạng thái duyệt Có Giá trị Enum: Approved
báo cáo “Approved” (Đã
duyệt) hoặc “Rejected”
8 file_path Đường dẫn lưu Có File tồn tại, đúng định /uploads/BC2026040
file trên máy chủ dạng (PDF, DOCX, 6_001.pdf
ZIP…)
9 submitted_at Ngày sinh viên Có Không vượt quá hạn 2026-04-06 10:30
nộp báo cáo nộp quy định
10 feedback Nhận xét của Không Tối đa 500 ký tự Báo cáo tốt, đầy đủ
giảng viên (nếu nội dung
có)
Đặc tả use case UC015 “Truy vấn hỏi đáp báo cáo”
Mã Use case UC015 Tên Use case Truy vấn hỏi đáp báo cáo
Tác nhân - Sinh viên
- Giảng viên
Mô tả - Người dùng đặt câu hỏi trực tiếp trên giao diện đọc báo cáo. Hệ thống
sử dụng công nghệ RAG để trích xuất ngữ cảnh từ cơ sở dữ liệu Vector
và dùng LLM để sinh câu trả lời chính xác, kèm theo trích dẫn.
Tiền điều kiện - Người dùng đang mở giao diện chi tiết của một báo cáo. Báo cáo này
đã được bóc tách và nhúng Vector thành công vào CSDL.
Luồng sự kiện STT Thực hiện bởi Hành động
chính
1 Người dùng Nhập nội dung câu hỏi vào khung Chatbox
(Thành công)
bên cạnh tài liệu và bấm nút "Gửi".
2 Hệ thống Tiếp nhận input, vô hiệu hóa nút gửi
(Frontend) (loading) và gọi API gửi câu hỏi cùng
report_id lên Backend.

3 Hệ thống Gọi dịch vụ/API Embedding để biến đổi
(Backend) câu hỏi của người dùng thành một chuỗi
Vector (Query Vector).
Thực thi truy vấn Cosine Similarity để tìm
kiếm các đoạn văn bản (Chunks) trong DB
4.
Hệ thống có khoảng cách Vector gần nhất với Query
(Database) Vector của report_id tương ứng.
5.
Hệ thống Trích xuất nội dung Text của các Chunks
(Backend) tìm được để làm ngữ cảnh (Context).
Lắp ráp Context và Câu hỏi của người
6.
Hệ thống dùng vào một kịch bản Prompt hệ thống
(Backend) đã định nghĩa sẵn.
Luồng sự kiện thay STT
thế Thực hiện bởi Hành động
Nếu người dùng gửi tin nhắn rỗng hoặc
1a. Hệ thống chỉ chứa khoảng trắng, hệ thống chặn gửi
(Frontend) và yêu cầu nhập nội dung.
Nếu không tìm thấy Chunk nào có độ
tương đồng vượt quá ngưỡng tối thiểu
(Threshold), Backend chuyển sang kịch
bản prompt từ chối. LLM sẽ trả lời: "Dựa
4a. Hệ thống trên nội dung tài liệu, không có đủ thông
(Backend) tin để trả lời câu hỏi này."
Hậu điều kiện - Hệ thống hiển thị câu trả lời chính xác cho người dùng.
- Lịch sử đoạn chat được lưu tạm thời trên giao diện (hoặc lưu vào
DB tùy cấu hình) để duy trì ngữ cảnh cho các câu hỏi tiếp theo.
* Dữ liệu đầu vào của thông tin cá nhân gồm các trường dữ liệu sau:
STT Trường dữ liệu Mô tả Bắt buộc? Điều kiện hợp lệ Ví dụ
Không rỗng, không chứa
Câu truy vấn các lệnh Thuật toán phân
bằng ngôn ngữ jailbreak/prompt tích tĩnh dùng
Nội dung câu tự nhiên của injection lộ liễu. Tối đa trong báo cáo là
1. hỏi (Message) người dùng Có 1000 ký tự. gì?
Mã định danh Phải là chuỗi ID/UUID 550e8400-e29b-
ID Báo cáo của tài liệu đang hợp lệ tồn tại trong hệ 41d4-a716-
2. (Report ID) xem Có thống 446655440000



## 3.3 Activity Diagram


### 3.3.1 UC001 - Đăng nhập hệ thống DUTSTUDY và phân quyền người dùng
Hình 7: Biểu đồ hoạt động UC001 “Đăng nhập hệ thống DUTSTUDY và phân quyền
người dùng “



### 3.3.2 UC003 - Tạo lớp học phần ( Giảng viên )
Hình 8: Biểu đồ hoạt động UC002 “Tạo lớp học phần”



### 3.3.3 UC005 - Nộp báo cáo theo lớp học phần ( Sinh viên )
Hình 9: Biểu đồ hoạt động UC003 “Nộp báo cáo theo lớp học phần”


### 3.3.4 UC011 - Duyệt và đánh giá báo cáo ( Giảng viên )
Hình 10:Biểu đồ hoạt động UC004 “Duyệt và đánh giá báo cáo của giảng viên”



### 3.3.5 UC008 - Tra cứu và tham khảo báo cáo ( Sinh viên / Giảng viên )
Hình 11:Biểu đồ hoạt động UC005 “Tra cứu và tham khảo báo cáo ”

3.3.6 UC015 – Truy vấn hỏi đáp báo cáo sinh viên ( Sinh viên / Giảng
viên )
Hình 12:Biểu đồ hoạt động UC005 “Truy vấn hỏi đáp báo cáo sinh viên”



## 3.4 Sequence Diagram


### 3.4.1 UC001 - Đăng nhập hệ thống DUTSTUDY và phân quyền người dùng
Hình 13: Biểu đồ trình tự đăng nhập hệ thống và phân quyền người dùng



### 3.4.2 UC003 - Tạo lớp học phần ( Giảng viên )
Hình 14: Biểu đồ trình tự tạo lớp học phần


### 3.4.3 UC005 - Nộp báo cáo theo lớp học phần ( Sinh viên )
Hình 15: Biểu đồ trình tự nộp báo cáo theo lớp học phần



### 3.4.4 UC011 - Duyệt và đánh giá báo cáo ( Giảng viên )
Hình 16: Biểu đồ trình tự duyệt và đánh giá báo cáo của giảng viên



### 3.4.5 UC008 - Tra cứu và tham khảo báo cáo ( Sinh viên / Giảng viên )
Hình 17: Biểu đồ trình tự tra cứu và tham khảo báo cáo



### 3.4.6 UC015 – Truy vấn hỏi đáp thông tin tài liệu ( Sinh viên / Giảng viên )
Hình 18: Biểu đồ trình tự truy vấn hỏi đáp thông tin tài liệu



## 3.5 Thiết kế cơ sở dữ liệu
Cơ sở dữ liệu của hệ thống được thiết kế nhằm lưu trữ thông tin người dùng, học
phần, bài tập, báo cáo, bài nộp, tiến độ đồ án, thông báo và dữ liệu phục vụ RAG.
PostgreSQL[6] được sử dụng làm hệ quản trị cơ sở dữ liệu chính do hỗ trợ tốt dữ liệu
quan hệ, truy vấn phức tạp, chỉ mục tìm kiếm và khả năng mở rộng.
Thiết kế cơ sở dữ liệu hướng đến việc hỗ trợ đầy đủ workflow của hệ thống Project
Based Learning: quản lý người dùng theo vai trò, quản lý lớp học phần, quản lý sinh
viên tham gia lớp, giao bài tập, nộp báo cáo, xử lý tài liệu, đánh giá báo cáo, lưu lịch
sử phiên bản, quản lý thông báo và hỗ trợ tìm kiếm ngữ nghĩa.
Hình 19: Cơ sở dữ liệu tổng quát

Bảng 5. Mô tả các bảng trong cơ sở dữ liệu
STT Tên bảng Mô tả dữ liệu lưu trữ
1 users Lưu trữ thông tin tài khoản người dùng như họ
tên, email, mật khẩu đã mã hóa, vai trò, trạng thái
tài khoản, mã sinh viên, lớp, khoa và thông tin
giảng viên
2 refresh_tokens Lưu trữ refresh token phục vụ cơ chế đăng nhập,
gia hạn phiên và đăng xuất khỏi nhiều thiết bị
3 user_import_batches Lưu lịch sử các lần import danh sách sinh viên
hoặc giảng viên từ file CSV, bao gồm số dòng
thành công, thất bại và chi tiết lỗi
4 courses Lưu thông tin lớp học phần / đồ án / khóa luận,
bao gồm mã lớp, học kỳ, năm học, loại lớp, giảng
viên phụ trách, mã tham gia và thời hạn nộp bài
5 course_lecturers Lưu danh sách giảng viên tham gia một lớp học
phần với các vai trò khác nhau như hướng dẫn,
phản biện hoặc thành viên hội đồng
6 enrollments Lưu thông tin sinh viên đăng ký tham gia lớp học
phần, bao gồm trạng thái tham gia
7 evaluation_criteria Lưu các tiêu chí chấm điểm cho từng lớp học
phần, bao gồm tên tiêu chí, trọng số phần trăm,
điểm tối đa và thứ tự hiển thị
8 projects Lưu thông tin đồ án của sinh viên như tên đề tài,
mô tả, giảng viên hướng dẫn, trạng thái thực
hiện, thời gian bắt đầu và kết thúc
9 Research_paper Lưu thông tin bài nghiên cứu khoa học của sinh
viên, bao gồm tiêu đề, tóm tắt, từ khóa, tạp chí,
DOI và trạng thái xuất bản
10 mentorships Lưu mối quan hệ hướng dẫn giữa giảng viên và
sinh viên, gắn với đồ án hoặc lớp học phần cụ
thể, bao gồm thời gian và trạng thái
11 progress_tracking Lưu các mốc tiến độ (milestone) của đồ án, bao
gồm tên mốc, mô tả, hạn chót, trạng thái hoàn
thành và người xác nhận
12 reports Lưu báo cáo sinh viên nộp vào hệ thống, bao
gồm file đính kèm, trạng thái duyệt, trạng thái
embedding RAG, người phê duyệt, lượt xem và
phạm vi hiển thị
13 report_versions Lưu lịch sử các phiên bản nộp lại của một báo
cáo, bao gồm nội dung, file, hash và tóm tắt thay
đổi so với lần trước
14 report_chunks Lưu các đoạn văn bản đã chia nhỏ từ báo cáo
kèm vector embedding phục vụ tìm kiếm ngữ
nghĩa RAG, bao gồm vị trí trang và section

15 report_references Lưu danh mục tài liệu tham khảo được trích xuất
từ báo cáo, bao gồm tiêu đề, tác giả, năm xuất
bản, nguồn và URL
16 report_ratings Lưu đánh giá sao (1–5) của người dùng đối với
báo cáo, mỗi người chỉ đánh giá một lần cho mỗi
báo cáo
17 favorites Lưu danh sách báo cáo được người dùng đánh
dấu yêu thích để truy cập nhanh sau này
18 Feedback Lưu nhận xét và đánh giá của giảng viên đối với
báo cáo sinh viên, bao gồm điểm tổng, điểm theo
từng tiêu chí và chế độ riêng tư
19 assignments Lưu bài tập và đầu việc giảng viên giao cho lớp,
bao gồm loại bài tập, hạn nộp, file đính kèm và
chính sách nộp trễ
20 assignment_submissions Lưu bài nộp của sinh viên cho từng bài tập, bao
gồm trạng thái nộp, nhận xét của giảng viên và số
lần nộp
21 class_posts Lưu bài đăng thông báo trong lớp học phần, bao
gồm nội dung, file đính kèm, trạng thái ghim và
tác giả
22 class_post_comments Lưu bình luận của người dùng trên các bài đăng
trong lớp học phần
23 Notifications Lưu thông báo hệ thống gửi đến người dùng như
duyệt báo cáo, nhận phản hồi, cảnh báo đạo văn,
bao gồm trạng thái đã đọc và kênh gửi
24 rag_query_logs Lưu lịch sử truy vấn AI của người dùng, bao gồm
câu hỏi, vector embedding, kết quả trả về, thời
gian xử lý và phản hồi chất lượng


## 3.6 Thiết kế kiến trúc hệ thống
Hệ thống được thiết kế theo hướng tách thành nhiều service độc lập nhằm dễ phát
triển, kiểm thử, triển khai và mở rộng. Mỗi service đảm nhiệm một nhóm chức năng
riêng, trong đó Backend API đóng vai trò trung tâm điều phối request giữa Frontend,
cơ sở dữ liệu, dịch vụ lưu trữ file, hàng đợi xử lý và các dịch vụ AI.

- Kiến trúc sử dụng cho dự án này :
Hình 20: Mô hình kiến trúc monolith
- Kiến trúc tổng quát của hệ thống
Hình 21: Kiến trúc tổng quát hệ thống



# CHƯƠNG 4: XÂY DỰNG HỆ THỐNG


## 4.1 Giới thiệu hệ thống
DUTSTUDY là hệ thống web hỗ trợ quản lý học phần, báo cáo học thuật và hỏi đáp tài
liệu dựa trên kỹ thuật Retrieval-Augmented Generation. Hệ thống được xây dựng nhằm
hỗ trợ quá trình học tập theo mô hình Project Based Learning, trong đó sinh viên có thể
tham gia lớp học, nhận bài tập, nộp báo cáo, theo dõi phản hồi từ giảng viên và khai
thác trợ lý AI để tra cứu nội dung tài liệu đã nộp.
Khác với các hệ thống quản lý học tập thông thường chỉ tập trung vào việc giao bài và
nộp bài, hệ thống trong đề tài còn tích hợp thêm quy trình xử lý báo cáo học thuật bằng
AI. Khi sinh viên hoặc giảng viên tải lên tài liệu như PDF hoặc DOCX, hệ thống lưu
trữ file, đưa tài liệu vào hàng đợi xử lý, trích xuất nội dung, tóm tắt các phần quan trọng
và tạo embedding phục vụ tìm kiếm ngữ nghĩa. Nhờ đó, người dùng có thể đặt câu hỏi
trực tiếp trên nội dung báo cáo và nhận câu trả lời dựa trên ngữ cảnh tài liệu.
Hệ thống gồm các nhóm chức năng chính: quản lý người dùng, quản lý học phần, quản
lý bài tập, nộp báo cáo, quản lý thư viện học thuật, xử lý tài liệu, tìm kiếm ngữ nghĩa,
hỏi đáp AI, quản lý thông báo và thống kê hệ thống. Với vai trò sinh viên, người dùng
có thể xem các lớp đã tham gia, truy cập chi tiết lớp học, xem bài tập, nộp báo cáo, xem
phản hồi và sử dụng chức năng hỏi đáp AI. Với vai trò giảng viên, người dùng có thể
quản lý lớp học, tạo bài tập, theo dõi bài nộp, nhận xét và chấm điểm báo cáo. Với vai
trò quản lý hoặc quản trị viên, người dùng có thể quản lý tài khoản, import danh sách
sinh viên/giảng viên, quản lý học phần, quản lý báo cáo và xem thống kê tổng quan.
Về kiến trúc, hệ thống được chia thành nhiều thành phần để thuận tiện cho phát triển,
triển khai và mở rộng. Frontend cung cấp giao diện tương tác cho người dùng. Backend


### API
dịch vụ liên quan. Worker Python đảm nhiệm việc xử lý tài liệu như trích xuất nội dung
PDF, xây dựng cấu trúc tài liệu, tạo tóm tắt và embedding. LLM Service cung cấp các


### API
ra, hệ thống sử dụng Redis[9] làm hàng đợi xử lý và MinIO[10] làm nơi lưu trữ file.
Trong hệ thống, frontend không gọi trực tiếp các dịch vụ xử lý AI mà thông qua
Backend API. Cách thiết kế này giúp backend kiểm soát xác thực, phân quyền, trạng
thái báo cáo và dữ liệu người dùng trước khi chuyển request sang các service nội bộ.
Đồng thời, các thông tin nhạy cảm như cấu hình kết nối cơ sở dữ liệu, dịch vụ lưu trữ,
mô hình AI và API key được bảo vệ ở phía server thay vì đưa lên frontend.

Luồng sử dụng chính của hệ thống bắt đầu từ việc sinh viên đăng nhập, tham gia học
phần, mở bài tập và nộp báo cáo. Sau khi báo cáo được tải lên, backend lưu file vào
MinIO, tạo bản ghi báo cáo trong cơ sở dữ liệu và đẩy job vào Redis[9] queue. Worker
Python nhận job, tải file từ MinIO[10], trích xuất nội dung tài liệu, tạo cây cấu trúc nội
dung, sinh tóm tắt và embedding. Khi quá trình xử lý hoàn tất, người dùng có thể tìm
kiếm báo cáo trong thư viện học thuật hoặc đặt câu hỏi với trợ lý AI dựa trên nội dung
đã được xử lý.
Như vậy, hệ thống đã kết hợp được ba hướng xử lý trong cùng một nền tảng: quản lý
học phần và báo cáo, xử lý tài liệu học thuật tự động, và hỗ trợ hỏi đáp thông minh bằng
kỹ thuật RAG.


## 4.2 Công nghệ và môi trường sử dụng
Để xây dựng hệ thống, đề tài sử dụng các công nghệ phù hợp với từng thành phần trong
kiến trúc. Frontend được xây dựng bằng React[1], TypeScript và TailwindCSS[5] nhằm
tạo giao diện web hiện đại, dễ mở rộng và có khả năng tái sử dụng component. Axios
được sử dụng để giao tiếp với backend thông qua REST API, đồng thời hỗ trợ cơ chế
tự động gắn JWT token và refresh token khi phiên đăng nhập hết hạn.
Backend được xây dựng bằng Node.js[3], ExpressJS[4] và TypeScript[2]. Backend đảm
nhiệm các chức năng nghiệp vụ chính như xác thực người dùng, phân quyền theo vai
trò, quản lý học phần, quản lý bài tập, quản lý báo cáo, xử lý nộp file, tạo thông báo và
gọi các dịch vụ AI. PostgreSQL[6] được sử dụng làm hệ quản trị cơ sở dữ liệu chính để
lưu trữ thông tin người dùng, học phần, bài tập, báo cáo, phiên nộp bài, đánh giá và dữ
liệu liên quan đến RAG.
Hệ thống sử dụng MinIO[10] để lưu trữ các file người dùng tải lên như báo cáo PDF,
tài liệu DOCX và file đính kèm trong lớp học. Redis[9] được sử dụng làm hàng đợi xử
lý bất đồng bộ, giúp backend không phải xử lý trực tiếp các tác vụ nặng như trích xuất
PDF hoặc tạo embedding. Khi có báo cáo mới, backend đẩy job vào Redis queue, sau
đó worker Python sẽ nhận job và xử lý ở nền.
LLM Service được xây dựng bằng FastAPI[12] và Python. Service này tích hợp
Ollama[13] với mô hình Qwen2.5[15] nhằm phục vụ các chức năng tóm tắt nội dung,
lựa chọn node liên quan và sinh câu trả lời cho truy vấn của người dùng. Worker Python
sử dụng các thư viện xử lý tài liệu như pdfplumber để trích xuất nội dung PDF, sau đó
xây dựng cây nội dung, tóm tắt từng phần và tạo embedding phục vụ tìm kiếm ngữ
nghĩa.

Ngoài ra, hệ thống được đóng gói và triển khai bằng Docker[11] Compose. Các service
như frontend, backend, Redis, MinIO[10] và worker có thể được khởi chạy độc lập,
giúp quá trình phát triển và kiểm thử thuận tiện hơn.
Bảng 6. Công nghệ sử dụng trong hệ thống
STT Thành phần hệ thống Công nghệ sử dụng Vai trò công nghệ
1 Frontend React, TypeScript Xây dựng giao diện
người dùng dạng
Single Page
Application
2 UI Framework TailwindCSS[5], Lucide Thiết kế giao diện,
React icon và bố cục trực
quan
3 Backend API Node.js, ExpressJS, Xử lý API, nghiệp
TypeScript vụ, xác thực và phân
quyền
4 Database PostgreSQL Lưu trữ dữ liệu người
dùng, học phần, báo
cáo và bài nộp
5 Authentication JWT, Refresh Token Xác thực phiên đăng
nhập và bảo vệ API
6 File Storage MinIO Lưu trữ file báo cáo,
tài liệu và file đính
kèm
7 Queue Service Redis Quản lý hàng đợi xử
lý tài liệu bất đồng bộ
8 AI Service FastAPI, Python Cung cấp API tóm
tắt, tìm kiếm và hỏi
đáp AI
9 LLM runtime Ollama, Qwen2.5 Sinh phản hồi ngôn
ngữ tự nhiên cho
chức năng AI
10 PDF Processing pdfplumber Trích xuất nội dung
từ tài liệu PDF
11 RAG/ Vector Search Supabase/Pinecone[18], Lưu trữ và tìm kiếm
Embedding ngữ nghĩa theo nội
dung tài liệu
12 Container Docker, Docker Compose Đóng gói và triển
khai các service trong
hệ thống

Bảng 7. Môi trường thực nghiệm và xây dựng hệ thống
STT Thành phần môi Môi trường chi tiết Ghi chú
trường
1 Hệ điều hành phát triển Windows 10 / Windows Môi trường phát triển
11 cục bộ
2 Ngôn ngữ frontend TypeScript Tăng khả năng kiểm
soát kiểu dữ liệu
3 Ngôn ngữ backend TypeScript Xây dựng API có cấu
trúc rõ ràng
4 Ngôn ngữ xử lý AI Python Xử lý tài liệu, gọi
LLM và tạo
embedding
5 Framework frontend React Xây dựng giao diện
người dùng
6 Framework backend ExpressJS Xây dựng RESTful


### API
7 Framework AI service FastAPI Xây dựng API bất
đồng bộ cho AI
8 Cơ sở dữ liệu PostgreSQL Lưu trữ dữ liệu
nghiệp vụ chính
9 Lưu trữ file MinIO Lưu file báo cáo và
tài liệu
10 Hàng đợi xử lý Redis Điều phối job xử lý
tài liệu
11 Công cụ triển khai Docker Compose Docker Compose
Khởi chạy nhiều
service cùng lúc
12 Công cụ quản lý mã Git / GitHub Quản lý phiên bản
nguồn mã nguồn


## 4.3 Giao diện hệ thống
Giao diện hệ thống được thiết kế theo hướng trực quan, dễ sử dụng và phù hợp với quy
trình học tập theo mô hình Project Based Learning. Các màn hình quan trọng của hệ
thống gồm: giao diện đăng nhập, giao diện trang chủ theo vai trò, giao diện danh sách
học phần, giao diện chi tiết lớp học, giao diện nộp báo cáo, giao diện quản lý bài tập,
giao diện thư viện học thuật, giao diện hỏi đáp AI, giao diện chấm điểm và giao diện
quản trị người dùng.



### 4.3.1. Giao diện đăng nhập
Giao diện đăng nhập cho phép người dùng nhập email và mật khẩu để truy cập hệ thống.
Sau khi đăng nhập thành công, backend trả về access token, refresh token và thông tin
người dùng. Frontend lưu token để sử dụng cho các request tiếp theo. Tùy theo vai trò
của người dùng, hệ thống điều hướng đến giao diện phù hợp như trang sinh viên, trang
giảng viên, trang quản lý hoặc trang quản trị.
Hình 22: Giao diện trang đăng nhập hệ thống


### 4.3.2. Giao diện trang chủ / Dashboard
Sau khi đăng nhập, người dùng được chuyển đến trang chủ tương ứng với vai trò. Với
sinh viên, giao diện hiển thị các lớp học đã tham gia, bài tập cần hoàn thành và các
thông báo mới. Với giảng viên, giao diện hiển thị danh sách lớp đang phụ trách, bài nộp
cần chấm và tiến độ của sinh viên. Với quản lý hoặc quản trị viên, dashboard cung cấp
thông tin tổng quan về số lượng người dùng, học phần, báo cáo và hoạt động của hệ
thống.

- Sinh viên :
Hình 23: Giao diện trang Dashboard (sinh viên)
- Giảng viên :
Hình 24: Giao diện Dashboard (giảng viên)

- Admin :
Hình 25: Giao diện Dashboard (admin)


### 4.3.3. Giao diện danh sách học phần
Giao diện danh sách học phần hiển thị các lớp học phần hiện có trong hệ thống. Mỗi
học phần gồm tên lớp, mã học phần, học kỳ, năm học, giảng viên phụ trách và số lượng
sinh viên tham gia. Sinh viên có thể xem các lớp đã tham gia hoặc nhập mã để tham gia
lớp mới. Giảng viên và quản lý có thể tạo mới, chỉnh sửa hoặc xóa học phần nếu có
quyền.
- Sinh viên :
Hình 26: Giao diện trang danh sách lớp học phần (sinh viên)

- Giảng viên :
Hình 27: Giao diện trang danh sách lớp học phần (giảng viên)


### 4.3.4. Giao diện chi tiết lớp học
Khi người dùng chọn một học phần, hệ thống hiển thị giao diện chi tiết lớp học. Giao
diện này gồm các thông báo trong lớp, danh sách bài tập, tài liệu học tập, bài đăng của
giảng viên và danh sách sinh viên. Sinh viên có thể xem yêu cầu bài tập, bình luận trong
lớp và thực hiện nộp báo cáo. Giảng viên có thể tạo bài tập mới, đăng thông báo và theo
dõi tình trạng nộp bài của sinh viên.
- Sinh viên :
Hình 28: Giao diện trang chi tiết lớp học phần (sinh viên)

- Giảng viên :
Hình 29: Giao diện trang chi tiết lớp học phần (giảng viên)


### 4.3.5. Giao diện nộp báo cáo
Giao diện nộp báo cáo cho phép sinh viên nhập tiêu đề, mô tả nội dung và tải lên file
báo cáo. Hệ thống hỗ trợ các định dạng tài liệu như PDF hoặc DOCX. Sau khi sinh viên
nộp báo cáo, backend lưu file vào MinIO[10], tạo bản ghi báo cáo trong cơ sở dữ liệu
và đưa tài liệu vào hàng đợi xử lý. Trạng thái xử lý báo cáo được cập nhật để người
dùng biết tài liệu đang chờ xử lý, đang xử lý, hoàn tất hoặc bị lỗi.
Hình 30: Giao diện trang nộp báo cáo (sinh viên)



### 4.3.6. Giao diện quản lý và nhận xét bài nộp
Giao diện nhận xét dành cho giảng viên cho phép xem danh sách bài nộp của sinh viên
theo từng bài tập. Giảng viên có thể mở chi tiết bài nộp, tải file báo cáo, xem trạng thái
xử lý tài liệu, ghi nhận xét. Giao diện này giúp giảng viên theo dõi tiến độ học tập, đánh
giá chất lượng báo cáo và phản hồi trực tiếp cho sinh viên.
Hình 31: Giao diện trang quản lý và nhận xét báo cáo (giảng viên)


### 4.3.7. Giao diện thư viện học thuật
Giao diện thư viện học thuật cho phép người dùng tra cứu các báo cáo đã được công
khai hoặc các tài liệu mà người dùng có quyền truy cập. Người dùng có thể tìm kiếm
theo tiêu đề, từ khóa, năm học, loại báo cáo hoặc lĩnh vực nghiên cứu. Mỗi báo cáo hiển
thị các thông tin cơ bản như tiêu đề, tác giả, mô tả, trạng thái, lượt xem và tài liệu tham
khảo nếu đã được hệ thống trích xuất.
Hình 32: Giao diện trang tài liệu tham khảo (sinh viên)



### 4.3.8. Giao diện hỏi đáp AI
Giao diện hỏi đáp AI cho phép người dùng đặt câu hỏi liên quan đến nội dung tài liệu.
Khi người dùng gửi câu hỏi, frontend chuyển request đến backend, backend gọi LLM
Service để tìm kiếm các phần nội dung liên quan và sinh câu trả lời dựa trên ngữ cảnh
tài liệu. Giao diện hiển thị câu hỏi, câu trả lời và có thể mở rộng để hiển thị nguồn tham
chiếu tương ứng trong báo cáo.
Hình 33: Giao diện trang chatbot AI


### 4.3.9. Giao diện quản lý người dùng
Giao diện quản lý người dùng dành cho quản lý và quản trị viên. Chức năng này cho
phép xem danh sách tài khoản, lọc theo vai trò, tìm kiếm theo tên hoặc email, tạo tài
khoản mới, cập nhật trạng thái tài khoản và import danh sách sinh viên/giảng viên từ
file CSV. Đây là giao diện quan trọng trong quá trình vận hành hệ thống ở môi trường
trường học.

Hình 34: Giao diện trang quản lý người dùng


## 4.4 Sơ đồ triển khai hệ thống
Hình 35: Sơ đồ triển khai



# KẾT LUẬN


## 1. Kết quả đạt được
Trong quá trình thực hiện đề tài, hệ thống DUTSTUDY đã được xây dựng với mục tiêu
hỗ trợ quản lý học phần, quản lý báo cáo học thuật và tích hợp chức năng hỏi đáp tài
liệu dựa trên kỹ thuật Retrieval-Augmented Generation. Hệ thống không chỉ cung cấp
các chức năng quản lý học tập cơ bản mà còn bổ sung quy trình xử lý tài liệu tự động,
giúp người dùng khai thác nội dung báo cáo một cách hiệu quả hơn.
Trước hết, đề tài đã xây dựng được hệ thống web gồm frontend, backend, cơ sở dữ liệu,
dịch vụ lưu trữ file, hàng đợi xử lý, worker xử lý tài liệu và dịch vụ AI. Frontend được
phát triển bằng React[1], TypeScript và TailwindCSS[5], cung cấp giao diện cho nhiều
nhóm người dùng như sinh viên, giảng viên, quản lý và quản trị viên. Backend được
xây dựng bằng Node.js[3], ExpressJS[4] và TypeScript[2], đảm nhiệm việc xác thực,
phân quyền và xử lý các nghiệp vụ chính của hệ thống.
Hệ thống đã triển khai được cơ chế xác thực người dùng bằng JWT và refresh token.
Người dùng sau khi đăng nhập được phân quyền theo vai trò, bao gồm student, lecturer,
manager và admin. Mỗi vai trò có các chức năng riêng phù hợp với quy trình sử dụng
thực tế. Sinh viên có thể tham gia học phần, xem bài tập, nộp báo cáo và sử dụng chức
năng hỏi đáp AI. Giảng viên có thể quản lý lớp học, tạo bài tập, xem bài nộp, nhận xét
và chấm điểm. Quản lý và quản trị viên có thể quản lý người dùng, học phần, báo cáo
và theo dõi thống kê hệ thống.
Về chức năng quản lý học phần, hệ thống đã hỗ trợ tạo học phần, quản lý danh sách
sinh viên tham gia, thêm giảng viên phụ trách, tạo tiêu chí đánh giá và theo dõi thông
tin lớp học. Sinh viên có thể tham gia lớp thông qua mã học phần hoặc được giảng
viên/quản lý thêm vào lớp. Đây là nền tảng để hệ thống tổ chức các hoạt động học tập
theo mô hình Project Based Learning.
Về chức năng bài tập và nộp báo cáo, hệ thống đã hỗ trợ giảng viên tạo bài tập, đính
kèm tài liệu, thiết lập hạn nộp và theo dõi bài nộp của sinh viên. Sinh viên có thể nộp
báo cáo kèm file PDF hoặc DOCX. Sau khi nộp, hệ thống lưu file vào MinIO, tạo bản
ghi báo cáo trong PostgreSQL[6] và đưa tài liệu vào hàng đợi xử lý. Giảng viên có thể
xem bài nộp, ghi nhận xét và cập nhật điểm cho sinh viên.
Một kết quả quan trọng của đề tài là xây dựng được quy trình xử lý tài liệu bất đồng bộ.
Backend sử dụng Redis[9] để đẩy job xử lý báo cáo vào hàng đợi. Python Worker lắng
nghe hàng đợi, tải file từ MinIO[10], trích xuất nội dung PDF, làm sạch văn bản, phát
hiện cấu trúc tài liệu, tạo cây nội dung, sinh tóm tắt và embedding. Cách thiết kế này

giúp các tác vụ nặng không làm chậm backend chính, đồng thời giúp hệ thống có thể
mở rộng worker trong tương lai.
Hệ thống cũng đã tích hợp LLM Service phục vụ các tác vụ AI như tóm tắt nội dung,
lựa chọn phần tài liệu liên quan và sinh câu trả lời theo ngữ cảnh. LLM Service được
xây dựng bằng FastAPI và sử dụng Ollama[13] với mô hình Qwen2.5[15]. Việc tách
riêng LLM Service giúp hệ thống dễ thay đổi mô hình, kiểm soát tài nguyên và mở rộng
các chức năng AI sau này.
Đề tài đã xây dựng được chức năng hỏi đáp tài liệu dựa trên RAG. Khi người dùng đặt
câu hỏi, hệ thống gửi request đến backend, backend gọi LLM Service để tìm nội dung
liên quan trong tài liệu đã xử lý và sinh câu trả lời. Chức năng này giúp người dùng tra
cứu nhanh nội dung báo cáo thay vì phải đọc thủ công toàn bộ tài liệu.
Ngoài ra, hệ thống đã xây dựng được các chức năng hỗ trợ như quản lý thư viện học
thuật, đánh dấu báo cáo yêu thích, trích xuất tài liệu tham khảo, thông báo trong hệ
thống, quản lý import người dùng từ CSV và thống kê tổng quan. Cơ sở dữ liệu được
thiết kế tương đối đầy đủ, bao gồm các bảng phục vụ người dùng, học phần, bài tập, bài
nộp, báo cáo, phiên bản báo cáo, chunk tài liệu, thông báo, đánh giá và lịch sử truy vấn
AI.
Nhìn chung, đề tài đã xây dựng được một hệ thống hoàn chỉnh ở mức demo và có khả
năng mở rộng, kết hợp giữa quản lý học tập, quản lý báo cáo học thuật và khai thác tài
liệu bằng AI. Hệ thống đáp ứng được các chức năng chính của một nền tảng hỗ trợ
Project Based Learning có tích hợp RAG.


## 2. Hạn chế
Mặc dù hệ thống đã hoàn thành nhiều chức năng quan trọng, đề tài vẫn còn tồn tại một
số hạn chế cần được cải thiện trong các phiên bản tiếp theo.
Thứ nhất, chức năng RAG vẫn còn phụ thuộc nhiều vào chất lượng trích xuất nội dung
từ tài liệu. Đối với các file PDF có định dạng phức tạp, nhiều bảng biểu, hình ảnh, công
thức hoặc bố cục nhiều cột, quá trình trích xuất văn bản có thể chưa đầy đủ hoặc sai thứ
tự. Điều này ảnh hưởng trực tiếp đến chất lượng tóm tắt, embedding và câu trả lời của
hệ thống.
Thứ hai, pipeline xử lý tài liệu hiện tại chủ yếu tập trung vào PDF và DOCX. Hệ thống
chưa hỗ trợ tốt các loại tài liệu phức tạp như file scan, tài liệu có OCR, hình ảnh chứa
chữ hoặc báo cáo có nhiều thành phần phi văn bản. Vì vậy, với các tài liệu không có
text layer, hệ thống có thể chưa trích xuất được nội dung chính xác.

Thứ ba, chất lượng trả lời của trợ lý AI còn phụ thuộc vào khả năng truy xuất đúng ngữ
cảnh và khả năng sinh phản hồi của mô hình ngôn ngữ. Trong một số trường hợp, hệ
thống có thể không tìm được node phù hợp hoặc trả lời chưa sát với nội dung tài liệu.
Điều này cho thấy cơ chế retrieval, reranking và kiểm soát nguồn trích dẫn vẫn cần được
cải thiện thêm.
Thứ tư, hệ thống hiện chưa hiển thị đầy đủ nguồn tham chiếu trong giao diện hỏi đáp
AI. Người dùng nhận được câu trả lời, nhưng chưa luôn thấy rõ câu trả lời được lấy từ
phần nào của báo cáo, trang nào hoặc đoạn nội dung nào. Điều này làm giảm khả năng
kiểm chứng thông tin, đặc biệt trong môi trường học thuật.
Thứ năm, cơ chế kiểm tra trùng lặp hoặc đạo văn hiện mới ở mức cơ bản. Hệ thống có
thể so sánh mức độ tương đồng từ vựng giữa các báo cáo trong cùng lớp, nhưng chưa
có một mô hình phát hiện đạo văn chuyên sâu, chưa hỗ trợ paraphrase detection và chưa
đánh giá được các trường hợp sao chép có chỉnh sửa câu chữ.
Thứ sáu, một số chức năng quản trị và phân quyền vẫn còn ở mức demo hoặc chưa đồng
bộ hoàn toàn với backend. Ví dụ, phần cấu hình quyền truy cập module trên frontend
vẫn có phần lưu cục bộ ở trình duyệt. Để triển khai thực tế, chức năng này cần được
đưa vào cơ sở dữ liệu và kiểm soát chặt ở backend.
Thứ bảy, hệ thống chưa có bộ test tự động đầy đủ cho frontend, backend và worker.
Việc thiếu unit test, integration test và end-to-end test có thể gây khó khăn khi mở rộng
hệ thống hoặc chỉnh sửa các chức năng quan trọng. Đặc biệt, các luồng như nộp báo
cáo, xử lý file, hỏi đáp AI và chấm điểm cần được kiểm thử kỹ hơn.
Thứ tám, hiệu năng xử lý tài liệu còn phụ thuộc vào tài nguyên máy chạy worker và
LLM Service. Với các báo cáo dài hoặc khi có nhiều tài liệu được nộp cùng lúc, thời
gian xử lý có thể tăng lên đáng kể. Hệ thống hiện đã sử dụng Redis[9] queue nhưng chưa
có cơ chế scale worker, giám sát job hoặc retry nâng cao.
Cuối cùng, tài liệu kỹ thuật và tài liệu hướng dẫn sử dụng vẫn cần được hoàn thiện. Một
số file hướng dẫn trong project chưa hoàn toàn đồng bộ với code hiện tại, ví dụ mô tả
LLM Service cũ chưa khớp với việc sử dụng FastAPI[12] và Ollama[13]. Điều này có
thể gây khó khăn cho người mới khi cài đặt và vận hành hệ thống.

Thứ tám, hệ thống cần bổ sung kiểm thử tự động. Backend nên có unit test và integration
test cho các API quan trọng. Frontend nên có test cho các luồng đăng nhập, xem lớp,
nộp báo cáo và hỏi đáp AI. Worker nên có test cho pipeline xử lý PDF, chunking và cập
nhật trạng thái báo cáo. Việc bổ sung test giúp hệ thống ổn định hơn khi mở rộng.
Thứ chín, cần bổ sung cơ chế giám sát và quản lý job xử lý tài liệu. Hệ thống có thể
thêm dashboard hiển thị số job đang chờ, đang xử lý, đã hoàn thành hoặc bị lỗi. Ngoài
ra, có thể bổ sung retry job, giới hạn thời gian xử lý, ghi log chi tiết và cảnh báo khi
worker gặp sự cố.
Thứ mười, hệ thống có thể được triển khai theo hướng production hoàn chỉnh hơn. Các
service có thể được đóng gói bằng Docker[11] Compose hoặc Kubernetes, bổ sung
reverse proxy, HTTPS, logging tập trung, backup database và phân tách môi trường
development, staging, production. Điều này giúp hệ thống sẵn sàng hơn cho triển khai
thực tế trong môi trường trường học.
Tóm lại, hướng phát triển chính của hệ thống là nâng cao chất lượng xử lý tài liệu, cải
thiện độ chính xác của RAG, hoàn thiện phân quyền và kiểm thử, đồng thời mở rộng
các chức năng hỗ trợ học thuật như đánh giá báo cáo, kiểm tra trùng lặp và hiển thị
nguồn tham chiếu. Khi các cải tiến này được thực hiện, DUTSTUDY có thể trở thành
một nền tảng hỗ trợ quản lý báo cáo và khai thác tri thức học thuật hiệu quả hơn trong
môi trường Project Based Learning.



# TÀI LIỆU THAM KHẢO
[1] React Team. React Documentation. React Official Documentation.
https://react.dev/reference/react (react.dev)
[2] TypeScript Team. TypeScript Documentation. Microsoft.
https://www.typescriptlang.org/docs/ (typescriptlang.org)
[3] Node.js Team. Node.js Documentation. OpenJS Foundation.
https://nodejs.org/docs/latest/api/
[4] Express.js. Express - Node.js Web Application Framework.
https://expressjs.com/ (expressjs.com)
[5] Tailwind Labs. Tailwind CSS Documentation.
https://tailwindcss.com/docs (tailwindcss.com)
[6] PostgreSQL Global Development Group. PostgreSQL Documentation.
https://www.postgresql.org/docs/ (postgresql.org)
[7] PostgreSQL Global Development Group. PostgreSQL Full Text Search.
https://www.postgresql.org/docs/current/datatype-textsearch.html (postgresql.org)
[8] pgvector. pgvector: Open-source Vector Similarity Search for PostgreSQL.
https://github.com/pgvector/pgvector
[9] Redis. Redis Documentation.
https://redis.io/docs/latest/ (redis.io)
[10] MinIO. MinIO Object Storage Documentation.
https://docs.min.io/ (min.io)
[11] Docker. Docker Compose Documentation.
https://docs.docker.com/compose/ (docs.docker.com)
[12] FastAPI. FastAPI Documentation.
https://fastapi.tiangolo.com/ (fastapi.tiangolo.com)
[13] Ollama. Ollama Documentation.
https://docs.ollama.com/ (docs.ollama.com)
[14] Ollama. Qwen2.5 Model Library.
https://ollama.com/library/qwen2.5 (ollama.com)
[15] Qwen Team. Qwen2.5 Technical Report. arXiv, 2024.
https://arxiv.org/abs/2412.15115 (arxiv.org)
[16] Supabase. AI & Vectors Documentation.
https://supabase.com/docs/guides/ai (supabase.com)
[17] Supabase. Vector Columns with pgvector.
https://supabase.com/docs/guides/ai/vector-columns (supabase.com)
[18] Pinecone. Pinecone Indexing Overview.
https://docs.pinecone.io/guides/index-data/indexing-overview (docs.pinecone.io)
[19] Pinecone. Pinecone API Reference.
https://docs.pinecone.io/docs/api-reference (docs.pinecone.io)
[20] Lewis, P., Perez, E., Piktus, A., et al. Retrieval-Augmented Generation for Knowledge-Intensive
NLP Tasks. NeurIPS, 2020.
https://papers.nips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-
Abstract.html (papers.nips.cc)