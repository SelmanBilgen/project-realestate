# Rigel Premium Homes - Real Estate Investment Platform

A comprehensive real estate investment dashboard built with React, Vite, Supabase, and TanStack Query. The platform specializes in Greek Golden Visa eligible properties with advanced ROI calculations and premium member access controls.

## 🏠 Features

### User-Facing Features

- **Property Listings**: Browse premium real estate investments
- **Golden Visa Properties**: Special focus on Greek Golden Visa eligible properties
- **Advanced Filtering**: Filter by area, price, status, and Golden Visa eligibility
- **ROI Calculations**: Automatic profit and ROI calculations for investments
- **Premium Access**: First 3 properties visible to all, rest require premium membership
- **Contact Forms**: Inquiry system for property viewings and information

### Admin Features

- **Full CRUD Operations**: Create, read, update, and delete properties
- **Admin Dashboard**: Comprehensive overview of all properties and statistics
- **Financial Tracking**: Monitor purchase costs, renovation expenses, and selling prices
- **User Management**: Admin and premium member authentication system

## 🛠️ Tech Stack

### Frontend

- **React 18** with Vite for fast development
- **JavaScript** (ES6+) for modern development
- **Tailwind CSS** for responsive styling
- **Shadcn UI** for consistent design components
- **React Router DOM** for client-side routing
- **TanStack Query** for data fetching and caching

### Backend

- **Supabase** for database, authentication, and storage
- **PostgreSQL** for robust data management
- **Row Level Security** for data protection
- **Real-time subscriptions** (ready for future implementation)

## 📁 Project Structure

```
src/
├── api/                 # API functions for Supabase
│   ├── supabaseClient.js
│   ├── projects.js
│   └── inquiries.js
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── PropertyCard.jsx
│   ├── Filters.jsx
│   ├── ContactForm.jsx
│   └── AdminTable.jsx
├── hooks/              # Custom React hooks
│   ├── useProjects.js
│   └── useAuth.js
├── pages/              # Page components
│   ├── Projects.jsx
│   ├── ProjectDetail.jsx
│   ├── Admin.jsx
│   └── Login.jsx
├── types/              # Type definitions
│   ├── project.js
│   └── inquiry.js
├── utils/              # Utility functions
│   ├── utils.js
│   └── formatters.js
└── App.jsx            # Main App component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account and project
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rigel-premium-homes
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   a. Create a new Supabase project

   b. Run the SQL schema from `supabase_schema.sql` in the SQL editor:

   ```sql
   -- Copy and execute the contents of supabase_schema.sql
   ```

   c. Set up authentication policies in Supabase Auth:

   - Enable email authentication
   - Create admin user with role: 'admin'
   - Create premium users with role: 'premium'

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Credentials

**Admin Account:**

- Email: `admin@rigelhomes.com`
- Password: `admin123`
- Role: Full admin access to all features

**Premium Account:**

- Email: `premium@rigelhomes.com`
- Password: `premium123`
- Role: Access to all properties and premium features

## 📊 Database Schema

### Projects Table

```sql
- id: UUID (Primary Key)
- title: TEXT
- area: TEXT
- price: NUMERIC
- size: INTEGER
- bedrooms: INTEGER
- bathrooms: INTEGER
- status: TEXT ('available', 'sold', 'reserved')
- golden_visa: BOOLEAN
- completion_year: INTEGER
- image_url: TEXT
- description: TEXT
- purchase_price: NUMERIC
- transfer_fees: NUMERIC
- renovation_cost: NUMERIC
- selling_price: NUMERIC
- roi: NUMERIC (calculated)
```

### Inquiries Table

```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key)
- full_name: TEXT
- email: TEXT
- phone: TEXT
- message: TEXT
- created_at: TIMESTAMP
```

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full access to all features, CRUD operations, admin dashboard
- **Premium Member**: Access to all properties, detailed financial analysis
- **Guest**: Limited access (first 3 properties only)

### Protected Routes

- `/admin` - Admin only
- `/premium` - Premium members and admins
- Property details - Premium members and admins for properties beyond #3

## 💰 Financial Calculations

### ROI Calculation

```javascript
ROI = ((Selling Price - Total Investment) / Total Investment) × 100

Total Investment = Purchase Price + Transfer Fees + Renovation Cost
```

### Profit Calculation

```javascript
Net Profit = Selling Price - Total Investment
```

## 🎯 Key Features Implementation

### Property Filtering

- Multi-criteria filtering (area, price range, status, Golden Visa)
- Real-time search functionality
- Persisted filter state

### Premium Access Control

- First 3 properties visible to all users
- Remaining properties blurred for non-premium users
- Smooth user experience with clear upgrade prompts

### Admin Dashboard

- Comprehensive property management
- Financial overview and statistics
- Quick edit capabilities
- Delete confirmation modals

### Responsive Design

- Mobile-first approach
- Tailwind CSS for consistent styling
- Shadcn UI components for professional appearance

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your repository to the platform
2. Set environment variables
3. Deploy automatically on push to main branch

### Environment Variables for Production

```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🔧 Customization

### Adding New Property Features

1. Update the database schema
2. Modify the project type definitions
3. Update forms and validation
4. Add new UI components as needed

### Styling Customization

- Modify Tailwind configuration in `tailwind.config.js`
- Update CSS variables in `src/index.css`
- Customize Shadcn UI theme colors

### Authentication Enhancement

- Add social login providers
- Implement password reset functionality
- Add email verification

## 📱 Mobile Optimization

The application is fully responsive with:

- Mobile-first design approach
- Touch-friendly interface elements
- Optimized images and performance
- Responsive grid layouts

## 🎨 Design System

Built with Shadcn UI components featuring:

- Consistent color palette (blue/gray theme)
- Professional typography
- Accessible design patterns
- Smooth animations and transitions

## 📈 Performance Features

- **TanStack Query**: Intelligent caching and background refetching
- **Lazy Loading**: Images loaded on demand
- **Code Splitting**: Routes loaded dynamically
- **Optimized Builds**: Vite for fast development and production builds

## 🔒 Security Features

- Row Level Security in Supabase
- Protected API routes
- Input validation and sanitization
- Secure authentication flow

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection**

   - Verify environment variables
   - Check network connectivity
   - Ensure RLS policies are configured

2. **Authentication**

   - Confirm user roles in Supabase Auth
   - Check session management
   - Verify protected route logic

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check for missing dependencies
   - Verify Vite configuration

### Support

For issues and questions:

1. Check the troubleshooting section
2. Review Supabase documentation
3. Open an issue in the repository

## 📄 License

This project is created for demonstration purposes. Please contact the development team for commercial use.

---

**Built with ❤️ using React, Supabase, and modern web technologies**

# Project Rationale: Rigel Premium Homes

## 🎯 Why We Created This Project

### Market Need

The Greek Golden Visa program has created significant demand for premium real estate investments, but existing platforms lack specialized features for this niche market. We identified several key gaps:

- **Limited Golden Visa Focus**: Most platforms treat Golden Visa as an afterthought rather than a core feature
- **Poor Investment Analysis**: Basic property listings without sophisticated ROI calculations
- **No Tiered Access**: Equal access for all users reduces premium value proposition
- **Weak Admin Tools**: Property managers need better tools for managing large portfolios

### Business Objectives

1. **Serve High-Value Investors**: Target investors seeking €250,000+ properties for Golden Visa eligibility
2. **Premium Positioning**: Create exclusivity through tiered access model
3. **Data-Driven Decisions**: Provide comprehensive financial analysis tools
4. **Scalable Platform**: Build foundation for future expansion across European markets

## 🛠️ Technology Stack Rationale

### Frontend: React + Vite + JavaScript

**Why React 18:**

- ✅ **Component Architecture**: Perfect for complex UI with property cards, filters, and admin panels
- ✅ **Ecosystem Maturity**: Extensive library support for real estate features
- ✅ **Performance**: Concurrent features and automatic batching for smooth UX
- ✅ **Developer Experience**: Large community and excellent debugging tools

**Why Vite:**

- ✅ **Lightning Fast**: Sub-second startup time compared to 10+ seconds with Create React App
- ✅ **Hot Module Replacement**: Instant updates during development
- ✅ **Optimized Builds**: Better production performance than Webpack
- ✅ **Modern Tooling**: Native ES modules and modern browser features

**Why JavaScript over TypeScript:**

- ✅ **Faster Development**: No compilation step for rapid prototyping
- ✅ **Easier Onboarding**: Lower barrier to entry for real estate professionals
- ✅ **Flexibility**: Dynamic typing useful for varying property data structures
- ❌ **Trade-off**: Less type safety, but mitigated by runtime validation

### Backend: Supabase

**Why Supabase over Traditional Backend:**

- ✅ **Rapid Development**: Database, auth, and storage in one platform
- ✅ **Real-time Features**: Built-in subscriptions for live property updates
- ✅ **PostgreSQL Power**: Full SQL capabilities with NoSQL flexibility
- ✅ **Authentication**: Enterprise-grade auth with social logins ready
- ✅ **Scalability**: Handles growth from startup to enterprise
- ❌ **Vendor Lock-in**: Migration complexity if switching providers
- ❌ **Cost at Scale**: Can become expensive with high traffic

**Why PostgreSQL:**

- ✅ **ACID Compliance**: Critical for financial transactions
- ✅ **JSON Support**: Flexible property metadata storage
- ✅ **Full-text Search**: Powerful property search capabilities
- ✅ **Extensions**: PostGIS for location-based features ready

### State Management: TanStack Query

**Why TanStack Query over Redux:**

- ✅ **Server State Focus**: Perfect for property data fetching
- ✅ **Automatic Caching**: Intelligent cache invalidation and background refetching
- ✅ **Optimistic Updates**: Smooth UI for property management actions
- ✅ **Less Boilerplate**: Minimal code for complex data operations
- ✅ **Developer Tools**: Excellent debugging and devtools support

### UI Framework: Tailwind CSS + Shadcn UI

**Why Tailwind CSS:**

- ✅ **Rapid Styling**: Utility-first approach speeds up development
- ✅ **Consistent Design**: Design system enforced through classes
- ✅ **Responsive Design**: Mobile-first approach built-in
- ✅ **Performance**: PurgeCSS removes unused styles in production
- ❌ **Learning Curve**: Different mental model from traditional CSS
- ❌ **HTML Bloat**: Can result in long class name strings

**Why Shadcn UI:**

- ✅ **Accessibility**: WCAG compliant components out of the box
- ✅ **Customization**: Copy-paste components allow full modification
- ✅ **TypeScript Ready**: Type-safe components (compatible with JavaScript)
- ✅ **Modern Patterns**: Headless UI with excellent developer experience

## 📁 Project Structure Rationale

### Feature-Based Organization

```
src/
├── api/          # API layer abstraction
├── components/   # Reusable UI components
├── pages/        # Route-based page components
├── hooks/        # Custom React hooks
├── types/        # TypeScript definitions
└── utils/        # Helper functions
```

**Advantages:**

- ✅ **Scalability**: Easy to add new features without restructuring
- ✅ **Team Collaboration**: Clear boundaries between different concerns
- ✅ **Testing**: Each layer can be tested independently
- ✅ **Reusability**: Components and hooks can be shared across features

**Potential Disadvantages:**

- ❌ **Learning Curve**: New developers need to understand the structure
- ❌ **File Navigation**: More files to navigate compared to simpler structures

### API Layer Separation

**Why Separate API Layer:**

- ✅ **Centralized Logic**: All Supabase interactions in one place
- ✅ **Easy Testing**: Can mock API layer for component testing
- ✅ **Flexibility**: Easy to switch backend providers if needed
- ✅ **Error Handling**: Consistent error handling across all API calls

### Custom Hooks Strategy

**Why Custom Hooks:**

- ✅ **Encapsulation**: Complex logic hidden behind simple interfaces
- ✅ **Reusability**: Business logic can be shared across components
- ✅ **Testing**: Hooks can be tested independently of components
- ✅ **Performance**: Optimized re-renders through hook design

## 🎯 Architecture Decisions

### Client-Side Rendering (CSR)

**Why CSR over SSR:**

- ✅ **Interactive Experience**: Perfect for property filtering and admin actions
- ✅ **Lower Hosting Costs**: Can be hosted on static platforms
- ✅ **Faster Development**: No server-side complexity
- ❌ **SEO Impact**: But real estate platforms rely more on direct marketing
- ❌ **Initial Load**: Solved through code splitting and optimization

### Component-Based Architecture

**Why Component-Based:**

- ✅ **Reusability**: Property cards, filters, forms used across pages
- ✅ **Maintainability**: Each component has single responsibility
- ✅ **Testing**: Components can be tested in isolation
- ✅ **Team Scaling**: Different developers can work on different components

### State Management Strategy

**Why Hybrid Approach:**

- ✅ **Server State**: TanStack Query handles API data perfectly
- ✅ **UI State**: React state handles component-specific data
- ✅ **Authentication**: Supabase handles user session management
- ✅ **No Overhead**: No need for complex state management library

## 📊 Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Routes loaded on demand
2. **Image Optimization**: Lazy loading and responsive images
3. **Caching Strategy**: Intelligent data caching with TanStack Query
4. **Bundle Optimization**: Tree shaking and minification

### Performance Trade-offs

- ✅ **Development Speed**: Faster to market with chosen stack
- ✅ **User Experience**: Smooth interactions and fast navigation
- ❌ **Initial Bundle Size**: Mitigated through code splitting
- ❌ **SEO**: Addressed through meta tags and structured data

## 🔐 Security Architecture

### Multi-Layer Security

1. **Database Level**: Row Level Security (RLS) policies
2. **API Level**: Supabase authentication and authorization
3. **Application Level**: Protected routes and role-based access
4. **Component Level**: Conditional rendering based on permissions

### Security Advantages

- ✅ **Defense in Depth**: Multiple layers of security
- ✅ **Principle of Least Privilege**: Users only access what they need
- ✅ **Audit Trail**: All actions logged through Supabase
- ✅ **Data Protection**: Sensitive financial data properly secured

## 🚀 Scalability Planning

### Horizontal Scaling

- ✅ **Stateless Architecture**: No server-side session storage
- ✅ **CDN Ready**: Static assets can be served globally
- ✅ **Database Scaling**: Supabase handles database scaling
- ✅ **Microservices Ready**: Can split into smaller services

### Vertical Scaling

- ✅ **Performance Optimization**: Code splitting and lazy loading
- ✅ **Caching Strategy**: Multiple levels of caching
- ✅ **Resource Optimization**: Efficient component rendering
- ✅ **Monitoring Ready**: Performance monitoring integration points

## 💡 Innovation Highlights

### Golden Visa Integration

- Specialized workflow for Golden Visa eligible properties
- Automatic compliance checking and documentation
- Integration with legal and immigration services

### Premium Access Model

- Innovative freemium model for real estate platform
- Clear value proposition for premium upgrade
- Smooth conversion funnel from free to paid

### Financial Analysis Tools

- Real-time ROI calculations
- Investment scenario modeling
- Market comparison features

## 🎨 User Experience Philosophy

### Mobile-First Design

- Touch-optimized interface elements
- Swipe gestures for property browsing
- Responsive images and typography
- Offline capability for viewed properties

### Accessibility First

- WCAG 2.1 AA compliance
- Screen reader optimization
- Keyboard navigation support
- High contrast mode support

## 📈 Business Value

### ROI for Real Estate Companies

- **Faster Sales**: Premium features accelerate decision-making
- **Higher Conversion**: Tiered access model increases premium subscriptions
- **Better Analytics**: Data-driven insights improve property pricing
- **Reduced Costs**: Automated processes reduce manual work

### Competitive Advantages

- **Specialized Focus**: Golden Visa expertise differentiates from generic platforms
- **Premium Positioning**: Higher perceived value through exclusive access
- **Data Intelligence**: Advanced analytics provide market insights
- **Scalable Platform**: Foundation for European expansion

## 🔮 Future Roadmap

### Phase 2 Features

- Virtual property tours
- AI-powered property recommendations
- Integration with Greek banking system
- Mobile app development

### Phase 3 Expansion

- Multi-country support (Portugal, Spain)
- Blockchain-based property verification
- VR property visualization
- Automated legal document generation

## 🎯 Success Metrics

### Technical Metrics

- Page load time < 3 seconds
- Mobile responsiveness score > 95
- Accessibility score > 95
- Error rate < 0.1%

### Business Metrics

- Premium conversion rate > 15%
- User retention > 80%
- Property inquiry rate > 25%
- Customer satisfaction > 4.5/5

---

**Conclusion**: This technology stack and architecture were chosen to create a sophisticated, scalable, and user-friendly platform that addresses the specific needs of the Greek Golden Visa real estate market while providing a foundation for future expansion across European markets.
