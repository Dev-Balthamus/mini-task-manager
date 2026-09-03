# ======================================================================
# Dockerfile **to build** the Frontend for Mini Task Manager app project
# ======================================================================

# Layer 1 : To build the React.JS app

# Step 1.1: Provide Node.JS image
FROM node:24-alpine AS builder

# Step 1.2: Define the directory inside the container
WORKDIR /mini-task-manager/frontend

# Step 1.3: Copy package-related files first, to leverage Docker's caching mechanism
COPY package.json package-lock.json* ./

# Step 1.4: Install app dependencies via npm ci
RUN --mount=type=cache,target=/root/.npm npm ci

# Step 1.5: Copy all the rest of app source code into the container
COPY . .

# Step 1.6: Build the React.JS app
RUN npm run build



# Layer 2: Prepare Nginx to serve Static Files

# Step 2.1: Provide Nginx image
FROM nginxinc/nginx-unprivileged:alpine AS runner

# Step 2.2: Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Step 2.3: Copy the static build output from the build stage to Nginx's default HTML serving directory
COPY --chown=nginx:nginx --from=builder /mini-task-manager/frontend/dist /usr/share/nginx/html

# Step 2.4: Use a non-root user for security best practices
USER nginx

# Step 2.5: Expose the wanted port to allow HTTP traffic (default is 8080)
EXPOSE 5173

# Step 2.6: Start Nginx directly with custom config
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]