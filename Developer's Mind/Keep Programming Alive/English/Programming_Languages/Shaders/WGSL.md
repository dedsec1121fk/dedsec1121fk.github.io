# wgsl — consolidated language guide

## WGSL

**Typical use:** Graphics shader languages.

**Suggested file extension:** `.wgsl`.

**How to run / environment:** Use in a WebGPU host with a render pipeline.

### Starter example

```
@fragment
fn main() -> @location(0) vec4f {
  return vec4f(0.2, 0.5, 0.8, 1.0);
}
```

### How to read it

WebGPU shaders require host-side binding and pipeline setup.

### Common pitfall

WebGPU shaders require host-side binding and pipeline setup.

## WGSL — Expanded practice workbook

### Read the baseline source
~~~text
@fragment
fn main() -> @location(0) vec4f {
  return vec4f(0.2, 0.5, 0.8, 1.0);
}
~~~

**Relevant environment:** Use in a WebGPU host with a render pipeline.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Build a @fragment function returning @location(0) vec4f from UV input and confirm clipping/range behavior. Validate binding group declarations with the WebGPU host.

### The failure that must be understood
WGSL has explicit address spaces and validation rules; browser/device feature support may reject a pipeline even when the source appears well typed.

## WGSL — Focused mastery pathway

### Purpose and boundary
WGSL uses explicit stage attributes. Build a WebGPU pipeline where a vertex stage supplies clip-space position and an interpolated UV; a fragment stage emits a gradient with a circular mask. The WGSL file is shader source only. A JavaScript WebGPU host must create a device, pipeline and render pass to see pixels.

### Minimal paired shader (gradient.wgsl)
~~~wgsl
struct VertexOut {
    @builtin(position) clip_pos: vec4f,
    @location(0) uv: vec2f,
};

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> VertexOut {
    var positions = array<vec2f, 3>(
        vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0)
    );
    var result: VertexOut;
    let p = positions[index];
    result.clip_pos = vec4f(p, 0.0, 1.0);
    result.uv = (p + vec2f(1.0, 1.0)) * 0.5;
    return result;
}

@fragment
fn fs_main(input: VertexOut) -> @location(0) vec4f {
    let uv = clamp(input.uv, vec2f(0.0), vec2f(1.0));
    let d = distance(uv, vec2f(0.5, 0.5));
    let inside = 1.0 - smoothstep(0.23, 0.27, d);
    return vec4f(mix(vec3f(uv, 0.2), vec3f(1.0, 0.8, 0.1), inside), 1.0);
}
~~~

The oversized triangle fills the clip region when drawn with three vertices. The vertex_index must remain in [0,2]; drawing more than three vertices would index outside the array. The fragment output format must match the host pipeline target.

### Reproducible checks
1. Create a pipeline using entry points vs_main and fs_main, a compatible canvas format and draw(3). Inspect pipeline validation errors before investigating colors.
2. Deliberately change the fragment input location to 1 while leaving vertex output at 0; record the stage-interface validation failure.
3. At UV (0.5,0.5), inside is 1; at UV (0,0) it is 0. The transition covers distances 0.23 to 0.27.
4. If a device is unavailable, report navigator.gpu/device acquisition failure separately from shader source errors.
5. As an extension, add a uniform with @group(0) @binding(0) and a *matching* pipeline bind-group layout. A declared binding alone does not create the resource.

### Evidence
Save WGSL and host source, browser version, adapter/device details, exact pipeline diagnostics and a rendered screenshot. Static reading or API validation without a draw pass is not proof of visible output.
