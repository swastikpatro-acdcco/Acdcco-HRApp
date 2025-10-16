# ACDC HR Management System - React Version

This is the React version of the ACDC HR Management System, migrated from the original HTML/CSS/JavaScript implementation.

## Features

- **Employee Directory**: View all current team members with their details
- **Add Employee Form**: Register new team members with comprehensive information
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Interactive Navigation**: Smooth scrolling and mobile menu
- **Real-time Updates**: Employee list updates immediately when new employees are added

## Technology Stack

- **React 19.1.1**: Modern React with hooks
- **CSS3**: Custom styling with animations and responsive design
- **Font Awesome**: Icons throughout the interface
- **Google Fonts**: Inter font family for modern typography

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` directory.

## Project Structure

```
src/
├── components/
│   ├── Navigation.js      # Navigation bar with mobile menu
│   ├── Hero.js           # Hero section with call-to-action buttons
│   ├── EmployeeDirectory.js # Employee cards display
│   ├── EmployeeForm.js   # Add new employee form
│   ├── Contact.js        # IT support contact information
│   └── Footer.js         # Footer section
├── App.js               # Main application component
├── App.css             # All component styles
├── index.js            # React entry point
└── index.css           # Global styles and resets
```

## Key Features Implemented

### State Management
- React hooks (`useState`) for managing employee data and form state
- Props passing for component communication
- Real-time form validation and auto-generation of employee IDs

### Interactive Elements
- Smooth scrolling navigation
- Mobile-responsive hamburger menu
- Form submission with success feedback
- Dynamic employee card rendering

### Styling
- CSS Grid and Flexbox for responsive layouts
- CSS animations and transitions
- Gradient backgrounds and modern design elements
- Mobile-first responsive design

## Migration Notes

This React version maintains all the functionality of the original HTML version while adding:

- Component-based architecture for better maintainability
- React state management for dynamic data handling
- Improved form handling with controlled components
- Better separation of concerns between UI and logic

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is an internal ACDC BTS team project. For any issues or improvements, please contact the development team.

## License

© 2025 ACDC BTS Team. All rights reserved.
