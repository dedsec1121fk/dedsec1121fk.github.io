# glsl — consolidated language guide

## GLSL

**Typical use:** Graphics shader languages.

**Suggested file extension:** `.glsl`.

**How to run / environment:** Compile as a fragment shader in a supported graphics host.

### Starter example

```
#version 330 core
out vec4 FragColor;
void main() { FragColor = vec4(0.2, 0.5, 0.8, 1.0); }
```

### How to read it

Shaders compute pixels, so no console print is available.

### Common pitfall

Shaders compute pixels, so no console print is available.

## GLSL — Expanded practice workbook

### Read the baseline source
~~~text
#version 330 core
out vec4 FragColor;
void main() { FragColor = vec4(0.2, 0.5, 0.8, 1.0); }
~~~

**Relevant environment:** Compile as a fragment shader in a supported graphics host.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Implement a fragment color gradient from normalized UV coordinates and clamp the output. Compare linear color values with sRGB display and test coordinate extremes.

### The failure that must be understood
GLSL versions and OpenGL ES precision qualifiers differ; a shader that compiles on desktop may fail on mobile GPUs.

## GLSL — Focused mastery pathway

### Objective and environment
Create one desktop OpenGL 3.3 fragment shader that draws a soft-edged circle on a UV gradient. This is GLSL 330 core, **not** a drop-in OpenGL ES shader: ES needs its own version declaration and platform-appropriate precision handling. The host must supply interpolated UV coordinates named v_uv and link a matching vertex stage.

### Fragment shader (circle.frag)
~~~glsl
#version 330 core
in vec2 v_uv;
out vec4 fragColor;
uniform float u_radius;

void main() {
    vec2 uv = clamp(v_uv, vec2(0.0), vec2(1.0));
    float distanceFromCenter = length(uv - vec2(0.5));
    float circle = 1.0 - smoothstep(
        u_radius - 0.01, u_radius + 0.01, distanceFromCenter
    );
    vec3 background = vec3(uv.x, uv.y, 0.2);
    fragColor = vec4(mix(background, vec3(1.0, 0.9, 0.2), circle), 1.0);
}
~~~

The fragment input is an interpolated varying, not a pixel position. The shader clamps UV deliberately: outside-range UVs collapse to an edge color instead of repeating. The smoothstep transition is 0.02 UV units wide; the apparent width in pixels varies with the rendered surface. This shader does not perform sRGB conversion; that belongs to the selected render target and host configuration.

### Test matrix and diagnostics
1. Set u_radius=0.25. At UV (0.5,0.5) the circle blend should be 1; at (0,0) it should be 0; at (1,1) it should be 0.
2. At UV (0.75,0.5) the boundary midpoint should blend near 0.5 because the distance equals the radius.
3. Render a non-square viewport and check whether the circle looks elliptical. If so, account for aspect ratio in the distance calculation.
4. Deliberately change v_uv to a mismatched vertex output name: inspect the link diagnostic, not only the fragment compilation.
5. Check an OpenGL ES build separately. Copying #version 330 core into an ES-only context is an environment mismatch, not an algorithm bug.

### Completion evidence
Keep the complete vertex/fragment pair, exact OpenGL context version, compile **and link** logs, screenshots for the four UV cases, and any host-side color-space settings. Without an actual GL host, this is a static shader exercise, not a confirmed GPU rendering test.

## GLSL — Technical notes and common pitfalls

### Core knowledge

1. Shader stages have different input and output contracts and execution constraints.
2. Coordinate spaces and precision choices affect numerical correctness.
3. Test inside a matching graphics pipeline rather than treating shaders as ordinary command-line scripts.
