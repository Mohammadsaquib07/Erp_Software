# FROM node:20-alpine
# # We're telling Docker:
# # "Hey Docker, start with a computer
# #  that already has Node.js installed"

# # Why node? Because Angular needs Node to build.
# # Why alpine? It's lightweight = small & fast.
# # -------------------------------------------
# # -------------------------------------------
# WORKDIR /app
# # We're telling Docker:
# # "Create a folder called /app
# #  and do all work inside it"

# # Same as you doing:
# # mkdir /app
# # cd /app
# #--------------------------------------------
# COPY package.json .
# # We're telling Docker:
# # "Copy my package.json file
# #  into the /app folder"

# # Why only package.json first?
# # Because next step is npm install
# # and we only need this file for that
# #--------------------------------------------

# RUN npm install
# # We're telling Docker:
# # "Now run npm install"

# # This downloads all node_modules
# # inside the container
# #--------------------------------------------
# COPY . .
# # We're telling Docker:
# # "Now copy ALL my remaining files"

# # Left dot  = your laptop files
# # Right dot = /app folder in container
# #--------------------------------------------
# EXPOSE 80
# # We're telling Docker:
# # "This app will use port 80"

# # Just like putting a door on a house
# # -------------------------------------------
# CMD ["npm", "start"]
# # We're telling Docker:
# # "When container starts, run npm start"

# # This is the LAST instruction
# # Only ONE CMD allowed in Dockerfile

# Step 1 - Build the app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# Step 2 - Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/client/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]