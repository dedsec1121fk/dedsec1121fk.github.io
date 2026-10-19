# hlsl — consolidated language guide

## HLSL

### Operational idea
HLSL describes shader programs for the DirectX ecosystem, with stages, semantics and GPU-specific resource rules.

### Source or deliberately marked concept
```text
float4 solid() : SV_Target {
  return float4(1, 0, 0, 1);
}
```

### Apply it to one controlled task
Inspect why SV_Target denotes pixel output and test a color change in an authorized local shader sample.

### Check the important boundary
A function alone is not a complete rendering pipeline: entry point, shader model, binding and target stage must match.

Work with disposable data in a genuine implementation of HLSL where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## HLSL — Expanded practice workbook

### Read the baseline source
~~~text
float4 main() : SV_Target { return float4(0.2, 0.5, 0.8, 1.0); }
~~~

**Relevant environment:** Compile as an HLSL pixel shader in an appropriate engine.. Verify that the matching compiler, host or simulator is available before treating output as authoritative. For scripts that can interact with personal files or systems, use a scratch workspace and read-only fixtures by default.

### Detailed working objective
Write a pixel shader returning float4 color from interpolated texture coordinates. Compare SV_Position and TEXCOORD semantics and inspect an out-of-range UV.

### The failure that must be understood
Shader model, matrix layout and resource register bindings depend on Direct3D pipeline settings. A compile success does not ensure the host bound resources.

## HLSL — Focused mastery pathway

### Goal
Write a Direct3D pixel shader that maps interpolated UV coordinates to a grayscale gradient. Identify what the vertex stage provides, what SV_Target0 returns, and why shader compilation alone cannot confirm a correct resource binding. This sample needs a Direct3D host and a compatible HLSL compiler; it is not a standalone desktop application.

### Pixel shader (Grayscale.hlsl)
~~~hlsl
struct PixelInput {
    float4 position : SV_POSITION;
    float2 uv       : TEXCOORD0;
};

float4 main(PixelInput input) : SV_Target0 {
    float2 uv = saturate(input.uv);
    float3 rgb = float3(uv.x, uv.y, 0.25);
    float gray = dot(rgb, float3(0.2126, 0.7152, 0.0722));
    return float4(gray, gray, gray, 1.0);
}
~~~

The coefficients approximate linear-light luminance. If a host samples an sRGB texture, decoding and output conversion must be handled consistently: this arithmetic is **not** automatically a correct photographic grayscale filter. SV_POSITION holds rasterization-position data; TEXCOORD0 carries the UV pair interpolated from vertex output. A matching vertex shader and input layout are required.

### Controlled experiments
1. For UV (0,0), expected gray is 0.01805. At (1,1), expected gray is 0.94585; the constant blue channel contributes in both cases.
2. For UV (-1,2), saturate clamps the vector to (0,1), so expected gray is 0.73325.
3. Replace TEXCOORD0 with TEXCOORD1 in the pixel input but not the vertex output. Capture the pipeline interface diagnostic.
4. Change SV_Target0 to an invalid semantic for the selected stage. A compile error differs from a valid shader with a missing render target.
5. Add a texture next: explicitly bind Texture2D and SamplerState to matching slots and verify the host supplies them.

### Validation and portability
On a system with the DirectX Shader Compiler, compile for a chosen target such as ps_6_0 and entry main; log the compiler version, command and errors. Then verify an actual Direct3D render and color-space configuration. HLSL support and toolchain availability on Android/Termux cannot be inferred from the Windows pipeline. Do not claim a GPU test unless the host executed it.
