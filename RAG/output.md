TRƯỜNG ĐẠI HỌC BÁCH KHOA
KHOA CÔNG NGHỆ THÔNG TIN
BÁO CÁO
PBL4: DỰ ÁN HỆ THỐNG THÔNG MINH
HỆ THỐNG THEO DÕI ĐÁNH GIÁ SỨC KHỎE
THÔNG QUA NHỊP TIM
Giảng viên hướng dẫn: TS. Huỳnh Hữu Hưng
HỌ VÀ TÊN SINH VIÊN LỚP HỌC PHẦN ĐỒ ÁN
Trần Văn Huấn 23.99B
Phan Thanh Nhật 23.99B
Cao Minh Đức 23.99B
ĐÀ NẴNG, 11/2025

# TÓM TẮT ĐỒ ÁN
Trong những năm gần đây, các bệnh lý tim mạch đang trở thành một trong những nguyên
nhân hàng đầu gây tử vong trên toàn thế giới. Việc phát hiện sớm các dấu hiệu bất
thường của tim là vô cùng quan trọng nhằm kịp thời can thiệp và điều trị. Tuy nhiên,
hiện nay phần lớn người dân chỉ có thể kiểm tra sức khỏe tim mạch tại các cơ sở y tế
như bệnh viện hoặc phòng khám chuyên khoa. Điều này tuy đảm bảo tính chính xác
nhưng lại tốn nhiều thời gian, chi phí và gây khó khăn cho những người ở xa hoặc bận
rộn.
Trước thực trạng đó, cùng với sự phát triển mạnh mẽ của công nghệ và Internet, nhóm
chúng em đã thực hiện đề tài “Ứng dụng đánh giá sức khỏe thông qua tín hiệu điện tim”
với mục tiêu xây dựng một hệ thống có khả năng giám sát nhịp tim, phát hiện rối loạn
và cảnh báo sớm các dấu hiệu bất thường cho người dùng thông qua website.
Hệ thống được thiết kế bao gồm phần cứng thu nhận tín hiệu điện tim và phần mềm xử
lý, hiển thị dữ liệu trực quan trên giao diện web. Đến thời điểm hiện tại, nhóm đã hoàn
thiện việc lắp đặt thiết bị, xây dựng nền tảng web và thử nghiệm nhận dạng rối loạn nhịp
tim với độ chính xác tương đối tốt. Các chức năng chính của hệ thống đã hoạt động ổn
định và được kiểm tra trong môi trường thực tế.
Mặc dù kết quả bước đầu còn một số hạn chế, nhưng nhóm sẽ tiếp tục nghiên cứu, cải
tiến thuật toán và giao diện để nâng cao độ chính xác, tính ổn định và tiện ích của hệ
thống trong tương lai.

# BẢNG PHÂN CÔNG NHIỆM VỤ
Sinh viên thực Các nhiệm vụ Đánh giá
hiện
Trần Văn Huấn Phân công công việc, đảm bảo tiến độ Hoàn thành
thực hiện đồ án.
Tìm hiểu, thu thập dữ liệu, triển khai mô
hình học sâu .
Ghép nối và thử nghiệm sản phẩm.
Viết báo cáo, chuẩn bị nội dung thuyết
trình.
Phan Thanh Nhật Xây dựng cơ sở dữ liệu, thiết kế API xây Hoàn thành
dựng Back-End, giao diện và xây dựng
Frone-End.
Ghép nối và thử nghiệm sản phẩm.
Viết báo cáo, chuẩn bị nội dung thuyết
trình.
Cao Minh Đức Lắp đặt và lập trình thiết bị phần cứng. Hoàn thành
Ghép nối và thử nghiệm sản phẩm.
Viết báo cáo, chuẩn bị nội dung thuyết
trình.

# DANH MỤC HÌNH ẢNH
Hình 1: Sơ đồ tổng thể của hệ thống .................................................................................... 9
Hình 2: Cảm biến nhịp tim AD8232 .............................................................................. 10
Hình 3: Kit ESP8266 .................................................................................................... 11
Hình 4: Vị trí để dán miếng đệm cảm biến .................................................................... 12
Hình 5: Sơ đồ lắp đặt mạch ........................................................................................... 13
Hình 6: Sơ đồ usecase của trang web ............................................................................ 14
Hình 7: Sơ đồ quan hệ cơ sở dữ liệu ............................................................................. 15
Hình 8: QRS Complex trong tín hiệu điện tim ............................................................... 15
Hình 9: Ví dụ tín hiệu 1000 mẫu được cắt ra của các nhóm......................................... 17
Hình 10: Phân phối dữ liệu cho 3 tập dữ liệu.. ............................................................. 18
Hình 11: Sơ đồ mô hình báo cáo. .................................................................................. 19
Hình 12: Kết quả phần cứng sau khi lắp đặt. ................................................................ 21
Hình 13: Giao diện chức năng đăng nhập, đăng ký ........................................................... 22
Hình 14: Giao diện hướng dẫn cách thức thực hiện .......................................................... 22
Hình 15: Giao diện quản lý của admin .......................................................................... 23
Hình 16: Giao diện lịch sử đo ....................................................................................... 23
Hình 17: Giao diện hiện thị kết quả đo ......................................................................... 23
Hình 18: Kết quả huấn luyện model CNN ...................................................................... 24
Hình 19: Confusion Matrix của tập test ........................................................................ 24
Hình 20: Bảng kết quả kiểm thử mô hình. ...................................................................... 24

# DANH MỤC BẢNG
Bảng 1: Đề xuất giải pháp tổng quan .............................................................................. 2
Bảng 2. Các linh kiện được sử dụng. ............................................................................... 4
Bảng 3: Các thành phần huấn luyện được sử dụng. ....................................................... 15
Bảng 4: Bảng danh sách endpoint của API.. ................................................................. 17
Bảng 5: Bảng kết quả sử dụng thực tế. .......................................................................... 21

# Chương I: Giới thiệu tổng quan đề tài
## 1. Thực trạng
Theo báo cáo mới nhất của Tổ chức Y tế Thế giới (WHO) và Hiệp hội Tim mạch Hoa
Kỳ (AHA), bệnh tim mạch tiếp tục là nguyên nhân tử vong hàng đầu trên toàn cầu, cướp
đi sinh mạng của khoảng 19,41 triệu người mỗi năm tính đến năm 2025. Đáng lo ngại,
hơn 75% các ca tử vong này xảy ra tại các quốc gia có thu nhập thấp và trung bình, nơi
hệ thống y tế còn nhiều hạn chế trong việc phòng ngừa, chẩn đoán và điều trị bệnh.
Hiện nay, các công cụ chẩn đoán bệnh tim mạch thường phức tạp, yêu cầu thiết bị
chuyên dụng, dữ liệu sinh học chi tiết và chi phí cao, gây khó khăn cho người dân ở
những khu vực thiếu điều kiện tiếp cận y tế.
Nhằm khắc phục những rào cản này, nhóm chúng em đã phát triển một giải pháp chẩn
đoán bệnh tim mạch đơn giản, hiệu quả và tiết kiệm chi phí. Với giải pháp này, người
dùng chỉ cần truy cập trang web, điền một số thông tin cơ bản và nhận kết quả chẩn đoán
ngay lập tức, không cần thiết bị y tế phức tạp hay phải đến cơ sở khám chữa bệnh.
Chúng em kỳ vọng giải pháp này sẽ giúp người dùng:
- Tiết kiệm thời gian và chi phí khám bệnh ban đầu.
- Phát hiện sớm nguy cơ bệnh tim mạch.
- Nâng cao nhận thức và chủ động chăm sóc sức khỏe tim mạch.
- Góp phần cải thiện chất lượng chăm sóc sức khỏe cộng đồng, đặc biệt tại các vùng
khó tiếp cận dịch vụ y tế.
Với sự phát triển của công nghệ và dữ liệu y tế số, chúng em tin rằng việc đơn giản hóa
quy trình chẩn đoán sẽ mở ra cơ hội tiếp cận y tế công bằng hơn cho mọi người.
## 2. Các vấn đề cần giải quyết
Các vấn đề mà nhóm đặt ra để giải quyết trong dự án này bao gồm:
- Cần có thiết bị thu tín hiệu điện tâm đồ ECG và thiết bị gửi thông tin để xử lí.
- Cần có dữ liệu tín hiệu điện tâm đồ từ các cơ sở dữ liệu đảm bảo uy tín để có đánh
giá dự đoán chính xác.
- Xây dựng được mô hình, thuật toán nhận dạng được rối loạn nhịp tim.
- Cần có một trang web để có thể hiện thông tin đo và dự đoán, đồng thời có thể lưu
lại những lịch sử bệnh cho bệnh nhân dễ dàng theo dõi.

## 3. Đề xuất giải pháp tổng quan
Bảng 1: Đề xuất giải pháp tổng quan
Vấn đề Giải pháp đề xuất
Phần cứng Sử dụng cảm biến điện tim AD8232 để thu tín hiệu ECG.
Sử dụng wifi ES8266 để nhận dữ liệu ecg và truyền dữ liệu
sau khi đo.
Nhận dạng nhịp tim Thu thập và xử lý dữ liệu MIT-BIH từ PhysioNet.
Xây dựng và huấn luyện model nhận dạng rối loạn nhịp tim
với dựa trên mô hình CNN.
Xây dựng API để có thể dễ dàng sử dụng mô hình sau khi
đã được huấn luyện (sử dụng FlaskAPI).
Trang web Xây dựng giao diện trang web bằng ReactJS với các chức
năng nhận kết quả đo từ thiết bị và theo dõi kết quả.
Xây dựng server BackEnd bằng FastAPI, viết các API kết
nối, xử lí yêu cầu từ phía FrontEnd.
Database Sử dụng cơ sở dữ liệu NoSQL là Firebase để lưu thông tin
dữ liệu.

## 4. Giải pháp
Nguyên lý và sơ đồ hoạt động của hệ thống
Hình 1: Sơ đồ tổng thể của hệ thống
Nguyên lý hoạt động của hệ thống như sau:
- Người dùng sẽ truy cập trang website và tiến hành đo nhịp tim bằng thiết bị cảm
biến.
- Sau khi đo, dữ liệu từ cảm biến sẽ được gửi lên Firebase để lưu trữ.
- Server sẽ đọc dữ liệu từ Firebase, khi đủ dữ liệu sẽ tiến hành xử lý và đưa ra kết quả
dự đoán.
- Sau khi có kết quả, server sẽ tiến hành trả dữ liệu về trang web và lưu dữ liệu vào
Firestore. Dựa vào mỗi request của mobile app sẽ nhận được API tương ứng.
- Khi đã có kết quả trả về từ server, người dùng có thể vào ứng dụng để xem kết quả
ở màn hình.

# Chương II: Triển khai giải pháp
## 1. Giải pháp về phần cứng
### 1.1. Linh kiện sử dụng
Bảng 2. Các linh kiện được sử dụng.
Giá thành
Linh kiện Chức năng
(VNĐ)
Cảm biến điện tim Đo tín hiệu điện tim ECG từ người 138K
AD8232 dùng.
Màn hình LCD Hiển thị thông tin đến người dùng. 50K
Kit ESP8266 Đọc giá trị run từ Firebase sau đó 120k
nhận dữ liệu ecg từ Kit AD8232 và
truyền dữ liệu lên Firebase.
Button Cho phép cảm biến bắt đầu đo Free
Tổng cộng 308K
Hình 2: Cảm biến nhịp tim AD8232

Hình 3: Kit ESP8266
### 1.2. Thông số kỹ thuật và nguyên lý hoạt động
#### 1.2.1. Cảm biến điện tim AD8232: ECG Heart Rate Monitor
Thông số kỹ thuật:
- Model: ECG Heart Rate Monitor Kit AD8232.
- Điện áp hoạt động: 2.0V – 3.5V (ổn định nhất ở 3.3V).
- Tín hiệu đầu ra: Analog.
- Điện năng tiêu thụ thấp: 170 µA (ở điện áp 3V).
- Nguyên lý hoạt động: Cảm biến thông qua các miếng dán trên ngực người dùng sẽ
đo được sự thay đổi dòng điện của tim người. Dòng điện này có thể được vẽ thành
biểu đồ dưới dạng ECG.
- Vị trí các miếng dán:
+ Miếng dán 1 (RA – Right Arm): Đặt ở ngực phía trên bên phải, gần xương đòn
(clavicle), ngay bên dưới vai phải.
+ Miếng dán 2 (LA – Left Arm): Đặt ở ngực phía trên bên trái, gần xương đòn
(clavicle), ngay bên dưới vai trái.
+ Miếng dán 3 (RL/LL – Ground/Earth): Đặt ở phía dưới lồng ngực bên trái, gần
hông trái (khu vực xương sườn dưới hoặc phần mềm của bụng trái).
- Các lưu ý khi sử dụng:
+ Tín hiệu điện tâm đồ có thể khá nhiễu do hoạt động cơ bắp xung quanh.

+ Để cải thiện chất lượng tín hiệu cần giữ miếng đệm ở đúng vị trí, không di chuyển
quá nhiều trong khi đo, làm sạch khu vực dán cũng như sử dụng miếng đệm mới
cho mỗi lần đo.
Hình 4: Vị trí để dán miếng đệm cảm biến
#### 1.2.2. Kit ESP8266 (NodeMCU)
Thông số kỹ thuật:
- Vi điều khiển: ESP8266EX (Tích hợp Wi-Fi SoC).
- Kiến trúc: 32-bit RISC Xtensa LX106.
- Hệ điều hành: Tích hợp firmware NodeMCU (chạy bằng ngôn ngữ Lua) hoặc sử
dụng Arduino IDE.
- Tần số hoạt động CPU: 80 MHz (mặc định), có thể nâng lên 160 MHz.
- Wifi: 802.11 b/g/n (2.4 GHz).
- Giao thức bảo mật Wifi: WEP, WPA/WPA2.
- Tốc độ truyền tải dữ liệu: 2 Mbps (tối đa).
- Nguồn điện đầu vào: 5V qua cổng USB hoặc 7-12V qua chân VIN.
- Nguồn điện hoạt động: 3.3V.
- Chân GPIO: 11 chân GPIO (General Purpose Input/Output), hỗ trợ chức năng đa
dụng.
- Chân ADC: 1 kênh Analog (0-1V).
- Nhiệm vụ chính: Kit ESP8266 có nhiệm vụ nhận dữ liệu ecg từ Kit AD8232 và gửi
dữ liệu lên Firebase Realtime Database.

### 1.3. Sơ đồ mạch và lắp đặt
Các thiết bị phần cứng được kết nối với nhau theo sơ đồ sau.
Hình 5: Sơ đồ lắp đặt mạch
## 2. Gửi giữ liệu đo qua “Firebase Realtime Database”
Firebase Realtime Database là một dịch vụ cơ sở dữ liệu thời gian thực (realtime) của
Firebase, cung cấp cho người dùng một cơ sở dữ liệu NoSQL lưu trữ dữ liệu dưới dạng
JSON và cho phép truy cập và đồng bộ hóa dữ liệu giữa các ứng dụng di động, web và
các thiết bị khác nhau trong thời gian thực.
Nhóm chúng em sử dụng Firebase Realtime Database để điều khiển thiết bị phần cứng
thông qua ứng dụng di động cũng như để lưu trữ dữ liệu đo được từ cảm biến.
## 3. Giải pháp về phần mềm
### 3.1. Công nghệ sử dụng
- Công nghệ phát triển web: FastAPI và ReactJS.

### 3.2. Sơ đồ usecase hệ thống
Hình 6: Sơ đồ usecase của trang web
- Người dùng được hướng dẫn các bước cụ thể trước khi tiến hành đo nhịp tim.
- Chức năng xem lại lịch sử: Hiển thị ra lịch sử của các lần đo và các cảnh báo về bệnh
và sức khoẻ.
- Chức năng quản lý thông tin tài khoản:
+ Người dùng: quản lý và chỉnh sửa thông tin cá nhân của bản thân;
+ Admin: quản lý và chỉnh sửa thông tin cá nhân của bản thân, quản lý tất cả tài
khoản người dùng và cấp quyền cho tài khoản.
### 3.3. Sơ đồ quan hệ cơ sở dữ liệu
Hình 7: Sơ đồ quan hệ cơ sở dữ liệu

## 4. Phân tích xử lí dữ liệu trước khi huấn luyện
### 4.1. Thông tin về tín hiệu ECG
Điện tâm đồ (Electrocardiogram – ECG) là một phương pháp kiểm tra nhằm ghi lại hoạt
động điện sinh học của tim dưới dạng biểu đồ. Tim hoạt động nhờ các xung điện tự
nhiên giúp điều phối quá trình co bóp, đảm bảo máu được lưu thông đều khắp cơ thể.
ECG có khả năng ghi nhận những xung điện này, từ đó phản ánh tình trạng hoạt động
của tim.
Những biến đổi trong tín hiệu điện được ghi lại qua điện tâm đồ có thể là dấu hiệu cảnh
báo sớm các bệnh lý tim mạch như rối loạn nhịp tim, thiếu máu cơ tim hoặc phì đại cơ
tim.
Một thành phần đặc biệt quan trọng trong tín hiệu ECG là phức hợp QRS (QRS
Complex). Đây là đoạn tín hiệu biểu thị sự lan truyền điện thế trên bề mặt cơ thể, tương
ứng với quá trình khử cực của tâm thất – giai đoạn tim co bóp để đẩy máu đi.
Phức hợp QRS bao gồm ba sóng điện đặc trưng:
- Sóng Q: Là sóng đầu tiên có biên độ âm, xuất hiện trước sóng R.
- Sóng R: Là sóng có biên độ dương lớn nhất, thường là sóng nổi bật nhất trong QRS.
- Sóng S: Là sóng âm thứ hai, xuất hiện sau sóng R và có biên độ âm.
Việc phân tích hình dạng, độ rộng và biên độ của phức hợp QRS đóng vai trò quan trọng
trong việc chẩn đoán các rối loạn về dẫn truyền điện tim và các bệnh lý liên quan đến
chức năng tâm thất.
f
Hình 8: QRS Complex trong tín hiệu điện tim

### 4.2. Thu thập dữ liệu
- Nguồn dữ liệu tín hiệu ECG được lấy từ cơ sở dữ liệu MIT-BIH Arrhythmia
Database, được đo từ 45 bệnh nhân, bao gồm 19 nữ (23 - 89 tuổi) và 26 nam (32 -
89 tuổi) ở tần số 360Hz.
- Liên kết đến bộ dữ liệu: https://www.physionet.org/content/mitdb/1.0.0/
- Dữ liệu bao gồm 48 records, mỗi record dài khoảng 30 phút.
### 4.3. Tiền xử lý dữ liệu
Hình 9: Pipeline tiền xử lí dữ liệu ECG
Dataset có tổng cộng 18 lớp. Nhóm tiến hành xử lí và chia ra 5 nhóm để sử dụng, cụ thể
như sau:
Nhóm 1:
Nhóm 2:
Nhóm 3:
Nhóm 4:
Nhóm 5:

Hình 9: Ví dụ tín hiệu 1000 mẫu được cắt ra của các nhóm.
- Nhóm 1_Normal (0): Gồm các nhịp bình thường và các biến thể nhẹ của nhịp bình
thường:
+ 'N': Nhịp bình thường.
+ 'L': Nhịp nhĩ bình thường (left bundle branch block beat).
+ 'R': Nhịp phải bình thường (right bundle branch block beat).
+ 'e' và 'j': Các nhịp ngoại tâm thu không điển hình nhưng vẫn nằm trong nhóm bình
thường.
- Nhóm 2_Supraventricular (1): Nhóm các nhịp nhanh ở trên tâm thất
(supraventricular), gồm:
+ 'A' và 'a': Nhịp nhanh trên thất.
+ 'J': Nhịp nối không điển hình (junctional escape).
+ 'S': Nhịp nhĩ nhanh (supraventricular premature or ectopic beat).
- Nhóm 3_Ventricular (2): Nhóm các nhịp đến từ vùng tâm thất, gồm:
+ 'V': Ngoại tâm thu thất (ventricular premature beat).
+ 'E': Ngoại tâm thu sớm từ vùng tâm thất.
+ 'F': Ngoại tâm thu thất nhanh (fusion of ventricular and normal beat).
- Nhóm 4_Paced (3): Nhóm các nhịp được điều chỉnh bằng máy tạo nhịp:
+ '/': Nhịp từ máy tạo nhịp (paced beat).
- Nhóm 5_Other (4): Nhóm các nhịp khác có thể ít gặp hoặc không thuộc các nhóm
trên:
+ 'f': Ngoại tâm thu nhanh (fusion of paced and normal beat).
+ 'Q': Nhịp ngoại tâm thu hiếm gặp.
Sau khi đã xử lí và phân loại được dữ liệu nhóm tiến hành chia các tập dữ liệu train,
validation, test để bắt đầu quá trình training (Train: 70%, Validation: 15%, Test: 15%).

Hình 10: Phân phối dữ liệu cho 3 tập dữ liệu
### 4.4. Xử lý dữ liệu thu được từ cảm biến:
- Sử dụng mức tần số 360Hz cho kết quả tốt nhất. Do đó nhóm sẽ sử dụng mức tần số
này trên cảm biến.
## 5. Huấn luyện mô hình
### 5.1. Giới thiệu về mô hình CNN
CNN Mạng nơ-ron tích chập (CNN) là một mô hình học sâu được thiết kế để xử lý dữ
liệu có cấu trúc không gian hoặc tuần tự, chẳng hạn như tín hiệu ECG. CNN hoạt động
dựa trên nguyên lý quét các “bộ lọc” (convolutional filters) qua dữ liệu để tự động trích
xuất các đặc trưng quan trọng mà không cần phải thủ công thiết kế.
Cấu trúc cơ bản của CNN thường bao gồm:
- Lớp Convolution: dùng các bộ lọc để phát hiện đặc trưng trong tín hiệu như biên, độ
dốc hoặc dạng sóng QRS của ECG.
- Lớp Pooling: giảm kích thước dữ liệu, giúp mô hình học được các đặc trưng tổng
quát hơn và giảm hiện tượng overfitting.
- Lớp Fully Connected: kết nối toàn bộ đặc trưng đã trích xuất để tạo ra đầu ra cuối
cùng.
- Lớp Output: đưa ra xác suất dự đoán tín hiệu thuộc loại nhịp tim nào.
### 5.2. Lý do lựa chọn mô hình CNN

Nhóm lựa chọn mô hình CNN cho bài toán phân loại tín hiệu điện tim bất thường vì
những ưu điểm nổi bật sau:
- CNN giúp trích xuất đặc trưng không gian từ tín hiệu điện tim, giảm nhiễu và nhận
diện chính xác các đặc trưng hình thái như sóng P, QRS, T. Điều này đặc biệt hữu
ích khi dữ liệu thu được từ các thiết bị giá rẻ, có độ nhiễu cao.
- CNN tận dụng cả hai hướng học đặc trưng – không gian và thời gian – tạo ra mô
hình mạnh mẽ, thích hợp cho bài toán phát hiện bất thường trong tín hiệu ECG.
### 5.3. Huấn luyện mô hình nhận diện tín hiệu ECG bất thường
Dựa trên việc tham khảo các công trình nghiên cứu gần đây, nhóm tiến hành phát triển mô hình
CNN nhằm phân loại các loại tín hiệu ECG từ cơ sở dữ liệu MIT-BIH.
Cụ thể, nhóm tham khảo bài báo “ High quality ECG dataset based on MIT-BIH recordings for
improved heartbeats classification ” trong đó việc tiền xử lý dữ liệu được cải thiện bằng cách
loại bỏ nhiễu, cân bằng các nhóm nhịp tim và chuẩn hóa tín hiệu.
Hình 11: Sơ đồ mô hình báo cáo.
Sau quá trình thử nghiệm, nhóm áp dụng mô hình CNN, trong đó đầu ra của CNN được
đưa trực tiếp vào để trích xuất đặc trưng thời gian. Mô hình được huấn luyện trên tập dữ
liệu gồm năm loại nhịp tim chính (Normal, Q, V, S, F) với độ chính xác cao, cho phép
phát hiện sớm các dạng rối loạn như rung nhĩ (Atrial Fibrillation).
Theo báo cáo thì CNN có đạt hiệu suất tốt nhất với F1 Score là 0.85 . Một hiệu suất tốt
để phát hiện tín hiệu rung nhĩ aFib, từ đó nhóm áp dụng sơ đồ mô hình CNN để phân
loại các tín hiệu nhịp tim từ 5 nhóm tín hiệu mà đã được chia ra từ bước thu thập và tiền
xử lí dữ liệu.

Bảng 3: Các thành phần huấn luyện được sử dụng.
Tên API Công thức Mục đích
Batch Normalization Chuẩn hóa các giá trị đầu vào
về trung bình bằng 0 và độ
lệnh chuẩn bằng 1, giúp ổn
định quá trình huấn luyện.
Activation Function: ReLU(x) = max (0; x) ReLU giúp lọc các giá trị nhỏ
ReLU hơn 0 và giúp tốc độ tính toán
nhanh hơn, giảm thời gian
huấn luyện.
Loss Function Cross entropy Tính toán tổn thất chéo giữa
các nhãn thực tế và dự đoán.
Optimizer Function Adam Giúp cải thiện hiệu quả của
giải thuật gradient descent
bằng cách sử dụng các tỷ lệ
học thích hợp, giúp cho quá
trình tối ưu hội tụ nhanh hơn
và ổn định hơn.
### 5.4. Tinh chỉnh mô hình
Để đạt hiệu suất tối ưu và giảm hiện tượng overfitting, nhóm áp dụng các kỹ thuật tinh
chỉnh sau trong quá trình huấn luyện:
- Dropout: tạm thời vô hiệu hóa ngẫu nhiên một phần các nơ-ron trong quá trình huấn
luyện để tăng tính khái quát hóa của mô hình.
- Regularization: thêm hệ số phạt vào hàm mất mát nhằm giảm hiện tượng học thuộc
dữ liệu huấn luyện.
- Early Stopping: dừng huấn luyện khi sai số trên tập kiểm thử không còn giảm, giúp
mô hình đạt độ tổng quát cao hơn.
Các mô hình được huấn luyện với 50 epoch kết hợp kỹ thuật Early Stopping , batch
size = 128, sử dụng tập dữ liệu đã được chuẩn hóa và chia theo tỷ lệ 70% train – 15%
val – 15% test. Kết quả cho thấy mô hình đạt hiệu suất tốt, cân bằng giữa độ chính xác
và thời gian xử lý, phù hợp để triển khai trong ứng dụng giám sát sức khỏe điện tim qua
website.

# Chương III: Thử nghiệm và kết quả
## 1. Công cụ và framework sử dụng
- Công cụ lập trình: Arduino IDE, Visual studio code.
- Cơ sở dữ liệu: Firebase, MongoDB.
- Ngôn ngữ sử dụng: JavaScript, Python.
- Framework, thư viện sử dụng: FlaskAPI, ReactJS.
## 2. Kết quả lắp đặt phần cứng
Hình 12: Kết quả phần cứng sau khi lắp đặt.
## 3. Kết quả xây dựng phần mềm
### 3.1. Kết quả API cho dự đoán
- Xây dựng thành công API sử dụng FlaskAPI framework để sử dụng dự đoán từ
model.
Bảng 4: Bảng danh sách endpoint của API.
STT API Method Mô tả
1 /predict GET Lấy kết quả dự đoán từ mô hình

### 3.2. Kết quả xây dựng website
- Chức năng đăng nhập: Người dùng phải đăng nhập tài khoản để truy cập vào
trang web và thực hiện các chức năng dành cho người dùng .
Hình 13: Giao diện chức năng đăng nhập, đăng ký.
Hình 14 : Giao diện hướng dẫn cách thức thực hiện .

- Tài khoản admin có thể quản lý tất cả tài khoản người dùng.
Hình 15: Giao diện quản lý của admin.
- Lịch sử đo: Chứa danh sách các lần đo trước đó, hiển thị theo trình tự thời gian
cùng kết quả dự đoán và độ tin cậy.
Hình 16: Giao diện lịch sử đo.
- Chức năng đo và xem kết quả.
+ Người dùng ấn nút đo và lắp thiết bị đo theo hướng dẫn.
+ Sau khi đo xong, kết quả sẽ trả về trang chủ, người dùng có thể lưu kết quả lần đo
này, hệ thống sẽ chuyển dữ liệu về trang lịch sử đo.

Hình 17: Giao diện hiện thị kết quả đo.
### 3.3. Kết quả mô hình phát hiện bất thường trong trong nhịp tim
- Kết quả trên tập train và tập validation.
Hình 18: Kết quả huấn luyện model CNN
- Kết quả trên tập test.
Hình 19: Confusion Matrix của tập test.
### 3.4. Kết quả kiểm thử
- Tiến hành kiểm thử 3 mô hình trên với các bộ dữ liệu kiểm thử tương ứng. Trong đó,
các metrics Accuracy và f1-score được tính toán trên lớp Normal. Ta có bảng kết
quả như sau.
Hình 20: Bảng kết quả kiểm thử mô hình

### 3.5. Kết quả sử dụng thực tế
- Nhóm tiến hành sử dụng cả ba mô hình trên để sử dụng trong thực tế. Sau đây là
bảng kết quả tổng hợp khi đo đạc trên 4 người bình thường. Mỗi người được đo tổng
cộng 5 lần liên tiếp.
Bảng 5. Bảng kết quả sử dụng thực tế.
Người dùng Lần 1 Lần 2 Lần 3 Lần 4 Lần 5
Trần Văn Huấn Normal Normal Normal Normal Normal
Phan Thanh Nhật Normal Normal Normal Normal Normal
Cao Minh Đức Normal Normal Normal Normal Normal
### 3.6. Nhận xét và đánh giá
- Mô hình cho kết quả tốt với độ chính xác và các metrics khác như Accuracy , f1 trên
85%.
Mô hình nhóm triển khai đạt kết quả khá tốt nhưng khi đo trên dữ liệu người thực thì
kết quả khá thất thường lí do dữ liệu đo khi sử dụng cảm biến hay bị nhiễu.

# Chương IV: Kết luận
## 1. Đánh giá sản phẩm
- Sản phẩm phần cứng:
+ Cảm biến: hoạt động tương đối ổn định, tuy nhiên dễ bị ảnh hưởng bởi các yếu
tố ngoại cảnh dẫn đến kết quả dữ liệu đo được bị nhiễu khá nhiều.
+ Sản phẩm: sản phẩm đã được lắp đặt hoàn chỉnh, gọn gàng và tương đối dễ sử
dụng.
- Website:
+ Website xây dựng được hoạt động tốt và ổn định.
+ Tuy nhiên giao diện nhóm làm đơn giản chỉ để phục vụ cho lưu và hiện thị thông
tin cho người dùng.
- Mô hình phát hiện tín hiệu ECG bất thường:
+ Mô hình đưa ra dự đoán khá tốt về tín hiệu ECG bất thường của người dùng.
+ Tuy nhiên vẫn còn nhiều hạn chế về dữ liệu đo.
+ Chưa có dữ liệu y khoa phù hợp để kiểm thử chính xác nhất hiệu năng của mô
hình.
## 2. Hướng phát triển
- Phát triển thuật toán nhận dạng được nhiều lớp bệnh hơn và đưa ra kết quả chính xác
hơn. Phát triển thuật toán để tìm đỉnh của tín hiệu ECG chính xác hơn.
- Mở rộng các chức năng trên ứng dụng di động như các bài báo về sức khỏe, thông
báo cho người dùng,…
- Đưa ra thêm các đánh giá y tế chi tiết khi áp dụng hệ thống vào thực tế.
## 3. Danh mục tài liệu tham khảo
[1] “ High quality ECG dataset based on MIT-BIH recordings for improved heartbeats
classification ” . https://arxiv.org/pdf/2411.07252, truy cập ngày 15/11/2025
[2] Firebase Documentation, https://firebase.google.com/docs, truy cập ngày 15/11/2025
[3] Flutter documentation, https://docs.flutter.dev/, truy cập ngày 15/11/2025
[4] Tuan Nguyen, Bài 6: Convolutional neural network, https://nttuan8.com/bai-6-
convolutional-neural-network/, truy cập ngày 15/11/2025
[5] MIT-BIH Arrhythmia Database, George Moody, Roger Mark.
https://www.physionet.org/content/mitdb/1.0.0/, truy cập ngày 15/11/2025

[6] DFRobot, Product Wiki - DFRobot Heart Rate Monitor Sensor,
https://wiki.dfrobot.com/Heart_Rate_Monitor_Sensor_SKU SEN0213, truy cập
ngày 15/11/2025
[7] An Open-Source Feature Extraction Tool for the Analysis of Peripheral
Physiological Data, Mohsen Nabian, Yu Yi , Jolie Wormwood, Karen S Quigley, Lisa F
Barrett, Sarah Ostadabbas. https://pubmed.ncbi.nlm.nih.gov/30443441/, truy cập ngày
15/11/2025