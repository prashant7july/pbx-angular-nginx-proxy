# Stage 1: Build the Angular application
FROM node:16.14.2

# Set the working directory
WORKDIR /usr/src/app

# Install Angular CLI globally
RUN npm install @angular/cli -g

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose port 4200 for the Angular dev server
EXPOSE 4200

# Start the Angular dev server
CMD ["npm", "start"]