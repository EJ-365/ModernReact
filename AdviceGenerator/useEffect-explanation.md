# Understanding useEffect - Simple Explanation

## What is useEffect?

Think of `useEffect` as a way to say: **"Do something AFTER React finishes rendering the component"**

It's like a side effect - something that happens as a result of rendering, but isn't part of the rendering itself.

---

## The Basic Structure

```jsx
useEffect(() => {
  // Code that runs AFTER render
}, [dependencies]); // Optional: when to run
```

---

## Three Main Patterns

### 1. Run ONCE (on mount)
```jsx
useEffect(() => {
  console.log("This runs only once when component first appears");
}, []); // Empty array = run once
```

**When it runs:**
- ✅ When component first appears on screen
- ❌ Never again (unless component is removed and re-added)

**Use for:**
- Fetching initial data
- Setting up subscriptions
- One-time setup tasks

---

### 2. Run EVERY TIME
```jsx
useEffect(() => {
  console.log("This runs after EVERY render");
}); // No array = run every time
```

**When it runs:**
- ✅ After every single render
- ✅ When state changes
- ✅ When props change
- ✅ When parent re-renders

**Use for:**
- Logging/debugging
- Rare cases where you need to sync on every render

---

### 3. Run when DEPENDENCIES change
```jsx
useEffect(() => {
  console.log("This runs when 'count' changes");
}, [count]); // Array with values = run when those values change
```

**When it runs:**
- ✅ When component first mounts
- ✅ When `count` changes
- ❌ When other things change (but count stays same)

**Use for:**
- Reacting to specific state/prop changes
- Syncing with external systems
- Most common pattern!

---

## Real-World Examples

### Example 1: Fetching Data on Mount
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data when component mounts
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []); // Run once on mount

  return <div>{user?.name}</div>;
}
```

### Example 2: Updating When Prop Changes
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data when userId prop changes
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Run when userId changes

  return <div>{user?.name}</div>;
}
```

### Example 3: Timer with Cleanup
```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Cleanup: runs when component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []); // Run once, cleanup on unmount

  return <div>{seconds} seconds</div>;
}
```

### Example 4: Updating Document Title
```jsx
function Page({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]); // Update title when 'title' prop changes

  return <h1>{title}</h1>;
}
```

---

## Cleanup Function

Sometimes you need to "clean up" when the effect is done:

```jsx
useEffect(() => {
  // Setup
  const subscription = subscribe();
  const timer = setInterval(() => {}, 1000);

  // Cleanup function
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);
```

**Cleanup runs:**
- When component unmounts
- Before the effect runs again (if dependencies changed)

---

## Common Mistakes

### ❌ Wrong: Missing dependencies
```jsx
useEffect(() => {
  console.log(count); // Uses 'count'
}, []); // But doesn't list it in dependencies!
```

### ✅ Correct: Include all dependencies
```jsx
useEffect(() => {
  console.log(count);
}, [count]); // List 'count' in dependencies
```

### ❌ Wrong: Making useEffect callback async
```jsx
useEffect(async () => { // ❌ Can't do this!
  const data = await fetch();
}, []);
```

### ✅ Correct: Define async function inside
```jsx
useEffect(() => {
  async function fetchData() {
    const data = await fetch();
  }
  fetchData();
}, []);
```

---

## Visual Timeline

```
Component renders
    ↓
React updates DOM
    ↓
useEffect runs ← YOU ARE HERE
    ↓
(If dependencies change, repeat)
    ↓
(If component unmounts, cleanup runs)
```

---

## Quick Reference

| Pattern | Syntax | When It Runs |
|---------|--------|--------------|
| Once | `useEffect(() => {}, [])` | On mount only |
| Always | `useEffect(() => {})` | After every render |
| When X changes | `useEffect(() => {}, [x])` | When x changes |
| With cleanup | `useEffect(() => { return () => {} }, [])` | Setup + cleanup |

---

## Key Takeaways

1. **useEffect runs AFTER render** - not during
2. **Empty array `[]`** = run once on mount
3. **No array** = run every render (usually avoid)
4. **Array with values `[count]`** = run when those values change
5. **Return a function** = cleanup (optional)
6. **Include all dependencies** you use inside the effect
