ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine

# Thiết lập thư mục làm việc gốc trong container
WORKDIR /app

# 1. Chỉ copy package.json của worker vào trước để tận dụng Docker Cache
COPY worker/package.json worker/package-lock.json* ./worker/

# 2. Di chuyển vào thư mục worker để cài đặt dependencies
WORKDIR /app/worker
RUN npm install

# 3. Lùi lại thư mục /app để copy phần code còn lại
WORKDIR /app

# 4. Copy thư mục shared và toàn bộ source code của worker vào container
COPY shared ./shared
COPY worker ./worker

# 5. Phân quyền và chuyển sang user 'node' (Best practice về bảo mật của Node.js Docker)
RUN chown -R node:node /app
USER node

# 6. Quay lại thư mục worker để khởi chạy ứng dụng
WORKDIR /app/worker

CMD ["node", "crawlWorker.js"]