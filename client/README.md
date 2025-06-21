# FASTIFY Admin Dashboard

## Overview

This project provides a modern admin interface with standardized UI components and styling across all admin pages. The admin dashboard was built with React and offers a consistent user experience through common design elements.

## UI Standardization

The admin interface follows a consistent design pattern across all pages:

- Gradient backgrounds (`linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)`)
- Dashboard welcome cards with gradient backgrounds
- Stat cards with hover effects and appropriate iconography
- Data tables with gradient headers
- Consistent search interfaces
- Standardized button styles and hover effects

### Completed Pages

The following admin pages have been updated with the standardized UI:

- `/admin/dashboard` - Main dashboard with system overview
- `/admin/payment` - Payment management with transaction statistics
- `/admin/order` - Order management with revenue and pending order metrics
- `/admin/coupon` - Coupon management with statistics and improved input forms
- `/admin/review` - Review management with rating statistics
- `/admin/contact` - Contact management with message status tracking

### Pending Pages

- `/admin/banner` - Banner management (in progress)

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`

Launches the test runner in interactive watch mode

### `npm run build`

Builds the app for production to the `build` folder

## Development Guidelines

When adding new admin pages or modifying existing ones, follow these UI guidelines:

1. Use gradient backgrounds for page containers
2. Include stat cards with hover effects
3. Style tables with gradient headers
4. Apply consistent button and form styling
5. Maintain the same card design for content sections

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

cd client
npm install
npm start

cd fastify_v2
npm install
npm run dev
