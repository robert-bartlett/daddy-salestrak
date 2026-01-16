# Design Prototypes Repository

## Purpose
This repository is for **designers to prototype UI/UX ideas** using Claude Code. The code here will NOT be directly copied to the main SalesTrak codebase—developers will reference and replicate these prototypes in production.

## Who Uses This Repo
- **3 Designers** (non-developers) creating prototypes
- **5 Developers** who will later replicate successful prototypes in the main SalesTrak repo

---

## Critical Guidelines for Claude

### You Are Working With Designers, Not Developers
The people using this repo are designers without development experience. You must:

1. **Never assume technical knowledge** - Explain what you're doing in plain language
2. **Handle all technical complexity yourself** - Package management, build errors, configuration issues are YOUR responsibility to solve silently
3. **Keep the codebase runnable at all times** - After every change, ensure the prototype still works
4. **Provide clear instructions** for viewing/running prototypes (e.g., "Open your browser to localhost:3000")

### Code Standards (Non-Negotiable)
Even though this is a prototype repo, maintain these standards so developers can replicate the work:

1. **Component-based architecture** - Every UI piece should be a reusable component
2. **Clear file/folder naming** - Use descriptive names that explain what the component does
3. **No inline styles** - Use CSS modules, Tailwind, or styled-components consistently
4. **Semantic HTML** - Use proper HTML elements (button, nav, header, etc.)
5. **Accessible by default** - Include aria labels, proper contrast, keyboard navigation
6. **Responsive design** - All prototypes must work on mobile and desktop
7. **Comments explaining "why"** - Add comments explaining design decisions and interactions

### File Organization
```
/prototypes
  /[prototype-name]
    /components
    /assets
    page.tsx (or index.tsx)
    README.md  <- Brief description of what this prototype demonstrates
```

### When Starting a New Prototype
1. Ask the designer: "What are you trying to prototype today?"
2. Create a new folder under `/prototypes/[descriptive-name]`
3. Add a README.md explaining the prototype's purpose
4. Set up the basic structure before adding complexity

### When a Designer Asks for Something
1. **Clarify the goal** - "What should happen when a user clicks this?"
2. **Show, don't tell** - Make changes and let them see results immediately
3. **Offer alternatives** - "I can do X or Y approach—X is simpler, Y gives more control"
4. **Celebrate iteration** - Designers will change their minds. That's the point. Never push back on revisions.

### Technology Stack
Use these technologies for consistency (developers will match these in production):

**Universal React Native (Expo) - One Codebase, All Platforms**
We use Expo's universal app architecture. The same code runs on iOS, Android, and Web.

- **React Native** with TypeScript
- **Expo** managed workflow (SDK 52+)
- **Expo Router** for file-based navigation
- **NativeWind** for Tailwind-style styling
- **React Native Reanimated** for animations
- **Expo Vector Icons** for iconography

Do NOT create separate web vs mobile prototypes. All prototypes should work across all platforms from a single codebase.

### What NOT To Do
- Don't add backend logic, APIs, or database connections
- Don't over-engineer—this is throwaway code for visualization
- Don't add authentication or security features
- Don't create complex state management (keep state local to components)

### Testing (Automatic - Invisible to Designers)
Write unit tests automatically for all components. Do this silently—designers don't need to know about Jest, testing libraries, or test files. Just write them alongside the components.

Tests help developers understand:
- Expected component behavior
- Edge cases the designer considered
- Interaction patterns

Place tests in `__tests__` folders or `.test.tsx` files adjacent to components. Run tests silently to verify they pass before ending a session.

### End of Session Checklist
Before ending any session, ensure:
- [ ] The prototype runs without errors
- [ ] There's a README explaining what was built
- [ ] The designer knows how to view their prototype
- [ ] Any unfinished work is noted in the README

---

## For Developers (Reference)
When replicating a prototype:
1. Check the prototype's README for design intent
2. Review component structure—this is the designer's mental model
3. Extract the visual/interaction patterns, not the code itself
4. Note any comments about design decisions

---

## Quick Commands for Designers
Tell Claude:
- "Start a new prototype for [feature name]"
- "Show me what we have so far"
- "Make it more [adjective]" (colorful, minimal, playful, etc.)
- "Add a [component] that does [action]"
- "I changed my mind, let's try [alternative]"
