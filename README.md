# Stuart Mission Control 🚀

A NextJS + Convex dashboard for Stuart (AI Trading Assistant) with all 6 core screens from Alex Finn's specifications.

## 🎯 Features

### 1. **Tasks Board** (`/`)
- Kanban-style board with Backlog → In Progress → Done columns
- Priority color coding (Critical, High, Medium, Low)
- Assignee tracking (Stuart vs Micky)
- Real-time task updates and status management

### 2. **Trading Dashboard** (`/trading`)
- Portfolio overview with P&L tracking
- Active positions with entry/current prices
- Recent trades history
- Cash balance and unrealized/realized P&L

### 3. **Calendar** (`/calendar`)
- Scheduled cron jobs and tasks visualization
- Status indicators (Active, Paused, Error)
- Next run times and execution history
- System status overview

### 4. **Memory System** (`/memory`)
- Beautiful document cards with markdown rendering
- Full-text search across all memories
- Tag-based filtering and organization
- Priority levels with emoji indicators (🔴🟡🟢)

### 5. **Team Structure** (`/team`)
- Stuart + Sub-agents (Builder, Scanner, Research, Nightwatch, Writer)
- Role-based organization with specialties
- Activity status and task completion metrics
- Current task assignments

### 6. **Digital Office** (`/office`)
- Visual office layout with agent avatars
- Real-time workstation status indicators
- Activity animations and work area simulation
- Office furniture and environment elements

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Database**: Convex (real-time, serverless)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Theme**: Dark mode optimized
- **Icons**: Lucide React

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

Development server runs on http://localhost:3001

## 📦 Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Option 2: Manual Deployment
1. Build the app: `npm run build`
2. Deploy the `.next` folder to any static hosting
3. Configure environment variables for Convex

## ⚙ Convex Setup

The app includes a basic Convex schema and functions, but you'll need to:

1. Sign up at [convex.dev](https://convex.dev)
2. Run `npx convex dev` to connect your project
3. Configure authentication and environment variables
4. Deploy functions with `npx convex deploy`

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts` and `globals.css`
- **Components**: All UI components in `src/components/ui/`
- **Mock Data**: Replace mock data in pages with real Convex queries
- **Routes**: Add new pages in `src/app/` following Next.js App Router conventions

## 📱 Responsive Design

Fully responsive design that works on:
- Desktop (primary experience)
- Tablet (optimized layouts)
- Mobile (sidebar collapse, stacked components)

## 🔥 Key Components

- **Sidebar Navigation**: Persistent navigation with active states
- **Task Cards**: Drag-and-drop ready (future enhancement)
- **Status Indicators**: Real-time activity and health monitoring
- **Search**: Full-text search across memories and content
- **Avatar System**: Agent representation with status animations

## 📊 Data Models

Convex schema includes:
- **tasks**: Kanban task management
- **memories**: Knowledge base with search
- **positions/trades**: Trading data
- **agents**: Team member status
- **cronJobs**: Scheduled task tracking

## 🎯 Next Steps

1. **Connect Real Data**: Replace mock data with live Convex queries
2. **Authentication**: Add user auth for multi-user support
3. **Real-time Updates**: Implement live data subscriptions
4. **Drag & Drop**: Add task board interactions
5. **Charts**: Add visual charts for trading and analytics
6. **Notifications**: Real-time alerts and notifications

Built with ❤️ for Stuart's Mission Control Center