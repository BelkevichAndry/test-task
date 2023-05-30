# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project files to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 3000

# Start the application with hot reloading
CMD ["npm", "run", "dev"]
