# Use Node.js 20 on Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the development port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
