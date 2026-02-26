# Component Library - Quick Reference

## Theme-Aware Components

All new components automatically adapt to the current theme (dark/light) using `useContext(ThemeContext)`.

### Button

**Location**: `src/Components/Button.jsx`

**Usage**:
```jsx
import Button from '../Components/Button';

// Primary CTA
<Button variant="primary" size="lg" onClick={handleClick}>
  Start Timer
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Cancel
</Button>

// Ghost (minimal)
<Button variant="ghost">Help</Button>

// Danger action
<Button variant="danger" size="sm" onClick={handleDelete}>
  Delete
</Button>
```

**Props**:
- `variant`: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" (default: "primary")
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `disabled`: boolean
- `className`: string (additional Tailwind classes)
- `onClick`: function
- `children`: React node

---

### Card

**Location**: `src/Components/Card.jsx`

**Usage**:
```jsx
import Card from '../Components/Card';

// Default glass card
<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Interactive card
<Card interactive onClick={handleClick}>
  Clickable card with hover effect
</Card>

// Light theme variant
<Card variant="light">
  Content for light backgrounds
</Card>

// Solid card
<Card variant="solid" className="p-6">
  Dense information
</Card>
```

**Props**:
- `variant`: "default" | "glass" | "solid" | "light" | "light-glass" (default: "default")
- `interactive`: boolean (adds hover scale effect)
- `onClick`: function
- `className`: string
- `children`: React node

---

### Sidebar

**Location**: `src/Components/Sidebar.jsx`

**Features**:
- Auto-detects active route
- Responsive (hidden on mobile)
- Theme toggle button
- Smooth animations
- Menu items with icons

**Routes Included**:
- Dashboard
- Goals
- Courses
- Timer
- Music
- AI Chat
- Notes
- Progress
- Groups
- Settings

---

## Page Components with Redesign

### Dashboard
- Hero section with gradient text
- Quick stats cards
- 6 feature cards with animations
- CTA to timer

### Focus Timer Page
- Large animated timer
- Motivational quotes
- Quick presets
- Session history
- Side stats panel

### AI Chat Page
- Message bubbles (left/right alignment)
- Typing animation
- Suggested questions
- Features list
- Input area with send button

### Music Page
- Animated music player
- 4 preset playlists
- Now playing display
- Progress bar
- Playlist selection

### Course Vault
- Search functionality
- Course cards with progress
- Module tracking
- Learning stats
- Grid layout

---

## Styling Patterns

### Using Theme Context
```jsx
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function MyComponent() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'bg-slate-900' : 'bg-white'}>
      {isDark ? <DarkContent /> : <LightContent />}
    </div>
  );
}
```

### Using CSS Variables
```jsx
<div style={{
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  boxShadow: isDark ? 'var(--glow-soft)' : 'var(--card-shadow)',
}}>
  Content
</div>
```

### Using Tailwind Dark Mode
```jsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
  Works with both light and dark themes
</div>
```

---

## Animations with Framer Motion

### Container with Staggered Children
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Interactive Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

---

## Color System Reference

### Dark Theme
```
Primary BG:     #0a0e27
Secondary BG:   #131829
Text Primary:   #e8f0ff
Text Secondary: rgba(232, 240, 255, 0.65)

Accent Primary:   #6366f1 (Indigo)
Accent Secondary: #ec4899 (Pink)
Accent Tertiary:  #3b82f6 (Blue)
Success:          #10b981
```

### Light Theme
```
Primary BG:     #fafbf8
Secondary BG:   #ffffff
Text Primary:   #1f2937
Text Secondary: #6b7280

Accent Primary:   #16a34a (Green)
Accent Secondary: #059669 (Emerald)
Accent Tertiary:  #0d9488 (Teal)
Success:          #16a34a
```

---

## Common Patterns

### Feature Card Grid
```jsx
<motion.div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {features.map((feature, idx) => (
    <motion.div key={idx} variants={itemVariants}>
      <Card interactive className="h-full">
        {/* Content */}
      </Card>
    </motion.div>
  ))}
</motion.div>
```

### Progress Bar
```jsx
<div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
  <motion.div
    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
    animate={{ width: `${progress}%` }}
    transition={{ duration: 1 }}
  />
</div>
```

### Stats Card
```jsx
<Card variant={isDark ? 'glass' : 'light-glass'} className="p-6">
  <Icon className="w-6 h-6 mb-4" />
  <div className="text-3xl font-bold">{value}</div>
  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
    {label}
  </p>
</Card>
```

---

## Best Practices

1. **Always use ThemeContext**: Components should automatically adapt to theme
2. **Use CSS Variables**: For colors that need theme awareness
3. **Prefer Tailwind**: For layout and responsive design
4. **Animate Purposefully**: Use Framer Motion for meaningful transitions
5. **Test Both Themes**: Always verify appearance in dark and light modes
6. **Accessible Colors**: Maintain WCAG AA contrast ratios
7. **Mobile First**: Design for mobile, enhance for desktop
8. **Use Icons from Lucide**: Consistent icon system

---

## Icon Reference

The app uses **Lucide React** icons. Common imports:

```jsx
import {
  LayoutDashboard,   // Dashboard
  ListTodo,          // Goals/Tasks
  Book,              // Courses
  Timer,             // Focus Timer
  Music,             // Music Player
  MessageSquare,     // Chat
  Zap,               // Energy/Quick Action
  Clock,             // Time
  TrendingUp,        // Progress/Stats
  Plus,              // Add Action
  Search,            // Search
  Filter,            // Filter
  Send,              // Submit
  Menu,              // Mobile menu
  X,                 // Close
} from 'lucide-react';
```

Browse all icons: https://lucide.dev/

---

## Troubleshooting

**Issue**: Theme not changing
- Check `ThemeContext` is wrapping the app in `main.jsx`
- Verify `data-theme` attribute is being set
- Check localStorage for theme preference

**Issue**: Tailwind classes not applying in dark mode
- Use `dark:` prefix for dark mode overrides
- Ensure `data-theme="light"` matches the context
- Rebuild CSS if changes don't appear

**Issue**: Component not animating
- Verify Framer Motion is imported correctly
- Check `animate`, `initial`, and `variants` props
- Use React DevTools to inspect animation state

---

**Last Updated**: February 2026
