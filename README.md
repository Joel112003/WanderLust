                                                              WanderLust
WanderLust is a full-stack web application designed for travel enthusiasts. It enables users to browse and book holiday rentals, cabins, beach houses, and more. The application features an interactive map, a responsive design, and user authentication for a seamless and secure experience.


WanderLust is built using the following technologies:
Backend: Node.js, Express.js
Database: MongoDB
Authentication: Passport.js
Frontend: EJS, HTML, CSS, JavaScript
Image Management: Cloudinary
Maps Integration: Interactive maps for property locations

Features:
User Authentication: Secure login and registration using Passport.js.
Responsive Design: Optimized for mobile and desktop use.
Category Filtering: View listings by categories like Mansions, Farms, Islands, and more.
Interactive Maps: Explore properties directly on the map.
Image Uploads: Upload and manage images using Cloudinary.
Custom Error Handling: Ensures smooth user experience with meaningful error messages.

Installation
Follow these steps to set up WanderLust on your local machine:

1.Clone the repository:
https://github.com/Joel112003/WanderLust.git

cd wanderlust

2.Install the dependencies:
npm install

3.Set up environment variables: Create a .env file in the root directory and add the following variables:
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret

Tip:You can find cloud name,Api_key and Api_secret from cloudinary website when u login into your account.

4.Start the server
npm start

Visit the application: Open your browser and go to http://localhost:8000/listings



