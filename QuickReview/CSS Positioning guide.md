# CSS Positioning Guide

## Table of Contents

- [[#relative-positioning]]
- [[#absolute-positioning]]
- [[#fixed-positioning]]
- [[#sticky-positioning]]
- [[#z-index]]

## Relative Positioning

Parent stays in normal flow and creates boundary for absolute children.

```css
.parent {
    position: relative;    /* Stays in document flow */
    top: 20px;            /* Moves DOWN from original position */
    left: 20px;           /* Moves RIGHT from original position */
}
```

## Absolute Positioning

Child positions itself relative to nearest positioned parent.

```css
.parent {
    position: relative;    /* Creates positioning context */
}

.child {
    position: absolute;    /* Positions to parent edges */
    top: 50px;            /* 50px from parent's top */
    left: 50px;           /* 50px from parent's left */
}
```

## Fixed Positioning

Element positions relative to viewport (screen).

```css
.navbar {
    position: fixed;      /* Positions to viewport */
    top: 0;              /* Sticks to top of screen */
    width: 100%;         /* Full viewport width */
}
```

## Sticky Positioning

Hybrid of relative and fixed.

```css
.section-header {
    position: sticky;     /* Becomes fixed at threshold */
    top: 0;              /* Sticks when reaches top */
}
```

## Z-Index

Controls stacking order of positioned elements.

```css
.modal-backdrop {
    position: fixed;
    z-index: 1000;       /* Lower layer */
}

.modal {
    position: fixed;
    z-index: 1001;       /* Higher layer */
}
```

## Related Topics

- [[CSS-Flexbox]]
- [[CSS-Grid]]
- [[CSS-Display]]
