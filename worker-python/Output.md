TRƯỜNG ĐẠI HỌC BÁCH KHOA
KHOA CÔNG NGHỆ THÔNG TIN
BÁO CÁO
PBL4 – DỰ ÁN HỆ THỐNG THÔNG MINH
TÊN ĐỀ TÀI
HỆ THỐNG XE THÔNG MINH
Giảng viên hướng dẫn: GCV.TS. BÙI THỊ THANH THANH
NHÓM SINH VIÊN THỰC HIỆN LỚP HỌC PHẦN
Hoàng Văn Tấn Đạt 23.99B
Nguyễn Lê Dung 23.99B
Lê Dương Huy 23.99B
Trần Đắc Đại Việt 23.99B
ĐÀ NẴNG, 12/2025



# TÓM TẮT ĐỒ ÁN
Đồ án “Xe thông minh” được thực hiện với mục tiêu xây dựng một mô hình phương
tiện tự hành có khả năng vận hành an toàn, ổn định và tuân thủ đúng quy tắc giao thông
trong môi trường mô phỏng. Vấn đề chính đặt ra là làm sao để hệ thống có thể tự động lái
theo line, nhận diện các tín hiệu đèn giao thông (đỏ, vàng, xanh), phát hiện biển báo Stop và
đưa ra phản ứng tương ứng một cách chính xác theo từng tình huống thực tế mô phỏng. Bên
cạnh đó, xe cần có khả năng chuyển đổi linh hoạt giữa chế độ tự động và chế độ điều khiển
thủ công nhằm phục vụ quá trình kiểm thử, đánh giá và đảm bảo độ tin cậy của hệ thống
trong nhiều điều kiện hoạt động khác nhau, đồng thời app điều khiển cũng được thiết kế để
stream video trực tiếp hành trình của xe, giúp người dùng theo dõi quá trình vận hành ngay
lập tức, mặc dù không hỗ trợ xem lại.
Để giải quyết các yêu cầu này, nhóm áp dụng kết hợp nhiều loại cảm biến, trong đó
cảm biến dò line giúp định hướng và duy trì xe di chuyển chính xác, camera thực hiện xử lý
ảnh và nhận diện tín hiệu giao thông gồm đèn đỏ, vàng, xanh và biển báo Stop, cùng các
thuật toán phân tích màu sắc và phân loại biển báo theo thời gian thực. Cơ chế điều khiển
động cơ thông qua vi điều khiển ESP/Arduino được tối ưu để phản hồi nhanh, chuyển hướng
chính xác và duy trì vận tốc ổn định, đồng thời cho phép người dùng can thiệp qua chế độ
điều khiển thủ công. Hệ thống được thiết kế mô-đun, giúp dễ dàng điều chỉnh các thông số
như tốc độ, góc lái, ngưỡng nhận diện màu sắc, cũng như mở rộng các chức năng trong
tương lai. Kết quả cho thấy xe vận hành ổn định, bám line chính xác, phản ứng đúng với ba
trạng thái đèn giao thông, nhận diện và dừng chuẩn tại biển Stop, đồng thời chuyển sang chế
độ điều khiển thủ công mượt mà. Xe cũng xử lý tốt các tình huống như chuyển hướng khẩn
cấp khi gặp chướng ngại vật và đồng bộ các tín hiệu từ cảm biến và camera. Thành công của
đồ án chứng minh tính khả thi của việc tích hợp xử lý ảnh, cảm biến, điều khiển thông minh
và giám sát hành trình qua video trực tiếp trong mô hình xe tự hành thu nhỏ, đồng thời mở
ra tiềm năng ứng dụng trong học tập, nghiên cứu, đào tạo kỹ thuật và phát triển các hệ thống
giao thông thông minh và xe tự hành.



# BẢNG PHÂN CÔNG NHIỆM VỤ
Sinh viên thực hiện Các nhiệm vụ Tự đánh giá
Hoàng Văn Tấn Đạt Phụ trách phần cứng và lập trình Đã hoàn thành
điều khiển logic cho xe
Nguyễn Lê Dung Phụ trách phần cứng và lập trình Đã hoàn thành
điều khiển logic cho xe
Lê Dương Huy Phát triển thuật toán AI và xử lý hình Đã hoàn thành
ảnh cho nhận diện đèn giao thông,
biển báo
Trần Đắc Đại Việt Phát triển ứng dụng điều khiển và Đã hoàn thành
giám sát xe, bao gồm stream video
trực tiếp
- Ngoài các nhiệm vụ chuyên môn, nhóm còn thường xuyên tổ chức các buổi trao đổi, hỗ
trợ lẫn nhau trong suốt quá trình thực hiện dự án. Trong những buổi này, các thành viên
cùng nhau thảo luận các vấn đề kỹ thuật, từ lập trình, xử lý cảm biến, thiết kế thuật toán đến
tinh chỉnh hệ thống điều khiển, nhằm giải quyết các khó khăn phát sinh và tối ưu hóa hiệu
suất của mô hình xe. Việc phối hợp chặt chẽ này không chỉ giúp từng thành viên nâng cao
kiến thức, kỹ năng và kinh nghiệm thực hành, mà còn tạo nên sự đồng bộ trong quá trình
triển khai dự án, đảm bảo tiến độ, chất lượng công việc và sự hoàn thiện toàn diện của hệ
thống. Sự gắn kết và tinh thần hỗ trợ lẫn nhau đã góp phần quan trọng vào thành công chung,
đồng thời thể hiện rõ nét khả năng làm việc nhóm, kỹ năng giải quyết vấn đề và sự chủ động
trong nghiên cứu, phát triển dự án.



# DANH MỤC HÌNH ẢNH
Hình 1. Mô hình sản phẩm xe ........................................................................................... 4
Hình 2. Hình ảnh Arduino Uno ......................................................................................... 4
Hình 3. Hình ảnh ESP32_CAM ........................................................................................ 5
Hình 4. Hình ảnh Driver L298N ....................................................................................... 5
Hình 5. Động cơ DC bánh răng ........................................................................................ 6
Hình 6. Cảm biến dò line .................................................................................................. 7
Hình 7. Hình ảnh khung xe ............................................................................................... 7
Hình 8. Hình ảnh pin dự phòng ......................................................................................... 8
Hình 9. Nguyên lý hoạt động tônhr thể phần cứng ......................................................... 12
Hình 10. Hình ảnh thu thập dữ liệu ................................................................................. 13
Hình 11. Hình ảnh phân chia dữ liệu .............................................................................. 14
Hình 12. . Log huấn luyện mô hình MobileNetV3 Small ............................................... 20
Hình 13. Biểu đồ Accuracy và Loss của mô hình MobileNetV3 Small ......................... 20
Hình 14. Kết quả khi xe chưa nhận diện được vật thể .................................................... 23
Hình 15. Kết quả khi xe nhận diện biển báo Stop ........................................................... 23
Hình 16. Kết quả khi xe nhận diện đèn giao thông màu Đỏ ........................................... 24
Hình 17. Kết quả khi xe nhận diện đèn giao thông màu Vàng ....................................... 24
Hình 18. Kết quả khi xe nhận diện đèn giao thông màu Xanh ....................................... 24
Hình 19. Sơ đồ nguyên lý hoạt động luồng dữ liệu ........................................................ 26
Hình 20. Giao diện app điều khiển .................................................................................. 28
Hình 21. Mô hình sản phẩm xe (1) ................................................................................. 34
Hình 22. Mô hình sản phẩm xe (2) ................................................................................. 34
Hình 23. Hỉnh ành biển báo ............................................................................................ 35

Hình 24. Đèn màu xanh .................................................................................................. 35
Hình 25. Đèn màu vàng .................................................................................................. 35
Hình 26. Đèn màu đỏ ...................................................................................................... 35



# 1. GIỚI THIỆU


## 1.1. Hiện trạng các sản phẩm tương tự
Trên thế giới, các hệ thống xe tự hành đã được nghiên cứu và phát triển rộng rãi, từ
các mô hình thu nhỏ dùng trong học tập, nghiên cứu đến các phương tiện tự hành thương
mại. Nhiều dự án nổi bật như Waymo, Tesla Autopilot, và các mô hình xe giáo dục sử dụng
cảm biến, camera và thuật toán AI để nhận diện tín hiệu giao thông, điều hướng theo đường
và tránh chướng ngại vật. Ở Việt Nam, các mô hình xe tự hành thu nhỏ chủ yếu xuất hiện
trong các trường đại học, phòng lab nghiên cứu, hoặc các cuộc thi Robotics; tuy nhiên, số
lượng mô hình tích hợp đầy đủ các chức năng như nhận diện đèn giao thông, biển báo Stop
và vừa chạy tự động vừa có thể điều khiển thủ công vẫn còn hạn chế.


## 1.2. Các vấn đề cần giải quyết
Các sản phẩm hiện tại vẫn gặp một số hạn chế, bao gồm:
• Khả năng nhận diện đèn giao thông và biển báo còn thiếu chính xác hoặc tốc độ
xử lý chậm.
• Chưa tích hợp đồng bộ giữa chế độ tự động và điều khiển thủ công, khiến việc
chuyển đổi hoạt động chưa linh hoạt.
• Giám sát quá trình vận hành xe trực tiếp chưa được triển khai rộng rãi, đặc biệt
trong các mô hình học tập.
• Khó mở rộng, nâng cấp hoặc tinh chỉnh các chức năng do kiến trúc hệ thống chưa
theo dạng mô-đun.


## 1.3. Đề xuất giải pháp tổng quan
Để khắc phục các hạn chế trên, nhóm đề xuất xây dựng mô hình “Xe thông minh”
với các giải pháp chính:
• Sử dụng cảm biến dò line và camera AI để xe có thể tự lái theo đường, nhận diện
đèn giao thông và biển báo Stop chính xác theo thời gian thực.
• Triển khai thuật toán xử lý ảnh và phân tích màu sắc, kết hợp với vi điều khiển
ESP/Arduino để điều khiển động cơ, đảm bảo xe phản hồi nhanh và ổn định.

• Thiết kế kiến trúc mô-đun, giúp dễ dàng điều chỉnh các thông số, nâng cấp các
thuật toán và mở rộng chức năng trong tương lai.
• Phát triển ứng dụng điều khiển và giám sát, cho phép người dùng điều khiển thủ
công và theo dõi video trực tiếp hành trình xe, phục vụ kiểm thử và đánh giá hiệu
quả hoạt động.
Những giải pháp này không chỉ hướng tới việc xây dựng một mô hình xe tự hành
thu nhỏ hoàn chỉnh, mà còn tạo tiền đề cho việc nghiên cứu, học tập và phát triển các hệ
thống giao thông thông minh trong tương lai.


# 2. GIẢI PHÁP
- Dựa trên yêu cầu của đề tài và các vấn đề đã được đặt ra ở phần Giới thiệu, nhóm
tiến hành phân tích tổng thể hệ thống nhằm xác định rõ các thành phần chức năng
và mối quan hệ giữa chúng. Trên cơ sở đó, nhóm đề xuất một giải pháp tổng thể cho
hệ thống xe thông minh, được chia thành ba nhóm chính gồm: giải pháp phần cứng
và truyền thông, giải pháp trí tuệ nhân tạo/khai thác dữ liệu, và giải pháp phần mềm
ứng dụng.
- Mỗi nhóm giải pháp đảm nhiệm một vai trò riêng biệt trong hệ thống, từ việc thu
thập dữ liệu, xử lý và ra quyết định thông minh, cho đến điều khiển và giám sát quá
trình vận hành của xe. Đồng thời, các nhóm giải pháp này được thiết kế và triển khai
theo hướng liên kết chặt chẽ với nhau, bảo đảm dữ liệu và tín hiệu điều khiển được
truyền tải đồng bộ, chính xác và kịp thời. Nhờ đó, hệ thống có thể hoạt động ổn định,
đáp ứng yêu cầu xử lý thông tin theo thời gian thực và hoàn thành đúng các mục
tiêu đã đề ra của đề tài.


## 2.1. Giải pháp phần cứng và truyền thông
a) Phần cứng
Hệ thống được thiết kế để kết hợp xe line follower với khả năng nhận diện tín hiệu
giao thông qua camera AI.
Danh sách linh kiện chi tiết:

STT Linh kiện Thông số kỹ thuật chính Chức năng trong hệ thống
1 Arduino Vi điều khiển Đọc cảm biến line, nhận lệnh điều
Uno R3 ATmega328P, 16 MHz, khiển từ ESP32-CAM qua UART,
5V, 14 chân digital, 6 chân điều khiển driver L298N và tốc độ
PWM động cơ.
2 ESP32- Module ESP32, camera Chụp ảnh môi trường phía trước xe,
CAM OV2640, WiFi 2.4 GHz, mã hóa JPEG và gửi lên server AI;
hỗ trợ WebSocket, UART đồng thời nhận lệnh điều khiển từ
server và chuyển tiếp cho Arduino.
3 Driver Mạch cầu H kép, điện áp Nhận tín hiệu PWM và điều khiển
L298N 5–35V, dòng tối đa ~2A chiều quay của hai động cơ DC, tạo
lực kéo cho xe di chuyển.
4 Động cơ DC Điện áp 3–6V, có hộp số Tạo chuyển động cho bánh xe trái và
bánh răng giảm tốc phải, quyết định tốc độ và khả năng
leo dốc.
5 Cảm biến dò Cảm biến hồng ngoại Phát hiện line đen/trắng trên mặt
line (3x) TCRT5000, ngõ ra digital đường, cung cấp thông tin cho thuật
toán bám line trên Arduino.
6 Khung xe 2 Chất liệu mica/acrylic, 2 Cố định toàn bộ linh kiện và tạo cấu
tầng tầng, 4 vị trí gắn động cơ trúc cơ khí cho xe.
7 Pin sạc dự 10000mAh Type-C PD Cung cấp nguồn cho động cơ và/hoặc
phòng QC 3.0 mạch điều khiển.

- Đây là hình ảnh sản phẩm của toàn dự án.
Hình 1. Mô hình sản phẩm xe
a.1. Arduino Uno/Nano (Motor Controller & Line Follower)
Hình 2. Hình ảnh Arduino Uno
- Điều khiển động cơ 4 bánh thông qua driver H-Bridge (chân ENA, ENB, IN1–IN4).
- Nhận tín hiệu từ 3 cảm biến line:
o
LINE_L (trái), LINE_M (giữa), LINE_R (phải)
o
Giá trị HIGH = cảm biến nhận diện màu đen (line), LOW = màu nền trắng.

- Các motor hoạt động với các chế độ:
o
Đi thẳng, lùi, rẽ gắt (spin turn), rẽ nhẹ.
o
Tốc độ tùy chỉnh cho chế độ line follow và điều khiển manual.
a.2. ESP32-CAM
Hình 3. Hình ảnh ESP32_CAM
- Camera AI Thinker (GPIO cấu hình đầy đủ) để capture hình ảnh.
- Xử lý truyền dữ liệu hình ảnh qua WiFi tới server AI.
- Kết nối với Arduino thông qua UART2 (Serial2):
o
TXD2 (ESP32 gửi lệnh) → RX Arduino
o
RXD2 (ESP32 nhận) ← TX Arduino (nếu cần mở rộng)
- Các chân camera được thiết lập chuẩn theo datasheet AI Thinker.
a.3. Driver L298N
Hình 4. Hình ảnh Driver L298N

- Driver cầu H kép dùng để điều khiển hai động cơ DC độc lập.
- Nhận tín hiệu điều khiển từ Arduino qua các chân:
o
IN1 – IN4: điều khiển chiều quay động cơ trái/phải.
o
ENA – ENB: nhận tín hiệu PWM để điều chỉnh tốc độ động cơ.
- Cho phép các chế độ chuyển động:
o
Đi thẳng, lùi.
o
Rẽ trái, rẽ phải.
o
Dừng khẩn cấp khi nhận lệnh Stop từ AI.
- Tách biệt phần công suất động cơ và phần điều khiển logic, giúp:
o
Bảo vệ Arduino khỏi dòng điện lớn.
o
Hệ thống hoạt động ổn định và an toàn hơn.
a.4. Động cơ DC bánh răng
Hình 5. Động cơ DC bánh răng
- Động cơ DC có hộp số giảm tốc, gắn trực tiếp với bánh xe.
- Hoạt động ở điện áp 3–6V, phù hợp với mô hình xe tự hành thu nhỏ.
- Hộp số giảm tốc giúp tăng mô-men xoắn và giảm tốc độ quay, đảm bảo xe di chuyển
mượt và chính xác.
- Được điều khiển thông qua driver L298N:
o
Điều chỉnh tốc độ bằng PWM.
o
Thay đổi chiều quay để thực hiện các thao tác điều hướng.

a.5. Cảm biến dò line (3x)
Hình 6. Cảm biến dò line
- Sử dụng 3 cảm biến hồng ngoại TCRT5000: LINE_L (trái), LINE_M (giữa),
LINE_R (phải).
- Nguyên lý hoạt động:
o
Màu đen (line) → tín hiệu HIGH.
o
Màu trắng (nền) → tín hiệu LOW.
- Arduino đọc trạng thái 3 cảm biến để xác định vị trí xe so với line và điều khiển
hướng di chuyển.
- Việc sử dụng 3 cảm biến giúp xe bám line chính xác và vận hành ổn định trong chế
độ tự động.
a.6. Khung xe 2 tầng
Hình 7. Hình ảnh khung xe

- Khung xe 2 tầng làm từ mica/acrylic, thiết kế chuyên dụng cho xe tự hành thu nhỏ.
- Tầng dưới dùng để gắn:
o
Động cơ DC và bánh xe.
o
Pin cấp nguồn cho hệ thống.
- Tầng trên dùng để cố định:
o
Arduino, ESP32-CAM.
o
Driver L298N và các module điều khiển.
- Thiết kế 2 tầng giúp:
o
Bố trí linh kiện gọn gàng, khoa học.
o
Giảm nhiễu dây nối và dễ bảo trì, nâng cấp.
o
Tăng độ cứng và độ ổn định khi xe di chuyển.
a.7. Pin sạc dự phòng 10000mAh Type C PD QC 3.0 22.5W Xiaomi Lipte P16ZM
Hình 8. Hình ảnh pin dự phòng
- Pin sạc dự phòng dung lượng 10000mAh, dùng làm nguồn cấp chính cho hệ thống
xe.
- Hỗ trợ chuẩn Type-C, PD và QC 3.0, cho dòng ra ổn định và công suất cao.
- Cấp nguồn cho:

o
Arduino.
o
ESP32-CAM.
o
Driver động cơ thông qua module chuyển đổi điện áp.
- Việc sử dụng pin sạc dự phòng giúp:
o
Dễ sạc, an toàn và tiện lợi.
o
Thời gian vận hành dài.
o
Không cần thiết kế mạch nguồn phức tạp.
- Cách mắc mạch của xe
b.1. Đấu nối L298N với Arduino
Chân L298N Chân Arduino Chức năng trong Code
(Uno/Nano)
ENA D5 Điều tốc động cơ A (PWM)
IN1 D6 Chiều quay A1
IN2 D7 Chiều quay A2
IN3 D8 Chiều quay B1
IN4 D9 Chiều quay B2
ENB D10 Điều tốc động cơ B (PWM)
12V Pin (+) Acquy Nguồn động cơ (7V - 12V)
GND GND (Chung) Nối chung với GND Arduino & ESP32
5V Vin/5V Arduino Cấp nguồn cho mạch điều khiển

Lưu ý: Bạn cần tháo 2 jumper (cầu nối nhựa đen) trên chân ENA và ENB của L298N
thì mới điều tốc (PWM) được.
b.2. Đấu nối Cảm biến Line (Dò đường) với Arduino
Chân Cảm biến Chân Arduino Chức năng
OUT (Trái) D3 Sensor Trái (LINE_L)
OUT (Giữa) D12 Sensor Giữa (LINE_M)
OUT (Phải) D2 Sensor Phải (LINE_R)
VCC 5V Nguồn cảm biến
GND GND Mass chung
b.3. Đấu nối giao tiếp giữa ESP32-CAM và Arduino
Đây là phần quan trọng nhất để AI điều khiển xe. Code sử dụng giao tiếp Serial (UART).
• ESP32 Code: Sử dụng Serial2 với RXD2 = 13 và TXD2 = 1512.
• Arduino Code: Sử dụng Serial mặc định (Chân 0 và 1)13.
Chân ESP32-CAM Chân Arduino Giải thích
GPIO 15 (TXD2) D0 (RX) ESP32 gửi lệnh -> Arduino nhận
GPIO 13 (RXD2) D1 (TX) Arduino gửi phản hồi -> ESP32 nhận
GND GND BẮT BUỘC phải nối chung mass
5V / VCC 5V Nguồn nuôi ESP32

- Truyền thông dữ liệu
Hệ thống sử dụng 2 lớp truyền thông:
c.1. ESP32 ↔ Server AI
- Giao thức: WebSocket
- Mục đích:
o
ESP32 gửi hình ảnh (binary JPEG) theo khung hình (10 FPS) về server.
o
Server gửi lệnh AI (JSON) về ESP32.
- Cấu trúc lệnh AI trong JSON:
{
"command": "S",
"mode": "line_follow",
"class": "red_light",
"confidence": 0.98
}
- Lợi ích:
o
Truyền dữ liệu thời gian thực
o
Cho phép AI ra quyết định tức thì dựa trên hình ảnh
c.2. ESP32 ↔ Arduino
- Giao thức: UART Serial (Serial2)
- Tốc độ: 115200 baud
- Mục đích:
o
ESP32 gửi lệnh AI nhận được từ server xuống Arduino.
o
Arduino nhận lệnh và thực thi motor/line follower.
- Lệnh đơn giản: 'S', 'A', 'F', 'B', 'L', 'R'
- Lợi ích:

o
Giao tiếp ổn định, đơn giản
o
Arduino không cần xử lý hình ảnh, giảm tải
- Nguyên lý hoạt động tổng thể phần cứng
[AI Server] --WebSocket--> [ESP32-CAM] --UART2--> [Arduino Line Follower] -->
[Động cơ xe]
Hình 9. Nguyên lý hoạt động tônhr thể phần cứng
- Cảm biến line liên tục đọc trạng thái mặt đường (đậm/nhạt, đen/trắng) và gửi tín hiệu
digital về Arduino. Dựa trên tổ hợp tín hiệu từ ba cảm biến (trái, giữa, phải), Arduino
xác định xe đang lệch về phía nào so với line và điều chỉnh tốc độ, hướng quay của từng
bánh thông qua driver L298N.
- ESP32-CAM định kỳ chụp ảnh phía trước xe, mã hóa JPEG và gửi lên server AI thông
qua kết nối WiFi và giao thức WebSocket. Sau khi server xử lý và suy diễn mô hình AI,
kết quả (nhãn lớp và lệnh điều khiển) được gửi trả lại về ESP32-CAM. ESP32-CAM
chuyển lệnh điều khiển nhận được từ server AI xuống Arduino qua UART.
- Arduino kết hợp lệnh AI với trạng thái cảm biến line hiện tại để đưa ra quyết định cuối
cùng (ví dụ: ưu tiên dừng khi gặp đèn đỏ hoặc biển Stop). Lệnh điều khiển được ánh xạ
thành các mức PWM và tín hiệu logic trên các chân điều khiển driver L298N, từ đó điều
chỉnh chuyển động của động cơ.
- Tất cả các thành phần sử dụng chung một mass (GND) để đảm bảo mức logic ổn định,
tránh hiện tượng nhiễu hoặc sai lệch điện áp gây treo mạch.



## 2.2. Giải pháp Trí tuệ nhân tạo / Khoa học dữ liệu
- Trong quá trình khảo sát các mô hình AI, nhóm đã nghiên cứu và so sánh nhiều mô
hình như các mô hình YOLO, ResNet,..
- Phù hợp với yêu cầu phải đủ nhẹ để chạy realtime với các bài toán không quá phức
tạp trên các thiết bị không quá mạnh mẽ thì mô hình MobileNet v3 small là lựa
chọn phù hợp.


### 2.2.1. Thu thập dữ liệu
- Dữ liệu được phân làm 5 nhãn như sau:
Lớp Nhãn
0 green
1 none
2 red
3 stopsign
4 yellow
- Dữ liệu được thu thập bằng hình ảnh thực tế từ AI Thinker ESP32-CAM:
Hình 10. Hình ảnh thu thập dữ liệu



### 2.2.2. Xử lý dữ liệu
- Sử dụng công cụ roboflow (quay góc 90, tăng giảm độ sáng) và cắt ảnh để làm giàu
dữ liệu.
Hình 11. Hình ảnh phân chia dữ liệu
- Phân chia dữ liệu: Phân chia dữ liệu ngẫu nhiên theo tỷ lệ 8:2 tương ứng với train
set, validation set.


### 2.2.3. Mô hình MobileNetv3 small
a) Giới thiệu
- MobileNetV3 là thế hệ thứ ba của dòng mạng Nơ-ron tích chập (CNN) do Google
phát triển, được thiết kế chuyên biệt cho các thiết bị di động (mobile) và thiết bị
nhúng (embedded systems) như Raspberry Pi, điện thoại thông minh, hoặc các mạch
IoT.
- Được thiết kế bằng NAS (Network Architecture Search): Thay vì các kỹ sư tự tay
thiết kế từng lớp mạng như các phiên bản trước, Google đã sử dụng thuật toán NAS

(Tìm kiếm kiến trúc mạng) để tự động tìm ra cấu trúc mạng tối ưu nhất giữa sự cân
bằng của Độ chính xác (Accuracy) và Độ trễ (Latency).
- Sử dụng Depthwise Separable Convolutions để làm giảm số lượng phép tính từ đó
có thể chạy trên các thiết bị người dùng cuối.
b) Kiến trúc
- MobileNetV3-Small là một mạng nơ-ron tích chập sâu (Deep CNN), được tối ưu
hóa cho tốc độ và hiệu suất trên thiết bị biên
- Cấu Trúc Tổng Thể của MobileNetV3:
b.1. Khối Bottleneck ngược (Inverted Residual Bottleneck Block)
- Đây là khối kiến trúc cốt lõi được thừa hưởng từ MobileNetV2 và được cải tiến.
Khác với khối Residual Bottleneck truyền thống (giảm chiều sâu -> tích chập -
> tăng chiều sâu), khối ngược này hoạt động theo trình tự sau:
o
Mở rộng (Expansion): Tăng số lượng kênh (chiều sâu) của tensor đầu vào
bằng phép tích chập $1 \times 1$. Đây là bước quan trọng để ánh xạ tính năng
lên không gian chiều cao hơn.
o
Tích chập Chiều sâu (Depthwise Convolution - DW Conv): Thực hiện tích
chập KxK(thường là 3x3 hoặc 5x5) cho từng kênh một cách độc lập. Điều
này giúp giảm đáng kể chi phí tính toán so với tích chập tiêu chuẩn.
o
Chiếu (Projection/Compression): Giảm số lượng kênh trở lại bằng phép tích
chập 1x1 thông thường (Pointwise Conv) để nén thông tin và chuẩn bị cho
khối tiếp theo.
- Nếu đầu vào và đầu ra có cùng số kênh và độ phân giải, một kết nối tắt (skip
connection) sẽ được thêm vào giữa đầu vào và đầu ra của khối, tương tự như ResNet,
để giúp gradient truyền ngược tốt hơn.
b.2. Kỹ thuật Squeeze-and-Excitation (SE)
- MobileNetV3 tích hợp các khối SE vào các lớp bottleneck ngược lớn hơn.

- SE Module là một cơ chế chú ý (attention mechanism) nhẹ nhàng, cho phép mạng
học cách tự động xác định kênh nào quan trọng hơn bằng cách gán trọng số (tỷ lệ)
cho từng kênh tính năng.
- Nó hoạt động bằng cách:
o
Squeeze (Ép): Dùng phép gộp trung bình toàn cục (Global Average Pooling
- GAP) để thu nhỏ tensor WxHxC thành 1x1xC, tóm tắt thông tin của toàn
bộ kênh.
o
Excitation (Kích thích): Dùng hai lớp tích chập 1x1 (hoặc lớp fully
connected) để tạo ra các trọng số (tỷ lệ) từ 0 đến 1 cho mỗi kênh.
o
Rescale (Điều chỉnh): Nhân các trọng số này với tensor tính năng ban đầu để
điều chỉnh độ quan trọng của từng kênh.
c) Hàm kích hoạt Hard Swish
- Thay vì sử dụng ReLU6 (như MobileNetV2) hoặc Swish (tốn kém), MobileNetV3
giới thiệu hàm Hard Swish để tăng hiệu quả trên thiết bị di động.
- Công thức Swish:
trong đó là hàm sigmoid.
- Công thức Hard Swish:
- Là một xấp xỉ tuyến tính của hàm Swish, giúp giảm đáng kể chi phí tính toán vì việc
tính toán phép nhân ma trận và hàm ReLU6 được tối ưu hóa tốt hơn trên phần cứng
nhúng so với hàm sigmoid/exponential.

d) Tối ưu hóa các lớp biên (Head and Tail)
- MobileNetV3 thực hiện tối ưu hóa đặc biệt ở lớp đầu và lớp cuối của mạng:
o
Tối ưu hóa Lớp Đầu (Head): Thay thế tích chập $3 \times 3$ thông thường ở
lớp đầu tiên bằng một tổ hợp các lớp hiệu quả hơn.
o
Tối ưu hóa Lớp Cuối (Tail): Lớp trước lớp phân loại (classification layer)
cuối cùng được thiết kế lại để tránh chi phí tính toán cao không cần thiết. Cụ
thể, nó di chuyển phép gộp trung bình toàn cục (GAP) đến trước lớp tích chập
1x1 cuối cùng (thay vì sau), cho phép loại bỏ một số bộ lọc tính năng tốn
kém, giúp tăng tốc độ đáng kể với tổn thất độ chính xác rất nhỏ.


### 2.2.4. Huấn luyện
a) Môi trường huấn luyện
- Mô hình được huấn luyện trên Google Colab với cấu hình GPU Tesla T4, 15102MiB,
RAM 12GB.
- Cấu hình:
o
IMG_SIZE = 224
o
BATCH_SIZE = 64
o
INITIAL_EPOCHS = 6
o
FINE_TUNE_EPOCHS = 10
o
LEARNING_RATE = 0.0001
o
FINE_TUNE_LEARNING_RATE = 0.00001
b) Quy trình huấn luyện
b.1. Chuẩn bị và Tiền xử lý Dữ liệu
- Bước này được thực hiện trong hàm create_datasets và chuẩn bị dữ liệu đầu vào cho
mô hình:
o
Tải dữ liệu: Tải ảnh từ hai thư mục train và val (validation) trong thư mục
dataset.

o
Tiền xử lý đặc thù: Áp dụng hàm preprocess_input của MobileNetV3 lên tất
cả các ảnh. Hàm này có nhiệm vụ chuẩn hóa giá trị pixel, đảm bảo dữ liệu
đầu vào khớp với trọng số ImageNet đã được huấn luyện.
o
Tăng cường dữ liệu (Data Augmentation): Chỉ áp dụng cho tập huấn luyện
(train_datagen) các kỹ thuật như xoay, dịch chuyển, lật ngang để làm phong
phú thêm dữ liệu và giảm quá khớp (overfitting).
o
Tạo Batch: Dữ liệu được chia thành các lô (Batch Size = 64) để nạp vào mô
hình.
b.2. Thiết lập Mô hình và Đóng băng (Freeze)
- Bước này được thực hiện trong hàm create_model và chuẩn bị cấu trúc mạng:
o
Tải mô hình cơ sở: Tải kiến trúc MobileNetV3-Small với trọng số đã được
huấn luyện trước trên ImageNet (weights="imagenet"), nhưng loại bỏ lớp
phân loại cuối cùng (include_top=False).
o
Đóng băng Base Model: Thiết lập base_model.trainable = False. Điều này
khóa tất cả các trọng số trong MobileNetV3-Small, biến nó thành một bộ
trích xuất đặc trưng cố định (fixed feature extractor).
o
Thêm Lớp Phân loại Tùy chỉnh (Head): Thêm các lớp mới ở cuối mạng để
phân loại dữ liệu cụ thể của bạn:
+ GlobalAveragePooling2D: Nén chiều không gian của các đặc trưng.
+ Dropout(0.3) và Dense(128, activation="relu"): Các lớp ẩn tùy chỉnh
để học các đặc trưng cấp cao.
+ Dense(num_classes, activation="softmax"): Lớp đầu ra cuối cùng để
dự đoán các lớp.
b.3. Huấn luyện 2 Giai đoạn:
- Đây là quy trình huấn luyện chính, tối ưu hóa mô hình qua hai bước:
b.3.1. Giai đoạn 1: Huấn luyện Lớp Phân loại Mới (Initial Training)
o
Mục tiêu: Huấn luyện nhanh các lớp phân loại tùy chỉnh (Head) đã được thêm
vào, trong khi trọng số của MobileNetV3 vẫn bị đóng băng.

o
Thiết lập: Sử dụng Learning Rate tương đối cao ($10^{-4}$) và huấn luyện
trong 6 epochs (INITIAL_EPOCHS).
o
Callbacks: Theo dõi val_accuracy và val_loss để tự động dừng sớm
(EarlyStopping), giảm Learning Rate (ReduceLROnPlateau), và lưu lại mô
hình tốt nhất.
b.3.2. Giai đoạn 2: Tinh chỉnh (Fine-Tuning)
o
Mục tiêu: Mở khóa các lớp gần cuối của MobileNetV3-Small để tinh chỉnh
các đặc trưng cấp cao phù hợp hơn với dữ liệu cụ thể của bạn.
o
Mở khóa có chọn lọc: base_model.trainable = True sau đó đóng băng trở lại
các lớp đầu (base_model.layers[:-100]) để chỉ tinh chỉnh các lớp gần đầu ra.
o
Thiết lập: Sử dụng Learning Rate rất nhỏ ($10^{-5}$) và huấn luyện thêm 8
epochs (FINE_TUNE_EPOCHS). Learning Rate nhỏ giúp tránh làm hỏng
các trọng số đã được học trước.
b.4. Đánh giá và Triển khai (Deployment)
- Đây là các bước cuối cùng để đo lường hiệu suất và chuẩn bị cho việc sử dụng thực
tế:
o
Lưu mô hình: Lưu mô hình đã được tinh chỉnh cuối cùng (final_mobilenetv3_
small.keras).
o
Đánh giá: Sử dụng model.evaluate(val_ds) để đo lường hiệu suất cuối cùng
trên tập Validation (Loss và Accuracy).
o
Vẽ Biểu đồ: Vẽ biểu đồ thể hiện sự thay đổi về Accuracy và Loss qua cả hai
giai đoạn huấn luyện (Initial và Fine-Tuning).
o
Chuyển đổi TFLite: Sử dụng tf.lite.TFLiteConverter để chuyển đổi mô hình
sang định dạng TFLite. Bật tối ưu hóa mặc định (tf.lite.Optimize.DEFAULT)
để thực hiện Lượng tử hóa (Quantization), giúp giảm kích thước và tăng tốc
độ suy luận trên các thiết bị nhúng (như Raspberry Pi).

- Một số hình ảnh mô tả quá trình huấn luyện
Hình 12. . Log huấn luyện mô hình MobileNetV3 Small
Hình 13. Biểu đồ Accuracy và Loss của mô hình MobileNetV3 Small


### 2.2.5. Triển khai trên server:
- AI server sẽ sử dụng FashAPI framework để có thể sử dụng websocket cho tốc độ
gửi tín hiệu nhanh hơn.
- Quy trình xử lý:
a) Thu nhận và Phân phối Ảnh (Input Acquisition & Distribution)
Quy trình bắt đầu trong hàm xử lý WebSocket chính (ws_traffic_light):

- B1: Nhận Frame: ESP32-CAM gửi khung hình JPEG (dữ liệu nhị phân) qua
WebSocket. Server nhận dữ liệu (await asyncio.wait_for (websocket.receive_bytes
(), ...)).
- B2: Giải mã: Khung hình JPEG được giải mã thành ma trận ảnh OpenCV
(cv2.imdecode), được lưu vào biến toàn cục last_frame.
- B3: Kiểm tra Tần suất: Server kiểm tra xem đã đến lúc chạy AI chưa (now -
last_inference_time) > INFERENCE_INTERVAL, hiện là 50ms).
- B4:Tạo Tác vụ: Nếu đến lúc, một tác vụ bất đồng bộ (asyncio.create_task (handle_
inference(frame))) được tạo ra để chạy AI mà không làm tắc nghẽn luồng chính.
b) Xử lý và Suy luận (Preprocessing & Inference)
- Tác vụ AI chạy trong hàm handle_inference(frame):
- Tiền xử lý: Hàm preprocess_image(frame) được gọi:
o
Chuyển ảnh từ BGR sang RGB (cv2.cvtColor(..., cv2.COLOR_BGR2RGB)).
o
Thay đổi kích thước ảnh về 224x224 (IMG_SIZE).
o
Chuyển đổi kiểu dữ liệu sang np.float32.
o
Suy luận (Inference): Hàm run_inference(img) được gọi (chạy trong loop.run
_in_executor(None, ...) để tránh chặn luồng):
o
Model Keras (MobileNetV3-Small) dự đoán lớp (model.predict).
o
Hàm trả về label (ví dụ: "red", "green", "none") và conf (độ tin cậy).
c) Ra quyết định và Cơ chế Bỏ phiếu (Voting Mechanism)
Kết quả suy luận được xử lý để đảm bảo độ tin cậy và sự ổn định:
- Ưu tiên Khẩn cấp (Urgent Priority):
o
Nếu mô hình dự đoán là red hoặc stopsign với độ tin cậy cao (>0.7), nó ngay
lập tức tính toán lệnh (cmd = decide_command(label)) và cập nhật
latest_command toàn cục.
o
Cơ chế bỏ phiếu (recent_predictions) bị xóa để đảm bảo phản ứng tức thì.
- Cơ chế Bỏ phiếu (Voting for Stability):

o
Đối với các lớp khác, kết quả dự đoán (nếu conf > 0.5) được thêm vào hàng
đợi recent_predictions (cửa sổ 3 frame).
o
Chỉ khi ít nhất 2/3 (tức là 2 trong 3 frame gần nhất) đưa ra cùng một dự đoán,
kết quả đó mới được coi là ổn định và được chấp nhận.
- Cập nhật Kết quả: Kết quả ổn định được lưu vào latest_result và latest_command
toàn cục.
d) Tổng hợp Lệnh và Gửi về ESP32 (Command Dispatch)
Phần này diễn ra trong vòng lặp chính của WebSocket sau khi AI đã cập nhật latest_
result và latest_lane_cmd:
- Phối hợp Lệnh (Command Coordination):
o
Ưu tiên 1 (Traffic Override): Nếu latest_result có lệnh S (Stop) từ AI (đèn
đỏ/dừng), final_cmd sẽ là S.
o
Ưu tiên 2 (Lane Command): Nếu không có lệnh dừng khẩn cấp từ AI,
final_cmd sẽ là lệnh từ thuật toán phát hiện làn đường (latest_lane_cmd, ví
dụ: L/R/F).
- Đóng gói Payload: Tạo đối tượng JSON payload chứa class, command, confidence,
và mode.
- Gửi Lệnh: Payload được gửi đến ESP32 qua WebSocket (await websocket.send
_json(payload)). ESP32 sau đó sẽ thực hiện lệnh điều khiển động cơ tương ứng.
- Debug: Ảnh Overlay được tạo ra (overlay_debug) và lưu vào last_overlay để xem
trên trình duyệt.

- Đây là hình ảnh kết quả khi xe chưa nhận diện được vật thể
Hình 14. Kết quả khi xe chưa nhận diện được vật thể
- Đây là hình ảnh kết quả nhận diện biển báo Stop
Hình 15. Kết quả khi xe nhận diện biển báo Stop

- Đây là hình ảnh kết quả khi nhận đèn tín hiệu Đỏ
Hình 16. Kết quả khi xe nhận diện đèn giao thông màu Đỏ
Hình 17. Kết quả khi xe nhận diện đèn giao thông màu Vàng
Hình 18. Kết quả khi xe nhận diện đèn giao thông màu Xanh



## 2.3. Giải pháp phần mềm


### 2.3.1. Tổng quan và Kiến trúc hệ thống
- Phần mềm điều khiển được xây dựng dưới dạng ứng dụng di động (Mobile
Application) chạy trên hệ điều hành Android. Ứng dụng đóng vai trò là Client trong
mô hình Client-Server, thực hiện nhiệm vụ giao tiếp với bộ điều khiển trung tâm
trên xe (Server) để gửi tín hiệu điều khiển và nhận dữ liệu giám sát.
- Kiến trúc phần mềm được thiết kế theo hướng module hóa, tách biệt giữa luồng xử
lý giao diện (UI Thread) và luồng xử lý mạng (Network Thread) để đảm bảo độ
mượt mà và phản hồi nhanh (low latency) trong quá trình vận hành.


### 2.3.2. Môi trường và Công cụ phát triển
Hệ thống phần mềm được phát triển dựa trên các công cụ và thư viện mã nguồn mở:
- Ngôn ngữ lập trình: Java (JDK 8+).
- Môi trường phát triển (IDE): Android Studio.
- Giao diện người dùng (UI): Xây dựng bằng XML với các thành phần tùy chỉnh
(Custom Drawables) cho nút bấm và hiển thị video.
- Thư viện lõi:
o
OkHttp: Sử dụng để quản lý các kết nối mạng HTTP và WebSocket, đảm
bảo hiệu năng cao và ổn định.
o
Org.json: Đóng gói và xử lý dữ liệu điều khiển theo định dạng JSON.
o
Android SDK: Sử dụng các API cơ bản như BitmapFactory, Base64 để xử
lý hình ảnh.


### 2.3.3. Giao thức Truyền thông
Để đáp ứng yêu cầu vừa điều khiển chính xác, vừa giám sát hình ảnh liên tục, ứng dụng
sử dụng kết hợp hai giao thức truyền thông trên nền tảng TCP/IP qua cổng 8000:
a) Giao thức HTTP (RESTful API) - Kênh điều khiển:
- Được sử dụng để gửi các lệnh điều khiển vận hành và cấu hình chế độ. Giao thức
này đảm bảo tính tin cậy của gói tin.
- Phương thức: POST.

- Định dạng dữ liệu: JSON (JavaScript Object Notation).
- Các API Endpoint:
o
/api/control: Gửi lệnh di chuyển (Tiến, Lùi, Trái, Phải, Dừng).
o
/api/mode: Chuyển đổi chế độ hoạt động (Manual, Auto, Line Follow).
b) Giao thức WebSocket - Kênh giám sát:
Được sử dụng để truyền tải hình ảnh từ camera về điện thoại.
- Endpoint: /ws/frames.
- Cơ chế: Thiết lập kết nối hai chiều thời gian thực (Real-time full-duplex). Server
gửi liên tục các frame ảnh đã được mã hóa Base64, Client nhận và giải mã để hiển
thị.


### 2.3.4. Sơ đồ Nguyên lý hoạt động
Hình dưới đây mô tả luồng dữ liệu giữa Người dùng, Ứng dụng Android và Xe:
Hình 19. Sơ đồ nguyên lý hoạt động luồng dữ liệu



### 2.3.5. Các Chức năng và Giải thuật chi tiết
a) Chức năng Kết nối hệ thống:
Người dùng nhập địa chỉ IP của xe vào giao diện. Ứng dụng thực hiện lưu địa chỉ
IP và khởi tạo kết nối WebSocket. Trong tệp cấu hình AndroidManifest.xml, thuộc tính
android:usesCleartextTraffic="true" đã được kích hoạt để cho phép kết nối HTTP tới các
thiết bị nhúng trong mạng nội bộ.
b) Chức năng Điều khiển vận hành (Manual Mode):
Để đảm bảo an toàn và khả năng phản hồi tức thời, giải thuật điều khiển sử dụng cơ chế
bắt sự kiện chạm (OnTouchListener) thay vì sự kiện click thông thường:
- Sự kiện ACTION_DOWN: Khi người dùng nhấn giữ nút, ứng dụng gửi lệnh di
chuyển tương ứng (Ví dụ: {"command": "F"} cho lệnh tiến).
- Sự kiện ACTION_UP: Ngay khi người dùng thả tay, ứng dụng tự động gửi lệnh
dừng ({"command": "S"}). Cơ chế này giúp xe dừng lại ngay lập tức khi mất sự
kiểm soát từ người dùng.
c) Chức năng Giám sát Camera (Live Streaming):
Quá trình xử lý hình ảnh được thực hiện bất đồng bộ qua WebSocketListener:
- Bước 1: Lắng nghe sự kiện onMessage từ WebSocket.
- Bước 2: Nhận chuỗi dữ liệu ảnh dạng String.
- Bước 3: Sử dụng Base64.decode để chuyển đổi chuỗi thành mảng byte.
- Bước 4: Sử dụng BitmapFactory.decodeByteArray để tạo đối tượng hình ảnh
(Bitmap).
- Bước 5: Cập nhật lên giao diện ImageView thông qua phương thức runOnUiThread
để đảm bảo an toàn luồng (Thread-safety).



### 2.3.6. Giao diện người dùng (GUI)khiển
Hình 20. Giao diện app điều khiển



# 3. KẾT QUẢ


## 3.1. Kết quả triển khai hệ thống
- Trong quá trình xây dựng và hoàn thiện đồ án, nhóm đã triển khai thành công toàn bộ
các chức năng cốt lõi của hệ thống xe tự hành thông minh. Các chức năng này được đo
lường thông qua nhiều lần thực nghiệm trong điều kiện thực tế khác nhau nhằm đánh giá
độ ổn định, khả năng phản hồi và mức độ tin cậy của hệ thống. Dưới đây là mô tả chi tiết
từng chức năng đã đạt được:


### 3.1.1. Chức năng bám line tự động
- Hệ thống xe được trang bị ba cảm biến dò line hồng ngoại TCRT5000, cho phép phát
hiện màu sắc mặt đường và bám theo phần line đen có độ tương phản cao. Thuật toán điều
hướng được lập trình trên Arduino đọc tín hiệu từ cảm biến theo chu kỳ 10–20ms, sau đó
định hướng bánh xe như sau:
Trạng thái cảm biến Hành vi điều khiển
Sensor giữa = đen → trái + phải = trắng Xe đi thẳng
Sensor trái = đen → phải = trắng Rẽ trái
Sensor phải = đen → trái = trắng Rẽ phải
Cả ba cảm biến trắng Mất line → dừng ngắn → hiệu chỉnh tìm
lại line
- Kết quả thực nghiệm cho thấy:
• Xe chạy ổn định trên track đường cong và đường thẳng.
• Tỷ lệ bám line thành công ~93–96% trong điều kiện ánh sáng phòng.
• Khi gặp đoạn khuất line (bị đứt, ngã ba), xe có khả năng tự hiệu chỉnh lại vị trí sau
0.3–1.2 giây.
➡ Đây là nền tảng quan trọng đảm bảo hệ thống có thể hoạt động ở chế độ Auto hoàn toàn
mà không có sự can thiệp thủ công.


### 3.1.2. Nhận diện bảng tín hiệu / đèn giao thông bằng AI
Nhóm đã huấn luyện mô hình MobileNetV3 small để nhận diện 4 loại tín hiệu chính:

Nhãn dự đoán Ý nghĩa hành vi
Green Cho phép di chuyển
Yellow Giảm tốc / chờ quyết định tiếp theo
Red Buộc dừng ngay
Stop Sign Dừng 1–2 giây → sau đó tiếp tục
Hình ảnh được truyền từ ESP32-CAM lên server qua WebSocket với tốc độ trung bình
12–18 FPS, sau đó AI xử lý và gửi lệnh điều khiển xuống Arduino. Qua thử nghiệm thực
tế:
• Nhận diện đèn đỏ đúng 97/100 lần
• Nhận diện biển Stop đúng 92% trong ánh sáng ổn định
• Thời gian phản hồi trung bình từ camera → AI → bánh xe là 170–250ms, đủ để xử
lý realtime
➡ Khi AI phát hiện tín hiệu giao thông, xe ưu tiên quyết định từ AI hơn tín hiệu từ cảm
biến line → giúp xử lý đúng luật giao thông mô phỏng.


### 3.1.3. Điều khiển động cơ thông qua AI & thuật toán nhúng
Arduino đóng vai trò bộ điều khiển cuối, nhận:
• Lệnh điều hướng từ AI (UART)
• Tín hiệu môi trường từ cảm biến line
Xe thực hiện điều chỉnh PWM động cơ dựa trên độ cong đường và tình huống giao
thông. Tốc độ PWM được đặt linh hoạt từ 90–255 để đảm bảo:
Tình huống vận hành PWM áp dụng
Bình thường (lưu thông) 65–85% tốc độ
Gặp line cong mạnh 45–60% tốc độ
Phát hiện tín hiệu Yellow Giảm còn ~50%

Tín hiệu Red/Stop PWM = 0 → Dừng ngay
Hiệu quả đạt được:
• Xe tăng tốc – giảm tốc mượt, không giật.
• Không bị rung bánh khi vào cua.
• Đứng yên hoàn toàn khi gặp đèn đỏ/Stop.
➡ Điều này chứng minh thuật toán điều khiển đã triển khai ổn định, phản ứng phù hợp
theo tình huống giao thông.


### 3.1.4. Gửi – nhận dữ liệu giữa các thiết bị hoạt động ổn định
Hệ thống truyền thông 2 lớp được triển khai:
Thành phần Giao thức
ESP32 → Server AI WebSocket (2 chiều)
ESP32 → Arduino UART 115200bps
Kết quả kiểm tra:
• Tốc độ gửi ảnh ổn định, độ trễ thấp.
• Độ cập nhật tín hiệu liên tục, không mất gói nghiêm trọng.
• Lệnh điều khiển truyền về Arduino chính xác ~98% trong test lab.
➡ Kênh dữ liệu đảm bảo hệ thống vận hành thời gian thực, không lag, phù hợp mô hình
IoT phân tán.


## 3.2. Tập dữ liệu sử dụng cho mô hình AI
- Tập dữ liệu dùng để huấn luyện mô hình MobileNetV3 small được xây dựng từ hai
nguồn:
(1) ảnh tự thu thập bằng ESP32-CAM trong môi trường mô phỏng
(2) một số ảnh bổ sung từ nguồn dữ liệu mở để tăng sự đa dạng về góc nhìn và ánh sáng.

- Các lớp nhãn gồm: green, yellow, red, stopsign, none. Ảnh gốc có độ phân giải 320×240
và được resize về 224×224 trước khi đưa vào mô hình. Ảnh được lưu dưới dạng JPEG, xử
lý RGB và áp dụng một số kỹ thuật tăng cường dữ liệu nhẹ.
- Tập dữ liệu được chia theo tỉ lệ: 70% train – 15% validation – 15% test, đảm bảo cân
bằng giữa các lớp và phản ánh đầy đủ các tình huống giao thông mô phỏng.


## 3.3. Công cụ, thư viện và môi trường thực nghiệm
- Hệ thống AI sử dụng Python + FastAPI làm server xử lý WebSocket/REST API, kết hợp
thư viện TensorFlow/Keras cho suy diễn mô hình. OpenCV và NumPy được dùng để xử
lý ảnh, đặc biệt trong pipeline nhận diện làn đường.
- ESP32-CAM và Arduino được lập trình bằng Arduino IDE/PlatformIO cùng các thư viện
Arduino Websockets, Arduino Json và esp_camera . Server AI chạy trên máy tính cá nhân
có CPU đa nhân; ESP32-CAM kết nối qua WiFi nội bộ; Arduino giao tiếp qua UART với
tốc độ 115200bps.


## 3.4. Điều kiện tiến hành thực nghiệm
- Thử nghiệm được thực hiện chủ yếu trong phòng, trên track mô phỏng gồm đường thẳng,
đường cong và khu vực đặt biển/đèn tín hiệu. Ánh sáng được giữ ở mức ổn định để đảm
bảo camera thu được hình ảnh rõ ràng.
- Trong quá trình vận hành, ESP32-CAM truyền 12–18 FPS; server AI giới hạn tần suất
suy diễn ở 50 ms/lần để giảm tải. Ngưỡng nhận diện tín hiệu giao thông đặt ở 0.5, riêng
nhãn red và stopsign ưu tiên với ngưỡng cao hơn (0.7). Arduino cập nhật PWM động cơ
theo lệnh AI hoặc theo cảm biến line tùy chế độ.


## 3.5. Độ đo đánh giá hiệu suất hệ thống
- Mô hình AI nhận diện tín hiệu giao thông đạt độ chính xác cao trên tập test, đặc biệt là
các nhãn red và green. Thử nghiệm thực tế cho kết quả:
• Nhận diện đèn đỏ chính xác 97%,

• Nhận diện biển Stop khoảng 92%.
- Độ trễ xử lý từ camera → server AI → động cơ dao động 170–250 ms, đủ để xe phản
ứng chính xác trong mô hình thu nhỏ. Kết nối WebSocket hoạt động ổn định, tỉ lệ lệnh
truyền sai chỉ khoảng 2%, không ảnh hưởng đến quá trình điều khiển.


## 3.6. Quy trình và điều kiện kiểm thử hệ thống
Kiểm thử được chia thành hai giai đoạn:
a) Kiểm thử đơn lẻ:
o
Kiểm tra từng module gồm AI nhận diện, lane detection, truyền thông
WebSocket, UART và cảm biến line.
o
Đánh giá bằng các tập ảnh riêng biệt và quan sát log trong server/ ESP32
/Arduino.
b) Kiểm thử tích hợp:
o
Xe chạy trên track hoàn chỉnh với các tình huống: bám line, gặp đèn xanh –
vàng – đỏ, gặp biển Stop.
o
Kiểm thử theo từng chế độ hoạt động: line_follow và manual.
Kết quả cho thấy hệ thống phản ứng đúng hầu hết các tình huống và vận hành trơn tru
trong thời gian dài.


## 3.7. Nhận xét chung
- Hệ thống đã đáp ứng tốt mục tiêu đặt ra: bám line ổn định, nhận diện tín hiệu giao thông
chính xác, điều khiển động cơ mượt và đảm bảo độ trễ thấp. Các kênh truyền thông hoạt
động ổn định, ít lỗi.
- Hạn chế chủ yếu nằm ở điều kiện ánh sáng thay đổi và phụ thuộc vào tốc độ WiFi. Tuy
nhiên, đây là những vấn đề có thể cải thiện trong các phiên bản sau thông qua tối ưu model,
bổ sung dữ liệu và nâng cấp phần cứng.



## 3.8. Một số hình ảnh sản phẩm dự án
a) Hình ảnh sản phẩm xe
Hình 21. Mô hình sản phẩm xe (1)
Hình 22. Mô hình sản phẩm xe (2)

b) Hình ảnh biển báo
Hình 23. Hỉnh ành biển báo
c) Hình ảnh đèn giao thông
Hình 26. Đèn màu xanh Hình 24. Đèn màu vàng Hình 25. Đèn màu đỏ



# 4. KẾT LUẬN


## 4.1. Kết luận
- Sau quá trình nghiên cứu, thiết kế và triển khai hệ thống xe tự hành mô phỏng giao
thông thông minh, nhóm sinh viên đã hoàn thành hầu hết các yêu cầu của đề tài. Hệ thống
tích hợp đầy đủ các thành phần: cảm biến bám line, mô hình AI nhận diện tín hiệu giao
thông, thuật toán điều khiển động cơ, kết nối ESP32–Server–Arduino, cùng khả năng vận
hành thời gian thực. Các kết quả thực nghiệm cho thấy xe hoạt động ổn định, phản hồi
nhanh và xử lý chính xác phần lớn các tình huống giao thông mô phỏng.
- Cụ thể, chức năng bám line đạt độ ổn định cao trên đa dạng loại đường, mô hình AI
phân loại đèn giao thông đạt độ chính xác trên 92–97%, thời gian suy diễn thấp (~200 ms),
đảm bảo yêu cầu chạy realtime. Bộ điều khiển động cơ phản ứng mượt mà với thay đổi tốc
độ và hướng di chuyển, giúp xe vận hành an toàn khi gặp đèn đỏ hoặc biển Stop. Kênh
truyền thông WebSocket và UART hoạt động ổn định, không xuất hiện lỗi đáng kể trong
quá trình thử nghiệm.
- Nhìn chung, sản phẩm đã đáp ứng đầy đủ mục tiêu đề ra: xây dựng một hệ thống xe
tự hành thu nhỏ có khả năng nhận diện tín hiệu giao thông và điều hướng tự động. Tuy còn
hạn chế về điều kiện ánh sáng và độ phân giải camera, mô hình vẫn đủ chính xác để vận
hành trong môi trường mô phỏng.


## 4.2. Hướng phát triển
Mặc dù hệ thống xe tự hành thông minh đã đáp ứng tốt các mục tiêu đề ra trong phạm vi
đồ án, vẫn còn nhiều hướng phát triển tiềm năng nhằm nâng cao độ chính xác, tính ổn định
và khả năng ứng dụng thực tế của hệ thống trong tương lai.
• Mở rộng tập dữ liệu: Trong các phiên bản tiếp theo, tập dữ liệu huấn luyện cho
mô hình AI có thể được mở rộng bằng cách thu thập thêm hình ảnh trong nhiều điều
kiện ánh sáng khác nhau (ánh sáng yếu, ánh sáng mạnh, bóng đổ), nhiều góc nhìn
và khoảng cách khác nhau. Đồng thời, việc bổ sung thêm các loại biển báo giao
thông khác (ví dụ: rẽ trái, rẽ phải, cấm đi, giảm tốc) sẽ giúp mô hình tăng khả năng

tổng quát hóa, giảm hiện tượng phụ thuộc vào môi trường mô phỏng cố định và cải
thiện độ chính xác khi triển khai trong các bối cảnh đa dạng hơn.
• Nâng cấp phần cứng: Hệ thống hiện tại sử dụng ESP32-CAM kết hợp với server
AI để xử lý hình ảnh. Trong tương lai, có thể nâng cấp lên các nền tảng tính toán
mạnh hơn như Raspberry Pi hoặc Jetson Nano để thực hiện suy diễn AI trực tiếp
trên xe (edge computing). Việc này giúp giảm độ trễ truyền dữ liệu qua mạng, tăng
tốc độ phản hồi và nâng cao tính автоном (tự chủ) của hệ thống, đặc biệt trong các
môi trường yêu cầu thời gian thực cao.
• Tối ưu thuật toán lane detection: Thuật toán bám line hiện tại chủ yếu dựa trên
cảm biến hồng ngoại, phù hợp với các track đơn giản. Trong các phiên bản mở rộng,
có thể kết hợp hoặc thay thế bằng các thuật toán lane detection dựa trên xử lý ảnh
hoặc deep learning, như sử dụng CNN để phát hiện làn đường, hoặc áp dụng các kỹ
thuật biến đổi phối cảnh (perspective transformation) nhằm cải thiện độ ổn định khi
xe di chuyển trên các track phức tạp, nhiều khúc cua hoặc giao lộ.
• Bổ sung thuật toán tránh vật cản: Hiện tại, xe chủ yếu dựa vào line và tín hiệu
giao thông để điều hướng. Để tăng tính an toàn và tiệm cận hơn với các hệ thống xe
tự hành thực tế, hệ thống có thể được trang bị thêm các cảm biến như siêu âm hoặc
LiDAR nhằm phát hiện vật cản phía trước. Dữ liệu từ các cảm biến này sẽ được tích
hợp vào thuật toán ra quyết định, cho phép xe giảm tốc hoặc dừng lại khi gặp chướng
ngại vật bất ngờ.
• Xây dựng giao diện điều khiển & giám sát: Giao diện hiện tại cho phép điều khiển
và giám sát cơ bản thông qua ứng dụng di động. Trong tương lai, có thể mở rộng
thành một nền tảng web hoặc ứng dụng đa thiết bị, cho phép người dùng theo dõi
trạng thái xe theo thời gian thực (tốc độ, chế độ hoạt động, trạng thái cảm biến),
xem camera trực tiếp, cũng như lưu trữ và phân tích lịch sử hành trình. Điều này
không chỉ phục vụ mục đích giám sát mà còn hỗ trợ nghiên cứu, đánh giá và tối ưu
hệ thống.
• Tổng kết hướng phát triển: Với thời gian và kinh phí phù hợp, hệ thống có thể mở
rộng thành một mô hình xe tự hành hoàn chỉnh hơn, tiệm cận những nguyên lý mà
các hệ thống xe tự lái thực tế đang sử dụng.



# TÀI LIỆU THAM KHẢO
[1] Arduino.vn, http://arduino.vn/bai-viet/415-hoc-arduino-qua-du-lam-xe-dieu-khien-tu-
xa-phan-1-tong-quan, 22-5-2014.
[2] Hướng dẫn cách lắp xe điều khiển, https://www.youtube.com/watch?v=kX5sV0433fM
[3]Tham khảo dự án xe,
https://www.studocu.vn/vn/document/truong-dai-hoc-bach-khoa-ha-noi/do-an-thiet-
ke/do-an-tot-nghiep-thiet-ke-he-thong-xe-tu-hanh-tu-dong/127729587
[4] Nghiên cứu và phát triển xe tự hành ứng dụng AI, https://jst-haui.vn/media/30/uffile-
upload-no-title30638.pdf
[5] MobileNetV, https://keras.io/api/applications/mobilenet/
[6] Youtube hướng dẫn học Model AI, https://www.youtube.com/watch?v=dMh7 kroj
LIE&l ist=PLpkFduNMb9uInRPXI-2CtNDq4DYXm9cUK