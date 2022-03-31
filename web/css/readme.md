# Code Quality Guidelines

## General
* Use `rem` instead of `em` for scalable component spacing.
* Avoid `margin-top`. Vertical margins can collapse, yielding unexpected results. More importantly though, a single direction of margin is a simpler mental model.
* For easier scaling across device sizes, block elements should use `rem` for margins.
* Keep declarations of font-related properties to a minimum, using `inherit` whenever possible.

## Page Defaults
* The `box-sizing` is globally set on every element—including `*:before` and `*:after`, to `border-box`. This ensures that the declared width of element is never exceeded due to padding or border.
* A base `font-size: 16px` is declared on the `<html>` and font-size: 1rem on the `<body>` for easy responsive type-scaling via media queries.
* The `<body>` also sets a global `font-family` and `line-height`. This is inherited later by some form elements to prevent font inconsistencies.
* The `<body>` has a declared `background-color`, defaulting to `#fff`.