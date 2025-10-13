# Use official Node image
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build Next.js app
RUN npm run build

# ---------------------------
# Production image
# ---------------------------
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Copy only necessary build artifacts
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package*.json ./

# Install only production deps
RUN npm install --omit=dev

# Expose port 8080 for Cloud Run
ENV PORT 8080
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
